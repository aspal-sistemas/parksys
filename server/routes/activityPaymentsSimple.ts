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
      
      const [newRegistration] = await db
        .insert(activityRegistrations)
        .values({
          activityId: registrationData.activityId,
          fullName: registrationData.participantName,
          email: registrationData.participantEmail,
          phone: registrationData.participantPhone,
          age: customerData.age || null,
          emergencyContact: registrationData.emergencyContact || null,
          emergencyPhone: registrationData.emergencyPhone || null,
          medicalConditions: registrationData.medicalConditions || null,
          specialRequests: registrationData.additionalNotes || null,
          paymentStatus: registrationData.paymentStatus,
          stripePaymentIntentId: registrationData.stripePaymentIntentId,
          stripeCustomerId: registrationData.stripeCustomerId,
          paidAmount: registrationData.paidAmount,
          paymentDate: registrationData.paymentDate,
          acceptsTerms: true
        })
        .returning();

      console.log('✅ Registro creado con ID:', newRegistration.id);

      // Enviar email de confirmación de pago usando la plantilla profesional
      try {
        await sendPaymentConfirmationEmail(
          customerData.email,
          customerData.fullName,
          activity,
          paymentIntent,
          newRegistration
        );
        console.log('✅ Email de confirmación de pago enviado');
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

/**
 * Función para enviar email de confirmación de pago de Stripe
 */
async function sendPaymentConfirmationEmail(
  email: string,
  participantName: string,
  activity: any,
  paymentIntent: any,
  registration: any
) {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  const activityDate = new Date(activity.startDate).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Obtener método de pago de Stripe
  let paymentMethod = 'Tarjeta de crédito';
  if (paymentIntent.charges?.data?.[0]?.payment_method_details?.type) {
    const type = paymentIntent.charges.data[0].payment_method_details.type;
    paymentMethod = type === 'card' ? 'Tarjeta de crédito' : 'Otro método';
  }

  const variables = {
    participantName,
    activityTitle: activity.title,
    parkName: activity.parkName || 'Parque Municipal',
    activityStartDate: activityDate,
    activityStartTime: activity.startTime || '10:00',
    activityLocation: activity.location || 'Por confirmar',
    paymentAmount: (paymentIntent.amount / 100).toFixed(2),
    stripePaymentId: paymentIntent.id,
    paymentMethod,
    paymentDate: currentDate
  };

  // HTML content de la plantilla #13
  const htmlContent = `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
    <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
      <div style='text-align: center; margin-bottom: 30px;'>
        <h1 style='color: #16a34a; margin: 0; font-size: 28px;'>🎯 ParkSys</h1>
      </div>
      
      <div style='text-align: center; margin-bottom: 30px;'>
        <div style='font-size: 48px; margin-bottom: 15px;'>💳</div>
        <h2 style='color: #16a34a; margin: 0; font-size: 24px;'>¡Pago Confirmado!</h2>
      </div>
      
      <div style='background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
        <p style='margin: 0; color: #333; font-size: 16px;'>
          <strong>¡Perfecto, ${variables.participantName}!</strong>
        </p>
        <p style='margin: 10px 0 0 0; color: #666;'>
          Tu pago para <strong>${variables.activityTitle}</strong> ha sido procesado exitosamente. 
          ¡Tu lugar está completamente reservado!
        </p>
      </div>
      
      <div style='background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;'>
        <h3 style='color: #1d4ed8; margin-top: 0;'>💰 Detalles del Pago:</h3>
        <ul style='list-style: none; padding: 0; margin: 0;'>
          <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>💵 Monto:</strong> $${variables.paymentAmount} MXN</li>
          <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>🆔 ID de Transacción:</strong> ${variables.stripePaymentId}</li>
          <li style='padding: 8px 0; border-bottom: 1px solid #e2e8f0;'><strong>💳 Método:</strong> ${variables.paymentMethod}</li>
          <li style='padding: 8px 0;'><strong>📅 Fecha de Pago:</strong> ${variables.paymentDate}</li>
        </ul>
      </div>
      
      <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
        <h3 style='color: #16a34a; margin-top: 0;'>📋 Detalles de tu Actividad:</h3>
        <ul style='list-style: none; padding: 0; margin: 0;'>
          <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🎯 Actividad:</strong> ${variables.activityTitle}</li>
          <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>🏛️ Parque:</strong> ${variables.parkName}</li>
          <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>📅 Fecha:</strong> ${variables.activityStartDate}</li>
          <li style='padding: 10px 0; border-bottom: 1px solid #e2e8f0;'><strong>⏰ Hora:</strong> ${variables.activityStartTime}</li>
          <li style='padding: 10px 0;'><strong>📍 Ubicación:</strong> ${variables.activityLocation}</li>
        </ul>
      </div>
      
      <div style='background-color: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
        <h3 style='color: #1d4ed8; margin-top: 0;'>📝 Información Importante:</h3>
        <ul style='color: #1e40af; margin: 0; padding-left: 20px;'>
          <li style='margin-bottom: 8px;'>Tu inscripción está <strong>confirmada automáticamente</strong> al completar el pago</li>
          <li style='margin-bottom: 8px;'>Llega <strong>15 minutos antes</strong> de la hora programada</li>
          <li style='margin-bottom: 8px;'>Trae ropa cómoda y adecuada para la actividad</li>
          <li style='margin-bottom: 8px;'>Presenta este email como comprobante en caso necesario</li>
          <li>Para cancelaciones, contacta al equipo con <strong>24 horas de anticipación</strong></li>
        </ul>
      </div>
      
      <div style='background-color: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;'>
        <p style='margin: 0; color: #166534; font-size: 16px;'>
          <strong>✅ Estado: PAGADO Y CONFIRMADO</strong><br>
          <span style='font-size: 14px;'>Procesado el ${variables.paymentDate}</span>
        </p>
      </div>
      
      <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;'>
        <p style='color: #666; font-size: 14px; margin: 0;'>
          ¡Gracias por tu pago y nos vemos pronto!<br>
          Sistema de Gestión de Parques Urbanos
        </p>
      </div>
    </div>
  </div>`;

  const textContent = `¡Pago Confirmado!

¡Perfecto, ${variables.participantName}!

Tu pago para ${variables.activityTitle} ha sido procesado exitosamente. ¡Tu lugar está completamente reservado!

DETALLES DEL PAGO:
- Monto: $${variables.paymentAmount} MXN
- ID de Transacción: ${variables.stripePaymentId}
- Método: ${variables.paymentMethod}
- Fecha de Pago: ${variables.paymentDate}

DETALLES DE TU ACTIVIDAD:
- Actividad: ${variables.activityTitle}
- Parque: ${variables.parkName}
- Fecha: ${variables.activityStartDate}
- Hora: ${variables.activityStartTime}
- Ubicación: ${variables.activityLocation}

INFORMACIÓN IMPORTANTE:
- Tu inscripción está confirmada automáticamente al completar el pago
- Llega 15 minutos antes de la hora programada
- Trae ropa cómoda y adecuada para la actividad
- Presenta este email como comprobante en caso necesario
- Para cancelaciones, contacta al equipo con 24 horas de anticipación

ESTADO: PAGADO Y CONFIRMADO
Procesado el ${variables.paymentDate}

¡Gracias por tu pago y nos vemos pronto!
Sistema de Gestión de Parques Urbanos`;

  await emailService.sendEmail({
    to: email,
    subject: `💳 ¡Pago Confirmado! - ${variables.activityTitle}`,
    html: htmlContent,
    text: textContent
  });

  console.log('✅ Email de confirmación de pago Stripe enviado a:', email);
}