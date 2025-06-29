import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Activity, Settings } from 'lucide-react';
import SecurityDashboard from './SecurityDashboard';
import ChangePassword from './ChangePassword';
import AdminLayout from '@/components/AdminLayout';

export default function SecurityModule() {
  return (
    <AdminLayout title="Módulo de Seguridad" subtitle="Centro de control de seguridad y monitoreo del sistema">
      <div className="space-y-6">
        {/* Navegación por pestañas */}
        <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Contraseña</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Auditoría</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="password">
          <ChangePassword />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>
                Historial completo de eventos de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Función en Desarrollo
                </h3>
                <p className="text-gray-500">
                  El registro de auditoría estará disponible próximamente con filtros avanzados y exportación de reportes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Ajustes globales de políticas de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configuración Avanzada
                </h3>
                <p className="text-gray-500">
                  Las configuraciones de seguridad estarán disponibles próximamente para administradores del sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}