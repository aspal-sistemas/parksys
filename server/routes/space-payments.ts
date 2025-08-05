import { Express } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { spaceReservations, reservableSpaces, parks } from "../../shared/schema";

// Configurar Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function registerSpacePaymentRoutes(app: Express) {
  
  // Crear Payment Intent para una reserva de espacio
  app.post("/api/space-reservations/:id/create-payment-intent", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      console.log(`🎪 Creando payment intent para reserva ${id} por $${amount}`);

      // Validar que la reserva existe
      const reservation = await db
        .select()
        .from(spaceReservations)
        .where(eq(spaceReservations.id, parseInt(id)))
        .limit(1);

      if (reservation.length === 0) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      // Obtener información del espacio y parque
      const spaceInfo = await db
        .select({
          spaceName: reservableSpaces.name,
          parkName: parks.name,
          hourlyRate: reservableSpaces.hourlyRate
        })
        .from(reservableSpaces)
        .leftJoin(parks, eq(reservableSpaces.parkId, parks.id))
        .where(eq(reservableSpaces.id, reservation[0].spaceId))
        .limit(1);

      const spaceName = spaceInfo[0]?.spaceName || 'Espacio';
      const parkName = spaceInfo[0]?.parkName || 'Parque';

      // Convertir el amount a centavos (Stripe requiere centavos)
      const amountInCentavos = Math.round(amount * 100);
      
      console.log(`💰 Conversion: ${amount} pesos → ${amountInCentavos} centavos`);

      // Crear el Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCentavos,
        currency: "mxn",
        payment_method_types: ["card", "oxxo"],
        metadata: {
          reservationId: id,
          reservationType: 'space',
          spaceName: spaceName,
          parkName: parkName,
          customerName: reservation[0].contactName,
          customerEmail: reservation[0].contactEmail
        },
        description: `Reserva de ${spaceName} en ${parkName}`,
        receipt_email: reservation[0].contactEmail
      });

      console.log(`✅ Payment intent creado: ${paymentIntent.id} por ${amountInCentavos} centavos`);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error: any) {
      console.error("❌ Error creando payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Confirmar pago de reserva de espacio
  app.post("/api/space-reservations/:id/payment-confirm", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      console.log(`✅ Confirmando pago para reserva ${id}`);

      // Actualizar estado de la reserva
      const updatedReservation = await db
        .update(spaceReservations)
        .set({
          status: 'confirmed',
          depositPaid: db.select({ totalCost: spaceReservations.totalCost }).from(spaceReservations).where(eq(spaceReservations.id, parseInt(id))),
          updatedAt: new Date()
        })
        .where(eq(spaceReservations.id, parseInt(id)))
        .returning();

      if (updatedReservation.length === 0) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      console.log(`💳 Pago confirmado para reserva ${id}`);

      // TODO: Enviar email de confirmación de pago
      // await sendSpacePaymentConfirmationEmail(updatedReservation[0]);

      res.json({
        success: true,
        message: "Pago confirmado exitosamente",
        reservation: updatedReservation[0]
      });

    } catch (error: any) {
      console.error("❌ Error confirmando pago:", error);
      res.status(500).json({ 
        error: "Error confirming payment: " + error.message 
      });
    }
  });

  // Webhook de Stripe para manejar eventos de pago
  app.post("/api/webhooks/stripe/spaces", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Stripe webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const reservationId = paymentIntent.metadata.reservationId;
          
          if (reservationId && paymentIntent.metadata.reservationType === 'space') {
            // Confirmar el pago en la base de datos
            await db
              .update(spaceReservations)
              .set({
                status: 'confirmed',
                depositPaid: (paymentIntent.amount / 100).toString(),
                updatedAt: new Date()
              })
              .where(eq(spaceReservations.id, parseInt(reservationId)));

            console.log(`✅ Pago webhook procesado para reserva ${reservationId}`);
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          const failedReservationId = failedPayment.metadata.reservationId;
          
          if (failedReservationId && failedPayment.metadata.reservationType === 'space') {
            console.log(`❌ Pago fallido para reserva ${failedReservationId}`);
            // TODO: Manejar pago fallido - notificar al usuario
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({ error: 'Error processing webhook' });
    }
  });
}