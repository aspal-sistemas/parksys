import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';

// Categorías de actividades
const CATEGORIAS_ACTIVIDADES = [
  { value: "artecultura", label: "Arte y Cultura" },
  { value: "recreacionbienestar", label: "Recreación y Bienestar" },
  { value: "temporada", label: "Eventos de Temporada" },
  { value: "naturalezaciencia", label: "Naturaleza, Ciencia y Conservación" }
];

// Días de la semana para actividades recurrentes
const DIAS_SEMANA = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" }
];

// Esquema de validación para el formulario
const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  parkId: z.string().min(1, "Debes seleccionar un parque"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  duration: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().min(0).optional(),
  materials: z.string().optional(),
  requirements: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CrearActividadPage = () => {
  const [location, setLocation] = useLocation();

  // Consulta para obtener la lista de parques
  const { data: parques = [] } = useQuery<{ id: number, name: string }[]>({
    queryKey: ['/api/parks'],
  });

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      parkId: "",
      startDate: "",
      endDate: "",
      location: "",
      capacity: undefined,
      duration: undefined,
      price: 0,
      materials: "",
      requirements: "",
      isRecurring: false,
      recurringDays: [],
    },
  });

  // Mutación para crear una nueva actividad
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const parkId = parseInt(values.parkId);
      const data = {
        ...values,
        parkId,
        capacity: values.capacity || null,
        duration: values.duration || null,
        price: values.price || 0,
        recurringDays: values.isRecurring ? values.recurringDays : []
      };
      
      return await apiRequest(`/api/parks/${parkId}/activities`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Actividad creada",
        description: "La actividad ha sido creada exitosamente",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setLocation('/admin/organizador/catalogo/ver');
    },
    onError: (error) => {
      console.error("Error al crear actividad:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la actividad. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Actividad</h1>
          <Button variant="outline" onClick={() => setLocation('/admin/organizador/catalogo/ver')}>
            Volver al Catálogo
          </Button>
        </div>
        <p className="text-gray-500">
          Completa el formulario para crear una nueva actividad para el catálogo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de Actividad</CardTitle>
          <CardDescription>
            Ingresa la información completa de la actividad. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección de información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Taller de Pintura" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIAS_ACTIVIDADES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
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
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe la actividad en detalle"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluye detalles importantes sobre lo que los participantes harán y aprenderán.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parque *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un parque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parques.map((parque) => (
                            <SelectItem key={parque.id} value={parque.id.toString()}>
                              {parque.name}
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación dentro del parque</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Área de juegos, Salón principal" {...field} />
                      </FormControl>
                      <FormDescription>
                        Especifica dónde dentro del parque se realizará la actividad
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección de fecha y hora */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Fecha y Horario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de inicio *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de finalización</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Opcional para actividades de un solo día
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Ej: 60" {...field} />
                      </FormControl>
                      <FormDescription>
                        Indica cuánto dura cada sesión en minutos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Actividad recurrente</FormLabel>
                        <FormDescription>
                          Marca esta opción si la actividad se repite en días específicos
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("isRecurring") && (
                  <FormField
                    control={form.control}
                    name="recurringDays"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Días de la semana</FormLabel>
                          <FormDescription>
                            Selecciona los días en que se repite la actividad
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {DIAS_SEMANA.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="recurringDays"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Sección de capacidad y materiales */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Capacidad y Materiales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad máxima</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="Ej: 20" {...field} />
                        </FormControl>
                        <FormDescription>
                          Número máximo de participantes permitidos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (MXN)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" placeholder="Ej: 50.00" {...field} />
                        </FormControl>
                        <FormDescription>
                          Deja en 0 si la actividad es gratuita
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materiales necesarios</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Lista de materiales que se usarán o que deben traer los participantes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos para participantes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Requisitos especiales, rango de edad, condiciones físicas, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/organizador/catalogo/ver')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Guardando..." : "Guardar Actividad"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CrearActividadPage;