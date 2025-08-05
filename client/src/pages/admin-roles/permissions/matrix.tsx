import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Grid, ArrowLeft, Save, RotateCcw, Download, 
  Crown, Star, Gem, Zap, Award, Shield, Eye,
  Settings, Users, BarChart, Lock, Filter
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Definir tipos para la matriz de permisos
interface Permission {
  id: string;
  name: string;
  module: string;
  type: 'read' | 'write' | 'admin';
  description: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  badge: {
    color: string;
    icon: React.ReactNode;
  };
}

interface PermissionMatrix {
  [roleId: string]: {
    [permissionId: string]: boolean;
  };
}

// Datos simulados de roles
const mockRoles: Role[] = [
  {
    id: 'super-admin',
    name: 'super-admin',
    displayName: 'Super Admin',
    level: 10,
    badge: { color: 'bg-red-500', icon: <Crown className="w-3 h-3" /> }
  },
  {
    id: 'director-general',
    name: 'director-general',
    displayName: 'Director General',
    level: 9,
    badge: { color: 'bg-purple-500', icon: <Star className="w-3 h-3" /> }
  },
  {
    id: 'coordinador-parques',
    name: 'coordinador-parques',
    displayName: 'Coord. Parques',
    level: 8,
    badge: { color: 'bg-green-500', icon: <Gem className="w-3 h-3" /> }
  },
  {
    id: 'coordinador-actividades',
    name: 'coordinador-actividades',
    displayName: 'Coord. Actividades',
    level: 7,
    badge: { color: 'bg-blue-500', icon: <Zap className="w-3 h-3" /> }
  },
  {
    id: 'operador-parque',
    name: 'operador-parque',
    displayName: 'Operador',
    level: 4,
    badge: { color: 'bg-orange-500', icon: <Award className="w-3 h-3" /> }
  },
  {
    id: 'admin-financiero',
    name: 'admin-financiero',
    displayName: 'Admin Financiero',
    level: 6,
    badge: { color: 'bg-yellow-500', icon: <BarChart className="w-3 h-3" /> }
  },
  {
    id: 'consultor-auditor',
    name: 'consultor-auditor',
    displayName: 'Consultor',
    level: 1,
    badge: { color: 'bg-gray-500', icon: <Eye className="w-3 h-3" /> }
  }
];

// Datos simulados de permisos organizados por módulo
const mockPermissions: Permission[] = [
  // Configuración
  { id: 'config_view_notifications', name: 'Ver Notificaciones', module: 'Configuración', type: 'read', description: 'Ver configuración de notificaciones' },
  { id: 'config_manage_notifications', name: 'Gestionar Notificaciones', module: 'Configuración', type: 'write', description: 'Configurar notificaciones del sistema' },
  { id: 'config_system_settings', name: 'Configuraciones Sistema', module: 'Configuración', type: 'admin', description: 'Acceso completo a configuraciones' },
  
  // Gestión
  { id: 'mgmt_view_dashboards', name: 'Ver Dashboards', module: 'Gestión', type: 'read', description: 'Acceso a dashboards informativos' },
  { id: 'mgmt_manage_parks', name: 'Gestionar Parques', module: 'Gestión', type: 'write', description: 'Crear y editar información de parques' },
  { id: 'mgmt_manage_activities', name: 'Gestionar Actividades', module: 'Gestión', type: 'write', description: 'Administrar actividades y eventos' },
  { id: 'mgmt_manage_visitors', name: 'Gestionar Visitantes', module: 'Gestión', type: 'write', description: 'Registrar y analizar visitantes' },
  
  // Operaciones
  { id: 'ops_view_assets', name: 'Ver Activos', module: 'Operaciones', type: 'read', description: 'Consultar inventario de activos' },
  { id: 'ops_manage_assets', name: 'Gestionar Activos', module: 'Operaciones', type: 'write', description: 'Administrar inventario y activos' },
  { id: 'ops_schedule_maintenance', name: 'Programar Mantenimiento', module: 'Operaciones', type: 'write', description: 'Crear y programar mantenimiento' },
  { id: 'ops_manage_incidents', name: 'Gestionar Incidencias', module: 'Operaciones', type: 'write', description: 'Reportar y gestionar incidencias' },
  
  // Finanzas
  { id: 'fin_view_dashboard', name: 'Ver Dashboard Financiero', module: 'Finanzas', type: 'read', description: 'Acceso a información financiera' },
  { id: 'fin_manage_budgets', name: 'Gestionar Presupuestos', module: 'Finanzas', type: 'write', description: 'Crear y modificar presupuestos' },
  { id: 'fin_manage_transactions', name: 'Gestionar Transacciones', module: 'Finanzas', type: 'admin', description: 'Control total de transacciones' },
  
  // Marketing
  { id: 'mkt_manage_communications', name: 'Gestionar Comunicaciones', module: 'Marketing', type: 'write', description: 'Crear y enviar comunicaciones' },
  { id: 'mkt_manage_advertising', name: 'Gestionar Publicidad', module: 'Marketing', type: 'write', description: 'Administrar espacios publicitarios' },
  
  // RH
  { id: 'hr_view_employees', name: 'Ver Empleados', module: 'RH', type: 'read', description: 'Consultar información de empleados' },
  { id: 'hr_manage_employees', name: 'Gestionar Empleados', module: 'RH', type: 'write', description: 'Administrar información de personal' },
  { id: 'hr_manage_payroll', name: 'Gestionar Nómina', module: 'RH', type: 'admin', description: 'Control de nómina y pagos' },
  
  // Seguridad
  { id: 'sec_view_users', name: 'Ver Usuarios', module: 'Seguridad', type: 'read', description: 'Consultar lista de usuarios' },
  { id: 'sec_manage_users', name: 'Gestionar Usuarios', module: 'Seguridad', type: 'admin', description: 'Crear y administrar usuarios' },
  { id: 'sec_manage_roles', name: 'Gestionar Roles', module: 'Seguridad', type: 'admin', description: 'Administrar roles y permisos' }
];

export default function PermissionMatrix() {
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(() => {
    const saved = localStorage.getItem('admin-roles-permission-matrix');
    return saved ? JSON.parse(saved) : {};
  });
  const [filter, setFilter] = useState<'all' | 'read' | 'write' | 'admin'>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para guardar matriz de permisos
  const saveMatrixMutation = useMutation({
    mutationFn: async (matrix: PermissionMatrix) => {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Guardando matriz:', matrix);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Matriz guardada",
        description: "Los permisos se han actualizado correctamente.",
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

  // Función para alternar permiso
  const togglePermission = (roleId: string, permissionId: string) => {
    const newMatrix = {
      ...permissionMatrix,
      [roleId]: {
        ...permissionMatrix[roleId],
        [permissionId]: !permissionMatrix[roleId]?.[permissionId]
      }
    };
    setPermissionMatrix(newMatrix);
    // Guardar en localStorage para sincronización
    localStorage.setItem('admin-roles-permission-matrix', JSON.stringify(newMatrix));
  };

  // Función para verificar si un permiso está activo
  const hasPermission = (roleId: string, permissionId: string) => {
    return permissionMatrix[roleId]?.[permissionId] || false;
  };

  // Filtrar permisos según el filtro activo
  const filteredPermissions = filter === 'all' 
    ? mockPermissions 
    : mockPermissions.filter(p => p.type === filter);

  // Agrupar permisos por módulo
  const permissionsByModule = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Función para aplicar plantilla de permisos por nivel
  const applyTemplate = (template: 'hierarchical' | 'clear') => {
    if (template === 'clear') {
      setPermissionMatrix({});
      localStorage.setItem('admin-roles-permission-matrix', JSON.stringify({}));
      return;
    }

    // Plantilla jerárquica: roles de mayor nivel heredan permisos de menores
    const newMatrix: PermissionMatrix = {};
    
    mockRoles.forEach(role => {
      newMatrix[role.id] = {};
      
      mockPermissions.forEach(permission => {
        // Super Admin tiene todos los permisos
        if (role.id === 'super-admin') {
          newMatrix[role.id][permission.id] = true;
          return;
        }

        // Asignar permisos según nivel y tipo
        let hasPermission = false;
        
        switch (permission.type) {
          case 'read':
            hasPermission = role.level >= 1; // Todos pueden leer
            break;
          case 'write':
            hasPermission = role.level >= 4; // Nivel 4+ puede escribir
            break;
          case 'admin':
            hasPermission = role.level >= 8; // Solo nivel 8+ puede administrar
            break;
        }

        newMatrix[role.id][permission.id] = hasPermission;
      });
    });

    setPermissionMatrix(newMatrix);
    // Guardar en localStorage para sincronización
    localStorage.setItem('admin-roles-permission-matrix', JSON.stringify(newMatrix));
    toast({
      title: "Plantilla aplicada",
      description: "Se han asignado permisos según la jerarquía de roles.",
    });
  };

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'read': return 'bg-gray-100 text-gray-700';
      case 'write': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-roles/permissions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Matriz de Permisos
              </h1>
              <p className="text-gray-600 mt-2">
                Configurar permisos específicos para cada rol del sistema
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => applyTemplate('clear')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar Todo
            </Button>
            <Button variant="outline" onClick={() => applyTemplate('hierarchical')}>
              <Shield className="w-4 h-4 mr-2" />
              Aplicar Plantilla
            </Button>
            <Button 
              onClick={() => saveMatrixMutation.mutate(permissionMatrix)}
              disabled={saveMatrixMutation.isPending}
            >
              {saveMatrixMutation.isPending ? (
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

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Filtrar por tipo:</span>
                </div>
                <div className="flex gap-2">
                  {(['all', 'read', 'write', 'admin'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(type)}
                    >
                      {type === 'all' ? 'Todos' : 
                       type === 'read' ? 'Lectura' :
                       type === 'write' ? 'Escritura' : 'Admin'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-gray-600">
                  {filteredPermissions.length} permisos mostrados
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  {mockRoles.length} roles
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Matriz de Roles vs Permisos
            </CardTitle>
            <CardDescription>
              Marca las casillas para asignar permisos específicos a cada rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left border-b font-medium text-gray-900 sticky left-0 bg-white z-10 min-w-[250px]">
                      Permisos / Roles
                    </th>
                    {mockRoles.map((role) => (
                      <th key={role.id} className="p-3 text-center border-b font-medium min-w-[120px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${role.badge.color} text-white`}>
                            {role.badge.icon}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium">{role.name.toUpperCase()}</p>
                            <Badge variant="outline" className="text-xs">
                              Nivel {role.level}
                            </Badge>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(permissionsByModule).map(([moduleName, permissions]) => (
                    <React.Fragment key={moduleName}>
                      {/* Separador de módulo */}
                      <tr>
                        <td colSpan={mockRoles.length + 1} className="p-3 bg-gray-50 border-b">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{moduleName}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {permissions.length} permisos
                            </Badge>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Permisos del módulo */}
                      {permissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="p-3 border-b sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-gray-900">{permission.name}</p>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPermissionTypeColor(permission.type)}`}
                              >
                                {permission.type === 'read' ? 'Lectura' :
                                 permission.type === 'write' ? 'Escritura' : 'Admin'}
                              </Badge>
                            </div>
                          </td>
                          {mockRoles.map((role) => (
                            <td key={`${role.id}-${permission.id}`} className="p-3 border-b text-center">
                              <Checkbox
                                checked={hasPermission(role.id, permission.id)}
                                onCheckedChange={() => togglePermission(role.id, permission.id)}
                                className="mx-auto"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de la matriz */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permisos Asignados</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Object.values(permissionMatrix).reduce((sum, rolePerms) => 
                      sum + Object.values(rolePerms).filter(Boolean).length, 0
                    )}
                  </p>
                </div>
                <Grid className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posible</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {mockRoles.length * mockPermissions.length}
                  </p>
                </div>
                <Lock className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cobertura</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(
                      (Object.values(permissionMatrix).reduce((sum, rolePerms) => 
                        sum + Object.values(rolePerms).filter(Boolean).length, 0
                      ) / (mockRoles.length * mockPermissions.length)) * 100
                    )}%
                  </p>
                </div>
                <BarChart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}