import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FolderTree, Plus, Edit, Trash2, Search, ChevronRight } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

const categorySchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  level: z.enum(['1', '2', '3', '4', '5']),
  parent_id: z.string().optional(),
  sat_code: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AccountingCategories() {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['/api/accounting/categories'],
    enabled: true
  });

  const categories = categoriesData?.categories || [];

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: '',
      name: '',
      level: '1',
      parent_id: '',
      sat_code: '',
      description: '',
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest('/api/accounting/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría contable ha sido creada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/categories'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al crear la categoría contable.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => 
      apiRequest(`/api/accounting/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Categoría actualizada",
        description: "La categoría contable ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al actualizar la categoría contable.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/categories/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      toast({
        title: "Categoría eliminada",
        description: "La categoría contable ha sido eliminada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/categories'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al eliminar la categoría contable.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.reset({
      code: category.code,
      name: category.name,
      level: category.level,
      parent_id: category.parent_id || '',
      sat_code: category.sat_code || '',
      description: category.description || '',
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories?.filter((category: any) => {
    const matchesSearch = category.name.toLowerCase().includes(search.toLowerCase()) ||
                         category.code.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || category.level === parseInt(selectedLevel);
    return matchesSearch && matchesLevel;
  }) || [];

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-blue-100 text-blue-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelName = (level: number) => {
    const names = {
      1: 'Nivel A',
      2: 'Nivel B', 
      3: 'Nivel C',
      4: 'Nivel D',
      5: 'Nivel E'
    };
    return names[level as keyof typeof names] || `Nivel ${level}`;
  };

  const getParentCategories = (level: string) => {
    if (!categories) return [];
    const parentLevels = {
      '2': [1],
      '3': [1, 2],
      '4': [1, 2, 3],
      '5': [1, 2, 3, 4],
    };
    const validLevels = parentLevels[level as keyof typeof parentLevels] || [];
    return categories.filter((cat: any) => validLevels.includes(cat.level));
  };

  // Calcular estadísticas por nivel
  const levelStats = categories.reduce((acc: any, cat: any) => {
    const level = cat.level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías Contables</h1>
          <p className="text-gray-600 mt-1">
            Gestión de categorías contables jerárquicas (A→B→C→D→E)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00a587] hover:bg-[#067f5f]"
              onClick={() => {
                setEditingCategory(null);
                form.reset({
                  code: '',
                  name: '',
                  level: '1',
                  parent_id: '',
                  sat_code: '',
                  description: '',
                  is_active: true,
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar A
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría Contable'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar nivel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Nivel A</SelectItem>
                            <SelectItem value="2">Nivel B</SelectItem>
                            <SelectItem value="3">Nivel C</SelectItem>
                            <SelectItem value="4">Nivel D</SelectItem>
                            <SelectItem value="5">Nivel E</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la categoría" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('level') !== '1' && (
                  <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría Padre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría padre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getParentCategories(form.watch('level')).map((parent: any) => (
                              <SelectItem key={parent.id} value={parent.id.toString()}>
                                {parent.code} - {parent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sat_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código SAT</FormLabel>
                        <FormControl>
                          <Input placeholder="Código SAT mexicano" {...field} />
                        </FormControl>
                        <FormDescription>
                          Código del Servicio de Administración Tributaria
                        </FormDescription>
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
                        <Input placeholder="Descripción opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas por Nivel */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-gray-600 text-sm">
                {getLevelName(level)}
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getLevelColor(level).replace('bg-', 'bg-').replace('text-', 'text-white')}`}>
                {levelStats[level] || 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por código o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="1">Nivel A</SelectItem>
                <SelectItem value="2">Nivel B</SelectItem>
                <SelectItem value="3">Nivel C</SelectItem>
                <SelectItem value="4">Nivel D</SelectItem>
                <SelectItem value="5">Nivel E</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderTree className="h-5 w-5 mr-2" />
            Categorías Contables ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Estructura jerárquica de categorías para clasificación contable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCategories.map((category: any) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <Badge className={getLevelColor(category.level)}>
                    {category.level}
                  </Badge>
                  <div>
                    <div className="font-medium">{category.code} - {category.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      {category.sat_code && (
                        <>
                          <span>SAT: {category.sat_code}</span>
                          <ChevronRight className="h-3 w-3" />
                        </>
                      )}
                      {category.description && (
                        <span>{category.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}