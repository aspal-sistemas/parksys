import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  Plus,
  Play,
  Pause,
  Eye,
  Calendar,
  Award,
  AlertCircle,
  Wrench,
  Star,
  AlertTriangle,
  TrendingUp,
  TreePine,
  FileEdit,
  DollarSign
} from 'lucide-react';

export const TemplatesSection: React.FC = () => {
  const templates = [
    {
      id: 1,
      name: "Bienvenida Empleado",
      category: "Recursos Humanos",
      description: "Plantilla para dar la bienvenida a nuevos empleados del sistema de parques",
      variables: ["{{nombre_empleado}}", "{{departamento}}", "{{fecha_inicio}}", "{{supervisor}}"],
      usage: "Automática al crear empleado",
      color: "bg-blue-500",
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 2,
      name: "Recibo de Nómina",
      category: "Finanzas",
      description: "Notificación de recibo de nómina generado para empleados",
      variables: ["{{empleado}}", "{{periodo}}", "{{monto_total}}", "{{fecha_pago}}"],
      usage: "Automática al procesar nómina",
      color: "bg-green-500",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: 3,
      name: "Nueva Actividad en Parque",
      category: "Eventos",
      description: "Notificación sobre nuevas actividades programadas en parques",
      variables: ["{{nombre_actividad}}", "{{parque}}", "{{fecha_hora}}", "{{instructor}}"],
      usage: "Manual o automática",
      color: "bg-purple-500",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 4,
      name: "Reconocimiento Voluntario",
      category: "Voluntarios",
      description: "Certificado de reconocimiento para voluntarios destacados",
      variables: ["{{nombre_voluntario}}", "{{horas_servicio}}", "{{periodo}}", "{{logros}}"],
      usage: "Manual",
      color: "bg-orange-500",
      icon: <Award className="h-5 w-5" />
    },
    {
      id: 5,
      name: "Vencimiento de Contrato",
      category: "Concesiones",
      description: "Alerta sobre contratos de concesión próximos a vencer",
      variables: ["{{concesionario}}", "{{fecha_vencimiento}}", "{{tipo_contrato}}", "{{monto}}"],
      usage: "Automática (30 días antes)",
      color: "bg-red-500",
      icon: <AlertCircle className="h-5 w-5" />
    },
    {
      id: 6,
      name: "Mantenimiento de Activos",
      category: "Infraestructura",
      description: "Notificación de mantenimiento programado o requerido",
      variables: ["{{activo}}", "{{tipo_mantenimiento}}", "{{fecha_programada}}", "{{responsable}}"],
      usage: "Automática por calendario",
      color: "bg-yellow-500",
      icon: <Wrench className="h-5 w-5" />
    },
    {
      id: 7,
      name: "Evaluación de Instructor",
      category: "Recursos Humanos",
      description: "Recordatorio para completar evaluaciones de instructores",
      variables: ["{{instructor}}", "{{actividad}}", "{{fecha_limite}}", "{{evaluador}}"],
      usage: "Automática mensual",
      color: "bg-indigo-500",
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 8,
      name: "Reporte de Incidente",
      category: "Seguridad",
      description: "Notificación inmediata sobre incidentes en parques",
      variables: ["{{tipo_incidente}}", "{{parque}}", "{{hora}}", "{{estado}}", "{{responsable}}"],
      usage: "Automática al reportar",
      color: "bg-red-600",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 9,
      name: "Actualización de Presupuesto",
      category: "Finanzas",
      description: "Resumen mensual de ejecución presupuestaria",
      variables: ["{{mes}}", "{{ingresos}}", "{{egresos}}", "{{saldo}}", "{{proyeccion}}"],
      usage: "Automática mensual",
      color: "bg-teal-500",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 10,
      name: "Cuidado del Arbolado",
      category: "Medio Ambiente",
      description: "Programa de cuidado y mantenimiento de árboles",
      variables: ["{{especie}}", "{{ubicacion}}", "{{accion_requerida}}", "{{fecha_programada}}"],
      usage: "Automática estacional",
      color: "bg-green-600",
      icon: <TreePine className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-xs text-gray-500">Plantillas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-gray-500">Automáticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500">Manuales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-gray-500">Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestión de Plantillas</span>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </CardTitle>
          <CardDescription>
            Plantillas de email especializadas para el sistema de parques urbanos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${template.color} text-white`}>
                      {template.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Variables disponibles:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 2).map((variable, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Uso: {template.usage}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plantillas por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas por Categoría</CardTitle>
          <CardDescription>
            Distribución de plantillas según módulos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Recursos Humanos", count: 2, color: "bg-blue-100 text-blue-700" },
              { name: "Finanzas", count: 2, color: "bg-green-100 text-green-700" },
              { name: "Eventos", count: 1, color: "bg-purple-100 text-purple-700" },
              { name: "Voluntarios", count: 1, color: "bg-orange-100 text-orange-700" },
              { name: "Concesiones", count: 1, color: "bg-red-100 text-red-700" },
              { name: "Infraestructura", count: 1, color: "bg-yellow-100 text-yellow-700" },
              { name: "Seguridad", count: 1, color: "bg-pink-100 text-pink-700" },
              { name: "Medio Ambiente", count: 1, color: "bg-teal-100 text-teal-700" }
            ].map((category) => (
              <div key={category.name} className={`p-4 rounded-lg ${category.color}`}>
                <p className="font-medium">{category.name}</p>
                <p className="text-2xl font-bold">{category.count}</p>
                <p className="text-sm opacity-75">plantillas</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const QueueSection: React.FC = () => {
  const queueEmails = [
    {
      id: 1,
      subject: "Bienvenida - María González",
      template: "Bienvenida Empleado",
      recipient: "maria.gonzalez@parques.gob.mx",
      scheduledFor: "2025-06-25 09:00:00",
      status: "pending",
      priority: "normal",
      retries: 0,
      module: "HR"
    },
    {
      id: 2,
      subject: "Recibo de Nómina - Diciembre 2024",
      template: "Recibo de Nómina",
      recipient: "carlos.martinez@parques.gob.mx",
      scheduledFor: "2025-06-25 08:30:00",
      status: "processing",
      priority: "high",
      retries: 0,
      module: "Finanzas"
    },
    {
      id: 3,
      subject: "Nueva Actividad - Yoga en el Parque",
      template: "Nueva Actividad en Parque",
      recipient: "voluntarios@parques.gob.mx",
      scheduledFor: "2025-06-25 10:15:00",
      status: "pending",
      priority: "normal",
      retries: 0,
      module: "Eventos"
    },
    {
      id: 4,
      subject: "Vencimiento Contrato - Cafetería Central",
      template: "Vencimiento de Contrato",
      recipient: "admin@cafeteriacentral.com",
      scheduledFor: "2025-06-25 07:45:00",
      status: "failed",
      priority: "high",
      retries: 2,
      module: "Concesiones"
    },
    {
      id: 5,
      subject: "Mantenimiento Programado - Juegos Infantiles",
      template: "Mantenimiento de Activos",
      recipient: "mantenimiento@parques.gob.mx",
      scheduledFor: "2025-06-25 11:00:00",
      status: "sent",
      priority: "normal",
      retries: 0,
      module: "Activos"
    },
    {
      id: 6,
      subject: "Incidente Reportado - Bosque Los Colomos",
      template: "Reporte de Incidente",
      recipient: "seguridad@parques.gob.mx",
      scheduledFor: "2025-06-25 06:30:00",
      status: "sent",
      priority: "urgent",
      retries: 0,
      module: "Seguridad"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'processing': return <Play className="h-4 w-4 text-blue-500" />;
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-orange-100 text-orange-700",
      processing: "bg-blue-100 text-blue-700", 
      sent: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      normal: "bg-blue-500 text-white",
      low: "bg-gray-500 text-white"
    };
    return variants[priority as keyof typeof variants] || "bg-gray-500 text-white";
  };

  const statusCounts = {
    pending: queueEmails.filter(e => e.status === 'pending').length,
    processing: queueEmails.filter(e => e.status === 'processing').length,
    sent: queueEmails.filter(e => e.status === 'sent').length,
    failed: queueEmails.filter(e => e.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.processing}</p>
                <p className="text-xs text-gray-500">Procesando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.sent}</p>
                <p className="text-xs text-gray-500">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.failed}</p>
                <p className="text-xs text-gray-500">Fallidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cola de Emails en Tiempo Real</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pausar Cola
              </Button>
              <Button className="bg-[#00a587] hover:bg-[#067f5f]" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Procesar Ahora
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitoreo en tiempo real del procesamiento de emails programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queueEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(email.status)}
                    <Badge className={`text-xs ${getPriorityBadge(email.priority)}`}>
                      {email.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{email.subject}</h4>
                      <Badge variant="outline" className="text-xs">{email.module}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Para: {email.recipient}</p>
                    <p className="text-xs text-gray-500">Plantilla: {email.template}</p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1 min-w-0">
                    <Badge className={`text-xs ${getStatusBadge(email.status)}`}>
                      {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500">{email.scheduledFor}</p>
                    {email.retries > 0 && (
                      <p className="text-xs text-red-500">Reintentos: {email.retries}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {email.status === 'failed' && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {email.status === 'pending' && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Statistics */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de la Cola</CardTitle>
            <CardDescription>
              Estadísticas de procesamiento de las últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emails procesados</span>
                <span className="font-bold">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de éxito</span>
                <span className="font-bold text-green-600">96.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiempo promedio</span>
                <span className="font-bold">2.3s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emails en cola</span>
                <span className="font-bold text-orange-600">{statusCounts.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulos Más Activos</CardTitle>
            <CardDescription>
              Distribución de emails por módulo del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { module: "HR", count: 12, color: "bg-blue-500" },
                { module: "Finanzas", count: 8, color: "bg-green-500" },
                { module: "Eventos", count: 6, color: "bg-purple-500" },
                { module: "Seguridad", count: 4, color: "bg-red-500" },
                { module: "Activos", count: 3, color: "bg-yellow-500" }
              ].map((item) => (
                <div key={item.module} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm">{item.module}</span>
                  </div>
                  <span className="font-bold text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const CampaignsSection: React.FC = () => {
  const campaigns = [
    {
      id: 1,
      name: "Bienvenida Nuevos Empleados Q1 2025",
      description: "Campaña automatizada para integración de personal nuevo",
      type: "automated",
      status: "active",
      targetSegment: "Empleados Nuevos",
      targetCount: 15,
      template: "Bienvenida Empleado",
      sentCount: 12,
      openRate: 87.5,
      clickRate: 23.4,
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      createdBy: "Sistema HR",
      frequency: "Inmediato al registro"
    },
    {
      id: 2,
      name: "Recibos de Nómina Diciembre",
      description: "Distribución masiva de recibos de nómina mensuales",
      type: "scheduled",
      status: "completed",
      targetSegment: "Todos los Empleados",
      targetCount: 185,
      template: "Recibo de Nómina",
      sentCount: 185,
      openRate: 94.1,
      clickRate: 78.9,
      startDate: "2024-12-31",
      endDate: "2024-12-31",
      createdBy: "Finanzas",
      frequency: "Una vez"
    },
    {
      id: 3,
      name: "Actividades de Verano 2025",
      description: "Promoción de nuevas actividades recreativas",
      type: "manual",
      status: "draft",
      targetSegment: "Usuarios Activos",
      targetCount: 1250,
      template: "Nueva Actividad en Parque",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      createdBy: "Eventos",
      frequency: "Semanal"
    },
    {
      id: 4,
      name: "Reconocimientos Voluntarios 2024",
      description: "Certificados anuales para voluntarios destacados",
      type: "manual",
      status: "paused",
      targetSegment: "Voluntarios Activos",
      targetCount: 45,
      template: "Reconocimiento Voluntario",
      sentCount: 28,
      openRate: 96.4,
      clickRate: 42.1,
      startDate: "2024-12-15",
      endDate: "2024-12-31",
      createdBy: "Voluntarios",
      frequency: "Una vez"
    },
    {
      id: 5,
      name: "Alertas Vencimiento Contratos",
      description: "Notificaciones automáticas 30 días antes del vencimiento",
      type: "automated",
      status: "active",
      targetSegment: "Concesionarios",
      targetCount: 8,
      template: "Vencimiento de Contrato",
      sentCount: 3,
      openRate: 100,
      clickRate: 66.7,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      createdBy: "Sistema Concesiones",
      frequency: "30 días antes"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      draft: "bg-gray-100 text-gray-700",
      paused: "bg-orange-100 text-orange-700"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700";
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      automated: "bg-purple-500 text-white",
      scheduled: "bg-blue-500 text-white", 
      manual: "bg-orange-500 text-white"
    };
    return variants[type as keyof typeof variants] || "bg-gray-500 text-white";
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const avgOpenRate = campaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.sentCount > 0).length;
  const totalTargets = campaigns.reduce((sum, c) => sum + c.targetCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-xs text-gray-500">Campañas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
                <p className="text-xs text-gray-500">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Send className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Emails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Tasa Apertura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestión de Campañas</span>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </CardTitle>
          <CardDescription>
            Campañas de email segmentadas por tipos de usuario y módulos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={`text-xs ${getTypeBadge(campaign.type)}`}>
                        {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusBadge(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Segmento: {campaign.targetSegment}</span>
                      <span>Plantilla: {campaign.template}</span>
                      <span>Frecuencia: {campaign.frequency}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    {campaign.status === 'paused' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Campaign metrics */}
                <div className="grid grid-cols-4 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{campaign.targetCount}</p>
                    <p className="text-xs text-gray-500">Destinatarios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{campaign.sentCount}</p>
                    <p className="text-xs text-gray-500">Enviados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{campaign.openRate}%</p>
                    <p className="text-xs text-gray-500">Apertura</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{campaign.clickRate}%</p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                  <span>Periodo: {campaign.startDate} - {campaign.endDate}</span>
                  <span>Creado por: {campaign.createdBy}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Analytics */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Segmentos de Audiencia</CardTitle>
            <CardDescription>
              Distribución de campañas por tipo de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { segment: "Empleados", campaigns: 2, users: 185, color: "bg-blue-500" },
                { segment: "Usuarios Activos", campaigns: 1, users: 1250, color: "bg-green-500" },
                { segment: "Voluntarios", campaigns: 1, users: 45, color: "bg-purple-500" },
                { segment: "Concesionarios", campaigns: 1, users: 8, color: "bg-orange-500" }
              ].map((item) => (
                <div key={item.segment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <div>
                      <p className="font-medium text-sm">{item.segment}</p>
                      <p className="text-xs text-gray-500">{item.users.toLocaleString()} usuarios</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.campaigns} campañas
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento General</CardTitle>
            <CardDescription>
              Métricas consolidadas de todas las campañas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total destinatarios</span>
                <span className="font-bold">{totalTargets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emails enviados</span>
                <span className="font-bold text-green-600">{totalSent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa entrega</span>
                <span className="font-bold text-blue-600">99.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio apertura</span>
                <span className="font-bold text-purple-600">{avgOpenRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio clicks</span>
                <span className="font-bold text-orange-600">
                  {(campaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.clickRate, 0) / campaigns.filter(c => c.sentCount > 0).length).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const BulkEmailSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo</CardTitle>
          <CardDescription>
            Envía emails a múltiples destinatarios de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Send className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Envío masivo en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis y Reportes</CardTitle>
          <CardDescription>
            Métricas de rendimiento de emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Dashboard de análisis en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};