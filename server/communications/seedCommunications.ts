import { pool } from '../db';
import { emailTemplates } from '../../shared/schema';

/**
 * Crea plantillas de email predefinidas para el sistema
 */
export async function seedEmailTemplates() {
  try {
    console.log('📧 Creando plantillas de email predefinidas...');

    const templates = [
      // Plantilla de bienvenida para empleados
      {
        name: 'Bienvenida Empleado',
        subject: 'Bienvenido a Parques de México - {{employeeName}}',
        templateType: 'welcome',
        moduleId: 'hr',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #00a587, #067f5f); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Parques de México!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #00a587; margin-bottom: 20px;">Hola {{employeeName}},</h2>
              <p style="line-height: 1.6; color: #333;">Nos complace darte la bienvenida al equipo de <strong>Parques de México</strong>. Tu incorporación al departamento de <strong>{{department}}</strong> fortalece nuestro compromiso con la gestión de espacios verdes urbanos.</p>
              
              <div style="background: #e8f5f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #067f5f; margin-top: 0;">Información de tu cuenta:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Puesto:</strong> {{position}}</li>
                  <li><strong>Departamento:</strong> {{department}}</li>
                  <li><strong>Fecha de inicio:</strong> {{startDate}}</li>
                  <li><strong>Email corporativo:</strong> {{userEmail}}</li>
                </ul>
              </div>

              <p style="line-height: 1.6; color: #333;">Te invitamos a familiarizarte con nuestros sistemas y procesos. Si tienes alguna pregunta, no dudes en contactar a tu supervisor directo o al departamento de Recursos Humanos.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{systemUrl}}" style="background: #00a587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acceder al Sistema</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                Este es un mensaje automático del sistema ParkSys<br>
                Si necesitas ayuda, contacta: {{supportEmail}}
              </p>
            </div>
          </div>
        `,
        variables: ['{{employeeName}}', '{{department}}', '{{position}}', '{{startDate}}', '{{userEmail}}', '{{systemUrl}}', '{{supportEmail}}']
      },

      // Plantilla de notificación de nómina
      {
        name: 'Recibo de Nómina',
        subject: 'Tu recibo de nómina está disponible - {{period}}',
        templateType: 'notification',
        moduleId: 'hr',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💰 Recibo de Nómina</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #4f46e5; margin-bottom: 20px;">Hola {{employeeName}},</h2>
              <p style="line-height: 1.6; color: #333;">Tu recibo de nómina correspondiente al período <strong>{{period}}</strong> ya está disponible para consulta y descarga.</p>
              
              <div style="background: #f0f0ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                <h3 style="color: #4f46e5; margin-top: 0;">Resumen del período:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Salario bruto:</strong> {{grossSalary}}</li>
                  <li><strong>Deducciones:</strong> {{deductions}}</li>
                  <li><strong>Salario neto:</strong> {{netSalary}}</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{receiptUrl}}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Descargar Recibo PDF</a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                <strong>Importante:</strong> Conserva este recibo para tus registros personales. Si detectas alguna inconsistencia, contacta al departamento de Recursos Humanos dentro de los próximos 5 días hábiles.
              </p>
            </div>
          </div>
        `,
        variables: ['{{employeeName}}', '{{period}}', '{{grossSalary}}', '{{deductions}}', '{{netSalary}}', '{{receiptUrl}}']
      },

      // Plantilla para eventos y actividades
      {
        name: 'Nueva Actividad en Parque',
        subject: '🌳 Nueva actividad disponible: {{activityName}}',
        templateType: 'notification',
        moduleId: 'parks',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #00a587, #bcd256); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🌳 Nueva Actividad Disponible</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #00a587; margin-bottom: 20px;">{{activityName}}</h2>
              <p style="line-height: 1.6; color: #333;">Te invitamos a participar en una nueva actividad que se realizará en <strong>{{parkName}}</strong>.</p>
              
              <div style="background: #e8f5f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #067f5f; margin-top: 0;">Detalles del evento:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>📅 Fecha:</strong> {{activityDate}}</li>
                  <li><strong>⏰ Hora:</strong> {{activityTime}}</li>
                  <li><strong>📍 Ubicación:</strong> {{parkName}}</li>
                  <li><strong>👥 Capacidad:</strong> {{capacity}} personas</li>
                  {{#if price}}<li><strong>💰 Costo:</strong> {{price}}</li>{{/if}}
                </ul>
              </div>

              <p style="line-height: 1.6; color: #333;">{{activityDescription}}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{registrationUrl}}" style="background: #00a587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Registrarse Ahora</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 14px;">
                ¡No te pierdas esta oportunidad de conectar con la naturaleza!
              </p>
            </div>
          </div>
        `,
        variables: ['{{activityName}}', '{{parkName}}', '{{activityDate}}', '{{activityTime}}', '{{capacity}}', '{{price}}', '{{activityDescription}}', '{{registrationUrl}}']
      },

      // Plantilla para voluntarios
      {
        name: 'Reconocimiento Voluntario',
        subject: '🏆 ¡Gracias por tu dedicación, {{volunteerName}}!',
        templateType: 'recognition',
        moduleId: 'volunteers',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🏆 Reconocimiento al Voluntario</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #f59e0b; margin-bottom: 20px;">¡Querido {{volunteerName}}!</h2>
              <p style="line-height: 1.6; color: #333;">Queremos expresarte nuestro más sincero agradecimiento por tu valiosa contribución a los parques de nuestra comunidad.</p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #d97706; margin-top: 0;">Tu impacto este mes:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>⏰ Horas completadas:</strong> {{hoursCompleted}} horas</li>
                  <li><strong>🌱 Actividades realizadas:</strong> {{activitiesCount}}</li>
                  <li><strong>🏞️ Parques atendidos:</strong> {{parksCount}}</li>
                  <li><strong>🎯 Área de especialidad:</strong> {{specialtyArea}}</li>
                </ul>
              </div>

              <p style="line-height: 1.6; color: #333;">Tu dedicación y esfuerzo hacen que nuestros espacios verdes sean mejores para toda la comunidad. ¡Eres una parte fundamental de nuestro equipo!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{certificateUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver Certificado</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 14px;">
                ¡Sigue siendo parte del cambio positivo en nuestra ciudad! 🌟
              </p>
            </div>
          </div>
        `,
        variables: ['{{volunteerName}}', '{{hoursCompleted}}', '{{activitiesCount}}', '{{parksCount}}', '{{specialtyArea}}', '{{certificateUrl}}']
      },

      // Plantilla para concesionarios
      {
        name: 'Vencimiento de Contrato',
        subject: '📋 Recordatorio: Tu contrato vence próximamente',
        templateType: 'alert',
        moduleId: 'concessions',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Recordatorio de Contrato</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Estimado {{concessionaireName}},</h2>
              <p style="line-height: 1.6; color: #333;">Te recordamos que tu contrato de concesión <strong>{{contractNumber}}</strong> está próximo a vencer.</p>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="color: #b91c1c; margin-top: 0;">Información del contrato:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>📄 Número de contrato:</strong> {{contractNumber}}</li>
                  <li><strong>📍 Ubicación:</strong> {{location}}</li>
                  <li><strong>📅 Fecha de vencimiento:</strong> {{expirationDate}}</li>
                  <li><strong>⏰ Días restantes:</strong> {{daysRemaining}} días</li>
                </ul>
              </div>

              <p style="line-height: 1.6; color: #333;">Para asegurar la continuidad de tu concesión, te recomendamos iniciar el proceso de renovación con anticipación. Nuestro equipo está disponible para apoyarte en este proceso.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{renewalUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Iniciar Renovación</a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                <strong>Nota importante:</strong> Los procesos de renovación pueden tomar hasta 30 días hábiles. Te sugerimos no esperar hasta el último momento.
              </p>
            </div>
          </div>
        `,
        variables: ['{{concessionaireName}}', '{{contractNumber}}', '{{location}}', '{{expirationDate}}', '{{daysRemaining}}', '{{renewalUrl}}']
      }
    ];

    // Insertar plantillas
    for (const template of templates) {
      try {
        await pool.query(`
          INSERT INTO email_templates (name, subject, html_content, text_content, template_type, module_id, variables)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (name) DO NOTHING
        `, [
          template.name,
          template.subject,
          template.htmlContent,
          template.textContent,
          template.templateType,
          template.moduleId,
          JSON.stringify(template.variables)
        ]);
        console.log(`✅ Plantilla creada: ${template.name}`);
      } catch (error) {
        console.log(`ℹ️ Plantilla ya existe: ${template.name}`);
      }
    }

    console.log('📧 Plantillas de email inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error al crear plantillas de email:', error);
  }
}