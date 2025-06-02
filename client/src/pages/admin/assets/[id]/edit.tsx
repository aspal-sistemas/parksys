import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

// Schema de validación del formulario
const assetFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  categoryId: z.number().min(1, 'La categoría es obligatoria'),
  parkId: z.number().min(1, 'El parque es obligatorio'),
  amenityId: z.number().optional().nullable(),
  locationDescription: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.string().optional(),
  status: z.string().min(1, 'El estado es obligatorio'),
  condition: z.string().min(1, 'La condición es obligatoria'),
  responsiblePersonId: z.number().optional().nullable(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  qrCode: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

// Componente para el selector de ubicación en el mapa
const LocationPicker: React.FC<{
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Componente para actualizar la vista del mapa
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const EditAssetPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  // Consultar datos del activo existente
  const { data: asset, isLoading: isLoadingAsset } = useQuery({
    queryKey: [`/api/assets/${id}`],
    enabled: !!id,
  });

  // Consultar datos necesarios para el formulario
  const { data: categories } = useQuery({ queryKey: ['/api/asset-categories'] });
  const { data: parks } = useQuery({ queryKey: ['/api/parks'] });
  const { data: users } = useQuery({ queryKey: ['/api/users'] });

  // Configurar el formulario con valores por defecto del activo existente
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: '',
      description: '',
      serialNumber: '',
      categoryId: 0,
      parkId: 0,
      amenityId: null,
      locationDescription: '',
      acquisitionDate: '',
      acquisitionCost: '',
      status: '',
      condition: '',
      responsiblePersonId: null,
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      latitude: '',
      longitude: '',
      qrCode: '',
    }
  });

  // Cargar amenidades cuando se selecciona un parque
  const selectedParkId = form.watch('parkId');
  const { data: amenities } = useQuery({
    queryKey: [`/api/parks/${selectedParkId}/amenities`],
    enabled: !!selectedParkId && selectedParkId > 0,
  });

  // Actualizar valores del formulario cuando se cargan los datos del activo
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name || '',
        description: asset.description || '',
        serialNumber: asset.serial_number || '',
        categoryId: asset.category_id || 0,
        parkId: asset.park_id || 0,
        amenityId: asset.amenity_id || null,
        locationDescription: asset.location_description || '',
        acquisitionDate: asset.acquisition_date ? asset.acquisition_date.split('T')[0] : '',
        acquisitionCost: asset.acquisition_cost ? asset.acquisition_cost.toString() : '',
        status: asset.status || '',
        condition: asset.condition || '',
        responsiblePersonId: asset.responsible_person_id || null,
        lastMaintenanceDate: asset.last_maintenance_date ? asset.last_maintenance_date.split('T')[0] : '',
        nextMaintenanceDate: asset.next_maintenance_date ? asset.next_maintenance_date.split('T')[0] : '',
        latitude: asset.latitude ? asset.latitude.toString() : '',
        longitude: asset.longitude ? asset.longitude.toString() : '',
        qrCode: asset.qr_code || '',
      });

      // Configurar mapa si hay coordenadas
      if (asset.latitude && asset.longitude) {
        const lat = parseFloat(asset.latitude.toString());
        const lng = parseFloat(asset.longitude.toString());
        setSelectedLocation([lat, lng]);
        setMapPosition([lat, lng]);
      }
    }
  }, [asset, form]);

  // Actualizar mapa cuando se selecciona un parque
  useEffect(() => {
    if (selectedParkId && parks) {
      const selectedPark = parks.find((park: any) => park.id === selectedParkId);
      if (selectedPark && selectedPark.latitude && selectedPark.longitude) {
        const parkLat = parseFloat(selectedPark.latitude);
        const parkLng = parseFloat(selectedPark.longitude);
        setMapPosition([parkLat, parkLng]);
      }
    }
  }, [selectedParkId, parks]);

  // Función para manejar la selección de ubicación en el mapa
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    form.setValue('latitude', lat.toString());
    form.setValue('longitude', lng.toString());
  };

  // Mutación para actualizar el activo
  const updateAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const formattedData = {
        name: data.name,
        description: data.description || null,
        serial_number: data.serialNumber || null,
        category_id: data.categoryId,
        park_id: data.parkId,
        amenity_id: data.amenityId || null,
        location_description: data.locationDescription || null,
        acquisition_date: data.acquisitionDate || null,
        acquisition_cost: data.acquisitionCost ? parseFloat(data.acquisitionCost) : null,
        status: data.status,
        condition: data.condition,
        responsible_person_id: data.responsiblePersonId || null,
        last_maintenance_date: data.lastMaintenanceDate || null,
        next_maintenance_date: data.nextMaintenanceDate || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        qr_code: data.qrCode || null,
      };

      return apiRequest(`/api/assets/${id}`, {
        method: 'PUT',
        body: formattedData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${id}`] });
      toast({
        title: "Activo actualizado",
        description: "El activo ha sido actualizado correctamente.",
      });
      setLocation('/admin/assets');
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "Hubo un problema al actualizar el activo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssetFormData) => {
    updateAssetMutation.mutate(data);
  };

  if (isLoadingAsset) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!asset) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Activo no encontrado</h2>
          <p className="text-muted-foreground mt-2">El activo que buscas no existe o ha sido eliminado.</p>
          <Button 
            onClick={() => setLocation('/admin/assets')} 
            className="mt-4"
            variant="outline"
          >
            Volver al listado
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Editar Activo | ParquesMX</title>
        <meta name="description" content="Editar información del activo en el sistema de gestión de parques" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/admin/assets')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Editar Activo</h1>
              <p className="text-muted-foreground">Modifica la información del activo: {asset.name}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>
                    Datos fundamentales del activo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Activo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre descriptivo del activo" {...field} />
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
                            <SelectContent className="z-[1001]">
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
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Serie</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Número de serie o identificador único" 
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
                            <SelectContent className="z-[1001]">
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
                            <SelectContent className="z-[1001]">
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
                            <SelectContent className="z-[1001]">
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
                            <SelectContent className="z-[1001]">
                              <SelectItem value="0">Sin amenidad específica</SelectItem>
                              {amenities && Array.isArray(amenities) ? amenities
                                .filter((amenity: any) => amenity.amenityId && amenity.amenityName)
                                .map((amenity: any) => (
                                <SelectItem key={amenity.id} value={amenity.amenityId.toString()}>
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
                            <SelectContent className="z-[1001]">
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

                  {/* Mapa interactivo */}
                  {mapPosition && (
                    <div className="col-span-2">
                      <FormLabel>Ubicación en el mapa</FormLabel>
                      <FormDescription className="mb-2">
                        Haz clic en el mapa para actualizar la ubicación exacta del activo
                      </FormDescription>
                      <div className="h-64 w-full border rounded-md overflow-hidden">
                        <MapContainer
                          center={mapPosition}
                          zoom={16}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapUpdater center={mapPosition} />
                          <LocationPicker 
                            position={selectedLocation} 
                            onLocationSelect={handleLocationSelect}
                          />
                        </MapContainer>
                      </div>
                      {selectedLocation && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Ubicación seleccionada: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
                <CardDescription>
                  Datos de adquisición y costos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          placeholder="0.00" 
                          step="0.01"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Costo en pesos mexicanos (MXN)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  Cronograma de mantenimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <FormDescription>
                        Fecha programada para el siguiente mantenimiento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin/assets')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateAssetMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {updateAssetMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  </AdminLayout>
);
};

export default EditAssetPage;