import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  FolderPlus, Edit2, Trash2, Tag, FolderOpen, 
  TreePine, Settings, Plus, ChevronRight, Building2,
  Wrench, Car, Lightbulb, Camera, Wifi
} from 'lucide-react';

// ===== TIPOS Y ESQUEMAS =====

interface AssetCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  parentId: number | null;
  parentName?: string;
  createdAt: string;
  updatedAt: string;
  childrenCount?: number;
  hasChildren?: boolean;
  level?: number;
  pathNames?: string;
}

const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  icon: z.string().min(1, "Selecciona un ícono"),
  color: z.string().min(4, "Selecciona un color"),
  parentId: z.number().nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// ===== ÍCONOS DISPONIBLES =====
const AVAILABLE_ICONS = [
  { value: 'building2', label: 'Infraestructura', icon: Building2 },
  { value: 'wrench', label: 'Herramientas', icon: Wrench },
  { value: 'car', label: 'Vehículos', icon: Car },
  { value: 'lightbulb', label: 'Iluminación', icon: Lightbulb },
  { value: 'camera', label: 'Seguridad', icon: Camera },
  { value: 'wifi', label: 'Tecnología', icon: Wifi },
  { value: 'tag', label: 'General', icon: Tag },
  { value: 'settings', label: 'Equipos', icon: Settings },
  { value: 'treePine', label: 'Jardinería', icon: TreePine },
  { value: 'folderOpen', label: 'Categoría', icon: FolderOpen },
];

// ===== COLORES DISPONIBLES =====
const AVAILABLE_COLORS = [
  { value: '#3B82F6', label: 'Azul', bg: 'bg-blue-500' },
  { value: '#10B981', label: 'Verde', bg: 'bg-emerald-500' },
  { value: '#F59E0B', label: 'Naranja', bg: 'bg-amber-500' },
  { value: '#6366F1', label: 'Índigo', bg: 'bg-indigo-500' },
  { value: '#EC4899', label: 'Rosa', bg: 'bg-pink-500' },
  { value: '#8B5CF6', label: 'Púrpura', bg: 'bg-violet-500' },
  { value: '#EF4444', label: 'Rojo', bg: 'bg-red-500' },
  { value: '#14B8A6', label: 'Teal', bg: 'bg-teal-500' },
  { value: '#067f5f', label: 'Verde Parques', bg: 'bg-green-700' },
  { value: '#00a587', label: 'Verde Principal', bg: 'bg-green-600' },
];

// ===== COMPONENTE PRINCIPAL =====
const AssetCategoriesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("hierarchy");

  // Formulario
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'tag',
      color: '#3B82F6',
      parentId: null,
    },
  });

  // ===== CONSULTAS =====
  
  // Todas las categorías
  const { data: allCategories = [], isLoading } = useQuery<AssetCategory[]>({
    queryKey: ['/api/asset-categories'],
  });

  // Categorías principales
  const { data: parentCategories = [] } = useQuery<AssetCategory[]>({
    queryKey: ['/api/asset-categories/parents'],
  });

  // Estructura de árbol
  const { data: treeStructure = [] } = useQuery<AssetCategory[]>({
    queryKey: ['/api/asset-categories/tree/structure'],
  });

  // ===== MUTACIONES =====
  
  // Crear categoría
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest('/api/asset-categories', { method: 'POST', data });
      return await response.json();
    },
    onSuccess: (response) => {
      console.log('Categoría creada exitosamente:', response);
      
      // Forzar refetch inmediato de todas las queries
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/parents'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/tree/structure'] });
      
      // También invalidar después del refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/asset-categories'] });
        queryClient.invalidateQueries({ queryKey: ['/api/asset-categories/parents'] });
        queryClient.invalidateQueries({ queryKey: ['/api/asset-categories/tree/structure'] });
      }, 100);
      
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "✅ Categoría creada",
        description: "La categoría se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Error al crear la categoría",
        variant: "destructive",
      });
    },
  });

  // Actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      const response = await apiRequest(`/api/asset-categories/${id}`, { method: 'PUT', data });
      return await response.json();
    },
    onSuccess: () => {
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/parents'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/tree/structure'] });
      
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      form.reset();
      toast({
        title: "✅ Categoría actualizada",
        description: "La categoría se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Error al actualizar la categoría",
        variant: "destructive",
      });
    },
  });

  // Eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/asset-categories/${id}`, { method: 'DELETE' });
      return await response.json();
    },
    onSuccess: () => {
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/parents'] });
      queryClient.refetchQueries({ queryKey: ['/api/asset-categories/tree/structure'] });
      
      toast({
        title: "✅ Categoría eliminada",
        description: "La categoría se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Error al eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  // ===== FUNCIONES DE MANEJO =====
  
  const handleCreate = (data: CategoryFormData) => {
    const finalData = {
      ...data,
      parentId: selectedParentId || data.parentId || null,
    };
    createMutation.mutate(finalData);
  };

  const handleEdit = (category: AssetCategory) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      parentId: category.parentId,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: CategoryFormData) => {
    if (!selectedCategory) return;
    updateMutation.mutate({ id: selectedCategory.id, data });
  };

  const handleDelete = (category: AssetCategory) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const openCreateDialog = (parentId: number | null = null) => {
    setSelectedParentId(parentId);
    form.reset({
      name: '',
      description: '',
      icon: 'tag',
      color: '#3B82F6',
      parentId: parentId,
    });
    setIsCreateDialogOpen(true);
  };

  // ===== COMPONENTES DE RENDERIZADO =====
  
  const renderIcon = (iconName: string, size = 20) => {
    const IconComponent = AVAILABLE_ICONS.find(i => i.value === iconName)?.icon || Tag;
    return <IconComponent size={size} />;
  };

  const CategoryCard = ({ category, isSubcategory = false }: { category: AssetCategory; isSubcategory?: boolean }) => (
    <Card className={`transition-all hover:shadow-md ${isSubcategory ? 'ml-6 border-l-4' : ''}`} 
          style={isSubcategory ? { borderLeftColor: category.color } : {}}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
              {renderIcon(category.icon, 24)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {category.parentName && (
                  <Badge variant="outline" className="text-xs">
                    📁 {category.parentName}
                  </Badge>
                )}
                {category.hasChildren && (
                  <Badge variant="secondary" className="text-xs">
                    {category.childrenCount} subcategoría(s)
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isSubcategory && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openCreateDialog(category.id)}
              >
                <Plus size={16} />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(category)}
            >
              <Edit2 size={16} />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(category)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorías de Activos</h1>
            <p className="text-gray-600 mt-1">Gestiona las categorías jerárquicas para organizar tus activos</p>
          </div>
          <Button 
            onClick={() => openCreateDialog()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FolderPlus className="mr-2" size={20} />
            Nueva Categoría Principal
          </Button>
        </div>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchy">Vista Jerárquica</TabsTrigger>
          <TabsTrigger value="list">Lista Completa</TabsTrigger>
          <TabsTrigger value="tree">Estructura de Árbol</TabsTrigger>
        </TabsList>

        {/* Vista Jerárquica */}
        <TabsContent value="hierarchy" className="space-y-6">
          {parentCategories.map(parent => {
            const children = allCategories.filter(cat => cat.parentId === parent.id);
            
            return (
              <div key={parent.id} className="space-y-4">
                <CategoryCard category={parent} />
                {children.length > 0 && (
                  <div className="space-y-2">
                    {children.map(child => (
                      <CategoryCard key={child.id} category={child} isSubcategory={true} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Categorías sin padre */}
          {allCategories.filter(cat => !cat.parentId && !parentCategories.find(p => p.id === cat.id)).map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </TabsContent>

        {/* Lista Completa */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </TabsContent>

        {/* Estructura de Árbol */}
        <TabsContent value="tree" className="space-y-2">
          {treeStructure.map(node => (
            <Card key={node.id} className="transition-all hover:shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div style={{ marginLeft: `${(node.level || 0) * 24}px` }} className="flex items-center gap-2">
                    {node.level && node.level > 0 && (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <div className="p-1 rounded" style={{ backgroundColor: `${node.color}20`, color: node.color }}>
                      {renderIcon(node.icon, 16)}
                    </div>
                    <span className="font-medium">{node.name}</span>
                    {node.pathNames && (
                      <span className="text-xs text-gray-500">({node.pathNames})</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Estadísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{allCategories.length}</div>
            <div className="text-sm text-gray-600">Total Categorías</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{parentCategories.length}</div>
            <div className="text-sm text-gray-600">Categorías Principales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allCategories.filter(c => c.parentId).length}
            </div>
            <div className="text-sm text-gray-600">Subcategorías</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...treeStructure.map(n => n.level || 0)) + 1}
            </div>
            <div className="text-sm text-gray-600">Niveles Máximos</div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedCategory(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Nueva Categoría' : 'Editar Categoría'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen 
                ? 'Crea una nueva categoría para organizar tus activos'
                : 'Modifica los datos de la categoría seleccionada'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(isCreateDialogOpen ? handleCreate : handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mobiliario Urbano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe brevemente esta categoría..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícono *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ícono" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_ICONS.map(icon => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <icon.icon size={16} />
                                {icon.label}
                              </div>
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
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_COLORS.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${color.bg}`}></div>
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCreateDialogOpen && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría Padre (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))} 
                        value={field.value ? field.value.toString() : selectedParentId?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría padre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Sin categoría padre (Principal)</SelectItem>
                          {parentCategories.map(parent => (
                            <SelectItem key={parent.id} value={parent.id.toString()}>
                              <div className="flex items-center gap-2">
                                {renderIcon(parent.icon, 16)}
                                {parent.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AssetCategoriesPage;