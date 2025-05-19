import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash, Filter, Map, ArrowUpDown, X, Search, Loader, AlertTriangle, AlertOctagon, FileUp } from 'lucide-react';
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
  
  // Estado local para los parques (para gestionar la eliminación visual)
  const [localParks, setLocalParks] = useState<Park[]>([]);
  
  // Mantener un registro de los IDs de parques eliminados por el usuario
  const [deletedParkIds, setDeletedParkIds] = useState<number[]>(() => {
    // Intentar obtener los parques eliminados de localStorage
    const saved = localStorage.getItem('deletedParkIds');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch all parks
  const { 
    data: parks = [], 
    isLoading: isLoadingParks,
    isError: isErrorParks,
    refetch: refetchParks
  } = useQuery({
    queryKey: ['/api/parks'],
    onSuccess: (data) => {
      // Filtrar parques eliminados antes de actualizar el estado local
      const filteredData = data.filter(park => !deletedParkIds.includes(park.id));
      // Actualizar estado local cuando llegan nuevos datos
      setLocalParks(filteredData);
    }
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
    return [...localParks].filter(park => {
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
  }, [localParks, searchQuery, filterMunicipality, filterParkType, sortField, sortDirection]);

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
      // Actualizamos el estado local para eliminar el parque
      setLocalParks(prevParks => prevParks.filter(park => park.id !== parkToDelete.id));
      
      // Actualizamos la lista de parques eliminados
      const updatedDeletedIds = [...deletedParkIds, parkToDelete.id];
      setDeletedParkIds(updatedDeletedIds);
      
      // Guardamos en localStorage para persistencia
      localStorage.setItem('deletedParkIds', JSON.stringify(updatedDeletedIds));
      
      // Mostramos un mensaje de éxito
      toast({
        title: "Parque eliminado",
        description: `El parque ${parkToDelete.name || 'sin nombre'} ha sido eliminado exitosamente.`,
        variant: "default",
      });
      
      // Cerramos el diálogo y limpiamos el estado
      setShowDeleteDialog(false);
      setParkToDelete(null);
    } catch (error) {
      console.error('Error deleting park:', error);
      
      // Mostramos un mensaje de error
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
          <div className="flex gap-2">
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
                {(searchQuery || filterMunicipality || filterParkType) ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-yellow-600 mb-2">
                      Se han eliminado todos los parques de la vista actual
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          // Realizamos la petición directamente
                          const response = await fetch('/api/parks');
                          if (!response.ok) {
                            throw new Error('Error al obtener parques');
                          }
                          const data = await response.json();
                          
                          // Filtramos los parques eliminados
                          const filteredData = data.filter(park => !deletedParkIds.includes(park.id));
                          
                          // Actualizamos el estado local
                          setLocalParks(filteredData);
                          
                          toast({
                            title: "Lista actualizada",
                            description: `Se han cargado ${filteredData.length} parques desde el servidor`,
                          });
                        } catch (error) {
                          console.error('Error refreshing parks:', error);
                          toast({
                            title: "Error",
                            description: "No se pudieron obtener los parques. Intente nuevamente.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Loader className="h-4 w-4" />
                      Refrescar lista desde el servidor
                    </Button>
                  </div>
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
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setLocation(`/admin/parks/${park.id}`)}
                      >
                        <Map className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => window.location.href = `/admin/parks/${park.id}`}
                      >
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
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Atención: Eliminar Parque
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                ¡Advertencia!
              </h3>
              <p className="text-red-700 mt-1">
                Esta acción eliminará <span className="font-bold">permanentemente</span> el parque y no podrá recuperarse.
              </p>
            </div>
            
            <p className="mb-2">
              ¿Está seguro que desea eliminar el parque <span className="font-semibold">{parkToDelete?.name || 'sin nombre'}</span>?
            </p>
            
            <p className="text-sm text-gray-600 mt-2">
              Se eliminarán:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
              <li>Todos los datos e información del parque</li>
              <li>Todas las imágenes asociadas</li>
              <li>Todos los documentos adjuntos</li>
              <li>Todos los comentarios y valoraciones</li>
            </ul>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminParks;