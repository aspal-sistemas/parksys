import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleBadge } from '@/components/RoleBadge';
import { usePermissions } from '@/components/RoleGuard';
import { Link } from 'wouter';
import { 
  Activity, Shield, Clock, User, Eye, Download, Filter, Search,
  CheckCircle, XCircle, AlertTriangle, Info, Edit, UserCog, Grid
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Datos simulados de auditoría de roles
const AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2025-01-04 21:10:15',
    action: 'role_change',
    user: 'Ana García Ruiz',
    userId: 1,
    fromRole: 'coordinador-parques',
    toRole: 'director-general',
    performedBy: 'Sistema Admin',
    performedById: 0,
    description: 'Promoción por reestructuración organizacional',
    severity: 'high',
    module: 'Seguridad'
  },
  {
    id: 2,
    timestamp: '2025-01-04 20:45:22',
    action: 'permission_granted',
    user: 'Carlos Mendoza Torres',
    userId: 2,
    permission: 'admin',
    module: 'Finanzas',
    performedBy: 'Ana García Ruiz',
    performedById: 1,
    description: 'Acceso temporal para auditoría de presupuesto Q1',
    severity: 'medium'
  },
  {
    id: 3,
    timestamp: '2025-01-04 20:30:45',
    action: 'login_attempt',
    user: 'Roberto Silva Jiménez',
    userId: 4,
    result: 'success',
    ipAddress: '192.168.1.45',
    performedBy: 'Sistema',
    performedById: 0,
    description: 'Acceso exitoso desde oficina central',
    severity: 'low',
    module: 'Seguridad'
  },
  {
    id: 4,
    timestamp: '2025-01-04 19:15:33',
    action: 'role_change',
    user: 'Laura Fernández Morales',
    userId: 5,
    fromRole: 'operador-parque',
    toRole: 'coordinador-actividades',
    performedBy: 'Ana García Ruiz',
    performedById: 1,
    description: 'Promoción interna por desempeño destacado',
    severity: 'high',
    module: 'Recursos Humanos'
  },
  {
    id: 5,
    timestamp: '2025-01-04 18:50:11',
    action: 'permission_revoked',
    user: 'Diego Ramírez Castro',
    userId: 6,
    permission: 'write',
    module: 'Finanzas',
    performedBy: 'Roberto Silva Jiménez',
    performedById: 4,
    description: 'Suspensión temporal por investigación interna',
    severity: 'high'
  },
  {
    id: 6,
    timestamp: '2025-01-04 17:25:18',
    action: 'login_attempt',
    user: 'Patricia López Herrera',
    userId: 7,
    result: 'failed',
    ipAddress: '203.45.67.89',
    performedBy: 'Sistema',
    performedById: 0,
    description: 'Intento fallido - contraseña incorrecta (3 intentos)',
    severity: 'medium',
    module: 'Seguridad'
  },
  {
    id: 7,
    timestamp: '2025-01-04 16:40:27',
    action: 'bulk_assignment',
    performedBy: 'Ana García Ruiz',
    performedById: 1,
    affectedUsers: 5,
    toRole: 'operador-parque',
    description: 'Asignación masiva para nuevo personal de operaciones',
    severity: 'medium',
    module: 'Recursos Humanos'
  },
  {
    id: 8,
    timestamp: '2025-01-04 15:20:44',
    action: 'matrix_update',
    user: 'Sistema Admin',
    userId: 0,
    performedBy: 'Ana García Ruiz',
    performedById: 1,
    description: 'Actualización de matriz de permisos - módulo Marketing',
    severity: 'high',
    module: 'Seguridad'
  }
];

const ACTION_TYPES = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'role_change', label: 'Cambios de rol' },
  { value: 'permission_granted', label: 'Permisos otorgados' },
  { value: 'permission_revoked', label: 'Permisos revocados' },
  { value: 'login_attempt', label: 'Intentos de acceso' },
  { value: 'bulk_assignment', label: 'Asignaciones masivas' },
  { value: 'matrix_update', label: 'Actualizaciones de matriz' }
];

const SEVERITY_LEVELS = [
  { value: 'all', label: 'Todos los niveles' },
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' }
];

const RoleAudits: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [viewingLog, setViewingLog] = useState<any>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const permissions = usePermissions();

  const filteredLogs = AUDIT_LOGS.filter(log => {
    const matchesSearch = log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;

    return matchesSearch && matchesAction && matchesSeverity && matchesModule;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'role_change': return <UserCog className="h-4 w-4" />;
      case 'permission_granted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'permission_revoked': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'login_attempt': return <Shield className="h-4 w-4" />;
      case 'bulk_assignment': return <User className="h-4 w-4" />;
      case 'matrix_update': return <Grid className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    const actionType = ACTION_TYPES.find(t => t.value === action);
    return actionType?.label || action;
  };

  const severityStats = {
    high: filteredLogs.filter(log => log.severity === 'high').length,
    medium: filteredLogs.filter(log => log.severity === 'medium').length,
    low: filteredLogs.filter(log => log.severity === 'low').length,
    total: filteredLogs.length
  };

  return (
    <AdminLayout title="Auditoría de Roles" subtitle="Registro completo de actividades y cambios del sistema">
      {/* Estadísticas de auditoría */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Eventos Críticos
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{severityStats.high}</div>
            <p className="text-xs text-red-700 mt-1">Severidad alta</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Eventos Medios
            </CardTitle>
            <Info className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{severityStats.medium}</div>
            <p className="text-xs text-yellow-700 mt-1">Severidad media</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Eventos Normales
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{severityStats.low}</div>
            <p className="text-xs text-green-700 mt-1">Severidad baja</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Eventos
            </CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{severityStats.total}</div>
            <p className="text-xs text-blue-700 mt-1">En periodo actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de auditoría */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en auditoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Log
          </Button>
          <Link href="/admin/roles">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Gestión de Roles
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabla de logs de auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Registro de Auditoría
          </CardTitle>
          <CardDescription>
            Historial completo de cambios y actividades del sistema de roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Usuario Afectado</TableHead>
                <TableHead>Cambios</TableHead>
                <TableHead>Ejecutado Por</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium">
                        {getActionLabel(log.action)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <div>
                        <div className="font-medium text-sm">{log.user}</div>
                        <div className="text-xs text-gray-500">ID: {log.userId}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sistema</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {log.fromRole && log.toRole && (
                        <div className="flex items-center gap-2 text-sm">
                          <RoleBadge roleId={log.fromRole} size="sm" />
                          <span>→</span>
                          <RoleBadge roleId={log.toRole} size="sm" />
                        </div>
                      )}
                      {log.permission && (
                        <div className="text-sm">
                          <Badge variant="outline">{log.permission}</Badge>
                          {log.module && <span className="ml-2 text-gray-500">en {log.module}</span>}
                        </div>
                      )}
                      {log.affectedUsers && (
                        <div className="text-sm text-gray-600">
                          {log.affectedUsers} usuarios afectados
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{log.performedBy}</div>
                      {log.performedById > 0 && (
                        <div className="text-xs text-gray-500">ID: {log.performedById}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {log.severity === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {log.severity === 'medium' && <Info className="h-3 w-3 mr-1" />}
                      {log.severity === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {log.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.module && (
                      <Badge variant="outline" className="text-xs">
                        {log.module}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Detalles del Evento de Auditoría</DialogTitle>
                            <DialogDescription>
                              Información completa del registro de auditoría #{log.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Fecha y Hora</Label>
                              <p className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Tipo de Acción</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {getActionIcon(log.action)}
                                <span className="text-sm">{getActionLabel(log.action)}</span>
                              </div>
                            </div>
                            {log.user && (
                              <div>
                                <Label className="text-sm font-medium">Usuario Afectado</Label>
                                <p className="text-sm text-gray-600">{log.user} (ID: {log.userId})</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium">Ejecutado Por</Label>
                              <p className="text-sm text-gray-600">{log.performedBy} {log.performedById > 0 && `(ID: ${log.performedById})`}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Descripción</Label>
                              <p className="text-sm text-gray-600">{log.description}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Severidad</Label>
                              <div className="mt-1">
                                <Badge className={getSeverityColor(log.severity)}>
                                  {log.severity === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {log.severity === 'medium' && <Info className="h-3 w-3 mr-1" />}
                                  {log.severity === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {log.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            {log.module && (
                              <div>
                                <Label className="text-sm font-medium">Módulo</Label>
                                <div className="mt-1">
                                  <Badge variant="outline">{log.module}</Badge>
                                </div>
                              </div>
                            )}
                            {log.fromRole && log.toRole && (
                              <div>
                                <Label className="text-sm font-medium">Cambio de Rol</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <RoleBadge roleId={log.fromRole} size="sm" />
                                  <span>→</span>
                                  <RoleBadge roleId={log.toRole} size="sm" />
                                </div>
                              </div>
                            )}
                            {log.ipAddress && (
                              <div>
                                <Label className="text-sm font-medium">Dirección IP</Label>
                                <p className="text-sm text-gray-600 font-mono">{log.ipAddress}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {permissions.canWrite('Seguridad') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Editar Registro de Auditoría</DialogTitle>
                              <DialogDescription>
                                Modifica información adicional del evento de auditoría
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Notas Adicionales</Label>
                                <Input defaultValue="" placeholder="Agregar comentarios o notas..." />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Clasificación</Label>
                                <Select defaultValue={log.severity}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline">
                                  Cancelar
                                </Button>
                                <Button onClick={() => {
                                  toast({
                                    title: "Registro actualizado",
                                    description: "Los cambios se han guardado en el log de auditoría",
                                  });
                                }}>
                                  Guardar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Descripción de eventos */}
      {filteredLogs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalles de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionIcon(log.action)}
                        <span className="font-medium text-sm">{getActionLabel(log.action)}</span>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{log.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default RoleAudits;