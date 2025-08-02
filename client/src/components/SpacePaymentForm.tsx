import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Building
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Configurar Stripe con opciones para México
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {
  locale: 'es',
});

interface SpaceReservation {
  id: number;
  spaceId: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalCost: string;
  status: string;
  purpose: string;
  specialRequests?: string;
}

interface SpaceData {
  id: number;
  name: string;
  description: string;
  spaceType: string;
  capacity: number;
  hourlyRate: string;
  parkName: string;
  requiresApproval: boolean;
}

interface SpacePaymentFormProps {
  reservation: SpaceReservation;
  space: SpaceData;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ reservation, space, onPaymentSuccess, onCancel }: SpacePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const processPayment = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) {
        throw new Error('Stripe no está disponible');
      }

      setIsProcessing(true);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/space-payment-success',
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      // Marcar reserva como pagada
      const response = await apiRequest('POST', `/api/space-reservations/${reservation.id}/payment-confirm`, {
        paymentIntentId: 'confirmed'
      });

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago procesado exitosamente",
        description: "Tu reserva ha sido confirmada y el pago procesado.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/space-reservations/${reservation.id}`] });
      onPaymentSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error en el pago",
        description: error.message || "Ocurrió un error al procesar el pago.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    processPayment.mutate();
  };

  const totalCost = parseFloat(reservation.totalCost);
  const startTime = reservation.startTime.slice(0, 5); // HH:MM
  const endTime = reservation.endTime.slice(0, 5); // HH:MM

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Resumen de Reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Información del Espacio</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{space.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{space.parkName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Hasta {space.capacity} personas</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{new Date(reservation.reservationDate).toLocaleDateString('es-MX')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>{startTime} - {endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold">${totalCost.toLocaleString('es-MX')}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
            <div className="text-sm text-gray-600">
              <div>{reservation.contactName}</div>
              <div>{reservation.contactEmail}</div>
              <div>{reservation.contactPhone}</div>
            </div>
          </div>

          {reservation.purpose && reservation.purpose !== 'Reserva general de espacio' && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Propósito</h4>
                <p className="text-sm text-gray-600">{reservation.purpose}</p>
              </div>
            </>
          )}

          {reservation.specialRequests && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Solicitudes Especiales</h4>
                <p className="text-sm text-gray-600">{reservation.specialRequests}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Información de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Pago seguro con Stripe</span>
              </div>
              <p className="text-xs text-blue-700">
                Tu información de pago está protegida con encriptación de nivel bancario.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">${totalCost.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total a pagar:</span>
                <span className="text-green-600">${totalCost.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'oxxo']
              }}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pagar ${totalCost.toLocaleString('es-MX')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Lock className="h-3 w-3" />
          <span>Transacción segura</span>
        </div>
        <p>Powered by Stripe • Los datos de tu tarjeta están encriptados</p>
      </div>
    </div>
  );
}

export default function SpacePaymentForm(props: SpacePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Crear Payment Intent para la reserva del espacio
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🎪 Creando payment intent para reserva de espacio:', props.reservation.id);
        
        const response = await apiRequest('POST', `/api/space-reservations/${props.reservation.id}/create-payment-intent`, {
          reservationId: props.reservation.id,
          amount: parseFloat(props.reservation.totalCost)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al crear el payment intent');
        }
        
        if (!data.clientSecret) {
          throw new Error('No se recibió clientSecret del servidor');
        }
        
        console.log('✅ Payment intent creado exitosamente');
        setClientSecret(data.clientSecret);
        
      } catch (error) {
        console.error('❌ Error al crear payment intent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        toast({
          title: "Error al inicializar el pago",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.reservation.id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando el pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el pago</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={props.onCancel} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo inicializar el pago</p>
        </div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentForm {...props} />
    </Elements>
  );
}