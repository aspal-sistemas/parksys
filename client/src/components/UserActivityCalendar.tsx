import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Eye,
  Users,
  CalendarPlus,
  CalendarCheck,
  Filter
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  parkId: number;
  parkName?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  price?: number;
  isRecurring?: boolean;
}

interface UserActivityCalendarProps {
  userId: number;
}

const UserActivityCalendar: React.FC<UserActivityCalendarProps> = ({ userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  // Obtener todas las actividades disponibles
  const { data: allActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Obtener actividades guardadas por el usuario
  const { data: userActivities = [], isLoading: userActivitiesLoading } = useQuery({
    queryKey: [`/api/users/${userId}/calendar-activities`],
    enabled: !!userId,
  });

  // Obtener parques para mostrar nombres
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Mutación para agregar actividad al calendario del usuario
  const addToCalendarMutation = useMutation({
    mutationFn: async (activityId: number) => {
      return apiRequest(`/api/users/${userId}/calendar-activities`, {
        method: 'POST',
        data: { activityId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/calendar-activities`] });
      toast({
        title: "Actividad agregada",
        description: "La actividad se ha agregado a tu calendario personal.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la actividad al calendario.",
        variant: "destructive",
      });
    }
  });

  // Mutación para remover actividad del calendario del usuario
  const removeFromCalendarMutation = useMutation({
    mutationFn: async (activityId: number) => {
      return apiRequest(`/api/users/${userId}/calendar-activities/${activityId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/calendar-activities`] });
      toast({
        title: "Actividad removida",
        description: "La actividad se ha removido de tu calendario personal.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo remover la actividad del calendario.",
        variant: "destructive",
      });
    }
  });

  // Función para obtener el nombre del parque
  const getParkName = (parkId: number) => {
    const park = parks.find(p => p.id === parkId);
    return park?.name || 'Parque no disponible';
  };

  // Función para verificar si una actividad está en el calendario del usuario
  const isActivityInUserCalendar = (activityId: number) => {
    return userActivities.some((ua: any) => ua.activityId === activityId || ua.id === activityId);
  };

  // Función para obtener actividades de un día específico
  const getActivitiesForDate = (date: Date) => {
    return allActivities.filter((activity: Activity) => {
      const activityDate = parseISO(activity.startDate);
      return isSameDay(activityDate, date);
    });
  };

  // Función para obtener actividades del usuario para un día específico
  const getUserActivitiesForDate = (date: Date) => {
    return userActivities.filter((userActivity: any) => {
      const activity = allActivities.find((a: Activity) => a.id === userActivity.activityId);
      if (!activity) return false;
      const activityDate = parseISO(activity.startDate);
      return isSameDay(activityDate, date);
    });
  };

  // Renderizar vista de calendario mensual
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Encabezados de días */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-500 text-sm">
            {day}
          </div>
        ))}
        
        {/* Días del mes */}
        {days.map(day => {
          const dayActivities = getActivitiesForDate(day);
          const userDayActivities = getUserActivitiesForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                ${isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                ${!isSameMonth(day, selectedDate) ? 'text-gray-300 bg-gray-50' : ''}
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div className="font-semibold text-sm mb-1">
                {format(day, 'd')}
              </div>
              
              {/* Actividades del día */}
              <div className="space-y-1">
                {dayActivities.slice(0, 2).map((activity: Activity) => (
                  <div
                    key={activity.id}
                    className={`
                      text-xs p-1 rounded cursor-pointer
                      ${isActivityInUserCalendar(activity.id) 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedActivity(activity);
                      setShowActivityDetails(true);
                    }}
                  >
                    {activity.title.length > 15 ? activity.title.substring(0, 15) + '...' : activity.title}
                  </div>
                ))}
                
                {dayActivities.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayActivities.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar vista de lista
  const renderListView = () => {
    const upcomingActivities = allActivities
      .filter((activity: Activity) => new Date(activity.startDate) >= new Date())
      .sort((a: Activity, b: Activity) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
      <div className="space-y-4">
        {upcomingActivities.map((activity: Activity) => (
          <Card key={activity.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(parseISO(activity.startDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(parseISO(activity.startDate), 'HH:mm')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {getParkName(activity.parkId)}
                    </div>
                    {activity.location && (
                      <div className="flex items-center">
                        <span>📍 {activity.location}</span>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="mb-2">
                    {activity.category}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowActivityDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  
                  {isActivityInUserCalendar(activity.id) ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCalendarMutation.mutate(activity.id)}
                      disabled={removeFromCalendarMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Quitar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToCalendarMutation.mutate(activity.id)}
                      disabled={addToCalendarMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (activitiesLoading || userActivitiesLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles del calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
          >
            ←
          </Button>
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
          >
            →
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">En mi calendario</p>
                <p className="text-2xl font-bold">{userActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarPlus className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold">{allActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Próximas</p>
                <p className="text-2xl font-bold">
                  {allActivities.filter((a: Activity) => new Date(a.startDate) >= new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista del calendario */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'month' ? renderMonthView() : renderListView()}
        </CardContent>
      </Card>

      {/* Dialog de detalles de actividad */}
      <Dialog open={showActivityDetails} onOpenChange={setShowActivityDetails}>
        <DialogContent className="max-w-2xl" aria-describedby="activity-details-description">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedActivity.title}</DialogTitle>
                <DialogDescription id="activity-details-description" className="text-base">
                  {selectedActivity.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{format(parseISO(selectedActivity.startDate), 'dd/MM/yyyy', { locale: es })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{format(parseISO(selectedActivity.startDate), 'HH:mm')} hrs</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{getParkName(selectedActivity.parkId)}</span>
                    </div>
                    {selectedActivity.location && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2">📍</span>
                        <span>{selectedActivity.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Badge variant="outline">{selectedActivity.category}</Badge>
                    {selectedActivity.capacity && (
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Capacidad: {selectedActivity.capacity} personas</span>
                      </div>
                    )}
                    {selectedActivity.price && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2">💰</span>
                        <span>Precio: ${selectedActivity.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowActivityDetails(false)}>
                    Cerrar
                  </Button>
                  
                  {isActivityInUserCalendar(selectedActivity.id) ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        removeFromCalendarMutation.mutate(selectedActivity.id);
                        setShowActivityDetails(false);
                      }}
                      disabled={removeFromCalendarMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Quitar de mi calendario
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        addToCalendarMutation.mutate(selectedActivity.id);
                        setShowActivityDetails(false);
                      }}
                      disabled={addToCalendarMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar a mi calendario
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserActivityCalendar;