import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Palette, Calendar, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

// Schema para validación
const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color debe ser un código hexadecimal válido").default("#00a587"),
  icon: z.string().min(1, "El icono es obligatorio").default("calendar"),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface ActivityCategory {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const CategoryForm: React.FC<{
  category?: ActivityCategory;
  onSuccess: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ category, onSuccess, isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "#00a587",
      icon: category?.icon || "calendar",
      sortOrder: category?.sortOrder || 0,
      isActive: category?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest('/api/activity-categories', {
      method: 'POST',
      data: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-categories'] });
      toast({ title: "Categoría creada exitosamente" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest(`/api/activity-categories/${category?.id}`, {
      method: 'PUT',
      data: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-categories'] });
      toast({ title: "Categoría actualizada exitosamente" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (category) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Arte y Cultura" {...field} />
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
                      placeholder="Descripción de la categoría..." 
                      className="resize-none"
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color"
                          className="w-12 h-9 p-1 border rounded-md"
                          {...field}
                        />
                        <Input 
                          placeholder="#00a587"
                          className="flex-1"
                          {...field}
                        />
                      </div>
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
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono (Lucide)</FormLabel>
                  <FormControl>
                    <Input placeholder="calendar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Guardando..." 
                  : (category ? "Actualizar" : "Crear")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const CategoriasActividades: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categoriesResponse, isLoading, error } = useQuery({
    queryKey: ['/api/activity-categories'],
    queryFn: async () => {
      const response = await apiRequest('/api/activity-categories');
      // Si la respuesta es un objeto Response, convertir a JSON
      if (response && typeof response.json === 'function') {
        return await response.json();
      }
      return response;
    },
  });



  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => apiRequest(`/api/activity-categories/${categoryId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-categories'] });
      toast({ title: "Categoría eliminada exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: ActivityCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
  };

  const handleDelete = (categoryId: number) => {
    deleteMutation.mutate(categoryId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Dashboard
            </h1>
            <p className="text-gray-500">Gestiona las categorías para organizar las actividades</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando categorías...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category: ActivityCategory) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La categoría "{category.name}" será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <div>Orden: {category.sortOrder}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CategoryForm
          category={selectedCategory}
          onSuccess={handleFormSuccess}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
        />
      </div>
    </AdminLayout>
  );
};

export default CategoriasActividades;