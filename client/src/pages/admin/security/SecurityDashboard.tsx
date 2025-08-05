import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Eye, 
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SecurityStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  successRate: number;
  activeLockouts: number;
  activeUsers: number;
}

interface LoginAttempt {
  id: number;
  username: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  attemptedAt: string;
}

interface UserActivity {
  id: number;
  userId: number;
  username: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: any;
  timestamp: string;
}

export default function SecurityDashboard() {
  const [timeRange, setTimeRange] = useState(30);

  // Obtener estadísticas de seguridad
  const { data: stats, isLoading: statsLoading } = useQuery<SecurityStats>({
    queryKey: ['/api/security/admin/stats', timeRange],
    queryFn: () => fetch(`/api/security/admin/stats?days=${timeRange}`).then(res => res.json())
  });

  // Obtener actividad sospechosa
  const { data: suspiciousActivity, isLoading: suspiciousLoading } = useQuery<LoginAttempt[]>({
    queryKey: ['/api/security/admin/suspicious-activity'],
    queryFn: () => fetch('/api/security/admin/suspicious-activity?hours=24').then(res => res.json())
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Seguridad</h1>
          <p className="text-gray-600 mt-2">
            Monitoreo y gestión de la seguridad del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 días
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 días
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 días
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accesos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Exitosos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.successfulLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.successRate?.toFixed(1) || 0}% tasa de éxito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalLogins ? ((stats.failedLogins / stats.totalLogins) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Bloqueadas</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.activeLockouts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actualmente activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <Shield className={`h-4 w-4 ${(stats?.activeLockouts || 0) === 0 ? 'text-green-500' : 'text-yellow-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={(stats?.activeLockouts || 0) === 0 ? "default" : "secondary"}>
                {(stats?.activeLockouts || 0) === 0 ? "Seguro" : "Alerta"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema {(stats?.activeLockouts || 0) === 0 ? "protegido" : "monitoreado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="suspicious">Actividad Sospechosa</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad del Sistema</CardTitle>
              <CardDescription>
                Registro de eventos de seguridad más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    Próximamente: Visualización detallada de la actividad del sistema
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Sospechosa</CardTitle>
              <CardDescription>
                Intentos de acceso fallidos en las últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suspiciousLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando actividad sospechosa...</p>
                </div>
              ) : suspiciousActivity && suspiciousActivity.length > 0 ? (
                <div className="space-y-3">
                  {suspiciousActivity.slice(0, 10).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="font-medium">{attempt.username}</p>
                          <p className="text-sm text-gray-500">{attempt.ipAddress}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{attempt.failureReason || 'Error de acceso'}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(attempt.attemptedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">Sin actividad sospechosa</p>
                  <p className="text-gray-500">No se han detectado intentos de acceso fallidos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Unlock className="h-5 w-5" />
                  <span>Desbloquear Cuentas</span>
                </CardTitle>
                <CardDescription>
                  Herramienta para desbloquear cuentas de usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Gestionar Bloqueos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Auditoría</span>
                </CardTitle>
                <CardDescription>
                  Revisar logs de auditoría del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Ver Auditoría
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Análisis IP</span>
                </CardTitle>
                <CardDescription>
                  Analizar patrones de acceso por IP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Analizar IPs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}