import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  serviceName: string;
  serviceDescription?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
}

export function CheckoutForm({
  amount,
  currency,
  serviceName,
  serviceDescription,
  onPaymentSuccess,
  onPaymentError
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Error al procesar el pago');
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Error al confirmar el pago');
        onPaymentError?.(confirmError.message || 'Error al confirmar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsComplete(true);
        toast({
          title: "Pago Exitoso",
          description: `Tu pago de $${amount.toLocaleString()} ${currency.toUpperCase()} ha sido procesado exitosamente.`,
        });
        onPaymentSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Servicio:</span>
              <span className="text-sm">{serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Pagado:</span>
              <span className="text-sm font-bold">
                ${amount.toLocaleString()} {currency.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Completar Pago</CardTitle>
        <CardDescription>
          {serviceName}
          {serviceDescription && (
            <span className="block text-xs mt-1 text-gray-500">
              {serviceDescription}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumen del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total a pagar:</span>
            <span className="text-xl font-bold text-blue-600">
              ${amount.toLocaleString()} {currency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Formulario de pago */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Información de Pago
            </label>
            <div className="border rounded-lg p-3 bg-white">
              <PaymentElement
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || !elements || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando pago...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar ${amount.toLocaleString()} {currency.toUpperCase()}
              </>
            )}
          </Button>
        </form>

        {/* Información de seguridad */}
        <div className="text-xs text-gray-500 text-center">
          <p>🔒 Tu información está protegida con encriptación SSL</p>
          <p>Powered by Stripe</p>
        </div>
      </CardContent>
    </Card>
  );
}