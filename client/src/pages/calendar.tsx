import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths, getDay, isSameDay, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Users, Tag, BookOpen, User, X, Filter, Activity, Trees } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import heroImage from "@assets/jardin-japones_1754934376660.jpg";

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

const CalendarPage: React.FC = () => {
  // Estado para el mes actual y filtros
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Consultar actividades desde la API
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
      const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
      const matchesPark = parkFilter === 'all' || activity.parkName === parkFilter;
      const matchesInstructor = instructorFilter === 'all' ||
        (activity.instructorId && activity.instructorId.toString() === instructorFilter);
      
      // Filtrar por precio
      let matchesPrice = true;
      if (priceFilter === 'free') {
        matchesPrice = !activity.price || activity.price === 0;
      } else if (priceFilter === 'paid') {
        matchesPrice = activity.price !== undefined && activity.price > 0;
      } else if (priceFilter === 'all') {
        matchesPrice = true;
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
  const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null || price === 0 || price === '0.00') return 'Gratis';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return 'Gratis';
    return `$${numPrice.toFixed(2)} MXN`;
  };
  
  // Generar color según categoría
  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (category.toLowerCase()) {
      case 'arte y cultura':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deportes':
      case 'deporte y bienestar':
      case 'deportivo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'educación':
      case 'educativo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recreación':
      case 'recreación y bienestar':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'eventos de temporada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'naturaleza':
      case 'naturaleza y ciencia':
      case 'naturaleza, ciencia y conservación':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'fitness y ejercicio':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'actividades familiares':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'comunidad':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calcular estadísticas para el hero
  const totalActivities = activities.length;
  const uniqueParks = new Set(activities.map(a => a.parkName)).size;
  const activitiesThisMonth = activities.filter(activity => {
    if (!activity.startDate || !isValid(parseISO(activity.startDate))) return false;
    const activityDate = parseISO(activity.startDate);
    return activityDate >= startOfMonth(currentMonth) && activityDate <= endOfMonth(currentMonth);
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando calendario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Hero Section con imagen de fondo */}
      <div 
        className="relative text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl mb-6">
              <div className="flex items-center justify-center gap-3">
                <CalendarIcon className="h-12 w-12 md:h-16 md:w-16 text-white" />
                <span className="font-light text-white" style={{ fontFamily: 'Guttery, sans-serif' }}>Nuestro</span>
              </div>
              <span className="font-bold text-white">Calendario de Actividades</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Descubre eventos y actividades programadas en todos nuestros parques durante el mes
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-blue-100 mt-8">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{activitiesThisMonth} actividades este mes</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-blue-300" />
            <div className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              <span>{uniqueParks} parques activos</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-blue-300" />
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span>{categories.length} categorías</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
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
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
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
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
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
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="paid">De pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(categoryFilter !== 'all' || parkFilter !== 'all' || instructorFilter !== 'all' || priceFilter !== 'all') && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter('all');
                    setParkFilter('all');
                    setInstructorFilter('all');
                    setPriceFilter('all');
                  }}
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Navegación del calendario */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevMonth}
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Mes Anterior
            </Button>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {format(currentMonth, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
            </h2>
            
            <Button 
              variant="outline" 
              onClick={nextMonth}
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              Mes Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Calendario */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Encabezados de días */}
          <div className="grid grid-cols-7 gap-0 bg-gradient-to-r from-blue-50 to-purple-50">
            {weekdays.map(day => (
              <div key={day} className="text-center font-semibold text-sm py-4 text-gray-700 border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-0">
            {/* Espacios en blanco para alinear el primer día del mes */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-32 bg-gray-50 border-r border-b border-gray-200"></div>
            ))}
            
            {/* Días del mes actual */}
            {daysInMonth.map(day => {
              const activitiesForDay = getActivitiesForDate(day);
              const isActive = activitiesForDay.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toString()} 
                  className={`h-32 border-r border-b border-gray-200 p-2 overflow-hidden transition-all duration-200 ${
                    isActive 
                      ? 'hover:bg-blue-50 cursor-pointer' 
                      : 'bg-gray-50/50'
                  } ${
                    isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''
                  } ${
                    isToday ? 'bg-gradient-to-br from-blue-50 to-purple-50' : ''
                  }`}
                  onClick={() => {
                    if (isActive) {
                      setSelectedDate(day);
                    }
                  }}
                >
                  <div className={`text-right text-sm font-semibold mb-1 ${
                    isToday ? 'text-primary' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                    {isToday && (
                      <div className="w-2 h-2 bg-primary rounded-full inline-block ml-1"></div>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-20 text-xs">
                    {activitiesForDay.slice(0, 2).map(activity => (
                      <div 
                        key={activity.id}
                        className={`${getCategoryColor(activity.category)} px-2 py-1 rounded-md truncate border cursor-pointer hover:shadow-sm transition-shadow`}
                        onClick={(e) => {
                          e.stopPropagation();
                          viewActivityDetails(activity);
                        }}
                        title={activity.title}
                      >
                        {activity.title}
                      </div>
                    ))}
                    
                    {activitiesForDay.length > 2 && (
                      <div className="text-center text-primary text-xs font-medium cursor-pointer hover:underline"
                           onClick={() => setSelectedDate(day)}>
                        +{activitiesForDay.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Panel lateral para actividades del día seleccionado */}
        {selectedDate && (
          <Card className="mt-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Actividades para {format(selectedDate, 'EEEE d \'de\' MMMM', { locale: es })}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {getActivitiesForDate(selectedDate).length} actividades encontradas
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {getActivitiesForDate(selectedDate).length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay actividades</h3>
                  <p className="text-gray-600">
                    No se encontraron actividades para esta fecha con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActivitiesForDate(selectedDate).map(activity => (
                    <Card 
                      key={activity.id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
                      onClick={() => viewActivityDetails(activity)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{activity.title}</h3>
                          <Badge className={`${getCategoryColor(activity.category)} ml-2 flex-shrink-0`}>
                            {activity.category}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span>
                              {format(parseISO(activity.startDate), 'HH:mm', { locale: es })}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{activity.parkName}</span>
                          </div>
                          
                          {activity.instructorName && (
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2 text-primary" />
                              <span>{activity.instructorName}</span>
                            </div>
                          )}

                          {(activity.capacity || activity.price !== undefined) && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              {activity.capacity && (
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-4 w-4 mr-1 text-primary" />
                                  <span className="text-xs">{activity.capacity} personas</span>
                                </div>
                              )}
                              {activity.price !== undefined && (
                                <div className="text-sm font-semibold text-primary">
                                  {formatPrice(activity.price)}
                                </div>
                              )}
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
                  <DialogTitle className="text-xl text-gray-900">{selectedActivity.title}</DialogTitle>
                  <DialogDescription>
                    <Badge className={getCategoryColor(selectedActivity.category)}>
                      {selectedActivity.category}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {selectedActivity.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                      <p className="text-gray-600">{selectedActivity.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fecha y Hora</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                          <span>{format(parseISO(selectedActivity.startDate), 'EEEE d \'de\' MMMM', { locale: es })}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            {selectedActivity.startTime && `Inicio: ${selectedActivity.startTime}`}
                            {selectedActivity.endTime && ` - Fin: ${selectedActivity.endTime}`}
                          </span>
                        </div>
                        {selectedActivity.duration && (
                          <div className="text-xs text-gray-500">
                            Duración: {selectedActivity.duration} minutos
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Ubicación</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{selectedActivity.parkName}</span>
                      </div>
                      {selectedActivity.location && (
                        <p className="text-sm text-gray-500 mt-1">{selectedActivity.location}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedActivity.instructorName && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Instructor</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span>{selectedActivity.instructorName}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {selectedActivity.capacity && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Capacidad</h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{selectedActivity.capacity} personas</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.price !== undefined && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Precio</h4>
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(selectedActivity.price)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información adicional */}
                  {(selectedActivity.isRecurring || selectedActivity.targetMarket || selectedActivity.specialNeeds) && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      {selectedActivity.isRecurring && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Recurrencia</h4>
                          <p className="text-sm text-gray-600">
                            {selectedActivity.recurringDays?.length > 0 
                              ? `Se repite: ${selectedActivity.recurringDays.join(', ')}`
                              : 'Actividad recurrente'
                            }
                          </p>
                        </div>
                      )}

                      {selectedActivity.targetMarket?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Público Objetivo</h4>
                          <p className="text-sm text-gray-600">
                            {selectedActivity.targetMarket.join(', ')}
                          </p>
                        </div>
                      )}

                      {selectedActivity.specialNeeds?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Requerimientos Especiales</h4>
                          <div className="space-y-1">
                            {selectedActivity.specialNeeds.map((need, index) => (
                              <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {need}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => {
                      window.open(`/activity/${selectedActivity.id}`, '_blank');
                    }}
                  >
                    Más Información
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    Cerrar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </PublicLayout>
  );
};

export default CalendarPage;