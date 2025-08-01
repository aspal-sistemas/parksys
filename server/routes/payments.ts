import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { eq, and, sql } from 'drizzle-orm';
import { payments, stripeWebhookEvents } from '../../shared/schema.js';
import { 
  createPaymentIntent,
  createPaymentIntentSchema,
  confirmPayment,
  createRefund,
  verifyWebhookSignature
} from '../services/stripeService.js';

const router = Router();

// Crear un payment intent
router.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    console.log('🎯 PAYMENT REQUEST RECEIVED:', req.body);
    const validatedData = createPaymentIntentSchema.parse(req.body);
    console.log('✅ VALIDATION PASSED:', validatedData);
    
    // Crear el payment intent en Stripe
    console.log('🚀 CREATING STRIPE PAYMENT INTENT...');
    const paymentIntent = await createPaymentIntent(validatedData);
    console.log('✅ STRIPE PAYMENT INTENT CREATED:', paymentIntent);
    
    // Guardar el pago en la base de datos con status pending
    const paymentRecord = await db.insert(payments).values({
      stripePaymentIntentId: paymentIntent.paymentIntentId,
      serviceType: validatedData.serviceType,
      serviceId: validatedData.serviceId,
      serviceName: validatedData.serviceName,
      serviceDescription: validatedData.serviceDescription || null,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone || null,
      amount: validatedData.amount.toString(),
      currency: validatedData.currency,
      status: 'pending',
      receiptEmail: validatedData.customerEmail,
      metadata: validatedData.metadata || {}
    }).returning({ id: payments.id });

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: validatedData.amount,
      currency: validatedData.currency
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent'
    });
  }
});

// Confirmar un pago completado
router.post('/api/payments/confirm/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    // Obtener detalles del pago desde Stripe
    const paymentDetails = await confirmPayment(paymentIntentId);
    
    // Actualizar el estado en la base de datos
    if (paymentDetails.status === 'succeeded') {
      await db.execute(`
        UPDATE payments 
        SET status = 'succeeded', paid_at = NOW(), updated_at = NOW()
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntentId]);
    } else if (paymentDetails.status === 'canceled') {
      await db.execute(`
        UPDATE payments 
        SET status = 'canceled', canceled_at = NOW(), updated_at = NOW()
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntentId]);
    } else if (paymentDetails.status === 'payment_failed') {
      await db.execute(`
        UPDATE payments 
        SET status = 'failed', failed_at = NOW(), updated_at = NOW()
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntentId]);
    }

    res.json({
      success: true,
      status: paymentDetails.status,
      amount: paymentDetails.amount / 100, // Convertir de centavos
      currency: paymentDetails.currency
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment'
    });
  }
});

// Obtener historial de pagos
router.get('/api/payments', async (req, res) => {
  try {
    const { page = '1', limit = '10', serviceType, status } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Construir condiciones where con Drizzle ORM
    let whereConditions = [];
    
    if (serviceType) {
      whereConditions.push(eq(payments.serviceType, serviceType as string));
    }
    
    if (status) {
      whereConditions.push(eq(payments.status, status as any));
    }

    // Obtener pagos con paginación
    const paymentsData = await db
      .select({
        id: payments.id,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        serviceType: payments.serviceType,
        serviceId: payments.serviceId,
        serviceName: payments.serviceName,
        customerName: payments.customerName,
        customerEmail: payments.customerEmail,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt
      })
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(payments.createdAt)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Obtener total de registros
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: paymentsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

// Obtener detalles de un pago específico
router.get('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentResult = await db.execute(`
      SELECT * FROM payments WHERE id = $1
    `, [parseInt(id)]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: paymentResult.rows[0]
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    });
  }
});

// Crear reembolso
router.post('/api/payments/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    // Obtener el pago de la base de datos
    const paymentResult = await db.execute(`
      SELECT stripe_payment_intent_id, amount as original_amount, status 
      FROM payments WHERE id = $1
    `, [parseInt(id)]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const payment = paymentResult.rows[0] as any;
    
    if (payment.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Only succeeded payments can be refunded'
      });
    }

    // Crear reembolso en Stripe
    const refund = await createRefund(
      payment.stripe_payment_intent_id,
      amount,
      reason
    );

    // Actualizar el estado del pago
    const refundAmount = refund.amount / 100; // Convertir de centavos
    const originalAmount = parseFloat(payment.original_amount);
    
    if (refundAmount >= originalAmount) {
      await db.execute(`
        UPDATE payments 
        SET status = 'refunded', refunded_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [parseInt(id)]);
    } else {
      await db.execute(`
        UPDATE payments 
        SET status = 'partially_refunded', updated_at = NOW()
        WHERE id = $1
      `, [parseInt(id)]);
    }

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      }
    });

  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund'
    });
  }
});

// Webhook de Stripe para manejar eventos
router.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    // Verificar la firma del webhook
    const event = await verifyWebhookSignature(req.body, signature, endpointSecret);

    // Guardar evento en la base de datos
    await db.execute(`
      INSERT INTO stripe_webhook_events (stripe_event_id, event_type, event_data)
      VALUES ($1, $2, $3)
    `, [event.id, event.type, JSON.stringify(event.data)]);

    // Procesar el evento según su tipo
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as any;
        await db.execute(`
          UPDATE payments 
          SET status = 'succeeded', paid_at = NOW(), updated_at = NOW(),
              payment_method = $2
          WHERE stripe_payment_intent_id = $1
        `, [paymentIntent.id, paymentIntent.charges?.data[0]?.payment_method_details?.type || null]);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as any;
        await db.execute(`
          UPDATE payments 
          SET status = 'failed', failed_at = NOW(), updated_at = NOW(),
              error_message = $2
          WHERE stripe_payment_intent_id = $1
        `, [failedPayment.id, failedPayment.last_payment_error?.message || 'Payment failed']);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as any;
        await db.execute(`
          UPDATE payments 
          SET status = 'canceled', canceled_at = NOW(), updated_at = NOW()
          WHERE stripe_payment_intent_id = $1
        `, [canceledPayment.id]);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Marcar el evento como procesado
    await db.execute(`
      UPDATE stripe_webhook_events 
      SET processed = TRUE, processed_at = NOW()
      WHERE stripe_event_id = $1
    `, [event.id]);

    res.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Webhook processing failed'
    });
  }
});

export default router;