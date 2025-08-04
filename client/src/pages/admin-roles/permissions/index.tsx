import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Lock, Shield, Settings, Search, Filter,
  Grid, List, Eye, Edit, Users, BarChart, Info,
  Crown, UserCog, UserCheck, User, Briefcase,
  GraduationCap, HeadphonesIcon, Coffee, HardHat
} from 'lucide-react';
import { Link } from 'wouter';

// Definiciones de roles y matriz de permisos
const mockRoles = [
  { id: 'super-admin', name: 'Super Admin', level: 10, description: 'Acceso total al sistema', color: 'bg-red-500', icon: Crown },
  { id: 'admin-sistema', name: 'Admin Sistema', level: 9, description: 'Administrador completo', color: 'bg-orange-500', icon: Shield },
  { id: 'admin-parques', name: 'Admin Parques', level: 8, description: 'Administrador de parques', color: 'bg-yellow-500', icon: UserCog },
  { id: 'coordinador', name: 'Coordinador', level: 7, description: 'Coordinador de área', color: 'bg-green-500', icon: Users },
  { id: 'supervisor', name: 'Supervisor', level: 6, description: 'Supervisor operativo', color: 'bg-blue-500', icon: UserCheck },
  { id: 'operador-senior', name: 'Operador Senior', level: 5, description: 'Operador con experiencia', color: 'bg-indigo-500', icon: Briefcase },
  { id: 'operador', name: 'Operador', level: 4, description: 'Operador estándar', color: 'bg-purple-500', icon: User },
  { id: 'asistente', name: 'Asistente', level: 3, description: 'Asistente administrativo', color: 'bg-pink-500', icon: GraduationCap },
  { id: 'invitado', name: 'Invitado', level: 2, description: 'Acceso de invitado', color: 'bg-gray-500', icon: Coffee },
  { id: 'consultor', name: 'Consultor', level: 1, description: 'Consultor externo', color: 'bg-slate-500', icon: HardHat }
];

// Componente principal de gestión de permisos
export default function PermissionsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Matriz de permisos - sincronizada con localStorage
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem('admin-roles-permission-matrix');
    return saved ? JSON.parse(saved) : {};
  });

  // Escuchar cambios en localStorage para sincronizar entre pestañas
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin-roles-permission-matrix');
      if (saved) {
        setPermissionMatrix(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling para detectar cambios en la misma pestaña
    const interval = setInterval(() => {
      const saved = localStorage.getItem('admin-roles-permission-matrix');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPermissionMatrix(current => {
          // Solo actualizar si hay cambios
          if (JSON.stringify(current) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return current;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Datos simulados de módulos y permisos
  const modulePermissions = [
    {
      id: 'configuration',
      name: 'Configuración',
      description: 'Configuraciones generales del sistema',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-purple-500',
      permissions: [
        { id: 'view_notifications', name: 'Ver Notificaciones', type: 'read' },
        { id: 'manage_notifications', name: 'Gestionar Notificaciones', type: 'write' },
        { id: 'system_settings', name: 'Configuraciones del Sistema', type: 'admin' }
      ]
    },
    {
      id: 'management',
      name: 'Gestión',
      description: 'Dashboards y gestión operativa',
      icon: <BarChart className="w-6 h-6" />,
      color: 'bg-blue-500',
      permissions: [
        { id: 'view_dashboards', name: 'Ver Dashboards', type: 'read' },
        { id: 'manage_visitors', name: 'Gestionar Visitantes', type: 'write' },
        { id: 'manage_parks', name: 'Gestionar Parques', type: 'write' },
        { id: 'manage_trees', name: 'Gestionar Arbolado', type: 'write' },
        { id: 'manage_activities', name: 'Gestionar Actividades', type: 'write' },
        { id: 'manage_events', name: 'Gestionar Eventos', type: 'write' },
        { id: 'manage_instructors', name: 'Gestionar Instructores', type: 'write' }
      ]
    },
    {
      id: 'operations',
      name: 'Operaciones y Mantenimiento',
      description: 'Activos, mantenimiento y voluntarios',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-green-500',
      permissions: [
        { id: 'view_assets', name: 'Ver Activos', type: 'read' },
        { id: 'manage_assets', name: 'Gestionar Activos', type: 'write' },
        { id: 'schedule_maintenance', name: 'Programar Mantenimiento', type: 'write' },
        { id: 'manage_incidents', name: 'Gestionar Incidencias', type: 'write' },
        { id: 'manage_volunteers', name: 'Gestionar Voluntarios', type: 'write' }
      ]
    },
    {
      id: 'finance',
      name: 'Administración y Finanzas',
      description: 'Gestión financiera y administrativa',
      icon: <BarChart className="w-6 h-6" />,
      color: 'bg-yellow-500',
      permissions: [
        { id: 'view_finance_dashboard', name: 'Ver Dashboard Financiero', type: 'read' },
        { id: 'manage_budgets', name: 'Gestionar Presupuestos', type: 'write' },
        { id: 'view_reports', name: 'Ver Reportes', type: 'read' },
        { id: 'manage_transactions', name: 'Gestionar Transacciones', type: 'admin' },
        { id: 'manage_sponsors', name: 'Gestionar Patrocinadores', type: 'write' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing y Comunicaciones',
      description: 'Comunicación y promoción',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
      permissions: [
        { id: 'manage_communications', name: 'Gestionar Comunicaciones', type: 'write' },
        { id: 'manage_advertising', name: 'Gestionar Publicidad', type: 'write' },
        { id: 'send_emails', name: 'Enviar Emails', type: 'write' },
        { id: 'manage_campaigns', name: 'Gestionar Campañas', type: 'admin' }
      ]
    },
    {
      id: 'hr',
      name: 'Recursos Humanos',
      description: 'Gestión de personal',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-teal-500',
      permissions: [
        { id: 'view_employees', name: 'Ver Empleados', type: 'read' },
        { id: 'manage_employees', name: 'Gestionar Empleados', type: 'write' },
        { id: 'manage_payroll', name: 'Gestionar Nómina', type: 'admin' },
        { id: 'manage_vacations', name: 'Gestionar Vacaciones', type: 'write' }
      ]
    },
    {
      id: 'security',
      name: 'Seguridad',
      description: 'Control de acceso y seguridad',
      icon: <Lock className="w-6 h-6" />,
      color: 'bg-red-500',
      permissions: [
        { id: 'view_users', name: 'Ver Usuarios', type: 'read' },
        { id: 'manage_users', name: 'Gestionar Usuarios', type: 'admin' },
        { id: 'manage_roles', name: 'Gestionar Roles', type: 'admin' },
        { id: 'view_audit_logs', name: 'Ver Logs de Auditoría', type: 'read' },
        { id: 'manage_permissions', name: 'Gestionar Permisos', type: 'admin' }
      ]
    }
  ];

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'read': return 'bg-gray-100 text-gray-700';
      case 'write': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPermissionTypeLabel = (type: string) => {
    switch (type) {
      case 'read': return 'Lectura';
      case 'write': return 'Escritura';
      case 'admin': return 'Admin';
      default: return 'Desconocido';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Permisos
            </h1>
            <p className="text-gray-600 mt-2">
              Administrar permisos por módulo y configurar matriz de roles
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin-roles/permissions/matrix">
              <Button variant="outline">
                <Grid className="w-4 h-4 mr-2" />
                Matriz de Permisos
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4 mr-2" />
              ) : (
                <Grid className="w-4 h-4 mr-2" />
              )}
              {viewMode === 'grid' ? 'Vista Lista' : 'Vista Grid'}
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Módulos</p>
                  <p className="text-3xl font-bold text-gray-900">{modulePermissions.length}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Permisos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {modulePermissions.reduce((sum, module) => sum + module.permissions.length, 0)}
                  </p>
                </div>
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permisos Admin</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {modulePermissions.reduce((sum, module) => 
                      sum + module.permissions.filter(p => p.type === 'admin').length, 0
                    )}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permisos Lectura</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {modulePermissions.reduce((sum, module) => 
                      sum + module.permissions.filter(p => p.type === 'read').length, 0
                    )}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar módulos o permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de navegación */}
        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Por Módulos</TabsTrigger>
            <TabsTrigger value="permissions">Por Permisos</TabsTrigger>
            <TabsTrigger value="roles">Por Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Vista por módulos */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {modulePermissions.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${module.color} text-white`}>
                        {module.icon}
                      </div>
                      <Badge variant="secondary">
                        {module.permissions.length} permisos
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.permissions.slice(0, 3).map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{permission.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getPermissionTypeColor(permission.type)}`}
                          >
                            {getPermissionTypeLabel(permission.type)}
                          </Badge>
                        </div>
                      ))}
                      {module.permissions.length > 3 && (
                        <div className="text-center pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Ver todos ({module.permissions.length - 3} más)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {module.icon}
                                  Permisos de {module.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Lista completa de permisos disponibles para el módulo {module.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {['read', 'write', 'admin'].map((type) => {
                                  const typePermissions = module.permissions.filter(p => p.type === type);
                                  if (typePermissions.length === 0) return null;
                                  
                                  return (
                                    <div key={type}>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Badge className={getPermissionTypeColor(type)}>
                                          {getPermissionTypeLabel(type)}
                                        </Badge>
                                        ({typePermissions.length} permisos)
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {typePermissions.map((permission) => (
                                          <div key={permission.id} className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-sm">{permission.name}</p>
                                            <p className="text-xs text-gray-600">ID: {permission.id}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-end pt-4">
                                <Link href="/admin-roles/permissions/matrix">
                                  <Button>
                                    Configurar en Matriz
                                  </Button>
                                </Link>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Permisos</CardTitle>
                <CardDescription>
                  Todos los permisos disponibles organizados por tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['read', 'write', 'admin'].map((type) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Badge className={getPermissionTypeColor(type)}>
                          {getPermissionTypeLabel(type)}
                        </Badge>
                        ({modulePermissions.reduce((sum, module) => 
                          sum + module.permissions.filter(p => p.type === type).length, 0
                        )} permisos)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modulePermissions.flatMap(module => 
                          module.permissions
                            .filter(p => p.type === type)
                            .map(permission => (
                              <div key={permission.id} className="p-3 border rounded-lg">
                                <p className="font-medium">{permission.name}</p>
                                <p className="text-sm text-gray-600">{module.name}</p>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permisos por Rol</CardTitle>
                <CardDescription>
                  Vista de permisos asignados a cada rol del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockRoles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${role.color} text-white`}>
                            <role.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{role.name}</h3>
                            <p className="text-sm text-gray-600">Nivel {role.level} • {role.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Object.values(permissionMatrix[role.id] || {}).filter(Boolean).length} permisos
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {['read', 'write', 'admin'].map((type) => {
                          const typePermissions = modulePermissions.flatMap(module => 
                            module.permissions.filter(p => p.type === type && permissionMatrix[role.id]?.[p.id])
                          );
                          
                          if (typePermissions.length === 0) return null;
                          
                          return (
                            <div key={type}>
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Badge className={getPermissionTypeColor(type)}>
                                  {getPermissionTypeLabel(type)}
                                </Badge>
                                ({typePermissions.length})
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {typePermissions.map((permission) => (
                                  <div key={permission.id} className="text-xs bg-gray-50 px-2 py-1 rounded">
                                    {permission.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        
                        {Object.values(permissionMatrix[role.id] || {}).filter(Boolean).length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No hay permisos asignados</p>
                            <Link href="/admin-roles/permissions/matrix">
                              <Button size="sm" variant="outline" className="mt-2">
                                Configurar Permisos
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}