import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/AdminLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Monitor, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  BarChart3,
  Target,
  Layers,
  Grid,
  List
} from 'lucide-react';

// ====================================
// SCHEMAS Y INTERFACES
// ====================================

const spaceMappingSchema = z.object({
  pageType: z.string().min(1, 'Tipo de página es requerido'),
  position: z.string().min(1, 'Posición es requerida'),
  spaceId: z.number().min(1, 'Espacio publicitario es requerido'),
  isActive: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(1),
  fallbackBehavior: z.enum(['hide', 'placeholder', 'alternative']).default('hide'),
  layoutConfig: z.object({
    responsive: z.boolean().default(true),
    aspectRatio: z.string().optional(),
    maxWidth: z.string().optional(),
    minHeight: z.string().optional(),
  }).default({ responsive: true }),
});

type SpaceMappingFormData = z.infer<typeof spaceMappingSchema>;

interface SpaceMapping {
  id: number;
  pageType: string;
  position: string;
  spaceId: number;
  isActive: boolean;
  priority: number;
  fallbackBehavior: string;
  layoutConfig: any;
  createdAt: string;
  updatedAt: string;
  space?: {
    name: string;
    dimensions: string;
    pageType: string;
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

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const SpaceMappingsManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SpaceMapping | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ====================================
  // QUERIES
  // ====================================

  const { data: mappings = [], isLoading: mappingsLoading } = useQuery({
    queryKey: ['space-mappings'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/space-mappings');
      if (!response.ok) throw new Error('Error al obtener mapeos');
      const data = await response.json();
      return data.success ? data.data : [];
    },
  });

  const { data: spaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ['ad-spaces'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/spaces');
      if (!response.ok) throw new Error('Error al obtener espacios');
      return response.json();
    },
  });

  // ====================================
  // MUTATIONS
  // ====================================

  const createMappingMutation = useMutation({
    mutationFn: async (data: SpaceMappingFormData) => {
      return apiRequest('/api/advertising-management/space-mappings', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      setIsDialogOpen(false);
      setEditingMapping(null);
      toast({
        title: "Mapeo creado",
        description: "El mapeo de espacio se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el mapeo.",
        variant: "destructive",
      });
    },
  });

  const updateMappingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SpaceMappingFormData> }) => {
      return apiRequest(`/api/advertising-management/space-mappings/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      setIsDialogOpen(false);
      setEditingMapping(null);
      toast({
        title: "Mapeo actualizado",
        description: "El mapeo se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el mapeo.",
        variant: "destructive",
      });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/advertising-management/space-mappings/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      toast({
        title: "Mapeo eliminado",
        description: "El mapeo se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el mapeo.",
        variant: "destructive",
      });
    },
  });

  const autoPopulateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/advertising-management/space-mappings/auto-populate', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      toast({
        title: "Auto-población completada",
        description: `Se crearon ${data.data?.length || 0} mapeos automáticamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error en la auto-población.",
        variant: "destructive",
      });
    },
  });

  // ====================================
  // FORM LOGIC
  // ====================================

  const form = useForm<SpaceMappingFormData>({
    resolver: zodResolver(spaceMappingSchema),
    defaultValues: {
      pageType: '',
      position: '',
      spaceId: 0,
      isActive: true,
      priority: 1,
      fallbackBehavior: 'hide',
      layoutConfig: { responsive: true },
    },
  });

  // ====================================
  // UTILIDADES
  // ====================================

  const filteredMappings = useMemo(() => {
    return mappings.filter((mapping: SpaceMapping) => {
      const matchesSearch = searchTerm === '' || 
        mapping.pageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.space?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPageType = filterPageType === 'all' || mapping.pageType === filterPageType;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && mapping.isActive) ||
        (filterStatus === 'inactive' && !mapping.isActive);
      
      return matchesSearch && matchesPageType && matchesStatus;
    });
  }, [mappings, searchTerm, filterPageType, filterStatus]);

  const pageTypes = useMemo(() => {
    const types = new Set(mappings.map((m: SpaceMapping) => m.pageType));
    return Array.from(types);
  }, [mappings]);

  const getOrphanedSpaces = () => {
    const mappedSpaceIds = new Set(mappings.map((m: SpaceMapping) => m.spaceId));
    return spaces.filter((space: AdSpace) => 
      space.isActive && !mappedSpaceIds.has(space.id)
    );
  };

  const getUtilizationStats = () => {
    const totalSpaces = spaces.length;
    const mappedSpaces = mappings.filter((m: SpaceMapping) => m.isActive).length;
    const utilizationRate = totalSpaces > 0 ? (mappedSpaces / totalSpaces) * 100 : 0;
    
    return {
      totalSpaces,
      mappedSpaces,
      orphanedSpaces: getOrphanedSpaces().length,
      utilizationRate: Math.round(utilizationRate),
    };
  };

  // ====================================
  // HANDLERS
  // ====================================

  const handleOpenDialog = (mapping?: SpaceMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      form.reset({
        pageType: mapping.pageType,
        position: mapping.position,
        spaceId: mapping.spaceId,
        isActive: mapping.isActive,
        priority: mapping.priority,
        fallbackBehavior: mapping.fallbackBehavior as any,
        layoutConfig: mapping.layoutConfig || { responsive: true },
      });
    } else {
      setEditingMapping(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: SpaceMappingFormData) => {
    if (editingMapping) {
      updateMappingMutation.mutate({ id: editingMapping.id, data });
    } else {
      createMappingMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este mapeo?')) {
      deleteMappingMutation.mutate(id);
    }
  };

  // ====================================
  // RENDER
  // ====================================

  const stats = getUtilizationStats();

  if (mappingsLoading || spacesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header y estadísticas */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapeo de Espacios Publicitarios</h1>
            <p className="text-gray-600">Gestiona la asignación de espacios a páginas específicas</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => autoPopulateMutation.mutate()}
              variant="outline"
              disabled={autoPopulateMutation.isPending}
            >
              <Settings className="w-4 h-4 mr-2" />
              Auto-poblar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Mapeo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingMapping ? 'Editar Mapeo' : 'Crear Nuevo Mapeo'}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pageType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Página</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar página" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="parks">Parques</SelectItem>
                                <SelectItem value="activities">Actividades</SelectItem>
                                <SelectItem value="instructors">Instructores</SelectItem>
                                <SelectItem value="concessions">Concesiones</SelectItem>
                                <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
                                <SelectItem value="volunteers">Voluntarios</SelectItem>
                                <SelectItem value="homepage">Página Principal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posición</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar posición" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="banner">Banner</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="hero">Hero</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="spaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espacio Publicitario</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar espacio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {spaces
                                .filter((space: AdSpace) => space.isActive)
                                .map((space: AdSpace) => (
                                <SelectItem key={space.id} value={space.id.toString()}>
                                  {space.name || `${space.pageType} - ${space.position}`} ({space.dimensions})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fallbackBehavior"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comportamiento Fallback</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hide">Ocultar</SelectItem>
                                <SelectItem value="placeholder">Placeholder</SelectItem>
                                <SelectItem value="alternative">Alternativo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-y-0 pt-6">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mr-2"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Activo
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createMappingMutation.isPending || updateMappingMutation.isPending}
                      >
                        {editingMapping ? 'Actualizar' : 'Crear'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Espacios</p>
                  <p className="text-2xl font-bold">{stats.totalSpaces}</p>
                </div>
                <Monitor className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mapeados</p>
                  <p className="text-2xl font-bold">{stats.mappedSpaces}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Huérfanos</p>
                  <p className="text-2xl font-bold">{stats.orphanedSpaces}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilización</p>
                  <p className="text-2xl font-bold">{stats.utilizationRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de filtrado */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar mapeos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            
            <Select value={filterPageType} onValueChange={setFilterPageType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las páginas</SelectItem>
                {pageTypes.map(pageType => (
                  <SelectItem key={pageType} value={pageType}>
                    {pageType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lista de mapeos */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredMappings.map((mapping: SpaceMapping) => (
            <Card key={mapping.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {mapping.pageType}:{mapping.position}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={mapping.isActive ? 'default' : 'secondary'}>
                      {mapping.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge variant="outline">
                      Prioridad {mapping.priority}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Espacio ID: {mapping.spaceId}
                  {mapping.space?.name && ` - ${mapping.space.name}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Fallback: {mapping.fallbackBehavior}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(mapping)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(mapping.id)}
                      disabled={deleteMappingMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMappings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron mapeos
              </h3>
              <p className="text-gray-600 mb-4">
                No hay mapeos que coincidan con los filtros seleccionados.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer mapeo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SpaceMappingsManagement;