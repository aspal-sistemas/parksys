import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  ArrowLeft,
  Star,
  Heart,
  ExternalLink,
  Activity,
  Trees,
  User,
  DollarSign,
  Trophy,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
const heroImage = "/images/recorrido-nocturno-colomos-1024x683_1754846133930.jpg";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/components/PublicLayout';
import AdSpace from '@/components/AdSpace';

interface ActivityData {
  id: number;
  title: string;
  description: string;
  category: string;
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
  imageUrl?: string;
  imageCaption?: string;
  // Nuevos campos agregados
  targetMarket?: string[];
  specialNeeds?: string[];
  materials?: string;
  requirements?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  duration?: number;
  isFree?: boolean;
}

const categoryColors = {
  'Arte y Cultura': 'bg-green-100 text-green-800 border-green-200',
  'Recreación y Bienestar': 'bg-blue-100 text-blue-800 border-blue-200',
  'Eventos de Temporada': 'bg-orange-100 text-orange-800 border-orange-200',
  'Deportivo': 'bg-red-100 text-red-800 border-red-200',
  'Comunidad': 'bg-purple-100 text-purple-800 border-purple-200',
  'Naturaleza y Ciencia': 'bg-teal-100 text-teal-800 border-teal-200',
  'Fitness y Ejercicio': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Actividades Familiares': 'bg-pink-100 text-pink-800 border-pink-200'
};

// Tarjeta simplificada para carrusel
function CarouselActivityCard({ activity, isCenter = false }: { activity: ActivityData; isCenter?: boolean }) {
  const categoryColor = categoryColors[activity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  const parksResponse = useQuery({ queryKey: ['/api/parks'] });
  const parksData = parksResponse.data || [];
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-sm h-full ${isCenter ? 'scale-105 shadow-md' : ''}`}>
      {/* Imagen más grande - aspecto 4:3 */}
      <div className={`${isCenter ? 'aspect-[3/2]' : 'aspect-[4/3]'} relative overflow-hidden`}>
        {activity.images && activity.images.length > 0 ? (
          <>
            <img 
              src={activity.images[0].imageUrl} 
              alt={activity.images[0].altText || activity.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </>
        ) : activity.imageUrl ? (
          <>
            <img 
              src={activity.imageUrl} 
              alt={activity.imageCaption || activity.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 w-full h-full flex items-center justify-center">
              <Activity className="h-16 w-16 text-green-600/50" />
            </div>
          </>
        )}
        
        {/* Badge de categoría */}
        <div className="absolute top-3 left-3">
          <Badge className={`${categoryColor} border shadow-sm text-xs`}>
            {activity.category}
          </Badge>
        </div>
      </div>
      
      {/* Contenido simplificado */}
      <div className="p-4 space-y-3">
        {/* Título de la actividad */}
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {activity.title}
        </h3>
        
        {/* Parque */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-sm truncate">
            {parksData.find(p => p.id === activity.parkId)?.name || 'Parque'}
          </span>
        </div>
        
        {/* Botón Ver detalle */}
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          size="sm"
          onClick={() => window.open(`/activity/${activity.id}`, '_blank')}
        >
          Ver detalle
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
}

function ActivityCard({ activity, viewMode }: { activity: ActivityData; viewMode: 'grid' | 'list' }) {
  const categoryColor = categoryColors[activity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  const startDate = new Date(activity.startDate);
  const endDate = new Date(activity.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{activity.title}</h3>
                <Badge className={`${categoryColor} border`}>
                  {activity.category}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{activity.parkName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>
                    {isMultiDay 
                      ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
                      : format(startDate, 'dd MMM yyyy', { locale: es })
                    }
                  </span>
                </div>
                
                {activity.capacity > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{activity.capacity} personas</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span>{activity.price > 0 ? `$${Number(activity.price).toLocaleString('es-MX')}` : 'Gratis'}</span>
                </div>
              </div>
              
              {activity.instructorName && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <User className="h-4 w-4 text-green-600" />
                  <span>Instructor: {activity.instructorName}</span>
                </div>
              )}
              
              {/* Información adicional */}
              <div className="mt-3 space-y-2">
                {activity.targetMarket && activity.targetMarket.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4 text-orange-600" />
                    <span>Dirigido a: {activity.targetMarket.map(market => {
                      const marketLabels: {[key: string]: string} = {
                        'preescolar': 'Preescolar',
                        'ninos': 'Niños',
                        'adolescentes': 'Adolescentes', 
                        'adultos': 'Adultos',
                        'adultos_mayores': 'Adultos mayores',
                        'familias': 'Familias'
                      };
                      return marketLabels[market] || market;
                    }).join(', ')}</span>
                  </div>
                )}
                
                {activity.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{(activity.duration / 60).toFixed(1)} horas</span>
                  </div>
                )}
                
                {activity.isRecurring && activity.recurringDays && activity.recurringDays.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Días: {activity.recurringDays.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => window.open(`/activity/${activity.id}`, '_blank')}
              >
                Ver detalle
              </Button>
              {activity.price === 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  Gratis
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-sm">
      <div className="aspect-video relative overflow-hidden">
        {activity.imageUrl ? (
          <>
            <img 
              src={activity.imageUrl} 
              alt={activity.imageCaption || activity.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 w-full h-full"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-16 w-16 text-white/70" />
            </div>
          </>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={`${categoryColor} border shadow-sm`}>
            {activity.category}
          </Badge>
        </div>
        {activity.price === 0 && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white border-0 shadow-sm">
              <Heart className="h-3 w-3 mr-1" />
              Gratis
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
          {activity.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="truncate">{activity.parkName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs">
              {isMultiDay 
                ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`
                : format(startDate, 'dd MMM yyyy', { locale: es })
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-xs">{activity.capacity > 0 ? `${activity.capacity} personas` : 'Sin límite'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium">{activity.price > 0 ? `$${Number(activity.price).toLocaleString('es-MX')}` : 'Gratis'}</span>
            </div>
          </div>
          
          {activity.instructorName && (
            <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-xs">{activity.instructorName}</span>
            </div>
          )}
          
          {/* Información adicional - vista grid */}
          <div className="space-y-1 pt-2">
            {activity.targetMarket && activity.targetMarket.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Trophy className="h-3 w-3 text-orange-600 flex-shrink-0" />
                <span className="text-xs truncate">
                  {activity.targetMarket.map(market => {
                    const marketLabels: {[key: string]: string} = {
                      'preescolar': 'Preescolar',
                      'ninos': 'Niños',
                      'adolescentes': 'Adolescentes', 
                      'adultos': 'Adultos',
                      'adultos_mayores': 'Adultos mayores',
                      'familias': 'Familias'
                    };
                    return marketLabels[market] || market;
                  }).join(', ')}
                </span>
              </div>
            )}
            
            {activity.duration && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs">{(activity.duration / 60).toFixed(1)} hrs</span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" 
          size="sm"
          onClick={() => window.open(`/activity/${activity.id}`, '_blank')}
        >
          Ver detalle
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Obtener todas las actividades con imágenes
  const { data: activitiesData = [], isLoading } = useQuery<ActivityData[]>({
    queryKey: ['/api/actividades-fotos'],
  });

  // Obtener parques para filtros
  const { data: parksResponse } = useQuery<any[]>({
    queryKey: ['/api/parks'],
  });
  const parksData = parksResponse || [];

  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activitiesData)) return [];
    
    return activitiesData.filter((activity) => {
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterPark !== 'all' && activity.parkId.toString() !== filterPark) {
        return false;
      }
      if (filterCategory !== 'all' && activity.category !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [activitiesData, searchQuery, filterPark, filterCategory]);

  // Determinar si hay filtros activos
  const hasActiveFilters = searchQuery || filterPark !== 'all' || filterCategory !== 'all';
  
  // Si hay filtros activos, mostrar TODAS las actividades que coincidan
  // Si no hay filtros, mostrar TODAS las actividades en el carrusel
  const currentActivities = filteredActivities;

  const uniqueCategories = Array.from(new Set(activitiesData.map(activity => activity.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section 
        className="relative py-24 px-4 text-center text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Activity className="h-12 w-12" />
              <h1 className="font-guttery text-4xl md:text-5xl font-normal">
                Descubre
              </h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              Actividades en el Parque
            </h2>
          </div>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Descubre todas las actividades disponibles en los parques de Guadalajara. 
            Desde deportes hasta arte y cultura, hay algo para todos.
          </p>
          <div className="flex items-center justify-center gap-4 text-green-100">
            <div className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              <span>{parksData.length} parques</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-green-300" />
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{activitiesData.length} actividades</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-green-800 rounded-lg border border-green-700 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-300" />
                  <Input
                    placeholder="Buscar actividades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/90 border-green-600 focus:border-green-400 focus:ring-green-400 placeholder-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterPark} onValueChange={setFilterPark}>
                  <SelectTrigger className="w-48 bg-white/90 border-green-600 text-gray-800">
                    <Filter className="h-4 w-4 mr-2 text-green-600" />
                    <SelectValue placeholder="Todos los parques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parksData.map((park: any) => (
                      <SelectItem key={park.id} value={park.id.toString()}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48 bg-white/90 border-green-600 text-gray-800">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actividades */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            {hasActiveFilters ? (
              <Search className="h-6 w-6 text-blue-500" />
            ) : (
              <Activity className="h-6 w-6 text-green-500" />
            )}
            <h2 className="text-2xl font-semibold text-gray-800">
              {hasActiveFilters 
                ? `Resultados de búsqueda (${currentActivities.length})` 
                : 'Todas las Actividades'
              }
            </h2>
          </div>
          <p className="text-gray-600 mb-8">
            {hasActiveFilters 
              ? 'Actividades que coinciden con tu búsqueda'
              : 'Explora todas las actividades disponibles en los parques de Guadalajara'
            }
          </p>
          
          {currentActivities.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron actividades</h3>
              <p className="text-gray-500 mb-6">Intenta ajustar tus filtros de búsqueda</p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterPark('all');
                  setFilterCategory('all');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : hasActiveFilters ? (
            /* Cuadrícula completa cuando hay filtros activos */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} viewMode="grid" />
              ))}
            </div>
          ) : (
            /* Carrusel cuando no hay filtros - diseño 1/4 - 2/4 - 1/4 */
            <div className="relative">
              {/* Contenedor del carrusel */}
              <div className="overflow-hidden">
                <div className="flex gap-4">
                  {/* Siempre mostrar 3 elementos visibles */}
                  {[0, 1, 2].map((offset) => {
                    const activityIndex = carouselIndex + offset;
                    const activity = currentActivities[activityIndex];
                    const isCenter = offset === 1; // El elemento del medio es central
                    
                    if (!activity) return null;
                    
                    return (
                      <div 
                        key={activity.id}
                        className={`flex-none ${isCenter ? 'w-2/4' : 'w-1/4'}`}
                      >
                        <CarouselActivityCard activity={activity} isCenter={isCenter} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón anterior - sobre tarjeta izquierda */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                disabled={carouselIndex === 0}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 border-green-200 hover:bg-green-50 bg-white/90 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Botón siguiente - sobre tarjeta derecha */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCarouselIndex(Math.min(currentActivities.length - 3, carouselIndex + 1))}
                disabled={carouselIndex >= currentActivities.length - 3}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 border-green-200 hover:bg-green-50 bg-white/90 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Indicadores de página */}
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.max(1, currentActivities.length - 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCarouselIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      carouselIndex === index 
                        ? 'bg-green-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ad Space - ID 6 */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <AdSpace 
          spaceId="6" 
          position="banner" 
          pageType="activities" 
          className=""
        />
      </section>

      {/* Calendario de Eventos */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Calendario de Eventos */}
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Próximos Eventos</h3>
              </div>
              <p className="mt-2 text-blue-100">No te pierdas nuestras actividades</p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { 
                    date: '15 Ago', 
                    title: 'Yoga al Amanecer', 
                    park: 'Parque Colomos',
                    time: '6:00 AM',
                    spots: 20
                  },
                  { 
                    date: '18 Ago', 
                    title: 'Taller de Jardinería', 
                    park: 'Parque Revolución',
                    time: '10:00 AM',
                    spots: 15
                  },
                  { 
                    date: '22 Ago', 
                    title: 'Concierto al Aire Libre', 
                    park: 'Parque Metropolitano',
                    time: '7:00 PM',
                    spots: 100
                  },
                  { 
                    date: '25 Ago', 
                    title: 'Clase de Baile', 
                    park: 'Parque Agua Azul',
                    time: '5:00 PM',
                    spots: 30
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-center min-w-fit">
                      <div className="text-sm font-bold">{event.date}</div>
                      <div className="text-xs">{event.time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.park}</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{event.spots} lugares disponibles</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Ver todos los eventos
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AdSpace específico para Yoga */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">¿Te interesa el Yoga?</h3>
          <p className="text-sm text-gray-500">Descubre más sobre nuestras clases de yoga y bienestar</p>
        </div>
        <AdSpace 
          spaceId="23" 
          position="banner" 
          pageType="activities" 
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4"
        />
      </section>

      {/* Sección de Contacto */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Necesitas más información?</h2>
            <p className="text-lg text-gray-600">Nuestro equipo está aquí para ayudarte</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600 mb-2">(33) 1234-5678</p>
              <p className="text-sm text-gray-500">Lun-Vie 8:00-16:00</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Correo</h3>
              <p className="text-gray-600 mb-2">actividades@parques.gdl.gob.mx</p>
              <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
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
      </div>
    </PublicLayout>
  );
}

export default ActivitiesPage;