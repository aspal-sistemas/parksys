import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Settings, 
  Star, 
  CheckCircle2, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Users,
  Calendar,
  Building,
  Target,
  Heart,
  Grid3X3,
  List,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

interface EvaluationCriterion {
  id: number;
  name: string;
  label: string;
  description: string;
  fieldType: string;
  minValue: number;
  maxValue: number;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  icon: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Schema para validación de formularios
const criterionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  label: z.string().min(1, 'La etiqueta es requerida'),
  description: z.string().optional(),
  fieldType: z.string().min(1, 'El tipo de campo es requerido'),
  minValue: z.number().min(0, 'El valor mínimo debe ser 0 o mayor'),
  maxValue: z.number().min(1, 'El valor máximo debe ser 1 o mayor'),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0, 'El orden debe ser 0 o mayor'),
  icon: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida')
});

const CriteriosEvaluacion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldTypeFilter, setFieldTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterion | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState<EvaluationCriterion | null>(null);
  
  const recordsPerPage = 9;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Formulario para crear/editar criterios
  const form = useForm<z.infer<typeof criterionSchema>>({
    resolver: zodResolver(criterionSchema),
    defaultValues: {
      name: '',
      label: '',
      description: '',
      fieldType: 'rating',
      minValue: 1,
      maxValue: 5,
      isRequired: true,
      isActive: true,
      sortOrder: 0,
      icon: 'Star',
      category: 'calidad'
    }
  });

  // Obtener criterios de evaluación
  const { data: criteria = [], isLoading } = useQuery<EvaluationCriterion[]>({
    queryKey: ['/api/evaluations/criteria'],
  });

  // Mutaciones para CRUD
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof criterionSchema>) => 
      apiRequest('/api/evaluations/criteria', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Criterio creado",
        description: "El criterio de evaluación se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el criterio de evaluación.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof criterionSchema> }) => {
      console.log('📊 [EVALUACIONES] Actualizando criterio', id, ':', data);
      return apiRequest(`/api/evaluations/criteria/${id}`, { method: 'PUT', data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      setEditingCriterion(null);
      form.reset();
      toast({
        title: "Criterio actualizado",
        description: "El criterio de evaluación se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el criterio de evaluación.",
        variant: "destructive",
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/evaluations/criteria/${id}`, { 
        method: 'PUT', 
        data: { isActive } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del criterio se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del criterio.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/evaluations/criteria/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/criteria'] });
      setShowDeleteDialog(null);
      toast({
        title: "Criterio eliminado",
        description: "El criterio de evaluación se ha eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el criterio de evaluación.",
        variant: "destructive",
      });
    }
  });

  // Filtrar criterios
  const filteredCriteria = criteria.filter((criterion) => {
    const matchesSearch = 
      criterion.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFieldType = fieldTypeFilter === 'all' || criterion.fieldType === fieldTypeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? criterion.isActive : !criterion.isActive);
    const matchesCategory = categoryFilter === 'all' || criterion.category === categoryFilter;
    
    return matchesSearch && matchesFieldType && matchesStatus && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCriteria.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedCriteria = filteredCriteria.slice(startIndex, startIndex + recordsPerPage);

  // Funciones auxiliares
  const handleEdit = (criterion: EvaluationCriterion) => {
    // Reset form first, then set values
    form.reset();
    setTimeout(() => {
      setEditingCriterion(criterion);
      form.reset({
        name: criterion.name,
        label: criterion.label,
        description: criterion.description || '',
        fieldType: criterion.fieldType,
        minValue: criterion.minValue,
        maxValue: criterion.maxValue,
        isRequired: criterion.isRequired,
        isActive: criterion.isActive,
        sortOrder: criterion.sortOrder,
        icon: criterion.icon || 'Star',
        category: criterion.category
      });
    }, 100);
  };

  const handleSubmit = (data: z.infer<typeof criterionSchema>) => {
    if (editingCriterion) {
      updateMutation.mutate({ id: editingCriterion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setEditingCriterion(null);
    setShowCreateDialog(false);
    form.reset();
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'rating':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'text':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'number':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'boolean':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case 'select':
        return <Filter className="h-4 w-4 text-orange-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFieldTypeColor = (fieldType: string) => {
    switch (fieldType) {
      case 'rating':
        return 'bg-yellow-100 text-yellow-800';
      case 'text':
        return 'bg-blue-100 text-blue-800';
      case 'number':
        return 'bg-green-100 text-green-800';
      case 'boolean':
        return 'bg-purple-100 text-purple-800';
      case 'select':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldTypeLabel = (fieldType: string) => {
    switch (fieldType) {
      case 'rating':
        return 'Calificación';
      case 'text':
        return 'Texto';
      case 'number':
        return 'Numérico';
      case 'boolean':
        return 'Sí/No';
      case 'select':
        return 'Selección';
      default:
        return 'General';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'calidad':
        return 'Calidad';
      case 'servicio':
        return 'Servicio';
      case 'desempeño':
        return 'Desempeño';
      case 'experiencia':
        return 'Experiencia';
      case 'infraestructura':
        return 'Infraestructura';
      case 'gestión':
        return 'Gestión';
      default:
        return 'General';
    }
  };

  // Estadísticas por categoría
  const stats = {
    total: criteria.length,
    active: criteria.filter(c => c.isActive).length,
    inactive: criteria.filter(c => !c.isActive).length,
    byCategory: criteria.reduce((acc, criterion) => {
      const category = criterion.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byFieldType: criteria.reduce((acc, criterion) => {
      const fieldType = criterion.fieldType || 'general';
      acc[fieldType] = (acc[fieldType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando criterios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Título y acciones principales */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Criterios</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los criterios de evaluación del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4 mr-1" />
                  Lista
                </>
              ) : (
                <>
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Cuadrícula
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtros Avanzados
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Criterio
                </Button>
              </DialogTrigger>
              <CriterionDialog />
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <ToggleLeft className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calificaciones</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.byFieldType.rating || 0}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros avanzados */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar criterios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Campo</label>
                    <Select value={fieldTypeFilter} onValueChange={setFieldTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="rating">Calificación</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Numérico</SelectItem>
                        <SelectItem value="boolean">Sí/No</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="calidad">Calidad</SelectItem>
                        <SelectItem value="servicio">Servicio</SelectItem>
                        <SelectItem value="desempeño">Desempeño</SelectItem>
                        <SelectItem value="experiencia">Experiencia</SelectItem>
                        <SelectItem value="infraestructura">Infraestructura</SelectItem>
                        <SelectItem value="gestión">Gestión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFieldTypeFilter('all');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Contenido principal */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCriteria.map((criterion) => (
              <CriterionCard key={criterion.id} criterion={criterion} />
            ))}
          </div>
        ) : (
          <CriterionTable criteria={paginatedCriteria} />
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(startIndex + recordsPerPage, filteredCriteria.length)} de {filteredCriteria.length} criterios
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Diálogos */}
        <Dialog open={!!editingCriterion || showCreateDialog} onOpenChange={() => resetForm()}>
          <CriterionDialog />
        </Dialog>

        {/* Dialog de detalles */}
        <Dialog open={!!showDetailDialog} onOpenChange={() => setShowDetailDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Criterio</DialogTitle>
            </DialogHeader>
            {showDetailDialog && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-lg font-semibold">{showDetailDialog.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Etiqueta</label>
                  <p>{showDetailDialog.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p>{showDetailDialog.description || 'Sin descripción'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Campo</label>
                    <Badge className={getFieldTypeColor(showDetailDialog.fieldType)}>
                      {getFieldTypeIcon(showDetailDialog.fieldType)}
                      <span className="ml-1">{getFieldTypeLabel(showDetailDialog.fieldType)}</span>
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoría</label>
                    <p>{getCategoryLabel(showDetailDialog.category)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Mínimo</label>
                    <p>{showDetailDialog.minValue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Máximo</label>
                    <p>{showDetailDialog.maxValue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Orden</label>
                    <p>{showDetailDialog.sortOrder}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Requerido</label>
                    <p>{showDetailDialog.isRequired ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <Badge variant={showDetailDialog.isActive ? "default" : "secondary"}>
                      {showDetailDialog.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar criterio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el criterio
                de evaluación del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => showDeleteDialog && deleteMutation.mutate(showDeleteDialog)}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );

  // Componente de tarjeta de criterio
  function CriterionCard({ criterion }: { criterion: EvaluationCriterion }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getFieldTypeIcon(criterion.fieldType)}
              <div>
                <CardTitle className="text-lg">{criterion.label}</CardTitle>
                <p className="text-sm text-gray-600">{criterion.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailDialog(criterion)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(criterion)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActiveMutation.mutate({ 
                  id: criterion.id, 
                  isActive: !criterion.isActive 
                })}
              >
                {criterion.isActive ? (
                  <ToggleRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(criterion.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {criterion.description || 'Sin descripción'}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge className={getFieldTypeColor(criterion.fieldType)}>
                {getFieldTypeLabel(criterion.fieldType)}
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(criterion.category)}
              </Badge>
              <Badge variant={criterion.isActive ? "default" : "secondary"}>
                {criterion.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Rango: {criterion.minValue} - {criterion.maxValue}</span>
              <span>Orden: {criterion.sortOrder}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Componente de tabla de criterios
  function CriterionTable({ criteria }: { criteria: EvaluationCriterion[] }) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criterio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rango
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {criteria.map((criterion) => (
                  <tr key={criterion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {criterion.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {criterion.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getFieldTypeColor(criterion.fieldType)}>
                        {getFieldTypeIcon(criterion.fieldType)}
                        <span className="ml-1">{getFieldTypeLabel(criterion.fieldType)}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {getCategoryLabel(criterion.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {criterion.minValue} - {criterion.maxValue}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={criterion.isActive ? "default" : "secondary"}>
                        {criterion.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetailDialog(criterion)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(criterion)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate({ 
                            id: criterion.id, 
                            isActive: !criterion.isActive 
                          })}
                        >
                          {criterion.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(criterion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Componente del diálogo de crear/editar criterio
  function CriterionDialog() {
    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCriterion ? 'Editar Criterio' : 'Nuevo Criterio'}
          </DialogTitle>
          <DialogDescription>
            {editingCriterion 
              ? 'Modifica los detalles del criterio de evaluación'
              : 'Crea un nuevo criterio de evaluación para el sistema'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Campo</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. service_quality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Calidad del Servicio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe qué evalúa este criterio..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fieldType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Campo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rating">Calificación (1-5)</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Numérico</SelectItem>
                        <SelectItem value="boolean">Sí/No</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="calidad">Calidad</SelectItem>
                        <SelectItem value="servicio">Servicio</SelectItem>
                        <SelectItem value="desempeño">Desempeño</SelectItem>
                        <SelectItem value="experiencia">Experiencia</SelectItem>
                        <SelectItem value="infraestructura">Infraestructura</SelectItem>
                        <SelectItem value="gestión">Gestión</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mínimo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Máximo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Campo Requerido</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Este criterio debe ser evaluado obligatoriamente
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Criterio Activo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        El criterio está disponible para evaluaciones
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  'Guardando...'
                ) : editingCriterion ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    );
  }
};

export default CriteriosEvaluacion;