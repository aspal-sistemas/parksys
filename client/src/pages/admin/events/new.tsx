import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, MapPin, AlertCircle, Check } from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Layout y componentes propios
import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Esquema de validación para el formulario
const eventFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().optional(),
  eventType: z.string({
    required_error: 'Por favor selecciona un tipo de evento',
  }),
  targetAudience: z.string().optional(),
  status: z.string().default('draft'),
  featuredImageUrl: z.string().optional(),
  startDate: z.date({
    required_error: 'Por favor selecciona una fecha de inicio',
  }),
  endDate: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  registrationType: z.string().default('free'),
  organizerName: z.string().optional(),
  organizerEmail: z.string().email('Email inválido').optional(),
  organizerPhone: z.string().optional(),
  parkIds: z.array(z.string()).min(1, 'Debes seleccionar al menos un parque'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CreateEventPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener los parques para asignar el evento
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
    retry: false,
  });

  // Obtener datos de referencia para eventos (tipos, audiencias, estados)
  const { data: refData, isLoading: isLoadingRefData } = useQuery({
    queryKey: ['/api/events-reference-data'],
    retry: false,
  });

  // Configurar el formulario con valores por defecto
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: 'cultural',
      targetAudience: 'all',
      status: 'draft',
      featuredImageUrl: '',
      startDate: new Date(),
      endDate: undefined,
      startTime: '',
      endTime: '',
      isRecurring: false,
      recurrencePattern: '',
      location: '',
      capacity: undefined,
      registrationType: 'free',
      organizerName: '',
      organizerEmail: '',
      organizerPhone: '',
      parkIds: [],
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || '',
          'X-User-Role': localStorage.getItem('userRole') || '',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el evento');
      }

      const createdEvent = await response.json();
      
      // Invalidar la caché para recargar eventos
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: 'Evento creado',
        description: 'El evento ha sido creado correctamente.',
        variant: 'default',
      });
      
      // Redirigir a la página de detalles
      setLocation(`/admin/events/${createdEvent.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear el evento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar cargando si los datos de referencia no están listos
  if (isLoadingRefData || isLoadingParks) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Crear Evento"
          description="Crea un nuevo evento para tu comunidad."
          actions={
            <Button variant="outline" onClick={() => setLocation('/admin/events')}>
              Volver al listado
            </Button>
          }
        />
        <Separator />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Proporciona la información principal del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título del evento */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del evento*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el evento, sus objetivos y actividades..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de evento */}
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de evento*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {refData?.eventTypes?.map((type: string) => (
                            <SelectItem key={type} value={type}>
                              {type === 'cultural' ? 'Cultural' : 
                               type === 'sports' ? 'Deportivo' : 
                               type === 'environmental' ? 'Ambiental' : 
                               type === 'social' ? 'Social' : 
                               type === 'other' ? 'Otro' : type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Audiencia objetivo */}
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audiencia objetivo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una audiencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {refData?.targetAudiences?.map((audience: string) => (
                            <SelectItem key={audience} value={audience}>
                              {audience === 'all' ? 'Todos los públicos' : 
                               audience === 'children' ? 'Niños' : 
                               audience === 'youth' ? 'Jóvenes' : 
                               audience === 'adults' ? 'Adultos' : 
                               audience === 'seniors' ? 'Adultos mayores' : 
                               audience === 'families' ? 'Familias' : audience}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado */}
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
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {refData?.eventStatuses?.map((status: string) => (
                            <SelectItem key={status} value={status}>
                              {status === 'draft' ? 'Borrador' : 
                               status === 'published' ? 'Publicado' : 
                               status === 'canceled' ? 'Cancelado' : 
                               status === 'postponed' ? 'Pospuesto' : status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Los eventos en borrador no serán visibles para el público.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fecha y ubicación</CardTitle>
                <CardDescription>
                  Especifica cuándo y dónde se llevará a cabo el evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fecha de inicio */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de inicio*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hora de inicio */}
                <FormField
                  control={form.control}
                  name="startTime"
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

                {/* Fecha de finalización */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de finalización</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < form.getValues('startDate')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Opcional. Si el evento dura un solo día, deja este campo en blanco.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hora de finalización */}
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de finalización</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ubicación específica */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación específica</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Entrada principal, Área de picnic..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Ubicación específica dentro del parque (opcional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selección de parques */}
                <FormField
                  control={form.control}
                  name="parkIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Parques*</FormLabel>
                        <FormDescription>
                          Selecciona los parques donde se realizará este evento
                        </FormDescription>
                      </div>
                      <div className="space-y-2">
                        {parks && Array.isArray(parks) ? (
                          parks.map((park) => (
                            <FormField
                              key={park.id}
                              control={form.control}
                              name="parkIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={park.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(park.id.toString())}
                                        onCheckedChange={(checked) => {
                                          const parkId = park.id.toString();
                                          return checked
                                            ? field.onChange([...field.value, parkId])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== parkId
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {park.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay parques disponibles</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles adicionales</CardTitle>
                <CardDescription>
                  Información complementaria del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Capacidad */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 100" 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de participantes permitidos (opcional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de registro */}
                <FormField
                  control={form.control}
                  name="registrationType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de registro</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="free" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Entrada libre (sin registro)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="registration" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Requiere registro (gratuito)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="paid" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Requiere registro y pago
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagen destacada */}
                <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen destacada (URL)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://ejemplo.com/imagen.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL de la imagen principal que representará al evento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organizador */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Información del organizador</h3>
                  
                  <FormField
                    control={form.control}
                    name="organizerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del organizador</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre o departamento" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="organizerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contacto</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="contacto@ejemplo.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="organizerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de contacto</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+52 123 456 7890" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/admin/events')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Crear Evento
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default CreateEventPage;