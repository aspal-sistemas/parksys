import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  Save,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Settings
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
import { ASSET_CONDITIONS, ASSET_STATUSES, MAINTENANCE_FREQUENCIES } from '@shared/asset-schema';

// Esquema de validación para crear activo (completo)
const assetCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  categoryId: z.number().min(1, 'La categoría es obligatoria'),
  parkId: z.number().min(1, 'El parque es obligatorio'),
  amenityId: z.number().nullable().optional(),
  locationDescription: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  acquisitionDate: z.string().nullable().optional(),
  acquisitionCost: z.union([z.number().positive(), z.nan()]).transform(val => isNaN(val) ? null : val).nullable().optional(),
  currentValue: z.union([z.number().positive(), z.nan()]).transform(val => isNaN(val) ? null : val).nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  status: z.string().min(1, 'El estado es obligatorio'),
  condition: z.string().min(1, 'La condición es obligatoria'),
  maintenanceFrequency: z.string().nullable().optional(),
  lastMaintenanceDate: z.string().nullable().optional(),
  nextMaintenanceDate: z.string().nullable().optional(),
  expectedLifespan: z.union([z.number().positive(), z.nan()]).transform(val => isNaN(val) ? null : val).nullable().optional(),
  notes: z.string().nullable().optional(),
  qrCode: z.string().nullable().optional(),
  responsiblePersonId: z.number().nullable().optional(),
});

type AssetFormData = z.infer<typeof assetCreateSchema>;

const CreateAssetPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Formulario para crear activo
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      serialNumber: '',
      categoryId: 0,
      parkId: 0,
      amenityId: null,
      locationDescription: '',
      latitude: '',
      longitude: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: null,
      currentValue: null,
      manufacturer: '',
      model: '',
      status: 'active',
      condition: 'good',
      maintenanceFrequency: null,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      expectedLifespan: null,
      notes: '',
      qrCode: '',
      responsiblePersonId: null,
    },
  });
  
  // Consultar categorías
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/asset-categories'],
  });
  
  // Consultar parques
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Consultar amenidades del parque seleccionado
  const selectedParkId = form.watch('parkId');
  const { data: amenities, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['/api/parks', selectedParkId, 'amenities'],
    enabled: !!selectedParkId && selectedParkId > 0,
  });
  
  // Consultar usuarios para responsables
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Watch amenity selection to auto-fill location
  const selectedAmenityId = form.watch('amenityId');
  useEffect(() => {
    if (selectedAmenityId && selectedAmenityId > 0 && amenities && Array.isArray(amenities)) {
      const selectedAmenity = amenities.find((a: any) => a.amenityId === selectedAmenityId);
      if (selectedAmenity) {
        form.setValue('locationDescription', selectedAmenity.amenityName || '');
      }
    }
  }, [selectedAmenityId, amenities, form]);
  
  // Mutación para crear activo
  const createMutation = useMutation({
    mutationFn: (newAsset: AssetFormData) => {
      return apiRequest('/api/assets', 'POST', newAsset);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo creado",
        description: "El activo se ha creado correctamente.",
      });
      
      // Navegar al listado de activos
      setLocation('/admin/assets');
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
  const handleSubmit = (values: AssetFormData) => {
    createMutation.mutate(values);
  };
  
  // Determinar si el formulario está listo para enviar
  const isFormReady = !isLoadingCategories && !isLoadingParks && categories && parks;
  
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
      
      {!isFormReady ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>Cargando información necesaria...</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Información general del activo
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            placeholder="Número de serie o código" 
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
                              {categories && Array.isArray(categories) ? categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fabricante</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Marca o fabricante" 
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
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Modelo del activo" 
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
                    name="qrCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código QR</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="URL o código QR" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
                <CardDescription>
                  Ubicación física del activo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parque*</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              // Reset amenity when park changes
                              form.setValue('amenityId', null);
                              form.setValue('locationDescription', '');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un parque" />
                            </SelectTrigger>
                            <SelectContent>
                              {parks && Array.isArray(parks) ? parks.map((park: any) => (
                                <SelectItem key={park.id} value={park.id.toString()}>
                                  {park.name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amenityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenidad (Opcional)</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una amenidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sin amenidad específica</SelectItem>
                              {amenities && Array.isArray(amenities) ? amenities.map((amenity: any) => (
                                <SelectItem key={amenity.amenityId} value={amenity.amenityId.toString()}>
                                  {amenity.amenityName}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Si se selecciona, la ubicación se llenará automáticamente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="locationDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción de Ubicación</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ubicación específica dentro del parque" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Se llena automáticamente si selecciona una amenidad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="responsiblePersonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un responsable" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin responsable asignado</SelectItem>
                              {users && Array.isArray(users) ? users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.username} ({user.role})
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                            placeholder="Coordenada de latitud" 
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
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Coordenada de longitud" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
                <CardDescription>
                  Datos económicos y de valoración del activo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
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
                    name="expectedLifespan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vida Útil (meses)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Vida útil esperada en meses" 
                            {...field} 
                            value={field.value === null ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
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
                            step="0.01"
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
                    name="currentValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Actual</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Valor actual después de depreciación" 
                            {...field} 
                            value={field.value === null ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mantenimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mantenimiento
                </CardTitle>
                <CardDescription>
                  Programación y seguimiento de mantenimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maintenanceFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frecuencia de Mantenimiento</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value || ''}
                            onValueChange={(value) => field.onChange(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin mantenimiento programado</SelectItem>
                              {MAINTENANCE_FREQUENCIES.map((frequency) => (
                                <SelectItem key={frequency.value} value={frequency.value}>
                                  {frequency.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-1"></div>
                  
                  <FormField
                    control={form.control}
                    name="lastMaintenanceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último Mantenimiento</FormLabel>
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
                    name="nextMaintenanceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Próximo Mantenimiento</FormLabel>
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
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el activo..." 
                          {...field} 
                          value={field.value || ''}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
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
    </AdminLayout>
  );
};

export default CreateAssetPage;