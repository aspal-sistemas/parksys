import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/Spinner';

// Esquema para validar el formulario
const activitySchema = z.object({
  title: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  parkId: z.coerce.number().min(1, "Debe seleccionar un parque"),
  startDate: z.string().min(1, "Debe seleccionar una fecha de inicio"),
  endDate: z.string().optional(),
  startTime: z.string().min(1, "Debe seleccionar una hora de inicio"),
  endTime: z.string().min(1, "Debe seleccionar una hora de fin"),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  location: z.string().optional(),
  capacity: z.coerce.number().min(1, "La capacidad debe ser al menos 1").optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo").optional(),
  isPriceRandom: z.boolean().optional(),
  isFree: z.boolean().optional(),
  materials: z.string().optional(),
  requirements: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringDays: z.array(z.string()).optional(),
  targetMarket: z.array(z.string()).optional(),
  specialNeeds: z.array(z.string()).optional(),
  instructorId: z.coerce.number().optional(),
  instructorName: z.string().optional(),
  instructorContact: z.string().optional(),
  duration: z.coerce.number().optional(),
});

// Función para formatear la fecha correctamente para la API
function formatearFechaParaAPI(fecha: string): string {
  const fechaObj = new Date(fecha);
  return format(fechaObj, 'yyyy-MM-dd');
}

// Función para combinar fecha y hora
function combinarFechaYHora(fecha: string, hora: string): string {
  const [year, month, day] = fecha.split('-');
  const [hours, minutes] = hora.split(':');
  
  const fechaCompleta = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );
  
  return fechaCompleta.toISOString();
}

// Función para calcular la duración en minutos entre dos horas
function calcularDuracionEnMinutos(horaInicio: string, horaFin: string): number {
  if (!horaInicio || !horaFin) return 0;
  
  try {
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    
    if (isNaN(horaInicioH) || isNaN(horaInicioM) || isNaN(horaFinH) || isNaN(horaFinM)) {
      console.error("Error en formato de horas:", { horaInicio, horaFin });
      return 0;
    }
    
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;
    
    // Si la hora de fin es menor que la de inicio, asumimos que es al día siguiente
    if (finMinutos < inicioMinutos) {
      return (24 * 60 - inicioMinutos) + finMinutos;
    }
    
    return finMinutos - inicioMinutos;
  } catch (error) {
    console.error("Error al calcular duración:", error);
    return 0;
  }
}

const EditarActividadPage = () => {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const activityId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Valores por defecto para las horas
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  
  // Obtener los datos de la actividad
  const { data: actividad, isLoading: isLoadingActividad } = useQuery({
    queryKey: [`/api/activities/${activityId}`],
    enabled: !!activityId,
  });
  
  // Obtener la lista de parques para el select
  const { data: parques, isLoading: isLoadingParques } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Obtener la lista de instructores para el select
  const { data: instructores, isLoading: isLoadingInstructores } = useQuery({
    queryKey: ['/api/instructors'],
  });
  
  // Inicializar el formulario
  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      parkId: 0,
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "10:00",
      category: "",
      location: "",
      capacity: 20,
      price: 0,
      isPriceRandom: false,
      isFree: true,
      materials: "",
      requirements: "",
      isRecurring: false,
      recurringDays: [] as string[],
      targetMarket: [] as string[],
      specialNeeds: [] as string[],
      instructorId: undefined,
      instructorName: "",
      instructorContact: "",
      duration: 60,
    }
  });
  
  // Llenar el formulario con los datos de la actividad cuando se carguen
  useEffect(() => {
    if (actividad) {
      // Extraer fecha y hora del startDate
      let startDate = actividad.startDate;
      let startTime = "09:00";
      let endTime = "10:00";
      
      if (actividad.startDate) {
        try {
          const startDateObj = new Date(actividad.startDate);
          startDate = format(startDateObj, 'yyyy-MM-dd');
          startTime = format(startDateObj, 'HH:mm');
        } catch (error) {
          console.error("Error al parsear fecha de inicio:", error);
        }
      }
      
      // Calcular hora de fin si hay duración
      if (actividad.duration && startTime) {
        try {
          const [hours, minutes] = startTime.split(':').map(Number);
          const startMinutes = hours * 60 + minutes;
          const endMinutes = startMinutes + (actividad.duration || 60);
          
          const endHours = Math.floor(endMinutes / 60) % 24;
          const endMins = endMinutes % 60;
          
          endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        } catch (error) {
          console.error("Error al calcular hora de fin:", error);
        }
      }
      
      setHoraInicio(startTime);
      setHoraFin(endTime);
      
      // Llenar el formulario
      form.reset({
        title: actividad.title || "",
        description: actividad.description || "",
        parkId: actividad.parkId || 0,
        startDate: startDate || "",
        endDate: actividad.endDate ? format(new Date(actividad.endDate), 'yyyy-MM-dd') : "",
        startTime: startTime,
        endTime: endTime,
        category: actividad.category || "",
        location: actividad.location || "",
        capacity: actividad.capacity || 20,
        price: actividad.price || 0,
        isPriceRandom: actividad.isPriceRandom || false,
        isFree: actividad.isFree || (actividad.price === 0),
        materials: actividad.materials || "",
        requirements: actividad.requirements || "",
        isRecurring: actividad.isRecurring || false,
        recurringDays: actividad.recurringDays || [],
        targetMarket: actividad.targetMarket || [],
        specialNeeds: actividad.specialNeeds || [],
        instructorId: actividad.instructorId,
        instructorName: actividad.instructorName || "",
        instructorContact: actividad.instructorContact || "",
        duration: actividad.duration || calcularDuracionEnMinutos(startTime, endTime),
      });
    }
  }, [actividad, form]);
  
  // Actualizar la duración cuando cambian las horas
  useEffect(() => {
    const duracion = calcularDuracionEnMinutos(horaInicio, horaFin);
    form.setValue("duration", duracion);
  }, [horaInicio, horaFin, form]);
  
  // Mutación para actualizar la actividad
  const actualizarActividad = useMutation({
    mutationFn: async (values: any) => {
      // Construir el objeto de datos a enviar
      const data = {
        title: values.title,
        description: values.description,
        parkId: values.parkId,
        startDate: formatearFechaParaAPI(values.startDate),
        endDate: values.endDate ? formatearFechaParaAPI(values.endDate) : null,
        startTime: values.startTime,
        endTime: values.endTime,
        category: values.category,
        location: values.location || null,
        capacity: values.capacity || null,
        duration: values.duration || calcularDuracionEnMinutos(values.startTime, values.endTime),
        price: values.isFree ? 0 : values.price,
        isPriceRandom: values.isPriceRandom || false,
        isFree: values.isFree || false,
        materials: values.materials || null,
        requirements: values.requirements || null,
        isRecurring: values.isRecurring || false,
        recurringDays: values.isRecurring ? values.recurringDays : [],
        targetMarket: values.targetMarket || [],
        specialNeeds: values.specialNeeds || [],
      };
      
      // Agregar datos del instructor si se seleccionó uno
      let instructorData = {};
      if (values.instructorId) {
        instructorData = {
          instructorId: values.instructorId,
          instructorName: values.instructorName,
          instructorContact: values.instructorContact
        };
      }
      
      const finalData = { ...data, ...instructorData };
      console.log("Enviando datos a la API:", finalData);
      
      // Usar directamente fetch para tener más control sobre la petición
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(finalData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la respuesta:", errorText);
        throw new Error(`Error al actualizar actividad: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Actividad actualizada",
        description: "La actividad se ha actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}`] });
      setLocation("/admin/organizador/catalogo/ver");
    },
    onError: (error) => {
      console.error("Error al actualizar actividad:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar el envío del formulario
  const onSubmit = (values: any) => {
    actualizarActividad.mutate(values);
  };
  
  // Opciones para los selects
  const categorias = [
    { value: "artecultura", label: "Arte y Cultura" },
    { value: "recreacionbienestar", label: "Recreación y Bienestar" },
    { value: "naturalezaciencia", label: "Naturaleza, Ciencia y Conservación" },
    { value: "eventostemporada", label: "Eventos de Temporada" },
  ];
  
  const diasSemana = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miercoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sabado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
  ];
  
  const mercadoObjetivo = [
    { value: "niños", label: "Niños (0-12 años)" },
    { value: "adolescentes", label: "Adolescentes (13-17 años)" },
    { value: "jovenes", label: "Jóvenes (18-29 años)" },
    { value: "adultos", label: "Adultos (30-59 años)" },
    { value: "adultosmayores", label: "Adultos mayores (60+ años)" },
    { value: "familias", label: "Familias" },
  ];
  
  const necesidadesEspeciales = [
    { value: "movilidad", label: "Adaptada para personas con movilidad reducida" },
    { value: "visual", label: "Adaptada para personas con discapacidad visual" },
    { value: "auditiva", label: "Adaptada para personas con discapacidad auditiva" },
    { value: "intelectual", label: "Adaptada para personas con discapacidad intelectual" },
  ];
  
  // Manejar cambios en las horas
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setHoraInicio(newTime);
    form.setValue("startTime", newTime);
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setHoraFin(newTime);
    form.setValue("endTime", newTime);
  };
  
  // Mostrar loading si los datos aún no están cargados
  if (isLoadingActividad || isLoadingParques || isLoadingInstructores) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }
  
  // Si no se encuentra la actividad
  if (!actividad && !isLoadingActividad) {
    return (
      <AdminLayout>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Actividad no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar la actividad con el ID proporcionado</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/admin/organizador/catalogo/ver")}>
              Volver al catálogo
            </Button>
          </CardFooter>
        </Card>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Editar Actividad</h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/admin/organizador/catalogo/ver")}
          >
            Volver al catálogo
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Información general sobre la actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre de la actividad */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la actividad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Taller de Pintura" {...field} />
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
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe la actividad..."
                          className="resize-none min-h-32"
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
                
                {/* Parque */}
                <FormField
                  control={form.control}
                  name="parkId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parque *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un parque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parques?.map((parque: any) => (
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
                
                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((categoria) => (
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
                
                {/* Ubicación dentro del parque */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación dentro del parque</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. Área central del parque"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Especifica dónde dentro del parque se realizará la actividad.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Fechas y horarios */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas y Horarios</CardTitle>
                <CardDescription>
                  Cuándo se realizará la actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fecha de inicio */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de inicio *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Fecha de fin */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de fin (opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              } else {
                                field.onChange("");
                              }
                            }}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return (
                                date < new Date("1900-01-01") ||
                                (startDate && date < new Date(startDate))
                              );
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Para actividades de un solo día, deja este campo vacío.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Horas de inicio y fin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Hora de inicio *</Label>
                    <Input 
                      id="startTime"
                      type="time" 
                      value={horaInicio}
                      onChange={handleStartTimeChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora de fin *</Label>
                    <Input 
                      id="endTime"
                      type="time" 
                      value={horaFin}
                      onChange={handleEndTimeChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Duración (calculada automáticamente) */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (en minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={0}
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        La duración se calcula automáticamente en base a las horas de inicio y fin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Actividad recurrente */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
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
                            Actividad recurrente
                          </FormLabel>
                          <FormDescription>
                            Marca esta opción si la actividad se repetirá en días específicos.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Días recurrentes (mostrar solo si isRecurring es true) */}
                  {form.watch("isRecurring") && (
                    <FormField
                      control={form.control}
                      name="recurringDays"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">
                              Días de la semana
                            </FormLabel>
                            <FormDescription>
                              Selecciona los días en que se repetirá la actividad.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {diasSemana.map((dia) => (
                              <FormField
                                key={dia.value}
                                control={form.control}
                                name="recurringDays"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={dia.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(dia.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value || [], dia.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== dia.value
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
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
                </div>
              </CardContent>
            </Card>
            
            {/* Detalles adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles Adicionales</CardTitle>
                <CardDescription>
                  Información complementaria sobre la actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Capacidad */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad (número de participantes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={1}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de personas que pueden participar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Precio */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("price", 0);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Actividad gratuita
                          </FormLabel>
                          <FormDescription>
                            Marca esta opción si la actividad no tiene costo.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {!form.watch("isFree") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio (MXN)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                min={0}
                                step="0.01"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isPriceRandom"
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
                                Cuota de recuperación voluntaria
                              </FormLabel>
                              <FormDescription>
                                El precio es sugerido, pero los participantes pueden aportar una cantidad diferente.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
                
                {/* Materiales */}
                <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materiales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enlista los materiales necesarios..."
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Materiales que se utilizarán o que deben traer los participantes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Requisitos */}
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe los requisitos para participar..."
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Requisitos previos, habilidades necesarias o condiciones para participar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Mercado objetivo */}
                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Público objetivo
                        </FormLabel>
                        <FormDescription>
                          Selecciona los grupos de edad a los que está dirigida la actividad.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mercadoObjetivo.map((grupo) => (
                          <FormField
                            key={grupo.value}
                            control={form.control}
                            name="targetMarket"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={grupo.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(grupo.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], grupo.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== grupo.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {grupo.label}
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
                
                {/* Necesidades especiales */}
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Adaptaciones para necesidades especiales
                        </FormLabel>
                        <FormDescription>
                          Selecciona si la actividad está adaptada para personas con necesidades especiales.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {necesidadesEspeciales.map((necesidad) => (
                          <FormField
                            key={necesidad.value}
                            control={form.control}
                            name="specialNeeds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={necesidad.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(necesidad.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], necesidad.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== necesidad.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {necesidad.label}
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
              </CardContent>
            </Card>
            
            {/* Información del instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Instructor</CardTitle>
                <CardDescription>
                  Datos del instructor que impartirá la actividad (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const instructorId = parseInt(value);
                          field.onChange(instructorId);
                          
                          // Encontrar el instructor seleccionado
                          const instructor = instructores?.find((i: any) => i.id === instructorId);
                          if (instructor) {
                            form.setValue("instructorName", instructor.fullName || `${instructor.firstName} ${instructor.lastName}`);
                            form.setValue("instructorContact", instructor.email || instructor.contactEmail || '');
                          }
                        }}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un instructor (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Ninguno</SelectItem>
                          {instructores?.map((instructor: any) => (
                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                              {instructor.fullName || `${instructor.firstName} ${instructor.lastName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecciona un instructor de la lista o déjalo en blanco si no aplica.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("instructorId") && (
                  <>
                    <FormField
                      control={form.control}
                      name="instructorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del instructor</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instructorContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contacto del instructor</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/organizador/catalogo/ver")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={actualizarActividad.isPending}
              >
                {actualizarActividad.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Actividad"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default EditarActividadPage;