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

const categorySchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  level: z.enum(['A', 'B', 'C', 'D', 'E']),
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

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/accounting/categories'],
    enabled: true
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: '',
      name: '',
      level: 'A',
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
    const matchesLevel = selectedLevel === 'all' || category.level === selectedLevel;
    return matchesSearch && matchesLevel;
  }) || [];

  const getLevelColor = (level: string) => {
    const colors = {
      A: 'bg-red-100 text-red-800',
      B: 'bg-orange-100 text-orange-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-green-100 text-green-800',
      E: 'bg-blue-100 text-blue-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getParentCategories = (level: string) => {
    if (!categories) return [];
    const parentLevels = {
      B: ['A'],
      C: ['A', 'B'],
      D: ['A', 'B', 'C'],
      E: ['A', 'B', 'C', 'D'],
    };
    const validLevels = parentLevels[level as keyof typeof parentLevels] || [];
    return categories.filter((cat: any) => validLevels.includes(cat.level));
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías Contables</h1>
          <p className="text-gray-600 mt-1">
            Sistema jerárquico de 5 niveles (A→B→C→D→E) integrado con códigos SAT
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00a587] hover:bg-[#067f5f]"
              onClick={() => {
                setEditingCategory(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
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
                            <SelectItem value="A">Nivel A</SelectItem>
                            <SelectItem value="B">Nivel B</SelectItem>
                            <SelectItem value="C">Nivel C</SelectItem>
                            <SelectItem value="D">Nivel D</SelectItem>
                            <SelectItem value="E">Nivel E</SelectItem>
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

                {form.watch('level') !== 'A' && (
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
                <SelectItem value="A">Nivel A</SelectItem>
                <SelectItem value="B">Nivel B</SelectItem>
                <SelectItem value="C">Nivel C</SelectItem>
                <SelectItem value="D">Nivel D</SelectItem>
                <SelectItem value="E">Nivel E</SelectItem>
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
  );
}