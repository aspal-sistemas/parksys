import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useNavigate } from 'wouter';
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
import { CalendarIcon, ChevronLeft, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';

// Definir el esquema de validación del formulario
const volunteerFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }).optional().or(z.literal('')),
  phoneNumber: z.string().min(10, { message: "Ingrese un teléfono válido" }).optional().or(z.literal('')),
  emergencyContact: z.string().min(10, { message: "Ingrese un contacto de emergencia válido" }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  birthdate: z.date().optional(),
  skills: z.string().optional().or(z.literal('')),
  availability: z.string().optional().or(z.literal('')),
  status: z.string().default("pending"),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const NewVolunteer: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      emergencyContact: '',
      address: '',
      skills: '',
      availability: '',
      status: 'pending',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: VolunteerFormValues) => {
      return apiRequest('/api/volunteers', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Voluntario registrado",
        description: "El voluntario ha sido registrado con éxito.",
      });
      navigate("/admin/volunteers");
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
            onClick={() => navigate("/admin/volunteers")}
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
                        <FormLabel>Contacto de emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre y teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de nacimiento</FormLabel>
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
                                  format(field.value, "PPP", { locale: es })
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
                              disabled={(date) =>
                                date > new Date() || date < new Date("1940-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                    onClick={() => navigate("/admin/volunteers")}
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