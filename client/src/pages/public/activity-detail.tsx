import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityPaymentForm } from '@/components/ActivityPaymentForm';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Schema for registration form
const registrationSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').optional(),
  additionalInfo: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export default function ActivityDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'payment' | 'success'>('form');

  const activityId = parseInt(params.id || '0');

  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['/api/activities', activityId],
    enabled: activityId > 0,
  });

  // Registration form
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      additionalInfo: '',
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest(
        'POST',
        `/api/activities/${activityId}/register`,
        { data }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrarse');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId] });
      
      if (activity && (activity as any).isFree) {
        // Free activity - show success directly
        setRegistrationStep('success');
        toast({
          title: "¡Registro exitoso!",
          description: activity && (activity as any).requiresApproval 
            ? "Tu registro está pendiente de aprobación. Recibirás una confirmación por email."
            : "Te has registrado exitosamente a la actividad.",
        });
      } else {
        // Paid activity - proceed to payment
        setRegistrationStep('payment');
        setShowPaymentDialog(true);
        setShowRegistrationDialog(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    setRegistrationData(data);
    registerMutation.mutate(data);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setRegistrationStep('success');
    setShowPaymentDialog(false);
    toast({
      title: "¡Registro y pago exitosos!",
      description: `Tu pago de ${paymentData.amount} MXN ha sido procesado. ${
        activity && (activity as any).requiresApproval 
          ? 'Tu registro está pendiente de aprobación.'
          : 'Estás registrado en la actividad.'
      }`,
    });
    
    // Refresh activity data
    queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId] });
  };

  const getAvailableSlots = () => {
    if (!activity) return 0;
    const activityData = activity as any;
    const totalSlots = activityData.maxRegistrations || activityData.capacity || 0;
    const registeredCount = activityData.registeredCount || 0;
    return Math.max(0, totalSlots - registeredCount);
  };

  const formatPrice = () => {
    if (!activity) return '';
    const activityData = activity as any;
    if (activityData.isFree) return 'Gratuita';
    if (activityData.isPriceRandom) {
      return `Desde $${parseFloat(activityData.price).toLocaleString('es-MX')} MXN (sugerido)`;
    }
    return `$${parseFloat(activityData.price).toLocaleString('es-MX')} MXN`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Actividad no encontrada</h2>
            <p className="text-gray-600 mb-4">
              La actividad que buscas no existe o no está disponible para inscripciones.
            </p>
            <Button onClick={() => setLocation('/public/activities')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a actividades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableSlots = getAvailableSlots();
  const isFullyBooked = availableSlots === 0;
  const canRegister = activity && (activity as any).registrationEnabled && !isFullyBooked;
  const activityData = activity as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/public/activities')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a actividades
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {(activity as any).category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {(activity as any).title}
              </h1>
              <p className="text-lg text-gray-600">
                {(activity as any).description}
              </p>
            </div>
            
            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {formatPrice()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {(activity as any).parkName}
                    {(activity as any).location && ` - ${(activity as any).location}`}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {(activity as any).startDate ? 
                      format(new Date((activity as any).startDate), 'PPP', { locale: es }) 
                      : 'Fecha por confirmar'
                    }
                  </div>
                  
                  {(activity as any).startTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {(activity as any).startTime}
                      {(activity as any).duration && ` (${(activity as any).duration} min)`}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    {availableSlots} espacios disponibles
                    {(activity as any).maxRegistrations && ` de ${(activity as any).maxRegistrations}`}
                  </div>
                </div>
                
                {(activity as any).requiresApproval && (
                  <Badge variant="outline" className="mt-3 text-xs">
                    Requiere aprobación administrativa
                  </Badge>
                )}
                
                {/* Price and payment info */}
                {!activityData.isFree && canRegister && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">
                        {activityData.isPriceRandom ? 'Cuota sugerida' : 'Precio fijo'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {activityData.isPriceRandom 
                        ? `Puedes contribuir desde $${parseFloat(activityData.price).toLocaleString('es-MX')} MXN o la cantidad que desees`
                        : 'El pago se procesa de forma segura con Stripe'
                      }
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full mt-4" 
                  disabled={!canRegister}
                  onClick={() => setShowRegistrationDialog(true)}
                  variant={activityData.isFree ? "default" : "default"}
                >
                  {isFullyBooked 
                    ? 'Sin espacios disponibles' 
                    : !activityData.registrationEnabled 
                    ? 'Inscripciones cerradas'
                    : activityData.isFree 
                    ? 'Inscribirse gratis'
                    : `Inscribirse - ${formatPrice()}`
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {(activity as any).description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {(activity as any).description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Materials and Requirements */}
            {((activity as any).materials || (activity as any).requirements) && (
              <Card>
                <CardHeader>
                  <CardTitle>Información importante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(activity as any).materials && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Materiales necesarios:</h4>
                      <p className="text-gray-700">{(activity as any).materials}</p>
                    </div>
                  )}
                  
                  {(activity as any).requirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requisitos:</h4>
                      <p className="text-gray-700">{(activity as any).requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructor */}
            {(activity as any).instructorName && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{(activity as any).instructorName}</p>
                      {(activity as any).instructorContact && (
                        <p className="text-sm text-gray-600">{(activity as any).instructorContact}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {(activity as any).capacity && (
                  <div className="flex justify-between">
                    <span>Capacidad máxima:</span>
                    <span className="font-medium">{(activity as any).capacity} personas</span>
                  </div>
                )}
                
                {(activity as any).duration && (
                  <div className="flex justify-between">
                    <span>Duración:</span>
                    <span className="font-medium">{(activity as any).duration} minutos</span>
                  </div>
                )}
                
                {(activity as any).registrationDeadline && (
                  <div className="flex justify-between">
                    <span>Fecha límite:</span>
                    <span className="font-medium">
                      {(activity as any).registrationDeadline ? 
                        format(new Date((activity as any).registrationDeadline), 'PP', { locale: es }) 
                        : 'Por confirmar'
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inscripción a la actividad</DialogTitle>
            <DialogDescription>
              Completa tus datos para inscribirte a "{(activity as any).title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegistrationSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="5551234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información adicional (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cualquier información adicional que consideres relevante..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRegistrationDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Registrando...' : 'Continuar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pago de actividad</DialogTitle>
            <DialogDescription>
              Completa el pago para confirmar tu inscripción
            </DialogDescription>
          </DialogHeader>
          
          {registrationData && (
            <Elements stripe={stripePromise}>
              <ActivityPaymentForm
                activity={{
                  id: (activity as any).id,
                  title: (activity as any).title,
                  price: (activity as any).price,
                  isFree: (activity as any).isFree,
                  isPriceRandom: (activity as any).isPriceRandom,
                  parkName: (activity as any).parkName,
                }}
                registrationData={registrationData}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentDialog(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={registrationStep === 'success'} onOpenChange={() => setRegistrationStep('form')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              ¡Registro exitoso!
            </DialogTitle>
            <DialogDescription>
              {(activity as any).requiresApproval 
                ? 'Tu registro está pendiente de aprobación. Recibirás una confirmación por email cuando sea aprobado.'
                : 'Te has registrado exitosamente a la actividad. Te esperamos!'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setLocation('/public/activities')}>
              Ver más actividades
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}