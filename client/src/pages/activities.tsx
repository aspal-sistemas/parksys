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
  Mail
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

  // Mostrar solo las 6 actividades más populares (las primeras 6 de los resultados filtrados)
  const currentActivities = filteredActivities.slice(0, 6);

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

      {/* Header Ad Space - After Filters */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdSpace 
            spaceId="6" 
            position="header" 
            pageType="activities" 
            className="w-full"
          />
        </div>
      </div>

      {/* Contenido Principal */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex gap-8 items-start">
          {/* Sidebar izquierda - 1/4 del ancho */}
          <div className="w-80 space-y-6">
            {/* Mapa de Actividades */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Mapa de Actividades
              </h3>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Próximamente: Mapa interactivo</p>
                </div>
              </div>
            </Card>

            {/* Contacto para Dudas */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contacto para Dudas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" />
                  <span>33 3333 3333</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-green-500" />
                  <span>actividades@parques.gob.mx</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Lun-Vie 8:00-16:00</span>
                </div>
              </div>
            </Card>

            {/* Instructores */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Nuestros Instructores
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Ana García</p>
                    <p className="text-xs text-gray-500">Yoga & Meditación</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    C
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Carlos López</p>
                    <p className="text-xs text-gray-500">Deportes & Fitness</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">María Rodríguez</p>
                    <p className="text-xs text-gray-500">Arte & Cultura</p>
                  </div>
                </div>
              </div>
              <Link href="/instructors">
                <Button variant="outline" size="sm" className="w-full mt-4 text-purple-600 border-purple-200 hover:bg-purple-50">
                  Ver todos los instructores
                </Button>
              </Link>
            </Card>

            {/* Ad Space del sidebar */}
            <AdSpace 
              spaceId="4" 
              position="sidebar" 
              pageType="activities" 
              className=""
            />
          </div>

          {/* Contenido principal - 3/4 del ancho */}
          <div className="flex-1">
            {currentActivities.length === 0 ? (
              <div className="text-center py-16">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron actividades</h3>
                <p className="text-gray-500">Intenta ajustar los filtros para ver más resultados.</p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterPark('all');
                    setFilterCategory('all');
                  }}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                {/* Header de resultados */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Star className="h-6 w-6 text-yellow-500" />
                      <h2 className="text-2xl font-semibold text-gray-800">Actividades más populares</h2>
                    </div>
                    <p className="text-sm text-gray-600 ml-9">Las 6 actividades más destacadas de nuestros parques</p>
                  </div>
                  <Link href="/parks">
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Ver parques
                    </Button>
                  </Link>
                </div>

                {/* Lista horizontal de actividades */}
                <div className="space-y-6">
                  {currentActivities.slice(0, 6).map((activity: any, index) => (
                    <div key={activity.id}>
                      <Card className="border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                        <div className="flex">
                          <div className="w-64 h-40 relative overflow-hidden flex-shrink-0">
                            {activity.imageUrl ? (
                              <img 
                                src={activity.imageUrl.startsWith('http') ? activity.imageUrl : `${activity.imageUrl}?v=${Date.now()}`}
                                alt={activity.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  console.log(`Error loading image: ${activity.imageUrl}`);
                                  e.currentTarget.src = "/api/placeholder/400/240";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <Activity className="h-16 w-16 text-green-400" />
                              </div>
                            )}
                            {activity.category && (
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                                  {activity.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-xl text-gray-800 mb-2 hover:text-green-700 transition-colors">
                                  {activity.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-2 mb-4">
                                  {activity.description}
                                </p>
                              </div>
                              <Link href={`/activities/${activity.id}`}>
                                <Button className="bg-green-600 hover:bg-green-700 ml-6">
                                  Ver detalles
                                </Button>
                              </Link>
                            </div>
                            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                              {activity.park_name && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                  <span>{activity.park_name}</span>
                                </div>
                              )}
                              {activity.schedule && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  <span>{activity.schedule}</span>
                                </div>
                              )}
                              {activity.instructor_name && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                                  <span>{activity.instructor_name}</span>
                                </div>
                              )}
                              {activity.difficulty && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  activity.difficulty === 'Principiante' ? 'bg-green-100 text-green-800' :
                                  activity.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {activity.difficulty}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Ad Space cada 3 actividades */}
                      {index > 0 && (index + 1) % 3 === 0 && (
                        <div className="mt-6">
                          <AdSpace 
                            spaceId={`${15 + Math.floor(index / 3) - 1}`} 
                            position="card" 
                            pageType="activities" 
                            className=""
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>


              </>
            )}
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}

export default ActivitiesPage;