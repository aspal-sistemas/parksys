import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, ArrowLeftCircle, ArrowRightCircle, Plus, Calendar, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Esquema para la programación de mantenimiento
const maintenanceSchema = z.object({
  assetId: z.number().min(1, "Debe seleccionar un activo"),
  date: z.string().min(1, "La fecha es obligatoria"),
  maintenanceType: z.string().min(1, "El tipo de mantenimiento es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  estimatedCost: z.number().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]),
  assignedToId: z.number().nullable().optional(),
  notes: z.string().nullable().optional()
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

// Tipos de mantenimiento
const MAINTENANCE_TYPES = [
  "Limpieza",
  "Inspección",
  "Reparación",
  "Reemplazo",
  "Pintura",
  "Lubricación",
  "Ajuste",
  "Actualización",
  "Otro"
];

// Prioridades
const PRIORITIES = [
  { value: "low", label: "Baja", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Media", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800" }
];

const MaintenanceCalendarPage = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Obtener lista de activos
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/assets'],
  });
  
  // Obtener lista de usuarios (técnicos) para asignación
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    retry: false,
  });
  
  // Obtener todos los mantenimientos programados
  const { data: scheduledMaintenances, isLoading: maintenancesLoading } = useQuery({
    queryKey: ['/api/maintenance/scheduled'],
    retry: false,
    // Si la API no existe todavía, podemos usar un fallback
    staleTime: 60000,
  });
  
  // Obtener los próximos mantenimientos
  const { data: upcomingMaintenances, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/assets/maintenance/upcoming'],
  });
  
  // Configurar formulario
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetId: undefined,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      maintenanceType: '',
      description: '',
      estimatedCost: null,
      priority: 'medium',
      assignedToId: null,
      notes: ''
    },
  });
  
  // Actualizar fecha en formulario cuando cambia la fecha seleccionada
  React.useEffect(() => {
    if (selectedDate) {
      form.setValue('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, form]);
  
  // Mutación para programar un nuevo mantenimiento
  const scheduleMutation = useMutation({
    mutationFn: (data: MaintenanceFormValues) => {
      return apiRequest('/api/maintenance/schedule', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance/scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets/maintenance/upcoming'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Mantenimiento programado",
        description: "El mantenimiento se ha programado correctamente.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al programar el mantenimiento.",
        variant: "destructive",
      });
      console.error('Error al programar mantenimiento:', error);
    }
  });
  
  // Navegar al mes anterior
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navegar al mes siguiente
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Navegar al mes actual
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Obtener días del mes actual
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Obtener el nombre del día de la semana
  const getDayName = (date: Date) => {
    return format(date, 'EEE', { locale: es });
  };
  
  // Verificar si hay mantenimientos programados para una fecha
  const getMaintenancesForDay = (date: Date) => {
    // Si la API existe, usar datos reales
    if (scheduledMaintenances) {
      return scheduledMaintenances.filter((maintenance: any) => 
        isSameDay(parseISO(maintenance.date), date)
      );
    }
    
    // Fallback con datos de próximos mantenimientos (si no existe la API específica)
    if (upcomingMaintenances) {
      return upcomingMaintenances.filter((maintenance: any) => 
        maintenance.nextMaintenanceDate && 
        isSameDay(parseISO(maintenance.nextMaintenanceDate), date)
      );
    }
    
    return [];
  };
  
  // Manejar el envío del formulario
  const onSubmit = (data: MaintenanceFormValues) => {
    scheduleMutation.mutate(data);
  };
  
  // Manejar clic en un día
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddDialogOpen(true);
  };
  
  // Determinar la clase CSS para un día en función de sus mantenimientos
  const getDayClass = (date: Date) => {
    const maintenances = getMaintenancesForDay(date);
    
    if (maintenances.length === 0) {
      return "bg-white hover:bg-blue-50";
    }
    
    // Verificar si hay mantenimientos de alta prioridad
    const hasHighPriority = maintenances.some((m: any) => m.priority === 'high');
    
    if (hasHighPriority) {
      return "bg-red-50 hover:bg-red-100 border-red-200";
    }
    
    // Verificar si hay mantenimientos de prioridad media
    const hasMediumPriority = maintenances.some((m: any) => m.priority === 'medium');
    
    if (hasMediumPriority) {
      return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
    }
    
    // Si solo hay de prioridad baja
    return "bg-blue-50 hover:bg-blue-100 border-blue-200";
  };
  
  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No programado';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Determinar el color de la badge según la prioridad
  const getPriorityBadgeColor = (priority: string) => {
    const priorityInfo = PRIORITIES.find(p => p.value === priority);
    return priorityInfo?.color || "bg-gray-100 text-gray-800";
  };
  
  // Mostrar cargando si aún no se han cargado los datos
  const isLoading = assetsLoading || maintenancesLoading || upcomingLoading;
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Calendario de Mantenimiento</h1>
              <p className="text-muted-foreground">
                Programa y visualiza los mantenimientos de activos
              </p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setLocation('/admin/assets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Activos
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Calendario de Mantenimiento</h1>
              <p className="text-muted-foreground">
                Programa y visualiza los mantenimientos de activos
              </p>
            </div>
          </div>
          <Button onClick={() => handleDayClick(new Date())}>
            <Plus className="mr-2 h-4 w-4" />
            Programar Mantenimiento
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de próximos mantenimientos */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Mantenimientos</CardTitle>
              <CardDescription>
                Mantenimientos pendientes ordenados por fecha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMaintenances && upcomingMaintenances.length > 0 ? (
                  upcomingMaintenances.slice(0, 5).map((maintenance: any, index: number) => (
                    <div key={index} className="border rounded-md p-3 bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{maintenance.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(maintenance.nextMaintenanceDate)}
                          </p>
                        </div>
                        <Badge className={getPriorityBadgeColor(maintenance.priority || 'medium')}>
                          {PRIORITIES.find(p => p.value === (maintenance.priority || 'medium'))?.label || 'Media'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm">{maintenance.maintenanceType || 'Mantenimiento regular'}</p>
                        {maintenance.assignedTo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Asignado a: {maintenance.assignedTo.fullName || maintenance.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p>No hay mantenimientos programados próximamente</p>
                  </div>
                )}
                
                {upcomingMaintenances && upcomingMaintenances.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="link" onClick={() => {}}>
                      Ver todos ({upcomingMaintenances.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Calendario */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ArrowLeftCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ArrowRightCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabecera de días de la semana */}
              <div className="grid grid-cols-7 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Rejilla del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {/* Espacios en blanco para el primer día del mes */}
                {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                ))}
                
                {/* Días del mes */}
                {daysInMonth.map((day, index) => {
                  const maintenances = getMaintenancesForDay(day);
                  const dayClass = getDayClass(day);
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square border rounded-md relative p-1 cursor-pointer ${dayClass}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-sm font-medium">
                        {format(day, 'd')}
                      </div>
                      
                      {/* Indicadores de mantenimientos */}
                      {maintenances.length > 0 && (
                        <div className="absolute bottom-1 right-1">
                          <Badge variant="outline" className="text-xs">
                            {maintenances.length}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Leyenda */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-1"></div>
                  <span>Prioridad Alta</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 mr-1"></div>
                  <span>Prioridad Media</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-1"></div>
                  <span>Prioridad Baja</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Diálogo para programar mantenimiento */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Programar Mantenimiento</DialogTitle>
              <DialogDescription>
                {selectedDate && (
                  <>Fecha seleccionada: {format(selectedDate, 'dd/MM/yyyy')}</>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activo*</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un activo" />
                          </SelectTrigger>
                          <SelectContent>
                            {assets?.map((asset: any) => (
                              <SelectItem key={asset.id} value={asset.id.toString()}>
                                {asset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha*</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Mantenimiento*</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {MAINTENANCE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa el mantenimiento a realizar" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Estimado</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="$" 
                            {...field} 
                            value={field.value === null ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad*</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITIES.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {users && (
                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asignar a</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value?.toString() || ''} 
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un técnico" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Sin asignar</SelectItem>
                              {users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName || `${user.firstName} ${user.lastName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas o instrucciones adicionales" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? 'Programando...' : 'Programar Mantenimiento'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MaintenanceCalendarPage;