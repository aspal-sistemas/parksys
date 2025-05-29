import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileUp, Trash2, Eye, Edit, X, MapPin, Users, Calendar, Package, AlertTriangle, TreePine, Activity, Camera, FileText, UserCheck, Wrench } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";

interface Park {
  id: number;
  name: string;
  description?: string;
  address: string;
  area: number;
  parkType: string;
  municipalityId: number;
  municipality?: { name: string };
  createdAt: string;
  updatedAt: string;
}

interface ParkDependencies {
  trees: number;
  treeMaintenances: number;
  activities: number;
  incidents: number;
  amenities: number;
  images: number;
  assets: number;
  volunteers: number;
  instructors: number;
  evaluations: number;
  documents: number;
  total: number;
}

const AdminParks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('all');
  const [filterParkType, setFilterParkType] = useState<string>('all');
  const [filterAmenity, setFilterAmenity] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parkToDelete, setParkToDelete] = useState<Park | null>(null);
  const [parkDependencies, setParkDependencies] = useState<ParkDependencies | null>(null);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  // Effect to handle URL parameters for amenity filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amenityParam = urlParams.get('amenity');
    if (amenityParam) {
      setFilterAmenity(amenityParam);
    }
  }, []);

  // Fetch all parks with automatic refresh
  const { 
    data: parks = [], 
    isLoading: isLoadingParks,
    isError: isErrorParks,
    refetch: refetchParks
  } = useQuery({
    queryKey: ['/api/parks'],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch municipalities for filter
  const { 
    data: municipalities = [] 
  } = useQuery({
    queryKey: ['/api/municipalities'],
  });

  // Fetch amenities for filter
  const { 
    data: amenities = [] 
  } = useQuery({
    queryKey: ['/api/amenities'],
  });

  // Fetch parks with amenities for filtering using optimized endpoint
  const { 
    data: parkAmenities = [] 
  } = useQuery({
    queryKey: ['/api/parks-with-amenities'],
  });

  // Function to fetch park dependencies
  const fetchParkDependencies = async (parkId: number) => {
    setLoadingDependencies(true);
    try {
      const response = await fetch(`/api/parks/${parkId}/dependencies`);
      if (!response.ok) throw new Error('Error al obtener dependencias');
      const dependencies = await response.json();
      setParkDependencies(dependencies);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      setParkDependencies(null);
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (parkId: number) => {
      await apiRequest(`/api/parks/${parkId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parks'] });
      toast({
        title: "Parque eliminado",
        description: "El parque y todas sus dependencias han sido eliminados exitosamente.",
      });
      setShowDeleteDialog(false);
      setParkToDelete(null);
      setParkDependencies(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el parque.",
        variant: "destructive",
      });
    },
  });

  // Filter and sort parks
  const filteredParks = React.useMemo(() => {
    return (parks as Park[]).filter(park => {
      // Apply search filter
      if (searchQuery && !park.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply municipality filter
      if (filterMunicipality !== 'all' && park.municipalityId?.toString() !== filterMunicipality) {
        return false;
      }
      
      // Apply park type filter
      if (filterParkType !== 'all' && park.parkType !== filterParkType) {
        return false;
      }
      
      // Apply amenity filter
      if (filterAmenity !== 'all') {
        const parkAmenityData = (parkAmenities as any[]).find((pa: any) => pa.parkId === park.id);
        if (!parkAmenityData || !parkAmenityData.amenityIds.includes(parseInt(filterAmenity))) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [parks, searchQuery, filterMunicipality, filterParkType, filterAmenity, parkAmenities]);

  // Get municipality name by ID
  const getMunicipalityName = (municipalityId: number) => {
    const municipality = (municipalities as any[])?.find((m: any) => m.id === municipalityId);
    return municipality ? municipality.name : 'Desconocido';
  };

  // Get park type display label
  const getParkTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'metropolitano': 'Metropolitano',
      'barrial': 'Barrial',
      'vecinal': 'Vecinal',
      'lineal': 'Lineal',
      'ecologico': 'Ecológico',
      'botanico': 'Botánico',
      'deportivo': 'Deportivo'
    };
    return typeMap[type] || type;
  };



  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterMunicipality('all');
    setFilterParkType('all');
    setFilterAmenity('all');
  };

  // Handle opening delete dialog
  const handleDeleteClick = async (park: Park) => {
    setParkToDelete(park);
    setShowDeleteDialog(true);
    await fetchParkDependencies(park.id);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!parkToDelete) return;
    deleteMutation.mutate(parkToDelete.id);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await refetchParks();
    toast({
      title: "Lista actualizada",
      description: "La lista de parques se ha actualizado correctamente.",
    });
  };

  if (isLoadingParks) {
    return (
      <AdminLayout title="Administración de Parques">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando parques...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isErrorParks) {
    return (
      <AdminLayout title="Administración de Parques">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error al cargar los parques</p>
            <Button onClick={handleRefresh} className="mt-4">
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Administración de Parques">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Parques</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/admin/parks-import"}>
              <FileUp className="h-4 w-4 mr-2" />
              Importar Parques
            </Button>
            <Button onClick={() => window.location.href = "/admin/parks/new"}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Parque
            </Button>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar parques..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterMunicipality} onValueChange={setFilterMunicipality}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Municipio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los municipios</SelectItem>
              {(municipalities as any[])?.map((municipality: any) => (
                <SelectItem key={municipality.id} value={municipality.id.toString()}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterParkType} onValueChange={setFilterParkType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="metropolitano">Metropolitano</SelectItem>
              <SelectItem value="barrial">Barrial</SelectItem>
              <SelectItem value="vecinal">Vecinal</SelectItem>
              <SelectItem value="lineal">Lineal</SelectItem>
              <SelectItem value="ecologico">Ecológico</SelectItem>
              <SelectItem value="botanico">Botánico</SelectItem>
              <SelectItem value="deportivo">Deportivo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAmenity} onValueChange={setFilterAmenity}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Amenidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las amenidades</SelectItem>
              {(amenities as any[])?.map((amenity: any) => (
                <SelectItem key={amenity.id} value={amenity.id.toString()}>
                  {amenity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchQuery || filterMunicipality !== 'all' || filterParkType !== 'all' || filterAmenity !== 'all') && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Parks grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParks.map((park: Park) => (
            <Card key={park.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{park.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getMunicipalityName(park.municipalityId)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {getParkTypeLabel(park.parkType)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{park.address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>{park.area.toLocaleString()} m²</span>
                  </div>
                  
                  {park.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {park.description}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/parks/${park.id}/view`}
                      title="Ver detalles del parque"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/parks/${park.id}/edit`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(park)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredParks.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay parques</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterMunicipality !== 'all' || filterParkType !== 'all'
                ? "No se encontraron parques que coincidan con los filtros."
                : "Comienza agregando un nuevo parque."}
            </p>
            {(!searchQuery && filterMunicipality === 'all' && filterParkType === 'all') && (
              <div className="mt-6">
                <Button onClick={() => window.location.href = "/admin/parks/new"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Parque
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog with dependencies warning */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <AlertDialogTitle className="text-xl">¡Advertencia! Eliminación Completa</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Esta acción eliminará permanentemente el parque <strong>"{parkToDelete?.name}"</strong> y 
                  <strong className="text-red-600"> TODOS sus elementos relacionados</strong>.
                </p>
                
                {loadingDependencies ? (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Analizando dependencias...</span>
                  </div>
                ) : parkDependencies ? (
                  <div className="space-y-3">
                    <p className="font-medium text-gray-800">Se eliminarán los siguientes elementos:</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {parkDependencies.trees > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <TreePine className="h-4 w-4 text-green-600" />
                          <span>{parkDependencies.trees} árboles</span>
                        </div>
                      )}
                      {parkDependencies.treeMaintenances > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          <span>{parkDependencies.treeMaintenances} mantenimientos</span>
                        </div>
                      )}
                      {parkDependencies.activities > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <span>{parkDependencies.activities} actividades</span>
                        </div>
                      )}
                      {parkDependencies.incidents > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>{parkDependencies.incidents} incidencias</span>
                        </div>
                      )}
                      {parkDependencies.amenities > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <Package className="h-4 w-4 text-orange-600" />
                          <span>{parkDependencies.amenities} amenidades</span>
                        </div>
                      )}
                      {parkDependencies.images > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <Camera className="h-4 w-4 text-pink-600" />
                          <span>{parkDependencies.images} imágenes</span>
                        </div>
                      )}
                      {parkDependencies.documents > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span>{parkDependencies.documents} documentos</span>
                        </div>
                      )}
                      {(parkDependencies.volunteers > 0 || parkDependencies.instructors > 0) && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <UserCheck className="h-4 w-4 text-amber-600" />
                          <span>{parkDependencies.volunteers + parkDependencies.instructors} usuarios afectados</span>
                        </div>
                      )}
                    </div>
                    
                    {parkDependencies.total > 0 ? (
                      <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">
                          Total: {parkDependencies.total} elementos serán eliminados permanentemente
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Los voluntarios e instructores NO serán eliminados, solo se actualizará su parque preferido.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-green-800">
                          ✓ Este parque no tiene dependencias. Es seguro eliminarlo.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      No se pudieron cargar las dependencias. ¿Continuar con la eliminación?
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <strong>Nota:</strong> Esta acción no se puede deshacer. Todos los datos serán eliminados permanentemente de la base de datos.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending || loadingDependencies}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Confirmar Eliminación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminParks;