import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Camera, 
  MapPin, 
  Share2, 
  Download, 
  FileText, 
  AlertCircle,
  MessageSquare,
  X
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExtendedPark } from '@shared/schema';
import AmenityIcon from '@/components/ui/amenity-icon';
import { formatScheduleForDisplay, getScheduleStatus } from '@/lib/schedule-utils';

interface ParkDetailProps {
  park: ExtendedPark;
  isOpen: boolean;
  onClose: () => void;
}

const ParkDetail: React.FC<ParkDetailProps> = ({ 
  park, 
  isOpen, 
  onClose 
}) => {
  // Get remaining images (non-primary)
  const mainImage = park.primaryImage || (park.images && park.images.length > 0 ? park.images[0].imageUrl : '');
  const additionalImages = park.images?.filter(img => !img.isPrimary).map(img => img.imageUrl) || [];
  
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-heading font-semibold text-2xl text-gray-900">
              {park.name}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="p-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="activities">Actividades</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {/* Park hero image */}
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={mainImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Sin+Imagen'} 
                        alt={park.name} 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Image gallery */}
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {additionalImages.slice(0, 3).map((imageUrl, idx) => (
                          <img 
                            key={idx}
                            src={imageUrl} 
                            alt={`Vista del parque ${idx + 1}`} 
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                        
                        {additionalImages.length > 3 && (
                          <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-sm font-medium hover:bg-gray-200 cursor-pointer">
                            +{additionalImages.length - 3} fotos
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Basic info */}
                    <div className="mt-6">
                      <h3 className="font-medium text-lg text-gray-900 mb-3">Información general</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Tipo</p>
                          <p className="font-medium">{getParkTypeLabel(park.parkType)}</p>
                        </div>
                        
                        {park.area && (
                          <div>
                            <p className="text-gray-500">Superficie</p>
                            <p className="font-medium">{park.area}</p>
                          </div>
                        )}
                        
                        {park.foundationYear && (
                          <div>
                            <p className="text-gray-500">Año de fundación</p>
                            <p className="font-medium">{park.foundationYear}</p>
                          </div>
                        )}
                        
                        {park.openingHours && (
                          <div>
                            <p className="text-gray-500">Horario</p>
                            <p className="font-medium">{formatScheduleForDisplay(park.openingHours)}</p>
                            {/* Status badge */}
                            <div className="mt-1">
                              {(() => {
                                const status = getScheduleStatus(park.openingHours);
                                return (
                                  <Badge className={`text-xs ${status.colorClass}`}>
                                    {status.text}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Contact info */}
                    {(park.administrator || park.contactEmail || park.contactPhone) && (
                      <div className="mt-6">
                        <h3 className="font-medium text-lg text-gray-900 mb-3">Contacto</h3>
                        <div className="text-sm space-y-2">
                          {park.administrator && (
                            <p><span className="text-gray-500">Administrador:</span> <span className="font-medium">{park.administrator}</span></p>
                          )}
                          
                          {park.contactPhone && (
                            <p><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{park.contactPhone}</span></p>
                          )}
                          
                          {park.contactEmail && (
                            <p><span className="text-gray-500">Email:</span> <span className="font-medium">{park.contactEmail}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {/* Map */}
                    <div className="rounded-lg overflow-hidden h-64 bg-gray-200">
                      <iframe
                        title={`Mapa de ${park.name}`}
                        className="w-full h-full"
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${park.latitude},${park.longitude}`}
                        allowFullScreen
                      ></iframe>
                    </div>
                    
                    {/* Location info */}
                    <div className="mt-4">
                      <h3 className="font-medium text-lg text-gray-900 mb-2">Ubicación</h3>
                      <p className="text-sm text-gray-600">{park.address}</p>
                      
                      <div className="mt-3 flex space-x-2">
                        <Button variant="outline" size="sm" className="text-secondary-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          Cómo llegar
                        </Button>
                        <Button variant="outline" size="sm" className="text-secondary-600">
                          <Share2 className="h-4 w-4 mr-1" />
                          Compartir
                        </Button>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    {park.amenities && park.amenities.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium text-lg text-gray-900 mb-3">Amenidades</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {park.amenities.map(amenity => (
                            <div key={amenity.id} className="flex items-center">
                              <div className="text-primary-500 mr-2">
                                <AmenityIcon 
                                  name={amenity.icon || ''} 
                                  customIconUrl={amenity.customIconUrl || null} 
                                  iconType={amenity.icon === 'custom' ? 'custom' : 'system'}
                                  size={36}
                                />
                              </div>
                              <span>{amenity.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    {park.description && (
                      <div className="mt-6">
                        <h3 className="font-medium text-lg text-gray-900 mb-2">Descripción</h3>
                        <p className="text-sm text-gray-700">{park.description}</p>
                      </div>
                    )}
                    
                    {/* Citizen reports */}
                    <div className="mt-6">
                      <h3 className="font-medium text-lg text-gray-900 mb-3">Reportes ciudadanos</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm">¿Encontraste algún problema en este parque?</p>
                        <Button className="mt-2" variant="secondary">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reportar incidente
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activities">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-gray-900 mb-2">Próximas actividades</h3>
                  
                  {park.activities && park.activities.length > 0 ? (
                    <div className="space-y-3">
                      {park.activities.map(activity => (
                        <div key={activity.id} className="border border-gray-200 rounded-md p-3">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            {activity.category && (
                              <Badge variant="outline" className="text-xs bg-secondary-100 text-secondary-800">
                                {activity.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(activity.startDate)}
                          </p>
                          <p className="text-xs mt-2">{activity.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No hay actividades programadas actualmente</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-gray-900 mb-2">Documentos</h3>
                  
                  {park.documents && park.documents.length > 0 ? (
                    <div className="space-y-2">
                      {park.documents.map(document => (
                        <a 
                          key={document.id}
                          href={document.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <FileText className={`h-6 w-6 mr-2 ${
                            document.fileType?.includes('pdf') ? 'text-red-500' : 'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{document.title}</p>
                            {document.fileSize && (
                              <p className="text-xs text-gray-500">{document.fileSize}</p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No hay documentos disponibles</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-between w-full">
            <Button variant="outline" className="text-gray-700 hover:text-gray-900">
              <MessageSquare className="h-4 w-4 mr-1" />
              Dejar comentario
            </Button>
            <div>
              <DialogClose asChild>
                <Button>Cerrar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParkDetail;
