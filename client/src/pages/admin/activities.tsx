import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Pencil, Trash, Search, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const AdminActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // States for edit/delete functionality
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    activityType: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: ''
  });
  
  const activitiesPerPage = 10;
  const { toast } = useToast();

  // Fetch data
  const { data: activitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/activities'],
  });

  const { data: parksData } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Mutations for edit and delete
  const editMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      return await apiRequest(`/api/activities/${data.id}`, {
        method: 'PUT',
        data: data.updates,
      });
    },
    onSuccess: () => {
      toast({
        title: "Actividad actualizada",
        description: "La actividad se ha actualizado correctamente.",
      });
      setShowEditDialog(false);
      setSelectedActivity(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/activities/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado correctamente.",
      });
      setShowDeleteDialog(false);
      setSelectedActivity(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const uniqueCategories = useMemo(() => {
    if (!Array.isArray(activitiesData)) return [];
    const categories = new Set();
    activitiesData.forEach((activity: any) => {
      if (activity.activityType) {
        categories.add(activity.activityType);
      }
    });
    return Array.from(categories);
  }, [activitiesData]);

  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activitiesData)) return [];
    
    return activitiesData.filter((activity: any) => {
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterPark && filterPark !== "all" && activity.parkId.toString() !== filterPark) {
        return false;
      }
      if (filterCategory && filterCategory !== "all" && activity.activityType !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [activitiesData, searchQuery, filterPark, filterCategory]);

  const totalActivities = filteredActivities.length;
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPark, filterCategory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('all');
    setFilterCategory('all');
  };

  // Handle edit functionality
  const handleEdit = (activity: any) => {
    setSelectedActivity(activity);
    setEditFormData({
      title: activity.title || '',
      description: activity.description || '',
      activityType: activity.activityType || '',
      startDate: activity.startDate ? new Date(activity.startDate).toISOString().slice(0, 16) : '',
      endDate: activity.endDate ? new Date(activity.endDate).toISOString().slice(0, 16) : '',
      location: activity.location || '',
      capacity: activity.capacity ? activity.capacity.toString() : ''
    });
    setShowEditDialog(true);
  };

  // Handle delete functionality
  const handleDelete = (activity: any) => {
    setSelectedActivity(activity);
    setShowDeleteDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedActivity) return;
    
    const updates = {
      title: editFormData.title,
      description: editFormData.description,
      activityType: editFormData.activityType,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate || null,
      location: editFormData.location || null,
      capacity: editFormData.capacity ? parseInt(editFormData.capacity) : null
    };

    editMutation.mutate({ id: selectedActivity.id, updates });
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!selectedActivity) return;
    deleteMutation.mutate(selectedActivity.id);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587] mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando actividades...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error al cargar las actividades</p>
              <Button onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Actividades</h1>
          <Button className="bg-[#00a587] hover:bg-[#067f5f]">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar actividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterPark} onValueChange={setFilterPark}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por parque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques</SelectItem>
                {Array.isArray(parksData) && parksData.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {uniqueCategories.map((category: any) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Activities table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredActivities.length === 0 ? (
            <div className="py-16 flex justify-center">
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentActivities.map((activity: any) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">#{activity.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.activityType}
                        </span>
                      </TableCell>
                      <TableCell>{activity.parkName || `Parque ${activity.parkId}`}</TableCell>
                      <TableCell>{formatDate(activity.startDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>

        {/* Pagination - Siempre visible */}
        <div className="bg-white rounded-lg shadow-sm border mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div>Mostrando {Math.min(startIndex + 1, totalActivities)}-{Math.min(endIndex, totalActivities)} de {totalActivities} actividades</div>
              <div className="text-xs text-blue-600 mt-1">
                Páginas calculadas: {totalPages} | Página actual: {currentPage} | Por página: {activitiesPerPage}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded">
                <span className="text-sm text-gray-600">Página</span>
                <span className="bg-[#00a587] text-white px-2 py-1 rounded text-sm font-medium">
                  {currentPage}
                </span>
                <span className="text-sm text-gray-600">de {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className="flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivities;