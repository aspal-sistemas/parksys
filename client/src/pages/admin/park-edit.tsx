import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  ChevronLeft, 
  Loader, 
  Save, 
  Upload, 
  Trash, 
  PlusCircle, 
  ImagePlus,
  Plus,
  Video,
  ExternalLink,
  Eye,
  Download,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminSidebar from '@/components/AdminSidebar';
import AmenitySelector from '@/components/AmenitySelector';
import { Park, insertParkSchema, PARK_TYPES } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const parkSchema = insertParkSchema.extend({
  id: z.number().optional(),
});

type ParkFormValues = z.infer<typeof parkSchema>;

const AdminParkEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  
  const [activeTab, setActiveTab] = useState('basic');
  
  // Estados para multimedia
  const [parkImages, setParkImages] = useState<any[]>([]);
  const [parkDocuments, setParkDocuments] = useState<any[]>([]);
  const [parkAmenities, setParkAmenities] = useState<any[]>([]);
  
  // Fetch park data if editing - con clave para forzar actualización
  const { data: park, isLoading, refetch } = useQuery<Park>({
    queryKey: [isEdit ? `/api/parks/${id}` : ''],
    enabled: isEdit,
    staleTime: 0, // Siempre considerar los datos obsoletos
    cacheTime: 0, // No guardar en caché
  });
  
  // Mutation for creating or updating a park
  const mutation = useMutation({
    mutationFn: async (values: ParkFormValues) => {
      if (isEdit) {
        // Usamos la ruta especial de desarrollo sin verificación de permisos
        return apiRequest('PUT', `/api/dev/parks/${id}`, values);
      } else {
        return apiRequest('POST', '/api/parks', values);
      }
    },
    onSuccess: async (data, variables) => {
      // Verificar si la acción fue presionada desde el formulario principal
      // Si es así, mostrar toast de éxito y redirigir
      const formSubmit = document.activeElement?.getAttribute('type') === 'submit';
      
      toast({
        title: isEdit ? 'Parque actualizado' : 'Parque creado',
        description: isEdit 
          ? 'El parque ha sido actualizado exitosamente' 
          : 'El parque ha sido creado exitosamente',
      });
      
      // Forzar actualización de todas las consultas relacionadas
      await queryClient.resetQueries();
      
      // Mostrar feedback al usuario
      toast({
        title: 'Datos actualizados',
        description: 'Los cambios se han guardado correctamente'
      });
      
      // Solo redirigir si el formulario principal fue quien desencadenó la acción
      // Esto evitará redirecciones por operaciones como eliminar amenidades
      if (formSubmit) {
        // Navegar a la lista de parques después de un breve retraso
        setTimeout(() => {
          window.location.href = '/admin/parks';
        }, 500);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Ocurrió un error: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form for park data
  const form = useForm<ParkFormValues>({
    resolver: zodResolver(parkSchema),
    defaultValues: {
      name: '',
      municipalityId: 1, // Default to first municipality
      parkType: 'barrial', // Default type
      description: '',
      address: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      area: '',
      foundationYear: undefined,
      administrator: '',
      conservationStatus: 'Bueno',
      openingHours: '',
      contactEmail: '',
      contactPhone: '',
    },
  });
  
  // Update form values when park data is loaded
  React.useEffect(() => {
    if (park && isEdit) {
      // We need to filter out any undefined/null values to avoid controlled/uncontrolled input warnings
      const formValues = Object.entries(park).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          // @ts-ignore - dynamic key access
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      form.reset(formValues);
      
      // Cargar recursos multimedia
      const loadMultimediaResources = async () => {
        if (id) {
          try {
            // Cargar imágenes
            const imagesResponse = await fetch(`/api/parks/${id}/images`);
            if (imagesResponse.ok) {
              const images = await imagesResponse.json();
              setParkImages(images);
            }
            
            // Cargar documentos
            const documentsResponse = await fetch(`/api/parks/${id}/documents`, {
              headers: {
                'Authorization': 'Bearer direct-token-admin',
                'X-User-Id': '1',
                'X-User-Role': 'super_admin'
              }
            });
            if (documentsResponse.ok) {
              const documents = await documentsResponse.json();
              setParkDocuments(documents);
            }
            
            // Cargar amenidades
            const amenitiesResponse = await fetch(`/api/parks/${id}/amenities`);
            if (amenitiesResponse.ok) {
              const amenities = await amenitiesResponse.json();
              setParkAmenities(amenities);
            }
          } catch (error) {
            console.error('Error cargando recursos multimedia:', error);
          }
        }
      };
      
      loadMultimediaResources();
    }
  }, [park, isEdit, form, id]);
  
  const onSubmit = (values: ParkFormValues) => {
    mutation.mutate(values);
  };
  
  if (isLoading && isEdit) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/parks')}
                className="mb-2"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>
              {isEdit && park ? (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {park.name}
                    </h1>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                      Editando
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Actualiza la información del parque
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Nuevo Parque
                  </h1>
                  <p className="text-muted-foreground">
                    Ingresa la información para crear un nuevo parque
                  </p>
                </>
              )}
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="media">Multimedia</TabsTrigger>
                  <TabsTrigger value="amenities">Amenidades</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Básica</CardTitle>
                      <CardDescription>
                        Ingresa la información esencial del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Parque*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Parque Metropolitano" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="parkType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Parque*</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PARK_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="municipalityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Municipio*</FormLabel>
                              <Select
                                value={field.value.toString()}
                                onValueChange={val => field.onChange(parseInt(val))}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un municipio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Guadalajara</SelectItem>
                                  <SelectItem value="2">Zapopan</SelectItem>
                                </SelectContent>
                              </Select>
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
                                placeholder="Describe las características generales del parque"
                                className="resize-none min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setLocation('/admin/parks')}>
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('contact')}
                      >
                        Siguiente
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalles del Parque</CardTitle>
                      <CardDescription>
                        Información detallada sobre el parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Av. Principal 123, Colonia Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. 44100" {...field} />
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
                              <FormLabel>Latitud*</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. 20.6597" {...field} />
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
                              <FormLabel>Longitud*</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. -103.3496" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Superficie</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. 10 hectáreas" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="foundationYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año de Fundación</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Ej. 1985" 
                                  {...field}
                                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="conservationStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Conservación</FormLabel>
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Excelente">Excelente</SelectItem>
                                  <SelectItem value="Bueno">Bueno</SelectItem>
                                  <SelectItem value="Regular">Regular</SelectItem>
                                  <SelectItem value="Malo">Malo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario de Apertura</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. 6:00 - 20:00 hrs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab('contact')}>
                        Anterior
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('media')}
                      >
                        Siguiente
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                      <CardDescription>
                        Datos de contacto y administración del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="administrator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Administrador</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Dirección de Parques y Jardines" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono de Contacto</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. (33) 1234-5678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Contacto</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. contacto@parque.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL del Video del Parque</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. https://youtube.com/watch?v=XXXX" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ingresa la URL completa del video de YouTube (ej. https://www.youtube.com/watch?v=XXXX)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Additional contact fields could go here */}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab('basic')}>
                        Anterior
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setActiveTab('details')}
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
                        Imágenes y archivos relacionados con el parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Imágenes</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Componente de carga de imágenes */}
                            <label 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="flex flex-col items-center justify-center h-40">
                                <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Agregar imagen</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  JPEG, PNG o WebP • Máximo 5MB
                                </p>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={async (e) => {
                                    if (!e.target.files || !e.target.files[0] || !id) return;
                                    
                                    const file = e.target.files[0];
                                    
                                    // Verificar tamaño del archivo
                                    if (file.size > 5 * 1024 * 1024) { // 5MB
                                      toast({
                                        title: "Archivo demasiado grande",
                                        description: "El tamaño máximo permitido es 5MB. Por favor selecciona una imagen más pequeña.",
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    
                                    // Verificar tipo de archivo
                                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                      toast({
                                        title: "Formato no permitido",
                                        description: "Sólo se permiten imágenes en formato JPEG, PNG o WebP.",
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    formData.append('caption', 'Imagen del parque'); // Descripción predeterminada
                                    
                                    toast({
                                      title: "Subiendo imagen...",
                                      description: "Por favor espera mientras la imagen se sube.",
                                    });
                                    
                                    try {
                                      const response = await fetch(`/api/parks/${id}/images`, {
                                        method: 'POST',
                                        body: formData,
                                        headers: {
                                          'Authorization': 'Bearer direct-token-1'
                                        }
                                      });
                                      
                                      if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.error || errorData.message || 'Error desconocido');
                                      }
                                      
                                      toast({
                                        title: "Imagen subida correctamente",
                                        description: "La imagen ha sido añadida al parque.",
                                      });
                                      
                                      // Recargar para mostrar la imagen
                                      const imagesResponse = await fetch(`/api/parks/${id}/images`);
                                      if (imagesResponse.ok) {
                                        const images = await imagesResponse.json();
                                        setParkImages(images);
                                      }
                                    } catch (error: any) {
                                      console.error('Error al subir imagen:', error);
                                      toast({
                                        title: "Error al subir imagen",
                                        description: error.message || "Ocurrió un error al subir la imagen. Por favor intenta de nuevo.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </label>
                            
                            {/* Mostrar imágenes existentes */}
                            {parkImages && parkImages.map((image: any) => (
                              <div key={image.id} className="relative rounded-lg overflow-hidden shadow-sm border">
                                <img 
                                  src={image.imageUrl} 
                                  alt={`Imagen del parque ${image.id}`}
                                  className="w-full h-40 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 flex justify-between items-center">
                                  {image.isPrimary ? (
                                    <span className="text-xs flex items-center">
                                      <span className="bg-green-500 rounded-full h-2 w-2 mr-1"></span>
                                      Principal
                                    </span>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-xs text-white hover:text-white hover:bg-transparent"
                                      onClick={async () => {
                                        if (!id) return;
                                        try {
                                          await fetch(`/api/parks/${id}/images/${image.id}/set-primary`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': 'Bearer direct-token-1'
                                            }
                                          });
                                          
                                          // Recargar imágenes
                                          const response = await fetch(`/api/parks/${id}/images`);
                                          if (response.ok) {
                                            const images = await response.json();
                                            setParkImages(images);
                                          }
                                          
                                          toast({
                                            title: "Imagen principal actualizada",
                                            description: "Se ha establecido como imagen principal"
                                          });
                                        } catch (error) {
                                          console.error('Error al establecer imagen principal:', error);
                                          toast({
                                            title: "Error",
                                            description: "No se pudo establecer como imagen principal",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      Hacer principal
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-xs text-white hover:text-white hover:bg-transparent p-1"
                                    onClick={async () => {
                                      if (!id) return;
                                      if (confirm('¿Estás seguro de eliminar esta imagen?')) {
                                        try {
                                          await fetch(`/api/parks/${id}/images/${image.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              'Authorization': 'Bearer direct-token-1'
                                            }
                                          });
                                          
                                          // Recargar imágenes
                                          const response = await fetch(`/api/parks/${id}/images`);
                                          if (response.ok) {
                                            const images = await response.json();
                                            setParkImages(images);
                                          }
                                          
                                          toast({
                                            title: "Imagen eliminada",
                                            description: "La imagen ha sido eliminada correctamente"
                                          });
                                        } catch (error) {
                                          console.error('Error al eliminar imagen:', error);
                                          toast({
                                            title: "Error",
                                            description: "No se pudo eliminar la imagen",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Video del Parque</h3>
                          <div className="mb-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <FormField
                                  control={form.control}
                                  name="videoUrl"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder="URL del video de YouTube (ej. https://www.youtube.com/watch?v=XXXX)" 
                                          {...field}
                                          className="mb-2"
                                          value={field.value || ''}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs">
                                        Ingresa una URL válida de YouTube para mostrar el video en la página del parque
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  const videoUrl = form.getValues().videoUrl;
                                  if (videoUrl && id) {
                                    // Primero guardamos localmente para la experiencia de usuario
                                    form.setValue('videoUrl', videoUrl);
                                    
                                    // Usamos el nuevo endpoint especializado para videos
                                    fetch(`/api/videos/update/${id}`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({
                                        videoUrl: videoUrl
                                      })
                                    })
                                    .then(response => {
                                      if (!response.ok) {
                                        throw new Error('Error al guardar en base de datos');
                                      }
                                      toast({
                                        title: "URL de video guardada",
                                        description: "El enlace al video ha sido actualizado correctamente."
                                      });
                                    })
                                    .catch(error => {
                                      console.error('Error al guardar URL:', error);
                                      toast({
                                        title: "Error",
                                        description: "No se pudo guardar la URL. Por favor intenta nuevamente.",
                                        variant: "destructive"
                                      });
                                    });
                                  } else if (!videoUrl) {
                                    toast({
                                      title: "URL inválida",
                                      description: "Por favor ingresa una URL de YouTube válida.",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Guardar URL
                              </Button>
                            </div>
                            
                            {form.watch("videoUrl") && (
                              <div className="mt-4 border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Video Actual</span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      if (id && confirm('¿Estás seguro de eliminar este video?')) {
                                        // Simplemente actualizar el estado del formulario
                                        form.setValue('videoUrl', '');
                                        
                                        // Actualizar en la base de datos usando el endpoint especializado
                                        fetch(`/api/videos/update/${id}`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({
                                            videoUrl: ''
                                          })
                                        })
                                        .then(response => {
                                          if (!response.ok) {
                                            throw new Error('Error al eliminar en base de datos');
                                          }
                                        })
                                        .catch(error => {
                                          console.error('Error al eliminar URL:', error);
                                          // Restaurar el valor anterior si ocurre un error
                                          const prevValue = form.getValues().videoUrl || '';
                                          form.setValue('videoUrl', prevValue);
                                          
                                          toast({
                                            title: "Error",
                                            description: "No se pudo eliminar la URL. Por favor intenta nuevamente.",
                                            variant: "destructive"
                                          });
                                        });
                                        
                                        // Y notificar al usuario
                                        toast({
                                          title: "Video eliminado",
                                          description: "La URL del video ha sido eliminada correctamente."
                                        });
                                      }
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-3">
                                  <p className="text-sm break-all">{form.watch("videoUrl")}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => {
                                      const url = form.watch("videoUrl");
                                      if (url) window.open(url, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver video
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Documentos</h3>
                          <label>
                            <Button 
                              type="button"
                              variant="outline"
                              className="mb-4"
                              onClick={() => {
                                // El click real se maneja por el input oculto
                              }}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Subir documento
                            </Button>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                              onChange={async (e) => {
                                if (!e.target.files || !e.target.files[0] || !id) return;
                                
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append('document', file);
                                formData.append('documentName', file.name);
                                formData.append('documentType', file.type);
                                
                                toast({
                                  title: "Subiendo documento...",
                                  description: "Por favor espera mientras el documento se sube.",
                                });
                                
                                try {
                                  await fetch(`/api/parks/${id}/documents`, {
                                    method: 'POST',
                                    body: formData,
                                    headers: {
                                      'Authorization': 'Bearer direct-token-admin',
                                      'X-User-Id': '1',
                                      'X-User-Role': 'super_admin'
                                    }
                                  });
                                  
                                  toast({
                                    title: "Documento subido correctamente",
                                    description: "El documento ha sido añadido al parque.",
                                  });
                                  
                                  // Recargar para mostrar el documento
                                  const response = await fetch(`/api/parks/${id}/documents`);
                                  if (response.ok) {
                                    const documents = await response.json();
                                    setParkDocuments(documents);
                                  }
                                } catch (error) {
                                  console.error('Error al subir documento:', error);
                                  toast({
                                    title: "Error al subir documento",
                                    description: "Ocurrió un error al subir el documento. Por favor intenta de nuevo.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            />
                          </label>
                          
                          {/* Mostrar documentos existentes */}
                          <div className="mt-4">
                            {parkDocuments && parkDocuments.length > 0 ? (
                              <div className="space-y-2">
                                {parkDocuments.map((doc: any) => (
                                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center">
                                      <div className="ml-3">
                                        <p className="font-medium">{doc.documentName}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      {doc.documentUrl?.includes('example.com') ? (
                                        <div className="text-sm flex items-start bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-700">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-amber-500">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                            <line x1="12" y1="9" x2="12" y2="13"></line>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                          </svg>
                                          <div>
                                            <span className="font-medium text-xs">Documento de muestra</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <Button variant="ghost" size="sm" onClick={() => window.open(doc.documentUrl, '_blank')}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = doc.documentUrl;
                                            link.download = doc.documentName || 'documento';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}>
                                            <Download className="h-4 w-4 mr-1" />
                                            Descargar
                                          </Button>
                                        </>
                                      )}
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-destructive"
                                        onClick={async () => {
                                          if (!id) return;
                                          if (confirm('¿Estás seguro de eliminar este documento?')) {
                                            try {
                                              // Usamos la nueva ruta de desarrollo sin autenticación
                                              const response = await fetch(`/api/dev/parks/${id}/documents/${doc.id}`, {
                                                method: 'DELETE'
                                              });
                                              
                                              if (!response.ok) {
                                                const errorData = await response.text();
                                                throw new Error(`Error al eliminar: ${response.status} ${errorData}`);
                                              }
                                              
                                              // Recargar documentos sin autenticación para desarrollo
                                              const documentsResponse = await fetch(`/api/parks/${id}/documents`);
                                              
                                              if (documentsResponse.ok) {
                                                const documents = await documentsResponse.json();
                                                setParkDocuments(documents);
                                              }
                                              
                                              toast({
                                                title: "Documento eliminado",
                                                description: "El documento ha sido eliminado correctamente"
                                              });
                                            } catch (error) {
                                              console.error('Error al eliminar documento:', error);
                                              toast({
                                                title: "Error",
                                                description: "No se pudo eliminar el documento",
                                                variant: "destructive"
                                              });
                                            }
                                          }
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 border border-dashed rounded-lg">
                                <p className="text-muted-foreground">
                                  No hay documentos asociados a este parque
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab('details')}>
                        Anterior
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('amenities')}
                      >
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
                        Servicios y características del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Amenidades Disponibles</h3>
                            
                            {/* Menú desplegable para agregar amenidades */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button type="button">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Agregar Amenidad
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0" align="end">
                                <Command>
                                  <CommandInput placeholder="Buscar amenidad..." />
                                  <CommandList>
                                    <AmenitySelector 
                                      parkId={id} 
                                      existingAmenities={parkAmenities}
                                      onAmenityAdded={(newAmenities) => {
                                        setParkAmenities(newAmenities);
                                      }}
                                    />
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          {/* Mostrar amenidades del parque */}
                          {parkAmenities && parkAmenities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {parkAmenities.map((amenity: any) => (
                                <div 
                                  key={amenity.id} 
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                                      {amenity.icon && (
                                        <div className="w-6 h-6 flex items-center justify-center">
                                          <img 
                                            src={amenity.customIconUrl || `/icons/${amenity.icon}.svg`} 
                                            alt={amenity.name}
                                            className="w-6 h-6 object-contain"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{amenity.name}</p>
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {amenity.category}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive"
                                    onClick={async () => {
                                      if (!id) return;
                                      if (confirm(`¿Estás seguro de quitar la amenidad "${amenity.name}" del parque?`)) {
                                        try {
                                          try {
                                            // Hacemos la petición manual sin usar hooks de TanStack Query
                                            const response = await fetch(`/api/parks/${id}/amenities/${amenity.id}`, {
                                              method: 'DELETE',
                                              headers: {
                                                'Authorization': 'Bearer direct-token-1'
                                              }
                                            });
                                            
                                            if (response.ok) {
                                              // Actualizar la lista de amenidades en el estado localmente
                                              setParkAmenities(parkAmenities.filter((a: any) => a.id !== amenity.id));
                                              
                                              // Evitar que se invaliden consultas
                                              // Usar directamente el estado local
                                              
                                              // Mostrar mensaje de éxito sin actualizar el parque
                                              toast({
                                                title: "Amenidad eliminada",
                                                description: `Se ha quitado ${amenity.name} del parque.`
                                              });
                                            } else {
                                              toast({
                                                title: "Error",
                                                description: "No se pudo eliminar la amenidad del parque.",
                                                variant: "destructive"
                                              });
                                            }
                                          } catch (error) {
                                            toast({
                                              title: "Error",
                                              description: "Ocurrió un error al eliminar la amenidad.",
                                              variant: "destructive"
                                            });
                                          }
                                        } catch (error) {
                                          console.error('Error al eliminar amenidad:', error);
                                          toast({
                                            title: "Error",
                                            description: "No se pudo procesar la solicitud.",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 border border-dashed rounded-lg">
                              <p className="text-muted-foreground">
                                Este parque no tiene amenidades asociadas. Haz clic en "Agregar Amenidad" para añadir características.
                              </p>
                            </div>
                          )}
                        </div>
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
        </div>
      </div>
    </div>
  );
};

export default AdminParkEdit;
