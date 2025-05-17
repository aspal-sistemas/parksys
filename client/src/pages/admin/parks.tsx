import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash, Filter, Map, ArrowUpDown, X, Search, Loader } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Park, Municipality } from '@shared/schema';

const AdminParks = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('');
  const [filterParkType, setFilterParkType] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parkToDelete, setParkToDelete] = useState<Park | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch all parks
  const { 
    data: parks = [], 
    isLoading: isLoadingParks,
    isError: isErrorParks,
    refetch: refetchParks
  } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Fetch municipalities for filter
  const { 
    data: municipalities = [], 
    isLoading: isLoadingMunicipalities 
  } = useQuery({
    queryKey: ['/api/municipalities'],
  });

  // Filter and sort parks
  const filteredParks = React.useMemo(() => {
    return [...parks].filter(park => {
      // Apply search filter
      if (searchQuery && !park.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply municipality filter
      if (filterMunicipality && park.municipalityId.toString() !== filterMunicipality) {
        return false;
      }
      
      // Apply park type filter
      if (filterParkType && park.parkType !== filterParkType) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
      
      if (sortField === 'parkType') {
        return sortDirection === 'asc' 
          ? a.parkType.localeCompare(b.parkType) 
          : b.parkType.localeCompare(a.parkType);
      }
      
      // Default sort by name
      return a.name.localeCompare(b.name);
    });
  }, [parks, searchQuery, filterMunicipality, filterParkType, sortField, sortDirection]);

  // Get municipality name by ID
  const getMunicipalityName = (municipalityId: number) => {
    const municipality = municipalities.find(m => m.id === municipalityId);
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
      await fetch(`/api/parks/${parkToDelete.id}`, {
        method: 'DELETE',
      });
      
      // Refetch parks
      refetchParks();
      
      // Show success toast
      toast({
        title: "Parque eliminado",
        description: `El parque ${parkToDelete.name} ha sido eliminado exitosamente.`,
      });
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setParkToDelete(null);
    } catch (error) {
      console.error('Error deleting park:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo eliminar el parque. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle opening delete dialog
  const handleDeleteClick = (park: Park) => {
    setParkToDelete(park);
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
    setFilterMunicipality('');
    setFilterParkType('');
  };

  return (
    <AdminLayout title="Administración de Parques">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Parques</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Parque
          </Button>
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
              <SelectItem value="">Todos los municipios</SelectItem>
              {municipalities.map(municipality => (
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
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="metropolitano">Metropolitano</SelectItem>
              <SelectItem value="barrial">Barrial</SelectItem>
              <SelectItem value="vecinal">Vecinal</SelectItem>
              <SelectItem value="lineal">Lineal</SelectItem>
              <SelectItem value="ecologico">Ecológico</SelectItem>
              <SelectItem value="botanico">Botánico</SelectItem>
              <SelectItem value="deportivo">Deportivo</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchQuery || filterMunicipality || filterParkType) && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Parks table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingParks ? (
            <div className="py-32 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-gray-500">Cargando parques...</p>
              </div>
            </div>
          ) : isErrorParks ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar los parques</p>
                <Button variant="outline" onClick={() => refetchParks()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredParks.length === 0 ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No se encontraron parques</p>
                {(searchQuery || filterMunicipality || filterParkType) && (
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
                      onClick={() => handleSortToggle('name')}
                    >
                      Nombre
                      {sortField === 'name' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('parkType')}
                    >
                      Tipo
                      {sortField === 'parkType' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParks.map(park => (
                  <TableRow key={park.id}>
                    <TableCell className="font-medium">{park.id}</TableCell>
                    <TableCell>{park.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100">
                        {getParkTypeLabel(park.parkType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getMunicipalityName(park.municipalityId)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Map className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-yellow-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(park)}
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
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar el parque <span className="font-semibold">{parkToDelete?.name}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer y eliminará toda la información, imágenes y documentos asociados a este parque.
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

export default AdminParks;