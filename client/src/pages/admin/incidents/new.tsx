import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Esquema de validación
const incidentSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  assetId: z.string().optional(),
  parkId: z.string().min(1, 'El parque es obligatorio'),
  location: z.string().optional(),
  reportedBy: z.string().min(1, 'El responsable del reporte es obligatorio'),
  contactInfo: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

const NewIncidentPage = () => {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Obtener parámetros de la URL (assetId si viene del inventario)
  const urlParams = new URLSearchParams(window.location.search);
  const assetIdFromUrl = urlParams.get('assetId');

  // Configurar el formulario
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      categoryId: '',
      assetId: assetIdFromUrl || '',
      parkId: '',
      location: '',
      reportedBy: '',
      contactInfo: '',
    },
  });

  // Consultas para obtener datos
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
    retry: false,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets'],
    retry: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/incident-categories'],
    retry: false,
  });

  // Mutación para crear incidencia
  const createMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const incidentData = {
        ...data,
        date: selectedDate.toISOString(),
        status: 'reported',
        assetId: data.assetId && data.assetId !== 'none' ? parseInt(data.assetId) : null,
        parkId: parseInt(data.parkId),
        categoryId: parseInt(data.categoryId),
      };
      
      return apiRequest('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(incidentData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Incidencia creada',
        description: 'La incidencia ha sido reportada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      setLocation('/admin/incidents');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la incidencia.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    createMutation.mutate(data);
  };

  // Datos de muestra para categorías si no cargan de la API
  const sampleCategories = [
    { id: 1, name: 'Mantenimiento', description: 'Problemas de mantenimiento general' },
    { id: 2, name: 'Seguridad', description: 'Incidentes de seguridad' },
    { id: 3, name: 'Limpieza', description: 'Problemas de limpieza' },
    { id: 4, name: 'Infraestructura', description: 'Daños en infraestructura' },
    { id: 5, name: 'Vandalismo', description: 'Actos de vandalismo' },
  ];

  // Filtros defensivos para datos con valores válidos
  const safeCategories = React.useMemo(() => {
    const categoriesToUse = categories.length > 0 ? categories : sampleCategories;
    return categoriesToUse.filter((category: any) => 
      category && 
      category.id && 
      category.name && 
      category.name.trim() !== '' &&
      category.id.toString().trim() !== ''
    );
  }, [categories]);

  const safeParks = React.useMemo(() => {
    if (!Array.isArray(parks)) return [];
    return parks.filter((park: any) => 
      park && 
      park.id && 
      park.name && 
      park.name.trim() !== '' &&
      park.id.toString().trim() !== ''
    );
  }, [parks]);

  const safeAssets = React.useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter((asset: any) => 
      asset && 
      asset.id && 
      asset.name && 
      asset.name.trim() !== '' &&
      asset.id.toString().trim() !== ''
    );
  }, [assets]);

  const displayCategories = safeCategories;

  // Preseleccionar el activo y cargar información automáticamente si viene de la URL
  useEffect(() => {
    if (assetIdFromUrl && safeAssets.length > 0) {
      const asset = safeAssets.find((a: any) => a.id === parseInt(assetIdFromUrl));
      if (asset) {
        // Cargar datos del activo automáticamente
        form.setValue('assetId', assetIdFromUrl);
        form.setValue('parkId', asset.parkId?.toString() || '');
        
        // Construir ubicación automática basada en la información del activo
        let locationDescription = '';
        
        // Incluir ubicación descriptiva si existe
        if (asset.locationDescription && asset.locationDescription.trim()) {
          locationDescription = asset.locationDescription.trim();
        }
        
        // Agregar coordenadas si existen
        if (asset.latitude && asset.longitude) {
          const coords = `${parseFloat(asset.latitude).toFixed(6)}, ${parseFloat(asset.longitude).toFixed(6)}`;
          locationDescription = locationDescription 
            ? `${locationDescription} (Coordenadas: ${coords})`
            : `Coordenadas: ${coords}`;
        }
        
        // Si no hay ubicación específica, usar información básica del activo
        if (!locationDescription) {
          locationDescription = `Área del activo: ${asset.name}`;
        }
        
        form.setValue('location', locationDescription);
        
        console.log('🎯 Datos del activo cargados automáticamente:', {
          assetId: asset.id,
          assetName: asset.name,
          parkId: asset.parkId,
          location: locationDescription,
          coordinates: asset.latitude && asset.longitude ? `${asset.latitude}, ${asset.longitude}` : 'No disponibles'
        });
      }
    }
  }, [assetIdFromUrl, safeAssets, form]);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin/incidents')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Incidencias
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Reportar Nueva Incidencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Incidencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Daño en resbaladilla" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prioridad */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Categoría */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {displayCategories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parque */}
                  <FormField
                    control={form.control}
                    name="parkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Parque
                          {assetIdFromUrl && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Cargado automáticamente
                            </span>
                          )}
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!!assetIdFromUrl}
                        >
                          <FormControl>
                            <SelectTrigger className={assetIdFromUrl ? "bg-gray-50 cursor-not-allowed" : ""}>
                              <SelectValue placeholder="Seleccionar parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {safeParks.map((park: any) => (
                              <SelectItem key={park.id} value={park.id.toString()}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assetIdFromUrl && (
                          <p className="text-xs text-gray-600">
                            El parque se cargó automáticamente desde el activo seleccionado
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Activo (opcional) */}
                  {safeAssets.length > 0 && (
                    <FormField
                      control={form.control}
                      name="assetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activo Relacionado (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar activo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin activo específico</SelectItem>
                              {safeAssets.map((asset: any) => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                  {asset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Ubicación */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Ubicación Específica
                          {assetIdFromUrl && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Incluye coordenadas
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Área de juegos infantiles" 
                            {...field}
                            readOnly={!!assetIdFromUrl}
                            className={assetIdFromUrl ? "bg-gray-50 cursor-not-allowed" : ""}
                          />
                        </FormControl>
                        {assetIdFromUrl && (
                          <p className="text-xs text-gray-600">
                            La ubicación se cargó automáticamente del activo con coordenadas precisas
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Detallada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe la incidencia con el mayor detalle posible..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reportado por */}
                  <FormField
                    control={form.control}
                    name="reportedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reportado Por</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del responsable" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Información de contacto */}
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Información de Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Email o teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha */}
                <div>
                  <Label>Fecha de la Incidencia</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border w-fit"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/incidents')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createMutation.isPending ? 'Guardando...' : 'Crear Incidencia'}
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

export default NewIncidentPage;