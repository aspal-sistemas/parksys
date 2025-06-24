import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Configuración de SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configuración de Nodemailer para Gmail/Google Workspace
const nodemailerTransporter = nodemailer.createTransporter({
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
    this.defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'noreply@parquesdemexico.com';
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
    const msg = {
      to: options.to,
      from: options.from || this.defaultFrom,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType,
        disposition: 'attachment',
      })),
    };

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
        await nodemailerTransporter.verify();
        return { success: true, method: 'Gmail/Google Workspace' };
      }

      return { success: false, method: 'none', error: 'No hay configuración de email disponible' };
    } catch (error) {
      return { success: false, method: 'unknown', error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
}

export const emailService = new EmailService();
export default emailService;