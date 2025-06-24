import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft,
  Camera, 
  MapPin, 
  Share2, 
  Download, 
  FileText, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { ExtendedPark } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import AmenityIcon from '@/components/ui/amenity-icon';

interface ExtendedPark {
  id: number;
  name: string;
  description: string;
  location: string;
  type: string;
  area: number;
  establishedYear: number;
  municipality: {
    id: number;
    name: string;
    state: string;
  };
  images: Array<{
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    caption?: string;
  }>;
  amenities: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    customIconUrl?: string;
  }>;
  activities: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
  }>;
  documents: Array<{
    id: number;
    title: string;
    type: string;
    fileUrl: string;
  }>;
  treeStats: {
    total: number;
    good: number;
    regular: number;
    bad: number;
    unknown: number;
  };
  assets: Array<{
    id: number;
    name: string;
    category: string;
    condition: string;
  }>;
}

export default function ParkLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Extraer ID del slug (formato: nombre-parque-id)
  const parkId = slug?.split('-').pop();

  const { data: park, isLoading, error } = useQuery<ExtendedPark>({
    queryKey: ['/api/parks', parkId, 'extended'],
    enabled: !!parkId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del parque...</p>
        </div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🏞️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Parque no encontrado</h1>
          <p className="text-gray-600 mb-6">El parque que buscas no existe o no está disponible.</p>
          <Link href="/parks">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Parques
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = park.images?.find(img => img.isPrimary) || park.images?.[0];
  const formatArea = (area: number) => area >= 10000 ? `${(area / 10000).toFixed(1)} hectáreas` : `${area} m²`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navegación superior */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/parks">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Parques
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {primaryImage ? (
          <img 
            src={primaryImage.imageUrl} 
            alt={park.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <Trees className="h-24 w-24 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 py-8 text-white w-full">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm opacity-90">{park.municipality?.name || 'Guadalajara'}, {park.municipality?.state || 'Jalisco'}</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{park.name}</h1>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {park.parkType || park.type || 'Parque urbano'}
              </Badge>
              {park.area && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {formatArea(park.area)}
                </Badge>
              )}
              {park.establishedYear && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Est. {park.establishedYear}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  Acerca de este parque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {park.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenidades */}
            {park.amenities && park.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Servicios y Amenidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {park.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {amenity.customIconUrl ? (
                          <img 
                            src={amenity.customIconUrl} 
                            alt={amenity.name}
                            className="h-8 w-8"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                            {amenity.icon}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{amenity.name}</p>
                          {amenity.description && (
                            <p className="text-xs text-gray-500">{amenity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actividades */}
            {park.activities && park.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Próximas Actividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {park.activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="border-l-4 border-purple-300 pl-4">
                        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.startDate).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Galería de imágenes */}
            {park.images && park.images.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-indigo-600" />
                    Galería de Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {park.images.slice(1, 7).map((image) => (
                      <div key={image.id} className="relative group overflow-hidden rounded-lg">
                        <img 
                          src={image.imageUrl} 
                          alt={image.caption || park.name}
                          className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-sm text-gray-600">{park.location || park.municipality?.name || 'Guadalajara'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Trees className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Tipo de Parque</p>
                    <p className="text-sm text-gray-600">{park.parkType || park.type || 'Parque urbano'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Área Total</p>
                    <p className="text-sm text-gray-600">{park.area ? formatArea(park.area) : 'No especificada'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Establecido</p>
                    <p className="text-sm text-gray-600">{park.establishedYear || 'No especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de árboles */}
            {park.treeStats && park.treeStats.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Arbolado Urbano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600">{park.treeStats.total}</div>
                    <p className="text-sm text-gray-600">Árboles registrados</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Buen estado</span>
                      <span className="font-medium text-green-600">{park.treeStats.good}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Estado regular</span>
                      <span className="font-medium text-yellow-600">{park.treeStats.regular}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mal estado</span>
                      <span className="font-medium text-red-600">{park.treeStats.bad}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documentos */}
            {park.documents && park.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {park.documents.map((doc) => (
                      <a 
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Link href="/parks">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Explorar más parques
                    </Button>
                  </Link>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar administrador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}