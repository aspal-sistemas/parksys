import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sprout, TreeDeciduous, Scissors, Shovel, Wrench, Leaf, Plus, Search, Filter, Download, Trash2, RefreshCw, CalendarDays, CircleCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TreeMaintenancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newMaintenance, setNewMaintenance] = useState({
    maintenanceType: '',
    maintenanceDate: '',
    performedBy: '',
    notes: ''
  });

  // Consultar todos los árboles
  const {
    data: trees,
    isLoading: isLoadingTrees,
  } = useQuery({
    queryKey: ['/api/trees'],
    queryFn: async () => {
      const response = await fetch('/api/trees');
      if (!response.ok) {
        throw new Error('Error al cargar los árboles');
      }
      return response.json();
    },
  });

  // Consultar todos los mantenimientos
  const {
    data: allMaintenances,
    isLoading: isLoadingMaintenances,
    refetch: refetchMaintenances
  } = useQuery({
    queryKey: ['/api/trees/maintenances'],
    queryFn: async () => {
      // Este endpoint debe implementarse para obtener todos los mantenimientos
      // Por ahora, simularemos agregando mantenimientos de todos los árboles
      const response = await fetch('/api/trees');
      if (!response.ok) {
        throw new Error('Error al cargar los mantenimientos');
      }
      
      const treesData = await response.json();
      let allMaintenances = [];
      
      // Para cada árbol, obtener sus mantenimientos
      for (const tree of treesData.data || []) {
        try {
          const maintenanceResponse = await fetch(`/api/trees/${tree.id}/maintenances`);
          if (maintenanceResponse.ok) {
            const maintenanceData = await maintenanceResponse.json();
            if (maintenanceData.data && maintenanceData.data.length > 0) {
              // Agregar información del árbol a cada mantenimiento
              const enhancedMaintenances = maintenanceData.data.map(maint => ({
                ...maint,
                treeCode: `ARB-${tree.id.toString().padStart(5, '0')}`,
                treeSpecies: tree.speciesName || 'Desconocida',
                parkName: tree.parkName || 'Desconocido'
              }));
              allMaintenances = [...allMaintenances, ...enhancedMaintenances];
            }
          }
        } catch (error) {
          console.error(`Error al obtener mantenimientos para el árbol ${tree.id}:`, error);
        }
      }
      
      return { data: allMaintenances };
    },
  });

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No disponible';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  // Agregar un nuevo mantenimiento
  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: typeof newMaintenance & { treeId: number }) => {
      return apiRequest(`/api/trees/${data.treeId}/maintenances`, {
        method: 'POST',
        body: JSON.stringify({
          maintenanceType: data.maintenanceType,
          maintenanceDate: data.maintenanceDate,
          performedBy: data.performedBy,
          notes: data.notes
        }),
      });
    },
    onSuccess: () => {
      // Cerrar el modal y limpiar el formulario
      setIsMaintenanceModalOpen(false);
      setNewMaintenance({
        maintenanceType: '',
        maintenanceDate: '',
        performedBy: '',
        notes: ''
      });
      setSelectedTreeId(null);
      
      // Mostrar mensaje de éxito
      toast({
        title: 'Mantenimiento registrado',
        description: 'El mantenimiento ha sido registrado correctamente.',
        variant: 'success',
      });
      
      // Actualizar los datos
      refetchMaintenances();
    },
    onError: (error) => {
      console.error('Error al registrar mantenimiento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el mantenimiento. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    },
  });
  
  // Manejar el envío del formulario
  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTreeId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un árbol para registrar mantenimiento.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newMaintenance.maintenanceType || !newMaintenance.maintenanceDate) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el tipo de mantenimiento y la fecha.',
        variant: 'destructive',
      });
      return;
    }
    
    createMaintenanceMutation.mutate({
      ...newMaintenance,
      treeId: selectedTreeId
    });
  };
  
  // Obtener el icono para el tipo de mantenimiento
  const getMaintenanceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'poda':
        return <Scissors className="h-4 w-4" />;
      case 'plantación':
        return <Shovel className="h-4 w-4" />;
      case 'riego':
        return <Sprout className="h-4 w-4" />;
      case 'tratamiento fitosanitario':
        return <Leaf className="h-4 w-4" />;
      case 'reparación':
        return <Wrench className="h-4 w-4" />;
      default:
        return <CircleCheck className="h-4 w-4" />;
    }
  };

  // Filtrar mantenimientos según búsqueda y filtros
  const filteredMaintenances = React.useMemo(() => {
    if (!allMaintenances?.data) return [];
    
    return allMaintenances.data.filter((maintenance: any) => {
      // Filtrar por búsqueda
      const searchFields = [
        maintenance.treeCode,
        maintenance.treeSpecies,
        maintenance.parkName,
        maintenance.maintenanceType,
        maintenance.performedBy,
        maintenance.notes
      ].map(field => field?.toString().toLowerCase() || '');
      
      const matchesSearch = !searchQuery || searchFields.some(field => field.includes(searchQuery.toLowerCase()));
      
      // Filtrar por estado
      const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'recent' && new Date(maintenance.maintenanceDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                            (filterStatus === 'old' && new Date(maintenance.maintenanceDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesFilter;
    });
  }, [allMaintenances?.data, searchQuery, filterStatus]);

  // Abrir modal para nuevo mantenimiento
  const openMaintenanceModal = (treeId: number) => {
    setSelectedTreeId(treeId);
    setIsMaintenanceModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Mantenimiento de Árboles</h1>
            <p className="text-gray-500 mt-1">
              Registra y consulta los mantenimientos realizados en el arbolado urbano
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsMaintenanceModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Mantenimiento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Total Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {isLoadingMaintenances ? (
                  <Skeleton className="h-10 w-20 mx-auto" />
                ) : (
                  allMaintenances?.data?.length || 0
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">Registros en el sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Mantenimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-blue-600">
                {isLoadingMaintenances ? (
                  <Skeleton className="h-10 w-20 mx-auto" />
                ) : (
                  allMaintenances?.data?.filter((m: any) => 
                    new Date(m.maintenanceDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length || 0
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">Últimos 30 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Tipos de Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {isLoadingMaintenances ? (
                <Skeleton className="h-10 w-20 mx-auto" />
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(new Set(allMaintenances?.data?.map((m: any) => m.maintenanceType))).map((type: any) => (
                    <Badge key={type} variant="outline" className="bg-gray-100">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar mantenimientos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los mantenimientos</SelectItem>
                  <SelectItem value="recent">Últimos 30 días</SelectItem>
                  <SelectItem value="old">Anteriores a 30 días</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetchMaintenances()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {isLoadingMaintenances ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredMaintenances.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Shovel className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No hay mantenimientos registrados</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No se encontraron resultados con los filtros actuales. Intenta con otra búsqueda o elimina los filtros.'
                  : 'No se han registrado actividades de mantenimiento en el sistema todavía.'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={() => setIsMaintenanceModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar el primer mantenimiento
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Árbol</TableHead>
                    <TableHead>Especie</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Realizado por</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaintenances.map((maintenance: any) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{maintenance.treeCode}</TableCell>
                      <TableCell>{maintenance.treeSpecies}</TableCell>
                      <TableCell>{maintenance.parkName}</TableCell>
                      <TableCell className="font-medium flex items-center">
                        <div className="mr-2 text-green-600">
                          {getMaintenanceIcon(maintenance.maintenanceType)}
                        </div>
                        {maintenance.maintenanceType}
                      </TableCell>
                      <TableCell>{formatDate(maintenance.maintenanceDate)}</TableCell>
                      <TableCell>{maintenance.performedBy || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {maintenance.notes || 'Sin observaciones'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para registrar nuevo mantenimiento */}
      <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Mantenimiento</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del mantenimiento realizado al árbol.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMaintenance} className="space-y-4">
            {!selectedTreeId && (
              <div className="space-y-2">
                <label htmlFor="treeId" className="text-sm font-medium">
                  Árbol *
                </label>
                <Select 
                  onValueChange={(value) => setSelectedTreeId(Number(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar árbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTrees ? (
                      <SelectItem value="loading">Cargando árboles...</SelectItem>
                    ) : (
                      trees?.data?.map((tree: any) => (
                        <SelectItem key={tree.id} value={tree.id.toString()}>
                          {`ARB-${tree.id.toString().padStart(5, '0')} - ${tree.speciesName || 'Desconocida'} (${tree.parkName})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="maintenanceType" className="text-sm font-medium">
                Tipo de Mantenimiento *
              </label>
              <Select 
                onValueChange={(value) => setNewMaintenance({...newMaintenance, maintenanceType: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Poda">Poda</SelectItem>
                  <SelectItem value="Plantación">Plantación</SelectItem>
                  <SelectItem value="Riego">Riego</SelectItem>
                  <SelectItem value="Tratamiento Fitosanitario">Tratamiento Fitosanitario</SelectItem>
                  <SelectItem value="Reparación">Reparación</SelectItem>
                  <SelectItem value="Inspección">Inspección</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="maintenanceDate" className="text-sm font-medium">
                Fecha de Mantenimiento *
              </label>
              <Input 
                type="date"
                id="maintenanceDate"
                value={newMaintenance.maintenanceDate}
                onChange={(e) => setNewMaintenance({...newMaintenance, maintenanceDate: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="performedBy" className="text-sm font-medium">
                Realizado por
              </label>
              <Input 
                type="text"
                id="performedBy"
                value={newMaintenance.performedBy}
                onChange={(e) => setNewMaintenance({...newMaintenance, performedBy: e.target.value})}
                placeholder="Nombre de la persona o equipo"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notas y observaciones
              </label>
              <textarea 
                id="notes"
                className="w-full p-2 border rounded-md h-24"
                value={newMaintenance.notes}
                onChange={(e) => setNewMaintenance({...newMaintenance, notes: e.target.value})}
                placeholder="Detalles adicionales sobre el mantenimiento realizado"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMaintenanceModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMaintenanceMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createMaintenanceMutation.isPending ? 'Guardando...' : 'Guardar Mantenimiento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}