import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
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
} from "@/components/ui/alert-dialog";

// Formato para de fecha para la UI
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Interfaz para la categoría de activos
interface AssetCategory {
  id: number;
  name: string;
  description: string | null;
  iconType: string;
  icon: string;
  customIconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Esquema de validación para el formulario
const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().nullable().optional(),
  iconType: z.enum(['system', 'custom']).default('system'),
  icon: z.string().optional(),
  customIconUrl: z.string().nullable().optional(),
});

const AssetCategoriesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Formulario para crear/editar categorías
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      iconType: 'system',
      icon: 'tag',
      customIconUrl: null,
    },
  });
  
  // Consultar categorías de activos
  const { data: categories, isLoading, isError } = useQuery<AssetCategory[]>({
    queryKey: ['/api/asset-categories'],
  });
  
  // Mutación para crear una categoría
  const createMutation = useMutation({
    mutationFn: (newCategory: z.infer<typeof categorySchema>) => {
      return apiRequest('/api/asset-categories', 'POST', newCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-categories'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al crear la categoría.",
        variant: "destructive",
      });
      console.error('Error al crear categoría:', error);
    }
  });
  
  // Mutación para actualizar una categoría
  const updateMutation = useMutation({
    mutationFn: (updatedCategory: z.infer<typeof categorySchema> & { id: number }) => {
      const { id, ...categoryData } = updatedCategory;
      return apiRequest(`/api/asset-categories/${id}`, 'PUT', categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-categories'] });
      setIsEditDialogOpen(false);
      form.reset();
      setSelectedCategory(null);
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar la categoría.",
        variant: "destructive",
      });
      console.error('Error al actualizar categoría:', error);
    }
  });
  
  // Mutación para eliminar una categoría
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/asset-categories/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-categories'] });
      setSelectedCategory(null);
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      setDeleteError(
        error.response?.data?.message || 
        "Ha ocurrido un error al eliminar la categoría."
      );
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ha ocurrido un error al eliminar la categoría.",
        variant: "destructive",
      });
      console.error('Error al eliminar categoría:', error);
    }
  });
  
  // Manejar envío del formulario para crear
  const handleCreateSubmit = (values: z.infer<typeof categorySchema>) => {
    createMutation.mutate(values);
  };
  
  // Manejar envío del formulario para actualizar
  const handleEditSubmit = (values: z.infer<typeof categorySchema>) => {
    if (selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        ...values
      });
    }
  };
  
  // Abrir formulario de creación
  const openCreateDialog = () => {
    form.reset({
      name: '',
      description: '',
      iconType: 'system',
      icon: 'tag',
      customIconUrl: null,
    });
    setIsCreateDialogOpen(true);
  };
  
  // Abrir formulario de edición
  const openEditDialog = (category: AssetCategory) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      description: category.description,
      iconType: category.iconType,
      icon: category.icon,
      customIconUrl: category.customIconUrl,
    });
    setIsEditDialogOpen(true);
  };
  
  // Confirmar eliminación de categoría
  const confirmDelete = (category: AssetCategory) => {
    setSelectedCategory(category);
    setDeleteError(null);
  };
  
  // Ejecutar eliminación
  const executeDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Categorías de Activos | ParquesMX</title>
        <meta name="description" content="Administra las categorías utilizadas para clasificar los activos físicos." />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías de Activos</h1>
          <p className="text-muted-foreground">
            Administra las categorías utilizadas para clasificar los activos.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-4 text-red-500">
              <p>Error al cargar los datos de categorías.</p>
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No hay categorías de activos definidas.</p>
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Icono</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || 'Sin descripción'}</TableCell>
                      <TableCell>
                        {category.iconType === 'system' ? (
                          <Tag className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                            {category.customIconUrl ? (
                              <img 
                                src={category.customIconUrl} 
                                alt={category.name} 
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Tag className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => confirmDelete(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Si hay activos que usan esta categoría, no se podrá eliminar.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              {deleteError && (
                                <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm flex items-start mb-4">
                                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Error</p>
                                    <p>{deleteError}</p>
                                  </div>
                                </div>
                              )}
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={executeDelete}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Categoría</DialogTitle>
            <DialogDescription>
              Complete el formulario para crear una nueva categoría de activos.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Equipamiento Deportivo" {...field} />
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
                        placeholder="Breve descripción de la categoría" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iconType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Icono</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="system">Icono del Sistema</option>
                        <option value="custom">Icono Personalizado</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("iconType") === "system" && (
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icono</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del icono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch("iconType") === "custom" && (
                <FormField
                  control={form.control}
                  name="customIconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Icono</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="URL de la imagen" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Actualice la información de la categoría.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Equipamiento Deportivo" {...field} />
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
                        placeholder="Breve descripción de la categoría" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iconType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Icono</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="system">Icono del Sistema</option>
                        <option value="custom">Icono Personalizado</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("iconType") === "system" && (
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icono</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del icono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch("iconType") === "custom" && (
                <FormField
                  control={form.control}
                  name="customIconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Icono</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="URL de la imagen" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AssetCategoriesPage;