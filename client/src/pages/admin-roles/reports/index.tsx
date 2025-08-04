import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Activity, Users, Shield, Download,
  TrendingUp, Clock, Eye, Calendar, FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'wouter';

// Datos simulados para reportes
const mockActivityData = [
  {
    id: 1,
    action: 'Rol "Coordinador de Parques" creado',
    user: 'Admin Sistema',
    role: 'Super Administrador',
    timestamp: '2024-08-04T10:30:00Z',
    type: 'role_created',
    details: 'Nuevo rol creado con 65 permisos asignados'
  },
  {
    id: 2,
    action: 'Usuario "Ana García" asignado como "Coordinador de Parques"',
    user: 'Director General',
    role: 'Director General',
    timestamp: '2024-08-04T09:15:00Z',
    type: 'role_assigned',
    details: 'Asignación de rol con nivel 8 de autoridad'
  },
  {
    id: 3,
    action: 'Permisos de "Gestión de Activos" modificados',
    user: 'Admin Sistema',
    role: 'Super Administrador',
    timestamp: '2024-08-03T16:45:00Z',
    type: 'permissions_modified',
    details: 'Se agregaron 3 nuevos permisos al módulo'
  },
  {
    id: 4,
    action: 'Intento de acceso denegado a módulo Finanzas',
    user: 'Juan Rodríguez',
    role: 'Operador de Parque',
    timestamp: '2024-08-03T14:20:00Z',
    type: 'access_denied',
    details: 'Usuario intentó acceder sin permisos suficientes'
  },
  {
    id: 5,
    action: 'Sesión iniciada con éxito',
    user: 'Carlos Martínez',
    role: 'Director General',
    timestamp: '2024-08-03T08:30:00Z',
    type: 'login_success',
    details: 'Inicio de sesión desde IP 192.168.1.100'
  }
];

const mockUsageStats = {
  totalUsers: 45,
  activeUsers: 42,
  rolesCreated: 10,
  permissionsTotal: 85,
  sessionsDailyAvg: 28,
  accessDeniedCount: 12,
  lastWeekActivity: 156,
  mostUsedRole: 'Operador de Parque',
  leastUsedRole: 'Consultor/Auditor'
};

const mockRoleEffectiveness = [
  {
    role: 'Super Administrador',
    users: 2,
    permissions: 85,
    usage: 95,
    effectiveness: 'Alta',
    lastUsed: '2024-08-04T10:30:00Z'
  },
  {
    role: 'Director General',
    users: 1,
    permissions: 68,
    usage: 88,
    effectiveness: 'Alta',
    lastUsed: '2024-08-04T09:15:00Z'
  },
  {
    role: 'Coordinador de Parques',
    users: 5,
    permissions: 52,
    usage: 76,
    effectiveness: 'Media',
    lastUsed: '2024-08-03T16:45:00Z'
  },
  {
    role: 'Coordinador de Actividades',
    users: 3,
    permissions: 45,
    usage: 82,
    effectiveness: 'Alta',
    lastUsed: '2024-08-04T08:20:00Z'
  },
  {
    role: 'Operador de Parque',
    users: 15,
    permissions: 28,
    usage: 91,
    effectiveness: 'Alta',
    lastUsed: '2024-08-03T14:30:00Z'
  },
  {
    role: 'Administrador Financiero',
    users: 2,
    permissions: 38,
    usage: 65,
    effectiveness: 'Media',
    lastUsed: '2024-08-04T11:00:00Z'
  },
  {
    role: 'Consultor/Auditor',
    users: 4,
    permissions: 25,
    usage: 23,
    effectiveness: 'Baja',
    lastUsed: '2024-08-02T13:15:00Z'
  }
];

export default function RoleReports() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Query para datos de actividad (simulado)
  const { data: activityData = mockActivityData } = useQuery({
    queryKey: ['/api/admin-roles/reports/activity', dateRange],
    enabled: false
  });

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'role_created': return 'bg-green-100 text-green-700';
      case 'role_assigned': return 'bg-blue-100 text-blue-700';
      case 'permissions_modified': return 'bg-yellow-100 text-yellow-700';
      case 'access_denied': return 'bg-red-100 text-red-700';
      case 'login_success': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'role_created': return 'Rol Creado';
      case 'role_assigned': return 'Rol Asignado';
      case 'permissions_modified': return 'Permisos Modificados';
      case 'access_denied': return 'Acceso Denegado';
      case 'login_success': return 'Inicio de Sesión';
      default: return 'Otro';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'Alta': return 'bg-green-100 text-green-700';
      case 'Media': return 'bg-yellow-100 text-yellow-700';
      case 'Baja': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reportes y Auditoría
            </h1>
            <p className="text-gray-600 mt-2">
              Analizar el uso y efectividad del sistema de roles
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Programar Reporte
            </Button>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{mockUsageStats.totalUsers}</p>
                  <p className="text-sm text-green-600">+3 esta semana</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Roles Activos</p>
                  <p className="text-3xl font-bold text-gray-900">{mockUsageStats.rolesCreated}</p>
                  <p className="text-sm text-green-600">2 nuevos este mes</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actividad Semanal</p>
                  <p className="text-3xl font-bold text-gray-900">{mockUsageStats.lastWeekActivity}</p>
                  <p className="text-sm text-green-600">+12% vs semana anterior</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accesos Denegados</p>
                  <p className="text-3xl font-bold text-gray-900">{mockUsageStats.accessDeniedCount}</p>
                  <p className="text-sm text-red-600">-5 vs semana anterior</p>
                </div>
                <Eye className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros de tiempo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Período de Análisis</h3>
                <p className="text-sm text-gray-600">Selecciona el rango de fechas para los reportes</p>
              </div>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(range)}
                  >
                    {range === '7d' ? 'Últimos 7 días' :
                     range === '30d' ? 'Últimos 30 días' : 'Últimos 90 días'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de reportes */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Actividad del Sistema</TabsTrigger>
            <TabsTrigger value="usage">Uso de Permisos</TabsTrigger>
            <TabsTrigger value="effectiveness">Efectividad de Roles</TabsTrigger>
            <TabsTrigger value="security">Eventos de Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Registro de Actividad
                </CardTitle>
                <CardDescription>
                  Historial completo de acciones realizadas en el sistema de roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Acción</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Detalles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-900">{activity.user}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">{activity.role}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionTypeColor(activity.type)}>
                            {getActionTypeLabel(activity.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">{activity.details}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos Más Utilizados</CardTitle>
                  <CardDescription>
                    Top 5 permisos con mayor uso en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Ver Dashboards', usage: 95, module: 'Gestión' },
                      { name: 'Gestionar Parques', usage: 87, module: 'Gestión' },
                      { name: 'Gestionar Activos', usage: 73, module: 'Operaciones' },
                      { name: 'Ver Usuarios', usage: 68, module: 'Seguridad' },
                      { name: 'Gestionar Actividades', usage: 62, module: 'Gestión' }
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{permission.name}</p>
                          <p className="text-sm text-gray-600">{permission.module}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{permission.usage}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${permission.usage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Módulos por Actividad</CardTitle>
                  <CardDescription>
                    Uso relativo de cada módulo del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Gestión', usage: 89, color: 'bg-blue-500' },
                      { name: 'Operaciones', usage: 76, color: 'bg-green-500' },
                      { name: 'Finanzas', usage: 54, color: 'bg-yellow-500' },
                      { name: 'Seguridad', usage: 43, color: 'bg-red-500' },
                      { name: 'Marketing', usage: 38, color: 'bg-purple-500' },
                      { name: 'RH', usage: 29, color: 'bg-teal-500' },
                      { name: 'Configuración', usage: 22, color: 'bg-gray-500' }
                    ].map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${module.color}`}></div>
                          <p className="font-medium text-gray-900">{module.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{module.usage}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className={`h-2 rounded-full ${module.color}`}
                              style={{ width: `${module.usage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="effectiveness" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Efectividad de Roles
                </CardTitle>
                <CardDescription>
                  Análisis de la utilización y efectividad de cada rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rol</TableHead>
                      <TableHead>Usuarios</TableHead>
                      <TableHead>Permisos</TableHead>
                      <TableHead>Uso (%)</TableHead>
                      <TableHead>Efectividad</TableHead>
                      <TableHead>Último Uso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRoleEffectiveness.map((role, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{role.role}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.users} usuarios</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-900">{role.permissions}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${role.usage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{role.usage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEffectivenessColor(role.effectiveness)}>
                            {role.effectiveness}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">
                            {formatTimeAgo(role.lastUsed)}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos de Seguridad Recientes</CardTitle>
                  <CardDescription>
                    Últimos eventos relacionados con la seguridad del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityData
                      .filter(a => a.type === 'access_denied' || a.type === 'login_success')
                      .slice(0, 5)
                      .map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-1 rounded-full ${
                            event.type === 'access_denied' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            {event.type === 'access_denied' ? (
                              <Eye className="h-3 w-3 text-red-600" />
                            ) : (
                              <Shield className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.action}</p>
                            <p className="text-xs text-gray-600">{event.user} • {formatTimeAgo(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Seguridad</CardTitle>
                  <CardDescription>
                    Métricas clave de seguridad del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Intentos Fallidos</p>
                        <p className="text-sm text-gray-600">Últimas 24 horas</p>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        3 intentos
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Sesiones Activas</p>
                        <p className="text-sm text-gray-600">Usuarios conectados</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        28 sesiones
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Accesos Denegados</p>
                        <p className="text-sm text-gray-600">Esta semana</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        12 eventos
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Cambios de Roles</p>
                        <p className="text-sm text-gray-600">Este mes</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        5 cambios
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}