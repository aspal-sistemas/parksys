import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  User,
  ArrowLeft,
  Share2,
  Heart
} from "lucide-react";
import { Link } from "wouter";

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  targetAudience: string;
  status: string;
  featuredImageUrl?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  recurrencePattern?: any;
  location: string;
  capacity?: number;
  registrationType: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  geolocation?: any;
  parks?: Array<{
    id: number;
    name: string;
  }>;
}

const eventTypeLabels = {
  cultural: "Cultural",
  deportivo: "Deportivo", 
  educativo: "Educativo",
  ambiental: "Ambiental",
  recreativo: "Recreativo",
  comunitario: "Comunitario",
  artistico: "Artístico",
  gastronomico: "Gastronómico"
};

const EventDetail = () => {
  const { id } = useParams();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-6"></div>
              <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !event) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
            <p className="text-gray-600 mb-6">El evento que buscas no existe o ha sido eliminado.</p>
            <Button asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a eventos
              </Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb y navegación */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild>
                <Link href="/events">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a eventos
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Imagen principal y título */}
              <Card>
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {event.featuredImageUrl ? (
                    <img 
                      src={event.featuredImageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="h-20 w-20 text-white" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h1>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || event.eventType}
                        </Badge>
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status === 'published' ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {/* Detalles del evento */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del evento</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Fecha</p>
                        <p className="text-gray-600">
                          {formatDate(event.startDate)}
                          {event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
                        </p>
                      </div>
                    </div>
                    
                    {event.startTime && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Horario</p>
                          <p className="text-gray-600">
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">Ubicación</p>
                        <p className="text-gray-600">
                          {event.parks && event.parks.length > 0 ? (
                            <span>
                              {event.parks[0].name}
                              {event.location && ` - ${event.location}`}
                            </span>
                          ) : (
                            event.location
                          )}
                        </p>
                      </div>
                    </div>

                    {event.targetAudience && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Dirigido a</p>
                          <p className="text-gray-600">{event.targetAudience}</p>
                        </div>
                      </div>
                    )}

                    {event.capacity && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">Capacidad</p>
                          <p className="text-gray-600">{event.capacity} personas</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              {/* Información del organizador */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Organizador</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{event.organizerName}</p>
                      </div>
                    </div>
                    
                    {event.organizerEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <div>
                          <a 
                            href={`mailto:${event.organizerEmail}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {event.organizerEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {event.organizerPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <div>
                          <a 
                            href={`tel:${event.organizerPhone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {event.organizerPhone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button className="w-full" size="lg">
                    Contactar organizador
                  </Button>
                </CardContent>
              </Card>

              {/* Registro */}
              {event.registrationType && event.registrationType !== 'none' && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Participación</h3>
                    
                    <p className="text-gray-600 mb-4">
                      {event.registrationType === 'required' 
                        ? 'Este evento requiere registro previo' 
                        : 'Registro opcional para este evento'
                      }
                    </p>
                    
                    <Button className="w-full" size="lg" style={{backgroundColor: '#19633c'}}>
                      Registrarse al evento
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Información adicional */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Información adicional</h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    {event.isRecurring && (
                      <p>Este es un evento recurrente</p>
                    )}
                    
                    <p>Evento creado por el sistema de gestión de parques de Guadalajara</p>
                    
                    <div className="pt-3">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/events">Ver más eventos</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EventDetail;