import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, MapPin, Users, DollarSign, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

// Validation schema
const reservationSchema = z.object({
  space_id: z.string().min(1, 'Selecciona un espacio'),
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  start_date: z.string().min(1, 'Selecciona fecha de inicio'),
  end_date: z.string().min(1, 'Selecciona fecha de fin'),
  start_time: z.string().min(1, 'Selecciona hora de inicio'),
  end_time: z.string().min(1, 'Selecciona hora de fin'),
  special_requests: z.string().optional(),
  deposit_paid: z.boolean().default(false)
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
  path: ["end_date"],
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservableSpace {
  id: number;
  park_id: number;
  park_name: string;
  name: string;
  description: string;
  space_type: string;
  capacity: number;
  hourly_rate: string;
  minimum_hours: number;
  maximum_hours: number;
  amenities: string;
  rules: string;
  is_active: boolean;
  requires_approval: boolean;
  advance_booking_days: number;
}

const spaceTypeLabels = {
  playground: 'Área de Juegos',
  kiosk: 'Kiosco',
  picnic_area: 'Área de Picnic',
  open_area: 'Área Abierta',
  pavilion: 'Pabellón'
};

export default function NewReservationPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSpace, setSelectedSpace] = useState<ReservableSpace | null>(null);
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // Get pre-selected space from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedSpaceId = urlParams.get('space_id');

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      space_id: preSelectedSpaceId || '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      special_requests: '',
      deposit_paid: false
    }
  });

  const { data: spaces = [], isLoading: spacesLoading } = useQuery<ReservableSpace[]>({
    queryKey: ['/api/reservable-spaces'],
    queryFn: async () => {
      const response = await fetch('/api/reservable-spaces?active_only=true');
      if (!response.ok) {
        throw new Error('Error al cargar los espacios');
      }
      return response.json();
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      // Convert form data to backend format
      const backendData = {
        spaceId: parseInt(data.space_id),
        contactName: data.customer_name,
        contactEmail: data.customer_email,
        contactPhone: data.customer_phone,
        startDate: data.start_date,
        endDate: data.end_date,
        startTime: data.start_time,
        endTime: data.end_time,
        specialRequests: data.special_requests || '',
        expectedAttendees: selectedSpace?.capacity || 1,
        purpose: 'Evento privado - Múltiples días',
        totalCost: calculatedCost,
        depositPaid: data.deposit_paid,
        eventId: null,
        activityId: null
      };

      const response = await fetch('/api/space-reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva creada",
        description: "La reserva se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/space-reservations'] });
      setLocation('/admin/space-reservations');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Watch for space selection changes
  const watchedSpaceId = form.watch('space_id');
  const watchedStartDate = form.watch('start_date');
  const watchedEndDate = form.watch('end_date');
  const watchedStartTime = form.watch('start_time');
  const watchedEndTime = form.watch('end_time');

  useEffect(() => {
    if (watchedSpaceId) {
      const space = spaces.find(s => s.id.toString() === watchedSpaceId);
      setSelectedSpace(space || null);
    }
  }, [watchedSpaceId, spaces]);

  useEffect(() => {
    if (selectedSpace && watchedStartDate && watchedEndDate && watchedStartTime && watchedEndTime) {
      const startDate = new Date(watchedStartDate);
      const endDate = new Date(watchedEndDate);
      
      // Calculate number of days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
      
      // Calculate hours per day
      const start = new Date(`2000-01-01T${watchedStartTime}`);
      const end = new Date(`2000-01-01T${watchedEndTime}`);
      const diffMs = end.getTime() - start.getTime();
      const hoursPerDay = diffMs / (1000 * 60 * 60);
      
      if (hoursPerDay > 0) {
        // Total hours = hours per day × number of days
        const totalHours = hoursPerDay * totalDays;
        setTotalHours(totalHours);
        setCalculatedCost(totalHours * parseFloat(selectedSpace.hourly_rate));
      } else {
        setTotalHours(0);
        setCalculatedCost(0);
      }
    }
  }, [selectedSpace, watchedStartDate, watchedEndDate, watchedStartTime, watchedEndTime]);

  const onSubmit = (data: ReservationFormData) => {
    createReservationMutation.mutate(data);
  };

  // Check if selected time range is valid
  const isTimeRangeValid = () => {
    if (!selectedSpace || !watchedStartTime || !watchedEndTime) return true;
    
    const hours = totalHours;
    return hours >= selectedSpace.minimum_hours && hours <= selectedSpace.maximum_hours;
  };

  // Get minimum date (today + advance booking days)
  const getMinDate = () => {
    if (!selectedSpace) return new Date().toISOString().split('T')[0];
    
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + selectedSpace.advance_booking_days);
    return minDate.toISOString().split('T')[0];
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Plus className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Nueva Reserva</h1>
          </div>
          <p className="text-gray-600">Crear una nueva reserva de espacio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Space Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Seleccionar Espacio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="space_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espacio a Reservar</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un espacio" />
                              </SelectTrigger>
                              <SelectContent>
                                {spaces.map((space) => (
                                  <SelectItem key={space.id} value={space.id.toString()}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{space.name}</span>
                                      <span className="text-sm text-gray-500">
                                        {space.park_name} - ${space.hourly_rate}/hora
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customer_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="cliente@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customer_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="(33) 1234-5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Date and Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5" />
                      Fecha y Horario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={getMinDate()}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Fin</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={watchedStartDate || getMinDate()}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {selectedSpace && selectedSpace.advance_booking_days > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-600">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Requiere reserva con {selectedSpace.advance_booking_days} días de anticipación
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Inicio</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Fin</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {selectedSpace && !isTimeRangeValid() && totalHours > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          La duración debe ser entre {selectedSpace.minimum_hours} y {selectedSpace.maximum_hours} horas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="special_requests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solicitudes Especiales (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe cualquier solicitud especial o requerimiento adicional..."
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
                      name="deposit_paid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Depósito Pagado
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Marcar si el cliente ya ha pagado el depósito requerido
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleGoBack}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                    disabled={createReservationMutation.isPending || !isTimeRangeValid()}
                  >
                    {createReservationMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Crear Reserva
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {selectedSpace && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{selectedSpace.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        {selectedSpace.park_name}
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {spaceTypeLabels[selectedSpace.space_type as keyof typeof spaceTypeLabels]}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Capacidad:
                        </span>
                        <span>{selectedSpace.capacity} personas</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Precio/hora:
                        </span>
                        <span>${selectedSpace.hourly_rate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duración mín/máx:
                        </span>
                        <span>{selectedSpace.minimum_hours}h - {selectedSpace.maximum_hours}h</span>
                      </div>
                    </div>
                    
                    {totalHours > 0 && watchedStartDate && watchedEndDate && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          {(() => {
                            const startDate = new Date(watchedStartDate);
                            const endDate = new Date(watchedEndDate);
                            const timeDiff = endDate.getTime() - startDate.getTime();
                            const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
                            const hoursPerDay = totalHours / totalDays;
                            
                            return (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Período:</span>
                                  <span>{totalDays} {totalDays === 1 ? 'día' : 'días'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Horas por día:</span>
                                  <span>{hoursPerDay.toFixed(1)} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Total horas:</span>
                                  <span>{totalHours.toFixed(1)} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span>${calculatedCost.toFixed(2)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-[#00a587]">${calculatedCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    {selectedSpace.requires_approval && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-600">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Este espacio requiere aprobación administrativa
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {selectedSpace && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reglas del Espacio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{selectedSpace.rules}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}