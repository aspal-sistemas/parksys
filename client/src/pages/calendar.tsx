import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths, getDay, isSameDay, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Users, Tag, BookOpen, User, X } from 'lucide-react';

// Tipo para las actividades
interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate?: string;
  location?: string;
  parkId: number;
  parkName: string;
  capacity?: number;
  price?: number;
  instructorId?: number;
  instructorName?: string;
  instructorAvatar?: string;
}

const CalendarPage: React.FC = () => {
  // Estado para el mes actual y filtros
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('');
  const [parkFilter, setParkFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  
  // Consultar actividades
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  // Extraer categorías, parques e instructores únicos para los filtros
  const categories = Array.from(new Set(activities.map(a => a.category || 'Sin categoría')));
  const parks = Array.from(new Set(activities.map(a => a.parkName || 'Sin parque')));
  
  // Extraer instructores únicos 
  const uniqueInstructors = new Map();
  activities
    .filter(a => a.instructorId && a.instructorName)
    .forEach(a => {
      if (!uniqueInstructors.has(a.instructorId)) {
        uniqueInstructors.set(a.instructorId, { 
          id: a.instructorId, 
          name: a.instructorName || `Instructor ${a.instructorId}`
        });
      }
    });
  
  const instructors = Array.from(uniqueInstructors.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Navegación entre meses
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  // Filtrar actividades por fecha y filtros aplicados
  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      // Solo considerar actividades con fechas válidas
      if (!activity.startDate || !isValid(parseISO(activity.startDate))) {
        return false;
      }
      
      // Verificar si la actividad ocurre en la fecha seleccionada
      const activityDate = parseISO(activity.startDate);
      const sameDay = isSameDay(date, activityDate);
      
      // Aplicar filtros
      const matchesCategory = categoryFilter === 'all' || categoryFilter === '' || activity.category === categoryFilter;
      const matchesPark = parkFilter === 'all' || parkFilter === '' || activity.parkName === parkFilter;
      const matchesInstructor = instructorFilter === 'all' || instructorFilter === '' ||
        (activity.instructorId && activity.instructorId.toString() === instructorFilter);
      
      // Filtrar por precio
      let matchesPrice = true;
      if (priceFilter === 'free') {
        matchesPrice = !activity.price || activity.price === 0;
      } else if (priceFilter === 'paid') {
        matchesPrice = activity.price !== undefined && activity.price > 0;
      }
      
      return sameDay && matchesCategory && matchesPark && matchesInstructor && matchesPrice;
    });
  };
  
  // Ver detalles de una actividad
  const viewActivityDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };
  
  // Generar días del mes actual
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  // Determinar el primer día del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  
  // Nombres de los días de la semana
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Formatear precio
  const formatPrice = (price?: number) => {
    if (price === undefined || price === 0) return 'Gratis';
    return `$${price.toFixed(2)} MXN`;
  };
  
  // Generar color según categoría
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'arte y cultura':
        return 'bg-purple-100 text-purple-800';
      case 'deportes':
      case 'deporte y bienestar':
        return 'bg-green-100 text-green-800';
      case 'educación':
      case 'educativo':
        return 'bg-blue-100 text-blue-800';
      case 'recreación':
      case 'recreación y bienestar':
        return 'bg-amber-100 text-amber-800';
      case 'eventos de temporada':
        return 'bg-red-100 text-red-800';
      case 'naturaleza':
      case 'naturaleza, ciencia y conservación':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Calendario de Actividades</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora las actividades y eventos programados en los parques de la ciudad para este mes.
          </p>
        </div>
        
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Parque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parks.map(park => (
                    <SelectItem key={park} value={park}>{park}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los instructores</SelectItem>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="paid">De pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {((categoryFilter && categoryFilter !== 'all') || 
              (parkFilter && parkFilter !== 'all') || 
              (instructorFilter && instructorFilter !== 'all') || 
              priceFilter) && (
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('');
                    setParkFilter('');
                    setInstructorFilter('');
                    setPriceFilter('');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navegación del calendario */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Mes anterior
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          
          <Button variant="outline" onClick={nextMonth}>
            Mes siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-sm py-2 bg-gray-100">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Espacios en blanco para alinear el primer día del mes */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="h-32 bg-gray-50 rounded"></div>
          ))}
          
          {/* Días del mes actual */}
          {daysInMonth.map(day => {
            const activitiesForDay = getActivitiesForDate(day);
            const isActive = activitiesForDay.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div 
                key={day.toString()} 
                className={`h-32 border rounded p-1 overflow-hidden transition-colors ${
                  isActive 
                    ? 'border-primary-200 hover:border-primary-300 cursor-pointer' 
                    : 'bg-gray-50 border-gray-100'
                } ${
                  isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                onClick={() => {
                  if (isActive) {
                    setSelectedDate(day);
                  }
                }}
              >
                <div className="text-right text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-24 text-xs">
                  {activitiesForDay.slice(0, 3).map(activity => (
                    <div 
                      key={activity.id}
                      className={`${getCategoryColor(activity.category)} px-1 py-0.5 rounded truncate`}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewActivityDetails(activity);
                      }}
                    >
                      {activity.title}
                    </div>
                  ))}
                  
                  {activitiesForDay.length > 3 && (
                    <div className="text-center text-gray-500 text-xs">
                      +{activitiesForDay.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Panel lateral para actividades del día seleccionado */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>
                Actividades para {format(selectedDate, 'EEEE d', { locale: es })}
              </CardTitle>
              <CardDescription>
                {getActivitiesForDate(selectedDate).length} actividades encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getActivitiesForDate(selectedDate).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No hay actividades para esta fecha con los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-3">
                  {getActivitiesForDate(selectedDate).map(activity => (
                    <Card 
                      key={activity.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => viewActivityDetails(activity)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{activity.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {format(parseISO(activity.startDate), 'HH:mm', { locale: es })}
                              </span>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(activity.category)}>
                            {activity.category}
                          </Badge>
                        </div>
                        
                        <div className="mt-2 text-sm">
                          <div className="flex items-center text-gray-600 mb-1">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{activity.parkName}</span>
                          </div>
                          
                          {activity.instructorName && (
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{activity.instructorName}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Diálogo de detalles de actividad */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            {selectedActivity && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedActivity.title}</DialogTitle>
                  <DialogDescription>
                    <Badge className={getCategoryColor(selectedActivity.category)}>
                      {selectedActivity.category}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-2">
                  <p className="text-gray-700">{selectedActivity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Fecha y hora</h4>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-800">
                          {format(parseISO(selectedActivity.startDate), 'EEEE d MMMM, HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Ubicación</h4>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-800">
                          {selectedActivity.parkName}
                          {selectedActivity.location && ` - ${selectedActivity.location}`}
                        </span>
                      </div>
                    </div>
                    
                    {selectedActivity.capacity && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Capacidad</h4>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-800">{selectedActivity.capacity} personas</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Precio</h4>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-800">{formatPrice(selectedActivity.price)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedActivity.instructorName && (
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Instructor</h4>
                      <div className="flex items-center">
                        {selectedActivity.instructorAvatar ? (
                          <img 
                            src={selectedActivity.instructorAvatar} 
                            alt={selectedActivity.instructorName}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-gray-800">{selectedActivity.instructorName}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button>
                    Inscribirse
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CalendarPage;