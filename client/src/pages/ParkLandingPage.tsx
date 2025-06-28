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
  MessageSquare,
  Trees,
  Globe,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  ExternalLink,
  Users,
  Heart,
  Wrench
} from 'lucide-react';
import { ExtendedPark } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AmenityIcon from '@/components/ui/amenity-icon';
import TreeSpeciesIcon from '@/components/ui/tree-species-icon';
import TreePhotoViewer from '@/components/TreePhotoViewer';
import PublicInstructorEvaluationForm from '@/components/PublicInstructorEvaluationForm';

function ParkLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedInstructor, setSelectedInstructor] = React.useState<any>(null);
  
  // Extraer ID del slug (formato: nombre-parque-id)
  const parkId = slug?.split('-').pop();

  const { data: park, isLoading, error } = useQuery<ExtendedPark>({
    queryKey: [`/api/parks/${parkId}/extended`],
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Parque no encontrado</h1>
          <p className="text-gray-600 mb-6">No pudimos encontrar la información de este parque.</p>
          <Link href="/parks">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a parques
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get main image - prioritize primary image or first available image
  const mainImage = park.primaryImage || 
    (park.images && park.images.length > 0 ? park.images[0].imageUrl : '') ||
    (park.images && park.images.length > 0 ? park.images[0].url : '');
  const additionalImages = park.images?.filter(img => !img.isPrimary) || [];

  // Format dates
  const formatDate = (date: string | Date) => {
    if (!date) return 'Fecha por confirmar';
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy • h:mm a", { locale: es });
  };

  // Get park type label
  const getParkTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'metropolitano': 'Metropolitano',
      'barrial': 'Barrial', 
      'vecinal': 'Vecinal',
      'lineal': 'Lineal',
      'ecologico': 'Ecológico',
      'botanico': 'Botánico',
      'deportivo': 'Deportivo',
      'urbano': 'Urbano',
      'natural': 'Natural',
      'temático': 'Temático'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/parks">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a parques
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{park.name}</h1>
          <p className="text-gray-600 flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            {park.municipality?.name || 'Guadalajara'}, {park.municipality?.state || 'Jalisco'}
          </p>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-96 overflow-hidden">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={park.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <Trees className="h-24 w-24 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30">
                {getParkTypeLabel(park.parkType || 'urbano')}
              </Badge>
              {park.area && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {Number(park.area) >= 10000 
                    ? `${(Number(park.area) / 10000).toFixed(1)} hectáreas` 
                    : `${park.area} m²`}
                </Badge>
              )}
              {park.foundationYear && (
                <Badge className="bg-white/20 text-white border-white/30">
                  Est. {park.foundationYear}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Descripción General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-6 w-6 text-green-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  {park.description || 'Espacio verde público destinado al esparcimiento y recreación de la comunidad.'}
                </p>
                
                {/* Basic Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-semibold">{getParkTypeLabel(park.parkType || 'urbano')}</p>
                  </div>
                  
                  {park.area && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Trees className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-gray-500">Superficie</p>
                      <p className="font-semibold">
                        {Number(park.area) >= 10000 
                          ? `${(Number(park.area) / 10000).toFixed(1)} ha` 
                          : `${park.area} m²`}
                      </p>
                    </div>
                  )}
                  
                  {park.foundationYear && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-gray-500">Fundado</p>
                      <p className="font-semibold">{park.foundationYear}</p>
                    </div>
                  )}
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-semibold">7:00 - 19:30</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trees className="h-6 w-6 text-green-600" />
                  Amenidades del Parque
                </CardTitle>
              </CardHeader>
              <CardContent>

                
                {park.amenities && park.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {park.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border text-center">
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                          {amenity.iconType === 'custom' && amenity.customIconUrl ? (
                            <img 
                              src={amenity.customIconUrl} 
                              alt={amenity.name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                console.error('Error cargando icono:', amenity.customIconUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Trees className="h-6 w-6 text-green-600" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium mt-2">{amenity.name}</span>
                        {amenity.category && (
                          <span className="text-xs text-gray-500 mt-1 capitalize">{amenity.category}</span>
                        )}
                        {amenity.moduleName && (
                          <span className="text-xs text-blue-600 mt-1">{amenity.moduleName}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trees className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay amenidades registradas para este parque</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Parque ID: {park.id} | Amenidades: {park.amenities ? 'array definido' : 'undefined'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Especies Arbóreas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trees className="h-6 w-6 text-green-600" />
                  Especies Arbóreas del Parque
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.treeSpecies && park.treeSpecies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {park.treeSpecies.map((species: any) => (
                      <div key={species.id} className="flex flex-col p-4 bg-white rounded-lg border border-green-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                            <TreeSpeciesIcon 
                              iconType={species.iconType}
                              customIconUrl={species.customIconUrl}
                              size={48}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-green-800 text-sm line-clamp-2">
                                  {species.commonName}
                                </h4>
                                <p className="text-xs text-green-600 italic mt-1 line-clamp-2">
                                  {species.scientificName}
                                </p>
                              </div>
                              {/* Botón del visualizador de fotos */}
                              <div className="ml-2 flex-shrink-0">
                                <TreePhotoViewer 
                                  photoUrl={species.photoUrl}
                                  customPhotoUrl={species.customPhotoUrl}
                                  commonName={species.commonName}
                                  scientificName={species.scientificName}
                                  photoCaption={species.photoCaption}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              {species.family}
                            </Badge>
                            <Badge 
                              variant={species.origin === 'Nativo' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {species.origin}
                            </Badge>
                            {species.isEndangered && (
                              <Badge variant="destructive" className="text-xs">
                                Amenazada
                              </Badge>
                            )}
                          </div>
                          
                          {species.status && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Estado:</span>
                              <Badge 
                                className={
                                  species.status === 'establecido' ? 'bg-green-100 text-green-800' :
                                  species.status === 'en_desarrollo' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {species.status === 'establecido' ? 'Establecido' :
                                 species.status === 'en_desarrollo' ? 'En Desarrollo' :
                                 'Planificado'}
                              </Badge>
                            </div>
                          )}
                          
                          {(species.currentQuantity > 0 || species.recommendedQuantity > 0) && (
                            <div className="text-xs text-gray-600">
                              {species.currentQuantity > 0 && (
                                <div className="flex justify-between">
                                  <span>Plantados:</span>
                                  <span className="font-medium text-green-700">{species.currentQuantity}</span>
                                </div>
                              )}
                              {species.recommendedQuantity > 0 && (
                                <div className="flex justify-between">
                                  <span>Meta:</span>
                                  <span className="font-medium text-blue-700">{species.recommendedQuantity}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {species.plantingZone && (
                            <div className="text-xs text-gray-600">
                              <span>Zona: </span>
                              <span className="font-medium">{species.plantingZone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trees className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay especies arbóreas registradas para este parque</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Este parque aún no tiene especies arbóreas asignadas en el plan de arbolado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                  Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.activities && park.activities.length > 0 ? (
                  <div className="space-y-4">
                    {park.activities.map((activity) => (
                      <div key={activity.id} className="border-l-4 border-orange-300 pl-4 py-3 bg-orange-50 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{activity.title}</h3>
                          {activity.category && (
                            <Badge variant="outline" className="ml-2">
                              {activity.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(activity.startDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-2">No hay actividades programadas actualmente</p>
                    <p className="text-sm text-gray-400">Próximamente se publicarán nuevos eventos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Concesiones y Servicios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Concesiones y Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.concessions && park.concessions.length > 0 ? (
                  <div className="space-y-3">
                    {park.concessions.map((concession) => (
                      <div key={concession.id} className="border-l-4 border-blue-300 pl-4 py-3 bg-blue-50 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{concession.vendorName}</h3>
                          {concession.concessionType && (
                            <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700">
                              {concession.concessionType}
                            </Badge>
                          )}
                        </div>
                        {concession.typeDescription && (
                          <p className="text-gray-600 text-sm mb-2">{concession.typeDescription}</p>
                        )}
                        {concession.location && (
                          <p className="text-gray-500 text-xs mb-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {concession.location}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1 inline" />
                            Desde {format(new Date(concession.startDate), 'MMMM yyyy', { locale: es })}
                          </div>
                          {concession.vendorPhone && (
                            <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-6">
                              <Phone className="h-3 w-3 mr-1" />
                              Contactar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Wrench className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-600 text-sm">No hay concesiones activas en este parque</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instalaciones y Equipos */}
            {park.assets && park.assets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wrench className="h-6 w-6 text-gray-600" />
                    Instalaciones y Equipos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {park.assets.map((asset) => (
                      <div key={asset.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{asset.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              asset.condition === 'Excelente' ? 'border-green-300 text-green-700' :
                              asset.condition === 'Bueno' ? 'border-blue-300 text-blue-700' :
                              asset.condition === 'Regular' ? 'border-yellow-300 text-yellow-700' :
                              'border-red-300 text-red-700'
                            }`}
                          >
                            {asset.condition}
                          </Badge>
                        </div>
                        {asset.description && (
                          <p className="text-gray-600 text-sm mb-2">{asset.description}</p>
                        )}
                        {asset.category && (
                          <Badge variant="secondary" className="text-xs">
                            {asset.category}
                          </Badge>
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
            
            {/* Contacto */}
            {(park.administrator || park.contactPhone || park.contactEmail) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {park.administrator && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Administrador</p>
                        <p className="font-medium">{park.administrator}</p>
                      </div>
                    </div>
                  )}
                  
                  {park.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{park.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {park.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{park.contactEmail}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium text-sm">{park.address || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Municipio</p>
                  <p className="font-medium text-sm">{park.municipality?.name}, {park.municipality?.state}</p>
                </div>
                
                {/* Mapa compacto */}
                <div className="rounded-lg overflow-hidden h-40 bg-gray-200">
                  <iframe
                    title={`Mapa de ${park.name}`}
                    className="w-full h-full"
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${park.latitude},${park.longitude}`}
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    Cómo llegar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver en Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de Árboles */}
            {park.treeStats && park.treeStats.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trees className="h-5 w-5 text-green-600" />
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

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir este parque
                </Button>
                <Button variant="outline" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reportar un problema
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Sugerir mejoras
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Proponer evento
                </Button>
              </CardContent>
            </Card>

            {/* Realiza tu evento aquí */}
            <Card className="bg-white border-2 border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Calendar className="h-5 w-5" />
                  ¡Realiza tu evento aquí!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">
                  Organiza tu evento en este parque. Tenemos opciones para eventos de bajo y alto impacto.
                </p>
                <div className="space-y-3">
                  <Link href="/admin/eventos-ambu/solicitud-bajo-impacto">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white hover:bg-green-50 text-green-700 border-green-300 hover:border-green-400"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Solicitud de evento de bajo impacto
                    </Button>
                  </Link>
                  <Link href="/admin/eventos-ambu/solicitud-alto-impacto">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white hover:bg-green-50 text-green-700 border-green-300 hover:border-green-400"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Solicitud de evento de alto impacto
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Instructores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Instructores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.instructors && park.instructors.length > 0 ? (
                  <div className="space-y-3">
                    {park.instructors.slice(0, 3).map((instructor) => (
                      <div key={instructor.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                        {instructor.profileImageUrl ? (
                          <img 
                            src={instructor.profileImageUrl} 
                            alt={instructor.fullName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-purple-900 text-sm line-clamp-2">{instructor.fullName}</h4>
                              {instructor.specialties && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {instructor.specialties.split(',').slice(0, 2).map((specialty: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                                        {specialty.trim()}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {instructor.experienceYears && (
                                <p className="text-purple-600 text-xs mt-1">
                                  {instructor.experienceYears} años de experiencia
                                </p>
                              )}
                              {instructor.averageRating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span 
                                        key={star} 
                                        className={`text-xs ${star <= Math.floor(instructor.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-purple-600">
                                    {instructor.averageRating}/5
                                  </span>
                                </div>
                              )}
                              
                              {/* Botones de acciones */}
                              <div className="mt-3 space-y-2">
                                <div className="flex gap-2">
                                  <Link href={`/instructor/${instructor.id}`}>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50 flex-1"
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      Ver perfil
                                    </Button>
                                  </Link>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="text-xs border-green-300 text-green-700 hover:bg-green-50 flex-1"
                                        onClick={() => setSelectedInstructor(instructor)}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Evaluar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent 
                                      className="max-w-2xl max-h-[90vh] overflow-y-auto"
                                      aria-describedby="evaluation-description"
                                    >
                                      <DialogHeader>
                                        <DialogTitle>Evaluar Instructor</DialogTitle>
                                        <DialogDescription id="evaluation-description">
                                          Comparte tu experiencia con {instructor.fullName} para ayudar a otros visitantes.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <PublicInstructorEvaluationForm
                                        instructorId={instructor.id}
                                        instructorName={instructor.fullName}
                                        onSuccess={() => {
                                          // El dialog se cerrará automáticamente por el estado del formulario
                                        }}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Enlace a página de instructores */}
                    <div className="mt-6 text-center">
                      <Link 
                        href="/instructors"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00a587] to-[#067f5f] text-white font-medium rounded-lg hover:from-[#067f5f] hover:to-[#00a587] transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Users className="mr-2 h-5 w-5" />
                        Conoce a nuestro equipo
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-600 text-sm">No hay instructores asignados a este parque</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voluntarios Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  Voluntarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.volunteers && park.volunteers.length > 0 ? (
                  <div className="space-y-3">
                    {park.volunteers.slice(0, 3).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border">
                        {volunteer.profileImageUrl ? (
                          <img 
                            src={volunteer.profileImageUrl} 
                            alt={volunteer.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                            <Heart className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 text-sm">{volunteer.fullName}</h4>
                          {volunteer.skills && (
                            <p className="text-green-700 text-xs mt-1">{volunteer.skills}</p>
                          )}
                          {volunteer.interestAreas && (
                            <p className="text-green-600 text-xs mt-1">{volunteer.interestAreas}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {park.volunteers.length > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-green-600 text-xs">+{park.volunteers.length - 3} voluntarios más</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-600 text-sm mb-1">¡Únete como voluntario!</p>
                    <p className="text-green-500 text-xs">Ayuda a cuidar este espacio verde</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentos y Reglamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-gray-600" />
                  Documentos y Reglamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.documents && park.documents.length > 0 ? (
                  <div className="space-y-3">
                    {park.documents.map((doc) => (
                      <a 
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        <FileText className={`h-8 w-8 mr-4 ${
                          doc.fileType?.includes('pdf') ? 'text-red-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <p className="text-sm text-gray-500">{doc.type}</p>
                          {doc.fileSize && (
                            <p className="text-xs text-gray-400 mt-1">{doc.fileSize}</p>
                          )}
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No hay documentos disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Galería de Imágenes */}
            {additionalImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Camera className="h-6 w-6 text-indigo-600" />
                    Galería de Imágenes ({additionalImages.length + 1})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {additionalImages.slice(0, 7).map((image, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-lg hover:shadow-lg transition-all">
                        <img 
                          src={image.imageUrl} 
                          alt={image.caption || `Vista del parque ${idx + 1}`}
                          className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                    {additionalImages.length > 7 && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium hover:bg-gray-200 cursor-pointer">
                        +{additionalImages.length - 7} fotos más
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParkLandingPage;