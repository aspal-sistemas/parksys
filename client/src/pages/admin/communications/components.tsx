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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cola de Emails</CardTitle>
          <CardDescription>
            Monitorea y gestiona emails programados y en proceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Cola de emails en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CampaignsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Campañas</CardTitle>
          <CardDescription>
            Crea y gestiona campañas de email segmentadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Gestión de campañas en desarrollo</p>
          </div>
        </CardContent>
      </Card>
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