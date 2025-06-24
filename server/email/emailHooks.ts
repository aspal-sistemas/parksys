import { emailService } from "./emailService";

/**
 * Hook para enviar email automático cuando se crea un empleado
 */
export async function onEmployeeCreated(employeeData: {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword?: string;
}) {
  try {
    const fullName = `${employeeData.firstName} ${employeeData.lastName}`;
    await emailService.sendWelcomeEmail(
      employeeData.email,
      fullName,
      employeeData.temporaryPassword
    );
    console.log(`Email de bienvenida enviado a ${employeeData.email}`);
  } catch (error) {
    console.error("Error enviando email de bienvenida automático:", error);
  }
}

/**
 * Hook para enviar email automático cuando se aprueba un evento
 */
export async function onEventApproved(eventData: {
  userEmail: string;
  title: string;
  eventDate: string;
}) {
  try {
    await emailService.sendEventApprovalEmail(
      eventData.userEmail,
      eventData.title,
      eventData.eventDate
    );
    console.log(`Notificación de evento aprobado enviada a ${eventData.userEmail}`);
  } catch (error) {
    console.error("Error enviando notificación de evento automática:", error);
  }
}

/**
 * Hook para enviar email automático cuando se procesa nómina
 */
export async function onPayrollProcessed(payrollData: {
  userEmail: string;
  userName: string;
  period: string;
  netAmount: number;
}) {
  try {
    await emailService.sendPayrollNotification(
      payrollData.userEmail,
      payrollData.userName,
      payrollData.period,
      payrollData.netAmount
    );
    console.log(`Notificación de nómina enviada a ${payrollData.userEmail}`);
  } catch (error) {
    console.error("Error enviando notificación de nómina automática:", error);
  }
}

/**
 * Hook para enviar recordatorios de mantenimiento
 */
export async function onMaintenanceDue(maintenanceData: {
  userEmail: string;
  assetName: string;
  dueDate: string;
}) {
  try {
    await emailService.sendMaintenanceReminder(
      maintenanceData.userEmail,
      maintenanceData.assetName,
      maintenanceData.dueDate
    );
    console.log(`Recordatorio de mantenimiento enviado a ${maintenanceData.userEmail}`);
  } catch (error) {
    console.error("Error enviando recordatorio de mantenimiento:", error);
  }
}

/**
 * Hook para enviar email cuando se registra un voluntario
 */
export async function onVolunteerRegistered(volunteerData: {
  email: string;
  fullName: string;
}) {
  try {
    const subject = 'Registro de Voluntario Confirmado - ParkSys';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00a587;">¡Gracias por registrarte como voluntario!</h2>
        <p>Hola <strong>${volunteerData.fullName}</strong>,</p>
        <p>Tu registro como voluntario ha sido recibido exitosamente.</p>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #067f5f;">Próximos pasos:</h3>
          <ul>
            <li>Revisaremos tu información</li>
            <li>Te contactaremos para coordinar actividades</li>
            <li>Recibirás información sobre orientación</li>
          </ul>
        </div>
        <p>¡Esperamos trabajar contigo muy pronto!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Sistema ParkSys - Gestión de Voluntarios
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to: volunteerData.email,
      subject,
      html,
    });
    console.log(`Email de confirmación de voluntario enviado a ${volunteerData.email}`);
  } catch (error) {
    console.error("Error enviando confirmación de voluntario:", error);
  }
}

/**
 * Hook para enviar email cuando se crea un usuario
 */
export async function onUserCreated(userData: {
  email: string;
  username: string;
  fullName?: string;
  temporaryPassword?: string;
}) {
  try {
    const name = userData.fullName || userData.username;
    await emailService.sendWelcomeEmail(
      userData.email,
      name,
      userData.temporaryPassword
    );
    console.log(`Email de bienvenida de usuario enviado a ${userData.email}`);
  } catch (error) {
    console.error("Error enviando email de bienvenida de usuario:", error);
  }
}