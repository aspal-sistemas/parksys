import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, CheckCircle, ChevronLeft, Save, Trash, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schema de validación para edición de voluntario
const volunteerFormSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es obligatorio'),
  status: z.string(),
  email: z.string().email('Correo electrónico inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  age: z.number().int().min(16).max(99).optional().nullable(),
  profileImageUrl: z.string().url('URL de imagen inválida').optional().nullable(),
  availableHours: z.string().optional().nullable(),
  previousExperience: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  preferredParkId: z.number().int().optional().nullable(),
  interestAreas: z.string().optional().nullable(),
  availableDays: z.string().optional().nullable(),
  legalConsent: z.boolean().default(true),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const EditVolunteer = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Fetch volunteer data
  const { data: volunteer, isLoading, isError } = useQuery({
    queryKey: [`/api/volunteers/${id}`],
  });

  // Fetch parks for dropdown
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Setup form with default values from API data
  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      fullName: volunteer?.fullName || '',
      email: volunteer?.email || '',
      phone: volunteer?.phone || '',
      address: volunteer?.address || '',
      gender: volunteer?.gender || '',
      age: volunteer?.age || null,
      status: volunteer?.status || 'active',
      profileImageUrl: volunteer?.profileImageUrl || '',
      availableHours: volunteer?.availableHours || '',
      previousExperience: volunteer?.previousExperience || '',
      emergencyContact: volunteer?.emergencyContact || '',
      preferredParkId: volunteer?.preferredParkId || null,
      interestAreas: volunteer?.interestAreas || '',
      availableDays: volunteer?.availableDays || '',
      legalConsent: volunteer?.legalConsent !== false,
    },
    values: volunteer ? {
      fullName: volunteer.fullName || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      address: volunteer.address || '',
      gender: volunteer.gender || '',
      age: volunteer.age || null,
      status: volunteer.status || 'active',
      profileImageUrl: volunteer.profileImageUrl || '',
      availableHours: volunteer.availableHours || '',
      previousExperience: volunteer.previousExperience || '',
      emergencyContact: volunteer.emergencyContact || '',
      preferredParkId: volunteer.preferredParkId || null,
      interestAreas: volunteer.interestAreas || '',
      availableDays: volunteer.availableDays || '',
      legalConsent: volunteer.legalConsent !== false,
    } : undefined,
  });

  // Update volunteer mutation
  const updateVolunteerMutation = useMutation({
    mutationFn: (data: VolunteerFormValues) => {
      return apiRequest({
        method: 'PUT',
        url: `/api/volunteers/${id}`,
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Voluntario actualizado",
        description: "Los datos del voluntario han sido actualizados exitosamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/volunteers/${id}`],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/volunteers'],
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: "Ocurrió un error al actualizar los datos del voluntario.",
        variant: "destructive",
      });
      console.error("Error updating volunteer:", error);
    }
  });

  // Delete volunteer mutation
  const deleteVolunteerMutation = useMutation({
    mutationFn: () => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/volunteers/${id}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Voluntario eliminado",
        description: "El voluntario ha sido eliminado exitosamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/volunteers'],
      });
      // Redirect back to volunteers list
      setLocation('/admin/volunteers');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: "Ocurrió un error al eliminar el voluntario.",
        variant: "destructive",
      });
      console.error("Error deleting volunteer:", error);
    }
  });

  const handleDeleteVolunteer = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este voluntario? Esta acción no se puede deshacer.')) {
      deleteVolunteerMutation.mutate();
    }
  };

  // Form submission handler
  const onSubmit = (values: VolunteerFormValues) => {
    updateVolunteerMutation.mutate(values);
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Calendar className="h-3 w-3 mr-1" /> Pendiente</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-500">Error al cargar datos</CardTitle>
              <CardDescription>
                No se pudieron cargar los datos del voluntario. Intente nuevamente más tarde o contacte a soporte.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setLocation('/admin/volunteers')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-4"
              onClick={() => setLocation('/admin/volunteers')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Voluntario</h1>
              <p className="text-gray-500">ID: {id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600" onClick={handleDeleteVolunteer}>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="experience">Experiencia</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="general" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>Información básica del voluntario</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {volunteer?.profileImageUrl && (
                        <div className="md:w-1/4 flex flex-col items-center">
                          <div className="rounded-lg overflow-hidden w-48 h-48 mb-2">
                            <img 
                              src={volunteer.profileImageUrl} 
                              alt={volunteer.fullName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {getStatusBadge(volunteer.status)}
                        </div>
                      )}
                      
                      <div className={volunteer?.profileImageUrl ? "md:w-3/4" : "w-full"}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre Completo *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre completo del voluntario" {...field} />
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
                                <FormLabel>Estado *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="suspended">Suspendido</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                  <Input placeholder="Correo electrónico" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número de teléfono" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Género</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value || ''}
                                  value={field.value || ''}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar género" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Femenino</SelectItem>
                                    <SelectItem value="O">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Edad</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Edad" 
                                    {...field} 
                                    value={field.value === null ? '' : field.value}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Dirección completa" 
                                    {...field} 
                                    value={field.value || ''}
                                    className="min-h-[80px]"
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
                            name="emergencyContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contacto de Emergencia</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Nombre y teléfono de contacto de emergencia" 
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Persona a contactar en caso de emergencia
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="profileImageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL de Imagen de Perfil</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://ejemplo.com/imagen.jpg" 
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormDescription>
                                  URL de la fotografía del voluntario
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Disponibilidad
                    </CardTitle>
                    <CardDescription>Información sobre la disponibilidad del voluntario</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="availableHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas Disponibles</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Tardes de lunes a viernes, fines de semana completos" 
                              {...field} 
                              value={field.value || ''}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Descripción de las horas disponibles para voluntariado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availableDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días Disponibles</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Lunes, Miércoles y Sábados" 
                              {...field} 
                              value={field.value || ''}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Especificación de los días disponibles para voluntariado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredParkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parque Preferido</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                            defaultValue={field.value?.toString() || ''}
                            value={field.value?.toString() || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar parque preferido" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin parque preferido</SelectItem>
                              {parks.map((park: any) => (
                                <SelectItem key={park.id} value={park.id.toString()}>
                                  {park.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Parque donde prefiere realizar actividades de voluntariado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interestAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Áreas de Interés</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Educación ambiental, jardinería, atención a visitantes" 
                              {...field} 
                              value={field.value || ''}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Áreas o actividades de interés para el voluntario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Experiencia y Consentimiento
                    </CardTitle>
                    <CardDescription>Información sobre experiencia previa y consentimiento legal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="previousExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia Previa</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Experiencia previa en actividades similares o habilidades relevantes" 
                              {...field} 
                              value={field.value || ''}
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Detalle la experiencia previa del voluntario en actividades relevantes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 mt-1"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Consentimiento Legal</FormLabel>
                            <FormDescription>
                              El voluntario ha otorgado su consentimiento para el procesamiento de sus datos personales y para participar en actividades de voluntariado según los términos y condiciones establecidos.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full" type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EditVolunteer;