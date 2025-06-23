import React, { useEffect, useState } from 'react';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  Loader,
  MapPin,
  Image,
  FileText,
  Tag,
  Calendar,
  BadgeCheck,
  Building,
  Upload,
  Star,
  Trash,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define el esquema de validación para el formulario
const parkSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  municipalityId: z.coerce.number().refine(val => val > 0, 'Seleccione un municipio'),
  parkType: z.string().min(1, 'Seleccione un tipo de parque'),
  address: z.string().min(1, 'La dirección es requerida'),
  description: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  foundationYear: z.coerce.number().nullable().optional(),
  hasAccessibility: z.boolean().default(false),
  hasSportsAreas: z.boolean().default(false),
  hasPlayground: z.boolean().default(false),
  hasRestrooms: z.boolean().default(false),
  openingHours: z.string().nullable().optional(),
  administrator: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
});

type ParkFormValues = z.infer<typeof parkSchema>;

const AdminParkEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useWouterLocation();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();
  
  // Estados para recursos multimedia y amenidades
  const [parkImages, setParkImages] = useState<any[]>([]);
  const [parkDocuments, setParkDocuments] = useState<any[]>([]);
  const [parkAmenities, setParkAmenities] = useState<any[]>([]);
  
  // Consulta los datos del parque si estamos editando
  const { data: park, isLoading } = useQuery({
    queryKey: [`/api/parks/${id}`],
    enabled: isEdit,
    gcTime: 0,
    staleTime: 0
  });
  
  // Consulta la lista de municipios
  const { data: municipalities } = useQuery({
    queryKey: ['/api/municipalities'],
  });
  
  // Definir el formulario con react-hook-form
  const form = useForm<ParkFormValues>({
    resolver: zodResolver(parkSchema),
    defaultValues: {
      name: '',
      municipalityId: 0,
      parkType: '',
      address: '',
      description: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      area: '',
      foundationYear: null,
      hasAccessibility: false,
      hasSportsAreas: false,
      hasPlayground: false,
      hasRestrooms: false,
      openingHours: '',
      administrator: '',
      contactPhone: '',
      contactEmail: '',
      videoUrl: '',
    },
  });
  
  // Cargar los datos del parque en el formulario cuando estén disponibles
  useEffect(() => {
    if (park && isEdit) {
      console.log("Datos del parque cargados:", park);
      
      // Crear un objeto con los valores por defecto en caso de que falten propiedades
      const formValues = {
        name: park.name || '',
        municipalityId: park.municipalityId || 0,
        parkType: park.parkType || '',
        address: park.address || '',
        description: park.description || '',
        postalCode: park.postalCode || '',
        latitude: park.latitude || '',
        longitude: park.longitude || '',
        area: park.area || '',
        foundationYear: park.foundationYear || undefined,
        hasAccessibility: !!park.hasAccessibility,
        hasSportsAreas: !!park.hasSportsAreas,
        hasPlayground: !!park.hasPlayground,
        hasRestrooms: !!park.hasRestrooms,
        openingHours: park.openingHours || '',
        administrator: park.administrator || '',
        contactPhone: park.contactPhone || '',
        contactEmail: park.contactEmail || '',
        videoUrl: park.videoUrl || '',
      };
      
      form.reset(formValues);
      
      // Cargar recursos multimedia si están disponibles
      const loadMultimediaResources = async () => {
        try {
          // Imágenes
          const imagesResponse = await fetch(`/api/parks/${id}/images`);
          if (imagesResponse.ok) {
            const images = await imagesResponse.json();
            setParkImages(images);
          }
          
          // Documentos
          const documentsResponse = await fetch(`/api/parks/${id}/documents`);
          if (documentsResponse.ok) {
            const documents = await documentsResponse.json();
            setParkDocuments(documents);
          }
          
          // Amenidades
          const amenitiesResponse = await fetch(`/api/parks/${id}/amenities`);
          if (amenitiesResponse.ok) {
            const amenities = await amenitiesResponse.json();
            setParkAmenities(amenities);
          }
        } catch (error) {
          console.error('Error cargando recursos multimedia:', error);
        }
      };
      
      loadMultimediaResources();
    }
  }, [park, isEdit, form, id]);
  
  const onSubmit = (values: ParkFormValues) => {
    console.log('Formulario enviado con valores:', values);
    console.log('Estado del formulario:', form.formState);
    console.log('Errores del formulario:', form.formState.errors);
    mutation.mutate(values);
  };
  
  // Mutación para crear o actualizar el parque
  const mutation = useMutation({
    mutationFn: async (values: ParkFormValues) => {
      const endpoint = isEdit ? `/api/parks/${id}` : '/api/parks';
      const method = isEdit ? 'PUT' : 'POST';
      
      return await apiRequest(endpoint, {
        method: method,
        data: values,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/parks'] });
      toast({
        title: isEdit ? 'Parque actualizado' : 'Parque creado',
        description: `El parque ha sido ${isEdit ? 'actualizado' : 'creado'} correctamente.`,
      });
      setLocation('/admin/parks');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Ocurrió un error al ${isEdit ? 'actualizar' : 'crear'} el parque: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  if (isLoading && isEdit) {
    return (
      <AdminLayout title="Cargando parque...">
        <div className="flex items-center justify-center h-full">
          <Loader className="h-12 w-12 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout 
      title={isEdit ? `Editar parque: ${park?.name || ''}` : 'Nuevo parque'} 
      subtitle={isEdit ? "Actualiza la información del parque" : "Ingresa la información para crear un nuevo parque"}
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/admin/parks')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="media">Multimedia</TabsTrigger>
              <TabsTrigger value="amenities">Amenidades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Información general sobre el parque
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre del parque */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">Nombre del parque *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del parque" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Municipio */}
                    <FormField
                      control={form.control}
                      name="municipalityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">Municipio *</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un municipio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {municipalities?.map((municipality: any) => (
                                <SelectItem 
                                  key={municipality.id} 
                                  value={municipality.id.toString()}
                                >
                                  {municipality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Tipo de parque */}
                  <FormField
                    control={form.control}
                    name="parkType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-600">Tipo de Parque *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo de parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Urbano">Parque Urbano</SelectItem>
                            <SelectItem value="Metropolitano">Parque Metropolitano</SelectItem>
                            <SelectItem value="Linear">Parque Linear</SelectItem>
                            <SelectItem value="Comunitario">Parque Comunitario</SelectItem>
                            <SelectItem value="Natural">Parque Natural</SelectItem>
                            <SelectItem value="Temático">Parque Temático</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Descripción */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción general del parque..." 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dirección */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">Dirección *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección completa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Código postal */}
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="Código postal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latitud */}
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 19.432608" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Longitud */}
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: -99.133209" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Área */}
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área (m²)</FormLabel>
                          <FormControl>
                            <Input placeholder="Superficie en metros cuadrados" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Año de fundación */}
                    <FormField
                      control={form.control}
                      name="foundationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año de fundación</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Año de fundación"
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              value={field.value === null ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Características */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Características</h3>
                      
                      <FormField
                        control={form.control}
                        name="hasAccessibility"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Accesibilidad para discapacitados</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hasSportsAreas"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Áreas deportivas</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">&nbsp;</h3>
                      
                      <FormField
                        control={form.control}
                        name="hasPlayground"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Áreas infantiles</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hasRestrooms"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Baños públicos</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Horario y contacto */}
                  <div>
                    <FormField
                      control={form.control}
                      name="openingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario de apertura</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Lunes a Domingo de 6:00 a 22:00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Administrador */}
                    <FormField
                      control={form.control}
                      name="administrator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administrador</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del administrador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Teléfono de contacto */}
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="Teléfono de contacto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Correo electrónico */}
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico de contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Correo electrónico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* URL de video */}
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de video (YouTube, Vimeo, etc.)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL del video" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div></div>
                  <Button 
                    onClick={() => setActiveTab('media')}
                  >
                    Siguiente
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Multimedia</CardTitle>
                  <CardDescription>
                    Imágenes y documentos del parque
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Imágenes</h3>
                    {parkImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {parkImages.map((image: any) => (
                          <div key={image.id} className="relative group">
                            <img 
                              src={image.imageUrl} 
                              alt={`Imagen del parque ${park?.name || ''}`} 
                              className="h-40 w-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-2">
                                {image.isPrimary ? (
                                  <Badge variant="default" className="absolute top-2 right-2">
                                    Principal
                                  </Badge>
                                ) : (
                                  <Button type="button" size="sm" variant="outline" className="bg-white">
                                    <Star className="h-4 w-4 mr-1" />
                                    Principal
                                  </Button>
                                )}
                                <Button type="button" size="sm" variant="destructive">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay imágenes disponibles. Puede subir imágenes después de crear el parque.
                      </p>
                    )}
                    {isEdit && (
                      <Button type="button" variant="outline" className="w-full h-32 border-dashed">
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <span>Subir imágenes</span>
                        </div>
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Los documentos podrán ser subidos después de crear el parque.
                    </p>
                    {isEdit && (
                      <Button type="button" variant="outline" className="w-full h-32 border-dashed" disabled>
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <span>Subir documentos</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            (Disponible después de guardar)
                          </span>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('basic')}>
                    Anterior
                  </Button>
                  <Button onClick={() => setActiveTab('amenities')}>
                    Siguiente
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="amenities">
              <Card>
                <CardHeader>
                  <CardTitle>Amenidades</CardTitle>
                  <CardDescription>
                    Servicios y amenidades disponibles en el parque
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Amenidades del parque</h3>
                    {parkAmenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {parkAmenities.map((amenity: any) => (
                          <div key={amenity.id} className="flex items-center p-3 border rounded-md">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{amenity.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{amenity.category}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay amenidades asociadas a este parque.
                      </p>
                    )}
                    
                    {isEdit && (
                      <div className="mt-4">
                        <Button type="button" variant="outline" className="w-full">
                          <Tag className="h-4 w-4 mr-2" />
                          Agregar amenidades
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('media')}>
                    Anterior
                  </Button>
                  <Button 
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Actualizar Parque' : 'Crear Parque'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </AdminLayout>
  );
};

export default AdminParkEdit;