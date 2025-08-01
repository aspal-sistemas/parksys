import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Configuración de SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configuración de Nodemailer para Gmail/Google Workspace
const nodemailerTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER, // Email de Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Google
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  templateId: string;
  dynamicTemplateData: Record<string, any>;
}

class EmailService {
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = 'aspallatam@gmail.com';
  }

  /**
   * Envía un email usando SendGrid (preferido) o Nodemailer como fallback
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Intentar con SendGrid primero
      if (process.env.SENDGRID_API_KEY) {
        return await this.sendWithSendGrid(options);
      }
      
      // Fallback a Gmail/Nodemailer
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return await this.sendWithNodemailer(options);
      }

      console.error('No hay configuración de email disponible');
      return false;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  /**
   * Envía email usando plantilla de SendGrid
   */
  async sendTemplate(to: string | string[], template: EmailTemplate): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key requerida para plantillas');
      return false;
    }

    try {
      const msg = {
        to: Array.isArray(to) ? to : [to],
        from: this.defaultFrom,
        templateId: template.templateId,
        dynamicTemplateData: template.dynamicTemplateData,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error enviando plantilla:', error);
      return false;
    }
  }

  /**
   * Envía email de bienvenida a nuevo usuario
   */
  async sendWelcomeEmail(userEmail: string, userName: string, temporaryPassword?: string): Promise<boolean> {
    const subject = 'Bienvenido al Sistema ParkSys';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00a587;">¡Bienvenido a ParkSys!</h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente en el Sistema de Gestión de Parques.</p>
        ${temporaryPassword ? `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #067f5f;">Credenciales de acceso:</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
            <p style="color: #dc3545; font-size: 14px;">
              <em>Por favor cambia tu contraseña en el primer inicio de sesión.</em>
            </p>
          </div>
        ` : ''}
        <p>Puedes acceder al sistema en: <a href="${process.env.APP_URL || 'https://parquesistema.com'}" style="color: #00a587;">ParkSys</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Este es un mensaje automático del Sistema ParkSys.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Envía notificación de evento aprobado
   */
  async sendEventApprovalEmail(userEmail: string, eventTitle: string, eventDate: string): Promise<boolean> {
    const subject = `Evento Aprobado: ${eventTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00a587;">¡Evento Aprobado!</h2>
        <p>Tu solicitud de evento ha sido <strong style="color: #28a745;">APROBADA</strong>.</p>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #067f5f;">Detalles del evento:</h3>
          <p><strong>Título:</strong> ${eventTitle}</p>
          <p><strong>Fecha:</strong> ${eventDate}</p>
        </div>
        <p>Recibirás más información sobre los siguientes pasos próximamente.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Sistema ParkSys - Gestión de Eventos
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Envía notificación de nómina procesada
   */
  async sendPayrollNotification(userEmail: string, userName: string, period: string, netAmount: number): Promise<boolean> {
    const subject = `Nómina Procesada - ${period}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00a587;">Nómina Procesada</h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tu nómina correspondiente al período <strong>${period}</strong> ha sido procesada.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #067f5f;">Resumen:</h3>
          <p><strong>Período:</strong> ${period}</p>
          <p><strong>Monto neto:</strong> $${netAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <p>Puedes descargar tu recibo de nómina desde el sistema.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Sistema ParkSys - Recursos Humanos
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Envía notificación de nueva retroalimentación ciudadana
   */
  async sendFeedbackNotification(
    adminEmail: string, 
    feedbackData: {
      parkName: string;
      formType: string;
      fullName: string;
      email: string;
      subject?: string;
      message: string;
      priority: string;
      createdAt: string;
    }
  ): Promise<boolean> {
    const formTypeLabels = {
      share: 'Comentario General',
      report_problem: 'Reporte de Problema',
      suggest_improvement: 'Sugerencia de Mejora',
      propose_event: 'Propuesta de Evento'
    };

    const priorityLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    const formTypeLabel = formTypeLabels[feedbackData.formType as keyof typeof formTypeLabels] || feedbackData.formType;
    const priorityLabel = priorityLabels[feedbackData.priority as keyof typeof priorityLabels] || feedbackData.priority;

    const subject = `Nueva Retroalimentación Ciudadana: ${formTypeLabel} - ${feedbackData.parkName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00a587; margin: 0;">🏞️ ParkSys</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0;">Sistema de Gestión de Parques</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00a587; margin-bottom: 25px;">
            <h2 style="color: #067f5f; margin: 0 0 10px 0;">📝 Nueva Retroalimentación Ciudadana</h2>
            <p style="margin: 0; color: #28a745; font-weight: bold;">Se ha recibido una nueva ${formTypeLabel.toLowerCase()}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #067f5f; margin: 0 0 15px 0;">Detalles de la Retroalimentación</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">🏞️ Parque:</strong>
              <span style="color: #6c757d; margin-left: 10px;">${feedbackData.parkName}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">📋 Tipo:</strong>
              <span style="color: #6c757d; margin-left: 10px;">${formTypeLabel}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">⚡ Prioridad:</strong>
              <span style="color: ${feedbackData.priority === 'urgent' ? '#dc3545' : feedbackData.priority === 'high' ? '#fd7e14' : '#28a745'}; margin-left: 10px; font-weight: bold;">
                ${priorityLabel}
              </span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">👤 Ciudadano:</strong>
              <span style="color: #6c757d; margin-left: 10px;">${feedbackData.fullName}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">📧 Email:</strong>
              <span style="color: #6c757d; margin-left: 10px;">${feedbackData.email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">📅 Fecha:</strong>
              <span style="color: #6c757d; margin-left: 10px;">${new Date(feedbackData.createdAt).toLocaleDateString('es-MX', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}</span>
            </div>

            ${feedbackData.subject ? `
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">💬 Asunto:</strong>
                <span style="color: #6c757d; margin-left: 10px;">${feedbackData.subject}</span>
              </div>
            ` : ''}
          </div>

          <div style="background: white; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #067f5f; margin: 0 0 15px 0;">💬 Mensaje del Ciudadano</h3>
            <p style="color: #495057; line-height: 1.6; white-space: pre-wrap; margin: 0;">${feedbackData.message}</p>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${process.env.APP_URL || 'https://parquesistema.com'}/admin/visitors/feedback" 
               style="background: #00a587; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              📊 Ver en Panel Administrativo
            </a>
          </div>

          <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center;">
            <p style="color: #6c757d; font-size: 14px; margin: 0;">
              Este es un mensaje automático del Sistema ParkSys<br>
              <strong>Gestión de Retroalimentación Ciudadana</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject,
      html,
    });
  }

  /**
   * Envía recordatorio de mantenimiento de activos
   */
  async sendMaintenanceReminder(userEmail: string, assetName: string, dueDate: string): Promise<boolean> {
    const subject = `Recordatorio: Mantenimiento Programado - ${assetName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ffc107;">⚠️ Recordatorio de Mantenimiento</h2>
        <p>Se aproxima una fecha de mantenimiento programado.</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404;">Detalles:</h3>
          <p><strong>Activo:</strong> ${assetName}</p>
          <p><strong>Fecha programada:</strong> ${dueDate}</p>
        </div>
        <p>Por favor programa el mantenimiento correspondiente.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Sistema ParkSys - Gestión de Activos
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    const msg: any = {
      to: options.to,
      from: options.from || this.defaultFrom,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
    };

    // Agregar contenido
    if (options.html) {
      msg.html = options.html;
    }
    if (options.text) {
      msg.text = options.text;
    }

    // Agregar attachments si existen
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType,
        disposition: 'attachment',
      }));
    }

    await sgMail.send(msg);
    return true;
  }

  private async sendWithNodemailer(options: EmailOptions): Promise<boolean> {
    const mailOptions = {
      from: options.from || this.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
      bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    await nodemailerTransporter.sendMail(mailOptions);
    return true;
  }

  /**
   * Verifica la configuración del servicio de email
   */
  async testConnection(): Promise<{ success: boolean; method: string; error?: string }> {
    try {
      if (process.env.SENDGRID_API_KEY) {
        // Test SendGrid
        await this.sendEmail({
          to: this.defaultFrom,
          subject: 'Test de Conexión SendGrid',
          text: 'Este es un email de prueba para verificar la configuración de SendGrid.',
        });
        return { success: true, method: 'SendGrid' };
      }

      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        // Test Gmail/Nodemailer
        try {
          await nodemailerTransporter.verify();
          return { success: true, method: 'Gmail/Google Workspace' };
        } catch (gmailError) {
          return { success: false, method: 'Gmail/Google Workspace', error: `Error de Gmail: ${gmailError instanceof Error ? gmailError.message : 'Error desconocido'}` };
        }
      }

      return { success: false, method: 'none', error: 'No hay configuración de email disponible' };
    } catch (error) {
      return { success: false, method: 'unknown', error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
}

export const emailService = new EmailService();
export default emailService;