import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Esquema de validación para la edición de participaciones
const participationSchema = z.object({
  activityName: z.string().min(3, { message: 'El nombre de la actividad es requerido' }),
  parkId: z.coerce.number({ invalid_type_error: 'Seleccione un parque' }),
  activityDate: z.date({ invalid_type_error: 'La fecha es requerida' }),
  hoursContributed: z.coerce.number().min(1, { message: 'Las horas deben ser al menos 1' }),
  supervisorId: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof participationSchema>;

const ParticipationEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch participation data
  const { data: participation, isLoading: isLoadingParticipation } = useQuery({
    queryKey: [`/api/participations/${id}`],
    enabled: !!id,
  });

  // Fetch volunteer data
  const { data: volunteer } = useQuery({
    queryKey: [`/api/volunteers/${participation?.volunteerId}`],
    enabled: !!participation?.volunteerId,
  });

  // Fetch parks for dropdown
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(participationSchema),
    defaultValues: {
      activityName: '',
      parkId: 0,
      activityDate: new Date(),
      hoursContributed: 1,
      supervisorId: null,
      notes: '',
    },
    values: participation ? {
      activityName: participation.activityName,
      parkId: participation.parkId,
      activityDate: new Date(participation.activityDate),
      hoursContributed: participation.hoursContributed,
      supervisorId: participation.supervisorId || null,
      notes: participation.notes || '',
    } : undefined,
  });

  // Update participation mutation
  const updateParticipation = useMutation({
    mutationFn: (data: FormValues) => {
      return apiRequest({
        method: 'PUT',
        url: `/api/participations/${id}`,
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Participación actualizada',
        description: 'Los datos se han guardado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/participations/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/participations/all'] });
      queryClient.invalidateQueries({ queryKey: [`/api/volunteers/${participation?.volunteerId}/participations`] });
      setLocation('/admin/volunteers/participations');
    },
    onError: (error) => {
      console.error('Error al actualizar participación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la participación. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await updateParticipation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingParticipation) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Cargando datos de la participación...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!participation) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10 text-center">
          <p className="text-red-500">No se encontró la participación solicitada.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation('/admin/volunteers/participations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al listado
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Editar Participación</h1>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin/volunteers/participations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {volunteer && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-6 border border-blue-200">
            <h2 className="font-bold text-lg text-blue-800">Voluntario</h2>
            <p className="text-blue-700">
              <span className="font-semibold">{volunteer.fullName}</span> - ID: {volunteer.id}
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Datos de la Participación</CardTitle>
            <CardDescription>Edite los detalles de la participación del voluntario en esta actividad.</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="activityName">Nombre de la Actividad</Label>
                  <Input 
                    id="activityName"
                    placeholder="Nombre de la actividad" 
                    {...form.register('activityName')}
                  />
                  {form.formState.errors.activityName && (
                    <p className="text-sm text-red-500">{form.formState.errors.activityName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkId">Parque</Label>
                  <Select
                    value={form.watch('parkId')?.toString()}
                    onValueChange={(value) => form.setValue('parkId', parseInt(value), {
                      shouldValidate: true
                    })}
                  >
                    <SelectTrigger id="parkId">
                      <SelectValue placeholder="Seleccionar parque" />
                    </SelectTrigger>
                    <SelectContent>
                      {parks.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name || `Parque ID: ${park.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.parkId && (
                    <p className="text-sm text-red-500">{form.formState.errors.parkId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityDate">Fecha de la Actividad</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('activityDate') ? (
                          format(form.watch('activityDate'), 'PPP', { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('activityDate')}
                        onSelect={(date) => form.setValue('activityDate', date || new Date(), {
                          shouldValidate: true
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.activityDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.activityDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursContributed">Horas Contribuidas</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <Input 
                      id="hoursContributed"
                      type="number" 
                      min="1"
                      placeholder="Número de horas" 
                      {...form.register('hoursContributed', { valueAsNumber: true })}
                    />
                  </div>
                  {form.formState.errors.hoursContributed && (
                    <p className="text-sm text-red-500">{form.formState.errors.hoursContributed.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas y observaciones</Label>
                <Textarea 
                  id="notes"
                  placeholder="Notas sobre la participación" 
                  rows={4}
                  {...form.register('notes')}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/admin/volunteers/participations')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || updateParticipation.isPending}
              >
                {(isSubmitting || updateParticipation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isSubmitting && !updateParticipation.isPending && (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ParticipationEdit;