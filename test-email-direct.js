// Test directo del sistema de email
import nodemailer from 'nodemailer';

console.log('🧪 Probando email directamente...');

// Verificar variables de entorno
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'configurado' : 'no configurado');
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'configurado' : 'no configurado');

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  console.log('Email configurado:', process.env.GMAIL_USER);
  
  // Crear transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    console.log('Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión exitosa');
    
    // Enviar email de prueba
    console.log('Enviando email de prueba...');
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: 'Prueba ParkSys - Email funcionando',
      html: `
        <h2>✅ Sistema de Email Configurado</h2>
        <p>Este email confirma que el sistema de correo de ParkSys está funcionando correctamente.</p>
        <p>Enviado el: ${new Date().toLocaleString('es-MX')}</p>
      `
    });
    
    console.log('✅ Email enviado exitosamente:', result.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
} else {
  console.log('❌ Credenciales no configuradas');
}