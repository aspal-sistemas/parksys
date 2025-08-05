import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Eye, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function SeguridadDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Seguridad" 
      subtitle="Panel de control del módulo de seguridad y control de acceso"
    >
      <div className="space-y-6">
        {/* Métricas de seguridad */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">7 roles diferentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">+5 en la última hora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intentos Fallidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Sistema</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Seguro</div>
              <p className="text-xs text-muted-foreground">Sin amenazas</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribución de roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Distribución de Roles
              </CardTitle>
              <CardDescription>
                Usuarios asignados por nivel de rol en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Super Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">2</span>
                    <Badge variant="outline" className="text-xs">Nivel 1</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Director General</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">4</span>
                    <Badge variant="outline" className="text-xs">Nivel 2</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Coordinador Parques</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">12</span>
                    <Badge variant="outline" className="text-xs">Nivel 3</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Supervisor Operaciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">18</span>
                    <Badge variant="outline" className="text-xs">Nivel 4</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Especialista Técnico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">25</span>
                    <Badge variant="outline" className="text-xs">Nivel 5</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Asistente Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">21</span>
                    <Badge variant="outline" className="text-xs">Nivel 6</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">Consultor Auditor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">7</span>
                    <Badge variant="outline" className="text-xs">Nivel 7</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Eventos de seguridad y cambios en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Login exitoso</div>
                    <div className="text-xs text-gray-500">Ana García - hace 2 min</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Intento de login fallido</div>
                    <div className="text-xs text-gray-500">Usuario desconocido - hace 15 min</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Cambio de rol</div>
                    <div className="text-xs text-gray-500">Carlos Mendoza - hace 1 hora</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Permisos actualizados</div>
                    <div className="text-xs text-gray-500">Sistema Admin - hace 2 horas</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Sesión terminada</div>
                    <div className="text-xs text-gray-500">Roberto Silva - hace 3 horas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matriz de permisos resumida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Resumen de Permisos por Módulo
            </CardTitle>
            <CardDescription>
              Vista general de los permisos asignados a los roles del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">7</div>
                <div className="text-sm text-gray-600">Configuración</div>
                <div className="text-xs text-gray-500">roles con acceso</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-sm text-gray-600">Gestión</div>
                <div className="text-xs text-gray-500">roles con acceso</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">Finanzas</div>
                <div className="text-xs text-gray-500">roles con acceso</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-gray-600">Seguridad</div>
                <div className="text-xs text-gray-500">roles con acceso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DynamicAdminLayout>
  );
}