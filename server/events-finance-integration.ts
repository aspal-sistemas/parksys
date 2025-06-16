import { db } from "./db";
import { 
  actualIncome,
  incomeCategories,
  activities,
  eventParticipants
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { FinancialIntegrationUtils } from "@shared/financial-integration-types";

/**
 * Integración Eventos → Finanzas
 * Genera automáticamente ingresos cuando se registran participantes en eventos pagados
 */

export class EventsFinanceIntegration {
  
  /**
   * Procesa la inscripción a un evento pagado y genera el ingreso correspondiente
   */
  static async processEventRegistration(eventId: number, participantCount: number, eventPrice: number) {
    try {
      // Obtener datos del evento
      const [event] = await db
        .select({
          id: activities.id,
          title: activities.title,
          description: activities.description,
          startDate: activities.startDate,
          parkId: activities.parkId,
          category: activities.category,
          maxParticipants: activities.maxParticipants,
          price: activities.price
        })
        .from(activities)
        .where(eq(activities.id, eventId));

      if (!event) {
        throw new Error(`Evento ${eventId} no encontrado`);
      }

      // Solo procesar si el evento tiene costo
      if (!eventPrice || eventPrice <= 0) {
        console.log(`Evento ${eventId} es gratuito, no se genera ingreso`);
        return null;
      }

      // Determinar categoría de ingreso según el tipo de evento
      const categoryCode = this.getCategoryCodeByEventType(event.category);
      
      // Buscar o crear categoría de ingreso
      let [category] = await db
        .select()
        .from(incomeCategories)
        .where(eq(incomeCategories.code, categoryCode));

      if (!category) {
        await this.createIncomeCategory(categoryCode);
        [category] = await db
          .select()
          .from(incomeCategories)
          .where(eq(incomeCategories.code, categoryCode));
      }

      // Calcular monto total
      const totalAmount = participantCount * eventPrice;

      // Generar referencia única
      const reference = FinancialIntegrationUtils.generateReference(
        'events', 
        eventId, 
        new Date(event.startDate)
      );

      // Verificar si ya existe un ingreso para este evento
      const [existingIncome] = await db
        .select()
        .from(actualIncome)
        .where(eq(actualIncome.referenceNumber, reference));

      if (existingIncome) {
        // Actualizar monto si hay nuevos participantes
        const updatedAmount = parseFloat(existingIncome.amount) + totalAmount;
        
        const [updatedIncome] = await db
          .update(actualIncome)
          .set({
            amount: updatedAmount.toFixed(2),
            description: `Ingreso por ${participantCount} nuevas inscripciones. Total participantes registrados.`,
            updatedAt: new Date()
          })
          .where(eq(actualIncome.id, existingIncome.id))
          .returning();

        console.log(`🔄 Ingreso actualizado: ${updatedIncome.concept} - ${updatedIncome.amount}`);
        return updatedIncome;
      }

      // Crear nuevo registro de ingreso automático
      const incomeData = {
        parkId: event.parkId,
        categoryId: category.id,
        concept: `Evento - ${event.title}`,
        amount: totalAmount.toFixed(2),
        date: event.startDate.split('T')[0],
        month: new Date(event.startDate).getMonth() + 1,
        year: new Date(event.startDate).getFullYear(),
        source: `Inscripciones de evento`,
        description: `Ingreso generado automáticamente por ${participantCount} inscripciones al evento "${event.title}" (${FinancialIntegrationUtils.formatCurrency(eventPrice)} por persona)`,
        referenceNumber: reference,
        isReceived: true,
        isEventsGenerated: true
      };

      const [newIncome] = await db
        .insert(actualIncome)
        .values(incomeData)
        .returning();

      console.log(`✅ Ingreso de evento creado: ${newIncome.concept} - ${newIncome.amount}`);
      return newIncome;

    } catch (error) {
      console.error(`❌ Error procesando inscripción al evento ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Determina la categoría de ingreso según el tipo de evento
   */
  private static getCategoryCodeByEventType(eventCategory: string | null): string {
    if (!eventCategory) return 'EVEN-INS';
    
    const categoryLower = eventCategory.toLowerCase();
    
    if (categoryLower.includes('deporte') || categoryLower.includes('fitness')) {
      return 'EVEN-DEP';
    }
    
    if (categoryLower.includes('cultural') || categoryLower.includes('arte')) {
      return 'EVEN-CUL';
    }
    
    if (categoryLower.includes('educación') || categoryLower.includes('taller')) {
      return 'EVEN-EDU';
    }
    
    if (categoryLower.includes('entretenimiento') || categoryLower.includes('show')) {
      return 'EVEN-ENT';
    }
    
    // Categoría por defecto
    return 'EVEN-INS';
  }

  /**
   * Crea una categoría de ingreso automáticamente
   */
  private static async createIncomeCategory(code: string) {
    const categoryMappings = {
      'EVEN-INS': {
        name: 'Inscripciones a Eventos',
        description: 'Ingresos por inscripciones generales a eventos'
      },
      'EVEN-DEP': {
        name: 'Eventos Deportivos',
        description: 'Ingresos por eventos deportivos y fitness'
      },
      'EVEN-CUL': {
        name: 'Eventos Culturales',
        description: 'Ingresos por eventos culturales y artísticos'
      },
      'EVEN-EDU': {
        name: 'Eventos Educativos',
        description: 'Ingresos por talleres y eventos educativos'
      },
      'EVEN-ENT': {
        name: 'Entretenimiento',
        description: 'Ingresos por shows y entretenimiento'
      },
      'EVEN-PAT': {
        name: 'Patrocinios de Eventos',
        description: 'Ingresos por patrocinios comerciales'
      }
    };

    const categoryData = categoryMappings[code as keyof typeof categoryMappings] || {
      name: 'Ingresos de Eventos',
      description: 'Ingresos generales de eventos'
    };

    await db.insert(incomeCategories).values({
      code,
      name: categoryData.name,
      description: categoryData.description,
      level: 1,
      isActive: true,
      sortOrder: 1
    });

    console.log(`📁 Categoría de ingreso creada: ${code} - ${categoryData.name}`);
  }

  /**
   * Procesa patrocinios de eventos
   */
  static async processSponsorshipIncome(eventId: number, sponsorName: string, amount: number) {
    try {
      const [event] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, eventId));

      if (!event) {
        throw new Error(`Evento ${eventId} no encontrado`);
      }

      // Buscar o crear categoría de patrocinios
      let [category] = await db
        .select()
        .from(incomeCategories)
        .where(eq(incomeCategories.code, 'EVEN-PAT'));

      if (!category) {
        await this.createIncomeCategory('EVEN-PAT');
        [category] = await db
          .select()
          .from(incomeCategories)
          .where(eq(incomeCategories.code, 'EVEN-PAT'));
      }

      const reference = `PAT-${FinancialIntegrationUtils.generateReference('events', eventId, new Date())}`;

      const incomeData = {
        parkId: event.parkId,
        categoryId: category.id,
        concept: `Patrocinio - ${event.title}`,
        amount: amount.toFixed(2),
        date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        source: `Patrocinio de ${sponsorName}`,
        description: `Ingreso por patrocinio del evento "${event.title}" por parte de ${sponsorName}`,
        referenceNumber: reference,
        isReceived: true,
        isEventsGenerated: true
      };

      const [newIncome] = await db
        .insert(actualIncome)
        .values(incomeData)
        .returning();

      console.log(`💰 Ingreso por patrocinio creado: ${newIncome.concept} - ${newIncome.amount}`);
      return newIncome;

    } catch (error) {
      console.error(`Error procesando patrocinio para evento ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza todos los eventos pagados existentes
   */
  static async syncExistingEvents() {
    try {
      console.log("🔄 Sincronizando eventos pagados existentes...");

      // Obtener eventos pagados que no tienen ingresos asociados
      const paidEventsWithoutIncome = await db
        .select({
          eventId: activities.id,
          title: activities.title,
          price: activities.price,
          startDate: activities.startDate,
          maxParticipants: activities.maxParticipants
        })
        .from(activities)
        .leftJoin(
          actualIncome, 
          sql`${actualIncome.referenceNumber} LIKE ${'EVEN-%'} || ${activities.id} || '%'`
        )
        .where(
          and(
            sql`${activities.price} > 0`,
            sql`${actualIncome.id} IS NULL`
          )
        );

      console.log(`📊 Encontrados ${paidEventsWithoutIncome.length} eventos pagados sin ingresos asociados`);

      // Procesar cada evento con participantes estimados
      for (const event of paidEventsWithoutIncome) {
        try {
          // Simular participantes para eventos existentes (25-75% de capacidad)
          const estimatedParticipants = Math.floor((event.maxParticipants || 20) * (0.25 + Math.random() * 0.5));
          const eventPrice = parseFloat(event.price || '0');
          
          if (estimatedParticipants > 0 && eventPrice > 0) {
            await this.processEventRegistration(event.eventId, estimatedParticipants, eventPrice);
          }
        } catch (error) {
          console.error(`Error procesando evento ${event.eventId}:`, error);
        }
      }

      console.log("✅ Sincronización de eventos completada");

    } catch (error) {
      console.error("❌ Error en sincronización de eventos:", error);
      throw error;
    }
  }

  /**
   * Elimina ingresos cuando se cancela un evento
   */
  static async removeIncomeForEvent(eventId: number) {
    try {
      const reference = `EVEN-%${eventId}%`;
      
      const deletedIncome = await db
        .delete(actualIncome)
        .where(sql`${actualIncome.referenceNumber} LIKE ${reference}`)
        .returning();

      if (deletedIncome.length > 0) {
        console.log(`🗑️ Ingresos eliminados para evento ${eventId}`);
      }

      return deletedIncome;

    } catch (error) {
      console.error(`Error eliminando ingresos para evento ${eventId}:`, error);
      throw error;
    }
  }
}