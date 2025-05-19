import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { ExtendedPark } from '@shared/schema';
import { 
  ChevronLeft, 
  Loader, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParkImageManager } from '@/components/ParkImageManager';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IncidentReportForm } from '@/components/IncidentReportForm';
import AmenityIcon from '@/components/AmenityIcon';
import ParkQuickActions from '@/components/ParkQuickActions';

const ParkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Fetch park details
  const { data: park, isLoading, error } = useQuery<ExtendedPark>({
    queryKey: [`/api/parks/${id}`],
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="mt-2">Cargando información del parque...</p>
      </div>
    );
  }
  
  if (error || !park) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2">Error al cargar la información del parque. Por favor, intenta nuevamente.</p>
        <Button 
          className="mt-4" 
          variant="outline"
          onClick={() => setLocation('/')}
        >
          Volver a inicio
        </Button>
      </div>
    );
  }
  
  const getParkTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'metropolitano': 'Metropolitano',
      'barrial': 'Barrial',
      'vecinal': 'Vecinal',
      'lineal': 'Lineal',
      'ecologico': 'Ecológico',
      'botanico': 'Botánico',
      'deportivo': 'Deportivo'
    };
    return typeMap[type] || type;
  };
  
  // Format dates
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy • h:mm a", { locale: es });
  };
  
  // Get images
  const mainImage = park.primaryImage || (park.images && park.images.length > 0 ? park.images[0].imageUrl : '');
  const additionalImages = park.images?.filter(img => !img.isPrimary).map(img => img.imageUrl) || [];

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 text-gray-600"
            onClick={() => setLocation('/parks')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a parques
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{park.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{park.address}</span>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
                <TabsTrigger value="amenities">Servicios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                {park.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                    <p className="text-gray-700 whitespace-pre-line">{park.description}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Información general</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">{getParkTypeLabel(park.parkType)}</span>
                        </div>
                        
                        {park.area && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Superficie:</span>
                            <span className="font-medium">{park.area} m²</span>
                          </div>
                        )}
                        
                        {park.openingHours && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Horario:</span>
                            <span className="font-medium">{park.openingHours}</span>
                          </div>
                        )}
                        
                        {park.foundationYear && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Año de fundación:</span>
                            <span className="font-medium">{park.foundationYear}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {park.conservationStatus && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Estado de conservación:</span>
                            <span className="font-medium">{park.conservationStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Contacto</h2>
                  <div className="space-y-2">
                    {park.administrator && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Administrador:</span>
                        <span className="font-medium">{park.administrator}</span>
                      </div>
                    )}
                    
                    {park.contactPhone && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium">{park.contactPhone}</span>
                      </div>
                    )}
                    
                    {park.contactEmail && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{park.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="images">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Imágenes</h2>
                  <ParkImageManager 
                    mainImage={mainImage}
                    additionalImages={additionalImages}
                    readOnly={true}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="amenities">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Servicios y comodidades</h2>
                  
                  {park.amenities && park.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {park.amenities.map(amenity => (
                        <div key={amenity.id} className="flex items-center p-3 border rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center">
                            <AmenityIcon 
                              name={amenity.icon || ''} 
                              customUrl={amenity.customIconUrl || ''} 
                              className="w-6 h-6 text-primary"
                            />
                          </div>
                          <span>{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay servicios registrados para este parque.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            {/* Quick actions */}
            <ParkQuickActions 
              parkId={Number(id)}
              parkName={park.name}
              videoUrl={park.videoUrl}
              regulationUrl={park.regulationUrl}
              activities={park.activities}
            />
            
            {/* Report issues */}
            <div className="bg-primary-50 border border-primary-100 rounded-lg overflow-hidden mb-6">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">¿Encontraste un problema?</h3>
                <p className="text-gray-600 text-sm mb-4">Ayúdanos a mejorar reportando incidentes o problemas en el parque.</p>
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => setIsReportDialogOpen(true)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reportar un problema
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diálogo para reportar incidentes */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar un problema en {park.name}</DialogTitle>
          </DialogHeader>
          <IncidentReportForm 
            parkId={Number(id)} 
            onSuccess={() => setIsReportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkDetail;