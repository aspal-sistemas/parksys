import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminSidebarComplete from "@/components/AdminSidebarComplete";
import Header from "@/components/Header";
import { 
  Shield, 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Save,
  RotateCcw,
  Info,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Users,
  FileText
} from "lucide-react";

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  category: string;
}

export default function Politicas() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("passwords");
  const [hasChanges, setHasChanges] = useState(false);

  // Configuración de políticas de contraseñas
  const [passwordPolicies, setPasswordPolicies] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    maxAge: 90,
    lockoutAttempts: 3,
    lockoutDuration: 30,
    requireMFA: false,
    sessionTimeout: 480, // 8 horas en minutos
  });

  // Políticas de seguridad
  const securityPolicies: SecurityPolicy[] = [
    {
      id: 'auto_logout',
      name: 'Cierre automático de sesión',
      description: 'Cerrar sesión automáticamente después de inactividad',
      enabled: true,
      level: 'medium',
      category: 'session'
    },
    {
      id: 'ip_restriction',
      name: 'Restricción por IP',
      description: 'Limitar acceso desde direcciones IP específicas',
      enabled: false,
      level: 'high',
      category: 'access'
    },
    {
      id: 'audit_logging',
      name: 'Registro de auditoría',
      description: 'Registrar todas las acciones de usuario',
      enabled: true,
      level: 'high',
      category: 'audit'
    },
    {
      id: 'file_upload_scan',
      name: 'Escaneo de archivos',
      description: 'Verificar archivos subidos en busca de malware',
      enabled: true,
      level: 'medium',
      category: 'upload'
    },
    {
      id: 'data_encryption',
      name: 'Cifrado de datos',
      description: 'Cifrar datos sensibles en la base de datos',
      enabled: true,
      level: 'high',
      category: 'data'
    }
  ];

  const updatePasswordPolicy = (field: string, value: any) => {
    setPasswordPolicies(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleSecurityPolicy = (policyId: string) => {
    // Aquí iría la lógica para actualizar las políticas de seguridad
    setHasChanges(true);
    toast({
      title: "Política actualizada",
      description: "Los cambios se aplicarán en la próxima sesión",
    });
  };

  const saveChanges = () => {
    // Aquí iría la lógica para guardar en el backend
    setHasChanges(false);
    toast({
      title: "Políticas guardadas",
      description: "Todas las políticas de seguridad han sido actualizadas",
    });
  };

  const resetToDefaults = () => {
    setPasswordPolicies({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
      maxAge: 90,
      lockoutAttempts: 3,
      lockoutDuration: 30,
      requireMFA: false,
      sessionTimeout: 480,
    });
    setHasChanges(true);
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado las políticas por defecto",
    });
  };

  const getPolicyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'session': 'Sesión',
      'access': 'Acceso',
      'audit': 'Auditoría',
      'upload': 'Archivos',
      'data': 'Datos'
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebarComplete />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Shield className="h-6 w-6" />
            Políticas de Seguridad del Sistema
          </CardTitle>
          <CardDescription className="text-red-700">
            Configure las políticas de seguridad, contraseñas y control de acceso para garantizar la protección del sistema.
          </CardDescription>
        </CardHeader>
        {hasChanges && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Tienes cambios sin guardar
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="passwords" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Contraseñas
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Acceso
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cumplimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passwords" className="space-y-6">
          {/* Políticas de contraseñas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Políticas de Contraseñas
              </CardTitle>
              <CardDescription>
                Configure los requisitos de seguridad para las contraseñas de usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Requisitos de contraseña</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Longitud mínima</Label>
                    <Input
                      id="min-length"
                      type="number"
                      min="6"
                      max="32"
                      value={passwordPolicies.minLength}
                      onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requiere mayúsculas</Label>
                      <p className="text-sm text-muted-foreground">Al menos una letra mayúscula (A-Z)</p>
                    </div>
                    <Switch
                      checked={passwordPolicies.requireUppercase}
                      onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requiere minúsculas</Label>
                      <p className="text-sm text-muted-foreground">Al menos una letra minúscula (a-z)</p>
                    </div>
                    <Switch
                      checked={passwordPolicies.requireLowercase}
                      onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requiere números</Label>
                      <p className="text-sm text-muted-foreground">Al menos un dígito (0-9)</p>
                    </div>
                    <Switch
                      checked={passwordPolicies.requireNumbers}
                      onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requiere caracteres especiales</Label>
                      <p className="text-sm text-muted-foreground">Al menos un símbolo (!@#$%^&*)</p>
                    </div>
                    <Switch
                      checked={passwordPolicies.requireSpecialChars}
                      onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Políticas de uso</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prevent-reuse">Prevenir reutilización (últimas contraseñas)</Label>
                    <Input
                      id="prevent-reuse"
                      type="number"
                      min="0"
                      max="24"
                      value={passwordPolicies.preventReuse}
                      onChange={(e) => updatePasswordPolicy('preventReuse', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-age">Vigencia máxima (días)</Label>
                    <Input
                      id="max-age"
                      type="number"
                      min="0"
                      max="365"
                      value={passwordPolicies.maxAge}
                      onChange={(e) => updatePasswordPolicy('maxAge', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockout-attempts">Intentos fallidos antes de bloquear</Label>
                    <Input
                      id="lockout-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={passwordPolicies.lockoutAttempts}
                      onChange={(e) => updatePasswordPolicy('lockoutAttempts', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockout-duration">Duración del bloqueo (minutos)</Label>
                    <Input
                      id="lockout-duration"
                      type="number"
                      min="5"
                      max="1440"
                      value={passwordPolicies.lockoutDuration}
                      onChange={(e) => updatePasswordPolicy('lockoutDuration', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticación de dos factores</Label>
                      <p className="text-sm text-muted-foreground">Requerir MFA para todos los usuarios</p>
                    </div>
                    <Switch
                      checked={passwordPolicies.requireMFA}
                      onCheckedChange={(checked) => updatePasswordPolicy('requireMFA', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa de la política */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Vista previa de la política</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Las contraseñas deben tener al menos {passwordPolicies.minLength} caracteres</p>
                  {passwordPolicies.requireUppercase && <p>• Debe incluir al menos una letra mayúscula</p>}
                  {passwordPolicies.requireLowercase && <p>• Debe incluir al menos una letra minúscula</p>}
                  {passwordPolicies.requireNumbers && <p>• Debe incluir al menos un número</p>}
                  {passwordPolicies.requireSpecialChars && <p>• Debe incluir al menos un carácter especial</p>}
                  <p>• No se pueden reutilizar las últimas {passwordPolicies.preventReuse} contraseñas</p>
                  <p>• Las contraseñas expiran después de {passwordPolicies.maxAge} días</p>
                  <p>• La cuenta se bloquea después de {passwordPolicies.lockoutAttempts} intentos fallidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          {/* Control de acceso y sesiones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Control de Acceso y Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Tiempo límite de sesión (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={passwordPolicies.sessionTimeout}
                      onChange={(e) => updatePasswordPolicy('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sesiones concurrentes</Label>
                      <p className="text-sm text-muted-foreground">Permitir múltiples sesiones por usuario</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Recordar dispositivo</Label>
                      <p className="text-sm text-muted-foreground">Permitir recordar dispositivos confiables</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Restricciones geográficas</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Restricción por país</Label>
                      <p className="text-sm text-muted-foreground">Limitar acceso por ubicación geográfica</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Países permitidos</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar países" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mx">México</SelectItem>
                        <SelectItem value="us">Estados Unidos</SelectItem>
                        <SelectItem value="ca">Canadá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Políticas de seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Políticas de Seguridad Generales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={() => toggleSecurityPolicy(policy.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{policy.name}</h3>
                          <Badge className={getPolicyLevelColor(policy.level)}>
                            {policy.level === 'high' ? 'Alta' : policy.level === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(policy.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Cumplimiento normativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Cumplimiento Normativo
              </CardTitle>
              <CardDescription>
                Configuraciones para cumplir con regulaciones y estándares de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Estándares de cumplimiento</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>GDPR (Reglamento General de Protección de Datos)</Label>
                      <p className="text-sm text-muted-foreground">Cumplimiento con normativa europea</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LFPDPPP (Ley Federal de Protección de Datos)</Label>
                      <p className="text-sm text-muted-foreground">Cumplimiento con normativa mexicana</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ley de Transparencia</Label>
                      <p className="text-sm text-muted-foreground">Requisitos de transparencia gubernamental</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Retención de datos</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Período de retención (años)</Label>
                    <Input
                      id="data-retention"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audit-retention">Retención de auditoría (años)</Label>
                    <Input
                      id="audit-retention"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="7"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Eliminación automática</Label>
                      <p className="text-sm text-muted-foreground">Borrar datos vencidos automáticamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-indigo-900">Aviso de Cumplimiento</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      El sistema está configurado para cumplir con las principales normativas de protección de datos 
                      y transparencia aplicables en México. Los cambios en estas políticas pueden afectar el 
                      cumplimiento legal.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción globales */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restablecer Todo
        </Button>
        <Button onClick={saveChanges} disabled={!hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Todas las Políticas
        </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}