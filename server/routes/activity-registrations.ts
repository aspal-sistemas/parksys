import { Router } from 'express';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { emailTemplateService } from '../communications/emailTemplateService';
import { emailQueueService } from '../communications/emailQueueService';

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Función auxiliar para enviar correo de confirmación de inscripción
async function sendRegistrationConfirmationEmail(registration: any, activity: any) {
  try {
    console.log('📧 Enviando correo de confirmación de inscripción...');
    
    // Obtener plantilla de confirmación
    const templates = await emailTemplateService.getTemplatesByType('activity_registration_pending');
    if (templates.length === 0) {
      console.error('❌ No se encontró plantilla de confirmación de inscripción');
      return false;
    }
    
    const template = templates[0];
    
    // Preparar variables para la plantilla
    const variables = {
      participantName: registration.participant_name,
      participantEmail: registration.participant_email,
      participantPhone: registration.participant_phone || 'No proporcionado',
      activityTitle: activity.title,
      activityStartDate: activity.start_date,
      activityStartTime: activity.start_time || 'Por confirmar',
      activityLocation: activity.location || 'Por confirmar',
      parkName: activity.park_name || 'Sistema de Parques',
      registrationDate: registration.registration_date,
      currentDate: format(new Date(), 'dd/MM/yyyy', { locale: es })
    };
    
    // Procesar plantilla
    const processedTemplate = await emailTemplateService.processTemplate(template.id, variables);
    
    // Agregar a la cola de emails
    await emailQueueService.addToQueue({
      to: registration.participant_email,
      subject: processedTemplate.subject,
      htmlContent: processedTemplate.htmlContent,
      textContent: processedTemplate.textContent,
      priority: 'high',
      templateId: template.id,
      variables: variables,
      metadata: {
        registrationId: registration.id,
        activityId: activity.id,
        emailType: 'registration_confirmation'
      }
    });
    
    console.log('✅ Correo de confirmación agregado a la cola');
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo de confirmación:', error);
    return false;
  }
}

// Función auxiliar para enviar correo de aprobación de inscripción
async function sendRegistrationApprovalEmail(registration: any, activity: any) {
  try {
    console.log('📧 Enviando correo de aprobación de inscripción...');
    
    // Obtener plantilla de aprobación
    const templates = await emailTemplateService.getTemplatesByType('activity_registration_approved');
    if (templates.length === 0) {
      console.error('❌ No se encontró plantilla de aprobación de inscripción');
      return false;
    }
    
    const template = templates[0];
    
    // Preparar variables para la plantilla
    const variables = {
      participantName: registration.participant_name,
      participantEmail: registration.participant_email,
      activityTitle: activity.title,
      activityStartDate: activity.start_date,
      activityStartTime: activity.start_time || 'Por confirmar',
      activityLocation: activity.location || 'Por confirmar',
      parkName: activity.park_name || 'Sistema de Parques',
      approvalDate: registration.approved_at || new Date(),
      currentDate: format(new Date(), 'dd/MM/yyyy', { locale: es })
    };
    
    // Procesar plantilla
    const processedTemplate = await emailTemplateService.processTemplate(template.id, variables);
    
    // Agregar a la cola de emails
    await emailQueueService.addToQueue({
      to: registration.participant_email,
      subject: processedTemplate.subject,
      htmlContent: processedTemplate.htmlContent,
      textContent: processedTemplate.textContent,
      priority: 'high',
      templateId: template.id,
      variables: variables,
      metadata: {
        registrationId: registration.id,
        activityId: activity.id,
        emailType: 'registration_approval'
      }
    });
    
    console.log('✅ Correo de aprobación agregado a la cola');
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo de aprobación:', error);
    return false;
  }
}

// Obtener todas las inscripciones con paginación y filtros
router.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      status = '', 
      activity = '' 
    } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Filtro de búsqueda
    if (search) {
      whereConditions.push(`(
        ar.participant_name ILIKE $${paramIndex} OR 
        ar.participant_email ILIKE $${paramIndex} OR
        a.title ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro de estado
    if (status) {
      whereConditions.push(`ar.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Filtro de actividad
    if (activity) {
      whereConditions.push(`ar.activity_id = $${paramIndex}`);
      queryParams.push(parseInt(activity as string));
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Consulta principal con JOIN a activities y parks
    const registrationsQuery = `
      SELECT 
        ar.*,
        a.title as activity_title,
        a.start_date as activity_start_date,
        a.end_date as activity_end_date,
        a.start_time as activity_start_time,
        a.end_time as activity_end_time,
        a.location as activity_location,
        a.max_registrations as activity_max_registrations,
        p.name as park_name
      FROM activity_registrations ar
      LEFT JOIN activities a ON ar.activity_id = a.id
      LEFT JOIN parks p ON a.park_id = p.id
      WHERE ${whereClause}
      ORDER BY ar.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Consulta de conteo total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activity_registrations ar
      LEFT JOIN activities a ON ar.activity_id = a.id
      WHERE ${whereClause}
    `;

    const [registrations, totalResult] = await Promise.all([
      sql(registrationsQuery, [...queryParams, parseInt(limit as string), offset]),
      sql(countQuery, queryParams)
    ]);

    const total = parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / parseInt(limit as string));

    // Formatear los datos de respuesta
    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg.id,
      activityId: reg.activity_id,
      participantName: reg.participant_name,
      participantEmail: reg.participant_email,
      participantPhone: reg.participant_phone,
      age: reg.age,
      emergencyContactName: reg.emergency_contact_name,
      emergencyPhone: reg.emergency_phone,
      medicalConditions: reg.medical_conditions,
      dietaryRestrictions: reg.dietary_restrictions,
      status: reg.status,
      registrationDate: reg.registration_date,
      approvedBy: reg.approved_by,
      approvedAt: reg.approved_at,
      rejectionReason: reg.rejection_reason,
      notes: reg.notes,
      acceptsTerms: reg.accepts_terms,
      createdAt: reg.created_at,
      updatedAt: reg.updated_at,
      activity: {
        id: reg.activity_id,
        title: reg.activity_title,
        startDate: reg.activity_start_date,
        endDate: reg.activity_end_date,
        startTime: reg.activity_start_time,
        endTime: reg.activity_end_time,
        location: reg.activity_location,
        maxRegistrations: reg.activity_max_registrations,
        park: reg.park_name ? { name: reg.park_name } : null
      }
    }));

    res.json({
      registrations: formattedRegistrations,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva inscripción
router.post('/', async (req, res) => {
  try {
    const {
      activityId,
      participantName,
      participantEmail,
      participantPhone,
      age,
      emergencyContactName,
      emergencyPhone,
      medicalConditions,
      dietaryRestrictions,
      notes,
      acceptsTerms
    } = req.body;

    // Validaciones básicas
    if (!activityId || !participantName || !participantEmail) {
      return res.status(400).json({ 
        error: 'Los campos activityId, participantName y participantEmail son obligatorios' 
      });
    }

    if (!acceptsTerms) {
      return res.status(400).json({ 
        error: 'Debe aceptar los términos y condiciones' 
      });
    }

    // Verificar si la actividad existe y permite inscripciones
    const activityCheck = await sql(`
      SELECT id, registration_enabled, max_registrations, registration_deadline
      FROM activities 
      WHERE id = $1 AND registration_enabled = true
    `, [activityId]);

    if (activityCheck.length === 0) {
      return res.status(404).json({ 
        error: 'La actividad no existe o no permite inscripciones públicas' 
      });
    }

    const activity = activityCheck[0];

    // Verificar fecha límite de inscripción
    if (activity.registration_deadline) {
      const deadlineDate = new Date(activity.registration_deadline);
      const now = new Date();
      if (now > deadlineDate) {
        return res.status(400).json({ 
          error: 'La fecha límite de inscripción ha expirado' 
        });
      }
    }

    // Verificar capacidad máxima
    if (activity.max_registrations) {
      const currentRegistrations = await sql(`
        SELECT COUNT(*) as count 
        FROM activity_registrations 
        WHERE activity_id = $1 AND status IN ('pending', 'approved')
      `, [activityId]);

      if (parseInt(currentRegistrations[0].count) >= activity.max_registrations) {
        return res.status(400).json({ 
          error: 'La actividad ha alcanzado su capacidad máxima' 
        });
      }
    }

    // Verificar si el email ya está registrado para esta actividad
    const existingRegistration = await sql(`
      SELECT id FROM activity_registrations 
      WHERE activity_id = $1 AND participant_email = $2
    `, [activityId, participantEmail]);

    if (existingRegistration.length > 0) {
      return res.status(400).json({ 
        error: 'Este email ya está registrado para esta actividad' 
      });
    }

    // Crear la inscripción
    const result = await sql(`
      INSERT INTO activity_registrations (
        activity_id, participant_name, participant_email, participant_phone,
        age, emergency_contact_name, emergency_phone, medical_conditions,
        dietary_restrictions, notes, accepts_terms, status, registration_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      activityId, participantName, participantEmail, participantPhone,
      age, emergencyContactName, emergencyPhone, medicalConditions,
      dietaryRestrictions, notes, acceptsTerms
    ]);

    const newRegistration = result[0];

    // Obtener datos completos de la actividad para el correo
    const activityData = await sql(`
      SELECT a.*, p.name as park_name
      FROM activities a
      LEFT JOIN parks p ON a.park_id = p.id
      WHERE a.id = $1
    `, [activityId]);

    // Enviar correo de confirmación automáticamente (en segundo plano)
    if (activityData.length > 0) {
      setTimeout(async () => {
        await sendRegistrationConfirmationEmail(newRegistration, activityData[0]);
      }, 1000);
    }

    res.status(201).json({
      message: 'Inscripción creada exitosamente. Se enviará un correo de confirmación a su email.',
      registration: newRegistration
    });
  } catch (error) {
    console.error('Error al crear inscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de inscripción (aprobar/rechazar)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Estado debe ser "approved" o "rejected"' 
      });
    }

    // Verificar que la inscripción existe
    const existingRegistration = await sql(`
      SELECT * FROM activity_registrations WHERE id = $1
    `, [id]);

    if (existingRegistration.length === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    // Actualizar el estado
    let updateQuery = `
      UPDATE activity_registrations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    let queryParams = [status];

    if (status === 'approved') {
      updateQuery += `, approved_at = CURRENT_TIMESTAMP, approved_by = $2`;
      queryParams.push(1); // TODO: usar ID del usuario autenticado
    } else if (status === 'rejected' && rejectionReason) {
      updateQuery += `, rejection_reason = $2`;
      queryParams.push(rejectionReason);
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING *`;
    queryParams.push(id);

    const result = await sql(updateQuery, queryParams);
    const updatedRegistration = result[0];

    // Si la inscripción fue aprobada, enviar correo de aprobación
    if (status === 'approved') {
      // Obtener dados completos de la actividad para el correo
      const activityData = await sql(`
        SELECT a.*, p.name as park_name
        FROM activities a
        LEFT JOIN parks p ON a.park_id = p.id
        WHERE a.id = $1
      `, [updatedRegistration.activity_id]);

      if (activityData.length > 0) {
        setTimeout(async () => {
          await sendRegistrationApprovalEmail(updatedRegistration, activityData[0]);
        }, 1000);
      }
    }

    res.json({
      message: `Inscripción ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente${status === 'approved' ? '. Se enviará un correo de confirmación al participante.' : ''}`,
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener detalles de una inscripción específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql(`
      SELECT 
        ar.*,
        a.title as activity_title,
        a.start_date as activity_start_date,
        a.end_date as activity_end_date,
        a.start_time as activity_start_time,
        a.end_time as activity_end_time,
        a.location as activity_location,
        p.name as park_name
      FROM activity_registrations ar
      LEFT JOIN activities a ON ar.activity_id = a.id
      LEFT JOIN parks p ON a.park_id = p.id
      WHERE ar.id = $1
    `, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    const registration = result[0];
    const formattedRegistration = {
      id: registration.id,
      activityId: registration.activity_id,
      participantName: registration.participant_name,
      participantEmail: registration.participant_email,
      participantPhone: registration.participant_phone,
      age: registration.age,
      emergencyContactName: registration.emergency_contact_name,
      emergencyPhone: registration.emergency_phone,
      medicalConditions: registration.medical_conditions,
      dietaryRestrictions: registration.dietary_restrictions,
      status: registration.status,
      registrationDate: registration.registration_date,
      approvedBy: registration.approved_by,
      approvedAt: registration.approved_at,
      rejectionReason: registration.rejection_reason,
      notes: registration.notes,
      acceptsTerms: registration.accepts_terms,
      createdAt: registration.created_at,
      updatedAt: registration.updated_at,
      activity: {
        id: registration.activity_id,
        title: registration.activity_title,
        startDate: registration.activity_start_date,
        endDate: registration.activity_end_date,
        startTime: registration.activity_start_time,
        endTime: registration.activity_end_time,
        location: registration.activity_location,
        park: registration.park_name ? { name: registration.park_name } : null
      }
    };

    res.json(formattedRegistration);
  } catch (error) {
    console.error('Error al obtener inscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar inscripción
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql(`
      DELETE FROM activity_registrations WHERE id = $1 RETURNING *
    `, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    res.json({ message: 'Inscripción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;