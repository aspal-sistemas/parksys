import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  User, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Calendar as CalendarIcon,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  ip: string;
  success: boolean;
}

export default function Auditoria() {
  const [activeTab, setActiveTab] = useState("eventos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Datos simulados de eventos de auditoría
  const auditEvents: AuditEvent[] = [
    {
      id: '1',
      timestamp: '2025-01-10T14:30:25Z',
      user: 'Ana García',
      action: 'Modificar permisos',
      resource: 'Usuario: Carlos Ruiz',
      details: 'Cambió rol de Operador a Supervisor',
      severity: 'medium',
      module: 'Seguridad',
      ip: '192.168.1.100',
      success: true
    },
    {
      id: '2',
      timestamp: '2025-01-10T13:45:12Z',
      user: 'Luis Martínez',
      action: 'Intento de acceso',
      resource: 'Dashboard principal',
      details: 'Credenciales incorrectas',
      severity: 'high',
      module: 'Seguridad',
      ip: '192.168.1.105',
      success: false
    },
    {
      id: '3',
      timestamp: '2025-01-10T12:20:35Z',
      user: 'Sistema',
      action: 'Respaldo completado',
      resource: 'Base de datos principal',
      details: 'Respaldo automático exitoso (45.6 MB)',
      severity: 'low',
      module: 'Mantenimiento',
      ip: 'localhost',
      success: true
    },
    {
      id: '4',
      timestamp: '2025-01-10T11:15:08Z',
      user: 'María López',
      action: 'Crear usuario',
      resource: 'Usuario: Pedro Sánchez',
      details: 'Nuevo usuario con rol Operador',
      severity: 'low',
      module: 'Seguridad',
      ip: '192.168.1.102',
      success: true
    },
    {
      id: '5',
      timestamp: '2025-01-10T10:45:22Z',
      user: 'Carlos Ruiz',
      action: 'Eliminar actividad',
      resource: 'Actividad: Yoga matutino',
      details: 'Actividad eliminada permanentemente',
      severity: 'medium',
      module: 'Gestión',
      ip: '192.168.1.103',
      success: true
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'Seguridad': 'bg-red-50 text-red-700',
      'Gestión': 'bg-blue-50 text-blue-700',
      'Mantenimiento': 'bg-green-50 text-green-700',
      'Finanzas': 'bg-purple-50 text-purple-700',
      'RH': 'bg-orange-50 text-orange-700'
    };
    return colors[module] || 'bg-gray-50 text-gray-700';
  };

  // Filtrar eventos
  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || event.user === filterUser;
    const matchesModule = filterModule === 'all' || event.module === filterModule;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    
    return matchesSearch && matchesUser && matchesModule && matchesSeverity;
  });

  // Estadísticas
  const stats = {
    totalEvents: auditEvents.length,
    criticalEvents: auditEvents.filter(e => e.severity === 'critical').length,
    failedActions: auditEvents.filter(e => !e.success).length,
    uniqueUsers: new Set(auditEvents.map(e => e.user)).size
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-6 w-6" />
            Sistema de Auditoría
          </CardTitle>
          <CardDescription className="text-gray-700">
            Registro completo de eventos, acciones y cambios en el sistema con trazabilidad completa.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eventos" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="space-y-6">
          {/* Filtros y búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Usuario, acción, recurso..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario</label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="Ana García">Ana García</SelectItem>
                      <SelectItem value="Luis Martínez">Luis Martínez</SelectItem>
                      <SelectItem value="María López">María López</SelectItem>
                      <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                      <SelectItem value="Sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Módulo</label>
                  <Select value={filterModule} onValueChange={setFilterModule}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      <SelectItem value="Seguridad">Seguridad</SelectItem>
                      <SelectItem value="Gestión">Gestión</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Finanzas">Finanzas</SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severidad</label>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las severidades</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Mostrando {filteredEvents.length} de {auditEvents.length} eventos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Registro de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${event.success ? 'bg-green-100' : 'bg-red-100'}`}>
                          {event.success ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> :
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <h3 className="font-medium">{event.action}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.user} • {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity === 'critical' ? 'Crítica' :
                           event.severity === 'high' ? 'Alta' :
                           event.severity === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Badge variant="outline" className={getModuleColor(event.module)}>
                          {event.module}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Recurso: </span>
                        {event.resource}
                      </div>
                      <div>
                        <span className="font-medium">IP: </span>
                        {event.ip}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Detalles: </span>
                      {event.details}
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron eventos
                    </h3>
                    <p className="text-gray-500">
                      Ajusta los filtros para ver más resultados.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-6">
          {/* Métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Últimas 24 horas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.criticalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acciones Fallidas</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failedActions}</div>
                <p className="text-xs text-muted-foreground">
                  Intentos sin éxito
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <User className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Con actividad hoy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos y análisis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gráficos en Desarrollo
                </h3>
                <p className="text-gray-500">
                  Los gráficos de tendencias y análisis estadístico estarán disponibles próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-6">
          {/* Configuración de auditoría */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Auditoría</CardTitle>
              <CardDescription>
                Configure qué eventos se registran y por cuánto tiempo se conservan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Eventos a Registrar</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Inicios de sesión</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Cambios de permisos</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Creación/eliminación de usuarios</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Modificaciones de datos</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Accesos a recursos</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Configuración de Retención</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm">Tiempo de retención</label>
                      <Select defaultValue="365">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 días</SelectItem>
                          <SelectItem value="90">90 días</SelectItem>
                          <SelectItem value="180">6 meses</SelectItem>
                          <SelectItem value="365">1 año</SelectItem>
                          <SelectItem value="1825">5 años</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Nivel de detalle</label>
                      <Select defaultValue="detailed">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Mínimo</SelectItem>
                          <SelectItem value="standard">Estándar</SelectItem>
                          <SelectItem value="detailed">Detallado</SelectItem>
                          <SelectItem value="verbose">Completo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline">
                  Restablecer
                </Button>
                <Button>
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}