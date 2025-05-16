import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { ExtendedPark } from '@shared/schema';
import { 
  ChevronLeft, 
  Loader, 
  MapPin, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Share2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import AmenityIcon from '@/components/ui/amenity-icon';

const ParkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  // Fetch park details
  const { data: park, isLoading, error } = useQuery<ExtendedPark>({
    queryKey: [`/api/parks/${id}`],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Cargando información del parque...</p>
        </div>
      </div>
    );
  }
  
  if (error || !park) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No se pudo cargar el parque</h2>
          <p className="text-gray-500 mb-6">Lo sentimos, no pudimos encontrar la información solicitada.</p>
          <Button onClick={() => setLocation('/parks')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a la lista de parques
          </Button>
        </div>
      </div>
    );
  }
  
  // Get park type display name
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
  
  // Format dates for activities
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy • h:mm a", { locale: es });
  };
  
  // Get images
  const mainImage = park.primaryImage || (park.images && park.images.length > 0 ? park.images[0].imageUrl : '');
  const additionalImages = park.images?.filter(img => !img.isPrimary).map(img => img.imageUrl) || [];
  
  return (
    <div className="bg-white min-h-screen">
      {/* Back button */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation('/parks')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a la lista
        </Button>
        
        {/* Park header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading">{park.name}</h1>
            <p className="text-gray-600">
              {park.municipality?.name || ''}, {park.municipality?.state || ''}
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <Badge className="bg-primary-100 text-primary-800 font-medium">
              {getParkTypeLabel(park.parkType)}
            </Badge>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Hero image */}
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={mainImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Sin+Imagen'} 
                alt={park.name} 
                className="w-full h-80 object-cover"
              />
            </div>
            
            {/* Image gallery */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-6">
                {additionalImages.slice(0, 5).map((imageUrl, idx) => (
                  <img 
                    key={idx}
                    src={imageUrl} 
                    alt={`Vista del parque ${idx + 1}`} 
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
            
            {/* Tabs */}
            <Tabs defaultValue="info" className="mt-6">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="amenities">Amenidades</TabsTrigger>
                <TabsTrigger value="activities">Actividades</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                {park.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                    <p className="text-gray-700">{park.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Información general</h2>
                    <div className="space-y-2">
                      {park.area && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Superficie:</span>
                          <span className="font-medium">{park.area}</span>
                        </div>
                      )}
                      
                      {park.foundationYear && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Año de fundación:</span>
                          <span className="font-medium">{park.foundationYear}</span>
                        </div>
                      )}
                      
                      {park.openingHours && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Horario:</span>
                          <span className="font-medium">{park.openingHours}</span>
                        </div>
                      )}
                      
                      {park.conservationStatus && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Estado de conservación:</span>
                          <span className="font-medium">{park.conservationStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
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
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="mt-4">
                {park.amenities && park.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {park.amenities.map(amenity => (
                      <div 
                        key={amenity.id} 
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mr-3">
                          <AmenityIcon name={amenity.icon} />
                        </div>
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No hay amenidades registradas para este parque.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activities" className="mt-4">
                {park.activities && park.activities.length > 0 ? (
                  <div className="space-y-4">
                    {park.activities.map(activity => (
                      <div 
                        key={activity.id} 
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          {activity.category && (
                            <Badge className="bg-secondary-100 text-secondary-800">
                              {activity.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(activity.startDate)}
                        </p>
                        <p className="text-gray-700">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No hay actividades programadas actualmente.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                {park.documents && park.documents.length > 0 ? (
                  <div className="space-y-3">
                    {park.documents.map(document => (
                      <a 
                        key={document.id}
                        href={document.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className={`h-10 w-10 mr-4 ${
                          document.fileType?.includes('pdf') ? 'text-red-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-medium">{document.title}</h3>
                          {document.fileSize && (
                            <p className="text-sm text-gray-500">{document.fileSize}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          Descargar
                        </Button>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No hay documentos disponibles para este parque.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - sidebar */}
          <div className="lg:col-span-1">
            {/* Map card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="h-48">
                <iframe
                  title={`Mapa de ${park.name}`}
                  className="w-full h-full"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY || ''}&q=${park.latitude},${park.longitude}`}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">Ubicación</h3>
                <p className="text-gray-600 text-sm mb-3">{park.address}</p>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Cómo llegar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-4">Acciones rápidas</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver próximas actividades
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar reglamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Dejar un comentario
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Report issues */}
            <div className="bg-primary-50 border border-primary-100 rounded-lg overflow-hidden mb-6">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">¿Encontraste un problema?</h3>
                <p className="text-gray-600 text-sm mb-4">Ayúdanos a mejorar reportando incidentes o problemas en el parque.</p>
                <Button className="w-full" variant="default">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reportar un incidente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkDetail;
