import { Router, Request, Response } from 'express';
import { pool } from './db';
import { z } from 'zod';

const router = Router();

// Esquema de validación para preferencias de notificaciones
const notificationPreferencesSchema = z.object({
  feedback: z.boolean().optional(),
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
      SELECT notification_preferences, role, full_name, email
      FROM users 
      WHERE id = $1
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
      RETURNING id, full_name, email, role, notification_preferences
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
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN (notification_preferences->>'feedback')::boolean = true OR notification_preferences IS NULL THEN 1 END) as feedback_enabled,
        COUNT(CASE WHEN (notification_preferences->>'events')::boolean = true OR notification_preferences IS NULL THEN 1 END) as events_enabled,
        COUNT(CASE WHEN (notification_preferences->>'maintenance')::boolean = true OR notification_preferences IS NULL THEN 1 END) as maintenance_enabled,
        COUNT(CASE WHEN (notification_preferences->>'payroll')::boolean = true OR notification_preferences IS NULL THEN 1 END) as payroll_enabled
      FROM users 
      WHERE role IN ('admin', 'super_admin', 'manager', 'instructor', 'volunteer', 'concessionaire')
      GROUP BY role
      ORDER BY role
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