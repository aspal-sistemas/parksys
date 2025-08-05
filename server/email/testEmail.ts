import { emailService } from "./emailService";

/**
 * Script de prueba rápida para verificar el sistema de email
 */
export async function testEmailConnection() {
  console.log('🧪 Probando conexión de email...');
  
  // Verificar variables de entorno
  console.log('GMAIL_USER configurado:', !!process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD configurado:', !!process.env.GMAIL_APP_PASSWORD);
  console.log('SENDGRID_API_KEY configurado:', !!process.env.SENDGRID_API_KEY);
  
  if (process.env.GMAIL_USER) {
    console.log('Email de usuario:', process.env.GMAIL_USER.substring(0, 3) + '***');
  }
  
  // Probar conexión
  try {
    const result = await emailService.testConnection();
    console.log('Resultado de la prueba:', result);
    
    if (result.success) {
      console.log('✅ Conexión exitosa usando:', result.method);
      
      // Opcional: enviar email de prueba
      const testResult = await emailService.sendEmail({
        to: process.env.GMAIL_USER || 'test@test.com',
        subject: 'Prueba ParkSys - Sistema de Email',
        html: `
          <h2>¡Sistema de Email Configurado!</h2>
          <p>Este email confirma que el sistema de correo de ParkSys está funcionando correctamente.</p>
          <p>Método utilizado: ${result.method}</p>
          <p>Enviado el: ${new Date().toLocaleString('es-MX')}</p>
        `
      });
      
      if (testResult) {
        console.log('✅ Email de prueba enviado exitosamente');
      } else {
        console.log('❌ Error enviando email de prueba');
      }
    } else {
      console.log('❌ Error de conexión:', result.error);
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}