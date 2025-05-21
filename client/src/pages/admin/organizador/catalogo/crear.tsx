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

// Opciones de mercado meta para la segmentación
const MERCADO_META = [
  { id: "preescolar", label: "Preescolar - 0 a 5 años" },
  { id: "ninos", label: "Niños - 6 a 12 años" },
  { id: "adolescentes", label: "Adolescentes - 13 a 18 años" },
  { id: "adultos", label: "Adultos - 19 a 65 años" },
  { id: "adultosmayores", label: "Adultos Mayores - +65 años" }
];

// Opciones de capacidades diferentes
const CAPACIDADES_DIFERENTES = [
  { id: "fisica", label: "Física / Motriz" },
  { id: "visual", label: "Visual" },
  { id: "auditiva", label: "Auditiva" },
  { id: "intelectual", label: "Intelectual / Cognitiva" },
  { id: "psicosocial", label: "Psicosocial / Mental" },
  { id: "neurodivergencias", label: "Neurodivergencias" },
  { id: "multiple", label: "Múltiple / Combinada" },
  { id: "temporal", label: "Temporal" }
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
  
  // Campos para precio
  price: z.coerce.number().min(0).optional(),
  isPriceRandom: z.boolean().default(false),
  isFree: z.boolean().default(false),
  
  materials: z.string().optional(),
  requirements: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.string()).optional(),
  
  // Nuevos campos para segmentación
  targetMarket: z.array(z.string()).optional(),
  
  // Campos para capacidades diferentes
  specialNeeds: z.array(z.string()).optional(),
  
  // Campo para seleccionar al instructor por su ID
  instructorId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CrearActividadPage = () => {
  const [location, setLocation] = useLocation();

  // Consulta para obtener la lista de parques
  const { data: parques = [] } = useQuery<{ id: number, name: string }[]>({
    queryKey: ['/api/parks'],
  });
  
  // Consulta para obtener la lista de usuarios con rol de instructor
  const { data: instructores = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    select: (data) => data.filter(user => user.role === 'instructor')
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
      isPriceRandom: false,
      isFree: false,
      materials: "",
      requirements: "",
      isRecurring: false,
      recurringDays: [],
      targetMarket: [],
      specialNeeds: [],
      instructorId: "",
    },
  });

  // Mutación para crear una nueva actividad
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const parkId = parseInt(values.parkId);
      
      // Buscamos el instructor seleccionado para obtener sus datos
      let instructorData = {};
      
      if (values.instructorId) {
        const selectedInstructor = instructores.find(
          instructor => instructor.id.toString() === values.instructorId
        );
        
        if (selectedInstructor) {
          instructorData = {
            instructorId: selectedInstructor.id,
            instructorName: `${selectedInstructor.fullName || selectedInstructor.username || ''}`.trim(),
            instructorContact: selectedInstructor.email || '',
          };
        }
      }
      
      // Solo incluimos los campos que existen en la base de datos real
      const data = {
        title: values.title,
        description: values.description,
        parkId,
        startDate: values.startDate,
        endDate: values.endDate || null,
        category: values.category,
        location: values.location || null,
        capacity: values.capacity || null,
        duration: values.duration || null,
        price: values.price || 0,
        isPriceRandom: values.isPriceRandom || false,
        isFree: values.isFree || false,
        materials: values.materials || "",
        requirements: values.requirements || "",
        isRecurring: values.isRecurring || false,
        recurringDays: values.recurringDays || [],
        targetMarket: values.targetMarket || [],
        specialNeeds: values.specialNeeds || [],
        ...instructorData
      };
      
      return await apiRequest(`/api/activities`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Actividad creada",
        description: "La actividad ha sido creada exitosamente",
        variant: "default"
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
            Actividades Disponibles
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

              {/* Sección de Segmentación */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Segmentación</h3>
                
                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Mercado Meta</FormLabel>
                        <FormDescription>
                          Selecciona los grupos de edad a los que está dirigida esta actividad
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {MERCADO_META.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="targetMarket"
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
              </div>

              {/* Sección de Capacidades Diferentes */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Capacidades Diferentes</h3>
                
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Accesibilidad para personas con capacidades diferentes</FormLabel>
                        <FormDescription>
                          Selecciona los tipos de discapacidad para los que esta actividad está adaptada
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {CAPACIDADES_DIFERENTES.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="specialNeeds"
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

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio (MXN)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              placeholder="Ej: 50.00" 
                              {...field} 
                              disabled={form.watch("isFree") || form.watch("isPriceRandom")}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("isFree") 
                              ? "Actividad gratuita" 
                              : form.watch("isPriceRandom") 
                                ? "El precio será variable o por donativo" 
                                : "Precio fijo por persona"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col gap-2 mt-2">
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue("price", 0);
                                    form.setValue("isPriceRandom", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-medium">
                              Actividad Gratuita
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isPriceRandom"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue("isFree", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-medium">
                              Precio Aleatorio (Donativo/Variable)
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
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

              {/* Sección de Instructor/Facilitador */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Datos del Instructor o Facilitador</h3>
                
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccionar Instructor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instructores.length === 0 ? (
                            <SelectItem value="no-instructors" disabled>
                              No hay instructores disponibles
                            </SelectItem>
                          ) : (
                            instructores.map((instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                {instructor.firstName} {instructor.lastName} ({instructor.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecciona un instructor registrado en el sistema. Si el instructor que buscas no está en la lista, primero debes registrarlo en la sección de Usuarios.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {instructores.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
                    <p className="text-amber-800">
                      No hay instructores registrados en el sistema. Dirígete a la sección de Usuarios para crear un usuario con rol de Instructor primero.
                    </p>
                  </div>
                )}
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