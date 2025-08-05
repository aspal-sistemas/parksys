import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Constantes de estado y condición para activos
const ASSET_STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'maintenance', label: 'En Mantenimiento' },
  { value: 'retired', label: 'Retirado' },
  { value: 'storage', label: 'En Almacén' }
];

const ASSET_CONDITIONS = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Malo' },
  { value: 'critical', label: 'Crítico' }
];

// Esquema de validación para el formulario de activo
const assetSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  parkId: z.number().min(1, "Debe seleccionar un parque"),
  categoryId: z.number().min(1, "Debe seleccionar una categoría"),
  status: z.string().min(1, "Debe seleccionar un estado"),
  condition: z.string().min(1, "Debe seleccionar una condición"),
  acquisitionDate: z.string().nullable().optional(),
  acquisitionCost: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

type AssetFormValues = z.infer<typeof assetSchema>;

const EditAssetPage = () => {
  const params = useParams();
  const id = params.id;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Obtener datos del activo
  const { data: asset, isLoading: assetLoading } = useQuery({
    queryKey: [`/api/assets/${id}`],
    enabled: !!id,
  });
  
  // Obtener listado de parques
  const { data: parks, isLoading: parksLoading } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Obtener listado de categorías
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/asset-categories'],
  });
  
  // Configurar formulario
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      description: '',
      serialNumber: '',
      parkId: undefined,
      categoryId: undefined,
      status: '',
      condition: '',
      acquisitionDate: '',
      acquisitionCost: null,
      location: '',
      latitude: '',
      longitude: '',
      notes: ''
    },
  });
  
  // Actualizar valores por defecto cuando se carguen los datos
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name || '',
        description: asset.description || '',
        serialNumber: asset.serialNumber || '',
        parkId: asset.parkId,
        categoryId: asset.categoryId,
        status: asset.status || '',
        condition: asset.condition || '',
        acquisitionDate: asset.acquisitionDate || '',
        acquisitionCost: asset.acquisitionCost,
        location: asset.location || '',
        latitude: asset.latitude || '',
        longitude: asset.longitude || '',
        notes: asset.notes || ''
      });
    }
  }, [asset, form]);
  
  // Mutación para actualizar el activo
  const updateMutation = useMutation({
    mutationFn: (data: AssetFormValues) => {
      return apiRequest(`/api/assets/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo actualizado",
        description: "El activo se ha actualizado correctamente.",
      });
      setLocation(`/admin/assets/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al actualizar el activo.",
        variant: "destructive",
      });
      console.error('Error al actualizar activo:', error);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: AssetFormValues) => {
    updateMutation.mutate(data);
  };
  
  // Formatear costo para mostrar
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'No especificado';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };
  
  // Mostrar cargando si se están obteniendo datos
  const isLoading = assetLoading || parksLoading || categoriesLoading;
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setLocation(`/admin/assets/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Activo
            </Button>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setLocation(`/admin/assets/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Activo
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Editar Activo</CardTitle>
            <CardDescription>
              Edita la información del activo: {asset?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información Básica</h3>
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Serie</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Número de serie" 
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
                      name="parkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parque*</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value?.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un parque" />
                              </SelectTrigger>
                              <SelectContent>
                                {parks?.map((park: any) => (
                                  <SelectItem key={park.id} value={park.id.toString()}>
                                    {park.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría*</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value?.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories?.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              placeholder="Descripción del activo" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Estado y Condición */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Estado y Condición</h3>
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {ASSET_STATUSES.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condición*</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una condición" />
                              </SelectTrigger>
                              <SelectContent>
                                {ASSET_CONDITIONS.map((condition) => (
                                  <SelectItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="acquisitionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Adquisición</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
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
                      name="acquisitionCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo de Adquisición</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Costo en pesos" 
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas o comentarios adicionales" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Ubicación y Geolocalización */}
                <div className="border p-4 rounded-md bg-blue-50 mt-6">
                  <h3 className="text-lg font-medium mb-4">Ubicación y Geolocalización</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de Ubicación</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Cerca de la entrada principal" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe dónde se encuentra
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 19.432608" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Coordenada norte/sur
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: -99.133209" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Coordenada este/oeste
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation(`/admin/assets/${id}`)}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditAssetPage;