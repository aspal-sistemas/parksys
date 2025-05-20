import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, Save, Upload, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';

// Función para validar edad mínima
const isAdult = (birthDate: Date) => {
  if (!birthDate) return false;
  
  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  
  return birthDate <= minAgeDate;
};

// Definir el esquema de validación del formulario
const volunteerFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }).optional().or(z.literal('')),
  phoneNumber: z.string().min(10, { message: "Ingrese un teléfono válido" }).optional().or(z.literal('')),
  emergencyContact: z.string().min(3, { message: "Ingrese el nombre del contacto de emergencia" }).optional().or(z.literal('')),
  emergencyPhone: z.string().min(10, { message: "Ingrese un teléfono válido para emergencias" }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  birthDate: z.date({  // Cambiado 'birthdate' a 'birthDate' para coincidir con el esquema del backend
    required_error: "La fecha de nacimiento es obligatoria",
    invalid_type_error: "La fecha debe ser válida"
  }).refine(
    isAdult, 
    { message: "El voluntario debe ser mayor de 18 años" }
  ),
  skills: z.string().optional().or(z.literal('')),
  availability: z.string().optional().or(z.literal('')),
  status: z.string().default("pending"),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const NewVolunteer: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      emergencyContact: '',
      emergencyPhone: '',
      address: '',
      skills: '',
      availability: '',
      status: 'pending',
      birthDate: undefined,
    },
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manejar la selección de la imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('El archivo debe ser una imagen (JPG, PNG, GIF o WebP)');
      return;
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no puede superar los 5MB');
      return;
    }
    
    setProfileImage(file);
    
    // Crear URL de vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: (data: VolunteerFormValues) => {
      // Usar FormData para poder enviar el archivo
      const formData = new FormData();
      
      // Agregar todos los campos del formulario
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birthdate' && value instanceof Date) {
            // Verificar si es fecha válida antes de convertir a ISO
            if (!isNaN(value.getTime())) {
              formData.append(key, value.toISOString());
            }
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Agregar la imagen si existe
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      return apiRequest('/api/volunteers', {
        method: 'POST',
        data: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Voluntario registrado",
        description: "El voluntario ha sido registrado con éxito.",
      });
      setLocation("/admin/volunteers");
    },
    onError: (error) => {
      toast({
        title: "Error al registrar voluntario",
        description: `Ha ocurrido un error al registrar el voluntario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VolunteerFormValues) => {
    mutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin/volunteers")}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Registrar Nuevo Voluntario</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de registro</CardTitle>
            <CardDescription>
              Ingrese los datos del nuevo voluntario. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sección para subir fotografía */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Fotografía de perfil</label>
                    <div className="flex flex-col items-center space-y-4">
                      {/* Previsualización de la imagen */}
                      <div className="w-32 h-32 border-2 border-dashed rounded-full border-gray-300 flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="Vista previa" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Input de archivo (oculto) + botón personalizado */}
                      <div className="flex flex-col items-center">
                        <label htmlFor="profile-image" className="cursor-pointer">
                          <div className="flex items-center bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded text-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {profileImage ? 'Cambiar imagen' : 'Subir imagen'}
                          </div>
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                        {uploadError && (
                          <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                        )}
                        {profileImage && (
                          <p className="text-xs text-gray-500 mt-1">{profileImage.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre y apellidos" {...field} />
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
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de contacto de emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del contacto" {...field} />
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
                        <FormLabel>Teléfono de contacto de emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de nacimiento *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: es })
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Calcular la fecha mínima para 18 años
                                const today = new Date();
                                const minAgeDate = new Date(
                                  today.getFullYear() - 18,
                                  today.getMonth(),
                                  today.getDate()
                                );
                                
                                return date > minAgeDate || date < new Date("1940-01-01");
                              }}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1940}
                              toYear={new Date().getFullYear() - 18}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Los voluntarios deben ser mayores de 18 años.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="suspended">Suspendido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          El estado inicial del voluntario en el sistema.
                        </FormDescription>
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
                        <Input placeholder="Calle, número, colonia, ciudad, estado" {...field} />
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
                      <FormLabel>Habilidades</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jardinería, educación ambiental, fotografía, primeros auxilios, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Habilidades relevantes para actividades de voluntariado
                      </FormDescription>
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
                      <FormControl>
                        <Textarea 
                          placeholder="Días y horarios disponibles para actividades de voluntariado" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/admin/volunteers")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="gap-1"
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Guardar</span>
                      </>
                    )}
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

export default NewVolunteer;