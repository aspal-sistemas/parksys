import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './checkout-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Cargar Stripe con la clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripeCheckoutProps {
  serviceType: 'activity' | 'event' | 'space_reservation' | 'concession_fee' | 'sponsorship' | 'permit' | 'maintenance_service' | 'other';
  serviceId: number;
  serviceName: string;
  serviceDescription?: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

export function StripeCheckout({
  serviceType,
  serviceId,
  serviceName,
  serviceDescription,
  amount,
  currency = 'mxn',
  customerName,
  customerEmail,
  customerPhone,
  metadata,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest('POST', '/api/payments/create-payment-intent', {
          serviceType,
          serviceId,
          serviceName,
          serviceDescription,
          amount,
          currency,
          customerName,
          customerEmail,
          customerPhone,
          metadata
        });

        const data = await response.json();

        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Error al crear el pago');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
        setError(errorMessage);
        onPaymentError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0 && customerName && customerEmail) {
      createPaymentIntent();
    } else {
      setError('Información de pago incompleta');
      setIsLoading(false);
    }
  }, [serviceType, serviceId, serviceName, amount, currency, customerName, customerEmail]);

  // Verificar que Stripe esté configurado
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error de Configuración</CardTitle>
          <CardDescription>
            La integración de pagos no está configurada correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Falta la clave pública de Stripe. Por favor contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Preparando Pago</CardTitle>
          <CardDescription>
            Inicializando sistema de pagos seguro...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-sm text-gray-600">Esto puede tomar unos segundos</p>
        </CardContent>
      </Card>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>
            No se pudo inicializar el sistema de pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Opciones para Stripe Elements
  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif',
      },
    },
    locale: 'es' as const,
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Elements stripe={stripePromise} options={elementsOptions}>
        <CheckoutForm
          amount={amount}
          currency={currency}
          serviceName={serviceName}
          serviceDescription={serviceDescription}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Elements>
    </div>
  );
}