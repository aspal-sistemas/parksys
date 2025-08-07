import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Grid, Shield } from 'lucide-react';

// Importar componentes existentes
import UsersManagement from './componentes/UsersManagement';
import RolesManagement from './componentes/RolesManagement';
import PermissionsMatrix from './componentes/PermissionsMatrix';

export default function ControlDeAcceso() {
  const [activeSubTab, setActiveSubTab] = useState("usuarios");

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-6 w-6" />
            Control de Acceso al Sistema
          </CardTitle>
          <CardDescription className="text-blue-700">
            Administración completa de usuarios, roles y permisos organizacionales.
            Gestiona el acceso a los 7 módulos del sistema con control jerárquico.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sub-navegación */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permisos" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="roles">
          <RolesManagement />
        </TabsContent>

        <TabsContent value="permisos">
          <PermissionsMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}