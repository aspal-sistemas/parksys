import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, Users, Settings, BarChart, 
  UserCheck, Lock, Activity, Plus,
  Eye, Edit, FileText, AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';

// Dashboard principal del módulo de roles
export default function AdminRolesDashboard() {
  const { data: roleStats } = useQuery({
    queryKey: ['/api/admin-roles/stats'],
    enabled: false // Deshabilitado por ahora
  });

  // Datos simulados para desarrollo
  const mockStats = {
    totalRoles: 10,
    activeUsers: 45,
    pendingAssignments: 3,
    recentActivity: 12
  };

  const moduleCards = [
    {
      title: "Gestión de Roles",
      description: "Crear, editar y administrar roles del sistema",
      icon: Shield,
      path: "/admin-roles/roles",
      color: "bg-blue-500",
      count: mockStats.totalRoles
    },
    {
      title: "Asignación de Usuarios",
      description: "Asignar roles a usuarios y gestionar permisos",
      icon: UserCheck,
      path: "/admin-roles/users",
      color: "bg-green-500",
      count: mockStats.activeUsers
    },
    {
      title: "Matriz de Permisos",
      description: "Visualizar y configurar permisos por módulo",
      icon: Lock,
      path: "/admin-roles/permissions",
      color: "bg-purple-500",
      count: "7 módulos"
    },
    {
      title: "Configuración",
      description: "Configurar políticas y plantillas del sistema",
      icon: Settings,
      path: "/admin-roles/settings",
      color: "bg-orange-500",
      count: "4 políticas"
    },
    {
      title: "Reportes y Auditoría",
      description: "Analizar uso y actividad del sistema de roles",
      icon: BarChart,
      path: "/admin-roles/reports",
      color: "bg-teal-500",
      count: mockStats.recentActivity
    },
    {
      title: "Testing y Simulación",
      description: "Probar configuraciones y simular escenarios",
      icon: Activity,
      path: "/admin-roles/testing",
      color: "bg-indigo-500",
      count: "3 escenarios"
    }
  ];

  const quickActions = [
    {
      title: "Crear Nuevo Rol",
      description: "Definir un nuevo rol con permisos específicos",
      icon: Plus,
      path: "/admin-roles/roles/create",
      variant: "default"
    },
    {
      title: "Asignar Roles Masivamente",
      description: "Asignar roles a múltiples usuarios",
      icon: Users,
      path: "/admin-roles/users/bulk-assign",
      variant: "outline"
    },
    {
      title: "Ver Matriz de Permisos",
      description: "Visualizar todos los permisos por rol",
      icon: Eye,
      path: "/admin-roles/permissions/matrix",
      variant: "outline"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Rol 'Coordinador de Parques' creado",
      user: "Admin Sistema",
      time: "Hace 2 horas",
      type: "create"
    },
    {
      id: 2,
      action: "Permisos actualizados para 'Operador'",
      user: "Director General",
      time: "Hace 4 horas",
      type: "update"
    },
    {
      id: 3,
      action: "Usuario 'Juan Pérez' asignado como 'Instructor'",
      user: "Coordinador RH",
      time: "Hace 6 horas",
      type: "assign"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Roles y Permisos
            </h1>
            <p className="text-gray-600 mt-2">
              Módulo independiente para desarrollo y testing del sistema de roles
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-4 h-4 mr-1" />
            Módulo en Desarrollo
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Roles</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.totalRoles}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Asignaciones Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.pendingAssignments}</p>
                </div>
                <UserCheck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actividad Reciente</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.recentActivity}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={card.path}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.color} text-white`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{card.count}</Badge>
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Ejecutar acciones comunes del sistema de roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <Link href={action.path}>
                    <Button variant={action.variant as any} size="sm">
                      Ir
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones realizadas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'create' ? 'bg-green-100' :
                    activity.type === 'update' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'create' ? (
                      <Plus className="h-3 w-3 text-green-600" />
                    ) : activity.type === 'update' ? (
                      <Edit className="h-3 w-3 text-blue-600" />
                    ) : (
                      <UserCheck className="h-3 w-3 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
              <Link href="/admin-roles/reports/audit">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Registro Completo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}