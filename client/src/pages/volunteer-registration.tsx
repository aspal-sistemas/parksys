import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  CheckCircle, 
  Heart, 
  Loader2,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

// Esquema de validación
const volunteerFormSchema = z.object({
  full_name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().min(1, { message: 'El correo electrónico es obligatorio' }).email({ message: 'Correo electrónico inválido' }),
  phone: z.string().min(10, { message: 'Número de teléfono inválido' }),
  address: z.string().min(5, { message: 'Dirección inválida' }),
  gender: z.string().min(1, { message: 'El género es obligatorio' }),
  age: z.number().min(18, { message: 'Debes ser mayor de 18 años' }).optional().nullable(),
  preferred_park_id: z.number().optional().nullable(),
  emergency_contact: z.string().min(3, { message: 'El contacto de emergencia es obligatorio' }),
  emergency_phone: z.string().min(10, { message: 'El teléfono de emergencia es obligatorio' }),
  available_hours: z.string().optional(),
  available_days: z.array(z.string()).or(z.string()).optional(),
  interest_areas: z.array(z.string()).or(z.string()).optional(),
  previous_experience: z.string().optional(),
  legal_consent: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el consentimiento legal para registrarte',
  }),
  status: z.string().default("activo")
});

type VolunteerFormData = z.infer<typeof volunteerFormSchema>;

export default function VolunteerRegistration() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener parques para el select
  const { data: parks } = useQuery({
    queryKey: ['/api/parks?simple=true'],
    retry: false,
  });

  // Definir el formulario
  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      gender: '',
      age: null,
      preferred_park_id: null,
      emergency_contact: '',
      emergency_phone: '',
      available_hours: '',
      available_days: [],
      interest_areas: [],
      previous_experience: '',
      legal_consent: false,
      status: 'activo'
    }
  });

  const registerVolunteer = useMutation({
    mutationFn: async (data: VolunteerFormData) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const formData = new FormData();
        
        // Añadir todos los campos al FormData
        for (const [key, value] of Object.entries(data)) {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        }
        
        const response = await fetch('/api/volunteers', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al registrar voluntario');
        }

        return await response.json();
      } catch (err: any) {
        setError(err.message || 'Error al registrar voluntario');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Registro exitoso",
        description: "Te has registrado como voluntario correctamente.",
        variant: "default",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error en el registro",
        description: error.message || "No se pudo completar el registro. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: VolunteerFormData) => {
    registerVolunteer.mutate(data);
  };

  if (success) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 mr-2" />
              <CardTitle>¡Registro exitoso!</CardTitle>
            </div>
            <CardDescription>Gracias por registrarte como voluntario</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="flex justify-center">
                <Heart className="h-16 w-16 text-green-600 dark:text-green-500 mb-4" />
              </div>
              <h3 className="text-xl font-medium mb-2">Tu solicitud ha sido recibida</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Gracias por tu interés en ser parte de nuestro programa de voluntariado. Te contactaremos pronto para los siguientes pasos.
              </p>
              <Button 
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
                className="mt-4"
              >
                Registrar otro voluntario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-2xl">
            <UserPlus className="h-6 w-6 mr-2" />
            Registro de Voluntarios
          </CardTitle>
          <CardDescription>
            Regístrate como voluntario para contribuir en nuestros parques
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Información Personal</h3>
                  <p className="text-sm text-muted-foreground">Proporciona tu información básica de contacto</p>
                </div>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre y apellidos" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tu nombre completo como aparece en tu identificación oficial
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="tu@email.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Tu dirección de correo electrónico para comunicaciones importantes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de teléfono" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tu número telefónico principal de contacto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                        <FormLabel>Edad *</FormLabel>
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
                        <FormLabel>Dirección *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Dirección completa" 
                            {...field} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Información de Emergencia</h3>
                  <p className="text-sm text-muted-foreground">Contacto en caso de emergencia</p>
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Contacto de Emergencia *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre completo del contacto de emergencia" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Persona a contactar en caso de emergencia
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergency_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Emergencia *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Número de teléfono para emergencias" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Teléfono del contacto para emergencias
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Preferencias y Experiencia</h3>
                  <p className="text-sm text-muted-foreground">Información sobre tu experiencia y disponibilidad</p>
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="available_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas Disponibles</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Tardes de lunes a viernes, fines de semana completos" 
                              {...field} 
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
                      name="interest_areas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Áreas de Interés</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Educación ambiental, jardinería, atención a visitantes" 
                              {...field} 
                              value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Áreas o actividades de interés para el voluntariado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="previous_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia Previa</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Experiencia previa en actividades similares o habilidades relevantes" 
                              {...field} 
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Detalle cualquier experiencia previa en actividades relevantes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {parks && parks.length > 0 && (
                      <FormField
                        control={form.control}
                        name="preferred_park_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parque Preferido</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString() || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar parque" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {parks.map((park: any) => (
                                  <SelectItem key={park.id} value={park.id.toString()}>
                                    {park.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Parque donde prefieres realizar actividades de voluntariado
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div>
                      <Label>Fotografía del Voluntario</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            // Función para subir imagen (implementación posterior)
                          }}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Sube una foto para tu perfil de voluntario (máx. 5MB, formatos: jpg, jpeg, png)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Términos y Consentimiento</h3>
                  <p className="text-sm text-muted-foreground">Aceptación de términos y consentimiento legal</p>
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="legal_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Consentimiento Legal *
                          </FormLabel>
                          <FormDescription>
                            Acepto los términos y condiciones del programa de voluntariado. Autorizo el uso de mis datos personales para los fines del programa y acepto ser contactado para actividades relacionadas.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <CardFooter className="flex justify-between border-t pt-6 px-0">
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Registrarme como voluntario'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}