import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash, Calendar, ArrowUpDown, X, Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Activity, Park } from '@shared/schema';
// import NewActivityForm from '@/components/NewActivityForm';

const AdminActivities = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [sortField, setSortField] = useState<string>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;

  // Fetch all activities
  const { 
    data: activitiesData = [], 
    isLoading: isLoadingActivities,
    isError: isErrorActivities,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Fetch parks for filter
  const { 
    data: parks = [], 
    isLoading: isLoadingParks 
  } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
  };

  // Get unique categories from activities
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    (activitiesData as Activity[]).forEach(activity => {
      if (activity.activityType) {
        uniqueCategories.add(activity.activityType);
      }
    });
    return Array.from(uniqueCategories);
  }, [activitiesData]);

  // Filter and sort activities
  const filteredActivities = React.useMemo(() => {
    return [...(activitiesData as Activity[])].filter(activity => {
      // Apply search filter
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply park filter
      if (filterPark && activity.parkId.toString() !== filterPark) {
        return false;
      }
      
      // Apply category filter
      if (filterCategory && activity.activityType !== filterCategory) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      
      if (sortField === 'startDate') {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortField === 'category') {
        if (!a.activityType) return sortDirection === 'asc' ? 1 : -1;
        if (!b.activityType) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc' 
          ? a.activityType.localeCompare(b.activityType) 
          : b.activityType.localeCompare(a.activityType);
      }
      
      // Default sort by startDate
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    });
  }, [activitiesData, searchQuery, filterPark, filterCategory, sortField, sortDirection]);

  // Cálculos de paginación
  const totalActivities = filteredActivities.length;
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);
  
  // Debug: Log pagination values
  React.useEffect(() => {
    if (activitiesData && Array.isArray(activitiesData)) {
      console.log('🔍 ACTIVITIES PAGINATION DEBUG:', {
        totalRawActivities: activitiesData.length,
        totalFilteredActivities: filteredActivities.length,
        totalPages,
        activitiesPerPage,
        currentPage,
        shouldShowPagination: filteredActivities.length > activitiesPerPage,
        currentActivitiesShowing: currentActivities.length
      });
    }
  }, [activitiesData, filteredActivities, totalPages, currentPage]);
  
  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPark, filterCategory]);

  // Get park name by ID
  const getParkName = (parkId: number) => {
    const park = (parks as Park[]).find(p => p.id === parkId);
    return park ? park.name : 'Desconocido';
  };
  
  // Handle view activity details
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  
  const handleViewDetails = (activity: Activity) => {
    setDetailActivity(activity);
    setShowDetailDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    
    try {
      await fetch(`/api/activities/${activityToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        },
      });
      
      // Refetch activities
      refetchActivities();
      
      // Show success toast
      toast({
        title: "Actividad eliminada",
        description: `La actividad ${activityToDelete.title} ha sido eliminada exitosamente.`,
      });
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle opening delete dialog
  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity);
    setShowDeleteDialog(true);
  };

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('');
    setFilterCategory('');
  };

  return (
    <AdminLayout title="Administración de Actividades">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Actividades</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Actividad
          </Button>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar actividades..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterPark} onValueChange={setFilterPark}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {(parks as Park[]).map(park => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchQuery || filterPark || filterCategory) && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Activities table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingActivities ? (
            <div className="py-32 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-gray-500">Cargando actividades...</p>
              </div>
            </div>
          ) : isErrorActivities ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar las actividades</p>
                <Button variant="outline" onClick={() => refetchActivities()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No se encontraron actividades</p>
                {(searchQuery || filterPark || filterCategory) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('title')}
                    >
                      Título
                      {sortField === 'title' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('startDate')}
                    >
                      Fecha
                      {sortField === 'startDate' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('category')}
                    >
                      Categoría
                      {sortField === 'category' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentActivities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.id}</TableCell>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>{formatDate(activity.startDate)}</TableCell>
                    <TableCell>
                      {activity.activityType ? (
                        <Badge variant="outline" className="bg-gray-100">
                          {activity.activityType}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No definida</span>
                      )}
                    </TableCell>
                    <TableCell>{getParkName(activity.parkId)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(activity)}
                      >
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-yellow-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(activity)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* PAGINACIÓN SIMPLE */}
        <div className="bg-white rounded-lg shadow-sm border mt-4">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalActivities)} de {totalActivities} actividades
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Página</span>
                <span className="bg-[#00a587] text-white px-2 py-1 rounded text-sm">{currentPage}</span>
                <span className="text-sm text-gray-500">de {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add activity dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Actividad</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Select 
              value={filterPark} 
              onValueChange={setFilterPark}
            >
              <SelectTrigger className="w-full mb-6">
                <SelectValue placeholder="Seleccione un parque" />
              </SelectTrigger>
              <SelectContent>
                {(parks as Park[]).map(park => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filterPark && (
              <div className="p-4 text-center">
                <p className="text-gray-600">Formulario de actividad temporalmente no disponible</p>
              </div>
            )}
            
            {!filterPark && (
              <p className="text-center text-gray-500 py-4">
                Seleccione un parque para crear una actividad
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit activity dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Actividad</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="p-4 text-center">
              <p className="text-gray-600">Formulario de edición temporalmente no disponible</p>
              <p className="text-sm text-gray-500 mt-2">
                Actividad: {selectedActivity.title} (ID: {selectedActivity.id})
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Activity details dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Actividad</DialogTitle>
          </DialogHeader>
          
          {detailActivity && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4 md:col-span-3">
                  <h2 className="text-xl font-semibold">{detailActivity.title}</h2>
                  <p className="text-sm text-gray-500">
                    ID: {detailActivity.id} | Parque: {getParkName(detailActivity.parkId)}
                  </p>
                </div>
                {detailActivity.activityType && (
                  <div className="col-span-4 md:col-span-1 flex justify-start md:justify-end">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 py-1 px-2">
                      {detailActivity.activityType}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-1">Descripción</h3>
                <p className="text-gray-700">
                  {detailActivity.description || "Sin descripción"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-1">Fecha y hora de inicio</h3>
                  <p className="text-gray-700">
                    {formatDate(detailActivity.startDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Fecha y hora de fin</h3>
                  <p className="text-gray-700">
                    {detailActivity.endDate ? formatDate(detailActivity.endDate) : "No especificado"}
                  </p>
                </div>
              </div>
              
              {detailActivity.location && (
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-1">Ubicación</h3>
                  <p className="text-gray-700">{detailActivity.location}</p>
                </div>
              )}
              
              {detailActivity.capacity && (
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-1">Capacidad</h3>
                  <p className="text-gray-700">
                    {detailActivity.capacity} personas
                  </p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-1">Registrado</h3>
                <p className="text-gray-500 text-sm">
                  Creado: {new Date(detailActivity.createdAt).toLocaleDateString()}
                  {detailActivity.updatedAt && detailActivity.updatedAt !== detailActivity.createdAt && (
                    <> | Actualizado: {new Date(detailActivity.updatedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
            {detailActivity && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedActivity(detailActivity);
                  setShowDetailDialog(false);
                  setShowEditDialog(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar la actividad <span className="font-semibold">{activityToDelete?.title}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminActivities;