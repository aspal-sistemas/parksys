import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { db } from '../db';
import { emailQueue, emailLogs, emailTemplates } from '../../shared/schema';
import { eq, and, lte, gte, desc, asc } from 'drizzle-orm';
import { emailService } from '../email/emailService';
import { emailTemplateService } from './emailTemplateService';

/**
 * Servicio avanzado para gestión de cola de emails
 */
export class EmailQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeScheduler();
  }

  /**
   * Inicializa el programador de tareas para procesar la cola
   */
  private initializeScheduler() {
    // Procesar cola cada minuto
    cron.schedule('* * * * *', async () => {
      if (!this.isProcessing) {
        await this.processQueue();
      }
    });

    // Limpiar logs antiguos cada día a las 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.cleanOldLogs();
    });

    console.log('📧 Programador de cola de emails iniciado');
  }

  /**
   * Agrega un email a la cola
   */
  async addToQueue(emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: number;
    templateVariables?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledFor?: Date;
    metadata?: Record<string, any>;
  }) {
    let htmlContent = emailData.htmlContent || '';
    let textContent = emailData.textContent || '';
    let subject = emailData.subject;

    // Si se proporciona un templateId, procesar la plantilla
    if (emailData.templateId && emailData.templateVariables) {
      const processed = await emailTemplateService.processTemplate(
        emailData.templateId,
        emailData.templateVariables
      );
      htmlContent = processed.html || '';
      textContent = processed.text || '';
      subject = processed.subject || emailData.subject;
    }

    const result = await db.insert(emailQueue).values({
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject,
      htmlContent,
      textContent,
      templateId: emailData.templateId,
      priority: emailData.priority || 'normal',
      scheduledFor: emailData.scheduledFor,
      metadata: emailData.metadata || {},
    }).returning();

    console.log(`📧 Email agregado a la cola: ${emailData.to} - ${subject}`);
    return result[0];
  }

  /**
   * Procesa la cola de emails
   */
  async processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Obtener emails pendientes que deben ser enviados
      const result = await pool.query(`
        SELECT * FROM email_queue 
        WHERE status = 'pending' 
        AND attempts <= max_attempts 
        AND scheduled_for <= NOW()
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2  
            WHEN 'normal' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END,
          created_at ASC
        LIMIT 50
      `);
      const pendingEmails = result.rows;

      if (pendingEmails.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`📧 Procesando ${pendingEmails.length} emails de la cola`);

      for (const email of pendingEmails) {
        await this.processEmail(email);
        
        // Pequeña pausa entre emails para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error('❌ Error procesando cola de emails:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesa un email individual
   */
  private async processEmail(email: any) {
    try {
      // Actualizar estado a "sending"
      await db.update(emailQueue)
        .set({ 
          status: 'sending',
          attempts: email.attempts + 1,
          updatedAt: new Date()
        })
        .where(eq(emailQueue.id, email.id));

      // Enviar el email
      const success = await emailService.sendEmail({
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        html: email.htmlContent,
        text: email.textContent,
      });

      if (success) {
        // Email enviado exitosamente
        await db.update(emailQueue)
          .set({
            status: 'sent',
            sentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(emailQueue.id, email.id));

        // Registrar en logs
        await this.logEmail(email, 'sent');

        console.log(`✅ Email enviado: ${email.to} - ${email.subject}`);
      } else {
        throw new Error('Falló el envío del email');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Verificar si se han agotado los intentos
      if (email.attempts + 1 >= email.maxAttempts) {
        await db.update(emailQueue)
          .set({
            status: 'failed',
            errorMessage,
            updatedAt: new Date()
          })
          .where(eq(emailQueue.id, email.id));

        await this.logEmail(email, 'failed', errorMessage);
        console.error(`❌ Email falló permanentemente: ${email.to} - ${errorMessage}`);
      } else {
        // Programar reintento en 5 minutos
        const retryAt = new Date();
        retryAt.setMinutes(retryAt.getMinutes() + 5);

        await db.update(emailQueue)
          .set({
            status: 'pending',
            errorMessage,
            scheduledFor: retryAt,
            updatedAt: new Date()
          })
          .where(eq(emailQueue.id, email.id));

        console.log(`⏰ Email programado para reintento: ${email.to} - Intento ${email.attempts + 1}`);
      }
    }
  }

  /**
   * Registra el resultado del envío en logs
   */
  private async logEmail(email: any, status: string, errorMessage?: string) {
    await db.insert(emailLogs).values({
      queueId: email.id,
      recipient: email.to,
      subject: email.subject,
      status,
      errorMessage,
      sentAt: status === 'sent' ? new Date() : null,
      provider: 'gmail', // O detectar automáticamente
    });
  }

  /**
   * Obtiene estadísticas de la cola
   */
  async getQueueStats() {
    // TODO: Implementar consultas de estadísticas usando Drizzle
    return {
      pending: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      scheduled: 0
    };
  }

  /**
   * Obtiene emails de la cola con filtros
   */
  async getQueueEmails(filters: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = db.select().from(emailQueue);

    if (filters.status) {
      query = query.where(eq(emailQueue.status, filters.status));
    }

    if (filters.priority) {
      query = query.where(eq(emailQueue.priority, filters.priority));
    }

    return await query
      .orderBy(desc(emailQueue.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);
  }

  /**
   * Cancela un email en cola
   */
  async cancelEmail(id: number) {
    await db.update(emailQueue)
      .set({
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(emailQueue.id, id));
  }

  /**
   * Reintenta un email fallido
   */
  async retryEmail(id: number) {
    await db.update(emailQueue)
      .set({
        status: 'pending',
        attempts: 0,
        errorMessage: null,
        scheduledFor: new Date(),
        updatedAt: new Date()
      })
      .where(eq(emailQueue.id, id));
  }

  /**
   * Limpia logs antiguos (más de 30 días)
   */
  private async cleanOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // TODO: Implementar limpieza de logs antiguos
    console.log('🧹 Limpieza de logs de email ejecutada');
  }

  /**
   * Programa un email masivo
   */
  async scheduleMultiple(emails: Array<{
    to: string;
    subject: string;
    htmlContent?: string;
    templateId?: number;
    templateVariables?: Record<string, any>;
    scheduledFor?: Date;
  }>) {
    const results = [];
    
    for (const emailData of emails) {
      const result = await this.addToQueue(emailData);
      results.push(result);
    }

    return results;
  }

  /**
   * Detiene el procesamiento (para mantenimiento)
   */
  pauseProcessing() {
    this.isProcessing = true;
    console.log('⏸️ Procesamiento de cola pausado');
  }

  /**
   * Reanuda el procesamiento
   */
  resumeProcessing() {
    this.isProcessing = false;
    console.log('▶️ Procesamiento de cola reanudado');
  }
}

export const emailQueueService = new EmailQueueService();