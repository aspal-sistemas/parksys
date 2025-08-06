import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Bell, Settings, Users, Mail, AlertTriangle, CheckCircle, BarChart3, Clock, MessageCircle } from "lucide-react";

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  enabled: boolean;
}

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  roles: string[];
  enabled: boolean;
}

export default function NotificacionesAdmin() {
  const [activeTab, setActiveTab] = useState("global");

  // Datos simulados de plantillas
  const templates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Nuevo Usuario Registrado',
      subject: 'Bienvenido al Sistema de Parques',
      content: 'Su cuenta ha sido creada exitosamente. Puede acceder con sus credenciales.',
      type: 'user_creation',
      enabled: true
    },
    {
      id: '2',
      name: 'Mantenimiento Programado',
      subject: 'Mantenimiento del sistema programado',
      content: 'El sistema estará en mantenimiento el {date} de {time_start} a {time_end}.',
      type: 'maintenance',
      enabled: true
    },
    {
      id: '3',
      name: 'Actividad Cancelada',
      subject: 'Actividad {activity_name} ha sido cancelada',
      content: 'Lamentamos informar que la actividad {activity_name} programada para {date} ha sido cancelada.',
      type: 'activity_cancellation',
      enabled: true
    }
  ];

  // Datos simulados de reglas
  const rules: NotificationRule[] = [
    {
      id: '1',
      name: 'Intentos de login fallidos',
      trigger: 'failed_login_attempts >= 3',
      severity: 'high',
      channels: ['email', 'system'],
      roles: ['super-admin', 'director-general'],
      enabled: true
    },
    {
      id: '2',
      name: 'Respaldo completado',
      trigger: 'backup_completed',
      severity: 'low',
      channels: ['system'],
      roles: ['super-admin'],
      enabled: true
    },
    {
      id: '3',
      name: 'Espacio de almacenamiento bajo',
      trigger: 'storage_usage > 85%',
      severity: 'medium',
      channels: ['email', 'system'],
      roles: ['super-admin', 'director-general'],
      enabled: true
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Bell className="h-6 w-6" />
            Sistema de Notificaciones
          </CardTitle>
          <CardDescription className="text-blue-700">
            Configure las notificaciones administrativas, plantillas de mensajes y reglas de escalamiento.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="reglas" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reglas
          </TabsTrigger>
          <TabsTrigger value="canales" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Canales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          {/* Configuración Global */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Global de Notificaciones</CardTitle>
              <CardDescription>
                Configure el comportamiento general del sistema de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones habilitadas</Label>
                      <p className="text-sm text-muted-foreground">Activar el sistema de notificaciones</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones por email</Label>
                      <p className="text-sm text-muted-foreground">Enviar notificaciones por correo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones en tiempo real</Label>
                      <p className="text-sm text-muted-foreground">Mostrar alertas instantáneas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Frecuencia de envío</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-notifications">Máximo por usuario/día</Label>
                    <Input
                      id="max-notifications"
                      type="number"
                      defaultValue="50"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Retención (días)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      defaultValue="90"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-muted-foreground">Enviadas hoy</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.2%</div>
                  <div className="text-sm text-muted-foreground">Tasa de entrega</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-muted-foreground">Fallos hoy</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1,524</div>
                  <div className="text-sm text-muted-foreground">Este mes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-6">
          {/* Plantillas de Notificación */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plantillas de Notificación</CardTitle>
                  <CardDescription>
                    Administre las plantillas de mensajes para diferentes tipos de eventos
                  </CardDescription>
                </div>
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Switch checked={template.enabled} />
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.type}</Badge>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {template.content}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reglas" className="space-y-6">
          {/* Reglas de Notificación */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reglas de Escalamiento</CardTitle>
                  <CardDescription>
                    Configure las reglas automáticas para diferentes tipos de eventos
                  </CardDescription>
                </div>
                <Button>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Switch checked={rule.enabled} />
                        <div>
                          <h3 className="font-medium">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-xs">Canales de notificación</Label>
                        <div className="flex gap-1 mt-1">
                          {rule.channels.map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Roles notificados</Label>
                        <div className="flex gap-1 mt-1">
                          {rule.roles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canales" className="space-y-6">
          {/* Configuración de Canales */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Canales</CardTitle>
              <CardDescription>
                Configure los diferentes canales de entrega de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">Notificaciones por correo electrónico</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Servidor SMTP</Label>
                    <Input defaultValue="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Puerto</Label>
                    <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email remitente</Label>
                    <Input defaultValue="notificaciones@parques.gob.mx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre remitente</Label>
                    <Input defaultValue="Sistema de Parques" />
                  </div>
                </div>
              </div>

              {/* Sistema */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium">Sistema</h3>
                      <p className="text-sm text-muted-foreground">Notificaciones dentro de la aplicación</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mostrar notificaciones toast</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Sonido de notificación</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Badge de contador</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Probar Configuración
        </Button>
        <Button>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}