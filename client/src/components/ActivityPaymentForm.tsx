import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ActivityPaymentFormProps {
  activityId: string;
  activity?: {
    id: number;
    title: string;
    price: string | number;
    isFree?: boolean;
    isPriceRandom?: boolean;
    parkName?: string;
  };
  participantData: {
    fullName: string;
    email: string;
    phone?: string;
    additionalInfo?: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function ActivityPaymentForm({ 
  activityId,
  activity, 
  participantData, 
  onSuccess, 
  onError 
}: ActivityPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [customAmount, setCustomAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Determine if this is a suggested price (random pricing)
  const isPriceRandom = activity?.isPriceRandom || false;
  const basePrice = parseFloat(activity?.price?.toString() || '0');

  // Payment processing mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch(`/api/activities/${activityId}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el pago');
      }
      
      return response.json();
    },
    onError: (error: Error) => {
      setProcessing(false);
      setPaymentError(error.message);
      onError(error.message);
    }
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setPaymentError('Stripe no está disponible');
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Elemento de tarjeta no encontrado');
      setProcessing(false);
      return;
    }

    // Determine final amount
    const finalAmount = isPriceRandom && customAmount 
      ? parseFloat(customAmount) 
      : basePrice;

    if (finalAmount <= 0) {
      setPaymentError('El monto debe ser mayor a $0');
      setProcessing(false);
      return;
    }

    try {
      // Step 1: Create payment intent
      const paymentIntentData = await createPaymentIntentMutation.mutateAsync({
        customerData: {
          fullName: participantData.fullName,
          email: participantData.email,
          phone: participantData.phone,
        },
        amount: finalAmount,
      });

      // Step 2: Confirm payment with Stripe
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: participantData.fullName,
              email: participantData.email,
              phone: participantData.phone,
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Payment successful
      setProcessing(false);
      onSuccess();

    } catch (error: any) {
      setProcessing(false);
      setPaymentError(error.message || 'Error inesperado en el pago');
      onError(error.message || 'Error inesperado en el pago');
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-MX')} MXN`;
  };

  if (activity?.isFree) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta actividad es gratuita. No se requiere pago.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen de pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Actividad:</span>
              <span className="font-medium">{activity?.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Ubicación:</span>
              <span>{activity?.parkName || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span>Participante:</span>
              <span>{participantData.fullName}</span>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center">
              <span>Precio base:</span>
              <Badge variant="outline">
                {formatPrice(basePrice)}
                {isPriceRandom && " (sugerido)"}
              </Badge>
            </div>
            
            {isPriceRandom && (
              <div className="space-y-2">
                <Label htmlFor="customAmount">Monto personalizado (opcional)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min={basePrice}
                  step="0.01"
                  placeholder={`Mínimo: ${formatPrice(basePrice)}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Puedes pagar más del monto sugerido si lo deseas
                </p>
              </div>
            )}
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total a pagar:</span>
              <span className="text-green-600">
                {formatPrice(isPriceRandom && customAmount 
                  ? parseFloat(customAmount) 
                  : basePrice
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información de pago
          </CardTitle>
          <CardDescription>
            Completa los datos de tu tarjeta para procesar el pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            {/* Card Element */}
            <div className="p-4 border rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Payment Error */}
            {paymentError && (
              <Alert variant="destructive">
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}

            {/* Security Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tu información de pago está protegida con encriptación SSL y es procesada de forma segura.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onError('Pago cancelado por el usuario')}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!stripe || processing}
                className="min-w-[120px]"
              >
                {processing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Procesando...
                  </>
                ) : (
                  `Pagar ${formatPrice(isPriceRandom && customAmount 
                    ? parseFloat(customAmount) 
                    : basePrice
                  )}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}