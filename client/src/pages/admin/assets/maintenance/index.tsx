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
  Edit,
  Trash2,
  Camera,
  Upload,
  X
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
  photos?: string[];
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
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Función para formatear fechas de forma consistente
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Función para convertir fecha a formato input date
  const formatDateForInput = (dateString: string) => {
    try {
      // Extraer solo la parte de fecha (YYYY-MM-DD)
      return dateString.split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

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
    onSuccess: async (newMaintenance: any) => {
      // Si hay fotos seleccionadas, subirlas automáticamente
      if (selectedFiles && selectedFiles.length > 0) {
        try {
          const formData = new FormData();
          Array.from(selectedFiles).forEach(file => {
            formData.append('photos', file);
          });
          
          await fetch(`/api/maintenance-photos/${newMaintenance.id}`, {
            method: 'POST',
            body: formData,
          });
        } catch (error) {
          console.error('Error subiendo fotos:', error);
          toast({
            title: 'Mantenimiento creado',
            description: 'El mantenimiento se creó pero hubo un error al subir las fotos.',
            variant: 'destructive',
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      toast({
        title: 'Mantenimiento registrado',
        description: selectedFiles ? 'El mantenimiento y las fotos se han registrado correctamente.' : 'El mantenimiento se ha registrado correctamente.',
      });
      setShowCreateDialog(false);
      setSelectedFiles(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el mantenimiento.',
        variant: 'destructive',
      });
    },
  });

  // Mutación para editar mantenimiento
  const editMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/asset-maintenances/${data.id}`, {
        method: 'PUT',
        data: data,
      });
    },
    onSuccess: async (updatedMaintenance) => {
      // Invalidar y refetch para asegurar datos actualizados
      await queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      await queryClient.refetchQueries({ queryKey: ['/api/asset-maintenances'] });
      
      toast({
        title: 'Mantenimiento actualizado',
        description: 'El mantenimiento se ha actualizado correctamente.',
      });
      setShowEditDialog(false);
      setSelectedMaintenance(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el mantenimiento.',
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar mantenimiento
  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/asset-maintenances/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      toast({
        title: 'Mantenimiento eliminado',
        description: 'El mantenimiento se ha eliminado correctamente.',
      });
      setShowDeleteDialog(false);
      setSelectedMaintenance(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el mantenimiento.',
        variant: 'destructive',
      });
    },
  });

  // Mutación para subir fotos
  const uploadPhotosMutation = useMutation({
    mutationFn: async ({ maintenanceId, files }: { maintenanceId: number; files: FileList }) => {
      console.log('📸 Iniciando subida de fotos desde frontend');
      console.log('Maintenance ID:', maintenanceId);
      console.log('Files count:', files.length);
      
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        console.log(`Agregando archivo ${index + 1}:`, file.name, file.type, file.size);
        formData.append('photos', file);
      });
      
      const response = await fetch(`/api/maintenance-photos/${maintenanceId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Incluir cookies de autenticación
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Error al subir fotos: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Fotos subidas exitosamente:', result);
      return result;
    },
    onSuccess: async (result) => {
      console.log('🎯 Actualizando interfaz después de subir fotos');
      
      // Invalidar queries para actualizar la vista
      await queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      
      // Actualizar el mantenimiento seleccionado con los nuevos datos del servidor
      if (selectedMaintenance && result.maintenance) {
        console.log('📋 Actualizando mantenimiento seleccionado con nuevas fotos:', result.maintenance.photos);
        setSelectedMaintenance(result.maintenance);
      }
      
      toast({
        title: 'Fotos subidas',
        description: 'Las fotos se han subido correctamente.',
      });
      setSelectedFiles(null);
    },
    onError: (error) => {
      console.error('❌ Error al subir fotos:', error);
      toast({
        title: 'Error',
        description: `No se pudieron subir las fotos: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar foto
  const deletePhotoMutation = useMutation({
    mutationFn: async ({ maintenanceId, photoIndex }: { maintenanceId: number; photoIndex: number }) => {
      return apiRequest(`/api/maintenance-photos/${maintenanceId}/${photoIndex}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-maintenances'] });
      toast({
        title: 'Foto eliminada',
        description: 'La foto se ha eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la foto.',
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

  const handleEditMaintenance = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMaintenance) return;
    
    const formData = new FormData(event.currentTarget);
    
    const maintenanceData = {
      id: selectedMaintenance.id,
      assetId: selectedMaintenance.assetId,
      maintenanceType: formData.get('maintenanceType') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as string,
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
      performedBy: formData.get('performedBy') as string,
      notes: formData.get('notes') as string,
    };

    editMaintenanceMutation.mutate(maintenanceData);
  };

  const handleViewMaintenance = (maintenance: Maintenance) => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUploadPhotos = () => {
    if (selectedMaintenance && selectedFiles) {
      setUploadingPhotos(true);
      uploadPhotosMutation.mutate(
        { maintenanceId: selectedMaintenance.id, files: selectedFiles },
        {
          onSettled: () => setUploadingPhotos(false)
        }
      );
    }
  };

  const handleDeletePhoto = (photoIndex: number) => {
    if (selectedMaintenance) {
      deletePhotoMutation.mutate({
        maintenanceId: selectedMaintenance.id,
        photoIndex
      });
    }
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

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Mantenimiento
              </Button>
            </DialogTrigger>
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
                  <select 
                    name="status" 
                    defaultValue="scheduled"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {STATUS_TYPES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
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

                <div>
                  <label className="text-sm font-medium">Fotos de Evidencia (opcional)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFiles && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFiles.length} archivo(s) seleccionado(s) - se subirán después de crear el mantenimiento
                    </p>
                  )}
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
                          {formatDateForDisplay(maintenance.date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{maintenance.performedBy || '-'}</TableCell>
                        <TableCell>
                          {maintenance.cost ? `$${parseFloat(maintenance.cost.toString()).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewMaintenance(maintenance)}
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
      </div>

      {/* Modal para ver mantenimiento */}
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
                  {(() => {
                    const statusInfo = getStatusInfo(selectedMaintenance.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Realizado por</label>
                <p className="text-sm">{selectedMaintenance.performedBy || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Costo</label>
                <p className="text-sm">{selectedMaintenance.cost ? `$${parseFloat(selectedMaintenance.cost.toString()).toFixed(2)}` : 'No especificado'}</p>
              </div>
              
              {selectedMaintenance.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas</label>
                  <p className="text-sm">{selectedMaintenance.notes}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fotos de Evidencia</label>
                {selectedMaintenance.photos && selectedMaintenance.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMaintenance.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                          onClick={() => window.open(photo, '_blank')}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay fotos de evidencia</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar mantenimiento */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Mantenimiento</DialogTitle>
            <DialogDescription>
              Modifica la información del mantenimiento
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaintenance && (
            <form onSubmit={handleEditMaintenance} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Mantenimiento</label>
                <select 
                  name="maintenanceType" 
                  required 
                  defaultValue={selectedMaintenance.maintenanceType}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  name="description"
                  defaultValue={selectedMaintenance.description}
                  placeholder="Describe el mantenimiento realizado"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  name="date"
                  defaultValue={formatDateForInput(selectedMaintenance.date)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estado</label>
                <select 
                  name="status" 
                  required 
                  defaultValue={selectedMaintenance.status}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_TYPES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Costo (opcional)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="cost"
                  defaultValue={selectedMaintenance.cost?.toString() || ''}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Realizado por (opcional)</label>
                <Input
                  name="performedBy"
                  defaultValue={selectedMaintenance.performedBy || ''}
                  placeholder="Nombre del técnico o empresa"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notas (opcional)</label>
                <Textarea
                  name="notes"
                  defaultValue={selectedMaintenance.notes || ''}
                  placeholder="Observaciones adicionales"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fotos de Evidencia</label>
                
                {/* Fotos existentes */}
                {selectedMaintenance.photos && selectedMaintenance.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
                    {selectedMaintenance.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleDeletePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subir nuevas fotos */}
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFiles && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {selectedFiles.length} archivo(s) seleccionado(s)
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUploadPhotos}
                        disabled={uploadingPhotos}
                      >
                        {uploadingPhotos ? (
                          <>
                            <Upload className="mr-2 h-3 w-3 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-3 w-3" />
                            Subir Fotos
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={editMaintenanceMutation.isPending}
                >
                  {editMaintenanceMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Eliminar Mantenimiento</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este mantenimiento?
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