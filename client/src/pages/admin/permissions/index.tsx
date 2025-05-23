import React, { useState } from 'react';
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
  BarChart, Settings, Lock, Info
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
    badge: { color: 'bg-yellow-500', textColor: 'text-black' }
  },
  {
    id: 'ciudadano',
    name: 'ciudadano',
    displayName: 'Ciudadano',
    description: 'Usuario final de los servicios de parques.',
    badge: { color: 'bg-orange-500', textColor: 'text-white' }
  },
  {
    id: 'guardaparques',
    name: 'guardaparques',
    displayName: 'Guardaparques',
    description: 'Cuidado y conservación de parques y áreas verdes.',
    badge: { color: 'bg-green-700', textColor: 'text-white' }
  },
  {
    id: 'guardia',
    name: 'guardia',
    displayName: 'Guardia',
    description: 'Seguridad y protección en parques.',
    badge: { color: 'bg-blue-700', textColor: 'text-white' }
  },
  {
    id: 'concesionario',
    name: 'concesionario',
    displayName: 'Concesionario',
    description: 'Operador de servicios concesionados en parques.',
    badge: { color: 'bg-amber-600', textColor: 'text-white' }
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'Usuario',
    description: 'Usuario básico del sistema con permisos limitados.',
    badge: { color: 'bg-gray-500', textColor: 'text-white' }
  }
];

// Definición de los módulos y permisos del sistema
const modules: Module[] = [
  {
    id: 'users',
    name: 'users',
    displayName: 'Usuarios',
    description: 'Gestión de usuarios del sistema',
    icon: <Users className="h-5 w-5" />,
    permissions: [
      {
        id: 'users',
        name: 'users',
        displayName: 'Usuarios',
        description: 'Administración de cuentas de usuario',
        icon: <User className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    ]
  },
  {
    id: 'parks',
    name: 'parks',
    displayName: 'Parques',
    description: 'Gestión de parques y áreas verdes',
    icon: <Map className="h-5 w-5" />,
    permissions: [
      {
        id: 'parks',
        name: 'parks',
        displayName: 'Parques',
        description: 'Administración de parques',
        icon: <Map className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      },
      {
        id: 'amenities',
        name: 'amenities',
        displayName: 'Instalaciones',
        description: 'Gestión de instalaciones y comodidades',
        icon: <Building className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    ]
  },
  {
    id: 'activities',
    name: 'activities',
    displayName: 'Actividades',
    description: 'Gestión de actividades y eventos',
    icon: <Calendar className="h-5 w-5" />,
    permissions: [
      {
        id: 'activities',
        name: 'activities',
        displayName: 'Actividades',
        description: 'Administración de actividades programadas',
        icon: <Activity className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    ]
  },
  {
    id: 'instructors',
    name: 'instructors',
    displayName: 'Instructores',
    description: 'Gestión de instructores y perfiles profesionales',
    icon: <Clipboard className="h-5 w-5" />,
    permissions: [
      {
        id: 'instructors',
        name: 'instructors',
        displayName: 'Instructores',
        description: 'Administración de instructores',
        icon: <Clipboard className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      },
      {
        id: 'evaluations',
        name: 'instructor_evaluations',
        displayName: 'Evaluaciones',
        description: 'Gestión de evaluaciones de instructores',
        icon: <ClipboardEdit className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    ]
  },
  {
    id: 'volunteers',
    name: 'volunteers',
    displayName: 'Voluntarios',
    description: 'Gestión de voluntarios y participación ciudadana',
    icon: <Users className="h-5 w-5" />,
    permissions: [
      {
        id: 'volunteers',
        name: 'volunteers',
        displayName: 'Voluntarios',
        description: 'Administración de voluntarios',
        icon: <Users className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      },
      {
        id: 'participations',
        name: 'volunteer_participations',
        displayName: 'Participaciones',
        description: 'Gestión de participaciones de voluntarios',
        icon: <FileText className="h-4 w-4" />,
        actions: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    ]
  },
  {
    id: 'reports',
    name: 'reports',
    displayName: 'Reportes',
    description: 'Informes y estadísticas del sistema',
    icon: <BarChart className="h-5 w-5" />,
    permissions: [
      {
        id: 'reports',
        name: 'reports',
        displayName: 'Reportes',
        description: 'Acceso a reportes y estadísticas',
        icon: <BarChart className="h-4 w-4" />,
        actions: {
          view: true,
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
    description: 'Configuración del sistema',
    icon: <Settings className="h-5 w-5" />,
    permissions: [
      {
        id: 'settings',
        name: 'settings',
        displayName: 'Configuración',
        description: 'Ajustes y configuración del sistema',
        icon: <Settings className="h-4 w-4" />,
        actions: {
          view: true,
          create: false,
          edit: true,
          delete: false
        }
      }
    ]
  }
];

// Estado inicial de los permisos por rol
const initialRolePermissions: Record<string, Record<string, Record<string, Record<string, boolean>>>> = {
  admin: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: true,
        create: true,
        edit: true,
        delete: true
      }
    }), {})
  }), {}),
  director: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: true,
        create: true,
        edit: true,
        delete: module.id === 'settings' ? false : true
      }
    }), {})
  }), {}),
  manager: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: true,
        create: module.id === 'settings' ? false : true,
        edit: module.id === 'settings' ? false : true,
        delete: module.id === 'users' || module.id === 'settings' ? false : true
      }
    }), {})
  }), {}),
  supervisor: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: true,
        create: ['users', 'settings'].includes(module.id) ? false : true,
        edit: ['users', 'settings'].includes(module.id) ? false : true,
        delete: false
      }
    }), {})
  }), {}),
  instructor: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['activities', 'instructors', 'parks', 'reports'].includes(module.id),
        create: module.id === 'activities',
        edit: module.id === 'activities' || (module.id === 'instructors' && permission.id === 'instructors'),
        delete: false
      }
    }), {})
  }), {}),
  voluntario: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities', 'volunteers'].includes(module.id),
        create: false,
        edit: (module.id === 'volunteers' && permission.id === 'volunteers'),
        delete: false
      }
    }), {})
  }), {}),
  ciudadano: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities'].includes(module.id),
        create: false,
        edit: false,
        delete: false
      }
    }), {})
  }), {}),
  guardaparques: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities'].includes(module.id),
        create: false,
        edit: module.id === 'parks',
        delete: false
      }
    }), {})
  }), {}),
  guardia: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities'].includes(module.id),
        create: false,
        edit: false,
        delete: false
      }
    }), {})
  }), {}),
  concesionario: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities'].includes(module.id),
        create: false,
        edit: false,
        delete: false
      }
    }), {})
  }), {}),
  user: modules.reduce((modulesAcc, module) => ({
    ...modulesAcc,
    [module.id]: module.permissions.reduce((permissionsAcc, permission) => ({
      ...permissionsAcc,
      [permission.id]: {
        view: ['parks', 'activities'].includes(module.id),
        create: false,
        edit: false,
        delete: false
      }
    }), {})
  }), {})
};

export default function PermissionsPage() {
  const [currentRoleTab, setCurrentRoleTab] = useState('admin');
  const [currentModuleTab, setCurrentModuleTab] = useState('users');
  const [rolePermissions, setRolePermissions] = useState(initialRolePermissions);
  const [isEditing, setIsEditing] = useState(false);
  
  // Guarda los permisos originales antes de editar
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, Record<string, Record<string, Record<string, boolean>>>>>(initialRolePermissions);

  // Función para cambiar un permiso específico
  const togglePermission = (
    role: string, 
    moduleId: string, 
    permissionId: string, 
    action: 'view' | 'create' | 'edit' | 'delete'
  ) => {
    if (!isEditing) return;
    
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleId]: {
          ...prev[role][moduleId],
          [permissionId]: {
            ...prev[role][moduleId][permissionId],
            [action]: !prev[role][moduleId][permissionId][action]
          }
        }
      }
    }));
  };

  // Función para entrar en modo edición
  const handleStartEditing = () => {
    setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)));
    setIsEditing(true);
  };

  // Función para guardar los cambios
  const handleSave = () => {
    toast({
      title: "Permisos actualizados",
      description: "Los permisos han sido actualizados correctamente.",
    });
    setIsEditing(false);
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
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
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
          <Card>
            <CardHeader>
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
                <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1 mb-4">
                  {roles.map(role => (
                    <TabsTrigger 
                      key={role.id} 
                      value={role.id}
                      className="flex items-center justify-center"
                    >
                      <span className={`w-2 h-2 rounded-full ${role.badge.color} mr-2`}></span>
                      {role.displayName}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {roles.map(role => (
                  <TabsContent key={role.id} value={role.id} className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <div className={`w-8 h-8 rounded-full ${role.badge.color} ${role.badge.textColor} flex items-center justify-center font-bold text-xl`}>
                        {role.displayName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold">{role.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
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