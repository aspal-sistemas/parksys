import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Shield, ShieldCheck, ShieldAlert, Users, 
  Clipboard, ClipboardEdit, Save, 
  Eye, Edit, Building, Trash, RefreshCw,
  Map, Calendar, Activity, User, FileText,
  BarChart, Settings, Lock, Info, Plus, UserCircle, FileSignature
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from '@/hooks/use-toast';

// Definición de tipos para los roles del sistema
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  badge: {
    color: string;
    textColor: string;
  };
}

// Definición de tipos para los módulos y permisos
interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

// Definición de los roles del sistema
const roles: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrador',
    description: 'Control total del sistema para la gestión de parques y usuarios.',
    badge: { color: 'bg-red-500', textColor: 'text-white' }
  },
  {
    id: 'director',
    name: 'director',
    displayName: 'Director',
    description: 'Gestión estratégica y supervisión de operaciones.',
    badge: { color: 'bg-purple-500', textColor: 'text-white' }
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Gerente',
    description: 'Gestión operativa y coordinación de actividades.',
    badge: { color: 'bg-blue-500', textColor: 'text-white' }
  },
  {
    id: 'supervisor',
    name: 'supervisor',
    displayName: 'Supervisor',
    description: 'Supervisión directa de personal y actividades.',
    badge: { color: 'bg-teal-500', textColor: 'text-white' }
  },
  {
    id: 'instructor',
    name: 'instructor',
    displayName: 'Instructor',
    description: 'Impartición de actividades y talleres en parques.',
    badge: { color: 'bg-green-500', textColor: 'text-white' }
  },
  {
    id: 'voluntario',
    name: 'voluntario',
    displayName: 'Voluntario',
    description: 'Apoyo en actividades y eventos en parques.',
    badge: { color: 'bg-amber-500', textColor: 'text-white' }
  },
  {
    id: 'ciudadano',
    name: 'ciudadano',
    displayName: 'Ciudadano',
    description: 'Usuario registrado para participación ciudadana.',
    badge: { color: 'bg-cyan-500', textColor: 'text-white' }
  },
  {
    id: 'guardaparques',
    name: 'guardaparques',
    displayName: 'Guardaparques',
    description: 'Cuidado y mantenimiento de parques.',
    badge: { color: 'bg-lime-600', textColor: 'text-white' }
  },
  {
    id: 'guardia',
    name: 'guardia',
    displayName: 'Guardia',
    description: 'Seguridad y vigilancia en parques.',
    badge: { color: 'bg-indigo-600', textColor: 'text-white' }
  },
  {
    id: 'concesionario',
    name: 'concesionario',
    displayName: 'Concesionario',
    description: 'Servicios externos y concesiones en parques.',
    badge: { color: 'bg-orange-500', textColor: 'text-white' }
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'Usuario',
    description: 'Usuario básico del sistema.',
    badge: { color: 'bg-gray-500', textColor: 'text-white' }
  }
];

// Definición de los módulos del sistema
const modules: Module[] = [
  {
    id: 'users',
    name: 'users',
    displayName: 'Usuarios',
    description: 'Gestión de usuarios del sistema',
    icon: <Users className="h-4 w-4" />,
    permissions: [
      {
        id: 'user-management',
        name: 'user-management',
        displayName: 'Gestión de Usuarios',
        description: 'Administración de cuentas de usuario',
        icon: <User className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'role-permissions',
        name: 'role-permissions',
        displayName: 'Permisos de Roles',
        description: 'Configuración de permisos por rol',
        icon: <Lock className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'parks',
    name: 'parks',
    displayName: 'Parques',
    description: 'Gestión de parques y espacios públicos',
    icon: <Map className="h-4 w-4" />,
    permissions: [
      {
        id: 'park-management',
        name: 'park-management',
        displayName: 'Gestión de Parques',
        description: 'Administración de espacios públicos',
        icon: <Building className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'park-amenities',
        name: 'park-amenities',
        displayName: 'Amenidades',
        description: 'Gestión de instalaciones y servicios',
        icon: <Info className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'activities',
    name: 'activities',
    displayName: 'Actividades',
    description: 'Gestión de actividades y eventos',
    icon: <Calendar className="h-4 w-4" />,
    permissions: [
      {
        id: 'activity-management',
        name: 'activity-management',
        displayName: 'Gestión de Actividades',
        description: 'Administración de eventos y actividades',
        icon: <Activity className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'activity-scheduling',
        name: 'activity-scheduling',
        displayName: 'Programación',
        description: 'Calendarización de actividades',
        icon: <Calendar className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'instructors',
    name: 'instructors',
    displayName: 'Instructores',
    description: 'Gestión de instructores y personal',
    icon: <Clipboard className="h-4 w-4" />,
    permissions: [
      {
        id: 'instructor-management',
        name: 'instructor-management',
        displayName: 'Gestión de Instructores',
        description: 'Administración de instructores',
        icon: <ClipboardEdit className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'instructor-assignments',
        name: 'instructor-assignments',
        displayName: 'Asignaciones',
        description: 'Asignación de instructores a actividades',
        icon: <RefreshCw className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'volunteers',
    name: 'volunteers',
    displayName: 'Voluntarios',
    description: 'Gestión del programa de voluntariado',
    icon: <Shield className="h-4 w-4" />,
    permissions: [
      {
        id: 'volunteer-management',
        name: 'volunteer-management',
        displayName: 'Gestión de Voluntarios',
        description: 'Administración de voluntarios',
        icon: <ShieldCheck className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'volunteer-events',
        name: 'volunteer-events',
        displayName: 'Eventos Voluntarios',
        description: 'Gestión de eventos de voluntariado',
        icon: <ShieldAlert className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'reports',
    name: 'reports',
    displayName: 'Reportes',
    description: 'Análisis y estadísticas del sistema',
    icon: <BarChart className="h-4 w-4" />,
    permissions: [
      {
        id: 'analytics',
        name: 'analytics',
        displayName: 'Analíticas',
        description: 'Estadísticas y dashboards',
        icon: <BarChart className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      },
      {
        id: 'reports-export',
        name: 'reports-export',
        displayName: 'Exportar Reportes',
        description: 'Generación y exportación de informes',
        icon: <FileText className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  },
  {
    id: 'settings',
    name: 'settings',
    displayName: 'Configuración',
    description: 'Ajustes generales del sistema',
    icon: <Settings className="h-4 w-4" />,
    permissions: [
      {
        id: 'system-settings',
        name: 'system-settings',
        displayName: 'Configuración del Sistema',
        description: 'Ajustes generales y parámetros',
        icon: <Settings className="h-4 w-4" />,
        actions: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    ]
  }
];

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  
  // Estados para la pantalla
  const [currentRoleTab, setCurrentRoleTab] = useState<string>('admin');
  const [currentModuleTab, setCurrentModuleTab] = useState<string>('users');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estado para almacenar los permisos de cada rol
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, Record<string, Record<string, boolean>>>>>({});
  
  // Estado para guardar los permisos originales antes de editar
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, Record<string, Record<string, Record<string, boolean>>>>>({});

  // Query para cargar permisos del servidor
  const { data: serverPermissions, isLoading } = useQuery({
    queryKey: ['/api/role-permissions'],
    select: (data) => data || {}
  });

  // Mutation para guardar permisos
  const savePermissionsMutation = useMutation({
    mutationFn: async (permissions: any) => {
      try {
        const response = await fetch('/api/role-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ permissions }),
        });
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }
        
        // Intentar parsear como JSON, pero manejar errores graciosamente
        try {
          return await response.json();
        } catch (jsonError) {
          // Si no se puede parsear como JSON, devolver un objeto de éxito simple
          return { success: true, message: 'Permisos guardados correctamente' };
        }
      } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
      toast({
        title: "Permisos actualizados",
        description: "Los permisos han sido guardados correctamente en el servidor.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los permisos.",
        variant: "destructive"
      });
    }
  });

  // Cargar permisos del servidor cuando se obtengan
  useEffect(() => {
    if (serverPermissions) {
      setRolePermissions(serverPermissions);
    }
  }, [serverPermissions]);

  // Función para cambiar el estado de un permiso
  const togglePermission = (role: string, moduleId: string, permissionId: string, action: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleId]: {
          ...prev[role]?.[moduleId],
          [permissionId]: {
            ...prev[role]?.[moduleId]?.[permissionId],
            [action]: !prev[role]?.[moduleId]?.[permissionId]?.[action]
          }
        }
      }
    }));
  };

  // Función para otorgar todos los permisos a un rol específico
  const grantAllPermissionsToRole = (roleId: string) => {
    setRolePermissions(prev => {
      const updatedPermissions = {...prev};
      
      // Recorrer todos los módulos
      modules.forEach(module => {
        if (!updatedPermissions[roleId]) {
          updatedPermissions[roleId] = {};
        }
        
        if (!updatedPermissions[roleId][module.id]) {
          updatedPermissions[roleId][module.id] = {};
        }
        
        // Recorrer todos los permisos del módulo
        module.permissions.forEach(permission => {
          updatedPermissions[roleId][module.id][permission.id] = {
            view: true,
            create: true,
            edit: true,
            delete: true
          };
        });
      });
      
      return updatedPermissions;
    });
    
    toast({
      title: "Permisos actualizados",
      description: `Se han otorgado todos los permisos al rol ${roles.find(r => r.id === roleId)?.displayName}.`,
    });
  };

  // Función para entrar en modo edición
  const handleStartEditing = () => {
    setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)));
    setIsEditing(true);
  };

  // Función para guardar los cambios
  const handleSave = () => {
    savePermissionsMutation.mutate(rolePermissions);
  };

  // Función para cancelar los cambios
  const handleCancel = () => {
    setRolePermissions(originalPermissions);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
            <p className="text-muted-foreground">
              Administra los permisos de cada rol en el sistema.
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={savePermissionsMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savePermissionsMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={handleStartEditing}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Permisos
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-muted">
            <CardHeader className="bg-background rounded-t-lg">
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Matriz de Permisos por Rol
              </CardTitle>
              <CardDescription>
                Visualiza y administra los permisos de cada rol en el sistema. Selecciona un rol para ver sus permisos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="admin" value={currentRoleTab} onValueChange={setCurrentRoleTab} className="w-full">
                {/* Lista de roles en pestañas horizontales con mejor espaciado */}
                <div className="bg-muted p-4 rounded-lg mb-12">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {roles.map(role => (
                      <TabsTrigger 
                        key={role.id} 
                        value={role.id}
                        className="flex items-center justify-center py-2 bg-background"
                      >
                        <span className={`w-2 h-2 rounded-full ${role.badge.color} mr-2`}></span>
                        <span className="truncate">{role.displayName}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Contenido de cada pestaña de rol */}
                {roles.map(role => (
                  <TabsContent key={role.id} value={role.id} className="space-y-8">
                    {/* Encabezado del rol con descripción y botón de acción */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-5 bg-muted rounded-lg mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${role.badge.color} ${role.badge.textColor} flex items-center justify-center font-bold text-xl`}>
                          {role.displayName[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{role.displayName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                        </div>
                      </div>
                      
                      {/* Botón para asignar todos los permisos si el rol es administrador */}
                      {role.id === 'admin' && isEditing && (
                        <Button 
                          onClick={() => grantAllPermissionsToRole(role.id)}
                          className="bg-green-600 hover:bg-green-700 ml-auto"
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Otorgar Todos los Permisos
                        </Button>
                      )}
                    </div>
                    
                    <Tabs defaultValue="users" value={currentModuleTab} onValueChange={setCurrentModuleTab}>
                      <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 mb-4">
                        {modules.map(module => (
                          <TabsTrigger 
                            key={module.id} 
                            value={module.id}
                            className="flex items-center justify-center"
                          >
                            {module.icon}
                            <span className="ml-2">{module.displayName}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {modules.map(module => (
                        <TabsContent key={module.id} value={module.id}>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xl flex items-center">
                                {module.icon}
                                <span className="ml-2">{module.displayName}</span>
                              </CardTitle>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[250px]">Permiso</TableHead>
                                    <TableHead className="text-center w-[120px]">
                                      <Eye className="h-4 w-4 mx-auto" />
                                      <span className="text-xs">Ver</span>
                                    </TableHead>
                                    <TableHead className="text-center w-[120px]">
                                      <Plus className="h-4 w-4 mx-auto" />
                                      <span className="text-xs">Crear</span>
                                    </TableHead>
                                    <TableHead className="text-center w-[120px]">
                                      <Edit className="h-4 w-4 mx-auto" />
                                      <span className="text-xs">Editar</span>
                                    </TableHead>
                                    <TableHead className="text-center w-[120px]">
                                      <Trash className="h-4 w-4 mx-auto" />
                                      <span className="text-xs">Eliminar</span>
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {module.permissions.map(permission => (
                                    <TableRow key={permission.id}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center">
                                          {permission.icon}
                                          <span className="ml-2">{permission.displayName}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground block mt-1">
                                          {permission.description}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch 
                                          checked={rolePermissions[role.id]?.[module.id]?.[permission.id]?.view || false}
                                          onCheckedChange={() => togglePermission(role.id, module.id, permission.id, 'view')}
                                          disabled={!isEditing}
                                          className={`${!isEditing ? 'opacity-60' : ''}`}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch 
                                          checked={rolePermissions[role.id]?.[module.id]?.[permission.id]?.create || false}
                                          onCheckedChange={() => togglePermission(role.id, module.id, permission.id, 'create')}
                                          disabled={!isEditing}
                                          className={`${!isEditing ? 'opacity-60' : ''}`}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch 
                                          checked={rolePermissions[role.id]?.[module.id]?.[permission.id]?.edit || false}
                                          onCheckedChange={() => togglePermission(role.id, module.id, permission.id, 'edit')}
                                          disabled={!isEditing}
                                          className={`${!isEditing ? 'opacity-60' : ''}`}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch 
                                          checked={rolePermissions[role.id]?.[module.id]?.[permission.id]?.delete || false}
                                          onCheckedChange={() => togglePermission(role.id, module.id, permission.id, 'delete')}
                                          disabled={!isEditing}
                                          className={`${!isEditing ? 'opacity-60' : ''}`}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}