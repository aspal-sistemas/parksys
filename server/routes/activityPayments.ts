import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { activityRegistrations } from "../../shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function registerActivityPaymentRoutes(app: Express) {
  // Crear payment intent para pago de actividad
  app.post("/api/activities/:activityId/create-payment-intent", async (req, res) => {
    try {
      const { activityId } = req.params;
      const { registrationId, customerData } = req.body;

      // Obtener datos de la actividad
      const activity = await storage.getActivityById(parseInt(activityId));
      if (!activity) {
        return res.status(404).json({ error: "Actividad no encontrada" });
      }

      if (activity.isFree) {
        return res.status(400).json({ error: "Esta actividad es gratuita" });
      }

      const amount = Math.round(parseFloat(activity.price || "0") * 100); // Convert to cents

      // Crear customer en Stripe si se proporcionan datos
      let customerId;
      if (customerData?.email) {
        try {
          const customer = await stripe.customers.create({
            email: customerData.email,
            name: customerData.fullName,
            phone: customerData.phone,
            metadata: {
              activityId: activityId,
              registrationId: registrationId?.toString() || 'pending'
            }
          });
          customerId = customer.id;
        } catch (error) {
          console.warn("Error creating Stripe customer:", error);
        }
      }

      // Crear payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "mxn",
        customer: customerId,
        payment_method_types: ['card'],
        metadata: {
          activityId: activityId,
          registrationId: registrationId?.toString() || 'pending',
          activityTitle: activity.title,
          parkName: activity.parkName || 'Parque Municipal'
        },
        description: `Pago por actividad: ${activity.title}`,
      });

      // Si ya existe un registro, actualizar con el payment intent
      if (registrationId) {
        await storage.updateActivityRegistration(parseInt(registrationId), {
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: customerId,
          paymentStatus: 'pending'
        });
      }

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customerId,
        amount: amount / 100,
        currency: 'mxn'
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error procesando el pago: " + error.message 
      });
    }
  });

  // Confirmar pago exitoso y actualizar registro
  app.post("/api/activities/:activityId/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId, registrationId } = req.body;

      // Verificar el payment intent con Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: "El pago no ha sido completado exitosamente" 
        });
      }

      // Actualizar el registro con el pago confirmado
      const updateData = {
        paymentStatus: 'paid' as const,
        stripePaymentIntentId: paymentIntentId,
        paidAmount: (paymentIntent.amount / 100).toString(),
        paymentDate: new Date()
      };

      await storage.updateActivityRegistration(parseInt(registrationId), updateData);

      // Obtener el registro actualizado
      const registration = await storage.getActivityRegistrationById(parseInt(registrationId));

      res.json({ 
        success: true, 
        registration,
        paymentAmount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase()
      });
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        error: "Error confirmando el pago: " + error.message 
      });
    }
  });

  // Webhook para manejar eventos de Stripe
  app.post("/api/stripe/webhook/activity-payments", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const registrationId = paymentIntent.metadata.registrationId;
        
        if (registrationId && registrationId !== 'pending') {
          try {
            await storage.updateActivityRegistration(parseInt(registrationId), {
              paymentStatus: 'paid',
              stripePaymentIntentId: paymentIntent.id,
              paidAmount: (paymentIntent.amount / 100).toString(),
              paymentDate: new Date()
            });
            console.log(`✅ Payment confirmed for registration ${registrationId}`);
          } catch (error) {
            console.error(`Error updating registration ${registrationId}:`, error);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const failedRegistrationId = failedPayment.metadata.registrationId;
        
        if (failedRegistrationId && failedRegistrationId !== 'pending') {
          try {
            await storage.updateActivityRegistration(parseInt(failedRegistrationId), {
              paymentStatus: 'failed'
            });
            console.log(`❌ Payment failed for registration ${failedRegistrationId}`);
          } catch (error) {
            console.error(`Error updating failed payment for registration ${failedRegistrationId}:`, error);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Obtener estado del pago para un registro
  app.get("/api/activities/registrations/:registrationId/payment-status", async (req, res) => {
    try {
      const { registrationId } = req.params;
      
      const registration = await storage.getActivityRegistrationById(parseInt(registrationId));
      if (!registration) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      let stripeStatus = null;
      if (registration.stripePaymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(registration.stripePaymentIntentId);
          stripeStatus = paymentIntent.status;
        } catch (error) {
          console.warn("Error retrieving payment intent from Stripe:", error);
        }
      }

      res.json({
        registrationId: registration.id,
        paymentStatus: registration.paymentStatus,
        stripeStatus,
        paidAmount: registration.paidAmount,
        paymentDate: registration.paymentDate,
        stripePaymentIntentId: registration.stripePaymentIntentId
      });
    } catch (error: any) {
      console.error("Error getting payment status:", error);
      res.status(500).json({ 
        error: "Error obteniendo estado del pago: " + error.message 
      });
    }
  });
}