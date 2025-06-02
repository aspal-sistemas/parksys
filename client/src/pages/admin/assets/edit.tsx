import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Settings
} from 'lucide-react';
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

// Esquema de validación completo para activos
const assetSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  parkId: z.coerce.number().min(1, "Debe seleccionar un parque"),
  categoryId: z.coerce.number().min(1, "Debe seleccionar una categoría"),
  amenityId: z.union([z.coerce.number(), z.literal("none")]).optional(),
  status: z.string().min(1, "El estado es obligatorio"),
  condition: z.string().min(1, "La condición es obligatoria"),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.union([z.number(), z.null()]).optional(),
  currentValue: z.string().optional(),
  depreciationRate: z.string().optional(),
  warrantyExpirationDate: z.string().optional(),
  maintenanceSchedule: z.string().optional(),
  location: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  responsiblePersonId: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

// Componente para manejar clics en el mapa
interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Componente para actualizar la vista del mapa
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);

  return null;
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

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



const EditAssetPage = () => {
  const params = useParams();
  const id = params.id;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para el mapa interactivo
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.6597, -103.3496]); // Guadalajara por defecto

  // Función para manejar la selección de ubicación en el mapa
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  // Obtener datos del activo
  const { data: asset, isLoading: assetLoading } = useQuery({
    queryKey: [`/api/assets/${id}`],
    enabled: !!id,
  });

  // Efecto para inicializar la posición del mapa cuando se cargan los datos del activo
  useEffect(() => {
    if (asset && asset.latitude && asset.longitude) {
      const lat = parseFloat(asset.latitude);
      const lng = parseFloat(asset.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedPosition([lat, lng]);
        setMapCenter([lat, lng]);
      }
    }
  }, [asset]);


  
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
      amenityId: "none",
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
        amenityId: asset.amenityId || "none",
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

  // Obtener amenidades del parque seleccionado  
  const selectedParkId = form.watch('parkId');
  const { data: amenities, isLoading: amenitiesLoading } = useQuery({
    queryKey: [`/api/parks/${selectedParkId}/amenities`],
    enabled: !!selectedParkId,
  });

  // Obtener listado de usuarios para responsable
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
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
    console.log("=== DATOS DEL FORMULARIO ===");
    console.log("Datos originales del formulario:", data);
    console.log("Posición seleccionada en mapa:", selectedPosition);
    console.log("Errores del formulario:", form.formState.errors);
    
    // Convertir "none" a null para amenityId antes de enviar
    const processedData = {
      ...data,
      amenityId: data.amenityId === "none" ? null : data.amenityId,
      // Incluir las coordenadas del mapa si están seleccionadas, convertir a string
      latitude: selectedPosition ? selectedPosition[0].toString() : data.latitude,
      longitude: selectedPosition ? selectedPosition[1].toString() : data.longitude
    };
    
    console.log("Datos procesados para enviar:", processedData);
    updateMutation.mutate(processedData);
  };

  // Efecto para centrar el mapa cuando cambia el parque seleccionado
  useEffect(() => {
    if (selectedParkId && parks) {
      const selectedPark = parks.find((park: any) => park.id === selectedParkId);
      if (selectedPark && selectedPark.latitude && selectedPark.longitude) {
        const parkLat = parseFloat(selectedPark.latitude);
        const parkLng = parseFloat(selectedPark.longitude);
        if (!isNaN(parkLat) && !isNaN(parkLng)) {
          setMapCenter([parkLat, parkLng]);
        }
      }
    }
  }, [selectedParkId, parks]);

  // Efecto para centrar el mapa en las coordenadas del activo cuando se carga
  useEffect(() => {
    if (asset && asset.latitude && asset.longitude && parks) {
      const assetLat = parseFloat(asset.latitude);
      const assetLng = parseFloat(asset.longitude);
      if (!isNaN(assetLat) && !isNaN(assetLng)) {
        setMapCenter([assetLat, assetLng]);
        setSelectedPosition([assetLat, assetLng]);
      }
    }
  }, [asset, parks]);

  // Efecto para auto-completar descripción de ubicación basada en amenidad seleccionada
  useEffect(() => {
    const amenityId = form.watch('amenityId');
    if (amenityId === "none" || amenityId === "" || amenityId === null || amenityId === undefined) {
      // Si no hay amenidad seleccionada, usar "Sin amenidad"
      form.setValue('location', 'Sin amenidad');
    } else if (amenityId && amenities) {
      const selectedAmenity = amenities.find((amenity: any) => amenity.amenityId === parseInt(amenityId) || amenity.id === parseInt(amenityId));
      if (selectedAmenity) {
        const amenityName = selectedAmenity.amenityName || selectedAmenity.name;
        if (amenityName) {
          // Usar exactamente el mismo texto que se muestra en el dropdown
          form.setValue('location', amenityName);
        }
      }
    }
  }, [form.watch('amenityId'), amenities, form]);
  
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
                


                {/* Sección de Ubicación con Mapa Interactivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ubicación del Activo
                    </CardTitle>
                    <CardDescription>
                      Selecciona la ubicación exacta del activo en el mapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              Descripción textual de la ubicación
                            </FormDescription>
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
                            <Select onValueChange={field.onChange} value={field.value?.toString() || "none"}>
                              <FormControl>
                                <SelectTrigger className="z-50">
                                  <SelectValue placeholder="Seleccionar amenidad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-50">
                                <SelectItem value="none">Sin amenidad</SelectItem>
                                {amenities?.map((amenity: any) => (
                                  <SelectItem key={amenity.amenityId || amenity.id} value={(amenity.amenityId || amenity.id).toString()}>
                                    {amenity.amenityName || amenity.name || 'Amenidad sin nombre'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Amenidad asociada con este activo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Mapa Interactivo */}
                    <div className="space-y-2">
                      <FormLabel>Seleccionar ubicación en el mapa</FormLabel>
                      <div className="h-96 w-full border rounded-lg overflow-hidden">
                        <MapContainer
                          center={mapCenter}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                          className="z-0"
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapUpdater center={mapCenter} />
                          <MapClickHandler onLocationSelect={handleLocationSelect} />
                          {selectedPosition && (
                            <Marker position={selectedPosition} />
                          )}
                        </MapContainer>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el mapa para seleccionar la ubicación exacta del activo
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitud</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: 20.659698" 
                                {...field} 
                                value={field.value?.toString() || ''}
                                readOnly
                              />
                            </FormControl>
                            <FormDescription>
                              Se actualiza automáticamente al seleccionar en el mapa
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
                                placeholder="Ej: -103.349609" 
                                {...field} 
                                value={field.value?.toString() || ''}
                                readOnly
                              />
                            </FormControl>
                            <FormDescription>
                              Se actualiza automáticamente al seleccionar en el mapa
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
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