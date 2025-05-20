import React from 'react';
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
import { 
  AlertCircle, 
  CheckCircle, 
  Heart, 
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Esquema de validación
const volunteerFormSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  email: z.string().min(1, { message: 'El correo electrónico es obligatorio' }).email({ message: 'Correo electrónico inválido' }),
  phoneNumber: z.string().min(10, { message: 'Número de teléfono inválido' }),
  address: z.string().min(5, { message: 'Dirección inválida' }),
  gender: z.string().min(1, { message: 'El género es obligatorio' }),
  preferredParkId: z.number().optional(),
  birthDate: z.string().refine(value => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    
    // Validar que sea mayor de 18 años
    const today = new Date();
    const minAgeDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return date <= minAgeDate;
  }, { message: 'Debes ser mayor de 18 años para registrarte' }),
  emergencyContact: z.string().min(3, { message: 'Contacto de emergencia inválido' }),
  emergencyPhone: z.string().min(10, { message: 'Teléfono de emergencia inválido' }),
  occupation: z.string().min(1, { message: 'La ocupación es obligatoria' }),
  availability: z.string().min(1, { message: 'Debes seleccionar tu disponibilidad' }),
  skills: z.string().min(1, { message: 'Las habilidades son obligatorias' }),
  interests: z.string().min(1, { message: 'Los intereses son obligatorios' }),
  previousExperience: z.string().min(1, { message: 'La experiencia previa es obligatoria' }),
  healthConditions: z.string().min(1, { message: 'Las condiciones de salud son obligatorias' }),
  additionalComments: z.string().optional(),
  profileImage: z.instanceof(File).optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
  legalConsent: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el consentimiento legal para voluntariado'
  })
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const VolunteerRegistration = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  // Obtener la lista de parques para el selector
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Configuración del formulario
  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthDate: '',
      emergencyContact: '',
      emergencyPhone: '',
      occupation: '',
      availability: '',
      skills: '',
      interests: '',
      previousExperience: '',
      healthConditions: '',
      additionalComments: '',
      termsAccepted: false,
      legalConsent: false,
      gender: '',
      preferredParkId: undefined
    }
  });

  // Mutación para enviar datos
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: VolunteerFormValues) => {
      console.log("Enviando datos:", data);
      
      // Convertir la fecha a un formato de string para enviarla
      const formattedData = {
        ...data,
        termsAccepted: data.termsAccepted ? 'true' : 'false'
      };
      
      // Crear FormData para enviar datos incluyendo la imagen
      const formData = new FormData();
      
      // Agregar todos los campos de texto
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key !== 'profileImage' && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // Agregar la imagen si existe
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }
      
      console.log("FormData preparado para envío");
      
      try {
        const response = await fetch('/api/volunteers/register', {
          method: 'POST',
          // No incluimos Content-Type para que el navegador establezca el boundary correcto para FormData
          body: formData
        });
        
        console.log("Respuesta recibida:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error del servidor:", errorData);
          throw new Error(errorData.message || 'Error al procesar el registro');
        }
        
        return await response.json();
      } catch (err) {
        console.error("Error en la solicitud:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      setSubmitted(true);
      toast({
        title: "Registro exitoso",
        description: "Tu solicitud ha sido enviada. Te contactaremos pronto.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error en el registro",
        description: "Hubo un problema al enviar tu solicitud. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Manejador para la subida de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Crear URL para previsualizar la imagen
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Actualizar el valor en el formulario
      form.setValue('profileImage', file);
    }
  };
  
  // Envío del formulario
  const onSubmit = async (data: VolunteerFormValues) => {
    // Directamente usamos los datos del formulario en la mutación
    mutate(data);
  };

  if (submitted) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600 flex items-center justify-center">
              <CheckCircle className="mr-2 h-6 w-6" />
              ¡Registro Completado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Gracias por registrarte como voluntario. Hemos recibido tu solicitud y la estamos procesando.</p>
            <p className="mb-4">En breve, un miembro de nuestro equipo se pondrá en contacto contigo para continuar con el proceso.</p>
            
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">¿Qué sigue?</h3>
              <ol className="list-decimal list-inside text-left text-green-700">
                <li className="mb-2">Recibirás un correo de confirmación</li>
                <li className="mb-2">Te contactaremos para una breve entrevista</li>
                <li className="mb-2">Asistirás a una orientación</li>
                <li>¡Comenzarás a participar en actividades!</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Registro de Voluntarios</h1>
          <p className="text-gray-600">Únete a nuestro programa de voluntariado y ayuda a mejorar los parques públicos de tu ciudad</p>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.'}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              Formulario de Registro
            </CardTitle>
            <CardDescription>
              Completa todos los campos obligatorios para registrarte como voluntario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Personal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu nombre completo" {...field} />
                          </FormControl>
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
                            <Input type="email" placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de teléfono *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 55 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de nacimiento *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
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
                        <FormLabel>Dirección *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dirección completa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocupación</FormLabel>
                        <FormControl>
                          <Input placeholder="Estudiante, profesionista, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Parque Preferido</h3>
                  <FormField
                    control={form.control}
                    name="preferredParkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parque preferido</FormLabel>
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
                            {parks?.map((park) => (
                              <SelectItem key={park.id} value={park.id.toString()}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecciona el parque donde prefieres realizar tus actividades como voluntario
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contacto de emergencia</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de contacto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de emergencia *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 55 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información para el voluntariado</h3>
                  
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilidad de tiempo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu disponibilidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fines_de_semana">Fines de semana</SelectItem>
                            <SelectItem value="dias_semana">Días entre semana</SelectItem>
                            <SelectItem value="mananas">Mañanas</SelectItem>
                            <SelectItem value="tardes">Tardes</SelectItem>
                            <SelectItem value="flexible">Horario flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Habilidades y capacidades</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tus habilidades (jardinería, educación ambiental, primeros auxilios, etc.)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Áreas de interés</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿En qué áreas te gustaría participar? (mantenimiento, eventos, educación, etc.)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="previousExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiencia previa en voluntariado</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos si has participado antes en actividades de voluntariado" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fotografía</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Foto de perfil</label>
                    <div className="flex flex-col space-y-2">
                      {previewUrl && (
                        <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={previewUrl} 
                            alt="Vista previa" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="max-w-md"
                      />
                      <p className="text-xs text-gray-500">
                        Sube una foto clara para tu identificación como voluntario (opcional)
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium">Información adicional</h3>
                  
                  <FormField
                    control={form.control}
                    name="healthConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condiciones de salud</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Alergias, condiciones médicas o limitaciones físicas que debamos conocer" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Esta información es confidencial y solo será utilizada en caso de emergencia.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentarios adicionales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cualquier información adicional que quieras compartir" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 mt-1"
                            checked={field.value}
                            onChange={field.onChange}
                            id="termsAccepted"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="termsAccepted">
                            Acepto los términos y condiciones *
                          </FormLabel>
                          <FormDescription>
                            Al marcar esta casilla, confirmo que la información proporcionada es correcta
                            y acepto los términos del programa de voluntariado.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    * Campos obligatorios
                  </p>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    onClick={() => {
                      console.log('Formulario enviado', form.getValues());
                      console.log('Errores:', form.formState.errors);
                    }}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar solicitud
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerRegistration;