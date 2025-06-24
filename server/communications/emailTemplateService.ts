import Handlebars from 'handlebars';
import juice from 'juice';
import { convert } from 'html-to-text';
import { pool } from '../storage';
import { emailTemplates } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Servicio avanzado para gestión de plantillas de email
 */
export class EmailTemplateService {
  
  constructor() {
    this.registerHelpers();
  }

  /**
   * Registra helpers personalizados para Handlebars
   */
  private registerHelpers() {
    // Helper para formatear fechas
    Handlebars.registerHelper('formatDate', (date: Date, format?: string) => {
      if (!date) return '';
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      if (format === 'short') {
        options.month = 'short';
      }
      return new Date(date).toLocaleDateString('es-MX', options);
    });

    // Helper para formatear moneda
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount || 0);
    });

    // Helper condicional
    Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Helper para enlaces seguros
    Handlebars.registerHelper('safeUrl', (url: string) => {
      if (!url) return '#';
      return url.startsWith('http') ? url : `https://${url}`;
    });
  }

  /**
   * Obtiene todas las plantillas disponibles
   */
  async getAllTemplates() {
    const result = await pool.query('SELECT * FROM email_templates ORDER BY name');
    return result.rows;
  }

  /**
   * Obtiene plantillas por tipo
   */
  async getTemplatesByType(type: string) {
    return await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.templateType, type))
      .orderBy(emailTemplates.name);
  }

  /**
   * Obtiene plantillas por módulo
   */
  async getTemplatesByModule(moduleId: string) {
    return await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.moduleId, moduleId))
      .orderBy(emailTemplates.name);
  }

  /**
   * Procesa una plantilla con variables
   */
  async processTemplate(templateId: number, variables: Record<string, any>) {
    const template = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId))
      .limit(1);

    if (!template.length) {
      throw new Error(`Plantilla con ID ${templateId} no encontrada`);
    }

    const templateData = template[0];
    
    // Compilar y procesar el HTML
    const htmlTemplate = Handlebars.compile(templateData.htmlContent);
    const processedHtml = htmlTemplate(variables);
    
    // Optimizar CSS inline para mejor compatibilidad
    const inlinedHtml = juice(processedHtml);
    
    // Procesar el asunto
    const subjectTemplate = Handlebars.compile(templateData.subject);
    const processedSubject = subjectTemplate(variables);
    
    // Generar versión texto si no existe
    let textContent = templateData.textContent;
    if (!textContent) {
      textContent = convert(processedHtml, {
        wordwrap: 72,
        selectors: [
          { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
        ]
      });
    } else {
      const textTemplate = Handlebars.compile(textContent);
      textContent = textTemplate(variables);
    }

    return {
      subject: processedSubject,
      html: inlinedHtml,
      text: textContent,
      templateInfo: {
        id: templateData.id,
        name: templateData.name,
        type: templateData.templateType,
        module: templateData.moduleId
      }
    };
  }

  /**
   * Crea una nueva plantilla
   */
  async createTemplate(templateData: {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    templateType: string;
    moduleId?: string;
    variables?: string[];
  }) {
    const result = await db.insert(emailTemplates).values({
      ...templateData,
      variables: templateData.variables || [],
    }).returning();

    return result[0];
  }

  /**
   * Actualiza una plantilla existente
   */
  async updateTemplate(id: number, templateData: Partial<{
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    templateType: string;
    moduleId: string;
    variables: string[];
    isActive: boolean;
  }>) {
    const result = await db.update(emailTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();

    return result[0];
  }

  /**
   * Elimina una plantilla
   */
  async deleteTemplate(id: number) {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  /**
   * Obtiene variables disponibles por módulo
   */
  getModuleVariables(moduleId: string): string[] {
    const commonVariables = [
      '{{userName}}', '{{userEmail}}', '{{userFullName}}',
      '{{systemName}}', '{{currentDate}}', '{{supportEmail}}'
    ];

    switch (moduleId) {
      case 'hr':
        return [...commonVariables, 
          '{{employeeName}}', '{{department}}', '{{position}}', 
          '{{salary}}', '{{startDate}}', '{{managerId}}'
        ];
      case 'parks':
        return [...commonVariables,
          '{{parkName}}', '{{parkAddress}}', '{{parkAmenities}}',
          '{{eventName}}', '{{eventDate}}', '{{eventLocation}}'
        ];
      case 'volunteers':
        return [...commonVariables,
          '{{volunteerName}}', '{{activityName}}', '{{activityDate}}',
          '{{hoursCompleted}}', '{{certificationType}}'
        ];
      case 'finance':
        return [...commonVariables,
          '{{amount}}', '{{transactionDate}}', '{{invoiceNumber}}',
          '{{budgetCategory}}', '{{approvalStatus}}'
        ];
      case 'events':
        return [...commonVariables,
          '{{eventTitle}}', '{{eventDate}}', '{{eventLocation}}',
          '{{registrationDeadline}}', '{{capacity}}', '{{price}}'
        ];
      default:
        return commonVariables;
    }
  }

  /**
   * Valida una plantilla
   */
  async validateTemplate(htmlContent: string, variables: Record<string, any> = {}) {
    try {
      const template = Handlebars.compile(htmlContent);
      const processed = template(variables);
      
      // Verificar que no haya variables sin resolver
      const unresolvedVars = processed.match(/\{\{[^}]+\}\}/g);
      
      return {
        isValid: !unresolvedVars || unresolvedVars.length === 0,
        unresolvedVariables: unresolvedVars || [],
        processedContent: processed
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        unresolvedVariables: [],
        processedContent: ''
      };
    }
  }
}

export const emailTemplateService = new EmailTemplateService();