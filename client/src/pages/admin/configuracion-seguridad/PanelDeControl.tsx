import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Database,
  Server,
  Clock,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';

export default function PanelDeControl() {
  // Datos simulados para el dashboard
  const securityMetrics = {
    activeUsers: 47,
    failedLogins: 3,
    systemHealth: 98,
    lastBackup: '2025-01-10 02:00:00',
    activeAlerts: 2,
    systemUptime: 99.9
  };

  const recentActivity = [
    {
      id: 1,
      user: 'Ana García',
      action: 'Modificó permisos de usuario',
      time: '10:30',
      severity: 'medium',
      details: 'Usuario: Carlos Ruiz'
    },
    {
      id: 2,
      user: 'Sistema',
      action: 'Respaldo automático completado',
      time: '02:00',
      severity: 'low',
      details: 'Base de datos principal'
    },
    {
      id: 3,
      user: 'Luis Martínez',
      action: 'Intento de acceso fallido',
      time: '09:15',
      severity: 'high',
      details: 'IP: 192.168.1.105'
    },
    {
      id: 4,
      user: 'María López',
      action: 'Creó nuevo usuario',
      time: '08:45',
      severity: 'low',
      details: 'Usuario: Pedro Sánchez'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Espacio de respaldo bajo',
      description: 'El espacio de almacenamiento de respaldos está al 85%',
      time: '1h ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Actualización disponible',
      description: 'Nueva versión del sistema disponible (v2.1.1)',
      time: '3h ago'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +3 desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intentos Fallidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.systemHealth}%</div>
            <Progress value={securityMetrics.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Activo</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas del sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-1 rounded-full ${
                  alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {alert.type === 'warning' ? 
                    <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Todo está funcionando correctamente
                </h3>
                <p className="text-gray-500">
                  No hay alertas que requieran atención en este momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Eventos y acciones más recientes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge 
                    variant="outline" 
                    className={`${getSeverityColor(activity.severity)} text-xs`}
                  >
                    {activity.severity === 'high' ? 'Alto' : 
                     activity.severity === 'medium' ? 'Medio' : 'Bajo'}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.action}</h4>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} - {activity.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Ver toda la actividad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-green-600" />
            Estado de Servicios
          </CardTitle>
          <CardDescription>
            Monitoreo en tiempo real de los servicios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <span className="font-medium">Base de Datos</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">Seguridad</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Respaldos</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Atención</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}