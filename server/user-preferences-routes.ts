import { Router, Request, Response } from 'express';
import { pool } from './db';
import { z } from 'zod';

const router = Router();

// Esquema de validación para preferencias de notificaciones
const notificationPreferencesSchema = z.object({
  feedback: z.boolean().optional(),
  // Notificaciones granulares de retroalimentación ciudadana
  feedback_share: z.boolean().optional(),
  feedback_report_problem: z.boolean().optional(),
  feedback_suggest_improvement: z.boolean().optional(),
  feedback_propose_event: z.boolean().optional(),
  events: z.boolean().optional(),
  maintenance: z.boolean().optional(),
  payroll: z.boolean().optional(),
  system: z.boolean().optional(),
  volunteers: z.boolean().optional(),
  concessions: z.boolean().optional(),
  emergency: z.boolean().optional(),
});

// GET /api/users/:id/notification-preferences - Obtener preferencias de notificación
router.get("/:id/notification-preferences", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const query = `
      SELECT u.notification_preferences, r.name as role, u.full_name, u.email
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    
    // Preferencias por defecto basadas en el rol del usuario
    const defaultPreferences = getDefaultPreferencesForRole(user.role);
    const currentPreferences = user.notification_preferences || defaultPreferences;

    res.json({
      userId,
      role: user.role,
      fullName: user.full_name,
      email: user.email,
      preferences: currentPreferences,
      availableNotifications: getAvailableNotificationsForRole(user.role)
    });
  } catch (error) {
    console.error('Error obteniendo preferencias de notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id/notification-preferences - Actualizar preferencias de notificación
router.put("/:id/notification-preferences", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const validatedPreferences = notificationPreferencesSchema.parse(req.body);

    const query = `
      UPDATE users 
      SET notification_preferences = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, email, role_id, notification_preferences
    `;
    
    const result = await pool.query(query, [JSON.stringify(validatedPreferences), userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`✅ Preferencias actualizadas para usuario ${userId}:`, validatedPreferences);
    
    res.json({
      success: true,
      user: result.rows[0],
      message: 'Preferencias de notificación actualizadas exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de preferencias inválidos', details: error.errors });
    }
    console.error('Error actualizando preferencias de notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/notification-preferences/summary - Resumen de preferencias por rol
router.get("/notification-preferences/summary", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        r.name as role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN (u.notification_preferences->>'feedback')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as feedback_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'feedback_share')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as feedback_share_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'feedback_report_problem')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as feedback_report_problem_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'feedback_suggest_improvement')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as feedback_suggest_improvement_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'feedback_propose_event')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as feedback_propose_event_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'events')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as events_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'maintenance')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as maintenance_enabled,
        COUNT(CASE WHEN (u.notification_preferences->>'payroll')::boolean = true OR u.notification_preferences IS NULL THEN 1 END) as payroll_enabled
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('admin', 'super_admin', 'manager', 'instructor', 'volunteer', 'concessionaire')
      GROUP BY r.name
      ORDER BY r.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      summary: result.rows,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo resumen de preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para obtener preferencias por defecto según el rol
function getDefaultPreferencesForRole(role: string) {
  const basePreferences = {
    feedback: true,
    // Notificaciones granulares de retroalimentación ciudadana
    feedback_share: true,
    feedback_report_problem: true,
    feedback_suggest_improvement: true,
    feedback_propose_event: true,
    events: true,
    maintenance: false,
    payroll: false,
    system: true,
    volunteers: false,
    concessions: false,
    emergency: true
  };

  switch (role) {
    case 'admin':
    case 'super_admin':
      return {
        ...basePreferences,
        maintenance: true,
        payroll: true,
        volunteers: true,
        concessions: true
      };
    case 'manager':
      return {
        ...basePreferences,
        maintenance: true,
        volunteers: true
      };
    case 'instructor':
      return {
        feedback: false,
        feedback_share: false,
        feedback_report_problem: false,
        feedback_suggest_improvement: false,
        feedback_propose_event: false,
        events: true,
        maintenance: false,
        payroll: true,
        system: false,
        volunteers: false,
        concessions: false,
        emergency: true
      };
    case 'volunteer':
      return {
        feedback: false,
        feedback_share: false,
        feedback_report_problem: false,
        feedback_suggest_improvement: false,
        feedback_propose_event: false,
        events: true,
        maintenance: false,
        payroll: false,
        system: false,
        volunteers: true,
        concessions: false,
        emergency: true
      };
    case 'concessionaire':
      return {
        feedback: false,
        feedback_share: false,
        feedback_report_problem: false,
        feedback_suggest_improvement: false,
        feedback_propose_event: false,
        events: true,
        maintenance: false,
        payroll: false,
        system: false,
        volunteers: false,
        concessions: true,
        emergency: true
      };
    default:
      return basePreferences;
  }
}

// Función para obtener notificaciones disponibles según el rol
function getAvailableNotificationsForRole(role: string) {
  const allNotifications = [
    { key: 'feedback', label: 'Retroalimentación ciudadana', description: 'Recibir notificaciones cuando los ciudadanos envíen formularios de feedback' },
    // Notificaciones granulares de retroalimentación ciudadana
    { key: 'feedback_share', label: '  └─ Compartir experiencia', description: 'Recibir notificaciones cuando los ciudadanos compartan experiencias positivas' },
    { key: 'feedback_report_problem', label: '  └─ Reportar problema', description: 'Recibir notificaciones cuando los ciudadanos reporten problemas o incidencias' },
    { key: 'feedback_suggest_improvement', label: '  └─ Sugerir mejora', description: 'Recibir notificaciones cuando los ciudadanos sugieran mejoras' },
    { key: 'feedback_propose_event', label: '  └─ Proponer evento', description: 'Recibir notificaciones cuando los ciudadanos propongan nuevos eventos' },
    { key: 'events', label: 'Eventos y actividades', description: 'Notificaciones sobre nuevos eventos, cambios de horarios y solicitudes' },
    { key: 'maintenance', label: 'Mantenimiento e infraestructura', description: 'Reportes de mantenimiento, incidencias de activos y solicitudes de reparación' },
    { key: 'payroll', label: 'Nómina y recursos humanos', description: 'Notificaciones sobre recibos de nómina, vacaciones y temas de HR' },
    { key: 'system', label: 'Sistema y administración', description: 'Notificaciones del sistema, actualizaciones importantes y alertas administrativas' },
    { key: 'volunteers', label: 'Voluntarios', description: 'Notificaciones sobre solicitudes de voluntarios, evaluaciones y programas' },
    { key: 'concessions', label: 'Concesiones', description: 'Notificaciones sobre contratos, pagos y gestión de concesiones' },
    { key: 'emergency', label: 'Emergencias', description: 'Alertas de emergencia y situaciones críticas (siempre recomendado)' }
  ];

  // Filtrar notificaciones según el rol
  switch (role) {
    case 'admin':
    case 'super_admin':
      return allNotifications;
    case 'manager':
      return allNotifications.filter(n => !['payroll', 'concessions'].includes(n.key));
    case 'instructor':
      return allNotifications.filter(n => ['events', 'payroll', 'emergency'].includes(n.key));
    case 'volunteer':
      return allNotifications.filter(n => ['events', 'volunteers', 'emergency'].includes(n.key));
    case 'concessionaire':
      return allNotifications.filter(n => ['events', 'concessions', 'emergency'].includes(n.key));
    default:
      return allNotifications.filter(n => ['events', 'emergency'].includes(n.key));
  }
}

export { router as userPreferencesRouter };