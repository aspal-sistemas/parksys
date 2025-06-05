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
  UserCheck, 
  RotateCcw, 
  Clock, 
  AlertTriangle,
  Search,
  Eye,
  Edit,
  CheckCircle
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

interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Activity {
  id: number;
  name: string;
  parkId: number;
  startDate: string;
}

interface Assignment {
  id: number;
  assetId: number;
  assetName?: string;
  instructorId?: number;
  instructorName?: string;
  activityId?: number;
  activityName?: string;
  assignmentDate: string;
  returnDate?: string;
  purpose: string;
  condition: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  createdAt: string;
}

const ASSIGNMENT_CONDITIONS = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
  { value: 'malo', label: 'Malo' }
];

const STATUS_TYPES = [
  { value: 'active', label: 'Activa', color: 'bg-blue-100 text-blue-800', icon: Clock },
  { value: 'returned', label: 'Devuelto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'overdue', label: 'Vencida', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
];

const AssetsAssignmentsPage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultar asignaciones
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/asset-assignments'],
    staleTime: 60000,
  });

  // Consultar activos disponibles
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
    staleTime: 60000,
  });

  // Consultar instructores
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
    staleTime: 60000,
  });

  // Consultar actividades
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    staleTime: 60000,
  });

  // Mutación para crear asignación
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/asset-assignments', {
        method: 'POST',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-assignments'] });
      toast({
        title: 'Asignación creada',
        description: 'La asignación de activo se ha creado correctamente.',
      });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear la asignación.',
        variant: 'destructive',
      });
    },
  });

  // Mutación para devolver activo
  const returnAssetMutation = useMutation({
    mutationFn: async ({ id, condition, notes }: { id: number; condition: string; notes?: string }) => {
      return apiRequest(`/api/asset-assignments/${id}/return`, {
        method: 'POST',
        data: { condition, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-assignments'] });
      toast({
        title: 'Activo devuelto',
        description: 'El activo se ha marcado como devuelto.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo procesar la devolución.',
        variant: 'destructive',
      });
    },
  });

  // Filtrar asignaciones
  const filteredAssignments = React.useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = assignment.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, statusFilter]);

  const handleCreateAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const assignmentData = {
      assetId: parseInt(formData.get('assetId') as string),
      instructorId: formData.get('instructorId') ? parseInt(formData.get('instructorId') as string) : null,
      activityId: formData.get('activityId') ? parseInt(formData.get('activityId') as string) : null,
      assignmentDate: formData.get('assignmentDate') as string,
      purpose: formData.get('purpose') as string,
      condition: formData.get('condition') as string,
      notes: formData.get('notes') as string,
    };

    createAssignmentMutation.mutate(assignmentData);
  };

  const getStatusInfo = (status: string) => {
    return STATUS_TYPES.find(s => s.value === status) || STATUS_TYPES[0];
  };

  if (assignmentsLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Cargando asignaciones...</div>
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
              <h1 className="text-3xl font-bold">Gestión de Asignaciones</h1>
              <p className="text-muted-foreground">
                Asigna activos a instructores y actividades
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Asignación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Asignación</DialogTitle>
                <DialogDescription>
                  Asigna un activo a un instructor o actividad
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Activo</label>
                  <Select name="assetId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar activo" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.filter(asset => asset.status === 'activo').map((asset) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.name} - {asset.parkName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Instructor (opcional)</label>
                  <Select name="instructorId">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>
                          {instructor.firstName} {instructor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Actividad (opcional)</label>
                  <Select name="activityId">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.id.toString()}>
                          {activity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Fecha de Asignación</label>
                  <Input 
                    name="assignmentDate" 
                    type="date" 
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Propósito</label>
                  <Input 
                    name="purpose" 
                    placeholder="Propósito de la asignación"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Condición al Asignar</label>
                  <Select name="condition" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Button type="submit" disabled={createAssignmentMutation.isPending}>
                    {createAssignmentMutation.isPending ? 'Creando...' : 'Crear Asignación'}
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
                    placeholder="Buscar por activo, instructor o propósito..."
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

        {/* Tabla de asignaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Asignaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Fecha Asignación</TableHead>
                  <TableHead>Propósito</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Condición</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No se encontraron asignaciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const statusInfo = getStatusInfo(assignment.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.assetName || `Activo #${assignment.assetId}`}
                        </TableCell>
                        <TableCell>
                          {assignment.instructorName || '-'}
                        </TableCell>
                        <TableCell>
                          {assignment.activityName || '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(assignment.assignmentDate), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {assignment.purpose}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ASSIGNMENT_CONDITIONS.find(c => c.value === assignment.condition)?.label || assignment.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {assignment.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => returnAssetMutation.mutate({ 
                                  id: assignment.id, 
                                  condition: assignment.condition
                                })}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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

export default AssetsAssignmentsPage;