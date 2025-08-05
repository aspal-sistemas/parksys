import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function ConfiguracionDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Configuración" 
      subtitle="Panel de control del módulo de configuración del sistema"
    >
      <div className="space-y-6">
        {/* Resumen de estado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configuraciones</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Parámetros configurados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base de Datos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Salud del sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Óptima</div>
              <p className="text-xs text-muted-foreground">Sin incidentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Estado del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Estado de Configuraciones
              </CardTitle>
              <CardDescription>
                Resumen del estado de las configuraciones críticas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Configuración de Email</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Activo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Base de Datos</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Backup Automático</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Advertencia</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API Externa</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Operativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Actividad de Usuarios
              </CardTitle>
              <CardDescription>
                Estadísticas recientes de actividad de usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usuarios conectados</span>
                  <span className="text-2xl font-bold text-blue-600">34</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nuevos registros hoy</span>
                  <span className="text-2xl font-bold text-green-600">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sesiones activas</span>
                  <span className="text-2xl font-bold text-purple-600">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tiempo promedio sesión</span>
                  <span className="text-2xl font-bold text-orange-600">24m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas y configuraciones de uso frecuente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Gestionar Usuarios</span>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Settings className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Configuraciones</span>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Database className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Base de Datos</span>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Shield className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-sm font-medium">Seguridad</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DynamicAdminLayout>
  );
}