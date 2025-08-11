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
  Grid,
  List,
  ArrowLeft,
  Star,
  Heart,
  ExternalLink,
  Building,
  Trees,
  User,
  DollarSign,
  Trophy,
  Utensils,
  Coffee,
  CheckCircle
} from 'lucide-react';
import heroImage from "@assets/download-7_1754927049169.jpg";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/components/PublicLayout';
import AdSpace from '@/components/AdSpace';

interface ReservableSpace {
  id: number;
  name: string;
  description: string;
  spaceType: string;
  capacity: number;
  hourlyRate: string;
  minimumHours: number;
  maximumHours: number;
  amenities: string;
  rules: string;
  isActive: boolean;
  requiresApproval: boolean;
  advanceBookingDays: number;
  images: string;
  coordinates: string;
  parkId: number;
  parkName: string;
  createdAt: string;
  updatedAt: string;
}

const spaceTypeColors = {
  'playground': 'bg-pink-100 text-pink-800 border-pink-200',
  'kiosk': 'bg-blue-100 text-blue-800 border-blue-200',
  'open_area': 'bg-green-100 text-green-800 border-green-200',
  'pavilion': 'bg-purple-100 text-purple-800 border-purple-200',
  'amphitheater': 'bg-orange-100 text-orange-800 border-orange-200',
  'sports_court': 'bg-red-100 text-red-800 border-red-200',
  'garden': 'bg-teal-100 text-teal-800 border-teal-200',
  'picnic_area': 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const spaceTypeLabels = {
  'playground': 'Área de Juegos',
  'kiosk': 'Kiosco',
  'open_area': 'Área Abierta',
  'pavilion': 'Pabellón',
  'amphitheater': 'Anfiteatro',
  'sports_court': 'Cancha Deportiva',
  'garden': 'Jardín',
  'picnic_area': 'Zona de Picnic'
};

const spaceTypeIcons = {
  'playground': Trophy,
  'kiosk': Coffee,
  'open_area': Trees,
  'pavilion': Building,
  'amphitheater': Users,
  'sports_court': Trophy,
  'garden': Trees,
  'picnic_area': Utensils
};

function SpaceCard({ space, viewMode }: { space: ReservableSpace; viewMode: 'grid' | 'list' }) {
  const spaceTypeColor = spaceTypeColors[space.spaceType as keyof typeof spaceTypeColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  const spaceTypeLabel = spaceTypeLabels[space.spaceType as keyof typeof spaceTypeLabels] || space.spaceType;
  const SpaceIcon = spaceTypeIcons[space.spaceType as keyof typeof spaceTypeIcons] || Building;
  
  // Función para procesar URLs de imágenes
  const processImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Las URLs de Object Storage (/objects/uploads/) ya están configuradas 
    // para servirse correctamente desde el servidor
    return url;
  };

  const hourlyRate = parseFloat(space.hourlyRate);
  const rawImages = space.images ? space.images.split(',').filter(Boolean) : [];
  const images = rawImages.map(processImageUrl);
  const primaryImage = images[0];
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{space.name}</h3>
                <Badge className={`${spaceTypeColor} border`}>
                  {spaceTypeLabel}
                </Badge>
                {space.requiresApproval && (
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    Requiere Aprobación
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{space.description}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{space.parkName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>{space.capacity} personas</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span>${hourlyRate.toLocaleString('es-MX')}/hora</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{space.minimumHours}-{space.maximumHours} horas</span>
                </div>
              </div>
              
              {space.amenities && (
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Amenidades: {space.amenities}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => window.open(`/space/${space.id}`, '_blank')}
              >
                Ver detalle
              </Button>
              {hourlyRate === 0 && (
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
        {primaryImage ? (
          <>
            <img 
              src={primaryImage} 
              alt={space.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 w-full h-full"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SpaceIcon className="h-16 w-16 text-white/70" />
            </div>
          </>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={`${spaceTypeColor} border shadow-sm`}>
            {spaceTypeLabel}
          </Badge>
        </div>
        {hourlyRate === 0 && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white border-0 shadow-sm">
              <Heart className="h-3 w-3 mr-1" />
              Gratis
            </Badge>
          </div>
        )}
        {space.requiresApproval && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-orange-500 text-white border-0 shadow-sm text-xs">
              Requiere Aprobación
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
          {space.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{space.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="truncate">{space.parkName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="text-xs">Hasta {space.capacity} personas</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs">{space.minimumHours}-{space.maximumHours}h</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium">
                {hourlyRate > 0 ? `$${hourlyRate.toLocaleString('es-MX')}/hora` : 'Gratis'}
              </span>
            </div>
          </div>
          
          {space.amenities && (
            <div className="flex items-start gap-2 text-gray-600 pt-2 border-t border-gray-100">
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs line-clamp-2">{space.amenities}</span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
          size="sm"
          onClick={() => window.open(`/space/${space.id}`, '_blank')}
        >
          Ver detalle y reservar
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ReservationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState('all');
  const [filterSpaceType, setFilterSpaceType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  // Obtener todos los espacios reservables
  const { data: spacesData = [], isLoading } = useQuery<ReservableSpace[]>({
    queryKey: ['/api/reservable-spaces'],
  });

  // Obtener parques para filtros
  const { data: parksResponse } = useQuery<any[]>({
    queryKey: ['/api/parks'],
  });
  const parksData = parksResponse || [];

  const filteredSpaces = useMemo(() => {
    if (!Array.isArray(spacesData)) return [];
    
    return spacesData.filter((space) => {
      if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !space.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterPark !== 'all' && space.parkId.toString() !== filterPark) {
        return false;
      }
      if (filterSpaceType !== 'all' && space.spaceType !== filterSpaceType) {
        return false;
      }
      return space.isActive;
    });
  }, [spacesData, searchQuery, filterPark, filterSpaceType]);



  const uniqueSpaceTypes = Array.from(new Set(spacesData.map(space => space.spaceType).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando espacios disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50">
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
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Building className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-light" style={{fontFamily: 'Guttery, sans-serif'}}>
                Reserva
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Espacios para Eventos
            </h2>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Reserva espacios únicos en los parques de Guadalajara para tus eventos, 
            celebraciones y actividades especiales.
          </p>
          <div className="flex items-center justify-center gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Múltiples ubicaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Reserva flexible</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Para todos los grupos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y búsqueda */}
      <section className="py-8" style={{backgroundColor: '#19633c'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre de espacio o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={filterPark} onValueChange={setFilterPark}>
                <SelectTrigger className="w-full sm:w-[200px] h-12">
                  <SelectValue placeholder="Filtrar por parque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parksData.map((park) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSpaceType} onValueChange={setFilterSpaceType}>
                <SelectTrigger className="w-full sm:w-[200px] h-12">
                  <SelectValue placeholder="Tipo de espacio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueSpaceTypes.map((spaceType) => (
                    <SelectItem key={spaceType} value={spaceType}>
                      {spaceTypeLabels[spaceType as keyof typeof spaceTypeLabels] || spaceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="bg-white/90 hover:bg-white text-gray-700"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="bg-white/90 hover:bg-white text-gray-700"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Lista/Grid de espacios */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {filteredSpaces.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron espacios
              </h3>
              <p className="text-gray-600 mb-6">
                No hay espacios que coincidan con los filtros seleccionados.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterPark('all');
                  setFilterSpaceType('all');
                }}
                variant="outline"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredSpaces.map((space) => (
                  <SpaceCard 
                    key={space.id} 
                    space={space} 
                    viewMode={viewMode}
                  />
                ))}
              </div>


            </>
          )}
        </div>
      </section>

      {/* Publicidad inferior */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <AdSpace spaceId={2} position="banner" pageType="parks" />
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}

export default ReservationsPage;