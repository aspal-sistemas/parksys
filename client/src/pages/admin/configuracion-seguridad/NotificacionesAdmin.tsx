import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminSidebarComplete from "@/components/AdminSidebarComplete";
import Header from "@/components/Header";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Save,
  Send,
  Eye,
  EyeOff,
  Users,
  Shield,
  Activity,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Filter,
  Search
} from "lucide-react";

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'system';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  event: string;
  channels: string[];
  enabled: boolean;
  recipients: string[];
}

export default function NotificacionesAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("channels");

  // Canales de notificación
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email_critical',
      name: 'Email - Crítico',
      type: 'email',
      enabled: true,
      priority: 'critical'
    },
    {
      id: 'email_standard',
      name: 'Email - Estándar',
      type: 'email',
      enabled: true,
      priority: 'medium'
    },
    {
      id: 'sms_urgent',
      name: 'SMS - Urgente',
      type: 'sms',
      enabled: false,
      priority: 'high'
    },
    {
      id: 'system_notifications',
      name: 'Notificaciones del Sistema',
      type: 'system',
      enabled: true,
      priority: 'low'
    }
  ]);

  // Reglas de notificación
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'security_breach',
      name: 'Brecha de Seguridad',
      description: 'Intentos de acceso no autorizado detectados',
      event: 'security.breach',
      channels: ['email_critical', 'sms_urgent'],
      enabled: true,
      recipients: ['admin', 'security-team']
    },
    {
      id: 'system_maintenance',
      name: 'Mantenimiento del Sistema',
      description: 'Notificaciones sobre mantenimiento programado',
      event: 'system.maintenance',
      channels: ['email_standard', 'system_notifications'],
      enabled: true,
      recipients: ['all-users']
    },
    {
      id: 'user_registration',
      name: 'Nuevo Usuario Registrado',
      description: 'Cuando un nuevo usuario se registra en el sistema',
      event: 'user.registration',
      channels: ['email_standard'],
      enabled: true,
      recipients: ['hr-team']
    },
    {
      id: 'backup_failure',
      name: 'Falla en Respaldo',
      description: 'Cuando falla un proceso de respaldo automático',
      event: 'backup.failure',
      channels: ['email_critical'],
      enabled: true,
      recipients: ['admin', 'tech-team']
    }
  ]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
    toast({
      title: "Canal actualizado",
      description: "La configuración del canal ha sido modificada",
    });
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
    toast({
      title: "Regla actualizada",
      description: "La regla de notificación ha sido modificada",
    });
  };

  const sendTestNotification = (channelId: string) => {
    toast({
      title: "Notificación de prueba enviada",
      description: `Se ha enviado una notificación de prueba al canal ${channelId}`,
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityName = (priority: string) => {
    const names: Record<string, string> = {
      'critical': 'Crítica',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return names[priority] || priority;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebarComplete />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Bell className="h-6 w-6" />
            Configuración de Notificaciones Administrativas
          </CardTitle>
          <CardDescription className="text-blue-700">
            Configure canales de notificación, reglas de envío y destinatarios para eventos del sistema.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Canales
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Reglas
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Destinatarios
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          {/* Configuración de canales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Canales de Notificación
              </CardTitle>
              <CardDescription>
                Configure los diferentes canales para enviar notificaciones administrativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          channel.enabled ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getChannelIcon(channel.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{channel.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(channel.priority)}>
                              {getPriorityName(channel.priority)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {channel.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestNotification(channel.id)}
                        disabled={!channel.enabled}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Probar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Configuración global de canales */}
              <div className="mt-6 pt-6 border-t space-y-4">
                <h3 className="font-medium">Configuración Global</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-server">Servidor SMTP</Label>
                    <Input id="email-server" defaultValue="smtp.gmail.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-port">Puerto SMTP</Label>
                    <Input id="email-port" type="number" defaultValue="587" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sms-provider">Proveedor SMS</Label>
                    <Select defaultValue="twilio">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo</SelectItem>
                        <SelectItem value="aws">AWS SNS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retry-attempts">Intentos de reenvío</Label>
                    <Input id="retry-attempts" type="number" defaultValue="3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Reglas de notificación */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Reglas de Notificación
                  </CardTitle>
                  <CardDescription>
                    Configure cuándo y cómo enviar notificaciones basadas en eventos del sistema
                  </CardDescription>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                        <div>
                          <h3 className="font-medium">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.event}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Canales:</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.channels.map(channelId => {
                            const channel = channels.find(c => c.id === channelId);
                            return channel ? (
                              <Badge key={channelId} variant="secondary" className="text-xs">
                                {channel.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">Destinatarios:</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.recipients.map(recipient => (
                            <Badge key={recipient} variant="outline" className="text-xs">
                              {recipient}
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

        <TabsContent value="recipients" className="space-y-6">
          {/* Gestión de destinatarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Gestión de Destinatarios
              </CardTitle>
              <CardDescription>
                Configure grupos y listas de destinatarios para las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Grupos Predefinidos</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'admin', name: 'Administradores', count: 3 },
                      { id: 'hr-team', name: 'Equipo de RH', count: 5 },
                      { id: 'tech-team', name: 'Equipo Técnico', count: 4 },
                      { id: 'security-team', name: 'Equipo de Seguridad', count: 2 },
                      { id: 'all-users', name: 'Todos los Usuarios', count: 45 }
                    ].map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.count} miembros</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Listas Personalizadas</h3>
                  <div className="space-y-3">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No hay listas personalizadas</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Crear Lista
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Historial de notificaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Historial de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Registro de todas las notificaciones enviadas en los últimos 30 días
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    timestamp: '2025-01-07 14:30:00',
                    event: 'Brecha de Seguridad',
                    channel: 'Email',
                    recipients: 3,
                    status: 'delivered',
                    priority: 'critical'
                  },
                  {
                    id: 2,
                    timestamp: '2025-01-07 12:15:00',
                    event: 'Mantenimiento del Sistema',
                    channel: 'Email + Sistema',
                    recipients: 45,
                    status: 'delivered',
                    priority: 'medium'
                  },
                  {
                    id: 3,
                    timestamp: '2025-01-07 09:00:00',
                    event: 'Nuevo Usuario Registrado',
                    channel: 'Email',
                    recipients: 5,
                    status: 'failed',
                    priority: 'low'
                  }
                ].map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        notification.status === 'delivered' ? 'bg-green-500' :
                        notification.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{notification.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.timestamp} • {notification.channel} • {notification.recipients} destinatarios
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(notification.priority)}>
                        {getPriorityName(notification.priority)}
                      </Badge>
                      <Badge variant={notification.status === 'delivered' ? 'default' : 'destructive'}>
                        {notification.status === 'delivered' ? 'Entregado' : 'Falló'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones globales */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}