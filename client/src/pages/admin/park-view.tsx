import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Clock, TreePine, Calendar, Users, Wrench, AlertTriangle, FileText, Images, Star, Info, Building, Phone, Mail, Globe, Shield } from "lucide-react";
import RoleBasedSidebar from "@/components/RoleBasedSidebar";

interface ParkDetails {
  id: number;
  name: string;
  location: string;
  openingHours: string;
  description: string;
  municipalityId: number;
  municipality: { name: string };
  
  // Additional basic park information
  parkType?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  foundationYear?: number;
  administrator?: string;
  conservationStatus?: string;
  regulationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  videoUrl?: string;

  amenities: Array<{
    id: number;
    name: string;
    icon: string;
    description: string;
  }>;
  activities: Array<{
    id: number;
    title: string;
    description: string;
    startDate: string;
    instructorName?: string;
    participantCount: number;
  }>;
  trees: Array<{
    id: number;
    species: string;
    condition: string;
    plantedDate: string;
    lastMaintenance?: string;
  }>;
  assets: Array<{
    id: number;
    name: string;
    category: string;
    condition: string;
    lastMaintenance?: string;
  }>;
  incidents: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  documents: Array<{
    id: number;
    title: string;
    type: string;
    uploadedAt: string;
  }>;
  images: Array<{
    id: number;
    imageUrl: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  evaluations: Array<{
    id: number;
    score: number;
    comments: string;
    evaluatedAt: string;
    evaluatorName: string;
  }>;
  volunteers: Array<{
    id: number;
    fullName: string;
    skills: string;
    isActive: boolean;
  }>;
  stats: {
    totalActivities: number;
    activeVolunteers: number;
    totalTrees: number;
    averageEvaluation: number;
    pendingIncidents: number;
  };
}

// Función para formatear horarios de JSON a texto legible con saltos de línea
function formatOpeningHours(openingHours: string | null): JSX.Element {
  if (!openingHours) return <span>No especificado</span>;
  
  try {
    const schedule = JSON.parse(openingHours);
    const dayNames = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    
    const enabledDays = Object.entries(schedule)
      .filter(([_, dayInfo]: [string, any]) => dayInfo.enabled)
      .map(([day, dayInfo]: [string, any]) => 
        `${dayNames[day as keyof typeof dayNames]}: ${dayInfo.openTime} - ${dayInfo.closeTime}`
      );
    
    if (enabledDays.length === 0) {
      return <span>Cerrado todos los días</span>;
    }
    
    return (
      <div className="space-y-1">
        {enabledDays.map((daySchedule, index) => (
          <div key={index} className="text-gray-600">{daySchedule}</div>
        ))}
      </div>
    );
  } catch {
    return <span>{openingHours}</span>;
  }
}

export default function AdminParkView() {
  const { id } = useParams();
  
  // Get detailed park information from the same endpoint as the edit page
  const { data: parkBasic, isLoading: parkLoading } = useQuery({
    queryKey: [`/api/parks/${id}`],
    enabled: !!id,
  });
  
  // Get extended park data for the tabs (amenities, activities, etc.)
  const { data: park, isLoading, error } = useQuery<ParkDetails>({
    queryKey: ['/api/parks', id, 'view'],
    queryFn: () => fetch(`/api/parks/${id}/view`).then(res => res.json()),
    enabled: !!id,
  });

  // Combine basic park data with extended data for complete information
  // Combine data properly ensuring municipality info is preserved
  const combinedPark = park && parkBasic ? { 
    ...park, 
    ...parkBasic,
    // Ensure municipality from parkBasic is preserved
    municipality: parkBasic.municipality || park.municipality
  } : park;

  if (isLoading || parkLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || (!park && !parkBasic)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Parque no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar la información del parque.</p>
          <Link href="/admin/parks">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Parques
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use combined data with priority: combinedPark > parkBasic > park
  const displayPark = combinedPark || parkBasic || park;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      pendiente: "secondary",
      critico: "destructive",
      completado: "outline"
    };
    return variants[status.toLowerCase()] || "secondary";
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      excelente: "default",
      bueno: "default", 
      regular: "secondary",
      malo: "destructive"
    };
    return variants[condition.toLowerCase()] || "secondary";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/parks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayPark.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {displayPark.address || displayPark.location} • {displayPark.municipality?.name || 'Municipio no encontrado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/parks/${id}/edit`}>
            <Button>Editar Parque</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{displayPark.stats?.totalActivities || 0}</p>
                <p className="text-sm text-gray-600">Actividades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{park.stats?.activeVolunteers || 0}</p>
                <p className="text-sm text-gray-600">Voluntarios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TreePine className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{park.stats?.totalTrees || 0}</p>
                <p className="text-sm text-gray-600">Árboles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{park.stats?.averageEvaluation?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Evaluación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{park.stats?.pendingIncidents || 0}</p>
                <p className="text-sm text-gray-600">Incidencias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="basic-info">Información</TabsTrigger>
          <TabsTrigger value="amenities">Amenidades</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="trees">Árboles</TabsTrigger>
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="incidents">Incidencias</TabsTrigger>
          <TabsTrigger value="volunteers">Voluntarios</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-700">Tipo de Parque:</span>
                  </div>
                  <p className="text-gray-600">{displayPark.parkType || 'No especificado'}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Horarios:</span>
                  </div>
                  {formatOpeningHours(displayPark.openingHours)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Descripción:</span>
                  </div>
                  <p className="text-gray-600">{displayPark.description || 'No especificado'}</p>
                </div>

                {displayPark.area && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-700">Área:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.area} m²</p>
                  </div>
                )}

                {displayPark.foundationYear && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Año de Fundación:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.foundationYear}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de Contacto y Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Ubicación y Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Municipio:</span>
                  </div>
                  <p className="text-gray-600">{displayPark.municipality?.name || 'No especificado'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Dirección:</span>
                  </div>
                  <p className="text-gray-600">{displayPark.address || displayPark.location || 'No especificado'}</p>
                </div>

                {displayPark.postalCode && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-700">Código Postal:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.postalCode}</p>
                  </div>
                )}

                {displayPark.contactPhone && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Teléfono:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.contactPhone}</p>
                  </div>
                )}

                {displayPark.contactEmail && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Correo Electrónico:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.contactEmail}</p>
                  </div>
                )}

                {(displayPark.latitude && displayPark.longitude) && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Coordenadas:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.latitude}, {displayPark.longitude}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayPark.administrator && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Administrador:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.administrator}</p>
                  </div>
                )}

                {displayPark.conservationStatus && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-700">Estado de Conservación:</span>
                    </div>
                    <Badge variant={displayPark.conservationStatus === 'bueno' ? 'default' : 'secondary'}>
                      {displayPark.conservationStatus}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enlaces y Recursos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  Enlaces y Recursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {park.regulationUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Reglamento:</span>
                    </div>
                    <a 
                      href={park.regulationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver reglamento
                    </a>
                  </div>
                )}

                {park.videoUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Video:</span>
                    </div>
                    <a 
                      href={park.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver video del parque
                    </a>
                  </div>
                )}

                {!park.regulationUrl && !park.videoUrl && (
                  <p className="text-gray-500 italic">No hay enlaces disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amenidades del Parque ({park.amenities?.length || 0})</CardTitle>
              <CardDescription>Servicios e infraestructura disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {park.amenities?.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-2xl">{amenity.icon}</div>
                    <div>
                      <h4 className="font-medium">{amenity.name}</h4>
                      <p className="text-sm text-gray-600">{amenity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividades ({park.activities?.length || 0})</CardTitle>
              <CardDescription>Actividades programadas en este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.activities?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(activity.startDate).toLocaleDateString()}</span>
                        {activity.instructorName && <span>👨‍🏫 {activity.instructorName}</span>}
                        <span>👥 {activity.participantCount} participantes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Árboles ({park.trees?.length || 0})</CardTitle>
              <CardDescription>Árboles registrados en este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.trees?.map((tree) => (
                  <div key={tree.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{tree.species}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>🌱 Plantado: {new Date(tree.plantedDate).toLocaleDateString()}</span>
                        {tree.lastMaintenance && (
                          <span>🔧 Último mantenimiento: {new Date(tree.lastMaintenance).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={getConditionBadge(tree.condition)}>
                      {tree.condition}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activos ({park.assets?.length || 0})</CardTitle>
              <CardDescription>Equipamiento e infraestructura del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.assets?.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{asset.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>📂 {asset.category}</span>
                        {asset.lastMaintenance && (
                          <span>🔧 Último mantenimiento: {new Date(asset.lastMaintenance).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={getConditionBadge(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidencias ({park.incidents?.length || 0})</CardTitle>
              <CardDescription>Reportes e incidencias del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.incidents?.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{incident.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusBadge(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Badge variant={incident.priority === 'alta' ? 'destructive' : 'secondary'}>
                        {incident.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voluntarios ({park.volunteers?.length || 0})</CardTitle>
              <CardDescription>Voluntarios asignados a este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.volunteers?.map((volunteer) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{volunteer.fullName}</h4>
                      <p className="text-sm text-gray-600">{volunteer.skills}</p>
                    </div>
                    <Badge variant={volunteer.isActive ? 'default' : 'secondary'}>
                      {volunteer.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({park.documents?.length || 0})</CardTitle>
              <CardDescription>Documentos oficiales y archivos del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="text-sm text-gray-500">
                          <span>{doc.type}</span> • 
                          <span> {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Galería de Imágenes ({park.images?.length || 0})</CardTitle>
              <CardDescription>Fotos del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {park.images?.map((image) => (
                  <div key={image.id} className="relative">
                    <img 
                      src={image.imageUrl} 
                      alt={image.caption || 'Imagen del parque'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2">
                        Principal
                      </Badge>
                    )}
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}