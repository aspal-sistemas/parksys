import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, 
  Shield, 
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Database
} from "lucide-react";

// Schema para configuración de políticas
const politicasSchema = z.object({
  // Políticas de contraseña
  minPasswordLength: z.number().min(6).max(50),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  passwordExpiration: z.number().min(0).max(365), // días
  
  // Configuración de sesiones
  sessionTimeout: z.number().min(15).max(1440), // minutos
  maxConcurrentSessions: z.number().min(1).max(10),
  requireReauth: z.boolean(),
  
  // Autenticación de dos factores
  enable2FA: z.boolean(),
  force2FA: z.boolean(),
  
  // Configuración de intentos de login
  maxLoginAttempts: z.number().min(3).max(10),
  lockoutDuration: z.number().min(5).max(60), // minutos
  
  // Configuración de IP
  enableIPWhitelist: z.boolean(),
  enableGeoBlocking: z.boolean(),
  
  // Configuración del sistema
  platformName: z.string().min(1),
  adminEmail: z.string().email(),
  timezone: z.string(),
  language: z.string(),
  
  // Logs de seguridad
  enableSecurityLogs: z.boolean(),
  logFailedLogins: z.boolean(),
  logSuccessfulLogins: z.boolean(),
  logPermissionChanges: z.boolean(),
});

type PoliticasValues = z.infer<typeof politicasSchema>;

export default function Politicas() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("seguridad");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PoliticasValues>({
    resolver: zodResolver(politicasSchema),
    defaultValues: {
      // Políticas de contraseña por defecto
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      passwordExpiration: 90,
      
      // Configuración de sesiones por defecto
      sessionTimeout: 480,
      maxConcurrentSessions: 3,
      requireReauth: false,
      
      // 2FA por defecto
      enable2FA: false,
      force2FA: false,
      
      // Intentos de login por defecto
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      
      // IP por defecto
      enableIPWhitelist: false,
      enableGeoBlocking: false,
      
      // Sistema por defecto
      platformName: "Sistema de Gestión de Parques",
      adminEmail: "admin@parques.gob.mx",
      timezone: "America/Mexico_City",
      language: "es",
      
      // Logs por defecto
      enableSecurityLogs: true,
      logFailedLogins: true,
      logSuccessfulLogins: false,
      logPermissionChanges: true,
    }
  });

  const onSubmit = async (data: PoliticasValues) => {
    setIsSaving(true);
    try {
      // Aquí iría la llamada a la API para guardar las políticas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Políticas actualizadas",
        description: "Las configuraciones se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las políticas",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Settings className="h-6 w-6" />
            Políticas del Sistema
          </CardTitle>
          <CardDescription className="text-orange-700">
            Configure las políticas de seguridad, autenticación y parámetros generales del sistema.
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="seguridad" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seguridad" className="space-y-6">
            {/* Políticas de Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  Políticas de Contraseña
                </CardTitle>
                <CardDescription>
                  Configure los requisitos de seguridad para las contraseñas de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength">Longitud mínima</Label>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      min="6"
                      max="50"
                      {...form.register("minPasswordLength", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiration">Expiración (días)</Label>
                    <Input
                      id="passwordExpiration"
                      type="number"
                      min="0"
                      max="365"
                      {...form.register("passwordExpiration", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requerir mayúsculas</Label>
                      <p className="text-sm text-muted-foreground">Al menos una letra mayúscula</p>
                    </div>
                    <Switch
                      checked={form.watch("requireUppercase")}
                      onCheckedChange={(checked) => form.setValue("requireUppercase", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requerir minúsculas</Label>
                      <p className="text-sm text-muted-foreground">Al menos una letra minúscula</p>
                    </div>
                    <Switch
                      checked={form.watch("requireLowercase")}
                      onCheckedChange={(checked) => form.setValue("requireLowercase", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requerir números</Label>
                      <p className="text-sm text-muted-foreground">Al menos un dígito</p>
                    </div>
                    <Switch
                      checked={form.watch("requireNumbers")}
                      onCheckedChange={(checked) => form.setValue("requireNumbers", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Caracteres especiales</Label>
                      <p className="text-sm text-muted-foreground">Símbolos como @, #, $</p>
                    </div>
                    <Switch
                      checked={form.watch("requireSpecialChars")}
                      onCheckedChange={(checked) => form.setValue("requireSpecialChars", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Sesiones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Gestión de Sesiones
                </CardTitle>
                <CardDescription>
                  Configure el comportamiento de las sesiones de usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tiempo de inactividad (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="15"
                      max="1440"
                      {...form.register("sessionTimeout", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxConcurrentSessions">Sesiones concurrentes máximas</Label>
                    <Input
                      id="maxConcurrentSessions"
                      type="number"
                      min="1"
                      max="10"
                      {...form.register("maxConcurrentSessions", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir reautenticación</Label>
                    <p className="text-sm text-muted-foreground">Para acciones sensibles</p>
                  </div>
                  <Switch
                    checked={form.watch("requireReauth")}
                    onCheckedChange={(checked) => form.setValue("requireReauth", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Autenticación de Dos Factores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Autenticación de Dos Factores (2FA)
                </CardTitle>
                <CardDescription>
                  Configure la autenticación de dos factores para mayor seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar 2FA</Label>
                    <p className="text-sm text-muted-foreground">Permitir que los usuarios activen 2FA</p>
                  </div>
                  <Switch
                    checked={form.watch("enable2FA")}
                    onCheckedChange={(checked) => form.setValue("enable2FA", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Forzar 2FA</Label>
                    <p className="text-sm text-muted-foreground">Obligatorio para todos los usuarios</p>
                  </div>
                  <Switch
                    checked={form.watch("force2FA")}
                    onCheckedChange={(checked) => form.setValue("force2FA", checked)}
                    disabled={!form.watch("enable2FA")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6">
            {/* Configuración General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Configuración General
                </CardTitle>
                <CardDescription>
                  Parámetros básicos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Nombre de la Plataforma</Label>
                    <Input
                      id="platformName"
                      {...form.register("platformName")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email del Administrador</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      {...form.register("adminEmail")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select value={form.watch("timezone")} onValueChange={(value) => form.setValue("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma por Defecto</Label>
                    <Select value={form.watch("language")} onValueChange={(value) => form.setValue("language", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="pt">Portugués</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            {/* Configuración de Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  Registro de Auditoría
                </CardTitle>
                <CardDescription>
                  Configure qué eventos del sistema se deben registrar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar logs de seguridad</Label>
                    <p className="text-sm text-muted-foreground">Registrar todos los eventos de seguridad</p>
                  </div>
                  <Switch
                    checked={form.watch("enableSecurityLogs")}
                    onCheckedChange={(checked) => form.setValue("enableSecurityLogs", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Intentos de login fallidos</Label>
                      <p className="text-sm text-muted-foreground">Registrar intentos de acceso incorrectos</p>
                    </div>
                    <Switch
                      checked={form.watch("logFailedLogins")}
                      onCheckedChange={(checked) => form.setValue("logFailedLogins", checked)}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accesos exitosos</Label>
                      <p className="text-sm text-muted-foreground">Registrar todos los inicios de sesión</p>
                    </div>
                    <Switch
                      checked={form.watch("logSuccessfulLogins")}
                      onCheckedChange={(checked) => form.setValue("logSuccessfulLogins", checked)}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cambios de permisos</Label>
                      <p className="text-sm text-muted-foreground">Registrar modificaciones de roles y permisos</p>
                    </div>
                    <Switch
                      checked={form.watch("logPermissionChanges")}
                      onCheckedChange={(checked) => form.setValue("logPermissionChanges", checked)}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Restablecer
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Políticas
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}