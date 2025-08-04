import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, BellRing, Search, Filter, Plus, Settings, 
  Mail, MessageCircle, AlertCircle, Info, CheckCircle,
  Eye, Edit, Trash2, Send, Users, Clock, Target
} from 'lucide-react';

// Datos simulados de notificaciones
const NOTIFICATIONS_DATA = [
  {
    id: 1,
    title: 'Nueva actividad registrada',
    message: 'Se ha registrado una nueva actividad "Yoga en el Parque" en Bosque Los Colomos',
    type: 'activity',
    priority: 'medium',
    recipients: ['admin', 'coordinator'],
    status: 'sent',
    createdAt: '2025-01-03 14:30',
    sentAt: '2025-01-03 14:35',
    readCount: 12,
    totalRecipients: 15,
    category: 'Actividades'
  },
  {
    id: 2,
    title: 'Mantenimiento programado',
    message: 'Se ha programado mantenimiento preventivo para los juegos infantiles del Parque Agua Azul',
    type: 'maintenance',
    priority: 'high',
    recipients: ['admin', 'maintenance', 'operator'],
    status: 'sent',
    createdAt: '2025-01-03 10:15',
    sentAt: '2025-01-03 10:20',
    readCount: 8,
    totalRecipients: 10,
    category: 'Mantenimiento'
  },
  {
    id: 3,
    title: 'Nuevo voluntario registrado',
    message: 'María González se ha registrado como voluntaria para actividades ambientales',
    type: 'volunteer',
    priority: 'low',
    recipients: ['admin', 'hr'],
    status: 'pending',
    createdAt: '2025-01-03 16:45',
    sentAt: null,
    readCount: 0,
    totalRecipients: 5,
    category: 'Recursos Humanos'
  },
  {
    id: 4,
    title: 'Reporte financiero mensual',
    message: 'El reporte financiero de diciembre 2024 está listo para revisión',
    type: 'finance',
    priority: 'medium',
    recipients: ['admin', 'finance'],
    status: 'draft',
    createdAt: '2025-01-03 09:00',
    sentAt: null,
    readCount: 0,
    totalRecipients: 3,
    category: 'Finanzas'
  },
  {
    id: 5,
    title: 'Incidente reportado',
    message: 'Se ha reportado daño en el mobiliario del Bosque Urbano Tlaquepaque',
    type: 'incident',
    priority: 'high',
    recipients: ['admin', 'security', 'maintenance'],
    status: 'sent',
    createdAt: '2025-01-03 12:20',
    sentAt: '2025-01-03 12:25',
    readCount: 6,
    totalRecipients: 8,
    category: 'Seguridad'
  }
];

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'activity', label: 'Actividades' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'volunteer', label: 'Voluntarios' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'incident', label: 'Incidentes' },
  { value: 'system', label: 'Sistema' }
];

const PRIORITY_LEVELS = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'sent', label: 'Enviado' },
  { value: 'failed', label: 'Fallido' }
];

const NotificationsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredNotifications = NOTIFICATIONS_DATA.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Target className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'volunteer': return <Users className="h-4 w-4" />;
      case 'finance': return <MessageCircle className="h-4 w-4" />;
      case 'incident': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'pending': return 'Pendiente';
      case 'draft': return 'Borrador';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const handleSendNotification = (id: number) => {
    toast({
      title: "Notificación enviada",
      description: "La notificación ha sido enviada exitosamente",
    });
  };

  const handleDeleteNotification = (id: number) => {
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido eliminada del sistema",
    });
  };

  const statisticsData = {
    total: NOTIFICATIONS_DATA.length,
    sent: NOTIFICATIONS_DATA.filter(n => n.status === 'sent').length,
    pending: NOTIFICATIONS_DATA.filter(n => n.status === 'pending').length,
    draft: NOTIFICATIONS_DATA.filter(n => n.status === 'draft').length
  };

  return (
    <AdminLayout title="Notificaciones" subtitle="Gestión y envío de notificaciones del sistema">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Notificaciones
            </CardTitle>
            <Bell className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{statisticsData.total}</div>
            <p className="text-xs text-blue-700 mt-1">En el sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Enviadas
            </CardTitle>
            <Send className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{statisticsData.sent}</div>
            <p className="text-xs text-green-700 mt-1">Notificaciones enviadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Pendientes
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{statisticsData.pending}</div>
            <p className="text-xs text-yellow-700 mt-1">Por enviar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">
              Borradores
            </CardTitle>
            <Edit className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{statisticsData.draft}</div>
            <p className="text-xs text-gray-700 mt-1">En edición</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y controles */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Notificación</DialogTitle>
              <DialogDescription>
                Crea y configura una nueva notificación para enviar a los usuarios
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <Input placeholder="Título de la notificación" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">Actividades</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="volunteer">Voluntarios</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="incident">Incidentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mensaje</Label>
                <Textarea 
                  placeholder="Contenido de la notificación"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Prioridad</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destinatarios</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona destinatarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="coordinator">Coordinadores</SelectItem>
                      <SelectItem value="operator">Operadores</SelectItem>
                      <SelectItem value="volunteer">Voluntarios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="immediate" />
                <Label htmlFor="immediate">Enviar inmediatamente</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button variant="outline">
                  Guardar como Borrador
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Notificación creada",
                    description: "La notificación ha sido creada y enviada exitosamente",
                  });
                  setShowCreateModal(false);
                }}>
                  Crear y Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="h-5 w-5 mr-2" />
            Registro de Notificaciones
          </CardTitle>
          <CardDescription>
            Historial completo de notificaciones enviadas y programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notificación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {notification.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <span className="text-sm capitalize">{notification.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {notification.priority === 'medium' && <Info className="h-3 w-3 mr-1" />}
                      {notification.priority === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {notification.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(notification.status)}>
                      {getStatusLabel(notification.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notification.status === 'sent' ? (
                      <div>
                        <div className="text-sm font-medium">
                          {notification.readCount}/{notification.totalRecipients}
                        </div>
                        <div className="text-xs text-gray-500">leídas</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {notification.totalRecipients} destinatarios
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{notification.createdAt}</div>
                      {notification.sentAt && (
                        <div className="text-xs text-gray-500">
                          Enviado: {notification.sentAt}
                        </div>
                      )}
                    </div>
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
                            <DialogTitle>Detalles de Notificación</DialogTitle>
                            <DialogDescription>
                              Información completa de la notificación #{notification.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Título</Label>
                              <p className="text-sm text-gray-600">{notification.title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Mensaje</Label>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Tipo</Label>
                                <p className="text-sm text-gray-600 capitalize">{notification.type}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Prioridad</Label>
                                <Badge className={getPriorityColor(notification.priority)}>
                                  {notification.priority.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Destinatarios</Label>
                              <p className="text-sm text-gray-600">
                                {notification.recipients.join(', ')} ({notification.totalRecipients} usuarios)
                              </p>
                            </div>
                            {notification.status === 'sent' && (
                              <div>
                                <Label className="text-sm font-medium">Estadísticas de Entrega</Label>
                                <p className="text-sm text-gray-600">
                                  {notification.readCount} de {notification.totalRecipients} han leído la notificación
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {notification.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSendNotification(notification.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default NotificationsManagement;