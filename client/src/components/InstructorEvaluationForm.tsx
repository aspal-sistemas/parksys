import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Star, StarHalf, Calendar, User, CircleCheck, CircleDashed } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Esquema de validación para el formulario
const evaluationFormSchema = z.object({
  instructorId: z.number(),
  assignmentId: z.number(),
  evaluatorType: z.string(),
  
  // Criterios de evaluación (1-5)
  professionalism: z.number().min(1).max(5),
  teachingClarity: z.number().min(1).max(5),
  activeParticipation: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  groupManagement: z.number().min(1).max(5),
  
  // Compatibilidad con el esquema anterior
  knowledge: z.number().min(1).max(5),
  methodology: z.number().min(1).max(5),
  
  // Promedio general (calculado automáticamente)
  overallPerformance: z.number().min(1).max(5),
  
  // Campos opcionales
  comments: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(),
});

type EvaluationFormValues = z.infer<typeof evaluationFormSchema>;

interface InstructorEvaluationFormProps {
  instructorId: number;
  assignmentId: number;
  evaluationType?: 'participant' | 'supervisor' | 'self';
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function InstructorEvaluationForm({
  instructorId,
  assignmentId,
  evaluationType = 'supervisor',
  onClose,
  onSuccess
}: InstructorEvaluationFormProps) {
  const queryClient = useQueryClient();

  // Obtener detalles del instructor
  const { data: instructor, isLoading: isLoadingInstructor } = useQuery({
    queryKey: [`/api/instructors/${instructorId}`],
    enabled: !!instructorId,
  });

  // Obtener detalles de la asignación
  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: [`/api/instructors/assignments/${assignmentId}`],
    enabled: !!assignmentId,
  });

  // Configurar el formulario con valores predeterminados
  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      instructorId: instructorId,
      assignmentId: assignmentId,
      evaluatorType: evaluationType,
      professionalism: 3,
      teachingClarity: 3,
      activeParticipation: 3,
      communication: 3,
      groupManagement: 3,
      knowledge: 3,
      methodology: 3,
      overallPerformance: 3,
      followUpRequired: false,
    },
  });

  // Calcular el promedio general cuando cambian las calificaciones
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (['professionalism', 'teachingClarity', 'activeParticipation', 'communication', 'groupManagement'].includes(name || '')) {
        const values = form.getValues();
        const sum = values.professionalism + values.teachingClarity + values.activeParticipation + 
                    values.communication + values.groupManagement;
        const average = Math.round(sum / 5);
        form.setValue('overallPerformance', average);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Mutación para enviar la evaluación
  const createEvaluation = useMutation({
    mutationFn: (data: EvaluationFormValues) => 
      apiRequest(`/api/instructors/${instructorId}/evaluations`, {
        method: 'POST',
        data
      }),
    onSuccess: () => {
      toast({
        title: "Evaluación registrada",
        description: "La evaluación ha sido registrada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}/evaluations`] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error al registrar la evaluación:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la evaluación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Función para enviar el formulario
  const onSubmit = (data: EvaluationFormValues) => {
    createEvaluation.mutate(data);
  };

  // Renderizar estrellas para las calificaciones
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-5 w-5" />);
      } else if (i - 0.5 === rating) {
        stars.push(<StarHalf key={i} className="fill-yellow-400 text-yellow-400 h-5 w-5" />);
      } else {
        stars.push(<Star key={i} className="text-gray-300 h-5 w-5" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  // Nombre del evaluador basado en el tipo
  const getEvaluatorTypeName = (type: string) => {
    switch (type) {
      case 'participant':
        return 'Participante';
      case 'supervisor':
        return 'Supervisor';
      case 'self':
        return 'Autoevaluación';
      default:
        return 'Evaluador';
    }
  };

  // Mostrar cargando mientras se obtienen los datos
  if (isLoadingInstructor || isLoadingAssignment) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Evaluación de Instructor</CardTitle>
          <CardDescription>Cargando información...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <CircleDashed className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const instructorName = instructor?.fullName || instructor?.full_name || 'Instructor';
  const activityTitle = assignment?.activityTitle || assignment?.activity_title || 'Actividad';

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Evaluación de Instructor</CardTitle>
        <CardDescription>
          Evalúa el desempeño del instructor en la actividad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información de contexto */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={instructor?.profileImageUrl || instructor?.profile_image_url} alt={instructorName} />
                  <AvatarFallback>{instructorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{instructorName}</h3>
                  <p className="text-sm text-gray-500">
                    {instructor?.specialties || instructor?.especialidades || 'Instructor'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {assignment?.startDate || assignment?.start_date
                      ? format(new Date(assignment.startDate || assignment.start_date), 'PPP', { locale: es })
                      : 'Fecha no disponible'}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{getEvaluatorTypeName(evaluationType)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Criterios de Evaluación</h3>
              <div className="space-y-6">
                {/* Profesionalismo */}
                <FormField
                  control={form.control}
                  name="professionalism"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Profesionalismo</FormLabel>
                        <div className="flex">{renderRatingStars(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Puntualidad, presentación, respeto, responsabilidad
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Claridad didáctica */}
                <FormField
                  control={form.control}
                  name="teachingClarity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Claridad didáctica</FormLabel>
                        <div className="flex">{renderRatingStars(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Capacidad para explicar conceptos, guiar al grupo, resolver dudas
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Participación activa */}
                <FormField
                  control={form.control}
                  name="activeParticipation"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Participación activa</FormLabel>
                        <div className="flex">{renderRatingStars(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Motiva e involucra a los asistentes en la dinámica
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Comunicación */}
                <FormField
                  control={form.control}
                  name="communication"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Comunicación</FormLabel>
                        <div className="flex">{renderRatingStars(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Lenguaje claro, escucha activa, trato amable
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Manejo de grupo */}
                <FormField
                  control={form.control}
                  name="groupManagement"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Manejo de grupo</FormLabel>
                        <div className="flex">{renderRatingStars(field.value)}</div>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Orden, respeto, control del grupo
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Evaluación general */}
            <div>
              <h3 className="text-lg font-medium mb-4">Evaluación General</h3>
              
              <FormField
                control={form.control}
                name="overallPerformance"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel>Calificación general</FormLabel>
                      <div className="flex">{renderRatingStars(field.value)}</div>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Calificación promedio automática basada en los criterios anteriores
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Comentarios */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Comentarios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe tus comentarios, observaciones o sugerencias para el instructor..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Incluye aspectos positivos y áreas de mejora
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Seguimiento requerido */}
              <FormField
                control={form.control}
                name="followUpRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6 mb-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requiere seguimiento</FormLabel>
                      <FormDescription>
                        Activa esta opción si se requiere seguimiento o acciones adicionales
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("followUpRequired") && (
                <FormField
                  control={form.control}
                  name="followUpNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas de seguimiento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Indica las acciones o seguimiento necesario..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={createEvaluation.isPending}
        >
          {createEvaluation.isPending ? (
            <>
              <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CircleCheck className="mr-2 h-4 w-4" />
              Guardar evaluación
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}