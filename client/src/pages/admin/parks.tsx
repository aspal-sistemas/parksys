import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileUp, Trash2, Eye, Edit, X, MapPin, Users, Calendar, Package, AlertTriangle, TreePine, Activity, Camera, FileText, UserCheck, Wrench, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Pagination and view states
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = 15;

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredParks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParks = filteredParks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMunicipality, filterParkType, filterAmenity]);

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

  // Pagination navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredParks.length)} de {filteredParks.length} parques
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          {pages.map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className={currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {currentParks.map((park: Park) => (
          <Card key={park.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{park.name}</h3>
                      <p className="text-sm text-gray-600">{getMunicipalityName(park.municipalityId)}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="max-w-xs truncate">{park.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{park.area.toLocaleString()} m²</span>
                      </div>
                      <Badge variant="secondary">
                        {getParkTypeLabel(park.parkType)}
                      </Badge>
                    </div>
                  </div>
                  {park.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{park.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-6">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/admin/parks/${park.id}/manage`}
                    title="Gestión completa del parque"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Wrench className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(park)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentParks.map((park: Park) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/admin/parks/${park.id}/manage`}
                    title="Gestión completa del parque"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Wrench className="h-4 w-4" />
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
    );
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

  const { t } = useTranslation('common');
  const { t: tParks } = useTranslation('parks');

  if (isLoadingParks) {
    return (
      <AdminLayout title={tParks('title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('messages.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isErrorParks) {
    return (
      <AdminLayout title={tParks('title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">{t('messages.error')}</p>
            <Button onClick={handleRefresh} className="mt-4">
              {t('actions.retry')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={tParks('title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">{t('navigation.parks')}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              {t('actions.refresh')}
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/admin/parks-import"}>
              <FileUp className="h-4 w-4 mr-2" />
              {t('actions.import')} {t('navigation.parks')}
            </Button>
            <Button onClick={() => window.location.href = "/admin/parks/new"}>
              <Plus className="h-4 w-4 mr-2" />
              {tParks('newPark')}
            </Button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredParks.length} parques encontrados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Grid className="h-4 w-4 mr-2" />
              Fichas
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`${t('actions.search')} ${t('navigation.parks')}...`}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterMunicipality} onValueChange={setFilterMunicipality}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t('forms.municipality')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('forms.allMunicipalities')}</SelectItem>
              {(municipalities as any[])?.map((municipality: any) => (
                <SelectItem key={municipality.id} value={municipality.id.toString()}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterParkType} onValueChange={setFilterParkType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('forms.parkType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('forms.allTypes')}</SelectItem>
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
              <SelectValue placeholder={t('forms.amenity')} />
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
        
        {/* Parks content */}
        {currentParks.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay parques</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterMunicipality !== 'all' || filterParkType !== 'all'
                ? "No se encontraron parques que coincidan con los filtros."
                : "Comienza agregando un nuevo parque."}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar parque?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el parque "{parkToDelete?.name}" y todos sus datos asociados.
              {loadingDependencies && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Verificando dependencias...</p>
                </div>
              )}
              {parkDependencies && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <h4 className="font-medium text-yellow-800 mb-2">Datos que serán eliminados:</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    {parkDependencies.trees > 0 && <div>• {parkDependencies.trees} árboles</div>}
                    {parkDependencies.treeMaintenances > 0 && <div>• {parkDependencies.treeMaintenances} mantenimientos de árboles</div>}
                    {parkDependencies.activities > 0 && <div>• {parkDependencies.activities} actividades</div>}
                    {parkDependencies.incidents > 0 && <div>• {parkDependencies.incidents} incidentes</div>}
                    {parkDependencies.amenities > 0 && <div>• {parkDependencies.amenities} amenidades</div>}
                    {parkDependencies.images > 0 && <div>• {parkDependencies.images} imágenes</div>}
                    {parkDependencies.assets > 0 && <div>• {parkDependencies.assets} activos</div>}
                    {parkDependencies.volunteers > 0 && <div>• {parkDependencies.volunteers} asignaciones de voluntarios</div>}
                    {parkDependencies.instructors > 0 && <div>• {parkDependencies.instructors} asignaciones de instructores</div>}
                    {parkDependencies.evaluations > 0 && <div>• {parkDependencies.evaluations} evaluaciones</div>}
                    {parkDependencies.documents > 0 && <div>• {parkDependencies.documents} documentos</div>}
                    <div className="font-medium mt-2">Total: {parkDependencies.total} registros asociados</div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending || loadingDependencies}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminParks;