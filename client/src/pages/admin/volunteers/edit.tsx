import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, UserEdit } from "lucide-react";

// Esquema de validación para editar voluntario
const editVolunteerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  
  // Información personal
  gender: z.enum(['masculino', 'femenino', 'no_especificar']),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  
  // Información de contacto de emergencia
  emergencyContactName: z.string().min(1, 'El nombre del contacto de emergencia es requerido'),
  emergencyContactPhone: z.string().min(10, 'El teléfono de emergencia debe tener al menos 10 dígitos'),
  
  // Información de voluntariado
  preferredParkId: z.string().optional(),
  volunteerExperience: z.string().optional(),
  skills: z.string().optional(),
  availability: z.enum(['weekdays', 'weekends', 'evenings', 'mornings', 'flexible']),
  
  // Áreas de interés
  interestNature: z.boolean().optional(),
  interestEvents: z.boolean().optional(),
  interestEducation: z.boolean().optional(),
  interestMaintenance: z.boolean().optional(),
  interestSports: z.boolean().optional(),
  interestCultural: z.boolean().optional(),
  
  // Consentimientos legales
  legalConsent: z.boolean().refine(val => val === true, 'Debe aceptar los términos legales'),
  ageConsent: z.boolean().refine(val => val === true, 'Debe confirmar ser mayor de edad'),
  conductConsent: z.boolean().refine(val => val === true, 'Debe aceptar el código de conducta'),
  
  // Municipalidad
  municipalityId: z.number().optional(),
});

type EditVolunteerForm = z.infer<typeof editVolunteerSchema>;

export default function EditVolunteerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute('/admin/volunteers/edit/:id');
  const volunteerId = params?.id;

  const form = useForm<EditVolunteerForm>({
    resolver: zodResolver(editVolunteerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'no_especificar',
      birthDate: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      preferredParkId: '',
      volunteerExperience: '',
      skills: '',
      availability: 'flexible',
      interestNature: false,
      interestEvents: false,
      interestEducation: false,
      interestMaintenance: false,
      interestSports: false,
      interestCultural: false,
      legalConsent: false,
      ageConsent: false,
      conductConsent: false,
      municipalityId: 2, // Guadalajara por defecto
    },
  });

  // Obtener datos del voluntario
  const { data: volunteerData, isLoading: isLoadingVolunteer } = useQuery({
    queryKey: ['/api/volunteers', volunteerId],
    queryFn: async () => {
      const response = await fetch(`/api/volunteers/${volunteerId}`);
      if (!response.ok) throw new Error('Error al obtener datos del voluntario');
      return response.json();
    },
    enabled: !!volunteerId,
  });

  // Obtener parques para el selector
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Llenar el formulario cuando se cargan los datos
  useEffect(() => {
    if (volunteerData) {
      form.reset({
        firstName: volunteerData.firstName || '',
        lastName: volunteerData.lastName || '',
        email: volunteerData.email || '',
        phone: volunteerData.phone || '',
        gender: volunteerData.gender || 'no_especificar',
        birthDate: volunteerData.birthDate || '',
        address: volunteerData.address || '',
        emergencyContactName: volunteerData.emergencyContactName || volunteerData.emergency_contact || '',
        emergencyContactPhone: volunteerData.emergencyContactPhone || volunteerData.emergency_phone || '',
        preferredParkId: volunteerData.preferredParkId?.toString() || volunteerData.preferred_park_id?.toString() || '',
        volunteerExperience: volunteerData.volunteerExperience || volunteerData.previous_experience || '',
        skills: volunteerData.skills || '',
        availability: volunteerData.availability || 'flexible',
        interestNature: volunteerData.interestNature || false,
        interestEvents: volunteerData.interestEvents || false,
        interestEducation: volunteerData.interestEducation || false,
        interestMaintenance: volunteerData.interestMaintenance || false,
        interestSports: volunteerData.interestSports || false,
        interestCultural: volunteerData.interestCultural || false,
        legalConsent: volunteerData.legalConsent || true,
        ageConsent: volunteerData.ageConsent || true,
        conductConsent: volunteerData.conductConsent || true,
        municipalityId: volunteerData.municipalityId || 2,
      });
    }
  }, [volunteerData, form]);

  // Mutación para actualizar voluntario
  const updateVolunteerMutation = useMutation({
    mutationFn: async (data: EditVolunteerForm) => {
      const response = await apiRequest(`/api/volunteers/${volunteerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Voluntario actualizado',
        description: 'Los datos del voluntario han sido actualizados exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      setLocation('/admin/volunteers');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el voluntario',
        variant: 'destructive',
      });
      console.error('Error actualizando voluntario:', error);
    },
  });

  const onSubmit = (data: EditVolunteerForm) => {
    updateVolunteerMutation.mutate(data);
  };

  if (isLoadingVolunteer) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <p>Cargando datos del voluntario...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin/volunteers')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Voluntarios
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <UserEdit className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Editar Voluntario</h1>
          </div>
          <p className="text-muted-foreground">
            Actualice la información del voluntario
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Datos básicos del voluntario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese el nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingrese el apellido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@email.com" {...field} />
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
                          <Input placeholder="Número de teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="no_especificar">No especificar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilidad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekdays">Días de semana</SelectItem>
                            <SelectItem value="weekends">Fines de semana</SelectItem>
                            <SelectItem value="evenings">Tardes</SelectItem>
                            <SelectItem value="mornings">Mañanas</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Información de Contacto de Emergencia */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
                <CardDescription>Información de contacto en caso de emergencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información de Voluntariado */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Voluntariado</CardTitle>
                <CardDescription>Preferencias y experiencia del voluntario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredParkId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parque Preferido</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un parque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin preferencia</SelectItem>
                          {parks?.map((park: any) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
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
                  name="volunteerExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experiencia Previa</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa su experiencia previa como voluntario..." 
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades y Talentos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa sus habilidades y talentos..." 
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Áreas de Interés */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Interés</CardTitle>
                <CardDescription>Seleccione las áreas en las que le gustaría participar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interestNature"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Naturaleza y Medio Ambiente</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Eventos y Actividades</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestEducation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Educación Ambiental</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestMaintenance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mantenimiento y Jardinería</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestSports"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Deportes y Recreación</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestCultural"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Actividades Culturales</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Consentimientos Legales */}
            <Card>
              <CardHeader>
                <CardTitle>Consentimientos Legales</CardTitle>
                <CardDescription>Aceptación de términos y condiciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="legalConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Acepto los términos y condiciones legales</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Confirmo que soy mayor de edad</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conductConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Acepto el código de conducta del voluntario</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/admin/volunteers')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateVolunteerMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateVolunteerMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}