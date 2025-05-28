import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
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

// Componentes internos para las secciones de configuración

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
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Accede a la página completa de gestión de usuarios para administrar cuentas, roles y perfiles.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/admin/users'}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ir a Gestión de Usuarios
                  </Button>
                </div>
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
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestión de Permisos y Roles</h3>
                  <p className="text-muted-foreground mb-4">
                    Configura los permisos de acceso para cada rol del sistema y define qué funciones puede realizar cada usuario.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/admin/permissions'}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ir a Permisos y Roles
                  </Button>
                </div>
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
              <CardContent className="space-y-6">
                {/* Políticas de contraseña */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Políticas de Contraseña
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Requisitos Actuales</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Mínimo 8 caracteres</li>
                        <li>• Al menos una mayúscula</li>
                        <li>• Al menos una minúscula</li>
                        <li>• Al menos un número</li>
                        <li>• Expiración: 90 días</li>
                      </ul>
                      <Badge className="mt-3 bg-green-100 text-green-800">Nivel Alto</Badge>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Gestión de Sesiones</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tiempo límite: 60 minutos</li>
                        <li>• Máx. sesiones simultáneas: 3</li>
                        <li>• Reautenticación: Deshabilitada</li>
                        <li>• 2FA: Disponible (opcional)</li>
                      </ul>
                      <Badge variant="secondary" className="mt-3">Configurado</Badge>
                    </Card>
                  </div>
                </div>

                {/* Protección contra ataques */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Protección contra Ataques
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-muted-foreground">Máx. intentos de login</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">15</div>
                      <div className="text-sm text-muted-foreground">Minutos de bloqueo</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">24h</div>
                      <div className="text-sm text-muted-foreground">Logs de seguridad</div>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurar Seguridad Avanzada
                  </Button>
                </div>
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
              <CardContent className="space-y-6">
                {/* Estado actual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Último Respaldo</div>
                    <div className="text-sm text-muted-foreground">Hace 1 día</div>
                    <Badge className="mt-2 bg-green-100 text-green-800">Completado</Badge>
                  </Card>
                  <Card className="p-4 text-center">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Espacio Usado</div>
                    <div className="text-sm text-muted-foreground">45.2 GB de 100 GB</div>
                    <Badge variant="secondary" className="mt-2">54% usado</Badge>
                  </Card>
                  <Card className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-medium">Programación</div>
                    <div className="text-sm text-muted-foreground">Diario a las 02:00</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Activo</Badge>
                  </Card>
                </div>

                {/* Configuración de respaldos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuración Actual</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Respaldos Automáticos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <Badge className="bg-green-100 text-green-800">Habilitado</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Frecuencia:</span>
                          <span className="text-muted-foreground">Diaria</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hora:</span>
                          <span className="text-muted-foreground">02:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retención:</span>
                          <span className="text-muted-foreground">30 días</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Contenido Incluido</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Base de datos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Archivos subidos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Configuraciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Logs del sistema</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3">
                  <Button className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Crear Respaldo Manual
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurar Respaldos
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver Historial
                  </Button>
                </div>
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