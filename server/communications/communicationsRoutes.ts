import { Router, Request, Response } from 'express';
import { emailTemplateService } from './emailTemplateService';
import { emailQueueService } from './emailQueueService';
import { emailService } from '../email/emailService';
import { pool } from '../db';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';

export const communicationsRouter = Router();

// ===== PLANTILLAS DE EMAIL =====

// Obtener todas las plantillas
communicationsRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await emailTemplateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener plantillas por tipo
communicationsRouter.get('/templates/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const templates = await emailTemplateService.getTemplatesByType(type);
    res.json(templates);
  } catch (error) {
    console.error('Error obteniendo plantillas por tipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener plantillas por módulo
communicationsRouter.get('/templates/module/:moduleId', async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const templates = await emailTemplateService.getTemplatesByModule(moduleId);
    res.json(templates);
  } catch (error) {
    console.error('Error obteniendo plantillas por módulo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva plantilla
communicationsRouter.post('/templates', async (req: Request, res: Response) => {
  try {
    const template = await emailTemplateService.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creando plantilla:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar plantilla
communicationsRouter.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = await emailTemplateService.updateTemplate(id, req.body);
    res.json(template);
  } catch (error) {
    console.error('Error actualizando plantilla:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar plantilla
communicationsRouter.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await emailTemplateService.deleteTemplate(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener variables por módulo
communicationsRouter.get('/templates/variables/:moduleId', async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const variables = emailTemplateService.getModuleVariables(moduleId);
    res.json({ variables });
  } catch (error) {
    console.error('Error obteniendo variables:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Vista previa de plantilla
communicationsRouter.post('/templates/:id/preview', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const variables = req.body.variables || {};
    
    const processed = await emailTemplateService.processTemplate(id, variables);
    res.json(processed);
  } catch (error) {
    console.error('Error procesando vista previa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar plantilla
communicationsRouter.post('/templates/validate', async (req: Request, res: Response) => {
  try {
    const { htmlContent, variables } = req.body;
    const validation = await emailTemplateService.validateTemplate(htmlContent, variables);
    res.json(validation);
  } catch (error) {
    console.error('Error validando plantilla:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== COLA DE EMAILS =====

// Obtener emails en cola
communicationsRouter.get('/queue', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };
    
    const emails = await emailQueueService.getQueueEmails(filters);
    res.json(emails);
  } catch (error) {
    console.error('Error obteniendo cola de emails:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar email a la cola
communicationsRouter.post('/queue', async (req: Request, res: Response) => {
  try {
    const email = await emailQueueService.addToQueue(req.body);
    res.status(201).json(email);
  } catch (error) {
    console.error('Error agregando email a la cola:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cancelar email en cola
communicationsRouter.delete('/queue/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await emailQueueService.cancelEmail(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelando email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reintentar email fallido
communicationsRouter.post('/queue/:id/retry', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await emailQueueService.retryEmail(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reintentando email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de la cola
communicationsRouter.get('/queue/stats', async (req: Request, res: Response) => {
  try {
    const stats = await emailQueueService.getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Procesar cola inmediatamente
communicationsRouter.post('/queue/process', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Iniciando procesamiento manual de la cola...');
    const result = await emailQueueService.processQueue();
    console.log('✅ Procesamiento de cola completado:', result);
    res.json({ 
      success: true, 
      processed: result.processed || 0,
      failed: result.failed || 0,
      message: 'Cola procesada exitosamente'
    });
  } catch (error) {
    console.error('Error procesando cola:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== ENVÍO MASIVO =====

// Obtener tipos de usuarios disponibles
communicationsRouter.get('/users/types', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar consulta de tipos únicos de usuarios
    const userTypes = [
      { value: 'admin', label: 'Administradores', count: 0 },
      { value: 'employee', label: 'Empleados', count: 0 },
      { value: 'volunteer', label: 'Voluntarios', count: 0 },
      { value: 'instructor', label: 'Instructores', count: 0 },
      { value: 'concessionario', label: 'Concesionarios', count: 0 },
    ];
    
    res.json(userTypes);
  } catch (error) {
    console.error('Error obteniendo tipos de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuarios por tipo
communicationsRouter.get('/users/by-type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const usersList = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role
    }).from(users).where(eq(users.role, type));
    
    res.json(usersList);
  } catch (error) {
    console.error('Error obteniendo usuarios por tipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Envío masivo por tipos de usuario
communicationsRouter.post('/send/bulk', async (req: Request, res: Response) => {
  try {
    const {
      userTypes,
      templateId,
      templateVariables,
      subject,
      scheduledFor
    } = req.body;

    // Obtener usuarios de los tipos especificados
    const targetUsers = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role
    }).from(users).where(inArray(users.role, userTypes));

    // Preparar emails para la cola
    const emails = targetUsers.map((user: any) => ({
      to: user.email,
      subject: subject || 'Comunicación importante',
      templateId: templateId,
      templateVariables: {
        ...templateVariables,
        userName: user.fullName,
        userEmail: user.email,
        userRole: user.role
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      metadata: {
        bulkSend: true,
        userTypes: userTypes,
        userId: user.id
      }
    }));

    // Agregar a la cola
    const results = await emailQueueService.scheduleMultiple(emails);

    res.json({
      success: true,
      scheduled: results.length,
      recipients: targetUsers.length
    });

  } catch (error) {
    console.error('Error en envío masivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Envío directo (sin cola)
communicationsRouter.post('/send/direct', async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text } = req.body;
    
    const success = await emailService.sendEmail({
      to,
      subject,
      html,
      text
    });

    res.json({ success });
  } catch (error) {
    console.error('Error en envío directo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== CONTROL DE PROCESAMIENTO =====

// Pausar procesamiento de cola
communicationsRouter.post('/queue/pause', async (req: Request, res: Response) => {
  try {
    emailQueueService.pauseProcessing();
    res.json({ success: true, message: 'Procesamiento pausado' });
  } catch (error) {
    console.error('Error pausando procesamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reanudar procesamiento de cola
communicationsRouter.post('/queue/resume', async (req: Request, res: Response) => {
  try {
    emailQueueService.resumeProcessing();
    res.json({ success: true, message: 'Procesamiento reanudado' });
  } catch (error) {
    console.error('Error reanudando procesamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default communicationsRouter;