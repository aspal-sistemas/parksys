import React from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  Save
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/constants';

// Esquema de validación para crear activo
const assetCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  acquisitionDate: z.string().nullable().optional(),
  acquisitionCost: z.union([z.number().positive(), z.nan()]).transform(val => isNaN(val) ? null : val).nullable().optional(),
  parkId: z.number().min(1, 'El parque es obligatorio'),
  categoryId: z.number().min(1, 'La categoría es obligatoria'),
  status: z.string().min(1, 'El estado es obligatorio'),
  condition: z.string().min(1, 'La condición es obligatoria'),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const CreateAssetPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consultar categorías
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/asset-categories'],
  });
  
  // Consultar parques
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Formulario para crear activo
  const form = useForm<z.infer<typeof assetCreateSchema>>({
    resolver: zodResolver(assetCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      serialNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: null,
      parkId: 0,
      categoryId: 0,
      status: 'Activo',
      condition: 'Bueno',
      location: '',
      notes: '',
    },
  });
  
  // Mutación para crear activo
  const createMutation = useMutation({
    mutationFn: (newAsset: z.infer<typeof assetCreateSchema>) => {
      return apiRequest('/api/assets', 'POST', newAsset);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo creado",
        description: "El activo se ha creado correctamente.",
      });
      
      // Navegar al detalle del activo creado
      if (data && data.id) {
        setLocation(`/admin/assets/${data.id}`);
      } else {
        setLocation('/admin/assets');
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al crear el activo.",
        variant: "destructive",
      });
      console.error('Error al crear activo:', error);
    }
  });
  
  // Función para volver a la lista de activos
  const handleBackToList = () => {
    setLocation('/admin/assets');
  };
  
  // Manejar envío del formulario
  const handleSubmit = (values: z.infer<typeof assetCreateSchema>) => {
    createMutation.mutate(values);
  };
  
  // Determinar si el formulario está listo para enviar
  const isFormReady = !isLoadingCategories && !isLoadingParks && categories?.length > 0 && parks?.length > 0;
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Crear Nuevo Activo | ParquesMX</title>
        <meta name="description" content="Formulario para registrar un nuevo activo en el sistema." />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBackToList} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Activo</h1>
            <p className="text-muted-foreground">
              Complete el formulario para registrar un nuevo activo en el sistema.
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Información del Activo</CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isFormReady ? (
            <div className="py-4 text-center text-muted-foreground">
              <p>Cargando información necesaria...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del activo" {...field} />
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
                            value={field.value ? field.value.toString() : ''}
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
                            value={field.value ? field.value.toString() : ''}
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
                                <SelectItem key={status} value={status}>
                                  {status}
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
                                <SelectItem key={condition} value={condition}>
                                  {condition}
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ubicación específica dentro del parque" 
                            {...field} 
                            value={field.value || ''}
                          />
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
                          placeholder="Descripción detallada del activo" 
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas adicionales sobre el activo" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBackToList}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="gap-1" 
                    disabled={createMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    {createMutation.isPending ? 'Guardando...' : 'Guardar Activo'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CreateAssetPage;