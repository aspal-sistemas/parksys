import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { emailService } from "../email/emailService";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function registerActivityPaymentRoutes(app: Express) {
  // Crear payment intent para pago de actividad
  app.post("/api/activities/:activityId/create-payment-intent", async (req, res) => {
    try {
      const { activityId } = req.params;
      const { customerData, amount } = req.body;

      console.log('🌟 GLOBAL POST-JSON:', req.method, req.url);
      console.log('🌟 Body parseado:', JSON.stringify(req.body, null, 2));

      // Obtener datos de la actividad
      const activities = await storage.getAllActivities();
      const activity = activities.find(a => a.id === parseInt(activityId));
      if (!activity) {
        return res.status(404).json({ error: "Actividad no encontrada" });
      }

      if (activity.isFree) {
        return res.status(400).json({ error: "Esta actividad es gratuita" });
      }

      const finalAmount = amount || Math.round(parseFloat(activity.price || "0") * 100);

      // Crear customer en Stripe si se proporcionan datos
      let customerId;
      if (customerData?.email) {
        try {
          const customer = await stripe.customers.create({
            email: customerData.email,
            name: customerData.fullName,
            metadata: {
              activityId: activityId,
            }
          });
          customerId = customer.id;
        } catch (error) {
          console.warn("Error creating Stripe customer:", error);
        }
      }

      // Crear payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "mxn",
        customer: customerId,
        metadata: {
          activityId: activityId,
          activityTitle: activity.title,
        },
        description: `Pago por actividad: ${activity.title}`,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customerId,
        amount: finalAmount / 100,
        currency: 'mxn'
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error procesando el pago: " + error.message 
      });
    }
  });

  // Completar registro después de pago exitoso
  app.post("/api/activities/:activityId/complete-payment-registration", async (req, res) => {
    try {
      const { activityId } = req.params;
      const { paymentIntentId, customerData, amount } = req.body;

      console.log('🎯 Completando registro después de pago exitoso');
      console.log('🎯 PaymentIntentId:', paymentIntentId);
      console.log('🎯 CustomerData:', customerData);

      // Verificar el payment intent con Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: "El pago no ha sido completado exitosamente" 
        });
      }

      // Obtener datos de la actividad
      const activities = await storage.getAllActivities();
      const activity = activities.find((a: any) => a.id === parseInt(activityId));
      if (!activity) {
        return res.status(404).json({ error: "Actividad no encontrada" });
      }

      // Crear el registro de inscripción
      const registrationData = {
        activityId: parseInt(activityId),
        participantName: customerData.fullName,
        participantEmail: customerData.email,
        participantPhone: customerData.phone,
        participantAge: customerData.age || '',
        emergencyContact: customerData.emergencyContact || '',
        emergencyPhone: customerData.emergencyPhone || '',
        medicalConditions: customerData.medicalConditions || '',
        additionalNotes: customerData.additionalNotes || '',
        status: activity.requiresApproval ? 'pending' : 'approved',
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: paymentIntent.customer as string || null,
        paidAmount: (paymentIntent.amount / 100).toString(),
        paymentDate: new Date(),
        registrationDate: new Date()
      };

      console.log('🎯 Creando registro de inscripción con pago:', registrationData);

      // Crear el registro usando Drizzle ORM
      const { db } = await import("../db");
      const { activityRegistrations } = await import("../../shared/schema");
      
      // Usar execute_sql_tool para insertar directamente
      const { sql } = await import("drizzle-orm");
      
      const insertResult = await db.execute(sql`
        INSERT INTO activity_registrations (
          activity_id, participant_name, participant_email, participant_phone, 
          age, emergency_contact_name, emergency_phone, medical_conditions, 
          notes, status, stripe_payment_intent_id, 
          stripe_customer_id, paid_amount, payment_date, accepts_terms, registration_date
        ) 
        VALUES (
          ${registrationData.activityId}, 
          ${registrationData.participantName}, 
          ${registrationData.participantEmail}, 
          ${registrationData.participantPhone}, 
          ${customerData.age || null}, 
          ${registrationData.emergencyContact || null}, 
          ${registrationData.emergencyPhone || null}, 
          ${registrationData.medicalConditions || null}, 
          ${registrationData.additionalNotes || null}, 
          ${activity.requiresApproval ? 'pending' : 'approved'}, 
          ${registrationData.stripePaymentIntentId}, 
          ${registrationData.stripeCustomerId}, 
          ${registrationData.paidAmount}, 
          ${registrationData.paymentDate}, 
          ${true}, 
          ${new Date()}
        )
        RETURNING id, participant_name, status
      `);
      
      const newRegistration = insertResult.rows[0] || { id: 'generated' };

      console.log('✅ Registro creado con ID:', newRegistration.id);

      // Enviar email de confirmación de pago usando la plantilla #13
      try {
        // Importar el servicio de email de comunicaciones
        const emailModule = await import("../communications/emailQueueService");
        const service = emailModule.emailQueueService;
        
        const emailVariables = {
          participantName: registrationData.participantName,
          activityTitle: activity.title,
          parkName: activity.parkName || 'Parque Municipal',
          activityStartDate: new Date(activity.startDate).toLocaleDateString('es-MX'),
          activityStartTime: activity.startTime || '10:00',
          activityLocation: activity.location || 'Por confirmar',
          paymentAmount: (paymentIntent.amount / 100).toFixed(2),
          stripePaymentId: paymentIntent.id,
          paymentMethod: 'Tarjeta de Crédito/Débito',
          paymentDate: new Date().toLocaleDateString('es-MX')
        };

        console.log('📧 Enviando email de confirmación de pago con plantilla #13:', emailVariables);
        
        await service.addToQueue({
          to: customerData.email,
          subject: 'Confirmación de Pago - Actividad',
          templateId: 13, // ID de la plantilla "Confirmación de Pago - Actividad"
          templateVariables: emailVariables
        });
        
        console.log('✅ Email de confirmación de pago enviado exitosamente');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación de pago:', emailError);
        // No fallar la transacción por error de email
      }

      res.json({ 
        success: true, 
        registration: newRegistration,
        paymentAmount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        message: 'Registro completado exitosamente con pago confirmado'
      });

    } catch (error: any) {
      console.error("❌ Error completando registro con pago:", error);
      res.status(500).json({ 
        error: "Error completando el registro: " + error.message 
      });
    }
  });
}

// La función sendPaymentConfirmationEmail ha sido reemplazada por el sistema de plantillas
// Ahora se usa la plantilla #13 "Confirmación de Pago - Actividad" con sendTemplateEmail