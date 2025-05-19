import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  Loader,
  Save,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Esquema de validación para configuración general
const generalSettingsSchema = z.object({
  siteName: z.string().min(2, { message: 'El nombre del sitio es requerido' }),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email({ message: 'Debe ser un email válido' }),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Debe ser un código hexadecimal válido',
  }),
  enableRegistration: z.boolean().default(true),
  defaultMunicipalityId: z.string().optional(),
});

// Esquema de validación para configuración de notificaciones
const notificationSettingsSchema = z.object({
  enableEmailNotifications: z.boolean().default(true),
  adminNotifyOnNewComment: z.boolean().default(true),
  adminNotifyOnNewIncident: z.boolean().default(true),
  userNotifyOnCommentReply: z.boolean().default(true),
  userNotifyOnIncidentStatusChange: z.boolean().default(true),
  emailFooter: z.string().optional(),
});

// Esquema de validación para configuración de API
const apiSettingsSchema = z.object({
  enablePublicApi: z.boolean().default(true),
  rateLimit: z.number().min(10).max(1000),
  rateLimitWindow: z.number().min(60).max(3600),
  requireApiKey: z.boolean().default(false),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Formulario para configuración general
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: 'ParquesMX',
      siteDescription: 'Plataforma de gestión de parques y espacios públicos',
      contactEmail: 'contacto@parquesmx.com',
      logoUrl: '/logo.svg',
      primaryColor: '#16a34a',
      enableRegistration: true,
      defaultMunicipalityId: '',
    },
  });

  // Formulario para configuración de notificaciones
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enableEmailNotifications: true,
      adminNotifyOnNewComment: true,
      adminNotifyOnNewIncident: true,
      userNotifyOnCommentReply: true,
      userNotifyOnIncidentStatusChange: true,
      emailFooter: 'ParquesMX - Plataforma de gestión de parques y espacios públicos',
    },
  });

  // Formulario para configuración de API
  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      enablePublicApi: true,
      rateLimit: 100,
      rateLimitWindow: 60,
      requireApiKey: false,
    },
  });

  // Cargar configuraciones
  const { 
    data: municipalities = [], 
    isLoading: isLoadingMunicipalities 
  } = useQuery({
    queryKey: ['/api/municipalities'],
  });

  // Mutación para guardar configuración general
  const saveGeneralSettings = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      console.log('Guardando configuración general:', data);
      // En producción, haríamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Configuración guardada',
        description: 'La configuración general ha sido actualizada correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtelo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error guardando configuración:', error);
    },
  });

  // Mutación para guardar configuración de notificaciones
  const saveNotificationSettings = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      console.log('Guardando configuración de notificaciones:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de notificaciones ha sido actualizada correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtelo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error guardando configuración:', error);
    },
  });

  // Mutación para guardar configuración de API
  const saveApiSettings = useMutation({
    mutationFn: async (data: ApiSettingsValues) => {
      console.log('Guardando configuración de API:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de API ha sido actualizada correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtelo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error guardando configuración:', error);
    },
  });

  // Manejadores de envío de formularios
  const onGeneralSubmit = (data: GeneralSettingsValues) => {
    saveGeneralSettings.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationSettingsValues) => {
    saveNotificationSettings.mutate(data);
  };

  const onApiSubmit = (data: ApiSettingsValues) => {
    saveApiSettings.mutate(data);
  };

  return (
    <AdminLayout title="Configuración del sistema">
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura los ajustes básicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  id="general-settings-form"
                  onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del sitio</FormLabel>
                        <FormControl>
                          <Input placeholder="ParquesMX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este nombre se mostrará en el sitio web y en los correos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del sitio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Breve descripción del sitio..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de contacto</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contacto@parquesmx.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color primario</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                type="text"
                                {...field}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del logo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/logo.svg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL relativa o absoluta al logo del sitio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="defaultMunicipalityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio por defecto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar municipio por defecto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {municipalities.map((municipality: any) => (
                              <SelectItem
                                key={municipality.id}
                                value={municipality.id.toString()}
                              >
                                {municipality.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Municipio que se seleccionará por defecto para nuevos usuarios
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="enableRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Habilitar registro de usuarios
                          </FormLabel>
                          <FormDescription>
                            Permitir que los usuarios puedan registrarse en la plataforma
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
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => generalForm.reset()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button
                type="submit"
                form="general-settings-form"
                disabled={saveGeneralSettings.isPending}
              >
                {saveGeneralSettings.isPending && (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                )}
                {!saveGeneralSettings.isPending && (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Personaliza cómo y cuándo se envían notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  id="notification-settings-form"
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={notificationForm.control}
                    name="enableEmailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Habilitar notificaciones por correo
                          </FormLabel>
                          <FormDescription>
                            Activar el envío de notificaciones por correo electrónico
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

                  <div className="pl-4 space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="adminNotifyOnNewComment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notificar nuevos comentarios
                            </FormLabel>
                            <FormDescription>
                              Notificar a administradores cuando se publique un nuevo comentario
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!notificationForm.watch('enableEmailNotifications')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="adminNotifyOnNewIncident"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notificar nuevas incidencias
                            </FormLabel>
                            <FormDescription>
                              Notificar a administradores cuando se reporte una nueva incidencia
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!notificationForm.watch('enableEmailNotifications')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="userNotifyOnCommentReply"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notificar respuestas a comentarios
                            </FormLabel>
                            <FormDescription>
                              Notificar a usuarios cuando alguien responde a su comentario
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!notificationForm.watch('enableEmailNotifications')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="userNotifyOnIncidentStatusChange"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notificar cambios en incidencias
                            </FormLabel>
                            <FormDescription>
                              Notificar a usuarios cuando cambia el estado de una incidencia que reportaron
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!notificationForm.watch('enableEmailNotifications')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="emailFooter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pie de correo electrónico</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Texto a incluir en el pie de todos los correos..."
                              {...field}
                              disabled={!notificationForm.watch('enableEmailNotifications')}
                            />
                          </FormControl>
                          <FormDescription>
                            Texto que aparecerá al final de todos los correos electrónicos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => notificationForm.reset()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button
                type="submit"
                form="notification-settings-form"
                disabled={saveNotificationSettings.isPending}
              >
                {saveNotificationSettings.isPending && (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                )}
                {!saveNotificationSettings.isPending && (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de API */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de API</CardTitle>
              <CardDescription>
                Configura los ajustes de la API pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form
                  id="api-settings-form"
                  onSubmit={apiForm.handleSubmit(onApiSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={apiForm.control}
                    name="enablePublicApi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Habilitar API pública
                          </FormLabel>
                          <FormDescription>
                            Permitir acceso a la API pública de datos
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

                  <div className="pl-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={apiForm.control}
                        name="rateLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Límite de peticiones</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={!apiForm.watch('enablePublicApi')}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Número máximo de peticiones permitidas por ventana de tiempo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiForm.control}
                        name="rateLimitWindow"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ventana de tiempo (segundos)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={!apiForm.watch('enablePublicApi')}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Periodo de tiempo en segundos para el límite de peticiones
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={apiForm.control}
                      name="requireApiKey"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Requerir clave API
                            </FormLabel>
                            <FormDescription>
                              Requerir una clave API para acceder a la API pública
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!apiForm.watch('enablePublicApi')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => apiForm.reset()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button
                type="submit"
                form="api-settings-form"
                disabled={saveApiSettings.isPending}
              >
                {saveApiSettings.isPending && (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                )}
                {!saveApiSettings.isPending && (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;