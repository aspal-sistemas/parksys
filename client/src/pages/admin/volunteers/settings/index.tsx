import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Award, 
  ClipboardCheck, 
  BarChart,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Esquemas de validación para cada pestaña de configuración
const notificationsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  participationReminders: z.boolean().default(true),
  evaluationReminders: z.boolean().default(true),
  recognitionNotifications: z.boolean().default(true),
  reminderFrequency: z.enum(['diario', 'semanal', 'mensual']).default('semanal'),
});

const evaluationsSchema = z.object({
  autoEvaluations: z.boolean().default(false),
  evaluationPeriod: z.enum(['semanal', 'quincenal', 'mensual']).default('mensual'),
  minParticipationsForEvaluation: z.number().min(1).max(10).default(3),
  evaluationCriteria: z.array(z.string()).default([
    'Puntualidad', 
    'Compromiso', 
    'Habilidades de comunicación', 
    'Trabajo en equipo', 
    'Resolución de problemas'
  ]),
});

const recognitionsSchema = z.object({
  autoRecognitions: z.boolean().default(false),
  recognitionThreshold: z.number().min(1).max(20).default(5),
  recognitionTypes: z.array(z.string()).default([
    'Certificado de Mérito',
    'Voluntario del Mes',
    'Reconocimiento Especial'
  ]),
});

const reportsSchema = z.object({
  autoGenerateReports: z.boolean().default(false),
  reportFrequency: z.enum(['semanal', 'quincenal', 'mensual']).default('mensual'),
  includeStatistics: z.boolean().default(true),
  includeCharts: z.boolean().default(true),
  recipientEmails: z.string().optional(),
});

// Tipo combinado para todas las configuraciones
type VolunteerSettings = 
  z.infer<typeof notificationsSchema> & 
  z.infer<typeof evaluationsSchema> & 
  z.infer<typeof recognitionsSchema> & 
  z.infer<typeof reportsSchema>;

export default function VolunteerSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('notificaciones');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener configuraciones existentes
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/volunteers/settings'],
    onError: () => {
      // Si hay error al cargar las configuraciones, usamos los valores por defecto
      console.log('Error al cargar configuraciones, usando valores por defecto');
    },
  });

  // Configuración por defecto
  const defaultSettings: VolunteerSettings = {
    // Notificaciones
    emailNotifications: true,
    participationReminders: true,
    evaluationReminders: true,
    recognitionNotifications: true,
    reminderFrequency: 'semanal',
    
    // Evaluaciones
    autoEvaluations: false,
    evaluationPeriod: 'mensual',
    minParticipationsForEvaluation: 3,
    evaluationCriteria: [
      'Puntualidad', 
      'Compromiso', 
      'Habilidades de comunicación', 
      'Trabajo en equipo', 
      'Resolución de problemas'
    ],
    
    // Reconocimientos
    autoRecognitions: false,
    recognitionThreshold: 5,
    recognitionTypes: [
      'Certificado de Mérito',
      'Voluntario del Mes',
      'Reconocimiento Especial'
    ],
    
    // Reportes
    autoGenerateReports: false,
    reportFrequency: 'mensual',
    includeStatistics: true,
    includeCharts: true,
    recipientEmails: '',
  };

  // Combinamos las configuraciones cargadas con las predeterminadas
  const mergedSettings = { ...defaultSettings, ...(settings || {}) };

  // Formularios para cada pestaña
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: mergedSettings.emailNotifications,
      participationReminders: mergedSettings.participationReminders,
      evaluationReminders: mergedSettings.evaluationReminders,
      recognitionNotifications: mergedSettings.recognitionNotifications,
      reminderFrequency: mergedSettings.reminderFrequency,
    },
  });

  const evaluationsForm = useForm<z.infer<typeof evaluationsSchema>>({
    resolver: zodResolver(evaluationsSchema),
    defaultValues: {
      autoEvaluations: mergedSettings.autoEvaluations,
      evaluationPeriod: mergedSettings.evaluationPeriod,
      minParticipationsForEvaluation: mergedSettings.minParticipationsForEvaluation,
      evaluationCriteria: mergedSettings.evaluationCriteria,
    },
  });

  const recognitionsForm = useForm<z.infer<typeof recognitionsSchema>>({
    resolver: zodResolver(recognitionsSchema),
    defaultValues: {
      autoRecognitions: mergedSettings.autoRecognitions,
      recognitionThreshold: mergedSettings.recognitionThreshold,
      recognitionTypes: mergedSettings.recognitionTypes,
    },
  });

  const reportsForm = useForm<z.infer<typeof reportsSchema>>({
    resolver: zodResolver(reportsSchema),
    defaultValues: {
      autoGenerateReports: mergedSettings.autoGenerateReports,
      reportFrequency: mergedSettings.reportFrequency,
      includeStatistics: mergedSettings.includeStatistics,
      includeCharts: mergedSettings.includeCharts,
      recipientEmails: mergedSettings.recipientEmails,
    },
  });

  // Mutación para guardar configuraciones
  const saveSettings = useMutation({
    mutationFn: async (data: Partial<VolunteerSettings>) => {
      setIsSubmitting(true);
      try {
        console.log('Guardando configuraciones:', data);
        // En un futuro implementación:
        /*
        const response = await fetch('/api/volunteers/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Error al guardar configuraciones');
        }
        
        return await response.json();
        */
        
        // Por ahora, simulamos una respuesta exitosa
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, message: 'Configuraciones guardadas correctamente' });
          }, 1000);
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Configuraciones guardadas',
        description: 'Las configuraciones han sido guardadas correctamente.',
        variant: 'default',
      });
      // Actualizamos la caché
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar las configuraciones.',
        variant: 'destructive',
      });
    },
  });

  // Handlers para guardar las configuraciones de cada pestaña
  const onSaveNotifications = (data: z.infer<typeof notificationsSchema>) => {
    saveSettings.mutate(data);
  };

  const onSaveEvaluations = (data: z.infer<typeof evaluationsSchema>) => {
    saveSettings.mutate(data);
  };

  const onSaveRecognitions = (data: z.infer<typeof recognitionsSchema>) => {
    saveSettings.mutate(data);
  };

  const onSaveReports = (data: z.infer<typeof reportsSchema>) => {
    saveSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configuración del Voluntariado" subtitle="Cargando configuraciones...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuración del Voluntariado" subtitle="Administra las preferencias del módulo de voluntariado">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="notificaciones" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="evaluaciones" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="reconocimientos" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Reconocimientos</span>
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Notificaciones */}
          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura las notificaciones automáticas para los voluntarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onSaveNotifications)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificaciones por Email</FormLabel>
                              <FormDescription>
                                Enviar notificaciones por correo electrónico a los voluntarios
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

                      <FormField
                        control={notificationsForm.control}
                        name="participationReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Recordatorios de Participación</FormLabel>
                              <FormDescription>
                                Enviar recordatorios sobre actividades programadas
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

                      <FormField
                        control={notificationsForm.control}
                        name="evaluationReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Recordatorios de Evaluación</FormLabel>
                              <FormDescription>
                                Enviar recordatorios sobre evaluaciones pendientes
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

                      <FormField
                        control={notificationsForm.control}
                        name="recognitionNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificaciones de Reconocimientos</FormLabel>
                              <FormDescription>
                                Enviar notificaciones sobre nuevos reconocimientos
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
                    </div>

                    <Separator className="my-6" />

                    <FormField
                      control={notificationsForm.control}
                      name="reminderFrequency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Frecuencia de Recordatorios</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="diario" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Diario
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="semanal" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Semanal
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="mensual" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Mensual
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <CardFooter className="flex justify-end px-0">
                      <Button 
                        type="submit" 
                        className="ml-auto" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Configuración'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Evaluaciones */}
          <TabsContent value="evaluaciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Configuración de Evaluaciones
                </CardTitle>
                <CardDescription>
                  Configura cómo se realizan las evaluaciones a los voluntarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...evaluationsForm}>
                  <form onSubmit={evaluationsForm.handleSubmit(onSaveEvaluations)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={evaluationsForm.control}
                        name="autoEvaluations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Evaluaciones Automáticas</FormLabel>
                              <FormDescription>
                                Programar evaluaciones automáticamente basadas en participaciones
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

                      <FormField
                        control={evaluationsForm.control}
                        name="minParticipationsForEvaluation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mínimo de Participaciones para Evaluación</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                              />
                            </FormControl>
                            <FormDescription>
                              Número mínimo de participaciones requeridas para una evaluación
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-6" />

                    <FormField
                      control={evaluationsForm.control}
                      name="evaluationPeriod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Periodicidad de Evaluaciones</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="semanal" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Semanal
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="quincenal" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Quincenal
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="mensual" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Mensual
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-6">
                      <Label htmlFor="evaluationCriteria">Criterios de Evaluación</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Los criterios actuales son: {evaluationsForm.watch('evaluationCriteria').join(', ')}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Esta funcionalidad sería implementada en una versión futura
                          toast({
                            title: 'Funcionalidad en desarrollo',
                            description: 'La edición de criterios estará disponible en una próxima actualización.',
                            variant: 'default',
                          });
                        }}
                      >
                        Administrar Criterios
                      </Button>
                    </div>

                    <CardFooter className="flex justify-end px-0">
                      <Button 
                        type="submit" 
                        className="ml-auto" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Configuración'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Reconocimientos */}
          <TabsContent value="reconocimientos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Configuración de Reconocimientos
                </CardTitle>
                <CardDescription>
                  Configura cómo se otorgan los reconocimientos a los voluntarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...recognitionsForm}>
                  <form onSubmit={recognitionsForm.handleSubmit(onSaveRecognitions)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={recognitionsForm.control}
                        name="autoRecognitions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Reconocimientos Automáticos</FormLabel>
                              <FormDescription>
                                Generar reconocimientos automáticamente basados en participaciones
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

                      <FormField
                        control={recognitionsForm.control}
                        name="recognitionThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Umbral para Reconocimientos</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={20}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                              />
                            </FormControl>
                            <FormDescription>
                              Número de participaciones necesarias para otorgar un reconocimiento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="recognitionTypes">Tipos de Reconocimientos</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Los tipos actuales son: {recognitionsForm.watch('recognitionTypes').join(', ')}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Esta funcionalidad sería implementada en una versión futura
                          toast({
                            title: 'Funcionalidad en desarrollo',
                            description: 'La edición de tipos de reconocimientos estará disponible en una próxima actualización.',
                            variant: 'default',
                          });
                        }}
                      >
                        Administrar Tipos de Reconocimientos
                      </Button>
                    </div>

                    <CardFooter className="flex justify-end px-0">
                      <Button 
                        type="submit" 
                        className="ml-auto" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Configuración'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Reportes */}
          <TabsContent value="reportes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Configuración de Reportes
                </CardTitle>
                <CardDescription>
                  Configura la generación automática de reportes y estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...reportsForm}>
                  <form onSubmit={reportsForm.handleSubmit(onSaveReports)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={reportsForm.control}
                        name="autoGenerateReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Generar Reportes Automáticamente</FormLabel>
                              <FormDescription>
                                Crear y enviar reportes de forma automática
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

                      <FormField
                        control={reportsForm.control}
                        name="reportFrequency"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Frecuencia de Reportes</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="semanal" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Semanal
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="quincenal" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Quincenal
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="mensual" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Mensual
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={reportsForm.control}
                        name="includeStatistics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Incluir Estadísticas</FormLabel>
                              <FormDescription>
                                Incluir métricas y estadísticas detalladas en los reportes
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

                      <FormField
                        control={reportsForm.control}
                        name="includeCharts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Incluir Gráficos</FormLabel>
                              <FormDescription>
                                Incluir visualizaciones gráficas en los reportes
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
                    </div>

                    <FormField
                      control={reportsForm.control}
                      name="recipientEmails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correos Electrónicos de Destinatarios</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ejemplo@correo.com, otro@correo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Lista de correos separados por comas para recibir los reportes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <CardFooter className="flex justify-end px-0">
                      <Button 
                        type="submit" 
                        className="ml-auto" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Configuración'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}