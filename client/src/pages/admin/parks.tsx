import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('all');
  const [filterParkType, setFilterParkType] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parkToDelete, setParkToDelete] = useState<Park | null>(null);
  const [parkDependencies, setParkDependencies] = useState<ParkDependencies | null>(null);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

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
      
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [parks, searchQuery, filterMunicipality, filterParkType]);

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

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!parkToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(parkToDelete.id);
      setShowDeleteDialog(false);
      setParkToDelete(null);
    } catch (error) {
      console.error('Error deleting park:', error);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterMunicipality('all');
    setFilterParkType('all');
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
          
          {(searchQuery || filterMunicipality !== 'all' || filterParkType !== 'all') && (
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
                      onClick={() => window.location.href = `/admin/parks/${park.id}`}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el parque
              "{parkToDelete?.name}" de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminParks;