import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Tag, Palette, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';

interface EventCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

const defaultColors = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#EF4444', // Rojo
  '#8B5CF6', // Púrpura
  '#F97316', // Naranja
  '#06B6D4', // Cian
  '#84CC16', // Lima
];

function CategoryForm({ 
  category, 
  onSave, 
  onCancel 
}: { 
  category?: EventCategory; 
  onSave: (data: CategoryFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Culturales, Deportivos..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la categoría..."
          rows={3}
        />
      </div>

      <div>
        <Label>Color de la categoría</Label>
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: formData.color }}
          />
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-16 h-8 p-1 border rounded"
          />
        </div>
        <div className="grid grid-cols-8 gap-1 mt-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              className="w-6 h-6 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {category ? 'Actualizar' : 'Crear'} Categoría
        </Button>
      </div>
    </form>
  );
}

export default function EventCategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<EventCategory[]>({
    queryKey: ['/api/event-categories']
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest('/api/event-categories', {
        method: 'POST',
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      setShowNewForm(false);
      toast({
        title: 'Categoría creada',
        description: 'La categoría de evento se ha creado exitosamente.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la categoría',
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      return apiRequest(`/api/event-categories/${id}`, {
        method: 'PUT',
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      setEditingCategory(null);
      toast({
        title: 'Categoría actualizada',
        description: 'La categoría de evento se ha actualizado exitosamente.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la categoría',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/event-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-categories'] });
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría de evento se ha eliminado exitosamente.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la categoría',
        variant: 'destructive'
      });
    }
  });

  const handleSaveNew = (data: CategoryFormData) => {
    createMutation.mutate(data);
  };

  const handleSaveEdit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    }
  };

  const handleDelete = (category: EventCategory) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

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
              <p className="text-gray-600 mt-2">Gestiona las categorías para clasificar eventos</p>
            </div>
            
            <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Categoría</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  onSave={handleSaveNew}
                  onCancel={() => setShowNewForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Lista de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Tag className="h-3 w-3" />
                  <span>ID: {category.id}</span>
                </div>
                
                <Badge 
                  variant="outline" 
                  className="mt-2"
                  style={{ 
                    borderColor: category.color,
                    color: category.color
                  }}
                >
                  {category.name}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-600 mb-4">Crea la primera categoría para eventos</p>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </div>
        )}

        {/* Dialog de edición */}
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm
                category={editingCategory}
                onSave={handleSaveEdit}
                onCancel={() => setEditingCategory(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}