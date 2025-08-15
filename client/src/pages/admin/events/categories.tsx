import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BarChart3, Plus, Edit, Trash2, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import type { EventCategory } from '@shared/schema';

// Esquema de validación para categorías
const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color debe ser un código hex válido').default('#3B82F6')
});

type CategoryFormData = z.infer<typeof categorySchema>;

const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
  '#EC4899', '#6366F1', '#14B8A6', '#FB7185'
];

export default function EventCategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const { toast } = useToast();

  // Obtener categorías de la base de datos
  const { data: categories = [], isLoading } = useQuery<EventCategory[]>({
    queryKey: ['/api/event-categories']
  });

  // Mutación para crear categoría
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest('/api/event-categories', {
        method: 'POST',
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la categoría",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      return apiRequest(`/api/event-categories/${id}`, {
        method: 'PUT',
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la categoría",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/event-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  // Formulario para crear
  const createForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6'
    }
  });

  // Formulario para editar
  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6'
    }
  });

  // Funciones para manejar acciones
  const handleCreate = (data: CategoryFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (category: EventCategory) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingCategory(null);
    editForm.reset();
  };

  // Componente para selector de color
  const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3B82F6"
          className="font-mono text-sm"
        />
      </div>
      <div className="grid grid-cols-6 gap-2">
        {defaultColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded border-2 cursor-pointer hover:scale-110 transition-transform ${
              value === color ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Categorías de Eventos</h1>
              </div>
              <p className="text-gray-600 mt-2">Gestiona las categorías disponibles para clasificar eventos</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {categories.length} categorías
              </Badge>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Culturales" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción (opcional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descripción de la categoría..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCreateDialogClose}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                          {createMutation.isPending ? 'Creando...' : 'Crear'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Lista de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge 
                      style={{ backgroundColor: (category.color || '#3B82F6') + '20', color: category.color || '#3B82F6' }}
                      className="text-xs"
                    >
                      {category.name}
                    </Badge>
                    
                    {/* Botones de acción - siempre visibles */}
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {category.description || 'Sin descripción'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog para editar */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Culturales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción de la categoría..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <ColorPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleEditDialogClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {categories.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay categorías disponibles</h3>
              <p className="text-sm mb-4">Crea la primera categoría para empezar a organizar tus eventos</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Categoría
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}