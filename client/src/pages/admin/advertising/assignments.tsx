import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Clock, Target, BarChart3, Settings, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Video, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
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

const ImagePreview: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
        <Video className="w-6 h-6 text-blue-500" />
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
};

const AssignmentCard: React.FC<{ assignment: Assignment; onEdit: (assignment: Assignment) => void; onDelete: (id: number) => void }> = ({ assignment, onEdit, onDelete }) => {
  // Safe date parsing for status calculations
  const safeStartDate = assignment.startDate ? new Date(assignment.startDate) : null;
  const safeEndDate = assignment.endDate ? new Date(assignment.endDate) : null;
  const now = new Date();
  
  const isActive = assignment.isActive && 
    safeStartDate && safeEndDate && 
    !isNaN(safeStartDate.getTime()) && !isNaN(safeEndDate.getTime()) &&
    now >= safeStartDate && now <= safeEndDate;
    
  const isExpired = safeEndDate && !isNaN(safeEndDate.getTime()) && now > safeEndDate;
  const isPending = safeStartDate && !isNaN(safeStartDate.getTime()) && now < safeStartDate;

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
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{assignment.advertisement.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 truncate">{assignment.space.name}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
              <Badge variant="outline">Prioridad {assignment.priority}</Badge>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(assignment)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assignment.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-gray-700">Espacio:</p>
              <p className="text-gray-600 truncate">{assignment.space.pageType} - {assignment.space.position}</p>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-700">Frecuencia:</p>
              <p className="text-gray-600 truncate">{assignment.frequency}</p>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-700">Fecha inicio:</p>
              <p className="text-gray-600">
                {assignment.startDate 
                  ? (() => {
                      try {
                        return format(new Date(assignment.startDate), 'dd/MM/yyyy', { locale: es });
                      } catch (error) {
                        return 'Fecha inválida';
                      }
                    })()
                  : 'Sin fecha'
                }
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-700">Fecha fin:</p>
              <p className="text-gray-600">
                {assignment.endDate 
                  ? (() => {
                      try {
                        return format(new Date(assignment.endDate), 'dd/MM/yyyy', { locale: es });
                      } catch (error) {
                        return 'Fecha inválida';
                      }
                    })()
                  : 'Sin fecha'
                }
              </p>
            </div>
          </div>
          
          {/* Vista previa del anuncio */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex-shrink-0 overflow-hidden border border-blue-200">
                <ImagePreview 
                  src={assignment.advertisement.imageUrl} 
                  alt={assignment.advertisement.title || 'Vista previa del anuncio'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{assignment.advertisement.title || 'Sin título'}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{assignment.advertisement.description || 'Sin descripción'}</p>
              </div>
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
      ad_space_id: '',
      advertisement_id: '',
      frequency: 'always',
      priority: 5,
      is_active: true,
    },
  });

  const { data: spacesResponse } = useQuery({
    queryKey: ['/api/advertising-management/spaces'],
  });

  const { data: advertisementsResponse } = useQuery({
    queryKey: ['/api/advertising-management/advertisements'],
  });

  // Extract data from API response structure
  const spaces = spacesResponse?.data || spacesResponse || [];
  const advertisements = advertisementsResponse?.data || advertisementsResponse || [];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const recordsPerPage = 12;

  const queryClient = useQueryClient();

  const { data: assignmentsResponse, isLoading } = useQuery({
    queryKey: ['/api/advertising-management/assignments'],
  });

  // Extract assignments from the API response structure
  const assignments = assignmentsResponse?.data || assignmentsResponse || [];

  const createMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      // Validar que los IDs sean números válidos antes de enviar
      const spaceId = parseInt(data.ad_space_id);
      const advertisementId = parseInt(data.advertisement_id);
      
      if (isNaN(spaceId) || isNaN(advertisementId)) {
        throw new Error('Los IDs de espacio y anuncio deben ser números válidos');
      }
      
      const payload = {
        ad_space_id: spaceId,
        advertisement_id: advertisementId,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        frequency: data.frequency,
        priority: data.priority,
        is_active: data.is_active,
      };
      
      console.log('Enviando payload de asignación:', payload);
      
      return apiRequest('/api/advertising-management/assignments', {
        method: 'POST',
        data: payload,
      });
    },
    onSuccess: () => {
      // Invalidación simple del cache
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
      // Invalidación simple del cache
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/assignments'] });
      
      toast({
        title: "Asignación eliminada",
        description: "La asignación publicitaria ha sido eliminada - Actualizando banners...",
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
    // Validar que el assignment tenga las propiedades necesarias
    if (!assignment || !assignment.advertisement || !assignment.space) {
      return false;
    }
    
    const matchesSearch = (assignment.advertisement.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (assignment.space.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    // Validación segura de fechas
    const now = new Date();
    let startDate, endDate;
    
    try {
      startDate = assignment.startDate ? new Date(assignment.startDate) : null;
      endDate = assignment.endDate ? new Date(assignment.endDate) : null;
    } catch (error) {
      return false; // Excluir asignaciones con fechas inválidas
    }
    
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }
    
    const isActive = assignment.isActive && now >= startDate && now <= endDate;
    const isExpired = now > endDate;
    const isPending = now < startDate;
    
    if (statusFilter === 'active' && isActive) return matchesSearch;
    if (statusFilter === 'expired' && isExpired) return matchesSearch;
    if (statusFilter === 'pending' && isPending) return matchesSearch;
    if (statusFilter === 'inactive' && !assignment.isActive) return matchesSearch;
    
    return false;
  }) : [];

  // Paginación
  const totalRecords = filteredAssignments.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Estadísticas con validación segura
  const totalAssignments = Array.isArray(assignments) ? assignments.length : 0;
  const activeAssignments = Array.isArray(assignments) ? assignments.filter(a => {
    if (!a || !a.startDate || !a.endDate) return false;
    try {
      const now = new Date();
      const startDate = new Date(a.startDate);
      const endDate = new Date(a.endDate);
      return a.isActive && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && now >= startDate && now <= endDate;
    } catch (error) {
      return false;
    }
  }).length : 0;
  const expiredAssignments = Array.isArray(assignments) ? assignments.filter(a => {
    if (!a || !a.endDate) return false;
    try {
      const endDate = new Date(a.endDate);
      return !isNaN(endDate.getTime()) && new Date() > endDate;
    } catch (error) {
      return false;
    }
  }).length : 0;
  const pendingAssignments = Array.isArray(assignments) ? assignments.filter(a => {
    if (!a || !a.startDate) return false;
    try {
      const startDate = new Date(a.startDate);
      return !isNaN(startDate.getTime()) && new Date() < startDate;
    } catch (error) {
      return false;
    }
  }).length : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Asignaciones Publicitarias</h1>
            </div>
            <p className="text-gray-600 mt-2">Gestiona la programación y distribución de anuncios en espacios publicitarios</p>
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

        {/* Filtros y controles */}
        <div className="space-y-4">
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

          {/* Controles de vista y paginación */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalRecords)} de {totalRecords} asignaciones
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Asignaciones */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {paginatedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Vista de Lista */
          <div className="space-y-4">
            <div className="bg-white rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anuncio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Espacio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Período
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedAssignments.map((assignment) => {
                      const safeStartDate = assignment.startDate ? new Date(assignment.startDate) : null;
                      const safeEndDate = assignment.endDate ? new Date(assignment.endDate) : null;
                      const now = new Date();
                      
                      const isActive = assignment.isActive && 
                        safeStartDate && safeEndDate && 
                        !isNaN(safeStartDate.getTime()) && !isNaN(safeEndDate.getTime()) &&
                        now >= safeStartDate && now <= safeEndDate;
                        
                      const isExpired = safeEndDate && !isNaN(safeEndDate.getTime()) && now > safeEndDate;
                      const isPending = safeStartDate && !isNaN(safeStartDate.getTime()) && now < safeStartDate;

                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <ImagePreview 
                                  src={assignment.advertisement?.imageUrl} 
                                  alt={assignment.advertisement?.title || ''} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {assignment.advertisement?.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {assignment.advertisement?.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assignment.space?.name}</div>
                            <div className="text-sm text-gray-500">{assignment.space?.pageType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {safeStartDate ? format(safeStartDate, 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {safeEndDate ? format(safeEndDate, 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              isActive ? 'bg-green-100 text-green-800' :
                              isExpired ? 'bg-red-100 text-red-800' :
                              isPending ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {isActive ? 'Activa' : isExpired ? 'Expirada' : isPending ? 'Pendiente' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                assignment.priority >= 8 ? 'bg-red-500' :
                                assignment.priority >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              {assignment.priority}/10
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(assignment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(assignment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {paginatedAssignments.length === 0 && !isLoading && (
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