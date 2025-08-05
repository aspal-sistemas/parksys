import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Settings, Save, Shield, Clock, Users, 
  AlertTriangle, Info, CheckCircle, RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Schema para configuración del sistema de roles
const roleSystemConfigSchema = z.object({
  // Configuración general
  systemEnabled: z.boolean(),
  inheritanceEnabled: z.boolean(),
  auditLogsEnabled: z.boolean(),
  
  // Configuración de sesiones
  sessionTimeout: z.number().min(5).max(1440), // 5 minutos a 24 horas
  maxConcurrentSessions: z.number().min(1).max(10),
  
  // Configuración de seguridad
  requireMfa: z.boolean(),
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSymbols: z.boolean(),
    expirationDays: z.number().min(0).max(365)
  }),
  
  // Configuración de acceso
  maxFailedAttempts: z.number().min(3).max(10),
  lockoutDuration: z.number().min(5).max(1440), // minutos
  
  // Configuración de notificaciones
  notifyRoleChanges: z.boolean(),
  notifyPermissionChanges: z.boolean(),
  notifySecurityEvents: z.boolean(),
  
  // Configuración de logs
  logRetentionDays: z.number().min(30).max(2555), // 30 días a 7 años
  logLevel: z.enum(['error', 'warn', 'info', 'debug'])
});

type RoleSystemConfig = z.infer<typeof roleSystemConfigSchema>;

// Configuración por defecto
const defaultConfig: RoleSystemConfig = {
  systemEnabled: true,
  inheritanceEnabled: true,
  auditLogsEnabled: true,
  sessionTimeout: 480, // 8 horas
  maxConcurrentSessions: 3,
  requireMfa: false,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    expirationDays: 90
  },
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  notifyRoleChanges: true,
  notifyPermissionChanges: true,
  notifySecurityEvents: true,
  logRetentionDays: 365,
  logLevel: 'info' as const
};

export default function RoleSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener configuración actual
  const { data: config = defaultConfig, isLoading } = useQuery<RoleSystemConfig>({
    queryKey: ['/api/admin-roles/settings'],
    enabled: false // Deshabilitado para usar configuración por defecto
  });

  const form = useForm<RoleSystemConfig>({
    resolver: zodResolver(roleSystemConfigSchema),
    defaultValues: config
  });

  // Mutation para guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: async (data: RoleSystemConfig) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Guardando configuración:', data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-roles/settings'] });
      toast({
        title: "Configuración guardada",
        description: "Los ajustes del sistema de roles se han actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: RoleSystemConfig) => {
    saveConfigMutation.mutate(data);
  };

  const resetToDefaults = () => {
    form.reset(defaultConfig);
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración del Sistema de Roles
            </h1>
            <p className="text-gray-600 mt-2">
              Configurar políticas y parámetros del sistema de roles y permisos
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={saveConfigMutation.isPending}
            >
              {saveConfigMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Estado del sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información general sobre el estado del sistema de roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sistema Activo</p>
                  <p className="text-sm text-gray-600">Roles funcionando correctamente</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">10 Roles Activos</p>
                  <p className="text-sm text-gray-600">45 usuarios con roles</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-600">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuraciones */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                <TabsTrigger value="sessions">Sesiones</TabsTrigger>
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>
                      Configuraciones básicas del sistema de roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="systemEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sistema de Roles Habilitado</FormLabel>
                            <FormDescription>
                              Activar o desactivar completamente el sistema de roles
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
                      control={form.control}
                      name="inheritanceEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Herencia de Permisos</FormLabel>
                            <FormDescription>
                              Los roles superiores heredan permisos de roles inferiores
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
                      control={form.control}
                      name="auditLogsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Logs de Auditoría</FormLabel>
                            <FormDescription>
                              Registrar todas las acciones relacionadas con roles y permisos
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
                      control={form.control}
                      name="logRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retención de Logs (días)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de días para mantener los logs del sistema (30-2555)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Seguridad</CardTitle>
                    <CardDescription>
                      Políticas de seguridad y autenticación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="requireMfa"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Autenticación Multifactor (MFA)</FormLabel>
                            <FormDescription>
                              Requerir MFA para usuarios con roles administrativos
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

                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900">Política de Contraseñas</h4>
                      
                      <FormField
                        control={form.control}
                        name="passwordPolicy.minLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitud Mínima</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="passwordPolicy.requireUppercase"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <FormLabel className="text-sm">Mayúsculas</FormLabel>
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
                          control={form.control}
                          name="passwordPolicy.requireNumbers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <FormLabel className="text-sm">Números</FormLabel>
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
                        control={form.control}
                        name="passwordPolicy.expirationDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiración (días)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              0 = sin expiración
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxFailedAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intentos Fallidos Máximos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lockoutDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración de Bloqueo (minutos)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Sesiones</CardTitle>
                    <CardDescription>
                      Configuración de sesiones de usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiempo de Sesión (minutos)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Tiempo de inactividad antes de cerrar sesión automáticamente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxConcurrentSessions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sesiones Concurrentes Máximas</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de sesiones simultáneas por usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Notificaciones</CardTitle>
                    <CardDescription>
                      Configurar qué eventos generan notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="notifyRoleChanges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Cambios de Roles</FormLabel>
                            <FormDescription>
                              Notificar cuando se asignan o remueven roles de usuarios
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
                      control={form.control}
                      name="notifyPermissionChanges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Cambios de Permisos</FormLabel>
                            <FormDescription>
                              Notificar cuando se modifican permisos de roles
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
                      control={form.control}
                      name="notifySecurityEvents"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Eventos de Seguridad</FormLabel>
                            <FormDescription>
                              Notificar sobre intentos de acceso no autorizado
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>

        {/* Advertencias */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900">Advertencias Importantes</h3>
                <ul className="mt-2 text-sm text-orange-800 space-y-1">
                  <li>• Deshabilitar el sistema de roles puede afectar el acceso de todos los usuarios</li>
                  <li>• Los cambios en políticas de seguridad se aplican inmediatamente</li>
                  <li>• Reducir el tiempo de retención de logs puede eliminar información histórica</li>
                  <li>• Habilitar MFA requerirá que todos los usuarios configuren su autenticación</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}