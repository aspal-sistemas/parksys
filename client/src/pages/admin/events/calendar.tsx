import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

// Tipos para eventos
interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  participants?: number;
  parkId?: number;
}

const EventsCalendar: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Consulta de eventos
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }
      return response.json();
    },
  });

  // Configuración del calendario
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener días del mes
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // Generar días del calendario
  const calendarDays = [];
  const currentCalendarDate = new Date(startDate);
  
  while (currentCalendarDate <= endDate) {
    calendarDays.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  // Filtrar eventos por fecha
  const getEventsForDate = (date: Date) => {
    return events.filter((event: Event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Colores de estado
  const statusColors = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    cancelled: 'bg-red-500',
    completed: 'bg-blue-500'
  };

  const statusLabels = {
    draft: 'Borrador',
    published: 'Publicado',
    cancelled: 'Cancelado',
    completed: 'Completado'
  };

  // Navegación del calendario
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Nombres de meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (isLoading) {
    return (
      <AdminLayout title="Calendario de Eventos" subtitle="Vista de calendario para gestión de eventos">
        <div className="p-6">
          <div className="text-center">Cargando calendario...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Calendario de Eventos" subtitle="Vista de calendario para gestión de eventos">
      <div className="p-6 space-y-6">
        {/* Controles del calendario */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button onClick={() => setLocation('/admin/events/new')}>
                  Nuevo Evento
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Grid del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {/* Encabezados de días */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm text-gray-500 border-b">
                  {day}
                </div>
              ))}
              
              {/* Días del calendario */}
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-1 border border-gray-200 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Eventos del día */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event: Event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: statusColors[event.status] + '20' }}
                          onClick={() => setLocation(`/admin/events/${event.id}`)}
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span className="truncate">
                              {new Date(event.startDate).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Indicador de más eventos */}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leyenda de estados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estados de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eventos próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events
                .filter((event: Event) => new Date(event.startDate) >= today)
                .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 5)
                .map((event: Event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/admin/events/${event.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.startDate).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.startDate).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColors[event.status]}>
                      {statusLabels[event.status]}
                    </Badge>
                  </div>
                ))}
              
              {events.filter((event: Event) => new Date(event.startDate) >= today).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No hay eventos próximos programados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EventsCalendar;