import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { pool } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
// Función simple de envío de email usando Nodemailer directamente
import nodemailer from 'nodemailer';

async function sendEmail(params: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  try {
    // Configurar transporter de Nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text
    });

    console.log(`✅ Email enviado correctamente a ${params.to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

const router = Router();

// Esquema para solicitud de recuperación
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

// Esquema para reseteo de contraseña
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

/**
 * Registra las rutas de recuperación de contraseña
 */
// Solicitar recuperación de contraseña
router.post('/password/forgot', async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      console.log(`🔑 Solicitud de recuperación para email: ${email}`);
      
      // Buscar usuario por email
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      const user = result.rows[0];
      
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return res.json({ 
          success: true, 
          message: 'Si el email existe, recibirás las instrucciones de recuperación.' 
        });
      }
      
      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora
      
      console.log(`🔑 Token generado para usuario ${user.id}: ${resetToken}`);
      
      // Limpiar tokens anteriores del usuario
      await pool.query(`
        DELETE FROM password_reset_tokens 
        WHERE user_id = $1 OR expires_at < NOW()
      `, [user.id]);
      
      // Guardar token en base de datos
      await pool.query(`
        INSERT INTO password_reset_tokens (user_id, email, token, expires_at, is_used, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
      `, [user.id, email, resetToken, expiresAt]);
      
      console.log(`🔑 Token guardado en base de datos para usuario ${user.id}`);
      
      // Crear enlace de recuperación - apunta al cliente React
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `${req.protocol}://${req.get('host')}`
        : 'http://localhost:5000';
      const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;
      
      // Enviar email de recuperación
      const emailSent = await sendEmail({
        to: email,
        subject: '🔐 Recuperación de Contraseña - ParkSys',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00a587 0%, #067f5f 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperación de Contraseña</h1>
              <p style="color: #e0f2f1; margin: 10px 0 0 0;">Sistema de Gestión de Parques Urbanos</p>
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Hola ${user.fullName || user.username},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en ParkSys. 
                Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #00a587; color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 8px; font-weight: bold; display: inline-block; 
                          box-shadow: 0 4px 12px rgba(0, 165, 135, 0.3);">
                  Restablecer Contraseña
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; font-weight: bold;">⚠️ Importante:</p>
                <ul style="color: #856404; margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Este enlace expira en <strong>1 hora</strong></li>
                  <li>Solo puedes usar este enlace una vez</li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetLink}" style="color: #00a587; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; margin: 0; font-size: 14px;">
                Este email fue enviado desde ParkSys - Sistema de Gestión de Parques Urbanos
              </p>
            </div>
          </div>
        `,
        text: `
          Recuperación de Contraseña - ParkSys
          
          Hola ${user.fullName || user.username},
          
          Recibimos una solicitud para restablecer tu contraseña. 
          Visita el siguiente enlace para crear una nueva contraseña:
          
          ${resetLink}
          
          Este enlace expira en 1 hora y solo puede usarse una vez.
          Si no solicitaste este cambio, ignora este email.
          
          - Equipo ParkSys
        `
      });
      
      if (emailSent) {
        console.log(`✅ Email de recuperación enviado exitosamente a ${email}`);
        res.json({ 
          success: true, 
          message: 'Se ha enviado un enlace de recuperación a tu email.' 
        });
      } else {
        console.error(`❌ Error al enviar email de recuperación a ${email}`);
        res.status(500).json({ 
          success: false, 
          message: 'Error al enviar el email de recuperación. Inténtalo más tarde.' 
        });
      }
      
    } catch (error) {
      console.error('Error en solicitud de recuperación:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  });
  
// Verificar token de recuperación
router.get('/password/verify-token/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      console.log(`🔍 Verificando token: ${token}`);
      
      // Buscar token válido
      const result = await pool.query(`
        SELECT prt.*, u.email, u.username, u.full_name
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.is_used = false
      `, [token]);
      
      if (result.rows.length === 0) {
        console.log(`❌ Token inválido o expirado: ${token}`);
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        });
      }
      
      const tokenData = result.rows[0];
      console.log(`✅ Token válido para usuario: ${tokenData.email}`);
      
      res.json({ 
        success: true, 
        user: {
          email: tokenData.email,
          username: tokenData.username,
          name: tokenData.fullName || tokenData.username
        }
      });
      
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  });
  
// Restablecer contraseña
router.post('/password/reset', async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      
      console.log(`🔄 Restableciendo contraseña con token: ${token}`);
      
      // Buscar token válido
      const result = await pool.query(`
        SELECT prt.*, u.id as user_id, u.email
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.used = false
      `, [token]);
      
      if (result.rows.length === 0) {
        console.log(`❌ Token inválido para reset: ${token}`);
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        });
      }
      
      const tokenData = result.rows[0];
      console.log(`🔄 Restableciendo contraseña para usuario: ${tokenData.email}`);
      
      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar contraseña del usuario
      await pool.query(`
        UPDATE users 
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
      `, [hashedPassword, tokenData.user_id]);
      
      // Marcar token como usado
      await pool.query(`
        UPDATE password_reset_tokens 
        SET used = true, used_at = NOW() 
        WHERE token = $1
      `, [token]);
      
      console.log(`✅ Contraseña restablecida exitosamente para usuario: ${tokenData.email}`);
      
      res.json({ 
        success: true, 
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' 
      });
      
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  });
  
console.log('🔑 Rutas de recuperación de contraseña registradas correctamente');

export default router;