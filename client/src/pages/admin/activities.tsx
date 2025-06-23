import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface Activity {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  capacity: number | null;
  activityType: string;
  parkId: number;
  parkName?: string;
}

interface Park {
  id: number;
  name: string;
}

const AdminActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;

  // Fetch activities
  const { data: activitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Fetch parks for filter
  const { data: parksData } = useQuery({
    queryKey: ['/api/parks'],
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificado";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Get unique categories
  const uniqueCategories = React.useMemo(() => {
    if (!activitiesData || !Array.isArray(activitiesData)) return [];
    const categories = new Set<string>();
    activitiesData.forEach((activity: Activity) => {
      if (activity.activityType) {
        categories.add(activity.activityType);
      }
    });
    return Array.from(categories);
  }, [activitiesData]);

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    if (!activitiesData || !Array.isArray(activitiesData)) return [];
    
    return activitiesData.filter((activity: Activity) => {
      // Search filter
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Park filter
      if (filterPark && activity.parkId.toString() !== filterPark) {
        return false;
      }
      
      // Category filter
      if (filterCategory && activity.activityType !== filterCategory) {
        return false;
      }
      
      return true;
    });
  }, [activitiesData, searchQuery, filterPark, filterCategory]);

  // Pagination calculations
  const totalActivities = filteredActivities.length;
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPark, filterCategory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('');
    setFilterCategory('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-32 flex justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587] mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando actividades...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="py-32 flex justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error al cargar las actividades</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar actividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Park filter */}
            <Select value={filterPark} onValueChange={setFilterPark}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por parque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los parques</SelectItem>
                {parksData && Array.isArray(parksData) && parksData.map((park: Park) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters */}
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Activities table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredActivities.length === 0 ? (
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
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentActivities.map((activity: Activity) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination - FORZADA PARA DEBUG */}
        {true && (
          <div className="bg-white rounded-lg shadow-sm border mt-4">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalActivities)} de {totalActivities} actividades
                <div className="text-xs bg-yellow-100 px-2 py-1 rounded mt-1">
                  DEBUG: Total={totalActivities}, PerPage={activitiesPerPage}, Pages={totalPages}, Current={currentPage}
                </div>
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
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivities;