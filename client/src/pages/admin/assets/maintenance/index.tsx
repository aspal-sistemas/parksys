import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
  ArrowLeft,
  Plus, 
  Calendar, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
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
  createdAt: string;
}

const MAINTENANCE_TYPES = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
  { value: 'inspeccion', label: 'Inspección' },
  { value: 'limpieza', label: 'Limpieza' }
];

const STATUS_TYPES = [
  { value: 'scheduled', label: 'Programado', color: 'bg-blue-100 text-blue-800', icon: Clock },
  { value: 'in_progress', label: 'En Progreso', color: 'bg-orange-100 text-orange-800', icon: Wrench },
  { value: 'completed', label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
];

const AssetsMaintenancePage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultar mantenimientos
  const { data: maintenances = [], isLoading: maintenancesLoading } = useQuery<Maintenance[]>({
    queryKey: ['/api/asset-maintenances'],
    staleTime: 60000,
  });

  // Consultar activos para el formulario
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
    staleTime: 60000,
  });

  // Mutación para crear mantenimiento
  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/assets/${data.assetId}/maintenances`, {
        method: 'POST',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      toast({
        title: 'Mantenimiento registrado',
        description: 'El mantenimiento se ha registrado correctamente.',
      });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el mantenimiento.',
        variant: 'destructive',
      });
    },
  });

  // Filtrar mantenimientos
  const filteredMaintenances = React.useMemo(() => {
    return maintenances.filter(maintenance => {
      const matchesSearch = maintenance.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           maintenance.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || maintenance.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [maintenances, searchTerm, statusFilter]);

  const handleCreateMaintenance = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const maintenanceData = {
      assetId: parseInt(formData.get('assetId') as string),
      maintenanceType: formData.get('maintenanceType') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as string,
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
      performedBy: formData.get('performedBy') as string,
      notes: formData.get('notes') as string,
    };

    console.log('📝 Datos del mantenimiento enviados:', maintenanceData);
    createMaintenanceMutation.mutate(maintenanceData);
  };

  const getStatusInfo = (status: string) => {
    return STATUS_TYPES.find(s => s.value === status) || STATUS_TYPES[0]; // default to scheduled
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setLocation('/admin/assets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Activos
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Mantenimientos</h1>
              <p className="text-muted-foreground">
                Registra y gestiona el mantenimiento de activos
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Mantenimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.name} - {asset.parkName}
                        </SelectItem>
                      ))}
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
                      {MAINTENANCE_TYPES.map((type) => (
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
                    placeholder="Descripción del mantenimiento realizado"
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
                  <Select name="status" defaultValue="scheduled">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_TYPES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Sugerencia: "Programado" para fechas futuras, "Completado" para fechas pasadas
                  </p>
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
                  <label className="text-sm font-medium">Notas</label>
                  <Textarea 
                    name="notes" 
                    placeholder="Notas adicionales"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMaintenanceMutation.isPending}>
                    {createMaintenanceMutation.isPending ? 'Registrando...' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por activo o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {STATUS_TYPES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Mantenimientos</CardTitle>
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
                  <TableHead>Realizado por</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No se encontraron mantenimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenances.map((maintenance) => {
                    const statusInfo = getStatusInfo(maintenance.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">
                          {maintenance.assetName || `Activo #${maintenance.assetId}`}
                        </TableCell>
                        <TableCell>
                          {MAINTENANCE_TYPES.find(t => t.value === maintenance.maintenanceType)?.label || maintenance.maintenanceType}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {maintenance.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(maintenance.date), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{maintenance.performedBy || '-'}</TableCell>
                        <TableCell>
                          {maintenance.cost ? `$${parseFloat(maintenance.cost).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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
      </div>
    </AdminLayout>
  );
};

export default AssetsMaintenancePage;