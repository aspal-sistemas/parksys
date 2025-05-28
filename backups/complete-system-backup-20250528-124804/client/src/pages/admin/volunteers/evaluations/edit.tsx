import React, { useState } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Save,
  Star,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';

// Validación del formulario
const evaluationFormSchema = z.object({
  punctuality: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'La puntuación es requerida').max(5, 'Máximo 5 puntos')
  ),
  attitude: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'La puntuación es requerida').max(5, 'Máximo 5 puntos')
  ),
  responsibility: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'La puntuación es requerida').max(5, 'Máximo 5 puntos')
  ),
  overallPerformance: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'La puntuación es requerida').max(5, 'Máximo 5 puntos')
  ),
  comments: z.string().optional().nullable(),
  followUpRequired: z.boolean().default(false),
});

type EvaluationFormValues = z.infer<typeof evaluationFormSchema>;

const RatingSelect = ({ value, onChange }: { value: number, onChange: (value: string) => void }) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <div
          key={rating}
          className={`cursor-pointer p-2 rounded-full transition-colors ${
            rating <= value
              ? 'text-yellow-500'
              : 'text-gray-300'
          }`}
          onClick={() => onChange(rating.toString())}
        >
          <Star className={`h-6 w-6 ${rating <= value ? 'fill-yellow-500' : ''}`} />
        </div>
      ))}
    </div>
  );
};

const EvaluationEdit: React.FC = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Obtener datos de la evaluación
  const { data: evaluation, isLoading, isError } = useQuery({
    queryKey: [`/api/volunteers/evaluations/${id}`],
  });
  
  // Obtener datos del voluntario
  const { data: volunteer } = useQuery({
    queryKey: ['/api/volunteers', evaluation?.volunteerId],
    enabled: !!evaluation?.volunteerId,
  });

  // Obtener datos de la participación asociada
  const { data: participation } = useQuery({
    queryKey: ['/api/participations', evaluation?.participationId],
    enabled: !!evaluation?.participationId,
  });

  // Formulario con datos pre-cargados
  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      punctuality: evaluation?.punctuality || 3,
      attitude: evaluation?.attitude || 3,
      responsibility: evaluation?.responsibility || 3,
      overallPerformance: evaluation?.overallPerformance || 3,
      comments: evaluation?.comments || '',
      followUpRequired: evaluation?.followUpRequired || false,
    },
    values: evaluation ? {
      punctuality: evaluation.punctuality,
      attitude: evaluation.attitude,
      responsibility: evaluation.responsibility,
      overallPerformance: evaluation.overallPerformance,
      comments: evaluation.comments,
      followUpRequired: evaluation.followUpRequired,
    } : undefined,
  });

  // Mutation para actualizar evaluación
  const updateEvaluation = useMutation({
    mutationFn: async (data: EvaluationFormValues) => {
      return await apiRequest(`/api/volunteers/evaluations/${id}`, {
        method: 'PUT',
        data: {
          ...data,
          volunteerId: evaluation.volunteerId,
          participationId: evaluation.participationId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/volunteers/evaluations/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers/evaluations'] });
      toast({
        title: 'Evaluación actualizada',
        description: 'La evaluación ha sido actualizada exitosamente',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error al actualizar evaluación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la evaluación. Intente nuevamente.',
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: EvaluationFormValues) => {
    updateEvaluation.mutate(data);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="ml-2">Cargando información de la evaluación...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !evaluation) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h2 className="text-xl font-semibold mb-2">No se pudo cargar la evaluación</h2>
            <p className="text-gray-500 mb-4">Hubo un problema al obtener los datos de la evaluación solicitada.</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setLocation('/admin/volunteers/evaluations')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a evaluaciones
              </Button>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation('/admin/volunteers/evaluations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a evaluaciones
          </Button>
          <h1 className="text-3xl font-bold">Evaluación de Desempeño</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información del voluntario */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Voluntario</CardTitle>
              <CardDescription>Información del voluntario evaluado</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteer ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {volunteer.profileImageUrl ? (
                      <img
                        src={volunteer.profileImageUrl}
                        alt={volunteer.fullName}
                        className="h-16 w-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-lg">{volunteer.fullName}</h3>
                      <p className="text-sm text-gray-500">ID: {volunteer.id}</p>
                      <Badge
                        className={
                          volunteer.status === 'active'
                            ? 'bg-green-500'
                            : volunteer.status === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-gray-500'
                        }
                      >
                        {volunteer.status === 'active'
                          ? 'Activo'
                          : volunteer.status === 'pending'
                          ? 'Pendiente'
                          : volunteer.status === 'inactive'
                          ? 'Inactivo'
                          : 'Suspendido'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p>{volunteer.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                      <p>{volunteer.phone || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Cargando información del voluntario...</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/admin/volunteers/${evaluation.volunteerId}`}>
                <Button variant="outline" className="w-full">
                  Ver perfil completo
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Detalles de participación */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Participación</CardTitle>
              <CardDescription>Actividad evaluada</CardDescription>
            </CardHeader>
            <CardContent>
              {participation ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{participation.activityName}</h3>
                    <p className="text-sm text-gray-500">ID Participación: {participation.id}</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Fecha:</span>
                      <p>{participation.activityDate ? formatDate(participation.activityDate) : 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Horas contribuidas:</span>
                      <p>{participation.hoursContributed} horas</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Notas:</span>
                      <p className="text-sm">{participation.notes || 'Sin notas adicionales'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Cargando detalles de la participación...</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/admin/volunteers/participations/${evaluation.participationId}`}>
                <Button variant="outline" className="w-full">
                  Ver detalles de participación
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Formulario de evaluación */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Fecha de Evaluación</CardTitle>
              <CardDescription>{formatDate(evaluation.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <p>ID Evaluación: {evaluation.id}</p>
                <p>Esta evaluación fue registrada para la actividad de voluntariado especificada.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de evaluación */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Formulario de Evaluación</CardTitle>
            <CardDescription>Califique el desempeño del voluntario</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Puntualidad */}
                  <FormField
                    control={form.control}
                    name="punctuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puntualidad</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <RatingSelect 
                              value={Number(field.value)} 
                              onChange={field.onChange} 
                            />
                            <Input 
                              type="hidden" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actitud */}
                  <FormField
                    control={form.control}
                    name="attitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actitud</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <RatingSelect 
                              value={Number(field.value)} 
                              onChange={field.onChange} 
                            />
                            <Input 
                              type="hidden" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Responsabilidad */}
                  <FormField
                    control={form.control}
                    name="responsibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsabilidad</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <RatingSelect 
                              value={Number(field.value)} 
                              onChange={field.onChange} 
                            />
                            <Input 
                              type="hidden" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Desempeño General */}
                  <FormField
                    control={form.control}
                    name="overallPerformance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desempeño General</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <RatingSelect 
                              value={Number(field.value)} 
                              onChange={field.onChange} 
                            />
                            <Input 
                              type="hidden" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Comentarios */}
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentarios adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escriba comentarios sobre el desempeño del voluntario..."
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Requiere seguimiento */}
                <FormField
                  control={form.control}
                  name="followUpRequired"
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
                          Requiere seguimiento
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          Marque esta opción si este voluntario requiere atención especial o seguimiento.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/volunteers/evaluations')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateEvaluation.isPending}
                  >
                    {updateEvaluation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EvaluationEdit;