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
import { Switch } from '@/components/ui/switch';
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
import ActivityImageManager from '@/components/ActivityImageManager';
import { safeApiRequest } from '@/lib/queryClient';

// Esquema para validar el formulario
const activitySchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  parkId: z.coerce.number().int().positive("Debes seleccionar un parque"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional(),
  
  // Campos para hora de inicio y finalización
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endTime: z.string().min(1, "La hora de finalización es obligatoria"),
  
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
  
  // Campos para segmentación
  targetMarket: z.array(z.string()).optional(),
  
  // Campos para capacidades diferentes
  specialNeeds: z.array(z.string()).optional(),
  
  // Campo para seleccionar al instructor por su ID e información adicional
  instructorId: z.any().optional(),
  instructorName: z.string().optional(),
  instructorContact: z.string().optional(),
  
  // Campos para inscripciones de participantes
  registrationEnabled: z.boolean().default(false),
  maxRegistrations: z.coerce.number().int().positive().optional(),
  registrationDeadline: z.string().optional(),
  requiresApproval: z.boolean().default(true),
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

  // Obtener las categorías dinámicamente desde la API
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['/api/activity-categories'],
  });
  
  // Inicializar el formulario con valores por defecto completos
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
      recurringDays: [],
      targetMarket: [],
      specialNeeds: [],
      instructorId: null,
      instructorName: "",
      instructorContact: "",
      duration: 60,
      registrationEnabled: false,
      maxRegistrations: 20,
      registrationDeadline: "",
      requiresApproval: true,
    },
    mode: "onChange"
  });
  
  // Llenar el formulario con los datos de la actividad cuando se carguen
  useEffect(() => {
    if (actividad && typeof actividad === 'object') {
      const data = actividad as any;
      
      // Extraer fecha y hora del startDate
      let startDate = data.startDate;
      let startTime = "09:00";
      let endTime = "10:00";
      
      if (data.startDate) {
        try {
          const startDateObj = new Date(data.startDate);
          startDate = format(startDateObj, 'yyyy-MM-dd');
          startTime = format(startDateObj, 'HH:mm');
        } catch (error) {
          console.error("Error al parsear fecha de inicio:", error);
        }
      }
      
      // Calcular hora de fin si hay duración
      if (data.duration && startTime) {
        try {
          const [hours, minutes] = startTime.split(':').map(Number);
          const startMinutes = hours * 60 + minutes;
          const endMinutes = startMinutes + (data.duration || 60);
          
          const endHours = Math.floor(endMinutes / 60) % 24;
          const endMins = endMinutes % 60;
          
          endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        } catch (error) {
          console.error("Error al calcular hora de fin:", error);
        }
      }
      
      setHoraInicio(startTime);
      setHoraFin(endTime);
      
      // Llenar el formulario asegurando que todos los campos tengan valores válidos
      form.reset({
        title: data.title || "",
        description: data.description || "",
        parkId: Number(data.parkId) || 0,
        startDate: startDate || "",
        endDate: data.endDate ? format(new Date(data.endDate), 'yyyy-MM-dd') : "",
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        category: data.categoryId ? data.categoryId.toString() : "",
        location: data.location || "",
        capacity: Number(data.capacity) || 20,
        price: Number(data.price) || 0,
        isPriceRandom: Boolean(data.isPriceRandom),
        isFree: Boolean(data.isFree),
        materials: data.materials || "",
        requirements: data.requirements || "",
        isRecurring: Boolean(data.isRecurring),
        recurringDays: Array.isArray(data.recurringDays) ? data.recurringDays : [],
        targetMarket: Array.isArray(data.targetMarket) ? data.targetMarket : [],
        specialNeeds: Array.isArray(data.specialNeeds) ? data.specialNeeds : [],
        instructorId: data.instructorId && data.instructorId !== 0 ? Number(data.instructorId) : undefined,
        instructorName: data.instructorName || "",
        instructorContact: data.instructorContact || "",
        duration: Number(data.duration) || calcularDuracionEnMinutos(startTime, endTime),
        registrationEnabled: Boolean(data.registrationEnabled),
        maxRegistrations: Number(data.maxRegistrations) || 20,
        registrationDeadline: data.registrationDeadline ? format(new Date(data.registrationDeadline), 'yyyy-MM-dd') : "",
        requiresApproval: Boolean(data.requiresApproval),
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
        category_id: parseInt(values.category),
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
        registrationEnabled: values.registrationEnabled || false,
        maxRegistrations: values.maxRegistrations || null,
        registrationDeadline: values.registrationDeadline ? formatearFechaParaAPI(values.registrationDeadline) : null,
        requiresApproval: values.requiresApproval || true,
      };
      
      // Agregar datos del instructor si se seleccionó uno
      let instructorData = {};
      if (values.instructorId && values.instructorId !== 0) {
        instructorData = {
          instructorId: values.instructorId,
          instructorName: values.instructorName,
          instructorContact: values.instructorContact
        };
      } else {
        // Asegurar que los campos de instructor se envíen como null cuando no hay instructor
        instructorData = {
          instructorId: null,
          instructorName: null,
          instructorContact: null
        };
      }
      
      const finalData = { ...data, ...instructorData };
      console.log("Enviando datos a la API:", finalData);
      
      // Usar safeApiRequest en lugar de fetch directo
      return await safeApiRequest(`/api/activities/${activityId}`, { 
        method: 'PUT', 
        data: finalData 
      });
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
    console.log("🚀 onSubmit ejecutado con valores:", values);
    console.log("🔍 Errores del formulario:", form.formState.errors);
    console.log("🔍 Estado del formulario válido:", form.formState.isValid);
    console.log("🔍 Campos sucios:", form.formState.dirtyFields);
    
    actualizarActividad.mutate(values);
  };
  

  
  // Días de la semana para actividades recurrentes
  const diasSemana = [
    { id: "Lunes", label: "Lunes" },
    { id: "Martes", label: "Martes" },
    { id: "Miércoles", label: "Miércoles" },
    { id: "Jueves", label: "Jueves" },
    { id: "Viernes", label: "Viernes" },
    { id: "Sábado", label: "Sábado" },
    { id: "Domingo", label: "Domingo" }
  ];
  
  // Opciones de mercado meta para la segmentación
  const mercadoObjetivo = [
    { id: "preescolar", label: "Preescolar - 0 a 5 años" },
    { id: "ninos", label: "Niños - 6 a 12 años" },
    { id: "adolescentes", label: "Adolescentes - 13 a 18 años" },
    { id: "adultos", label: "Adultos - 19 a 65 años" },
    { id: "adultosmayores", label: "Adultos Mayores - +65 años" }
  ];
  
  // Opciones de capacidades diferentes
  const necesidadesEspeciales = [
    { id: "fisica", label: "Física / Motriz" },
    { id: "visual", label: "Visual" },
    { id: "auditiva", label: "Auditiva" },
    { id: "intelectual", label: "Intelectual / Cognitiva" },
    { id: "psicosocial", label: "Psicosocial / Mental" },
    { id: "neurodivergencias", label: "Neurodivergencias" },
    { id: "multiple", label: "Múltiple / Combinada" },
    { id: "temporal", label: "Temporal" }
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
                        value={field.value?.toString() || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un parque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(parques) ? parques.map((parque: any) => (
                            <SelectItem key={parque.id} value={parque.id.toString() || "0"}>
                              {parque.name || "Parque sin nombre"}
                            </SelectItem>
                          )) : parques?.data?.map((parque: any) => (
                            <SelectItem key={parque.id} value={parque.id.toString() || "0"}>
                              {parque.name || "Parque sin nombre"}
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
                          {Array.isArray(categoriesData) && categoriesData.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
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
                                key={dia.id}
                                control={form.control}
                                name="recurringDays"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                                min={0}
                                step="0.01"
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '') {
                                    field.onChange(0);
                                  } else {
                                    const numericValue = parseFloat(value);
                                    if (!isNaN(numericValue)) {
                                      field.onChange(numericValue);
                                    }
                                  }
                                }}
                                placeholder="0.00"
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
                            key={grupo.id}
                            control={form.control}
                            name="targetMarket"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(grupo.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], grupo.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== grupo.id
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
                            key={necesidad.id}
                            control={form.control}
                            name="specialNeeds"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(necesidad.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], necesidad.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== necesidad.id
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
                          if (value === "0") {
                            field.onChange(undefined);
                            form.setValue("instructorName", "");
                            form.setValue("instructorContact", "");
                          } else {
                            const instructorId = parseInt(value);
                            field.onChange(instructorId);
                            
                            // Encontrar el instructor seleccionado
                            const instructor = instructores?.find((i: any) => i.id === instructorId);
                            if (instructor) {
                              form.setValue("instructorName", instructor.fullName || `${instructor.firstName} ${instructor.lastName}`);
                              form.setValue("instructorContact", instructor.email || instructor.contactEmail || '');
                            }
                          }
                        }}
                        value={field.value ? field.value.toString() : "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un instructor (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sin instructor asignado</SelectItem>
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
                
                {form.watch("instructorId") && form.watch("instructorId") !== 0 && form.watch("instructorId") !== undefined && (
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

            {/* Configuración de Inscripciones */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Inscripciones</CardTitle>
                <CardDescription>
                  Configuración para permitir inscripciones ciudadanas a esta actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Habilitar inscripciones */}
                <FormField
                  control={form.control}
                  name="registrationEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Permitir inscripciones públicas
                        </FormLabel>
                        <FormDescription>
                          Los ciudadanos podrán inscribirse a esta actividad desde las páginas públicas
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

                {/* Mostrar campos adicionales solo si las inscripciones están habilitadas */}
                {form.watch("registrationEnabled") && (
                  <>
                    {/* Capacidad máxima de inscripciones */}
                    <FormField
                      control={form.control}
                      name="maxRegistrations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad máxima de inscripciones</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              min={1}
                              max={1000}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de personas que pueden inscribirse
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Fecha límite de inscripción */}
                    <FormField
                      control={form.control}
                      name="registrationDeadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha límite de inscripción</FormLabel>
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
                                  field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                }}
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Fecha límite para que los ciudadanos se inscriban
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Requiere aprobación */}
                    <FormField
                      control={form.control}
                      name="requiresApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Requiere aprobación administrativa
                            </FormLabel>
                            <FormDescription>
                              Las inscripciones quedarán pendientes hasta ser aprobadas por un administrador
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
                onClick={(e) => {
                  console.log("🔥 Botón clickeado - evento submit");
                  console.log("🔍 Form valid:", form.formState.isValid);
                  console.log("🔍 Form errors:", form.formState.errors);
                  // No prevenimos default, dejamos que el form maneje
                }}
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

        {/* Gestión de Imágenes */}
        <div className="mt-8">
          <ActivityImageManager activityId={parseInt(params.id || '0')} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditarActividadPage;