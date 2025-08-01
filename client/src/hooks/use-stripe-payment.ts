import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface PaymentData {
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
}

export interface PaymentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export function useStripePayment() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/payments/create-payment-intent', paymentData);
      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId
        };
      } else {
        const errorMessage = data.error || 'Error al crear el pago';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (paymentIntentId: string): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', `/api/payments/confirm/${paymentIntentId}`);
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Pago Confirmado",
          description: `El pago ha sido procesado exitosamente.`,
        });

        return {
          success: true,
          paymentIntentId
        };
      } else {
        const errorMessage = data.error || 'Error al confirmar el pago';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al confirmar el pago';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getPayments = useCallback(async (filters?: {
    page?: number;
    limit?: number;
    serviceType?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.serviceType) queryParams.append('serviceType', filters.serviceType);
      if (filters?.status) queryParams.append('status', filters.status);

      const response = await apiRequest('GET', `/api/payments?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data,
          pagination: data.pagination
        };
      } else {
        const errorMessage = data.error || 'Error al obtener pagos';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener pagos';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentDetails = useCallback(async (paymentId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('GET', `/api/payments/${paymentId}`);
      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        const errorMessage = data.error || 'Error al obtener detalles del pago';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles del pago';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRefund = useCallback(async (paymentId: number, amount?: number, reason?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', `/api/payments/${paymentId}/refund`, {
        amount,
        reason
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reembolso Creado",
          description: `El reembolso ha sido procesado exitosamente.`,
        });

        return {
          success: true,
          data: data.refund
        };
      } else {
        const errorMessage = data.error || 'Error al crear el reembolso';
        setError(errorMessage);
        toast({
          title: "Error en Reembolso",
          description: errorMessage,
          variant: "destructive",
        });
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el reembolso';
      setError(errorMessage);
      toast({
        title: "Error en Reembolso",
        description: errorMessage,
        variant: "destructive",
      });
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
    getPayments,
    getPaymentDetails,
    createRefund,
    clearError: () => setError(null)
  };
}