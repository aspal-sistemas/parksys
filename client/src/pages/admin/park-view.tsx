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
import { ArrowLeft, MapPin, Clock, TreePine, Calendar, Users, Wrench, AlertTriangle, FileText, Images, Star, Info, Building, Phone, Mail, Globe, Shield, Edit, Trash2, Plus, Filter, SortAsc, Map as MapIcon, Eye, Download } from "lucide-react";
import RoleBasedSidebar from "@/components/RoleBasedSidebar";
import { MapViewer } from "@/components/ui/map-viewer";
import ParkMultimediaManager from "@/components/ParkMultimediaManager";
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
    status: string;
    condition: string;
    lastMaintenance?: string;
    latitude?: number;
    longitude?: number;
    locationDescription?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    notes?: string;
    acquisitionDate?: string;
    acquisitionCost?: string;
    currentValue?: string;
    nextMaintenanceDate?: string;
    amenityId?: number;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para modales de amenidades
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = React.useState(false);
  const [isEditAmenityModalOpen, setIsEditAmenityModalOpen] = React.useState(false);
  const [isViewAmenityModalOpen, setIsViewAmenityModalOpen] = React.useState(false);
  const [editingAmenity, setEditingAmenity] = React.useState<any>(null);
  const [viewingAmenity, setViewingAmenity] = React.useState<any>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Estados para filtros de activos
  const [assetFilters, setAssetFilters] = React.useState({
    category: 'all',
    amenity: 'all',
    status: 'all',
    condition: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Estados para modal de mapa de activos
  const [isAssetMapModalOpen, setIsAssetMapModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null);
  
  // Get complete park data from the main API endpoint that has all fields
  const { data: park, isLoading, error, refetch: refetchPark } = useQuery<ParkDetails>({
    queryKey: [`/api/parks/${id}`, refreshKey],
    enabled: !!id,
  });



  // Obtener amenidades disponibles para agregar
  const { data: availableAmenities } = useQuery({
    queryKey: ['/api/amenities'],
  });

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

  // Funciones de filtrado y ordenamiento para activos
  const getFilteredAndSortedAssets = () => {
    if (!park?.assets) return [];
    
    let filtered = park.assets.filter(asset => {
      const matchesCategory = !assetFilters.category || assetFilters.category === 'all' || asset.category?.toLowerCase().includes(assetFilters.category.toLowerCase());
      const matchesAmenity = !assetFilters.amenity || assetFilters.amenity === 'all' || (asset.amenityId && asset.amenityId.toString() === assetFilters.amenity);
      const matchesStatus = !assetFilters.status || assetFilters.status === 'all' || asset.status?.toLowerCase() === assetFilters.status.toLowerCase();
      const matchesCondition = !assetFilters.condition || assetFilters.condition === 'all' || asset.condition?.toLowerCase() === assetFilters.condition.toLowerCase();
      
      return matchesCategory && matchesAmenity && matchesStatus && matchesCondition;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (assetFilters.sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'condition':
          aValue = a.condition?.toLowerCase() || '';
          bValue = b.condition?.toLowerCase() || '';
          break;
        case 'acquisitionDate':
          aValue = a.acquisitionDate || '';
          bValue = b.acquisitionDate || '';
          break;
        case 'lastMaintenance':
          aValue = a.lastMaintenance || '';
          bValue = b.lastMaintenance || '';
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }
      
      if (assetFilters.sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return filtered;
  };

  const filteredAssets = getFilteredAndSortedAssets();

  // Crear mapas de valores únicos normalizados
  const createUniqueValueMap = (values: (string | undefined)[]) => {
    const uniqueMap = new Map<string, string>();
    values.filter(Boolean).forEach(value => {
      if (value) {
        const lowerKey = value.toLowerCase();
        if (!uniqueMap.has(lowerKey)) {
          uniqueMap.set(lowerKey, value);
        }
      }
    });
    return Array.from(uniqueMap.keys());
  };

  const uniqueCategories = createUniqueValueMap(park?.assets?.map(asset => asset.category) || []);
  const uniqueStatuses = createUniqueValueMap(park?.assets?.map(asset => asset.status) || []);
  const uniqueConditions = createUniqueValueMap(park?.assets?.map(asset => asset.condition) || []);

  const clearAssetFilters = () => {
    setAssetFilters({
      category: 'all',
      amenity: 'all',
      status: 'all',
      condition: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              {/* Filtros para activos */}
              {park.assets && park.assets.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Filtros y Ordenamiento</span>
                    <span className="ml-auto text-sm text-gray-500">
                      ({filteredAssets.length} de {park.assets.length} activos)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Filtro por categoría */}
                    <div>
                      <Select
                        value={assetFilters.category}
                        onValueChange={(value) => setAssetFilters(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {uniqueCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por amenidad */}
                    <div>
                      <Select
                        value={assetFilters.amenity}
                        onValueChange={(value) => setAssetFilters(prev => ({ ...prev, amenity: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los módulos</SelectItem>
                          {park?.amenities?.map(amenity => (
                            <SelectItem key={amenity.id} value={amenity.id.toString()}>
                              {amenity.moduleName || amenity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                      <Select
                        value={assetFilters.status}
                        onValueChange={(value) => setAssetFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {uniqueStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status === 'active' ? 'Activo' : 
                               status === 'activo' ? 'Activo' :
                               status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por condición */}
                    <div>
                      <Select
                        value={assetFilters.condition}
                        onValueChange={(value) => setAssetFilters(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las condiciones</SelectItem>
                          {uniqueConditions.map(condition => (
                            <SelectItem key={condition} value={condition}>
                              {condition === 'excellent' ? 'Excelente' : 
                               condition === 'excelente' ? 'Excelente' :
                               condition === 'good' ? 'Bueno' : 
                               condition === 'bueno' ? 'Bueno' :
                               condition === 'regular' ? 'Regular' : 
                               condition === 'bad' ? 'Malo' : 
                               condition === 'malo' ? 'Malo' :
                               condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordenar por */}
                    <div>
                      <Select
                        value={assetFilters.sortBy}
                        onValueChange={(value) => setAssetFilters(prev => ({ ...prev, sortBy: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nombre</SelectItem>
                          <SelectItem value="category">Categoría</SelectItem>
                          <SelectItem value="condition">Condición</SelectItem>
                          <SelectItem value="acquisitionDate">Fecha de Adquisición</SelectItem>
                          <SelectItem value="lastMaintenance">Último Mantenimiento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dirección de ordenamiento */}
                    <div className="flex gap-2">
                      <Button
                        variant={assetFilters.sortOrder === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAssetFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                        className="flex-1"
                      >
                        <SortAsc className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={assetFilters.sortOrder === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAssetFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                        className="flex-1"
                      >
                        <SortAsc className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>

                  {/* Botón para limpiar filtros */}
                  {(assetFilters.category !== 'all' || assetFilters.status !== 'all' || assetFilters.condition !== 'all' || assetFilters.sortBy !== 'name') && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={clearAssetFilters}>
                        Limpiar Filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {filteredAssets.length === 0 && park.assets && park.assets.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No se encontraron activos</p>
                  <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
                  <Button variant="outline" className="mt-4" onClick={clearAssetFilters}>
                    Limpiar Filtros
                  </Button>
                </div>
              ) : park.assets?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No hay activos registrados</p>
                  <p className="text-sm">Este parque aún no tiene activos asignados.</p>
                  <Link href={`/admin/assets/new?parkId=${id}`}>
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar primer activo
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{asset.name}</h4>
                            <Badge variant={getConditionBadge(asset.condition)}>
                              {asset.condition}
                            </Badge>
                            {asset.status && (
                              <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                                {asset.status === 'active' ? 'Activo' : asset.status}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">Categoría:</span>
                                <span className="text-gray-600">{asset.category || 'Sin categoría'}</span>
                              </div>
                              
                              {asset.serialNumber && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-gray-700">Número de Serie:</span>
                                  <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {asset.serialNumber}
                                  </span>
                                </div>
                              )}
                              
                              {asset.locationDescription && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">Ubicación:</span>
                                  <span className="text-gray-600">{asset.locationDescription}</span>
                                </div>
                              )}
                              
                              {(asset.manufacturer || asset.model) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-gray-700">Fabricante/Modelo:</span>
                                  <span className="text-gray-600">
                                    {[asset.manufacturer, asset.model].filter(Boolean).join(' - ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {asset.acquisitionDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">Fecha de Adquisición:</span>
                                  <span className="text-gray-600">
                                    {new Date(asset.acquisitionDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              
                              {asset.lastMaintenance && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Wrench className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">Último Mantenimiento:</span>
                                  <span className="text-gray-600">
                                    {new Date(asset.lastMaintenance).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              
                              {asset.nextMaintenanceDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">Próximo Mantenimiento:</span>
                                  <span className="text-gray-600">
                                    {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                                  </span>
                                  {new Date(asset.nextMaintenanceDate) < new Date() && (
                                    <Badge variant="destructive" className="ml-2">Vencido</Badge>
                                  )}
                                </div>
                              )}
                              
                              {(asset.acquisitionCost || asset.currentValue) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-gray-700">Valor:</span>
                                  <span className="text-gray-600">
                                    {asset.currentValue 
                                      ? `$${parseFloat(asset.currentValue).toLocaleString()}` 
                                      : asset.acquisitionCost 
                                        ? `$${parseFloat(asset.acquisitionCost).toLocaleString()} (adquisición)`
                                        : 'No especificado'
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {asset.notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">Notas:</span> {asset.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col gap-2">
                          {(asset.latitude && asset.longitude) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setIsAssetMapModalOpen(true);
                              }}
                              title="Ver ubicación en mapa"
                            >
                              <MapIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/admin/assets/${asset.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        <TabsContent value="multimedia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                <Images className="h-6 w-6" />
                Gestión de Multimedia del Parque
              </CardTitle>
              <CardDescription>
                Administra imágenes y documentos del parque. Puedes subir archivos o usar URLs externas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParkMultimediaManager parkId={parseInt(id)} />
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
      </div>
    </div>
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
          <Dialog open={isAddAmenityModalOpen} onOpenChange={setIsAddAmenityModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar módulo</DialogTitle>
                <DialogDescription>
                  Selecciona una amenidad existente para agregar al parque.
                </DialogDescription>
              </DialogHeader>
              <AddAmenityForm 
                availableAmenities={availableAmenities || []}
                onSubmit={(data) => addAmenityMutation.mutate(data)}
                isLoading={addAmenityMutation.isPending}
                onCancel={() => setIsAddAmenityModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
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