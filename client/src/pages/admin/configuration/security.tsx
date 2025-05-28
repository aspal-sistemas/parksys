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
  EyeOff
} from "lucide-react";

// Schema para configuración de seguridad
const securitySchema = z.object({
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
  
  // Logs de seguridad
  enableSecurityLogs: z.boolean(),
  logFailedLogins: z.boolean(),
  logSuccessfulLogins: z.boolean(),
  logPermissionChanges: z.boolean(),
});

type SecurityValues = z.infer<typeof securitySchema>;

const SecuritySettings = () => {
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      // Políticas de contraseña por defecto
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      passwordExpiration: 90,
      
      // Configuración de sesiones
      sessionTimeout: 60,
      maxConcurrentSessions: 3,
      requireReauth: false,
      
      // 2FA
      enable2FA: false,
      force2FA: false,
      
      // Login attempts
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      
      // IP y geo
      enableIPWhitelist: false,
      enableGeoBlocking: false,
      
      // Logs
      enableSecurityLogs: true,
      logFailedLogins: true,
      logSuccessfulLogins: false,
      logPermissionChanges: true,
    },
  });

  const onSubmit = async (data: SecurityValues) => {
    setIsSaving(true);
    try {
      // Aquí se implementaría la llamada a la API para guardar la configuración
      console.log("Guardando configuración de seguridad:", data);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Las políticas de seguridad han sido actualizadas correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de seguridad.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrengthLevel = () => {
    const values = form.getValues();
    let score = 0;
    
    if (values.minPasswordLength >= 8) score++;
    if (values.minPasswordLength >= 12) score++;
    if (values.requireUppercase) score++;
    if (values.requireLowercase) score++;
    if (values.requireNumbers) score++;
    if (values.requireSpecialChars) score++;
    
    if (score <= 2) return { level: "Baja", color: "destructive" };
    if (score <= 4) return { level: "Media", color: "yellow" };
    return { level: "Alta", color: "green" };
  };

  const strengthLevel = getPasswordStrengthLevel();

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Políticas de Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Políticas de Contraseña
            </CardTitle>
            <CardDescription>
              Define los requisitos de seguridad para las contraseñas de usuarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireUppercase"
                  {...form.register("requireUppercase")}
                />
                <Label htmlFor="requireUppercase" className="text-sm">Mayúsculas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireLowercase"
                  {...form.register("requireLowercase")}
                />
                <Label htmlFor="requireLowercase" className="text-sm">Minúsculas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireNumbers"
                  {...form.register("requireNumbers")}
                />
                <Label htmlFor="requireNumbers" className="text-sm">Números</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireSpecialChars"
                  {...form.register("requireSpecialChars")}
                />
                <Label htmlFor="requireSpecialChars" className="text-sm">Símbolos</Label>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Nivel de seguridad de contraseña:</span>
              <Badge variant={strengthLevel.color as any}>{strengthLevel.level}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Sesiones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Gestión de Sesiones
            </CardTitle>
            <CardDescription>
              Controla el comportamiento de las sesiones de usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Tiempo límite (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="15"
                  max="1440"
                  {...form.register("sessionTimeout", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentSessions">Sesiones simultáneas</Label>
                <Input
                  id="maxConcurrentSessions"
                  type="number"
                  min="1"
                  max="10"
                  {...form.register("maxConcurrentSessions", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="requireReauth"
                  {...form.register("requireReauth")}
                />
                <Label htmlFor="requireReauth" className="text-sm">Reautenticación requerida</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autenticación de Dos Factores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Autenticación de Dos Factores (2FA)
            </CardTitle>
            <CardDescription>
              Añade una capa extra de seguridad con 2FA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable2FA"
                  {...form.register("enable2FA")}
                />
                <Label htmlFor="enable2FA">Habilitar 2FA</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="force2FA"
                  {...form.register("force2FA")}
                  disabled={!form.watch("enable2FA")}
                />
                <Label htmlFor="force2FA">Forzar 2FA para todos los usuarios</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Avanzada */}
        <Card>
          <CardHeader>
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-5 h-5" />
              Configuración Avanzada
              {showAdvanced ? <EyeOff className="w-4 h-4 ml-auto" /> : <Eye className="w-4 h-4 ml-auto" />}
            </CardTitle>
            <CardDescription>
              Configuraciones adicionales de seguridad y monitoreo
            </CardDescription>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <Separator />
              
              {/* Protección contra ataques de fuerza bruta */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Protección contra Ataques de Fuerza Bruta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Máx. intentos de login</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="3"
                      max="10"
                      {...form.register("maxLoginAttempts", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Duración de bloqueo (min)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      min="5"
                      max="60"
                      {...form.register("lockoutDuration", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Configuración de IP y geolocalización */}
              <div className="space-y-3">
                <h4 className="font-medium">Restricciones de Acceso</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableIPWhitelist"
                      {...form.register("enableIPWhitelist")}
                    />
                    <Label htmlFor="enableIPWhitelist">Lista blanca de IPs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableGeoBlocking"
                      {...form.register("enableGeoBlocking")}
                    />
                    <Label htmlFor="enableGeoBlocking">Bloqueo geográfico</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Logs de seguridad */}
              <div className="space-y-3">
                <h4 className="font-medium">Registro de Actividad</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableSecurityLogs"
                      {...form.register("enableSecurityLogs")}
                    />
                    <Label htmlFor="enableSecurityLogs">Habilitar logs de seguridad</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="logFailedLogins"
                      {...form.register("logFailedLogins")}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                    <Label htmlFor="logFailedLogins">Registrar intentos fallidos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="logSuccessfulLogins"
                      {...form.register("logSuccessfulLogins")}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                    <Label htmlFor="logSuccessfulLogins">Registrar logins exitosos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="logPermissionChanges"
                      {...form.register("logPermissionChanges")}
                      disabled={!form.watch("enableSecurityLogs")}
                    />
                    <Label htmlFor="logPermissionChanges">Registrar cambios de permisos</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;