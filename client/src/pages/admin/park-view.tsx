import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Clock, TreePine, Calendar, Users, Wrench, AlertTriangle, FileText, Images, Star } from "lucide-react";

interface ParkDetails {
  id: number;
  name: string;
  location: string;
  openingHours: string;
  description: string;
  municipalityId: number;
  municipality: { name: string };
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

export default function AdminParkView() {
  const { id } = useParams();
  
  const { data: park, isLoading, error } = useQuery<ParkDetails>({
    queryKey: ['/api/parks', id, 'details'],
    enabled: !!id,
  });

  if (isLoading) {
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

  if (error || !park) {
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
            <h1 className="text-2xl font-bold text-gray-900">{park.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {park.location} • {park.municipality.name}
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
                <p className="text-2xl font-bold">{park.stats.totalActivities}</p>
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
                <p className="text-2xl font-bold">{park.stats.activeVolunteers}</p>
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
                <p className="text-2xl font-bold">{park.stats.totalTrees}</p>
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
                <p className="text-2xl font-bold">{park.stats.averageEvaluation.toFixed(1)}</p>
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
                <p className="text-2xl font-bold">{park.stats.pendingIncidents}</p>
                <p className="text-sm text-gray-600">Incidencias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Horarios de Operación</span>
              </div>
              <p className="text-gray-700">{park.openingHours}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Descripción</span>
              </div>
              <p className="text-gray-700">{park.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="amenities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="amenities">Amenidades</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="trees">Árboles</TabsTrigger>
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="incidents">Incidencias</TabsTrigger>
          <TabsTrigger value="volunteers">Voluntarios</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
        </TabsList>

        <TabsContent value="amenities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amenidades del Parque ({park.amenities.length})</CardTitle>
              <CardDescription>Servicios e infraestructura disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {park.amenities.map((amenity) => (
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
              <CardTitle>Actividades ({park.activities.length})</CardTitle>
              <CardDescription>Actividades programadas en este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.activities.map((activity) => (
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
              <CardTitle>Inventario de Árboles ({park.trees.length})</CardTitle>
              <CardDescription>Árboles registrados en este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.trees.map((tree) => (
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
              <CardTitle>Activos ({park.assets.length})</CardTitle>
              <CardDescription>Equipamiento e infraestructura del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.assets.map((asset) => (
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
              <CardTitle>Incidencias ({park.incidents.length})</CardTitle>
              <CardDescription>Reportes e incidencias del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.incidents.map((incident) => (
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
              <CardTitle>Voluntarios ({park.volunteers.length})</CardTitle>
              <CardDescription>Voluntarios asignados a este parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.volunteers.map((volunteer) => (
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
              <CardTitle>Documentos ({park.documents.length})</CardTitle>
              <CardDescription>Documentos oficiales y archivos del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {park.documents.map((doc) => (
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
              <CardTitle>Galería de Imágenes ({park.images.length})</CardTitle>
              <CardDescription>Fotos del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {park.images.map((image) => (
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
  );
}