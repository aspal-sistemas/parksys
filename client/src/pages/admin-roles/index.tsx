import React from 'react';
import { Link } from 'wouter';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Users, Settings, Eye, UserCog, BarChart3, 
  TreePine, Building2, Calendar, CreditCard, MessageSquare, 
  Activity, Home, ArrowRight
} from 'lucide-react';

export default function AdminRolesIndex() {
  return (
    <DynamicAdminLayout 
      title="Sistema de Roles - Entorno de Pruebas" 
      subtitle="Explore y pruebe el sistema de roles dinámico con diferentes niveles de acceso"
    >
      <div className="space-y-8">
        {/* Información del sistema */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              Bienvenido al Sistema de Roles Dinámico
            </CardTitle>
            <CardDescription className="text-blue-700">
              Este entorno le permite probar el sistema de permisos basado en roles con 7 niveles jerárquicos. 
              Utilice el selector de roles en la esquina superior derecha para cambiar entre diferentes vistas de usuario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                <Eye className="h-3 w-3 mr-1" />
                Modo Vista Previa
              </Badge>
              <Badge variant="outline" className="text-green-700 border-green-300">
                7 Roles Disponibles
              </Badge>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                Sidebar Dinámico
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dashboards por módulo */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboards por Módulo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin-roles/dashboard/configuracion">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-600">
                    <Settings className="h-5 w-5" />
                    Configuración
                  </CardTitle>
                  <CardDescription>
                    Panel de control del sistema y configuraciones generales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Sistema
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/gestion">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <UserCog className="h-5 w-5" />
                    Gestión
                  </CardTitle>
                  <CardDescription>
                    Parques, actividades, voluntarios y gestión operativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                      Operaciones
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/operaciones">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Building2 className="h-5 w-5" />
                    Operaciones
                  </CardTitle>
                  <CardDescription>
                    Eventos, concesiones y operaciones de parques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      Eventos
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/finanzas">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <CreditCard className="h-5 w-5" />
                    Finanzas
                  </CardTitle>
                  <CardDescription>
                    Presupuestos, gastos, ingresos y patrocinios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                      Económico
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/marketing">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <MessageSquare className="h-5 w-5" />
                    Marketing
                  </CardTitle>
                  <CardDescription>
                    Comunicaciones, campañas y espacios publicitarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                      Promoción
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/recursos-humanos">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-teal-600">
                    <Users className="h-5 w-5" />
                    Recursos Humanos
                  </CardTitle>
                  <CardDescription>
                    Empleados, nómina, vacaciones y control de asistencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                      Personal
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin-roles/dashboard/seguridad">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="h-5 w-5" />
                    Seguridad
                  </CardTitle>
                  <CardDescription>
                    Roles, permisos, usuarios y auditoría del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      Control Acceso
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Herramientas de gestión */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Herramientas de Gestión</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin-roles/users">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Usuarios del Sistema
                  </CardTitle>
                  <CardDescription>
                    Gestione usuarios y asigne roles específicos
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin-roles/roles">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Gestión de Roles
                  </CardTitle>
                  <CardDescription>
                    Crear, editar y administrar roles del sistema
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin-roles/permissions/matrix">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Matriz de Permisos
                  </CardTitle>
                  <CardDescription>
                    Configure permisos granulares por módulo
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Instrucciones de uso */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              🚀 Instrucciones de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>Use el <strong>selector de roles</strong> en la esquina superior derecha para cambiar entre diferentes niveles de usuario</li>
              <li>Observe cómo el <strong>sidebar cambia dinámicamente</strong> según los permisos del rol seleccionado</li>
              <li>Explore los <strong>dashboards específicos</strong> de cada módulo haciendo clic en los elementos del sidebar</li>
              <li>Pruebe las <strong>herramientas de gestión</strong> para administrar usuarios, roles y permisos</li>
              <li>Cada rol tiene diferentes <strong>niveles de acceso</strong> desde Super Admin hasta Consultor Auditor</li>
            </ol>
          </CardContent>
        </Card>

        {/* Componente de prueba del sistema de roles */}
        <div className="mt-8">
          <RoleTestComponent />
        </div>
      </div>
    </DynamicAdminLayout>
  );
}

// Importar el componente de prueba
import { RoleTestComponent } from '@/components/RoleTestComponent';