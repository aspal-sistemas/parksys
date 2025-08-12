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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Users, Tag, BookOpen, User, X, Filter, Activity, Trees, Phone, Mail } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
const heroImage = "/jardin-japones.jpg";

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
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Consultar actividades desde la API
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  // Extraer categorías y parques únicos para los filtros
  const categories = Array.from(new Set(activities.map(a => a.category || 'Sin categoría')));
  const parks = Array.from(new Set(activities.map(a => a.parkName || 'Sin parque')));
  
  // Colores por categoría
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Deportes': 'bg-blue-500',
      'Cultura': 'bg-purple-500',
      'Ecología': 'bg-green-500',
      'Recreación': 'bg-orange-500',
      'Educación': 'bg-indigo-500',
      'Bienestar': 'bg-pink-500',
      'Arte': 'bg-red-500',
      'Música': 'bg-yellow-500',
      'Tecnología': 'bg-gray-500',
      'default': 'bg-teal-500'
    };
    return colors[category] || colors.default;
  };

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    if (categoryFilter !== 'all' && activity.category !== categoryFilter) return false;
    if (parkFilter !== 'all' && activity.parkName !== parkFilter) return false;
    if (priceFilter === 'free' && !activity.isFree) return false;
    if (priceFilter === 'paid' && activity.isFree) return false;
    return true;
  });

  // Obtener actividades por fecha
  const getActivitiesForDate = (date: Date) => {
    return filteredActivities.filter(activity => {
      if (!activity.startDate || !isValid(parseISO(activity.startDate))) return false;
      const activityDate = parseISO(activity.startDate);
      return isSameDay(date, activityDate);
    });
  };

  // Funciones de navegación del calendario
  const goToPrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Función para manejar la selección de una actividad
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };

  // Configurar fechas del calendario
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));
  
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Función para resetear filtros
  const resetFilters = () => {
    setCategoryFilter('all');
    setParkFilter('all');
    setPriceFilter('all');
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
        {/* === HERO SECTION === */}
        <section 
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
        </section>

        {/* === SECCIÓN DEL PANEL DE FILTROS === */}
        <section className="py-6" style={{backgroundColor: '#19633c'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: '#19633c'}}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
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
                    {parks.map((park) => (
                      <SelectItem key={park} value={park}>{park}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Precio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los precios</SelectItem>
                    <SelectItem value="free">Gratuitas</SelectItem>
                    <SelectItem value="paid">De pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-white">
                  Mostrando {filteredActivities.length} de {totalActivities} actividades
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="bg-white text-gray-900 border-white hover:bg-gray-100"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* === CONTENEDOR DEL CALENDARIO === */}
        <section className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* === NAVEGACIÓN DEL CALENDARIO === */}
            <div className="py-8">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevMonth}
                  className="flex items-center gap-2 border-[#51a19f] text-[#51a19f] hover:bg-[#51a19f] hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <h2 className="text-3xl font-bold capitalize" style={{color: '#51a19f'}}>
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                
                <Button
                  variant="outline"
                  onClick={goToNextMonth}
                  className="flex items-center gap-2 border-[#51a19f] text-[#51a19f] hover:bg-[#51a19f] hover:text-white"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* === CALENDARIO PRINCIPAL === */}
            <div className="pb-12">
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-2">
              {dateRange.map((date, index) => {
                const dayActivities = getActivitiesForDate(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border rounded-lg ${
                      isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-primary font-bold' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayActivities.slice(0, 3).map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          onClick={() => handleActivityClick(activity)}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getCategoryColor(activity.category)} text-white`}
                        >
                          <div className="font-medium truncate">{activity.title}</div>
                          {activity.startTime && (
                            <div className="text-xs opacity-90">{activity.startTime}</div>
                          )}
                        </div>
                      ))}
                      
                      {dayActivities.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayActivities.length - 3} más...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </section>

        {/* === SECCIÓN ¿NECESITAS MÁS INFORMACIÓN? === */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Necesitas más información?</h2>
              <p className="text-lg text-gray-600">Nuestro equipo está aquí para ayudarte</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Teléfono</h3>
                <p className="text-gray-600 mb-2">(33) 1234-5678</p>
                <p className="text-sm text-gray-500">Lun-Vie 8:00-16:00</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Correo</h3>
                <p className="text-gray-600 mb-2">actividades@parques.gdl.gob.mx</p>
                <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ubicación</h3>
                <p className="text-gray-600 mb-2">Av. Hidalgo 400, Centro</p>
                <p className="text-sm text-gray-500">Guadalajara, Jalisco</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                <Mail className="h-5 w-5 mr-2" />
                Enviar mensaje
              </Button>
            </div>
          </div>
        </section>

        {/* Dialog de detalles de actividad */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedActivity && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${getCategoryColor(selectedActivity.category)} flex items-center justify-center flex-shrink-0`}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                        {selectedActivity.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={`${getCategoryColor(selectedActivity.category)} text-white`}>
                          {selectedActivity.category}
                        </Badge>
                        {selectedActivity.isFree && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Gratuita
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{selectedActivity.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{selectedActivity.parkName}</span>
                    </div>
                    
                    {selectedActivity.startDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {format(parseISO(selectedActivity.startDate), 'PPP', { locale: es })}
                        </span>
                      </div>
                    )}
                    
                    {selectedActivity.startTime && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {selectedActivity.startTime}
                          {selectedActivity.endTime && ` - ${selectedActivity.endTime}`}
                        </span>
                      </div>
                    )}
                    
                    {selectedActivity.capacity && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedActivity.capacity} personas max.</span>
                      </div>
                    )}
                    
                    {selectedActivity.instructorName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedActivity.instructorName}</span>
                      </div>
                    )}
                    
                    {!selectedActivity.isFree && selectedActivity.price && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="font-medium">${selectedActivity.price}</span>
                      </div>
                    )}
                  </div>

                  {(selectedActivity.materials || selectedActivity.requirements || selectedActivity.targetMarket?.length || selectedActivity.specialNeeds?.length) && (
                    <div className="space-y-3 pt-4 border-t">
                      {selectedActivity.materials && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Materiales</h4>
                          <p className="text-sm text-gray-600">{selectedActivity.materials}</p>
                        </div>
                      )}

                      {selectedActivity.requirements && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Requisitos</h4>
                          <p className="text-sm text-gray-600">{selectedActivity.requirements}</p>
                        </div>
                      )}

                      {selectedActivity.targetMarket && selectedActivity.targetMarket.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Público Objetivo</h4>
                          <p className="text-sm text-gray-600">
                            {selectedActivity.targetMarket.join(', ')}
                          </p>
                        </div>
                      )}

                      {selectedActivity.specialNeeds && selectedActivity.specialNeeds.length > 0 && (
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
    </PublicLayout>
  );
};

export default CalendarPage;