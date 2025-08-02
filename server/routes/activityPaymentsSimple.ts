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
      const activity = await storage.getActivity(parseInt(activityId));
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
      const activity = activities.find(a => a.id === parseInt(activityId));
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

      // Crear el registro usando SQL directo para evitar problemas de tipo
      const query = `
        INSERT INTO activity_registrations (
          activity_id, participant_name, participant_email, participant_phone,
          participant_age, emergency_contact, emergency_phone, medical_conditions,
          additional_notes, status, payment_status, stripe_payment_intent_id,
          stripe_customer_id, paid_amount, payment_date, registration_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
      
      const values = [
        registrationData.activityId,
        registrationData.participantName,
        registrationData.participantEmail,
        registrationData.participantPhone,
        registrationData.participantAge,
        registrationData.emergencyContact,
        registrationData.emergencyPhone,
        registrationData.medicalConditions,
        registrationData.additionalNotes,
        registrationData.status,
        registrationData.paymentStatus,
        registrationData.stripePaymentIntentId,
        registrationData.stripeCustomerId,
        registrationData.paidAmount,
        registrationData.paymentDate,
        registrationData.registrationDate
      ];
      
      const pool = storage.getPool();
      const result = await pool.query(query, values);
      const newRegistration = result.rows[0];

      console.log('✅ Registro creado con ID:', newRegistration.id);

      // Enviar email de confirmación de registro con pago
      try {
        const emailTemplate = `
          <h2>¡Registro confirmado!</h2>
          <p>Hola ${customerData.fullName},</p>
          <p>Tu registro para la actividad <strong>"${activity.title}"</strong> ha sido confirmado exitosamente.</p>
          <h3>Detalles del pago:</h3>
          <ul>
            <li><strong>Monto:</strong> $${(paymentIntent.amount / 100).toFixed(2)} MXN</li>
            <li><strong>Método:</strong> Tarjeta de crédito</li>
            <li><strong>ID de transacción:</strong> ${paymentIntentId}</li>
            <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</li>
          </ul>
          <h3>Detalles de la actividad:</h3>
          <ul>
            <li><strong>Actividad:</strong> ${activity.title}</li>
            <li><strong>Fecha:</strong> ${new Date(activity.startDate).toLocaleDateString('es-MX')}</li>
            <li><strong>Ubicación:</strong> ${activity.location}</li>
            <li><strong>Parque:</strong> ${activity.parkName}</li>
          </ul>
          <p>Estado: <strong>${activity.requiresApproval ? 'Pendiente de aprobación' : 'Aprobado'}</strong></p>
          <p>¡Nos vemos pronto!</p>
        `;

        await emailService.sendEmail({
          to: customerData.email,
          subject: `Confirmación de registro - ${activity.title}`,
          html: emailTemplate
        });
        
        console.log('✅ Email de confirmación enviado');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación:', emailError);
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