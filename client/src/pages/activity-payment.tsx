import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { StripeCheckout } from '@/components/ui/stripe-checkout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { Link } from 'wouter';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  parkName: string;
  startDate: string;
  endDate?: string;
  location: string;
  capacity: number;
  price: string;
  isFree: boolean;
  materials?: string;
  requirements?: string;
  duration: number;
  startTime: string;
  instructorName?: string;
  registrationEnabled: boolean;
  maxRegistrations?: number;
  registrationDeadline?: string;
  requiresApproval: boolean;
}

export default function ActivityPaymentPage() {
  const [match, params] = useRoute('/actividad/:id/pagar');
  const activityId = params?.id ? parseInt(params.id) : null;
  
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Obtener datos de la actividad
  const { data: activity, isLoading, error } = useQuery<Activity>({
    queryKey: ['/api/activities', activityId],
    enabled: !!activityId,
  });

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Pago exitoso:', paymentIntentId);
    setPaymentCompleted(true);
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Error en el pago:', error);
    // El error ya se muestra en el componente de checkout
  };

  const isFormValid = () => {
    return customerInfo.name.trim() !== '' && 
           customerInfo.email.trim() !== '' && 
           customerInfo.email.includes('@');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              No se pudo cargar la información de la actividad. Por favor intenta nuevamente.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/activities">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Actividades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (activity.isFree) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertDescription>
              Esta actividad es gratuita. No se requiere pago para participar.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href={`/actividad/${activity.id}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la Actividad
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">¡Pago Completado!</CardTitle>
              <CardDescription>
                Tu inscripción a la actividad ha sido procesada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{activity.title}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Monto pagado: ${parseFloat(activity.price).toLocaleString()} MXN
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    Participante: {customerInfo.name}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {activity.requiresApproval 
                  ? 'Tu inscripción está pendiente de aprobación. Recibirás un email de confirmación en breve.'
                  : 'Tu inscripción ha sido confirmada. Recibirás un email con los detalles.'
                }
              </p>
              <div className="flex gap-2">
                <Link href="/activities" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver más actividades
                  </Button>
                </Link>
                <Link href={`/actividad/${activity.id}`} className="flex-1">
                  <Button className="w-full">
                    Ver detalles de la actividad
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowPayment(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Completar Pago</h1>
            <p className="text-gray-600">Inscripción a: {activity.title}</p>
          </div>

          <StripeCheckout
            serviceType="activity"
            serviceId={activity.id}
            serviceName={activity.title}
            serviceDescription={`Inscripción a actividad en ${activity.parkName}`}
            amount={parseFloat(activity.price)}
            currency="mxn"
            customerName={customerInfo.name}
            customerEmail={customerInfo.email}
            customerPhone={customerInfo.phone}
            metadata={{
              activityId: activity.id.toString(),
              parkName: activity.parkName,
              registrationDate: new Date().toISOString()
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={() => setShowPayment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/actividad/${activity.id}`}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la Actividad
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Inscripción con Pago</h1>
          <p className="text-gray-600">Completa tu inscripción a la actividad</p>
        </div>

        {/* Información de la actividad */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {activity.title}
              <Badge variant="secondary">{activity.category}</Badge>
            </CardTitle>
            <CardDescription>{activity.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{activity.parkName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>{new Date(activity.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span>{activity.startTime} ({activity.duration} min)</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span>Capacidad: {activity.capacity} personas</span>
              </div>
              {activity.instructorName && (
                <div className="flex items-center md:col-span-2">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Instructor: {activity.instructorName}</span>
                </div>
              )}
            </div>
            
            {/* Precio destacado */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Costo de inscripción:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${parseFloat(activity.price).toLocaleString()} MXN
                </span>
              </div>
            </div>

            {activity.requirements && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Requisitos:</h4>
                <p className="text-sm text-gray-600">{activity.requirements}</p>
              </div>
            )}

            {activity.materials && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Materiales incluidos:</h4>
                <p className="text-sm text-gray-600">{activity.materials}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de información del participante */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Participante</CardTitle>
            <CardDescription>
              Proporciona tus datos para completar la inscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono (Opcional)</Label>
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="(55) 1234-5678"
              />
            </div>

            {activity.requiresApproval && (
              <Alert>
                <AlertDescription>
                  Esta actividad requiere aprobación previa. Tu inscripción será revisada y recibirás una confirmación por email.
                </AlertDescription>
              </Alert>
            )}

            {activity.registrationDeadline && (
              <Alert>
                <AlertDescription>
                  Fecha límite de inscripción: {new Date(activity.registrationDeadline).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Botón de proceder al pago */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-green-600">
                ${parseFloat(activity.price).toLocaleString()} MXN
              </span>
            </div>
            
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowPayment(true)}
              disabled={!isFormValid()}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceder al Pago
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Pagos seguros procesados por Stripe • SSL Encriptado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}