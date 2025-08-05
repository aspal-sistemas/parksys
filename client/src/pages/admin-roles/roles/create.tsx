import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Shield, ArrowLeft, Save, Copy, Crown, Star, 
  Gem, Zap, Award, Eye, Settings, Users
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Schema de validación para crear rol
const createRoleSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-z0-9-_]+$/, 'Solo se permiten letras minúsculas, números, guiones y guiones bajos'),
  displayName: z.string()
    .min(3, 'El nombre para mostrar debe tener al menos 3 caracteres')
    .max(100, 'El nombre para mostrar no puede exceder 100 caracteres'),
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  level: z.number()
    .min(1, 'El nivel debe ser al menos 1')
    .max(10, 'El nivel no puede exceder 10'),
  badgeColor: z.string(),
  badgeIcon: z.string(),
  isActive: z.boolean().default(true),
  copyFromRole: z.string().optional(),
  templateType: z.string().optional()
});

type CreateRoleForm = z.infer<typeof createRoleSchema>;

// Opciones de colores para badges
const badgeColors = [
  { value: 'bg-red-500', label: 'Rojo', color: 'bg-red-500' },
  { value: 'bg-blue-500', label: 'Azul', color: 'bg-blue-500' },
  { value: 'bg-green-500', label: 'Verde', color: 'bg-green-500' },
  { value: 'bg-purple-500', label: 'Morado', color: 'bg-purple-500' },
  { value: 'bg-orange-500', label: 'Naranja', color: 'bg-orange-500' },
  { value: 'bg-yellow-500', label: 'Amarillo', color: 'bg-yellow-500' },
  { value: 'bg-teal-500', label: 'Verde Azulado', color: 'bg-teal-500' },
  { value: 'bg-indigo-500', label: 'Índigo', color: 'bg-indigo-500' },
  { value: 'bg-gray-500', label: 'Gris', color: 'bg-gray-500' }
];

// Opciones de iconos
const badgeIcons = [
  { value: 'crown', label: 'Corona', icon: <Crown className="w-4 h-4" /> },
  { value: 'star', label: 'Estrella', icon: <Star className="w-4 h-4" /> },
  { value: 'gem', label: 'Gema', icon: <Gem className="w-4 h-4" /> },
  { value: 'zap', label: 'Rayo', icon: <Zap className="w-4 h-4" /> },
  { value: 'award', label: 'Premio', icon: <Award className="w-4 h-4" /> },
  { value: 'shield', label: 'Escudo', icon: <Shield className="w-4 h-4" /> },
  { value: 'eye', label: 'Ojo', icon: <Eye className="w-4 h-4" /> },
  { value: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  { value: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4" /> }
];

// Plantillas predefinidas
const roleTemplates = [
  {
    value: 'coordinator',
    label: 'Coordinador',
    description: 'Gestión y coordinación de áreas específicas',
    defaultLevel: 7,
    defaultColor: 'bg-blue-500',
    defaultIcon: 'gem'
  },
  {
    value: 'operator',
    label: 'Operador',
    description: 'Personal operativo y de campo',
    defaultLevel: 4,
    defaultColor: 'bg-orange-500',
    defaultIcon: 'award'
  },
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Administración de módulos específicos',
    defaultLevel: 6,
    defaultColor: 'bg-purple-500',
    defaultIcon: 'settings'
  },
  {
    value: 'readonly',
    label: 'Solo Lectura',
    description: 'Acceso de consulta únicamente',
    defaultLevel: 2,
    defaultColor: 'bg-gray-500',
    defaultIcon: 'eye'
  }
];

export default function CreateRole() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      level: 5,
      badgeColor: 'bg-blue-500',
      badgeIcon: 'shield',
      isActive: true
    }
  });

  // Mutation para crear rol
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleForm) => {
      // Simulación de creación
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Creando rol:', data);
      return { success: true, id: `role-${Date.now()}` };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-roles/roles'] });
      toast({
        title: "Rol creado exitosamente",
        description: "El nuevo rol se ha creado y está disponible para asignación.",
      });
      setLocation('/admin-roles/roles');
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear rol",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CreateRoleForm) => {
    createRoleMutation.mutate(data);
  };

  // Aplicar plantilla
  const applyTemplate = (templateValue: string) => {
    const template = roleTemplates.find(t => t.value === templateValue);
    if (template) {
      form.setValue('level', template.defaultLevel);
      form.setValue('badgeColor', template.defaultColor);
      form.setValue('badgeIcon', template.defaultIcon);
      form.setValue('description', template.description);
    }
  };

  // Vista previa del badge
  const previewBadge = () => {
    const color = form.watch('badgeColor');
    const iconValue = form.watch('badgeIcon');
    const icon = badgeIcons.find(i => i.value === iconValue)?.icon;
    const displayName = form.watch('displayName') || 'Nuevo Rol';

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${color} text-white`}>
        {icon}
        <span className="text-sm font-medium">{displayName}</span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-roles/roles">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Nuevo Rol
              </h1>
              <p className="text-gray-600 mt-2">
                Define un nuevo rol con permisos específicos para el sistema
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Información del Rol
                </CardTitle>
                <CardDescription>
                  Configura los datos básicos del nuevo rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Plantillas */}
                    <FormField
                      control={form.control}
                      name="templateType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plantilla Base (Opcional)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              applyTemplate(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar plantilla..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleTemplates.map((template) => (
                                <SelectItem key={template.value} value={template.value}>
                                  <div>
                                    <p className="font-medium">{template.label}</p>
                                    <p className="text-sm text-gray-500">{template.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Usa una plantilla para configurar valores por defecto
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Nombre del sistema */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Sistema *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="coordinador-marketing" 
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Identificador único del rol (solo letras minúsculas, números y guiones)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nombre para mostrar */}
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre para Mostrar *</FormLabel>
                          <FormControl>
                            <Input placeholder="Coordinador de Marketing" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nombre que se mostrará en la interfaz de usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Descripción */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descripción detallada de las responsabilidades y alcance del rol..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explica las responsabilidades y funciones de este rol
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nivel de autoridad */}
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Autoridad *</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                  Nivel {level} {level === 10 ? '(Máximo)' : level === 1 ? '(Mínimo)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define la jerarquía del rol (1 = menor autoridad, 10 = mayor autoridad)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Color del badge */}
                    <FormField
                      control={form.control}
                      name="badgeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color del Badge</FormLabel>
                          <div className="grid grid-cols-3 gap-3">
                            {badgeColors.map((color) => (
                              <div
                                key={color.value}
                                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                                  field.value === color.value 
                                    ? 'border-gray-900 ring-2 ring-gray-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(color.value)}
                              >
                                <div className={`w-full h-8 rounded ${color.color} mb-2`}></div>
                                <p className="text-sm text-center font-medium">{color.label}</p>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Icono del badge */}
                    <FormField
                      control={form.control}
                      name="badgeIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icono del Badge</FormLabel>
                          <div className="grid grid-cols-3 gap-3">
                            {badgeIcons.map((icon) => (
                              <div
                                key={icon.value}
                                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                                  field.value === icon.value 
                                    ? 'border-gray-900 ring-2 ring-gray-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(icon.value)}
                              >
                                <div className="flex justify-center mb-2 text-gray-600">
                                  {icon.icon}
                                </div>
                                <p className="text-sm text-center font-medium">{icon.label}</p>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Estado activo */}
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Rol Activo</FormLabel>
                            <FormDescription>
                              El rol estará disponible para asignación inmediatamente
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                      <Link href="/admin-roles/roles">
                        <Button variant="outline">
                          Cancelar
                        </Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={createRoleMutation.isPending}
                      >
                        {createRoleMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Crear Rol
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Vista Previa */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
                <CardDescription>
                  Cómo se verá el rol en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview del badge */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Badge:</p>
                  <div className="flex justify-center">
                    {previewBadge()}
                  </div>
                </div>

                {/* Preview de información */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nombre:</p>
                    <p className="text-gray-900">{form.watch('displayName') || 'Sin nombre'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Descripción:</p>
                    <p className="text-sm text-gray-600">
                      {form.watch('description') || 'Sin descripción'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nivel:</p>
                    <Badge variant="outline">
                      Nivel {form.watch('level')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado:</p>
                    <Badge variant={form.watch('isActive') ? "default" : "secondary"}>
                      {form.watch('isActive') ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="text-sm text-gray-600 space-y-2">
                  <p>💡 <strong>Tip:</strong> Después de crear el rol, podrás configurar los permisos específicos.</p>
                  <p>⚠️ El nombre del sistema no puede cambiarse después de la creación.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}