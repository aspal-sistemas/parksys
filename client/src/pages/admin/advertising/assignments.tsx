import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar, CalendarIcon, Clock, Target, BarChart3, Settings, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';

// Esquema de validación para asignaciones
const assignmentSchema = z.object({
  ad_space_id: z.string().min(1, 'Espacio publicitario es requerido'),
  advertisement_id: z.string().min(1, 'Anuncio es requerido'),
  start_date: z.date({
    required_error: 'Fecha de inicio es requerida',
  }),
  end_date: z.date({
    required_error: 'Fecha de fin es requerida',
  }),
  frequency: z.enum(['always', 'weekly', 'daily', 'hourly']).default('always'),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface Assignment {
  id: number;
  adSpaceId: number;
  advertisementId: number;
  startDate: string;
  endDate: string;
  frequency: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  space: {
    id: number;
    name: string;
    pageType: string;
    position: string;
    dimensions: string;
  };
  advertisement: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    isActive: boolean;
  };
}

interface AdSpace {
  id: number;
  name: string;
  pageType: string;
  position: string;
  dimensions: string;
  isActive: boolean;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
}

const AssignmentCard: React.FC<{ assignment: Assignment; onEdit: (assignment: Assignment) => void; onDelete: (id: number) => void }> = ({ assignment, onEdit, onDelete }) => {
  const isActive = assignment.isActive && new Date() >= new Date(assignment.startDate) && new Date() <= new Date(assignment.endDate);
  const isExpired = new Date() > new Date(assignment.endDate);
  const isPending = new Date() < new Date(assignment.startDate);

  const getStatusIcon = () => {
    if (isActive) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (isExpired) return <XCircle className="w-4 h-4 text-red-500" />;
    if (isPending) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isActive) return 'Activo';
    if (isExpired) return 'Expirado';
    if (isPending) return 'Pendiente';
    return 'Inactivo';
  };

  const getStatusColor = () => {
    if (isActive) return 'bg-green-100 text-green-800';
    if (isExpired) return 'bg-red-100 text-red-800';
    if (isPending) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{assignment.advertisement.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{assignment.space.name}</p>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
              <Badge variant="outline">Prioridad {assignment.priority}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(assignment)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assignment.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Espacio:</p>
            <p className="text-gray-600">{assignment.space.pageType} - {assignment.space.position}</p>
          </div>
          <div>
            <p className="font-medium">Frecuencia:</p>
            <p className="text-gray-600">{assignment.frequency}</p>
          </div>
          <div>
            <p className="font-medium">Fecha inicio:</p>
            <p className="text-gray-600">{format(new Date(assignment.startDate), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
          <div>
            <p className="font-medium">Fecha fin:</p>
            <p className="text-gray-600">{format(new Date(assignment.endDate), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
        </div>
        
        {/* Vista previa del anuncio */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
          <div className="flex items-center gap-3">
            <img 
              src={assignment.advertisement.imageUrl} 
              alt={assignment.advertisement.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{assignment.advertisement.title}</p>
              <p className="text-xs text-gray-600 truncate">{assignment.advertisement.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AssignmentForm: React.FC<{ assignment?: Assignment; onSubmit: (data: AssignmentFormData) => void; onCancel: () => void }> = ({ assignment, onSubmit, onCancel }) => {
  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment ? {
      ad_space_id: assignment.adSpaceId.toString(),
      advertisement_id: assignment.advertisementId.toString(),
      start_date: new Date(assignment.startDate),
      end_date: new Date(assignment.endDate),
      frequency: assignment.frequency as 'always' | 'weekly' | 'daily' | 'hourly',
      priority: assignment.priority,
      is_active: assignment.isActive,
    } : {
      frequency: 'always',
      priority: 5,
      is_active: true,
    },
  });

  const { data: spaces } = useQuery<AdSpace[]>({
    queryKey: ['/api/advertising-management/spaces'],
  });

  const { data: advertisements } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertising-management/advertisements'],
  });

  const handleSubmit = (data: AssignmentFormData) => {
    onSubmit(data);
  };

  const safeSpaces = Array.isArray(spaces) ? spaces.filter(s => s && s.id && s.name) : [];
  const safeAds = Array.isArray(advertisements) ? advertisements.filter(a => a && a.id && a.title) : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="ad_space_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espacio Publicitario</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un espacio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {safeSpaces.map((space) => (
                      <SelectItem key={space.id} value={space.id.toString()}>
                        {space.name} ({space.pageType} - {space.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advertisement_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anuncio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un anuncio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {safeAds.map((ad) => (
                      <SelectItem key={ad.id} value={ad.id.toString()}>
                        {ad.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frecuencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="always">Siempre</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="hourly">Por hora</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad (1-10)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {assignment ? 'Actualizar' : 'Crear'} Asignación
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default function AdvertisingAssignments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();

  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/advertising-management/assignments'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const payload = {
        ad_space_id: parseInt(data.ad_space_id),
        advertisement_id: parseInt(data.advertisement_id),
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        frequency: data.frequency,
        priority: data.priority,
        is_active: data.is_active,
      };
      return apiRequest('/api/advertising-management/assignments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/assignments'] });
      setShowForm(false);
      setEditingAssignment(undefined);
      toast({
        title: "Asignación creada",
        description: "La asignación publicitaria ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la asignación. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error('Error creating assignment:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/advertising-management/assignments/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/assignments'] });
      toast({
        title: "Asignación eliminada",
        description: "La asignación publicitaria ha sido eliminada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación.",
        variant: "destructive",
      });
      console.error('Error deleting assignment:', error);
    },
  });

  const handleSubmit = (data: AssignmentFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAssignment(undefined);
  };

  const filteredAssignments = Array.isArray(assignments) ? assignments.filter(assignment => {
    const matchesSearch = assignment.advertisement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.space.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    
    const isActive = assignment.isActive && now >= startDate && now <= endDate;
    const isExpired = now > endDate;
    const isPending = now < startDate;
    
    if (statusFilter === 'active' && isActive) return matchesSearch;
    if (statusFilter === 'expired' && isExpired) return matchesSearch;
    if (statusFilter === 'pending' && isPending) return matchesSearch;
    if (statusFilter === 'inactive' && !assignment.isActive) return matchesSearch;
    
    return false;
  }) : [];

  // Estadísticas
  const totalAssignments = assignments?.length || 0;
  const activeAssignments = assignments?.filter(a => {
    const now = new Date();
    const startDate = new Date(a.startDate);
    const endDate = new Date(a.endDate);
    return a.isActive && now >= startDate && now <= endDate;
  }).length || 0;
  const expiredAssignments = assignments?.filter(a => new Date() > new Date(a.endDate)).length || 0;
  const pendingAssignments = assignments?.filter(a => new Date() < new Date(a.startDate)).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asignaciones Publicitarias</h1>
            <p className="text-gray-600">Gestiona la programación y distribución de anuncios en espacios publicitarios</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Asignación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
                </DialogTitle>
              </DialogHeader>
              <AssignmentForm
                assignment={editingAssignment}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Asignaciones</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeAssignments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAssignments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredAssignments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por anuncio o espacio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Asignaciones */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {filteredAssignments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron asignaciones con los filtros aplicados.'
                : 'Aún no tienes asignaciones publicitarias. Crea la primera para comenzar.'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}