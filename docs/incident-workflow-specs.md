# Especificaciones del Flujo de Trabajo de Incidencias

## Estados del Sistema

### Estados Principales
1. **pending** - Pendiente (recién reportada)
2. **assigned** - Asignada (a técnico/departamento)
3. **in_progress** - En Proceso (trabajos iniciados)
4. **review** - En Revisión (pendiente aprobación)
5. **resolved** - Resuelta (trabajo completado)
6. **closed** - Cerrada (validada y archivada)
7. **rejected** - Rechazada (no procede)

### Niveles de Severidad
- **critical** - Crítica (riesgo inmediato)
- **high** - Alta (requiere atención urgente)
- **medium** - Media (atención programada)
- **low** - Baja (mantenimiento rutinario)

### Niveles de Prioridad
- **urgent** - Urgente (mismo día)
- **high** - Alta (1-3 días)
- **normal** - Normal (1 semana)
- **low** - Baja (cuando sea posible)

## Funcionalidades Requeridas

### 1. Sistema de Asignaciones
- Asignar incidencias a usuarios específicos
- Asignar a departamentos/equipos
- Reasignación automática por disponibilidad
- Notificaciones de asignación

### 2. Sistema de Comentarios y Seguimiento
- Comentarios internos (staff)
- Comentarios públicos (ciudadanos)
- Historial de cambios de estado
- Timeline de actividades

### 3. Sistema de Archivos Adjuntos
- Fotos del problema inicial
- Fotos del progreso
- Fotos de la solución final
- Documentos técnicos
- Presupuestos y facturas

### 4. Sistema de Notificaciones
- Email al reportante
- SMS para urgentes
- Notificaciones push (app móvil)
- Dashboard de alertas

### 5. Sistema de Aprobaciones
- Workflow de aprobación por costos
- Aprobación de supervisores
- Aprobación de calidad
- Firma digital de trabajos

### 6. Integración con Otros Módulos
- Creación automática de órdenes de trabajo
- Integración con inventario de materiales
- Integración con sistema financiero
- Integración con mantenimiento preventivo

### 7. Métricas y Reportes
- Tiempo promedio de resolución
- Índice de satisfacción ciudadana
- Costos por tipo de incidencia
- Análisis de tendencias
- Reportes de productividad

### 8. Sistema de Escalamiento
- Escalamiento automático por tiempo
- Escalamiento por severidad
- Notificación a supervisores
- Alertas de SLA incumplido

## Tablas de Base de Datos Requeridas

### incident_assignments
- incident_id
- assigned_to_user_id
- assigned_by_user_id
- department_id
- assigned_at
- due_date
- notes

### incident_comments
- id
- incident_id
- user_id
- comment_text
- is_internal
- created_at
- updated_at

### incident_history
- id
- incident_id
- user_id
- action_type
- old_value
- new_value
- notes
- created_at

### incident_attachments
- id
- incident_id
- file_name
- file_path
- file_type
- file_size
- uploaded_by_user_id
- created_at

### incident_approvals
- id
- incident_id
- approval_type
- required_by_user_id
- approved_by_user_id
- approved_at
- status
- notes

### incident_notifications
- id
- incident_id
- user_id
- notification_type
- message
- sent_at
- read_at
- delivery_status

## API Endpoints Requeridos

### Gestión de Estados
- PUT /api/incidents/:id/assign
- PUT /api/incidents/:id/status
- PUT /api/incidents/:id/priority
- PUT /api/incidents/:id/severity

### Comentarios y Seguimiento
- GET /api/incidents/:id/comments
- POST /api/incidents/:id/comments
- GET /api/incidents/:id/history
- POST /api/incidents/:id/history

### Archivos Adjuntos
- GET /api/incidents/:id/attachments
- POST /api/incidents/:id/attachments
- DELETE /api/incidents/:id/attachments/:attachmentId

### Asignaciones
- GET /api/incidents/:id/assignments
- POST /api/incidents/:id/assign
- PUT /api/incidents/:id/reassign
- DELETE /api/incidents/:id/unassign

### Aprobaciones
- GET /api/incidents/:id/approvals
- POST /api/incidents/:id/approve
- POST /api/incidents/:id/reject

### Notificaciones
- GET /api/incidents/:id/notifications
- POST /api/incidents/:id/notify
- PUT /api/notifications/:id/mark-read

## Interfaces de Usuario Requeridas

### 1. Dashboard de Incidencias
- Vista general de estados
- Métricas en tiempo real
- Alertas y notificaciones
- Filtros avanzados

### 2. Formulario de Nueva Incidencia
- Campos obligatorios validados
- Geolocalización automática
- Subida de fotos
- Clasificación asistida

### 3. Vista de Detalle de Incidencia
- Información completa
- Timeline de actividades
- Comentarios y notas
- Archivos adjuntos
- Acciones disponibles

### 4. Panel de Asignaciones
- Lista de incidencias asignadas
- Calendario de trabajo
- Estado de progreso
- Herramientas de actualización

### 5. Sistema de Reportes
- Reportes predefinidos
- Constructor de reportes
- Exportación a PDF/Excel
- Programación automática

### 6. App Móvil para Técnicos
- Lista de trabajo del día
- Captura de fotos in-situ
- Actualización de estado
- Navegación GPS