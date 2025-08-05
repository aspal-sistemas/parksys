import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  customerId?: string;
  amount: number;
  currency: string;
}

interface ActivityPaymentData {
  activityId: number;
  registrationId?: number;
  customerData?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export function useActivityPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = useMutation({
    mutationFn: async (data: ActivityPaymentData): Promise<PaymentIntentResponse> => {
      const response = await apiRequest(
        'POST', 
        `/api/activities/${data.activityId}/create-payment-intent`,
        {
          registrationId: data.registrationId,
          customerData: data.customerData
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando intent de pago');
      }
      
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const confirmPayment = useMutation({
    mutationFn: async ({ paymentIntentId, registrationId }: { 
      paymentIntentId: string; 
      registrationId: number; 
    }) => {
      const response = await apiRequest(
        'POST',
        `/api/activities/${registrationId}/confirm-payment`,
        {
          paymentIntentId,
          registrationId
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error confirmando el pago');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "¡Pago exitoso!",
        description: `Tu pago de $${data.paymentAmount} ${data.currency} ha sido procesado correctamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getPaymentStatus = useMutation({
    mutationFn: async (registrationId: number) => {
      const response = await apiRequest(
        'GET',
        `/api/activities/registrations/${registrationId}/payment-status`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo estado del pago');
      }
      
      return response.json();
    }
  });

  return {
    isProcessing,
    setIsProcessing,
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    isCreatingPayment: createPaymentIntent.isPending,
    isConfirmingPayment: confirmPayment.isPending,
    isCheckingStatus: getPaymentStatus.isPending
  };
}