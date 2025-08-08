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
import { CalendarClock, MapPin, Users, DollarSign, Clock, AlertCircle, CheckCircle, ArrowLeft, Save } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { SpaceMediaManager } from '@/components/SpaceMediaManager';

// Validation schema
const editReservationSchema = z.object({
  space_id: z.string().min(1, 'Selecciona un espacio'),
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  reservation_date: z.string().min(1, 'Selecciona una fecha'),
  start_time: z.string().min(1, 'Selecciona hora de inicio'),
  end_time: z.string().min(1, 'Selecciona hora de fin'),
  special_requests: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
  deposit_paid: z.boolean().default(false)
});

type EditReservationFormData = z.infer<typeof editReservationSchema>;

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
  location: string;
}

interface SpaceReservation {
  id: number;
  space_id: number;
  space_name: string;
  park_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  purpose: string;
  special_requests: string;
  status: string;
  total_cost: number;
  deposit_amount: number;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditReservationPage() {
  const params = useParams();
  const reservationId = params.id;
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSpace, setSelectedSpace] = useState<ReservableSpace | null>(null);
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const form = useForm<EditReservationFormData>({
    resolver: zodResolver(editReservationSchema),
    defaultValues: {
      space_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      reservation_date: '',
      start_time: '',
      end_time: '',
      special_requests: '',
      status: 'pending',
      deposit_paid: false
    }
  });

  // Get reservation data
  const { data: reservation, isLoading: reservationLoading } = useQuery<SpaceReservation>({
    queryKey: [`/api/space-reservations/${reservationId}`],
    queryFn: async () => {
      const response = await fetch(`/api/space-reservations/${reservationId}`);
      if (!response.ok) {
        throw new Error('Error al cargar la reserva');
      }
      return response.json();
    },
    enabled: !!reservationId
  });

  // Get available spaces
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

  // Update form when reservation data loads
  useEffect(() => {
    if (reservation) {
      form.reset({
        space_id: reservation.space_id.toString(),
        customer_name: reservation.contact_name,
        customer_email: reservation.contact_email,
        customer_phone: reservation.contact_phone,
        reservation_date: reservation.reservation_date,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        special_requests: reservation.special_requests || '',
        status: reservation.status as any,
        deposit_paid: reservation.deposit_paid
      });

      // Find and set selected space
      const space = spaces.find(s => s.id === reservation.space_id);
      if (space) {
        setSelectedSpace(space);
      }
    }
  }, [reservation, spaces, form]);

  // Calculate cost when space or times change
  useEffect(() => {
    if (selectedSpace) {
      const startTime = form.watch('start_time');
      const endTime = form.watch('end_time');
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
        
        setTotalHours(hours);
        setCalculatedCost(hours * parseFloat(selectedSpace.hourly_rate));
      }
    }
  }, [selectedSpace, form.watch('start_time'), form.watch('end_time')]);

  // Update mutation
  const updateReservationMutation = useMutation({
    mutationFn: async (data: EditReservationFormData) => {
      // Convert form data to backend format
      const backendData = {
        spaceId: parseInt(data.space_id),
        contactName: data.customer_name,
        contactEmail: data.customer_email,
        contactPhone: data.customer_phone,
        reservationDate: data.reservation_date,
        startTime: data.start_time,
        endTime: data.end_time,
        specialRequests: data.special_requests || '',
        status: data.status,
        expectedAttendees: selectedSpace?.capacity || 1,
        purpose: 'Evento privado',
        totalCost: calculatedCost,
        depositPaid: data.deposit_paid
      };

      const response = await fetch(`/api/space-reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la reserva');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva actualizada",
        description: "La reserva se ha actualizado exitosamente",
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
    }
  });

  const handleSubmit = (data: EditReservationFormData) => {
    if (!selectedSpace) {
      toast({
        title: "Error",
        description: "Por favor selecciona un espacio",
        variant: "destructive",
      });
      return;
    }
    updateReservationMutation.mutate(data);
  };

  const handleSpaceChange = (spaceId: string) => {
    const space = spaces.find(s => s.id === parseInt(spaceId));
    setSelectedSpace(space || null);
  };

  if (reservationLoading || spacesLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">Cargando reserva...</div>
      </AdminLayout>
    );
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600">Reserva no encontrada</h2>
          <Button
            onClick={() => setLocation('/admin/space-reservations')}
            className="mt-4"
          >
            Volver a Reservas
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/space-reservations')}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Reservas
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Reserva</h1>
                <p className="text-gray-600">
                  Modifica los detalles de la reserva #{reservation.id}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="xl:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-6">
                  {/* Space Selection */}
                  <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Selección de Espacio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="space_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espacio Reservable</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleSpaceChange(value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un espacio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {spaces.map((space) => (
                                <SelectItem key={space.id} value={space.id.toString()}>
                                  {space.name} - {space.park_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedSpace && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">{selectedSpace.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{selectedSpace.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Capacidad:</span> {selectedSpace.capacity} personas
                          </div>
                          <div>
                            <span className="font-medium">Tarifa:</span> ${selectedSpace.hourly_rate}/hora
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {selectedSpace.space_type}
                          </div>
                          <div>
                            <span className="font-medium">Ubicación:</span> {selectedSpace.location}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Información del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del responsable" {...field} />
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
                              <Input type="email" placeholder="email@ejemplo.com" {...field} />
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
                              <Input placeholder="33 1234 5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Reservation Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5" />
                      Detalles de la Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="reservation_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de la Reserva</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado de la Reserva</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="confirmed">Confirmada</SelectItem>
                              <SelectItem value="cancelled">Cancelada</SelectItem>
                              <SelectItem value="completed">Completada</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="special_requests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solicitudes Especiales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detalles adicionales o solicitudes especiales..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                {/* Cost Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Resumen de Costos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSpace && totalHours > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Tarifa por hora:</span>
                          <span>${selectedSpace.hourly_rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duración:</span>
                          <span>{totalHours} {totalHours === 1 ? 'hora' : 'horas'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>${calculatedCost.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Selecciona un espacio y horarios para calcular el costo
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Estado de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                              Depósito pagado
                            </FormLabel>
                            <p className="text-sm text-gray-500">
                              Marcar si el cliente ya pagó el depósito
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/space-reservations')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateReservationMutation.isPending}
                  >
                    {updateReservationMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar Reserva
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Multimedia Management */}
            <Card className="w-full mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Gestión Multimedia
                </CardTitle>
                <CardDescription>
                  Gestiona las imágenes y documentos de esta reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservation ? (
                  <SpaceMediaManager spaceId={reservation.space_id} isEditMode={true} />
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Cargando multimedia...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Cost Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumen de Costos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSpace && totalHours > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tarifa por hora:</span>
                        <span>${selectedSpace.hourly_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span>{totalHours} {totalHours === 1 ? 'hora' : 'horas'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${calculatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Selecciona un espacio y horarios para calcular el costo
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Reservation Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Estado de la Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span>#{reservation.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha de creación:</span>
                      <span>
                        {reservation.created_at ? 
                          new Date(reservation.created_at).toLocaleDateString() : 
                          'No disponible'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado actual:</span>
                      <Badge variant={
                        reservation.status === 'confirmed' ? 'default' :
                        reservation.status === 'pending' ? 'secondary' :
                        reservation.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }>
                        {reservation.status === 'pending' ? 'Pendiente' :
                         reservation.status === 'confirmed' ? 'Confirmada' :
                         reservation.status === 'cancelled' ? 'Cancelada' :
                         reservation.status === 'completed' ? 'Completada' :
                         reservation.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}