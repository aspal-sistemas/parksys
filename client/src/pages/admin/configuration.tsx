import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  Shield, 
  Database,
  Activity,
  Lock,
  HardDrive,
  ExternalLink
} from "lucide-react";

// Importar las páginas existentes y nuevas
import SecuritySettings from "./configuration/security";
import BackupSettings from "./configuration/backups";

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Configuración
            </h1>
            <p className="text-muted-foreground mt-2">
              Centro de control para administrar usuarios, seguridad y ajustes del sistema
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Acceso Administrador
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos y Roles
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="backups" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Respaldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>
                  Administra usuarios, crea nuevas cuentas y gestiona información de perfiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersPage />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permisos y Roles
                </CardTitle>
                <CardDescription>
                  Configura los permisos de acceso para cada rol del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionsPage />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Configuración de Seguridad
                </CardTitle>
                <CardDescription>
                  Administra políticas de seguridad, autenticación y accesos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecuritySettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Gestión de Respaldos
                </CardTitle>
                <CardDescription>
                  Configura respaldos automáticos y gestiona copias de seguridad de la información
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackupSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Nota para actividad de usuarios - mantener para futura implementación */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-5 h-5" />
              Actividad de Usuarios
            </CardTitle>
            <CardDescription>
              Esta sección será implementada próximamente para monitorear la actividad de los usuarios en el sistema
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ConfigurationPage;