import { pool } from '../db';

/**
 * Plantillas de email para inscripciones de actividades
 */
export const activityRegistrationTemplates = [
  {
    name: 'Confirmación de Inscripción - Actividad',
    subject: 'Confirmación de inscripción: {{activityTitle}}',
    templateType: 'activity_registration_pending',
    moduleId: 'activities',
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Inscripción</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #00a587, #067f5f); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .status-badge { display: inline-block; background: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 20px 0; }
        .activity-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .activity-title { color: #1e293b; font-size: 22px; font-weight: 600; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; }
        .important-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #00a587; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Inscripción Recibida!</h1>
            <p>Hemos recibido tu solicitud para participar en una actividad</p>
        </div>
        
        <div class="content">
            <p>Estimado/a <strong>{{participantName}}</strong>,</p>
            
            <p>Tu inscripción ha sido recibida exitosamente. A continuación encontrarás los detalles:</p>
            
            <div class="status-badge">📋 Estado: Pendiente de Aprobación</div>
            
            <div class="activity-card">
                <h2 class="activity-title">{{activityTitle}}</h2>
                
                <div class="detail-row">
                    <span class="detail-label">📍 Ubicación:</span>
                    <span class="detail-value">{{parkName}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha de inicio:</span>
                    <span class="detail-value">{{formatDate activityStartDate}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">⏰ Hora:</span>
                    <span class="detail-value">{{activityStartTime}}</span>
                </div>
                
                {{#if activityLocation}}
                <div class="detail-row">
                    <span class="detail-label">📍 Lugar específico:</span>
                    <span class="detail-value">{{activityLocation}}</span>
                </div>
                {{/if}}
                
                <div class="detail-row">
                    <span class="detail-label">📧 Email de contacto:</span>
                    <span class="detail-value">{{participantEmail}}</span>
                </div>
                
                {{#if participantPhone}}
                <div class="detail-row">
                    <span class="detail-label">📱 Teléfono:</span>
                    <span class="detail-value">{{participantPhone}}</span>
                </div>
                {{/if}}
                
                <div class="detail-row">
                    <span class="detail-label">📋 Fecha de inscripción:</span>
                    <span class="detail-value">{{formatDate registrationDate}}</span>
                </div>
            </div>
            
            <div class="important-note">
                <h3>⚠️ Información Importante</h3>
                <ul>
                    <li>Tu inscripción está <strong>pendiente de aprobación</strong> por parte de nuestro equipo</li>
                    <li>Recibirás otro email una vez que tu inscripción sea procesada</li>
                    <li>El proceso de aprobación puede tomar de 1 a 3 días hábiles</li>
                    <li>Si tienes preguntas, puedes responder a este email</li>
                </ul>
            </div>
            
            <p>¡Gracias por tu interés en participar en nuestras actividades!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de Parques y Recreación</strong></p>
        </div>
        
        <div class="footer">
            <p>Este email fue enviado automáticamente por el Sistema de Gestión de Parques</p>
            <p>{{currentDate}}</p>
        </div>
    </div>
</body>
</html>
    `,
    textContent: `
¡Inscripción Recibida!

Estimado/a {{participantName}},

Tu inscripción ha sido recibida exitosamente para la actividad: {{activityTitle}}

DETALLES DE LA ACTIVIDAD:
- Ubicación: {{parkName}}
- Fecha: {{formatDate activityStartDate}}
- Hora: {{activityStartTime}}
- Email: {{participantEmail}}
- Teléfono: {{participantPhone}}
- Fecha de inscripción: {{formatDate registrationDate}}

ESTADO: PENDIENTE DE APROBACIÓN

Tu inscripción está pendiente de aprobación por parte de nuestro equipo.
Recibirás otro email una vez que tu inscripción sea procesada.
El proceso puede tomar de 1 a 3 días hábiles.

¡Gracias por tu interés!

Equipo de Parques y Recreación
{{currentDate}}
    `,
    variables: [
      '{{participantName}}', '{{participantEmail}}', '{{participantPhone}}',
      '{{activityTitle}}', '{{activityStartDate}}', '{{activityStartTime}}',
      '{{activityLocation}}', '{{parkName}}', '{{registrationDate}}',
      '{{currentDate}}'
    ]
  },
  {
    name: 'Aprobación de Inscripción - Actividad',
    subject: '✅ Inscripción aprobada: {{activityTitle}}',
    templateType: 'activity_registration_approved',
    moduleId: 'activities',
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscripción Aprobada</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981, #065f46); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 20px 0; }
        .activity-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .activity-title { color: #1e293b; font-size: 22px; font-weight: 600; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0; }
        .detail-label { font-weight: 600; color: #166534; }
        .detail-value { color: #1e293b; }
        .important-note { background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1>¡Inscripción Aprobada!</h1>
            <p>Tu participación ha sido confirmada</p>
        </div>
        
        <div class="content">
            <p>Estimado/a <strong>{{participantName}}</strong>,</p>
            
            <p>¡Excelentes noticias! Tu inscripción ha sido <strong>aprobada</strong> y ya tienes tu lugar asegurado.</p>
            
            <div class="status-badge">✅ Estado: Aprobada</div>
            
            <div class="activity-card">
                <h2 class="activity-title">{{activityTitle}}</h2>
                
                <div class="detail-row">
                    <span class="detail-label">📍 Ubicación:</span>
                    <span class="detail-value">{{parkName}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha de inicio:</span>
                    <span class="detail-value">{{formatDate activityStartDate}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">⏰ Hora:</span>
                    <span class="detail-value">{{activityStartTime}}</span>
                </div>
                
                {{#if activityLocation}}
                <div class="detail-row">
                    <span class="detail-label">📍 Lugar específico:</span>
                    <span class="detail-value">{{activityLocation}}</span>
                </div>
                {{/if}}
                
                <div class="detail-row">
                    <span class="detail-label">👤 Aprobada por:</span>
                    <span class="detail-value">Equipo de Parques</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📋 Fecha de aprobación:</span>
                    <span class="detail-value">{{formatDate approvalDate}}</span>
                </div>
            </div>
            
            <div class="important-note">
                <h3>📋 Próximos Pasos</h3>
                <ul>
                    <li><strong>Preséntate 15 minutos antes</strong> del horario programado</li>
                    <li>Lleva una identificación oficial y comprobante de este email</li>
                    <li>Usa ropa cómoda y adecuada para la actividad</li>
                    <li>Si tienes alguna condición médica, informa al instructor</li>
                    <li>En caso de no poder asistir, notifica con al menos 24 horas de anticipación</li>
                </ul>
            </div>
            
            <p>¡Esperamos verte pronto y que disfrutes mucho de esta experiencia!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de Parques y Recreación</strong></p>
        </div>
        
        <div class="footer">
            <p>Este email fue enviado automáticamente por el Sistema de Gestión de Parques</p>
            <p>Para cancelar tu participación o hacer cambios, responde a este email</p>
            <p>{{currentDate}}</p>
        </div>
    </div>
</body>
</html>
    `,
    textContent: `
¡INSCRIPCIÓN APROBADA!

Estimado/a {{participantName}},

¡Excelentes noticias! Tu inscripción ha sido APROBADA y ya tienes tu lugar asegurado.

DETALLES DE LA ACTIVIDAD:
- Actividad: {{activityTitle}}
- Ubicación: {{parkName}}
- Fecha: {{formatDate activityStartDate}}
- Hora: {{activityStartTime}}
- Lugar específico: {{activityLocation}}
- Aprobada el: {{formatDate approvalDate}}

PRÓXIMOS PASOS:
- Preséntate 15 minutos antes del horario programado
- Lleva identificación oficial y este comprobante
- Usa ropa cómoda y adecuada
- Informa cualquier condición médica al instructor
- Para cancelar, notifica con 24 horas de anticipación

¡Esperamos verte pronto!

Equipo de Parques y Recreación
{{currentDate}}
    `,
    variables: [
      '{{participantName}}', '{{participantEmail}}', '{{activityTitle}}',
      '{{activityStartDate}}', '{{activityStartTime}}', '{{activityLocation}}',
      '{{parkName}}', '{{approvalDate}}', '{{currentDate}}'
    ]
  }
];

/**
 * Función para insertar las plantillas de inscripciones de actividades
 */
export async function insertActivityRegistrationTemplates() {
  console.log('📧 Insertando plantillas de inscripciones de actividades...');
  
  for (const template of activityRegistrationTemplates) {
    try {
      await pool.query(`
        INSERT INTO email_templates (name, subject, html_content, text_content, template_type, module_id, variables)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET
          subject = EXCLUDED.subject,
          html_content = EXCLUDED.html_content,
          text_content = EXCLUDED.text_content,
          template_type = EXCLUDED.template_type,
          module_id = EXCLUDED.module_id,
          variables = EXCLUDED.variables,
          updated_at = NOW()
      `, [
        template.name,
        template.subject,
        template.htmlContent,
        template.textContent,
        template.templateType,
        template.moduleId,
        JSON.stringify(template.variables)
      ]);
      console.log(`✅ Plantilla insertada/actualizada: ${template.name}`);
    } catch (error) {
      console.error(`❌ Error insertando plantilla ${template.name}:`, error);
    }
  }
  
  console.log('📧 Plantillas de inscripciones de actividades procesadas');
}