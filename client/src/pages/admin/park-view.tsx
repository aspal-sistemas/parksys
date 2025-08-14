import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MapPin, Clock, TreePine, Calendar, Users, Wrench, AlertTriangle, FileText, Images, Star, Info, Building, Phone, Mail, Globe, Shield, Edit, Trash2, Plus, Filter, SortAsc, Map as MapIcon, Eye, Download, Settings } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { MapViewer } from "@/components/ui/map-viewer";
import ParkMultimediaViewer from "@/components/ParkMultimediaViewer";
import ParkTreesInventory from "@/components/ParkTreesInventory";
import ParkAssetsInventory from "@/components/ParkAssetsInventory";
import ParkIncidentsInventory from "@/components/ParkIncidentsInventory";
import ParkVolunteersInventory from "@/components/ParkVolunteersInventory";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Esquema para agregar amenidad a parque
const addAmenitySchema = z.object({
  amenityId: z.number().min(1, "Seleccione una amenidad"),
  moduleName: z.string().min(1, "El nombre del módulo es requerido"),
  surfaceArea: z.string().optional(),
  locationLatitude: z.string().optional(),
  locationLongitude: z.string().optional(),
  status: z.string().default("Activa"),
  description: z.string().optional(),
});

// Esquema para editar amenidad de parque
const editAmenitySchema = z.object({
  moduleName: z.string().min(1, "El nombre del módulo es requerido"),
  surfaceArea: z.string().optional(),
  locationLatitude: z.string().optional(),
  locationLongitude: z.string().optional(),
  status: z.string().default("Activa"),
  description: z.string().optional(),
});

type AddAmenityFormData = z.infer<typeof addAmenitySchema>;
type EditAmenityFormData = z.infer<typeof editAmenitySchema>;

// Función para mapear nombres de iconos a símbolos Unicode
const getIconSymbol = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'playground': '🛝',
    'toilet': '🚽',
    'sportsCourt': '🏀',
    'bicycle': '🚴',
    'pets': '🐕',
    'bench': '🪑',
    'fountain': '⛲',
    'parking': '🚗',
    'security': '🔒',
    'wifi': '📶',
    'restaurant': '🍽️',
    'cafe': '☕',
    'garden': '🌺',
    'lake': '🏞️',
    'trail': '🥾'
  };
  
  return iconMap[iconName] || '📍';
};

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
  greenArea?: string;
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
  trees: {
    data: Array<{
      id: number;
      speciesId: number;
      condition: string;
      plantedDate?: string;
      lastMaintenance?: string;
      locationDescription?: string;
      code?: string;
    }>;
    stats: {
      total: number;
      good: number;
      regular: number;
      bad: number;
    };
  };
  assets: Array<{
    id: number;
    name: string;
    type: string;
    condition: string;
    location: string;
    acquisitionDate?: string;
    lastMaintenanceDate?: string;
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
    totalAssets: number;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para modales de amenidades
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = React.useState(false);
  const [isEditAmenityModalOpen, setIsEditAmenityModalOpen] = React.useState(false);
  const [isViewAmenityModalOpen, setIsViewAmenityModalOpen] = React.useState(false);
  const [editingAmenity, setEditingAmenity] = React.useState<any>(null);
  const [viewingAmenity, setViewingAmenity] = React.useState<any>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Estados para modal de mapa de activos
  const [isAssetMapModalOpen, setIsAssetMapModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null);
  
  // Get complete park data from the details API endpoint that has all fields
  const { data: park, isLoading, error, refetch: refetchPark } = useQuery<ParkDetails>({
    queryKey: [`/api/parks/${id}/details`, refreshKey],
    enabled: !!id,
  });



  // Amenidades disponibles simplificadas - sin consulta automática
  const availableAmenities: any[] = [];

  // Mutación para agregar amenidad al parque
  const addAmenityMutation = useMutation({
    mutationFn: async (data: AddAmenityFormData) => {
      return apiRequest(`/api/parks/${id}/amenities`, {
        method: 'POST',
        data: data,
      });
    },
    onSuccess: () => {
      setIsAddAmenityModalOpen(false);
      toast({
        title: "Amenidad agregada",
        description: "La amenidad se ha agregado al parque exitosamente.",
      });
      
      // Recargar página para mostrar cambios inmediatamente
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la amenidad al parque.",
        variant: "destructive",
      });
    },
  });

  // Mutación para editar amenidad del parque
  const editAmenityMutation = useMutation({
    mutationFn: async ({ amenityId, data }: { amenityId: number; data: EditAmenityFormData }) => {
      return apiRequest(`/api/parks/${id}/amenities/${amenityId}`, {
        method: 'PUT',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      setIsEditAmenityModalOpen(false);
      setEditingAmenity(null);
      toast({
        title: "Amenidad actualizada",
        description: "La amenidad se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la amenidad.",
        variant: "destructive",
      });
    },
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

  // Use the park data directly from the main API
  const displayPark = park;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      pendiente: "secondary",
      critico: "destructive",
      completado: "outline"
    };
    return variants[status.toLowerCase()] || "secondary";
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
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
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{park.stats?.totalAssets || 0}</p>
                <p className="text-sm text-gray-600">Activos</p>
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
          <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Descripción:</span>
                  </div>
                  <p className="text-gray-600">{displayPark.description || 'No especificado'}</p>
                </div>

                {displayPark.area && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-700">Superficie Total:</span>
                    </div>
                    <p className="text-gray-600">{displayPark.area} m²</p>
                  </div>
                )}

                {displayPark.greenArea && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-700">Área Permeable:</span>
                    </div>
                    <p className="text-gray-600">{parseFloat(displayPark.greenArea).toLocaleString()} m²</p>
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
                  <p className="text-gray-600">{displayPark.address || 'No especificado'}</p>
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

                {/* Mapa de Ubicación */}
                {(displayPark.latitude && displayPark.longitude) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Ubicación en el Mapa:</span>
                    </div>
                    <MapViewer
                      latitude={displayPark.latitude}
                      longitude={displayPark.longitude}
                      parkName={displayPark.name}
                      height="300px"
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <AmenitiesTable 
            parkId={parseInt(id || "0")} 
            isAddAmenityModalOpen={isAddAmenityModalOpen}
            setIsAddAmenityModalOpen={setIsAddAmenityModalOpen}
            availableAmenities={availableAmenities || []}
            addAmenityMutation={addAmenityMutation}
            parkData={park}
            isEditAmenityModalOpen={isEditAmenityModalOpen}
            setIsEditAmenityModalOpen={setIsEditAmenityModalOpen}
            editingAmenity={editingAmenity}
            setEditingAmenity={setEditingAmenity}
            isViewAmenityModalOpen={isViewAmenityModalOpen}
            setIsViewAmenityModalOpen={setIsViewAmenityModalOpen}
            viewingAmenity={viewingAmenity}
            setViewingAmenity={setViewingAmenity}
          />
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
              <CardTitle>Inventario de Árboles ({park.trees?.stats?.total || 0})</CardTitle>
              <CardDescription>Estado y estadísticas de árboles en este parque</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Estadísticas generales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{park.trees?.stats?.good || 0}</div>
                  <div className="text-sm text-gray-600">Bueno</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{park.trees?.stats?.regular || 0}</div>
                  <div className="text-sm text-gray-600">Regular</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{park.trees?.stats?.bad || 0}</div>
                  <div className="text-sm text-gray-600">Malo</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{park.trees?.stats?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              {/* Inventario detallado */}
              <ParkTreesInventory parkId={parseInt(id)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Activos ({park.assets?.length || 0})</CardTitle>
                <CardDescription>Equipamiento e infraestructura del parque</CardDescription>
              </div>
              <Link href={`/admin/assets/new?parkId=${id}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Activo
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ParkAssetsInventory 
                parkId={parseInt(id)} 
                assets={park.assets || []} 
                amenities={park.amenities || []} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidencias ({park.stats?.pendingIncidents || 0})</CardTitle>
              <CardDescription>Reportes e incidencias del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <ParkIncidentsInventory 
                parkId={parseInt(id)} 
              />
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
              <ParkVolunteersInventory 
                parkId={parseInt(id)} 
                volunteers={park.volunteers || []} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({displayPark.documents?.length || 0})</CardTitle>
              <CardDescription>Documentos oficiales y archivos del parque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayPark.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="text-sm text-gray-500">
                          <span>{doc.fileType || 'PDF'}</span> • 
                          <span> {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}</span>
                          {doc.fileSize && <span> • {(parseInt(doc.fileSize) / 1024).toFixed(0)} KB</span>}
                        </div>
                      </div>
                    </div>
                    <a href={doc.fileUrl || doc.downloadUrl || '#'} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </a>
                  </div>
                ))}
                
                {!displayPark.documents?.length && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay documentos disponibles para este parque</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multimedia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                <Images className="h-6 w-6" />
                Multimedia del Parque
              </CardTitle>
              <CardDescription>
                Visualiza las imágenes y documentos del parque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParkMultimediaViewer parkId={parseInt(id)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para agregar amenidad */}
      <Dialog open={isAddAmenityModalOpen} onOpenChange={setIsAddAmenityModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar módulo</DialogTitle>
          </DialogHeader>
          <AddAmenityForm
            availableAmenities={availableAmenities || []}
            onSubmit={(data) => addAmenityMutation.mutate(data)}
            isLoading={addAmenityMutation.isPending}
            onCancel={() => setIsAddAmenityModalOpen(false)}
            parkData={park}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar amenidad */}
      <Dialog open={isEditAmenityModalOpen} onOpenChange={setIsEditAmenityModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Módulo de Amenidad</DialogTitle>
            <DialogDescription>
              Modifique la configuración del módulo de amenidad seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingAmenity && (
            <EditAmenityForm
              amenity={editingAmenity}
              onSubmit={(data) => editAmenityMutation.mutate({ amenityId: editingAmenity.parkAmenityId, data })}
              isLoading={editAmenityMutation.isPending}
              onCancel={() => {
                setIsEditAmenityModalOpen(false);
                setEditingAmenity(null);
              }}
              parkData={park}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles de amenidad */}
      <Dialog open={isViewAmenityModalOpen} onOpenChange={setIsViewAmenityModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Módulo de Amenidad</DialogTitle>
          </DialogHeader>
          {viewingAmenity && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Amenidad</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIconSymbol(viewingAmenity.amenityIcon)}</span>
                    <p className="font-semibold">
                      {viewingAmenity.amenityName || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Módulo</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{viewingAmenity.moduleName || 'Sin nombre'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Superficie (m²)</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{viewingAmenity.surfaceArea ? `${viewingAmenity.surfaceArea} m²` : 'No especificada'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingAmenity.status === 'Activa' ? 'bg-green-100 text-green-800' :
                    viewingAmenity.status === 'Inactiva' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingAmenity.status || 'Sin estado'}
                  </span>
                </div>
              </div>

              {(viewingAmenity.locationLatitude && viewingAmenity.locationLongitude) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación en el Parque</label>
                  <div className="border rounded-lg p-3 bg-white overflow-hidden">
                    <div className="w-full h-48 relative mb-2">
                      <MapViewer
                        latitude={parseFloat(park?.latitude || "20.6597")}
                        longitude={parseFloat(park?.longitude || "-103.3496")}
                        parkName={park?.name || "Parque"}
                        height="192px"
                        selectedLocation={{
                          lat: parseFloat(viewingAmenity.locationLatitude),
                          lng: parseFloat(viewingAmenity.locationLongitude)
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      📍 {parseFloat(viewingAmenity.locationLatitude).toFixed(6)}, {parseFloat(viewingAmenity.locationLongitude).toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {viewingAmenity.description && (
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{viewingAmenity.description}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Creación</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    {viewingAmenity.createdAt ? new Date(viewingAmenity.createdAt).toLocaleDateString('es-MX') : 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewAmenityModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar ubicación del activo en mapa */}
      <Dialog open={isAssetMapModalOpen} onOpenChange={setIsAssetMapModalOpen}>
        <DialogContent className="max-w-4xl h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ubicación del Activo: {selectedAsset?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedAsset?.locationDescription && (
                <span className="text-sm text-gray-600">
                  {selectedAsset.locationDescription}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && selectedAsset.latitude && selectedAsset.longitude && (
            <div className="flex-1 h-full">
              <MapViewer
                latitude={selectedAsset.latitude}
                longitude={selectedAsset.longitude}
                parkName={selectedAsset.name}
                height="500px"
                className="w-full"
              />
              
              {/* Información adicional del activo debajo del mapa */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Categoría:</span>
                    <span className="ml-2 text-sm text-gray-600">{selectedAsset.category || 'Sin categoría'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`ml-2 inline-block px-2 py-1 text-xs rounded ${
                      selectedAsset.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                      selectedAsset.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                      selectedAsset.condition === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedAsset.condition === 'excellent' ? 'Excelente' :
                       selectedAsset.condition === 'good' ? 'Bueno' :
                       selectedAsset.condition === 'regular' ? 'Regular' :
                       selectedAsset.condition === 'poor' ? 'Malo' : 
                       selectedAsset.condition}
                    </span>
                  </div>
                  {selectedAsset.locationDescription && (
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-gray-700">Descripción de ubicación:</span>
                      <p className="mt-1 text-sm text-gray-600">{selectedAsset.locationDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAssetMapModalOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

// Component for displaying amenities in a table format
interface AmenitiesTableProps {
  parkId: number;
  isAddAmenityModalOpen: boolean;
  setIsAddAmenityModalOpen: (open: boolean) => void;
  availableAmenities: any[];
  addAmenityMutation: any;
  parkData?: ParkDetails;
  isEditAmenityModalOpen: boolean;
  setIsEditAmenityModalOpen: (open: boolean) => void;
  editingAmenity: any;
  setEditingAmenity: (amenity: any) => void;
  isViewAmenityModalOpen: boolean;
  setIsViewAmenityModalOpen: (open: boolean) => void;
  viewingAmenity: any;
  setViewingAmenity: (amenity: any) => void;
}

const AmenitiesTable = ({ 
  parkId, 
  isAddAmenityModalOpen, 
  setIsAddAmenityModalOpen, 
  availableAmenities, 
  addAmenityMutation, 
  parkData,
  isEditAmenityModalOpen,
  setIsEditAmenityModalOpen,
  editingAmenity,
  setEditingAmenity,
  isViewAmenityModalOpen,
  setIsViewAmenityModalOpen,
  viewingAmenity,
  setViewingAmenity
}: AmenitiesTableProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Use amenities data from parkData instead of separate query
  const amenitiesArray = Array.isArray(parkData?.amenities) ? parkData.amenities.map(amenity => ({
    ...amenity,
    amenityName: amenity.name,
    amenityIcon: amenity.icon
  })) : [];
  
  const isLoading = !parkData;
  const error = false;

  // Mutation para eliminar amenidad
  const deleteAmenityMutation = useMutation({
    mutationFn: async (amenityId: number) => {
      await apiRequest(`/api/park-amenities/${amenityId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Amenidad eliminada",
        description: "La amenidad ha sido eliminada exitosamente.",
      });
      // Recargar página para mostrar cambios inmediatamente
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la amenidad.",
        variant: "destructive",
      });
    },
  });

  // Mutation para editar amenidad
  const editAmenityMutation = useMutation({
    mutationFn: async ({ amenityId, data }: { amenityId: number; data: EditAmenityFormData }) => {
      return apiRequest(`/api/parks/${parkId}/amenities/${amenityId}`, {
        method: 'PUT',
        data: data,
      });
    },
    onSuccess: () => {
      setIsEditAmenityModalOpen(false);
      setEditingAmenity(null);
      toast({
        title: "Amenidad actualizada",
        description: "La amenidad se ha actualizado exitosamente.",
      });
      
      // Recargar página para mostrar cambios inmediatamente
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la amenidad.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenidades del Parque</CardTitle>
          <CardDescription>Cargando servicios e infraestructura...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenidades del Parque</CardTitle>
          <CardDescription>Error al cargar las amenidades</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">No se pudieron cargar las amenidades del parque.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Amenidades del Parque ({amenitiesArray.length})</CardTitle>
            <CardDescription>Servicios e infraestructura disponible</CardDescription>
          </div>

        </div>
      </CardHeader>
      <CardContent>
        {amenitiesArray.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Módulo</TableHead>
                <TableHead>Amenidad</TableHead>
                <TableHead>Superficie (m²)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenitiesArray.map((amenity: any) => (
                <TableRow key={amenity.id}>
                  <TableCell>
                    <span className="font-medium">{amenity.moduleName || '-'}</span>
                    {amenity.locationLatitude && amenity.locationLongitude && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {parseFloat(amenity.locationLatitude).toFixed(6)}, {parseFloat(amenity.locationLongitude).toFixed(6)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <span className="text-xl">{getIconSymbol(amenity.amenityIcon)}</span>
                    <span className="font-medium">{amenity.amenityName}</span>
                  </TableCell>
                  <TableCell>
                    {amenity.surfaceArea ? `${parseFloat(amenity.surfaceArea).toLocaleString()} m²` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={amenity.status === 'Activa' ? 'default' : 
                               amenity.status === 'Mantenimiento' ? 'secondary' : 'destructive'}
                    >
                      {amenity.status || 'Activa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setViewingAmenity(amenity);
                          setIsViewAmenityModalOpen(true);
                        }}
                        title="Ver detalles"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingAmenity(amenity);
                          setIsEditAmenityModalOpen(true);
                        }}
                        title="Editar amenidad"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar amenidad?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la amenidad "{amenity.moduleName}" 
                              del parque. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAmenityMutation.mutate(amenity.parkAmenityId)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteAmenityMutation.isPending}
                            >
                              {deleteAmenityMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 italic">No hay amenidades registradas para este parque.</p>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para el formulario de agregar amenidad
interface AddAmenityFormProps {
  availableAmenities: any[];
  onSubmit: (data: AddAmenityFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  parkData?: ParkDetails;
}

function AddAmenityForm({ availableAmenities, onSubmit, isLoading, onCancel, parkData }: AddAmenityFormProps) {
  const form = useForm<AddAmenityFormData>({
    resolver: zodResolver(addAmenitySchema),
    defaultValues: {
      amenityId: 0,
      moduleName: "",
      surfaceArea: "",
      locationLatitude: "",
      locationLongitude: "",
      status: "Activa",
      description: "",
    },
  });

  // Handler para actualizar coordenadas desde el mapa
  const handleMapClick = (lat: number, lng: number) => {
    form.setValue("locationLatitude", lat.toString());
    form.setValue("locationLongitude", lng.toString());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amenityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenidad</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una amenidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableAmenities.map((amenity) => (
                    <SelectItem key={amenity.id} value={amenity.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{getIconSymbol(amenity.icon)}</span>
                        <span>{amenity.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moduleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Módulo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Módulo Central, Área Norte..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="surfaceArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Superficie (m²)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="locationLatitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 20.6597" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationLongitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: -103.3496" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción adicional..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sección del mapa interactivo */}
        <div className="space-y-2">
          <FormLabel>Ubicación en el Parque (opcional)</FormLabel>
          <p className="text-sm text-gray-600">Haz clic en el mapa para seleccionar la ubicación del módulo</p>
          <div className="h-64 border rounded-lg overflow-hidden">
            {parkData && (
              <MapViewer
                latitude={parkData.latitude || 20.6597}
                longitude={parkData.longitude || -103.3496}
                parkName={parkData.name}
                height="256px"
                onMapClick={(lat, lng) => {
                  form.setValue("locationLatitude", lat.toString());
                  form.setValue("locationLongitude", lng.toString());
                }}
                selectedLocation={
                  form.watch("locationLatitude") && form.watch("locationLongitude")
                    ? {
                        lat: parseFloat(form.watch("locationLatitude")),
                        lng: parseFloat(form.watch("locationLongitude"))
                      }
                    : null
                }
              />
            )}
          </div>
          {form.watch("locationLatitude") && form.watch("locationLongitude") && (
            <p className="text-xs text-green-600">
              Coordenadas seleccionadas: {form.watch("locationLatitude")}, {form.watch("locationLongitude")}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Agregando...' : 'Agregar Amenidad'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Componente para el formulario de editar amenidad
interface EditAmenityFormProps {
  amenity: any;
  onSubmit: (data: EditAmenityFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  parkData?: ParkDetails;
}

function EditAmenityForm({ amenity, onSubmit, isLoading, onCancel, parkData }: EditAmenityFormProps) {
  const form = useForm<EditAmenityFormData>({
    resolver: zodResolver(editAmenitySchema),
    defaultValues: {
      moduleName: amenity.moduleName || "",
      surfaceArea: amenity.surfaceArea || "",
      locationLatitude: amenity.locationLatitude || "",
      locationLongitude: amenity.locationLongitude || "",
      status: amenity.status || "Activa",
      description: amenity.description || "",
    },
  });

  // Handler para actualizar coordenadas desde el mapa
  const handleMapClick = (lat: number, lng: number) => {
    form.setValue("locationLatitude", lat.toString());
    form.setValue("locationLongitude", lng.toString());
  };

  const handleSubmit = (data: EditAmenityFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getIconSymbol(amenity.amenityIcon)}</span>
            <div>
              <h3 className="font-semibold text-blue-900">{amenity.amenityName}</h3>
              <p className="text-sm text-blue-700">Editando módulo de amenidad</p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="moduleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Módulo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cancha de Fútbol Norte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="surfaceArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Superficie (m²)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="locationLatitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 20.6597" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationLongitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: -103.3496" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción adicional..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sección del mapa interactivo */}
        <div className="space-y-2">
          <FormLabel>Ubicación en el Parque (opcional)</FormLabel>
          <p className="text-sm text-gray-600">Haz clic en el mapa para actualizar la ubicación del módulo</p>
          <div className="h-64 border rounded-lg overflow-hidden">
            {parkData && (
              <MapViewer
                latitude={parkData.latitude || 20.6597}
                longitude={parkData.longitude || -103.3496}
                parkName={parkData.name}
                height="256px"
                onMapClick={handleMapClick}
                selectedLocation={
                  form.watch("locationLatitude") && form.watch("locationLongitude")
                    ? {
                        lat: parseFloat(form.watch("locationLatitude") || "0"),
                        lng: parseFloat(form.watch("locationLongitude") || "0")
                      }
                    : null
                }
              />
            )}
          </div>
          {form.watch("locationLatitude") && form.watch("locationLongitude") && (
            <p className="text-xs text-green-600">
              Coordenadas actuales: {form.watch("locationLatitude")}, {form.watch("locationLongitude")}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}