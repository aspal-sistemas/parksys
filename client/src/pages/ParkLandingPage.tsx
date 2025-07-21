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
  Store,
  User,
  ExternalLink,
  Users,
  Heart
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
import ParkEvaluationsSectionSimple from '@/components/ParkEvaluationsSectionSimple';
import PublicLayout from '@/components/PublicLayout';
import AdSpace from '@/components/AdSpace';
import greenFlagLogo from '@assets/PHOTO-2025-07-01-12-36-16_1751396336894.jpg';

function ParkLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedInstructor, setSelectedInstructor] = React.useState<any>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [selectedSpeciesData, setSelectedSpeciesData] = React.useState<any>(null);
  const [selectedActivityData, setSelectedActivityData] = React.useState<any>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = React.useState(false);
  
  // Extraer ID del slug (formato: nombre-parque-id)
  const parkId = slug?.split('-').pop();

  const { data: park, isLoading, error } = useQuery<ExtendedPark>({
    queryKey: [`/api/parks/${parkId}/extended`],
    enabled: !!parkId,
  });

  // Functions for image modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
    setSelectedSpeciesData(null);
  };

  const goToPreviousImage = () => {
    if (!selectedImage || !park) return;
    const primaryImageExists = park?.images?.some(img => img.isPrimary) || false;
    const mainImage = park.primaryImage || 
      (park.images && park.images.length > 0 ? park.images[0].imageUrl : '') ||
      (park.images && park.images.length > 0 ? park.images[0].url : '');
    
    const additionalImages = park?.images?.filter((img, index) => {
      if (primaryImageExists) {
        return !img.isPrimary;
      } else {
        return index !== 0;
      }
    }) || [];
    
    const allImages = [
      ...(mainImage ? [{ imageUrl: mainImage, caption: `Vista principal de ${park.name}` }] : []),
      ...additionalImages
    ];
    
    const currentIndex = allImages.findIndex(img => img.imageUrl === selectedImage);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
    setSelectedImage(allImages[previousIndex].imageUrl);
  };

  const goToNextImage = () => {
    if (!selectedImage || !park) return;
    const primaryImageExists = park?.images?.some(img => img.isPrimary) || false;
    const mainImage = park.primaryImage || 
      (park.images && park.images.length > 0 ? park.images[0].imageUrl : '') ||
      (park.images && park.images.length > 0 ? park.images[0].url : '');
    
    const additionalImages = park?.images?.filter((img, index) => {
      if (primaryImageExists) {
        return !img.isPrimary;
      } else {
        return index !== 0;
      }
    }) || [];
    
    const allImages = [
      ...(mainImage ? [{ imageUrl: mainImage, caption: `Vista principal de ${park.name}` }] : []),
      ...additionalImages
    ];
    
    const currentIndex = allImages.findIndex(img => img.imageUrl === selectedImage);
    const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(allImages[nextIndex].imageUrl);
  };

  // Keyboard navigation - Always call this hook
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImageModalOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          goToPreviousImage();
          break;
        case 'ArrowRight':
          goToNextImage();
          break;
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isImageModalOpen, selectedImage]);

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
  const primaryImageExists = park?.images?.some(img => img.isPrimary) || false;
  const mainImage = park ? (park.primaryImage || 
    (park.images && park.images.length > 0 ? park.images[0].imageUrl : '') ||
    (park.images && park.images.length > 0 ? park.images[0].url : '')) : '';
  
  // Si hay imagen primaria marcada, excluirla de adicionales
  // Si NO hay imagen primaria, excluir la primera imagen que se usa como main
  const additionalImages = park?.images?.filter((img, index) => {
    if (primaryImageExists) {
      return !img.isPrimary; // Excluir solo las marcadas como primarias
    } else {
      return index !== 0; // Excluir la primera imagen (que se usa como main)
    }
  }) || [];
  
  // All images for gallery - sin duplicación
  const allImages = [
    ...(mainImage ? [{ imageUrl: mainImage, caption: `Vista principal de ${park?.name || 'Parque'}` }] : []),
    ...additionalImages
  ];

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

  // Check if park should show Green Flag Award logo
  const shouldShowGreenFlag = (parkId: number) => {
    // Bosque Los Colomos (ID: 5), Parque Metropolitano (ID: 2), Parque Alcalde (ID: 4), Bosque Urbano Tlaquepaque (ID: 18)
    return parkId === 5 || parkId === 2 || parkId === 4 || parkId === 18;
  };

  return (
    <PublicLayout>
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{park.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Parque Certificado con el</p>
            </div>
            {/* Green Flag Award Logo - Solo para parques certificados */}
            {shouldShowGreenFlag(park.id) && (
              <img 
                src={greenFlagLogo} 
                alt="Green Flag Award" 
                className="h-20 w-30 object-contain bg-white rounded-md p-2 shadow-lg border-2 border-green-500"
                title="Green Flag Award - Parque Certificado"
              />
            )}
          </div>
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
                    <Globe className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-semibold">{getParkTypeLabel(park.parkType || 'urbano')}</p>
                  </div>
                  
                  {park.area && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Trees className="h-6 w-6 mx-auto mb-2 text-green-600" />
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
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-gray-500">Fundado</p>
                      <p className="font-semibold">{park.foundationYear}</p>
                    </div>
                  )}
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
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
                      <div key={amenity.id} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border text-center">
                        <div className="w-20 h-20 flex items-center justify-center mb-3">
                          {amenity.iconType === 'custom' && amenity.customIconUrl ? (
                            <img 
                              src={amenity.customIconUrl} 
                              alt={amenity.name}
                              className="w-20 h-20 object-contain"
                              onError={(e) => {
                                console.error('Error cargando icono:', amenity.customIconUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                              <Trees className="h-10 w-10 text-green-600" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{amenity.name}</span>
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
                  <div className="space-y-4">
                    {/* Solo mostrar las primeras 4 especies en una fila */}
                    <div className="grid grid-cols-4 gap-4">
                      {park.treeSpecies.slice(0, 4).map((species: any) => (
                        <div 
                          key={species.id} 
                          className="group cursor-pointer bg-white rounded-lg border border-green-200 hover:border-green-400 transition-all duration-300 overflow-hidden"
                          onClick={() => {
                            // Crear modal con información técnica detallada
                            const speciesImageUrl = species.photoUrl || species.customPhotoUrl;
                            if (speciesImageUrl) {
                              openImageModal(speciesImageUrl);
                              // Guardar información técnica para mostrar en el modal
                              setSelectedSpeciesData(species);
                            }
                          }}
                        >
                          <div className="aspect-square relative overflow-hidden">
                            {species.photoUrl || species.customPhotoUrl ? (
                              <img 
                                src={species.photoUrl || species.customPhotoUrl}
                                alt={species.commonName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <TreeSpeciesIcon 
                                  iconType={species.iconType}
                                  customIconUrl={species.customIconUrl}
                                  size={64}
                                />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                          </div>
                          <div className="p-3 text-center">
                            <h4 className="font-semibold text-green-800 text-sm line-clamp-2">
                              {species.commonName}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Botón Ver todas las especies */}
                    <div className="text-center pt-4 border-t">
                      <Link href="/tree-species">
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          <Trees className="h-4 w-4 mr-2" />
                          Ver todas las especies
                        </Button>
                      </Link>
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {park.activities.slice(0, 3).map((activity) => (
                      <div 
                        key={activity.id} 
                        className="group cursor-pointer bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-all duration-300 overflow-hidden"
                        onClick={() => {
                          setSelectedActivityData(activity);
                          setIsActivityModalOpen(true);
                        }}
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          {activity.imageUrl ? (
                            <img 
                              src={activity.imageUrl}
                              alt={activity.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-orange-600 opacity-70" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                          
                          {/* Badge de categoría */}
                          {activity.category && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs bg-white/90 text-orange-700 border-orange-300">
                                {activity.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-orange-800 text-sm line-clamp-2 mb-2">
                            {activity.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(activity.startDate)}
                          </div>
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
                
                {/* Enlace para ver todas las actividades */}
                {park.activities && park.activities.length > 0 && (
                  <div className="text-center pt-4 border-t mt-4">
                    <Link href="/activities">
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver todas las actividades
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Concesiones y Servicios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-600" />
                  Concesiones y Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {park.concessions && park.concessions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {park.concessions.map((concession) => (
                        <Link key={concession.id} href={`/concession/${concession.id}`}>
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group">
                            {/* Imagen de la concesión */}
                            <div className="relative h-40 overflow-hidden">
                              {concession.primaryImage ? (
                                <img 
                                  src={concession.primaryImage} 
                                  alt={concession.vendorName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <Store className="h-12 w-12 text-white opacity-80" />
                                </div>
                              )}
                              
                              {/* Badge del tipo de concesión */}
                              {concession.concessionType && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="text-xs bg-white/90 text-blue-700 border-blue-300">
                                    {concession.concessionType}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Contenido de la tarjeta */}
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Store className="h-4 w-4 text-blue-600" />
                                <h3 className="font-semibold text-gray-900 text-sm">{concession.vendorName}</h3>
                              </div>
                              
                              {concession.typeDescription && (
                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{concession.typeDescription}</p>
                              )}
                              
                              {concession.location && (
                                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{concession.location}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>Desde {format(new Date(concession.startDate), 'MMM yyyy', { locale: es })}</span>
                                </div>
                                {concession.vendorPhone && (
                                  <span className="text-blue-600 font-medium">{concession.vendorPhone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="text-center pt-4 border-t">
                      <Link href="/concessions">
                        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                          <Store className="h-4 w-4 mr-2" />
                          Ver todas las concesiones
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Store className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-600 text-sm">No hay concesiones activas en este parque</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Galería de Imágenes - Movida desde sidebar derecho */}
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
                    {allImages.slice(0, 8).map((image, idx) => (
                      <div 
                        key={idx} 
                        className="relative group overflow-hidden rounded-lg hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => openImageModal(image.imageUrl)}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={image.caption || `Vista del parque ${idx + 1}`}
                          className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-2">
                              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                    {allImages.length > 8 && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium hover:bg-gray-200 cursor-pointer">
                        +{allImages.length - 8} fotos más
                      </div>
                    )}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => {
                      const coords = `${park.latitude},${park.longitude}`;
                      const destination = encodeURIComponent(`${park.name}, ${park.address}`);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${coords}`, '_blank');
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Cómo llegar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => {
                      const coords = `${park.latitude},${park.longitude}`;
                      window.open(`https://www.google.com/maps/@${coords},17z`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver en Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Publicidad Sidebar - Diseño Tipo Tarjeta */}
            <div className="sticky top-4">
              <AdSpace 
                spaceId="2"
                position="card"
                pageType="parks"
              />
            </div>

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
                    
                    <div className="text-center pt-4 border-t">
                      <Link href="/volunteers">
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          <Heart className="h-4 w-4 mr-2" />
                          Ver todos los voluntarios
                        </Button>
                      </Link>
                    </div>
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

            {/* Evaluaciones Ciudadanas */}
            <ParkEvaluationsSectionSimple parkId={park.id} parkSlug={slug || ''} />

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

            {/* Nuevo espacio publicitario - Donde estaba la galería */}
            <div className="sticky top-4">
              <AdSpace 
                spaceId="30"
                position="card"
                pageType="park-landing"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner publicitario después de Galería - Fuera del grid para ancho completo */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-8">
        <AdSpace 
          spaceId="33" 
          position="banner" 
          pageType="park-landing" 
          className="w-full"
        />
      </div>

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-7xl max-h-full flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation buttons */}
            {allImages.length > 1 && !selectedSpeciesData && (
              <>
                <button 
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image */}
            <div className="flex-1">
              <img 
                src={selectedImage} 
                alt={selectedSpeciesData ? selectedSpeciesData.commonName : "Vista ampliada del parque"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Species Technical Information Panel */}
            {selectedSpeciesData && (
              <div className="w-80 bg-white/95 backdrop-blur-sm p-6 overflow-y-auto max-h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {selectedSpeciesData.commonName}
                    </h3>
                    <p className="text-lg text-green-600 italic">
                      {selectedSpeciesData.scientificName}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-green-300 text-green-700">
                        {selectedSpeciesData.family}
                      </Badge>
                      <Badge 
                        variant={selectedSpeciesData.origin === 'Nativo' ? 'default' : 'secondary'}
                      >
                        {selectedSpeciesData.origin}
                      </Badge>
                      {selectedSpeciesData.isEndangered && (
                        <Badge variant="destructive">
                          Amenazada
                        </Badge>
                      )}
                    </div>
                    
                    {selectedSpeciesData.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <Badge 
                          className={
                            selectedSpeciesData.status === 'establecido' ? 'bg-green-100 text-green-800' :
                            selectedSpeciesData.status === 'en_desarrollo' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {selectedSpeciesData.status === 'establecido' ? 'Establecido' :
                           selectedSpeciesData.status === 'en_desarrollo' ? 'En Desarrollo' :
                           'Planificado'}
                        </Badge>
                      </div>
                    )}
                    
                    {(selectedSpeciesData.currentQuantity > 0 || selectedSpeciesData.recommendedQuantity > 0) && (
                      <div className="space-y-2">
                        {selectedSpeciesData.currentQuantity > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Plantados:</span>
                            <span className="font-medium text-green-700">{selectedSpeciesData.currentQuantity}</span>
                          </div>
                        )}
                        {selectedSpeciesData.recommendedQuantity > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Meta:</span>
                            <span className="font-medium text-blue-700">{selectedSpeciesData.recommendedQuantity}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedSpeciesData.plantingZone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Zona de plantación:</span>
                        <span className="font-medium">{selectedSpeciesData.plantingZone}</span>
                      </div>
                    )}
                    
                    {selectedSpeciesData.photoCaption && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">{selectedSpeciesData.photoCaption}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Image counter */}
            {allImages.length > 1 && !selectedSpeciesData && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded-full text-sm">
                {allImages.findIndex(img => img.imageUrl === selectedImage) + 1} de {allImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Actividad Expandida */}
      {isActivityModalOpen && selectedActivityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setIsActivityModalOpen(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-full">
              {/* Imagen principal */}
              <div className="flex-1 relative">
                {selectedActivityData.imageUrl ? (
                  <img 
                    src={selectedActivityData.imageUrl}
                    alt={selectedActivityData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Calendar className="h-32 w-32 text-orange-600 opacity-70" />
                  </div>
                )}
                
                {/* Botón cerrar */}
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-all"
                >
                  ✕
                </button>
              </div>
              
              {/* Panel de información */}
              <div className="w-80 bg-white p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-orange-800 mb-2">{selectedActivityData.title}</h2>
                    {selectedActivityData.category && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        {selectedActivityData.category}
                      </Badge>
                    )}
                  </div>
                  
                  {selectedActivityData.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Descripción</h3>
                      <p className="text-sm text-gray-700">{selectedActivityData.description}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {selectedActivityData.startDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha:</span>
                        <span className="font-medium text-orange-700">{formatDate(selectedActivityData.startDate)}</span>
                      </div>
                    )}
                    
                    {selectedActivityData.startTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hora:</span>
                        <span className="font-medium">{selectedActivityData.startTime}</span>
                      </div>
                    )}
                    
                    {selectedActivityData.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ubicación:</span>
                        <span className="font-medium">{selectedActivityData.location}</span>
                      </div>
                    )}
                    
                    {selectedActivityData.capacity && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Capacidad:</span>
                        <span className="font-medium">{selectedActivityData.capacity} personas</span>
                      </div>
                    )}
                    
                    {selectedActivityData.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duración:</span>
                        <span className="font-medium">{selectedActivityData.duration} minutos</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      {selectedActivityData.price && Number(selectedActivityData.price) > 0 ? (
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          ${Number(selectedActivityData.price).toFixed(2)} MXN
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Gratuita
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {selectedActivityData.requirements && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Requisitos</h3>
                      <p className="text-sm text-gray-700">{selectedActivityData.requirements}</p>
                    </div>
                  )}
                  
                  {selectedActivityData.materials && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Materiales incluidos</h3>
                      <p className="text-sm text-gray-700">{selectedActivityData.materials}</p>
                    </div>
                  )}
                  
                  {selectedActivityData.instructorName && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Instructor</h3>
                      <p className="text-sm text-gray-700">{selectedActivityData.instructorName}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Inscribirse a la actividad
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PublicLayout>
  );
}

export default ParkLandingPage;