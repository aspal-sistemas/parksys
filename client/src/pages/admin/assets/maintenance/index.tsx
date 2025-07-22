import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Asset {
  id: number;
  name: string;
  status: string;
  condition: string;
  parkName?: string;
  categoryName?: string;
}

interface Maintenance {
  id: number;
  assetId: number;
  assetName?: string;
  maintenanceType: string;
  description: string;
  date: string;
  status: string;
  cost?: number;
  performedBy?: string;
  notes?: string;
}

const MAINTENANCE_TYPES = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'emergencia', label: 'Emergencia' },
  { value: 'mejora', label: 'Mejora' }
];

const MAINTENANCE_STATUS = [
  { value: 'programado', label: 'Programado', color: 'bg-blue-100 text-blue-800' },
  { value: 'en_progreso', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completado', label: 'Completado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

const formatDateForDisplay = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    return dateString;
  }
};

const AssetsMaintenancePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Queries
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/assets'],
    suspense: false,
    retry: 1
  });

  const { data: maintenances = [], isLoading: maintenancesLoading, refetch } = useQuery({
    queryKey: ['/api/assets/maintenances'],
    suspense: false,
    retry: 1
  });

  // Mutations
  const createMaintenanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/assets/maintenances', 'POST', data),
    onSuccess: () => {
      toast({ title: "Éxito", description: "Mantenimiento registrado correctamente" });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assets/maintenances'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Error al registrar el mantenimiento", variant: "destructive" });
    }
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/assets/maintenances/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({ title: "Éxito", description: "Mantenimiento actualizado correctamente" });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assets/maintenances'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Error al actualizar el mantenimiento", variant: "destructive" });
    }
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/assets/maintenances/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Éxito", description: "Mantenimiento eliminado correctamente" });
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assets/maintenances'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Error al eliminar el mantenimiento", variant: "destructive" });
    }
  });

  // Handlers
  const handleCreateMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      assetId: parseInt(formData.get('assetId') as string),
      maintenanceType: formData.get('maintenanceType'),
      description: formData.get('description'),
      date: formData.get('date'),
      status: formData.get('status') || 'programado',
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
      performedBy: formData.get('performedBy') || null,
      notes: formData.get('notes') || null
    };
    createMaintenanceMutation.mutate(data);
  };

  const handleEditMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMaintenance) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      assetId: parseInt(formData.get('assetId') as string),
      maintenanceType: formData.get('maintenanceType'),
      description: formData.get('description'),
      date: formData.get('date'),
      status: formData.get('status'),
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
      performedBy: formData.get('performedBy') || null,
      notes: formData.get('notes') || null
    };
    updateMaintenanceMutation.mutate({ id: selectedMaintenance.id, data });
  };

  const handleViewMaintenanceClick = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowViewDialog(true);
  };

  const handleEditMaintenanceClick = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowEditDialog(true);
  };

  const handleDeleteMaintenanceClick = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMaintenance = () => {
    if (selectedMaintenance) {
      deleteMaintenanceMutation.mutate(selectedMaintenance.id);
    }
  };

  // Filtered data
  const filteredMaintenances = maintenances.filter((maintenance: Maintenance) => {
    const matchesSearch = !searchTerm || 
      maintenance.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || typeFilter === 'all' || maintenance.maintenanceType === typeFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || maintenance.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (maintenancesLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Cargando mantenimientos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Mantenimientos</h1>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-600">
              Registra y gestiona el mantenimiento de activos
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por activo o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de mantenimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {MAINTENANCE_TYPES.filter(type => type && type.value).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {MAINTENANCE_STATUS.filter(status => status && status.value).map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Mantenimiento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Mantenimientos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron mantenimientos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenances.map((maintenance: Maintenance) => {
                    const statusConfig = MAINTENANCE_STATUS.find(s => s.value === maintenance.status);
                    const typeLabel = MAINTENANCE_TYPES.find(t => t.value === maintenance.maintenanceType)?.label;
                    
                    return (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">
                          {maintenance.assetName || `Activo #${maintenance.assetId}`}
                        </TableCell>
                        <TableCell>{typeLabel || maintenance.maintenanceType}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {maintenance.description}
                        </TableCell>
                        <TableCell>{formatDateForDisplay(maintenance.date)}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
                            {statusConfig?.label || maintenance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {maintenance.cost && !isNaN(parseFloat(maintenance.cost)) ? `$${parseFloat(maintenance.cost).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewMaintenanceClick(maintenance)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMaintenanceClick(maintenance)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMaintenanceClick(maintenance)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Mantenimiento</DialogTitle>
              <DialogDescription>
                Complete los datos del mantenimiento realizado
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Activo</label>
                <Select name="assetId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(assets) ? assets.filter(asset => asset && asset.id && asset.name).map((asset: Asset) => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.name} - {asset.parkName || 'Sin parque'}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-data" disabled>
                        No hay activos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Mantenimiento</label>
                <Select name="maintenanceType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.filter(type => type && type.value && type.value.trim() !== '').map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  name="description"
                  placeholder="Descripción del mantenimiento realizado..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  name="date"
                  type="date"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select name="status" defaultValue="completado">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_STATUS.filter(status => status && status.value && status.value.trim() !== '').map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Costo (opcional)</label>
                <Input
                  name="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Realizado por</label>
                <Input
                  name="performedBy"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notas adicionales</label>
                <Textarea
                  name="notes"
                  placeholder="Notas u observaciones adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMaintenanceMutation.isPending}
                >
                  {createMaintenanceMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Mantenimiento</DialogTitle>
              <DialogDescription>
                Información completa del mantenimiento registrado
              </DialogDescription>
            </DialogHeader>
            
            {selectedMaintenance && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Activo</label>
                  <p className="text-sm">{selectedMaintenance.assetName || `Activo #${selectedMaintenance.assetId}`}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Mantenimiento</label>
                  <p className="text-sm">{MAINTENANCE_TYPES.find(t => t.value === selectedMaintenance.maintenanceType)?.label || selectedMaintenance.maintenanceType}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="text-sm">{selectedMaintenance.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                  <p className="text-sm">{formatDateForDisplay(selectedMaintenance.date)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <Badge className={MAINTENANCE_STATUS.find(s => s.value === selectedMaintenance.status)?.color || 'bg-gray-100 text-gray-800'}>
                      {MAINTENANCE_STATUS.find(s => s.value === selectedMaintenance.status)?.label || selectedMaintenance.status}
                    </Badge>
                  </div>
                </div>

                {selectedMaintenance.cost && !isNaN(parseFloat(selectedMaintenance.cost)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Costo</label>
                    <p className="text-sm">${parseFloat(selectedMaintenance.cost).toFixed(2)}</p>
                  </div>
                )}

                {selectedMaintenance.performedBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Realizado por</label>
                    <p className="text-sm">{selectedMaintenance.performedBy}</p>
                  </div>
                )}

                {selectedMaintenance.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notas</label>
                    <p className="text-sm">{selectedMaintenance.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Mantenimiento</DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea eliminar este registro de mantenimiento? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            
            {selectedMaintenance && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Activo: {selectedMaintenance.assetName || `Activo #${selectedMaintenance.assetId}`}</p>
                  <p className="text-sm text-muted-foreground">Tipo: {MAINTENANCE_TYPES.find(t => t.value === selectedMaintenance.maintenanceType)?.label}</p>
                  <p className="text-sm text-muted-foreground">Fecha: {formatDateForDisplay(selectedMaintenance.date)}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={confirmDeleteMaintenance}
                    disabled={deleteMaintenanceMutation.isPending}
                  >
                    {deleteMaintenanceMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AssetsMaintenancePage;