import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Categorías de actividades
const CATEGORIAS_ACTIVIDADES = [
  { value: "artecultura", label: "Arte y Cultura" },
  { value: "recreacionbienestar", label: "Recreación y Bienestar" },
  { value: "temporada", label: "Eventos de Temporada" },
  { value: "naturalezaciencia", label: "Naturaleza, Ciencia y Conservación" }
];

// Esquema de validación para nueva actividad
const nuevaActividadSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  categoria: z.string({ required_error: "Selecciona una categoría" }),
  parqueId: z.number({ required_error: "Selecciona un parque" }),
  fechaInicio: z.date({ required_error: "Selecciona una fecha de inicio" }),
  fechaFin: z.date().optional(),
  horaInicio: z.string().min(1, "Selecciona una hora de inicio"),
  duracion: z.number().min(1, "La duración debe ser al menos 1 minuto"),
  capacidad: z.number().optional(),
  materiales: z.string().optional(),
  personalRequerido: z.number().optional(),
  esRecurrente: z.boolean().default(false),
  esGratuita: z.boolean().default(true),
  precio: z.number().optional(),
  ubicaciones: z.array(z.string()).optional(),
  diasRecurrentes: z.array(z.string()).optional(),
  requisitos: z.string().optional(),
});

type NuevaActividadFormValues = z.infer<typeof nuevaActividadSchema>;

const CrearActividadPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  
  // Obtener la lista de parques
  const { data: parques = [] } = useQuery<{ id: number, name: string }[]>({
    queryKey: ['/api/parks'],
  });

  // Configuración del formulario
  const form = useForm<NuevaActividadFormValues>({
    resolver: zodResolver(nuevaActividadSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: '',
      fechaInicio: undefined,
      horaInicio: '',
      duracion: 60,
      capacidad: undefined,
      esRecurrente: false,
      esGratuita: true,
      precio: undefined,
      ubicaciones: [],
      diasRecurrentes: [],
    }
  });

  // Valores actuales del formulario
  const watchEsRecurrente = form.watch('esRecurrente');
  const watchEsGratuita = form.watch('esGratuita');
  const watchParqueId = form.watch('parqueId');

  // Mutación para crear una nueva actividad
  const crearActividad = useMutation({
    mutationFn: async (data: NuevaActividadFormValues) => {
      return await apiRequest(`/api/activities`, { 
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Actividad creada',
        description: 'La actividad ha sido agregada al catálogo exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      form.reset(); // Resetear el formulario después de crear
      setUbicaciones([]); // Limpiar las ubicaciones
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la actividad',
        variant: 'destructive',
      });
    }
  });

  // Manejar el envío del formulario
  const onSubmit = (data: NuevaActividadFormValues) => {
    // Incluir las ubicaciones en los datos del formulario
    const formData = {
      ...data,
      ubicaciones: ubicaciones,
    };
    crearActividad.mutate(formData);
  };

  // Agregar una nueva ubicación
  const agregarUbicacion = () => {
    if (ubicacionSeleccionada.trim()) {
      setUbicaciones([...ubicaciones, ubicacionSeleccionada]);
      setUbicacionSeleccionada('');
    }
  };

  // Eliminar una ubicación
  const eliminarUbicacion = (index: number) => {
    setUbicaciones(ubicaciones.filter((_, i) => i !== index));
  };

  // Opciones de días de la semana para actividades recurrentes
  const diasSemana = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setLocation('/admin/organizador/catalogo/ver')}
        >
          ← Volver a Actividades Disponibles
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Actividad para el Catálogo</h1>
        <p className="text-gray-500">
          Completa el formulario para crear una nueva actividad que estará disponible en el catálogo
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Información Básica</h2>
                
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la actividad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Taller de pintura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe brevemente la actividad..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
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
                          {CATEGORIAS_ACTIVIDADES.map((categoria) => (
                            <SelectItem key={categoria.value} value={categoria.value}>
                              {categoria.label}
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
                  name="parqueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parque</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
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

                {/* Sección de ubicaciones específicas */}
                {watchParqueId && (
                  <div className="space-y-2">
                    <FormLabel>Ubicaciones específicas</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Área de juegos infantiles"
                        value={ubicacionSeleccionada}
                        onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={agregarUbicacion}
                        variant="outline"
                      >
                        Añadir
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ubicaciones.map((ubicacion, index) => (
                        <Badge key={index} className="flex items-center gap-1">
                          {ubicacion}
                          <X 
                            className="h-3 w-3 cursor-pointer ml-1" 
                            onClick={() => eliminarUbicacion(index)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Programación y detalles */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Programación y Detalles</h2>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaInicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de inicio</FormLabel>
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
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaFin"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de fin (opcional)</FormLabel>
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
                              initialFocus
                              locale={es}
                              disabled={(date) => {
                                const inicio = form.getValues('fechaInicio');
                                return inicio ? date < inicio : false;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Dejar en blanco para actividades de un solo día
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="horaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duracion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (minutos)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            min={1}
                            step={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                          <Clock className="h-4 w-4 ml-2 text-gray-500" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad máxima (opcional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            min={1}
                            placeholder="Sin límite"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                          <Users className="h-4 w-4 ml-2 text-gray-500" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esRecurrente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Actividad recurrente</FormLabel>
                        <FormDescription>
                          Esta actividad se repite regularmente
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchEsRecurrente && (
                  <FormField
                    control={form.control}
                    name="diasRecurrentes"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Días de la semana</FormLabel>
                          <FormDescription>
                            Selecciona los días en que se realiza la actividad
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {diasSemana.map((dia) => (
                            <FormField
                              key={dia.id}
                              control={form.control}
                              name="diasRecurrentes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={dia.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(dia.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], dia.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== dia.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {dia.label}
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

                <FormField
                  control={form.control}
                  name="esGratuita"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Actividad gratuita</FormLabel>
                        <FormDescription>
                          Esta actividad no tiene costo para los participantes
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!watchEsGratuita && (
                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (MXN)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <Input 
                              type="number" 
                              min={0}
                              step={0.01}
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Información Adicional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requisitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos o recomendaciones</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Equipo, vestimenta o preparación necesaria..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materiales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materiales incluidos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Materiales que se proporcionarán a los participantes..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="personalRequerido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal requerido</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          min={0}
                          placeholder="Cantidad de personal"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                        <Users className="h-4 w-4 ml-2 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Número de personas necesarias para llevar a cabo la actividad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="button"
                variant="outline" 
                className="mr-2"
                onClick={() => {
                  form.reset();
                  setUbicaciones([]);
                }}
              >
                Limpiar formulario
              </Button>
              <Button 
                type="submit" 
                disabled={crearActividad.isPending}
              >
                {crearActividad.isPending ? 'Guardando...' : 'Crear actividad'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default CrearActividadPage;