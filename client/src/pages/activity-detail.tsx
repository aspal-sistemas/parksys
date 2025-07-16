import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityData {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryName?: string;
  categoryId?: number;
  parkId: number;
  parkName: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: number;
  instructorId?: number;
  instructorName?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  materials?: string;
  requirements?: string;
  isFree?: boolean;
  isRecurring?: boolean;
  recurringDays?: string[];
  targetMarket?: string[];
  specialNeeds?: string[];
}

interface ActivityImage {
  id: number;
  activityId: number;
  imageUrl: string;
  isPrimary: boolean;
  caption?: string;
  fileSize?: number;
}
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Star,
  User,
  Activity,
  Tag,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdSpace from '@/components/AdSpace';

function ActivityDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const activityId = params.id;

  const { data: activity, isLoading, error } = useQuery<ActivityData>({
    queryKey: [`/api/activities/${activityId}`],
    enabled: !!activityId,
  });

  const { data: images = [] } = useQuery<ActivityImage[]>({
    queryKey: [`/api/activities/${activityId}/images`],
    enabled: !!activityId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la actividad...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Actividad no encontrada</h1>
          <p className="text-gray-600 mb-6">La actividad que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => setLocation('/activities')} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a actividades
          </Button>
        </div>
      </div>
    );
  }

  const startDate = activity?.startDate ? new Date(activity.startDate) : new Date();
  const endDate = activity?.endDate ? new Date(activity.endDate) : null;
  const isMultiDay = endDate && endDate.getTime() !== startDate.getTime();
  const primaryImage = images?.find((img: ActivityImage) => img.isPrimary) || images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/activities')}
              className="hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Detalle de Actividad</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen principal */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                {primaryImage ? (
                  <img
                    src={primaryImage.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="h-16 w-16 text-green-600/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{activity?.title}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{activity?.parkName}</span>
                    </div>
                    {activity?.categoryName && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <Tag className="h-3 w-3 mr-1" />
                        {activity.categoryName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Descripción */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {activity?.description || 'No hay descripción disponible para esta actividad.'}
                </p>
              </CardContent>
            </Card>

            {/* Galería de imágenes adicionales */}
            {images && images.length > 1 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Más imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.slice(0, 8).map((image: ActivityImage, index: number) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información de la actividad */}
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fecha y Horario */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Fecha y Horario</p>
                    <p className="text-sm text-gray-600">
                      {isMultiDay 
                        ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
                        : format(startDate, 'dd MMM yyyy', { locale: es })
                      }
                    </p>
                  </div>
                </div>

                {/* Hora de Inicio y Finalización */}
                {(activity?.startTime || activity?.endTime) && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Hora de Inicio y Finalización</p>
                      <p className="text-sm text-gray-600">
                        {activity?.startTime && `Inicio: ${activity.startTime}`}
                        {activity?.startTime && activity?.endTime && ' • '}
                        {activity?.endTime && `Fin: ${activity.endTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duración */}
                {activity?.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-sm text-gray-600">{activity.duration} minutos</p>
                    </div>
                  </div>
                )}

                {/* Recurrencia */}
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium">Recurrencia</p>
                    <p className="text-sm text-gray-600">
                      {activity?.isRecurring ? (
                        activity?.recurringDays && activity.recurringDays.length > 0 
                          ? `Recurrente: ${activity.recurringDays.join(', ')}`
                          : 'Actividad recurrente'
                      ) : (
                        'Actividad única'
                      )}
                    </p>
                  </div>
                </div>

                {/* Capacidad */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-sm text-gray-600">
                      {activity?.capacity ? `${activity.capacity} personas` : 'Sin límite de capacidad'}
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Precio</p>
                    <p className="text-sm text-gray-600">
                      {activity?.isFree || !activity?.price || activity.price === 0 
                        ? 'Gratuita' 
                        : `$${activity.price} MXN`
                      }
                    </p>
                  </div>
                </div>

                {/* Público (Segmentación) */}
                {activity?.targetMarket && activity.targetMarket.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Público</p>
                      <p className="text-sm text-gray-600">
                        {activity.targetMarket.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {activity?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-gray-600">{activity.location}</p>
                    </div>
                  </div>
                )}

                {/* Datos del Instructor */}
                {activity?.instructorName && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Datos del Instructor</p>
                      <p className="text-sm text-gray-600">{activity.instructorName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Espacio Publicitario */}
            <AdSpace 
              spaceId="11" 
              position="sidebar" 
              pageType="activity-detail" 
            />

            {/* Información adicional */}
            {(activity?.requirements || activity?.materials || (activity?.specialNeeds && activity.specialNeeds.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activity?.requirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                      <p className="text-sm text-gray-600">{activity.requirements}</p>
                    </div>
                  )}
                  {activity?.materials && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Materiales</h4>
                      <p className="text-sm text-gray-600">{activity.materials}</p>
                    </div>
                  )}
                  {activity?.specialNeeds && activity.specialNeeds.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requerimientos Especiales</h4>
                      <div className="space-y-1">
                        {activity.specialNeeds.map((need, index) => (
                          <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {need}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Botón de contacto */}
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Contactar para más información
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Te ayudaremos con cualquier pregunta sobre esta actividad
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetailPage;