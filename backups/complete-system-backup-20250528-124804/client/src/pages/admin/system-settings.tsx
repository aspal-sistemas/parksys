import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Globe, 
  Clock, 
  Mail, 
  Database, 
  Shield,
  Save,
  RefreshCw
} from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra la configuración general de la plataforma
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Settings className="w-4 h-4 mr-2" />
          Sistema Operativo
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuración básica de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Nombre de la Plataforma</Label>
                <Input 
                  id="platform-name" 
                  defaultValue="Sistema de Gestión de Parques" 
                  placeholder="Nombre de la plataforma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-version">Versión del Sistema</Label>
                <Input 
                  id="platform-version" 
                  defaultValue="2.1.0" 
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email del Administrador</Label>
                <Input 
                  id="admin-email" 
                  type="email"
                  defaultValue="admin@parques.gob.mx" 
                  placeholder="admin@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Email de Soporte</Label>
                <Input 
                  id="support-email" 
                  type="email"
                  defaultValue="soporte@parques.gob.mx" 
                  placeholder="soporte@ejemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Tiempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Configuración de Tiempo
            </CardTitle>
            <CardDescription>
              Zona horaria y formatos de fecha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Input 
                  id="timezone" 
                  defaultValue="America/Mexico_City" 
                  placeholder="Zona horaria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Formato de Fecha</Label>
                <Input 
                  id="date-format" 
                  defaultValue="DD/MM/YYYY" 
                  placeholder="Formato de fecha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-format">Formato de Hora</Label>
                <Input 
                  id="time-format" 
                  defaultValue="24h" 
                  placeholder="Formato de hora"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma del Sistema</Label>
                <Input 
                  id="language" 
                  defaultValue="Español (México)" 
                  placeholder="Idioma"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuración de Email
            </CardTitle>
            <CardDescription>
              Configuración del servidor SMTP para notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input 
                  id="smtp-host" 
                  placeholder="smtp.gmail.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Puerto SMTP</Label>
                <Input 
                  id="smtp-port" 
                  type="number"
                  placeholder="587" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">Usuario SMTP</Label>
                <Input 
                  id="smtp-user" 
                  type="email"
                  placeholder="usuario@ejemplo.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Contraseña SMTP</Label>
                <Input 
                  id="smtp-password" 
                  type="password"
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="smtp-ssl" />
              <Label htmlFor="smtp-ssl">Usar SSL/TLS</Label>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Base de Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Información de Base de Datos
            </CardTitle>
            <CardDescription>
              Estado y configuración de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado de Conexión</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    Conectado
                  </Badge>
                  <span className="text-sm text-muted-foreground">PostgreSQL</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Versión de Base de Datos</Label>
                <Input 
                  value="PostgreSQL 15.2" 
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Tamaño de Base de Datos</Label>
                <Input 
                  value="245 MB" 
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Último Respaldo</Label>
                <Input 
                  value="27/05/2025 08:30" 
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configuración de Seguridad
            </CardTitle>
            <CardDescription>
              Configuración de políticas de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir contraseñas seguras</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir al menos 8 caracteres con mayúsculas, minúsculas y números
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Caducidad de sesión automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Cerrar sesión automáticamente después de inactividad
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registro de actividad</Label>
                  <p className="text-sm text-muted-foreground">
                    Mantener logs detallados de todas las acciones
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Tiempo límite de sesión (minutos)</Label>
                  <Input 
                    id="session-timeout" 
                    type="number"
                    defaultValue="30" 
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Intentos máximos de login</Label>
                  <Input 
                    id="max-login-attempts" 
                    type="number"
                    defaultValue="5" 
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Configuración
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Restaurar Valores por Defecto
          </Button>
        </div>
      </div>
    </div>
  );
}