import { emailService } from "./emailService";

/**
 * Script de demostración para probar el sistema de email
 */
export async function demonstrateEmailSystem() {
  console.log('🚀 Iniciando demostración del sistema de email...');

  // 1. Probar conexión
  console.log('\n1. Probando conexión...');
  const connectionTest = await emailService.testConnection();
  console.log(`   Estado: ${connectionTest.success ? '✅ Conectado' : '❌ Error'}`);
  console.log(`   Método: ${connectionTest.method}`);
  if (connectionTest.error) {
    console.log(`   Error: ${connectionTest.error}`);
    return;
  }

  // 2. Email de bienvenida
  console.log('\n2. Enviando email de bienvenida...');
  const welcomeResult = await emailService.sendWelcomeEmail(
    'test@example.com',
    'Usuario Prueba',
    'password123'
  );
  console.log(`   Resultado: ${welcomeResult ? '✅ Enviado' : '❌ Error'}`);

  // 3. Notificación de evento
  console.log('\n3. Enviando notificación de evento...');
  const eventResult = await emailService.sendEventApprovalEmail(
    'test@example.com',
    'Concierto en el Parque',
    '15 de Julio 2025'
  );
  console.log(`   Resultado: ${eventResult ? '✅ Enviado' : '❌ Error'}`);

  // 4. Notificación de nómina
  console.log('\n4. Enviando notificación de nómina...');
  const payrollResult = await emailService.sendPayrollNotification(
    'test@example.com',
    'Juan Pérez',
    'Julio 2025',
    15000
  );
  console.log(`   Resultado: ${payrollResult ? '✅ Enviado' : '❌ Error'}`);

  // 5. Recordatorio de mantenimiento
  console.log('\n5. Enviando recordatorio de mantenimiento...');
  const maintenanceResult = await emailService.sendMaintenanceReminder(
    'test@example.com',
    'Podadora Modelo X123',
    '20 de Julio 2025'
  );
  console.log(`   Resultado: ${maintenanceResult ? '✅ Enviado' : '❌ Error'}`);

  console.log('\n🎉 Demostración completada');
}