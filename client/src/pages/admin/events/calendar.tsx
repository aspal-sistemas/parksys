import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Plus, MapPin, Clock, Users } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  park_id: number;
  park_name?: string;
  category: string;
  capacity?: number;
  location?: string;
  status: string;
}

export default function EventsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/activities', {
      start_date: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(currentDate), 'yyyy-MM-dd')
    }]
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return isSameDay(eventDate, day);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programado': return 'bg-blue-100 text-blue-800';
      case 'en_curso': return 'bg-green-100 text-green-800';
      case 'completado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando calendario de eventos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Eventos</h1>
            <p className="text-gray-600">Vista mensual de todos los eventos programados</p>
          </div>
          
          <Link href="/admin/events/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          min-h-[100px] p-2 border rounded-lg transition-colors
                          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                          ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                          hover:bg-gray-50
                        `}
                      >
                        <div className={`
                          text-sm font-medium mb-1
                          ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${isToday ? 'text-blue-600' : ''}
                        `}>
                          {format(day, 'd')}
                        </div>
                        
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 truncate"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con próximos eventos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="mb-4 p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start_date), 'PPP', { locale: es })}
                      </div>
                      
                      {event.park_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.park_name}
                        </div>
                      )}
                      
                      {event.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.capacity} personas
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No hay eventos programados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leyenda de estados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estados de Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-xs">Programado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-xs">En Curso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  <span className="text-xs">Completado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-xs">Cancelado</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}