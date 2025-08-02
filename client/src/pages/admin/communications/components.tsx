import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
  DollarSign,
  Save,
  X,
  Grid3X3,
  List,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const TemplatesSection: React.FC = () => {
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    description: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: [] as string[],
    newVariable: '',
    usage: 'manual',
    module: '',
    isActive: true
  });

  const categories = [
    'Recursos Humanos',
    'Finanzas',
    'Eventos',
    'Actividades',
    'Voluntarios',
    'Concesiones',
    'Infraestructura',
    'Seguridad',
    'Medio Ambiente'
  ];

  const modules = [
    'HR',
    'Finanzas',
    'Eventos',
    'Actividades',
    'Voluntarios',
    'Concesiones',
    'Activos',
    'Seguridad',
    'Arbolado'
  ];

  const handleCreateTemplate = () => {
    console.log('Creating template:', newTemplate);
    // Aquí iría la lógica para crear la plantilla
    setIsNewTemplateOpen(false);
    setNewTemplate({
      name: '',
      category: '',
      description: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      variables: [],
      newVariable: '',
      usage: 'manual',
      module: '',
      isActive: true
    });
  };

  const addVariable = () => {
    if (newTemplate.newVariable.trim() && !newTemplate.variables.includes(newTemplate.newVariable.trim())) {
      setNewTemplate({
        ...newTemplate,
        variables: [...newTemplate.variables, `{{${newTemplate.newVariable.trim()}}}`],
        newVariable: ''
      });
    }
  };

  const removeVariable = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      variables: newTemplate.variables.filter((_, i) => i !== index)
    });
  };
  const templates = [
    {
      id: 1,
      name: "Bienvenida Empleado",
      category: "Recursos Humanos",
      description: "Plantilla para dar la bienvenida a nuevos empleados del sistema de parques",
      subject: "Bienvenido {{nombre_empleado}} - {{departamento}}",
      htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
        <h2 style='color: #00a587; text-align: center;'>¡Bienvenido al Equipo!</h2>
        <p>Estimado/a {{nombre_empleado}},</p>
        <p>Es un placer darte la bienvenida al departamento de <strong>{{departamento}}</strong>. Tu fecha de inicio será el <strong>{{fecha_inicio}}</strong>.</p>
        <p>Tu supervisor directo será <strong>{{supervisor}}</strong>, quien te ayudará durante tu proceso de integración.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
          <h3 style='color: #00a587; margin-top: 0;'>Próximos pasos:</h3>
          <ul>
            <li>Revisión de documentos de recursos humanos</li>
            <li>Asignación de equipo de trabajo</li>
            <li>Orientación sobre políticas y procedimientos</li>
            <li>Presentación del equipo</li>
          </ul>
        </div>
        <p>¡Estamos emocionados de tenerte en nuestro equipo!</p>
        <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
      </div>`,
      textContent: `¡Bienvenido al Equipo!\n\nEstimado/a {{nombre_empleado}},\n\nEs un placer darte la bienvenida al departamento de {{departamento}}. Tu fecha de inicio será el {{fecha_inicio}}.\n\nTu supervisor directo será {{supervisor}}, quien te ayudará durante tu proceso de integración.\n\nPróximos pasos:\n- Revisión de documentos de recursos humanos\n- Asignación de equipo de trabajo\n- Orientación sobre políticas y procedimientos\n- Presentación del equipo\n\n¡Estamos emocionados de tenerte en nuestro equipo!\n\nSaludos cordiales,\nEquipo de Recursos Humanos`,
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
    },
    {
      id: 11,
      name: "Confirmación de Inscripción",
      category: "Actividades",
      description: "Email automático enviado cuando un usuario se inscribe a una actividad (pendiente de aprobación)",
      subject: "✅ Confirmación de Inscripción - {{activityTitle}}",
      htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
          <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #16a34a; margin: 0; font-size: 28px;'>🎯 ParkSys</h1>
          </div>
          
          <h2 style='color: #333; text-align: center; margin-bottom: 30px;'>¡Inscripción Recibida!</h2>
          
          <div style='background-color: #f0f9ff; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <p style='margin: 0; color: #333; font-size: 16px;'>
              <strong>Hola {{participantName}},</strong>
            </p>
            <p style='margin: 10px 0 0 0; color: #666;'>
              Hemos recibido tu inscripción para la actividad <strong>{{activityTitle}}</strong> 
              y está siendo revisada por nuestro equipo.
            </p>
          </div>
          
          <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #16a34a; margin-top: 0;'>Detalles de la Actividad:</h3>
            <ul style='list-style: none; padding: 0; margin: 0;'>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>📍 Actividad:</strong> {{activityTitle}}</li>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>🏛️ Parque:</strong> {{parkName}}</li>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>📅 Fecha:</strong> {{activityStartDate}}</li>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>⏰ Hora:</strong> {{activityStartTime}}</li>
              <li style='padding: 8px 0;'><strong>📍 Ubicación:</strong> {{activityLocation}}</li>
            </ul>
          </div>
          
          <div style='background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;'>
            <p style='margin: 0; color: #92400e; font-size: 14px;'>
              <strong>ℹ️ Pendiente de Aprobación:</strong> Tu inscripción será revisada y recibirás otro correo con la confirmación final.
            </p>
          </div>
          
          <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;'>
            <p style='color: #666; font-size: 14px; margin: 0;'>
              Sistema de Gestión de Parques Urbanos<br>
              Fecha de inscripción: {{registrationDate}}
            </p>
          </div>
        </div>
      </div>`,
      textContent: `¡Inscripción Recibida!

Estimado/a {{participantName}},

Tu inscripción ha sido recibida exitosamente para la actividad: {{activityTitle}}

DETALLES DE LA ACTIVIDAD:
- Ubicación: {{parkName}}
- Fecha: {{activityStartDate}}
- Hora: {{activityStartTime}}
- Lugar específico: {{activityLocation}}

ESTADO: PENDIENTE DE APROBACIÓN

Tu inscripción está pendiente de aprobación por parte de nuestro equipo.
Recibirás otro email una vez que tu inscripción sea procesada.
El proceso puede tomar de 1 a 3 días hábiles.

¡Gracias por tu interés!

Equipo de Parques y Recreación`,
      variables: ["{{participantName}}", "{{participantEmail}}", "{{activityTitle}}", "{{parkName}}", "{{activityStartDate}}", "{{activityStartTime}}", "{{activityLocation}}", "{{registrationDate}}"],
      usage: "Automática al inscribirse",
      color: "bg-blue-500",
      icon: <Mail className="h-5 w-5" />
    },
    {
      id: 12,
      name: "Inscripción Aprobada",
      category: "Actividades", 
      description: "Email automático enviado cuando una inscripción a actividad es aprobada por el administrador",
      subject: "🎉 ¡Inscripción Aprobada! - {{activityTitle}}",
      htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
          <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #16a34a; margin: 0; font-size: 28px;'>🎯 ParkSys</h1>
          </div>
          
          <div style='text-align: center; margin-bottom: 30px;'>
            <div style='font-size: 48px; margin-bottom: 15px;'>🎉</div>
            <h2 style='color: #16a34a; margin: 0; font-size: 24px;'>¡Tu Inscripción Ha Sido Aprobada!</h2>
          </div>
          
          <div style='background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <p style='margin: 0; color: #333; font-size: 16px;'>
              <strong>¡Excelente noticia, {{participantName}}!</strong>
            </p>
            <p style='margin: 10px 0 0 0; color: #666;'>
              Tu inscripción para <strong>{{activityTitle}}</strong> ha sido aprobada oficialmente. 
              ¡Ya tienes tu lugar reservado!
            </p>
          </div>
          
          <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #16a34a; margin-top: 0;'>📋 Detalles de tu Actividad:</h3>
            <ul style='list-style: none; padding: 0; margin: 0;'>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🎯 Actividad:</strong> {{activityTitle}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🏛️ Parque:</strong> {{parkName}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>📅 Fecha:</strong> {{activityStartDate}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>⏰ Hora:</strong> {{activityStartTime}}</li>
              <li style='padding: 10px 0;'><strong>📍 Ubicación:</strong> {{activityLocation}}</li>
            </ul>
          </div>
          
          <div style='background-color: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #1d4ed8; margin-top: 0;'>📝 Instrucciones Importantes:</h3>
            <ul style='color: #1e40af; margin: 0; padding-left: 20px;'>
              <li style='margin-bottom: 8px;'>Llega <strong>15 minutos antes</strong> de la hora programada</li>
              <li style='margin-bottom: 8px;'>Trae ropa cómoda y adecuada para la actividad</li>
              <li style='margin-bottom: 8px;'>Si tienes alguna condición médica, avísanos al llegar</li>
              <li>En caso de cancelación, avísanos con <strong>24 horas de anticipación</strong></li>
            </ul>
          </div>
          
          <div style='background-color: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>
            <p style='margin: 0; color: #166534; font-size: 16px;'>
              <strong>✅ Estado: CONFIRMADO</strong><br>
              <span style='font-size: 14px;'>Aprobado el {{approvedDate}}</span>
            </p>
          </div>
          
          <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;'>
            <p style='color: #666; font-size: 14px; margin: 0;'>
              ¡Nos vemos pronto!<br>
              Sistema de Gestión de Parques Urbanos
            </p>
          </div>
        </div>
      </div>`,
      textContent: `¡Inscripción Aprobada!

¡Excelente noticia, {{participantName}}!

Tu inscripción para {{activityTitle}} ha sido aprobada oficialmente. ¡Ya tienes tu lugar reservado!

DETALLES DE TU ACTIVIDAD:
- Actividad: {{activityTitle}}
- Parque: {{parkName}}
- Fecha: {{activityStartDate}}
- Hora: {{activityStartTime}}
- Ubicación: {{activityLocation}}

INSTRUCCIONES IMPORTANTES:
- Llega 15 minutos antes de la hora programada
- Trae ropa cómoda y adecuada para la actividad
- Si tienes alguna condición médica, avísanos al llegar
- En caso de cancelación, avísanos con 24 horas de anticipación

ESTADO: CONFIRMADO
Aprobado el {{approvedDate}}

¡Nos vemos pronto!
Sistema de Gestión de Parques Urbanos`,
      variables: ["{{participantName}}", "{{activityTitle}}", "{{parkName}}", "{{activityStartDate}}", "{{activityStartTime}}", "{{activityLocation}}", "{{approvedDate}}"],
      usage: "Automática al aprobar inscripción",
      color: "bg-green-500",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: 13,
      name: "Confirmación de Pago - Actividad",
      category: "Actividades",
      description: "Email automático enviado cuando el pago con Stripe es procesado exitosamente para una actividad",
      subject: "💳 ¡Pago Confirmado! - {{activityTitle}}",
      htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
          <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #16a34a; margin: 0; font-size: 28px;'>🎯 ParkSys</h1>
          </div>
          
          <div style='text-align: center; margin-bottom: 30px;'>
            <div style='font-size: 48px; margin-bottom: 15px;'>💳</div>
            <h2 style='color: #16a34a; margin: 0; font-size: 24px;'>¡Pago Confirmado!</h2>
          </div>
          
          <div style='background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <p style='margin: 0; color: #333; font-size: 16px;'>
              <strong>¡Perfecto, {{participantName}}!</strong>
            </p>
            <p style='margin: 10px 0 0 0; color: #666;'>
              Tu pago para <strong>{{activityTitle}}</strong> ha sido procesado exitosamente. 
              ¡Tu lugar está completamente reservado!
            </p>
          </div>
          
          <div style='background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #1d4ed8; margin-top: 0;'>💰 Detalles del Pago:</h3>
            <ul style='list-style: none; padding: 0; margin: 0;'>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>💵 Monto:</strong> $\{{paymentAmount\}} MXN</li>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>🆔 ID de Transacción:</strong> {{stripePaymentId}}</li>
              <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>💳 Método:</strong> {{paymentMethod}}</li>
              <li style='padding: 8px 0;'><strong>📅 Fecha de Pago:</strong> {{paymentDate}}</li>
            </ul>
          </div>
          
          <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #16a34a; margin-top: 0;'>📋 Detalles de tu Actividad:</h3>
            <ul style='list-style: none; padding: 0; margin: 0;'>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🎯 Actividad:</strong> {{activityTitle}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🏛️ Parque:</strong> {{parkName}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>📅 Fecha:</strong> {{activityStartDate}}</li>
              <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>⏰ Hora:</strong> {{activityStartTime}}</li>
              <li style='padding: 10px 0;'><strong>📍 Ubicación:</strong> {{activityLocation}}</li>
            </ul>
          </div>
          
          <div style='background-color: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <h3 style='color: #1d4ed8; margin-top: 0;'>📝 Información Importante:</h3>
            <ul style='color: #1e40af; margin: 0; padding-left: 20px;'>
              <li style='margin-bottom: 8px;'>Tu inscripción está <strong>confirmada automáticamente</strong> al completar el pago</li>
              <li style='margin-bottom: 8px;'>Llega <strong>15 minutos antes</strong> de la hora programada</li>
              <li style='margin-bottom: 8px;'>Trae ropa cómoda y adecuada para la actividad</li>
              <li style='margin-bottom: 8px;'>Presenta este email como comprobante en caso necesario</li>
              <li>Para cancelaciones, contacta al equipo con <strong>24 horas de anticipación</strong></li>
            </ul>
          </div>
          
          <div style='background-color: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>
            <p style='margin: 0; color: #166534; font-size: 16px;'>
              <strong>✅ Estado: PAGADO Y CONFIRMADO</strong><br>
              <span style='font-size: 14px;'>Procesado el {{paymentDate}}</span>
            </p>
          </div>
          
          <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;'>
            <p style='color: #666; font-size: 14px; margin: 0;'>
              ¡Gracias por tu pago y nos vemos pronto!<br>
              Sistema de Gestión de Parques Urbanos
            </p>
          </div>
        </div>
      </div>`,
      textContent: `¡Pago Confirmado!

¡Perfecto, {{participantName}}!

Tu pago para {{activityTitle}} ha sido procesado exitosamente. ¡Tu lugar está completamente reservado!

DETALLES DEL PAGO:
- Monto: $\{{paymentAmount\}} MXN
- ID de Transacción: {{stripePaymentId}}
- Método: {{paymentMethod}}
- Fecha de Pago: {{paymentDate}}

DETALLES DE TU ACTIVIDAD:
- Actividad: {{activityTitle}}
- Parque: {{parkName}}
- Fecha: {{activityStartDate}}
- Hora: {{activityStartTime}}
- Ubicación: {{activityLocation}}

INFORMACIÓN IMPORTANTE:
- Tu inscripción está confirmada automáticamente al completar el pago
- Llega 15 minutos antes de la hora programada
- Trae ropa cómoda y adecuada para la actividad
- Presenta este email como comprobante en caso necesario
- Para cancelaciones, contacta al equipo con 24 horas de anticipación

ESTADO: PAGADO Y CONFIRMADO
Procesado el {{paymentDate}}

¡Gracias por tu pago y nos vemos pronto!
Sistema de Gestión de Parques Urbanos`,
      variables: ["{{participantName}}", "{{activityTitle}}", "{{parkName}}", "{{activityStartDate}}", "{{activityStartTime}}", "{{activityLocation}}", "{{paymentAmount}}", "{{stripePaymentId}}", "{{paymentMethod}}", "{{paymentDate}}"],
      usage: "Automática al confirmar pago Stripe",
      color: "bg-blue-600",
      icon: <DollarSign className="h-5 w-5" />
    }
  ];

  // Variables para paginación
  const ITEMS_PER_PAGE = 10;
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);

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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Plantilla de Email</DialogTitle>
                  <DialogDescription>
                    Diseñe una nueva plantilla de email para el sistema de comunicaciones
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="Ej: Bienvenida Nuevo Empleado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-category">Categoría</Label>
                      <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-module">Módulo del Sistema</Label>
                      <Select value={newTemplate.module} onValueChange={(value) => setNewTemplate({...newTemplate, module: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map((module) => (
                            <SelectItem key={module} value={module}>{module}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template-usage">Tipo de Uso</Label>
                      <Select value={newTemplate.usage} onValueChange={(value) => setNewTemplate({...newTemplate, usage: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automático</SelectItem>
                          <SelectItem value="scheduled">Programado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template-description">Descripción</Label>
                    <Textarea
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                      placeholder="Descripción del propósito de la plantilla..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-subject">Asunto del Email</Label>
                    <Input
                      id="template-subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                      placeholder="Ej: Bienvenido {{nombre_empleado}} - {{empresa}}"
                    />
                  </div>

                  {/* Variables */}
                  <div>
                    <Label>Variables Disponibles</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        value={newTemplate.newVariable}
                        onChange={(e) => setNewTemplate({...newTemplate, newVariable: e.target.value})}
                        placeholder="nombre_variable"
                        onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                      />
                      <Button type="button" onClick={addVariable} variant="outline">
                        Agregar
                      </Button>
                    </div>
                    {newTemplate.variables.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {newTemplate.variables.map((variable, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {variable}
                            <button
                              type="button"
                              onClick={() => removeVariable(index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contenido HTML */}
                  <div>
                    <Label htmlFor="template-html">Contenido HTML</Label>
                    <Textarea
                      id="template-html"
                      value={newTemplate.htmlContent}
                      onChange={(e) => setNewTemplate({...newTemplate, htmlContent: e.target.value})}
                      placeholder="<h1>Bienvenido {{nombre_empleado}}</h1><p>Su usuario es: {{username}}</p>"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Contenido de texto plano */}
                  <div>
                    <Label htmlFor="template-text">Contenido de Texto Plano (fallback)</Label>
                    <Textarea
                      id="template-text"
                      value={newTemplate.textContent}
                      onChange={(e) => setNewTemplate({...newTemplate, textContent: e.target.value})}
                      placeholder="Bienvenido {{nombre_empleado}}. Su usuario es: {{username}}"
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="template-active"
                      checked={newTemplate.isActive}
                      onCheckedChange={(checked) => setNewTemplate({...newTemplate, isActive: Boolean(checked)})}
                    />
                    <Label htmlFor="template-active">Plantilla activa</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsNewTemplateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateTemplate}
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                    disabled={!newTemplate.name || !newTemplate.category || !newTemplate.htmlContent}
                  >
                    Crear Plantilla
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </CardTitle>
          <CardDescription>
            Plantillas de email especializadas para el sistema de parques urbanos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTemplates.map((template) => (
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsViewTemplateOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setNewTemplate({
                              name: template.name,
                              category: template.category,
                              description: template.description,
                              subject: template.subject || '',
                              htmlContent: template.htmlContent || '',
                              textContent: template.textContent || '',
                              variables: template.variables || [],
                              newVariable: '',
                              usage: template.usage.includes('Manual') ? 'manual' : 'automatic',
                              module: template.category,
                              isActive: true
                            });
                            setIsEditTemplateOpen(true);
                          }}
                        >
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
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {currentTemplates.map((template) => (
                <Card key={template.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${template.color} text-white flex-shrink-0`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Uso: {template.usage}</span>
                            <span>{template.variables.length} variables</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsViewTemplateOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setNewTemplate({
                              name: template.name,
                              category: template.category,
                              description: template.description,
                              subject: template.subject || '',
                              htmlContent: template.htmlContent || '',
                              textContent: template.textContent || '',
                              variables: template.variables || [],
                              newVariable: '',
                              usage: template.usage.includes('Manual') ? 'manual' : 'automatic',
                              module: template.category,
                              isActive: true
                            });
                            setIsEditTemplateOpen(true);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTemplates.length)} de {filteredTemplates.length} plantillas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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

      {/* Dialog para Ver Plantilla */}
      <Dialog open={isViewTemplateOpen} onOpenChange={setIsViewTemplateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ver Plantilla: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Detalles completos de la plantilla de email
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre</Label>
                  <p className="text-sm text-gray-700">{selectedTemplate.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoría</Label>
                  <p className="text-sm text-gray-700">{selectedTemplate.category}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Asunto del Email</Label>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedTemplate.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Variables Disponibles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables?.map((variable: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contenido HTML</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono max-h-40 overflow-y-auto">
                    {selectedTemplate.htmlContent || 'No definido'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vista Previa</Label>
                  <div 
                    className="mt-2 p-3 border rounded max-h-40 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent || 'No hay contenido para mostrar' }}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Contenido de Texto</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {selectedTemplate.textContent || 'No definido'}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewTemplateOpen(false)}>
              Cerrar
            </Button>
            <Button 
              className="bg-[#00a587] hover:bg-[#067f5f]"
              onClick={() => {
                setIsViewTemplateOpen(false);
                setNewTemplate({
                  name: selectedTemplate?.name || '',
                  category: selectedTemplate?.category || '',
                  description: selectedTemplate?.description || '',
                  subject: selectedTemplate?.subject || '',
                  htmlContent: selectedTemplate?.htmlContent || '',
                  textContent: selectedTemplate?.textContent || '',
                  variables: selectedTemplate?.variables || [],
                  newVariable: '',
                  usage: selectedTemplate?.usage?.includes('Manual') ? 'manual' : 'automatic',
                  module: selectedTemplate?.category || '',
                  isActive: true
                });
                setIsEditTemplateOpen(true);
              }}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Plantilla */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plantilla: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la plantilla de email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-template-name">Nombre de la Plantilla</Label>
                <Input
                  id="edit-template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Ej: Bienvenida Nuevo Empleado"
                />
              </div>
              <div>
                <Label htmlFor="edit-template-category">Categoría</Label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-template-description">Descripción</Label>
              <Textarea
                id="edit-template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Descripción del propósito de la plantilla..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-template-subject">Asunto del Email</Label>
              <Input
                id="edit-template-subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                placeholder="Ej: Bienvenido {{nombre_empleado}} - {{empresa}}"
              />
            </div>

            {/* Variables */}
            <div>
              <Label>Variables Disponibles</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newTemplate.newVariable}
                  onChange={(e) => setNewTemplate({...newTemplate, newVariable: e.target.value})}
                  placeholder="nombre_variable"
                  onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                />
                <Button type="button" variant="outline" onClick={addVariable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {newTemplate.variables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                    <span>{variable}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeVariable(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenido HTML */}
            <div>
              <Label htmlFor="edit-template-html">Contenido HTML</Label>
              <Textarea
                id="edit-template-html"
                value={newTemplate.htmlContent}
                onChange={(e) => setNewTemplate({...newTemplate, htmlContent: e.target.value})}
                placeholder="<div>Contenido HTML del email...</div>"
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Contenido de texto */}
            <div>
              <Label htmlFor="edit-template-text">Contenido de Texto (Alternativo)</Label>
              <Textarea
                id="edit-template-text"
                value={newTemplate.textContent}
                onChange={(e) => setNewTemplate({...newTemplate, textContent: e.target.value})}
                placeholder="Versión en texto plano del email..."
                rows={6}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#00a587] hover:bg-[#067f5f]"
              onClick={() => {
                console.log('Guardando cambios en plantilla:', newTemplate);
                // Aquí iría la lógica para guardar la plantilla editada
                setIsEditTemplateOpen(false);
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const QueueSection: React.FC = () => {
  const [queueEmails, setQueueEmails] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [stats, setStats] = React.useState<any>({});
  const [selectedEmail, setSelectedEmail] = React.useState<any>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filtrar y paginar templates
  const itemsPerPage = 10;
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);

  // Obtener emails de la cola
  React.useEffect(() => {
    fetchQueueEmails();
    fetchQueueStats();
  }, []);

  const fetchQueueEmails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/communications/queue');
      if (response.ok) {
        const data = await response.json();
        setQueueEmails(data || []);
      }
    } catch (error) {
      console.error('Error fetching queue emails:', error);
      setQueueEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueueStats = async () => {
    try {
      const response = await fetch('/api/communications/queue/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data || {});
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    }
  };

  const processQueue = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/communications/queue/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cola procesada:', result);
        // Refrescar datos después del procesamiento
        await fetchQueueEmails();
        await fetchQueueStats();
      } else {
        console.error('Error al procesar la cola:', response.statusText);
      }
    } catch (error) {
      console.error('Error procesando cola:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const viewEmailContent = (email: any) => {
    setSelectedEmail(email);
    setEmailPreviewOpen(true);
  };

  const retryEmail = async (emailId: number) => {
    try {
      const response = await fetch(`/api/communications/queue/${emailId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "Email reintentado",
          description: "El email ha sido marcado para reintento",
        });
        await fetchQueueEmails();
      } else {
        toast({
          title: "Error",
          description: "No se pudo reintentar el email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      toast({
        title: "Error",
        description: "Error al reintentar el email",
        variant: "destructive",
      });
    }
  };

  const cancelEmail = async (emailId: number) => {
    try {
      const response = await fetch(`/api/communications/queue/${emailId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "Email cancelado",
          description: "El email ha sido cancelado exitosamente",
        });
        await fetchQueueEmails();
      } else {
        toast({
          title: "Error",
          description: "No se pudo cancelar el email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error canceling email:', error);
      toast({
        title: "Error",
        description: "Error al cancelar el email",
        variant: "destructive",
      });
    }
  };

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
              <Button 
                className="bg-[#00a587] hover:bg-[#067f5f]" 
                size="sm"
                onClick={processQueue}
                disabled={isProcessing || queueEmails.length === 0}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Procesar Ahora
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitoreo en tiempo real del procesamiento de emails programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando cola de emails...</p>
            </div>
          ) : queueEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cola vacía</h3>
              <p className="text-gray-500">No hay emails pendientes en la cola actualmente.</p>
            </div>
          ) : (
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
                      {email.templateId && (
                        <Badge variant="outline" className="text-xs">
                          Plantilla #{email.templateId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Para: {email.to}</p>
                    <p className="text-xs text-gray-500">
                      Programado: {new Date(email.scheduledFor).toLocaleString()}
                    </p>
                    {email.attempts > 0 && (
                      <p className="text-xs text-orange-600">
                        Intentos: {email.attempts}/{email.maxAttempts}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1 min-w-0">
                    <Badge className={`text-xs ${getStatusBadge(email.status)}`}>
                      {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(email.createdAt).toLocaleDateString()}
                    </p>
                    {email.errorMessage && (
                      <p className="text-xs text-red-500" title={email.errorMessage}>
                        Error ⚠️
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                    onClick={() => viewEmailContent(email)}
                    title="Ver contenido del email"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {email.status === 'failed' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      onClick={() => retryEmail(email.id)}
                      title="Reintentar envío"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {email.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      onClick={() => cancelEmail(email.id)}
                      title="Cancelar email"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
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
            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total procesados</span>
                  <span className="font-bold">{(stats.sent || 0) + (stats.failed || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Exitosos</span>
                  <span className="font-bold text-green-600">{stats.sent || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fallidos</span>
                  <span className="font-bold text-red-600">{stats.failed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En cola</span>
                  <span className="font-bold text-orange-600">{stats.pending || 0}</span>
                </div>
              </div>
            )}
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
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : queueEmails.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No hay emails en cola</p>
                <p className="text-gray-400 text-xs mt-1">Los módulos aparecerán aquí cuando haya actividad</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mostrar distribución real basada en metadata de emails */}
                {Object.entries(
                  queueEmails.reduce((acc, email) => {
                    const module = email.metadata?.department || email.metadata?.module || 'Sistema';
                    acc[module] = (acc[module] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([module, count], index) => {
                  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-indigo-500"];
                  return (
                    <div key={module} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="text-sm">{module}</span>
                      </div>
                      <span className="font-bold text-sm">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Vista Previa de Email */}
      <Dialog open={emailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Vista Previa del Email</span>
              {selectedEmail?.templateId && (
                <Badge variant="outline">
                  Plantilla #{selectedEmail.templateId}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedEmail?.to && `Para: ${selectedEmail.to}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Asunto:</Label>
                  <p className="text-gray-700">{selectedEmail.subject}</p>
                </div>
                <div>
                  <Label className="font-medium">Estado:</Label>
                  <Badge className={getStatusBadge(selectedEmail.status)}>
                    {selectedEmail.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Prioridad:</Label>
                  <Badge className={getPriorityBadge(selectedEmail.priority)}>
                    {selectedEmail.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Programado para:</Label>
                  <p className="text-gray-700">
                    {new Date(selectedEmail.scheduledFor).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedEmail.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="font-medium text-red-700">Error:</Label>
                  <p className="text-red-600 text-sm mt-1">{selectedEmail.errorMessage}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="font-medium">Contenido HTML:</Label>
                <div className="border rounded-lg p-4 bg-white">
                  <iframe
                    srcDoc={selectedEmail.htmlContent}
                    className="w-full h-96 border-0"
                    title="Vista previa del email"
                  />
                </div>
              </div>
              
              {selectedEmail.textContent && (
                <div className="space-y-2">
                  <Label className="font-medium">Contenido de Texto:</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedEmail.textContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const CampaignsSection: React.FC = () => {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    type: 'manual',
    targetSegment: '',
    template: '',
    startDate: '',
    endDate: '',
    frequency: 'once',
    customFrequency: '',
    priority: 'normal',
    sendImmediately: false,
    scheduledTime: '',
    targetUsers: [] as string[],
    includeInactive: false
  });
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

  const templates = [
    "Bienvenida Empleado",
    "Recibo de Nómina", 
    "Nueva Actividad en Parque",
    "Reconocimiento Voluntario",
    "Vencimiento de Contrato",
    "Mantenimiento de Activos",
    "Evaluación de Instructor",
    "Reporte de Incidente",
    "Actualización de Presupuesto",
    "Cuidado del Arbolado"
  ];

  const targetSegments = [
    { value: "todos_empleados", label: "Todos los Empleados", count: 185 },
    { value: "empleados_nuevos", label: "Empleados Nuevos", count: 15 },
    { value: "empleados_activos", label: "Empleados Activos", count: 170 },
    { value: "directivos", label: "Personal Directivo", count: 12 },
    { value: "instructores", label: "Instructores", count: 28 },
    { value: "usuarios_activos", label: "Usuarios Activos", count: 1250 },
    { value: "usuarios_premium", label: "Usuarios Premium", count: 89 },
    { value: "voluntarios_activos", label: "Voluntarios Activos", count: 45 },
    { value: "voluntarios_nuevos", label: "Voluntarios Nuevos", count: 8 },
    { value: "concesionarios", label: "Concesionarios", count: 8 },
    { value: "proveedores", label: "Proveedores", count: 23 }
  ];

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    // Aquí iría la lógica para crear la campaña
    setIsNewCampaignOpen(false);
    setNewCampaign({
      name: '',
      description: '',
      type: 'manual',
      targetSegment: '',
      template: '',
      startDate: '',
      endDate: '',
      frequency: 'once',
      customFrequency: '',
      priority: 'normal',
      sendImmediately: false,
      scheduledTime: '',
      targetUsers: [],
      includeInactive: false
    });
  };

  const getSegmentCount = (segmentValue: string) => {
    const segment = targetSegments.find(s => s.value === segmentValue);
    return segment ? segment.count : 0;
  };

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
            <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Campaña
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Campaña de Email</DialogTitle>
                  <DialogDescription>
                    Configure los detalles de su nueva campaña de comunicación
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                        <Input
                          id="campaign-name"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                          placeholder="Ej: Bienvenida Nuevos Empleados"
                        />
                      </div>
                      <div>
                        <Label htmlFor="campaign-template">Plantilla</Label>
                        <Select value={newCampaign.template} onValueChange={(value) => setNewCampaign({...newCampaign, template: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar plantilla" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template} value={template}>{template}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="campaign-description">Descripción</Label>
                      <Textarea
                        id="campaign-description"
                        value={newCampaign.description}
                        onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                        placeholder="Descripción de la campaña..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Tipo de campaña */}
                  <div>
                    <Label>Tipo de Campaña</Label>
                    <RadioGroup 
                      value={newCampaign.type} 
                      onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Manual - Envío controlado manualmente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled" id="scheduled" />
                        <Label htmlFor="scheduled">Programada - Envío en fechas específicas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="automated" id="automated" />
                        <Label htmlFor="automated">Automatizada - Triggers del sistema</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Segmentación */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="target-segment">Segmento Objetivo</Label>
                      <Select value={newCampaign.targetSegment} onValueChange={(value) => setNewCampaign({...newCampaign, targetSegment: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar audiencia" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetSegments.map((segment) => (
                            <SelectItem key={segment.value} value={segment.value}>
                              {segment.label} ({segment.count} usuarios)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newCampaign.targetSegment && (
                        <p className="text-sm text-gray-600 mt-1">
                          Destinatarios estimados: {getSegmentCount(newCampaign.targetSegment)} usuarios
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-inactive"
                        checked={newCampaign.includeInactive}
                        onCheckedChange={(checked) => setNewCampaign({...newCampaign, includeInactive: Boolean(checked)})}
                      />
                      <Label htmlFor="include-inactive">Incluir usuarios inactivos</Label>
                    </div>
                  </div>

                  {/* Programación */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Fecha de Inicio</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={newCampaign.startDate}
                          onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">Fecha de Fin</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={newCampaign.endDate}
                          onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                        />
                      </div>
                    </div>

                    {newCampaign.type !== 'automated' && (
                      <div>
                        <Label htmlFor="frequency">Frecuencia</Label>
                        <Select value={newCampaign.frequency} onValueChange={(value) => setNewCampaign({...newCampaign, frequency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Una sola vez</SelectItem>
                            <SelectItem value="daily">Diario</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                            <SelectItem value="custom">Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                        {newCampaign.frequency === 'custom' && (
                          <Input
                            className="mt-2"
                            placeholder="Especificar frecuencia personalizada"
                            value={newCampaign.customFrequency}
                            onChange={(e) => setNewCampaign({...newCampaign, customFrequency: e.target.value})}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Opciones avanzadas */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={newCampaign.priority} onValueChange={(value) => setNewCampaign({...newCampaign, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="send-immediately"
                        checked={newCampaign.sendImmediately}
                        onCheckedChange={(checked) => setNewCampaign({...newCampaign, sendImmediately: Boolean(checked)})}
                      />
                      <Label htmlFor="send-immediately">Enviar inmediatamente después de crear</Label>
                    </div>

                    {!newCampaign.sendImmediately && (
                      <div>
                        <Label htmlFor="scheduled-time">Hora Programada</Label>
                        <Input
                          id="scheduled-time"
                          type="datetime-local"
                          value={newCampaign.scheduledTime}
                          onChange={(e) => setNewCampaign({...newCampaign, scheduledTime: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign}
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                    disabled={!newCampaign.name || !newCampaign.template || !newCampaign.targetSegment}
                  >
                    Crear Campaña
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bulkSettings, setBulkSettings] = useState({
    subject: '',
    scheduledTime: '',
    priority: 'normal',
    batchSize: 100,
    delayBetweenBatches: 5,
    testMode: false,
    trackOpens: true,
    trackClicks: true,
    unsubscribeLink: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const availableSegments = [
    { id: "todos_empleados", name: "Todos los Empleados", count: 185, description: "Personal completo del sistema de parques" },
    { id: "empleados_activos", name: "Empleados Activos", count: 170, description: "Empleados con estado activo" },
    { id: "directivos", name: "Personal Directivo", count: 12, description: "Directores y coordinadores" },
    { id: "instructores", name: "Instructores", count: 28, description: "Instructores de actividades" },
    { id: "usuarios_activos", name: "Usuarios Activos", count: 1250, description: "Usuarios que han usado el sistema en 30 días" },
    { id: "usuarios_premium", name: "Usuarios Premium", count: 89, description: "Usuarios con membresía premium" },
    { id: "voluntarios_activos", name: "Voluntarios Activos", count: 45, description: "Voluntarios con participación reciente" },
    { id: "concesionarios", name: "Concesionarios", count: 8, description: "Empresas con contratos de concesión" },
    { id: "proveedores", name: "Proveedores", count: 23, description: "Proveedores de servicios" }
  ];

  const availableTemplates = [
    "Bienvenida Empleado",
    "Recibo de Nómina", 
    "Nueva Actividad en Parque",
    "Reconocimiento Voluntario",
    "Vencimiento de Contrato",
    "Mantenimiento de Activos",
    "Evaluación de Instructor",
    "Reporte de Incidente",
    "Actualización de Presupuesto",
    "Cuidado del Arbolado"
  ];

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const getTotalRecipients = () => {
    return selectedSegments.reduce((total, segmentId) => {
      const segment = availableSegments.find(s => s.id === segmentId);
      return total + (segment?.count || 0);
    }, 0);
  };

  const getEstimatedTime = () => {
    const totalRecipients = getTotalRecipients();
    const batches = Math.ceil(totalRecipients / bulkSettings.batchSize);
    const totalMinutes = batches * bulkSettings.delayBetweenBatches;
    return totalMinutes;
  };

  const handleBulkSend = () => {
    if (bulkSettings.testMode) {
      console.log('Modo de prueba - No se enviarán emails reales');
    }
    console.log('Envío masivo configurado:', {
      segments: selectedSegments,
      template: selectedTemplate,
      settings: bulkSettings,
      totalRecipients: getTotalRecipients()
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{selectedSegments.length}</p>
                <p className="text-xs text-gray-500">Segmentos Seleccionados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalRecipients().toLocaleString()}</p>
                <p className="text-xs text-gray-500">Destinatarios Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getEstimatedTime()}</p>
                <p className="text-xs text-gray-500">Minutos Estimados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{bulkSettings.batchSize}</p>
                <p className="text-xs text-gray-500">Emails por Lote</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración principal */}
      <div className="grid grid-cols-2 gap-6">
        {/* Selección de segmentos */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Audiencias</CardTitle>
            <CardDescription>
              Elige los segmentos de usuarios que recibirán el envío masivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableSegments.map((segment) => (
                <div 
                  key={segment.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedSegments.includes(segment.id) 
                      ? 'border-[#00a587] bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleSegment(segment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedSegments.includes(segment.id)}
                        onChange={() => {}}
                      />
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-sm text-gray-600">{segment.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {segment.count.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración del envío */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Envío</CardTitle>
            <CardDescription>
              Personaliza los parámetros del envío masivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bulk-template">Plantilla de Email</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template} value={template}>{template}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-subject">Asunto Personalizado (opcional)</Label>
              <Input
                id="bulk-subject"
                value={bulkSettings.subject}
                onChange={(e) => setBulkSettings({...bulkSettings, subject: e.target.value})}
                placeholder="Dejar vacío para usar asunto de plantilla"
              />
            </div>

            <div>
              <Label htmlFor="bulk-priority">Prioridad</Label>
              <Select 
                value={bulkSettings.priority} 
                onValueChange={(value) => setBulkSettings({...bulkSettings, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduled-time">Programar Envío (opcional)</Label>
              <Input
                id="scheduled-time"
                type="datetime-local"
                value={bulkSettings.scheduledTime}
                onChange={(e) => setBulkSettings({...bulkSettings, scheduledTime: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batch-size">Emails por Lote</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min="10"
                  max="1000"
                  value={bulkSettings.batchSize}
                  onChange={(e) => setBulkSettings({...bulkSettings, batchSize: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="batch-delay">Delay entre Lotes (min)</Label>
                <Input
                  id="batch-delay"
                  type="number"
                  min="1"
                  max="60"
                  value={bulkSettings.delayBetweenBatches}
                  onChange={(e) => setBulkSettings({...bulkSettings, delayBetweenBatches: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="test-mode"
                  checked={bulkSettings.testMode}
                  onCheckedChange={(checked) => setBulkSettings({...bulkSettings, testMode: Boolean(checked)})}
                />
                <Label htmlFor="test-mode">Modo de prueba (no envía emails reales)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="track-opens"
                  checked={bulkSettings.trackOpens}
                  onCheckedChange={(checked) => setBulkSettings({...bulkSettings, trackOpens: Boolean(checked)})}
                />
                <Label htmlFor="track-opens">Rastrear aperturas</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="track-clicks"
                  checked={bulkSettings.trackClicks}
                  onCheckedChange={(checked) => setBulkSettings({...bulkSettings, trackClicks: Boolean(checked)})}
                />
                <Label htmlFor="track-clicks">Rastrear clicks</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="unsubscribe-link"
                  checked={bulkSettings.unsubscribeLink}
                  onCheckedChange={(checked) => setBulkSettings({...bulkSettings, unsubscribeLink: Boolean(checked)})}
                />
                <Label htmlFor="unsubscribe-link">Incluir enlace de cancelación</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview y acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumen del Envío</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Ocultar' : 'Vista Previa'}
              </Button>
              <Button 
                onClick={handleBulkSend}
                className="bg-[#00a587] hover:bg-[#067f5f]"
                disabled={selectedSegments.length === 0 || !selectedTemplate}
              >
                <Send className="h-4 w-4 mr-2" />
                {bulkSettings.scheduledTime ? 'Programar Envío' : 'Enviar Ahora'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewMode && (
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">Segmentos seleccionados:</p>
                  <ul className="text-sm text-gray-600 mt-1">
                    {selectedSegments.map(segmentId => {
                      const segment = availableSegments.find(s => s.id === segmentId);
                      return segment && (
                        <li key={segmentId} className="flex justify-between">
                          <span>{segment.name}</span>
                          <span>{segment.count} usuarios</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm">Configuración:</p>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>Plantilla: {selectedTemplate || 'No seleccionada'}</p>
                    <p>Prioridad: {bulkSettings.priority}</p>
                    <p>Lotes de: {bulkSettings.batchSize} emails</p>
                    <p>Delay: {bulkSettings.delayBetweenBatches} minutos</p>
                    {bulkSettings.scheduledTime && (
                      <p>Programado: {new Date(bulkSettings.scheduledTime).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00a587]">{getTotalRecipients().toLocaleString()}</p>
                <p className="text-sm text-gray-500">Destinatarios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.ceil(getTotalRecipients() / bulkSettings.batchSize)}</p>
                <p className="text-sm text-gray-500">Lotes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{getEstimatedTime()}</p>
                <p className="text-sm text-gray-500">Minutos</p>
              </div>
            </div>
            
            {bulkSettings.testMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                MODO DE PRUEBA
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('delivery');

  // Datos de análisis de ejemplo
  const analyticsData = {
    overview: {
      totalSent: 2847,
      deliveryRate: 98.7,
      openRate: 42.3,
      clickRate: 18.6,
      unsubscribeRate: 0.8,
      bounceRate: 1.3
    },
    byModule: [
      { module: "HR", sent: 812, opens: 389, clicks: 178, color: "bg-blue-500" },
      { module: "Finanzas", sent: 694, opens: 315, clicks: 142, color: "bg-green-500" },
      { module: "Eventos", sent: 523, opens: 231, clicks: 89, color: "bg-purple-500" },
      { module: "Voluntarios", sent: 298, opens: 167, clicks: 72, color: "bg-orange-500" },
      { module: "Concesiones", sent: 187, opens: 94, clicks: 41, color: "bg-red-500" },
      { module: "Activos", sent: 165, opens: 78, clicks: 35, color: "bg-yellow-500" },
      { module: "Seguridad", sent: 112, opens: 58, clicks: 23, color: "bg-pink-500" },
      { module: "Arbolado", sent: 56, opens: 29, clicks: 12, color: "bg-teal-500" }
    ],
    recentCampaigns: [
      { name: "Bienvenida Q1 2025", sent: 15, opens: 13, clicks: 4, date: "2025-06-23", status: "completed" },
      { name: "Recibos Diciembre", sent: 185, opens: 174, clicks: 146, date: "2025-06-22", status: "completed" },
      { name: "Actividades Verano", sent: 0, opens: 0, clicks: 0, date: "2025-06-25", status: "draft" },
      { name: "Reconocimientos 2024", sent: 28, opens: 27, clicks: 12, date: "2025-06-20", status: "paused" },
      { name: "Vencimientos Contratos", sent: 3, opens: 3, clicks: 2, date: "2025-06-24", status: "active" }
    ],
    topPerformers: [
      { template: "Recibo de Nómina", opens: 94.1, clicks: 78.9, sent: 185 },
      { template: "Vencimiento de Contrato", opens: 100, clicks: 66.7, sent: 3 },
      { template: "Reconocimiento Voluntario", opens: 96.4, clicks: 42.1, sent: 28 },
      { template: "Bienvenida Empleado", opens: 87.5, clicks: 23.4, sent: 15 }
    ],
    weeklyTrend: [
      { week: "Sem 1", sent: 342, opens: 156, clicks: 67 },
      { week: "Sem 2", sent: 428, opens: 189, clicks: 84 },
      { week: "Sem 3", sent: 385, opens: 171, clicks: 76 },
      { week: "Sem 4", sent: 467, opens: 203, clicks: 92 }
    ]
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-700",
      active: "bg-blue-100 text-blue-700",
      draft: "bg-gray-100 text-gray-700",
      paused: "bg-orange-100 text-orange-700"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Métricas de rendimiento y reportes detallados</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Send className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.totalSent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Emails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.deliveryRate}%</p>
                <p className="text-xs text-gray-500">Tasa Entrega</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.openRate}%</p>
                <p className="text-xs text-gray-500">Tasa Apertura</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.clickRate}%</p>
                <p className="text-xs text-gray-500">Tasa Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.bounceRate}%</p>
                <p className="text-xs text-gray-500">Tasa Rebote</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.unsubscribeRate}%</p>
                <p className="text-xs text-gray-500">Cancelaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por módulos y campañas recientes */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Módulo</CardTitle>
            <CardDescription>
              Distribución de emails y engagement por módulo del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.byModule.map((module, index) => {
                const openRate = ((module.opens / module.sent) * 100).toFixed(1);
                const clickRate = ((module.clicks / module.sent) * 100).toFixed(1);
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${module.color}`}></div>
                      <div>
                        <p className="font-medium">{module.module}</p>
                        <p className="text-sm text-gray-600">{module.sent} emails enviados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{openRate}% apertura</p>
                      <p className="text-sm text-gray-600">{clickRate}% clicks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campañas Recientes</CardTitle>
            <CardDescription>
              Estado y rendimiento de las últimas campañas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recentCampaigns.map((campaign, index) => {
                const openRate = campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : '0.0';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <Badge className={`text-xs ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{campaign.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{campaign.sent} enviados</p>
                      <p className="text-xs text-gray-600">{openRate}% apertura</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plantillas top y tendencias */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plantillas Más Efectivas</CardTitle>
            <CardDescription>
              Ranking de plantillas por tasa de apertura y clicks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformers.map((template, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00a587] text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.template}</p>
                      <p className="text-xs text-gray-600">{template.sent} emails enviados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">{template.opens}% apertura</p>
                    <p className="text-sm text-orange-600">{template.clicks}% clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
            <CardDescription>
              Evolución del engagement en las últimas 4 semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.weeklyTrend.map((week, index) => {
                const openRate = ((week.opens / week.sent) * 100).toFixed(1);
                const clickRate = ((week.clicks / week.sent) * 100).toFixed(1);
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{week.week}</p>
                      <p className="text-sm text-gray-600">{week.sent} emails</p>
                    </div>
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-purple-600">{openRate}%</p>
                        <p className="text-xs text-gray-500">Apertura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-600">{clickRate}%</p>
                        <p className="text-xs text-gray-500">Clicks</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones y reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones y Reportes</CardTitle>
          <CardDescription>
            Herramientas para análisis detallado y exportación de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <FileText className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Reporte Completo</span>
              <span className="text-xs text-gray-500 text-center">Descargar PDF con todas las métricas</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <BarChart3 className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm font-medium">Exportar CSV</span>
              <span className="text-xs text-gray-500 text-center">Datos en formato CSV para análisis</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Settings className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm font-medium">Configurar Alertas</span>
              <span className="text-xs text-gray-500 text-center">Notificaciones automáticas</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <TrendingUp className="h-8 w-8 mb-2 text-orange-600" />
              <span className="text-sm font-medium">Análisis Avanzado</span>
              <span className="text-xs text-gray-500 text-center">Métricas personalizadas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};