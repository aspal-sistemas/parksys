import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Spinner from '@/components/Spinner';

// Esquema de validación para el formulario de evaluación ciudadana
const evaluationSchema = z.object({
  comunicacion: z
    .number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  conocimiento: z
    .number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  metodologia: z
    .number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  calificacionGeneral: z
    .number()
    .min(1, 'La calificación debe ser al menos 1')
    .max(5, 'La calificación no puede ser mayor a 5'),
  comentarios: z
    .string()
    .min(10, 'Por favor, proporciona comentarios de al menos 10 caracteres')
    .max(500, 'Los comentarios no pueden exceder los 500 caracteres'),
});

// Componente para la calificación con estrellas
function RatingStars({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange(star)}
          className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readOnly}
        >
          <Star
            className={`h-6 w-6 ${
              star <= value 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function EvaluarInstructorPage() {
  const [, params] = useRoute('/instructores/:instructorId/evaluar/:activityId');
  const { instructorId, activityId } = params || { instructorId: null, activityId: null };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Consultar detalles del instructor
  const { 
    data: instructor, 
    isLoading: isLoadingInstructor,
    error: instructorError 
  } = useQuery({
    queryKey: [`/api/instructors/${instructorId}`],
    enabled: !!instructorId && !isNaN(Number(instructorId)),
  });

  // Consultar detalles de la actividad
  const { 
    data: activity,
    isLoading: isLoadingActivity,
    error: activityError
  } = useQuery({
    queryKey: [`/api/activities/${activityId}`],
    enabled: !!activityId && !isNaN(Number(activityId)),
  });

  // Configurar formulario con valores predeterminados
  const form = useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      comunicacion: 3,
      conocimiento: 3,
      metodologia: 3,
      calificacionGeneral: 3,
      comentarios: '',
    },
  });

  // Mutación para enviar la evaluación
  const submitEvaluationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/instructors/${instructorId}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: Number(instructorId),
          assignmentId: Number(activityId),
          evaluatorType: 'participant',
          communication: data.comunicacion,
          knowledge: data.conocimiento,
          methodology: data.metodologia,
          overallPerformance: data.calificacionGeneral,
          comments: data.comentarios,
          followUpRequired: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la evaluación');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Evaluación enviada",
        description: "¡Gracias por tu evaluación! Tu opinión es muy importante.",
      });
      setSubmissionSuccess(true);
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar evaluación",
        description: error.message || "Ocurrió un error inesperado, por favor intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data) => {
    submitEvaluationMutation.mutate(data);
  };

  // Si no tenemos IDs válidos, mostramos error
  if ((!instructorId || !activityId) && !isLoadingInstructor && !isLoadingActivity) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Información incompleta</AlertTitle>
            <AlertDescription>
              No se pudo encontrar la información necesaria para realizar la evaluación.
              Por favor, asegúrate de acceder desde el enlace correcto.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation('/')}>Volver al inicio</Button>
        </div>
      </PublicLayout>
    );
  }

  // Mostrar spinner mientras cargamos datos
  if (isLoadingInstructor || isLoadingActivity) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 flex justify-center">
          <Spinner size="xl" />
        </div>
      </PublicLayout>
    );
  }

  // Si hay un error al cargar los datos
  if (instructorError || activityError || !instructor || !activity) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error al cargar datos</AlertTitle>
            <AlertDescription>
              No pudimos cargar la información del instructor o la actividad.
              Por favor, intenta nuevamente más tarde.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation('/')}>Volver al inicio</Button>
        </div>
      </PublicLayout>
    );
  }

  // Si ya se envió la evaluación con éxito
  if (submissionSuccess) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-green-600">¡Evaluación enviada con éxito!</CardTitle>
              <CardDescription>
                Gracias por tomarte el tiempo para evaluar a nuestro instructor.
                Tu retroalimentación nos ayuda a mejorar constantemente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="bg-green-50 rounded-full p-6">
                  <svg
                    className="h-12 w-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <Button onClick={() => setLocation('/')}>Volver al inicio</Button>
                <Button variant="outline" onClick={() => setLocation(`/actividades/${activityId}`)}>
                  Ver detalles de la actividad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // Obtener nombres para mostrar
  const instructorName = instructor.fullName || instructor.full_name || 'Instructor';
  const activityTitle = activity.title || activity.nombre || 'Actividad';
  
  // Render del formulario de evaluación
  return (
    <PublicLayout>
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Evaluar a {instructorName}</CardTitle>
            <CardDescription>
              Tu evaluación de la actividad <strong>{activityTitle}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage
                  src={instructor.profileImageUrl || instructor.profile_image_url}
                  alt={instructorName}
                />
                <AvatarFallback>{instructorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{instructorName}</h3>
                <p className="text-sm text-gray-500">
                  {instructor.specialties || instructor.especialidades || 'Instructor'}
                </p>
                {activity.startDate && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {format(new Date(activity.startDate), 'dd MMM yyyy', { locale: es })}
                      </Badge>
                      {activity.category && (
                        <Badge variant="secondary">{activity.category}</Badge>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="conocimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conocimiento del tema</FormLabel>
                      <FormControl>
                        <RatingStars
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Evalúa qué tan bien conoce el instructor el tema que enseña
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comunicacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comunicación y claridad</FormLabel>
                      <FormControl>
                        <RatingStars
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Evalúa la capacidad del instructor para comunicarse claramente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodologia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodología de enseñanza</FormLabel>
                      <FormControl>
                        <RatingStars
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Evalúa los métodos utilizados para enseñar y facilitar el aprendizaje
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calificacionGeneral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calificación general</FormLabel>
                      <FormControl>
                        <RatingStars
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Tu evaluación general de la experiencia con este instructor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comentarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentarios adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Comparte tu experiencia con este instructor..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Proporciona comentarios específicos sobre tu experiencia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.history.back()}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitEvaluationMutation.isPending}
                  >
                    {submitEvaluationMutation.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar evaluación'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}