import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ActivityPaymentForm } from '@/components/ActivityPaymentForm';
import { apiRequest } from '@/lib/queryClient';

interface ActivityData {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryName?: string;
  categoryId?: number;
  parkId: number;
  parkName: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: number;
  instructorId?: number;
  instructorName?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  materials?: string;
  requirements?: string;
  isFree?: boolean;
  isRecurring?: boolean;
  recurringDays?: string[];
  targetMarket?: string[];
  specialNeeds?: string[];
  // Campos de configuración de inscripciones
  registrationEnabled?: boolean;
  maxRegistrations?: number;
  registrationDeadline?: string;
  requiresApproval?: boolean;
}

interface ActivityImage {
  id: number;
  activityId: number;
  imageUrl: string;
  isPrimary: boolean;
  caption?: string;
  fileSize?: number;
}
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Star,
  User,
  Activity,
  Tag,
  Info,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdSpace from '@/components/AdSpace';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Schema for registration form
const registrationSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').optional(),
  additionalInfo: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

function ActivityDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const activityId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para modales y flujo de pago
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'payment' | 'success'>('form');

  // Estado del formulario de inscripción (legacy)
  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario para inscripciones con React Hook Form
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      additionalInfo: '',
    },
  });

  const { data: activity, isLoading, error } = useQuery<ActivityData>({
    queryKey: [`/api/activities/${activityId}`],
    enabled: !!activityId,
  });

  const { data: images = [] } = useQuery<ActivityImage[]>({
    queryKey: [`/api/activities/${activityId}/images`],
    enabled: !!activityId,
  });

  // Obtener estadísticas de inscripciones
  const { data: registrationStats, refetch: refetchStats } = useQuery({
    queryKey: [`/api/activity-registrations/stats/${activityId}`],
    enabled: !!activityId,
  });

  // Mutación para inscripción con Stripe
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
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}`] });
      
      if (activity && (activity as any).isFree) {
        // Actividad gratuita - mostrar éxito directamente
        setRegistrationStep('success');
        toast({
          title: "¡Registro exitoso!",
          description: activity && (activity as any).requiresApproval 
            ? "Tu registro está pendiente de aprobación. Recibirás una confirmación por email."
            : "Te has registrado exitosamente a la actividad.",
        });
      } else {
        // Actividad de pago - proceder al pago
        setRegistrationStep('payment');
        setShowPaymentDialog(true);
        setShowRegistrationDialog(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Mutación para enviar inscripción (legacy)
  const registrationMutation = useMutation({
    mutationFn: async (registrationData: any) => {
      const response = await fetch('/api/activity-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar inscripción');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Inscripción exitosa!",
        description: activity?.requiresApproval 
          ? "Tu solicitud ha sido enviada y será revisada. Recibirás una confirmación por correo."
          : "Te has inscrito exitosamente. Recibirás una confirmación por correo.",
      });
      // Limpiar formulario
      setFormData({
        participantName: '',
        participantEmail: '',
        participantPhone: '',
        notes: ''
      });
      // Actualizar estadísticas de inscripciones
      refetchStats();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al inscribirse",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Funciones de manejo (legacy - conservar por compatibilidad)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participantName || !formData.participantEmail || !formData.participantPhone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Preparar datos de registro
    const registrationFormData: RegistrationFormData = {
      fullName: formData.participantName,
      email: formData.participantEmail,
      phone: formData.participantPhone,
      additionalInfo: formData.notes || '',
    };

    setRegistrationData(registrationFormData);

    if (activity?.isFree || !activity?.price || activity.price === 0) {
      // Actividad gratuita - registrar directamente
      registerMutation.mutate(registrationFormData);
    } else {
      // Actividad de pago - ir directamente al pago
      setShowPaymentDialog(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la actividad...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Actividad no encontrada</h1>
          <p className="text-gray-600 mb-6">La actividad que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => setLocation('/activities')} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a actividades
          </Button>
        </div>
      </div>
    );
  }

  const startDate = activity?.startDate ? new Date(activity.startDate) : new Date();
  const endDate = activity?.endDate ? new Date(activity.endDate) : null;
  const isMultiDay = endDate && endDate.getTime() !== startDate.getTime();
  const primaryImage = images?.find((img: ActivityImage) => img.isPrimary) || images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/activities')}
              className="hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Detalle de Actividad</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen principal */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                {primaryImage ? (
                  <img
                    src={primaryImage.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="h-16 w-16 text-green-600/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{activity?.title}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{activity?.parkName}</span>
                    </div>
                    {activity?.categoryName && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <Tag className="h-3 w-3 mr-1" />
                        {activity.categoryName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Descripción */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {activity?.description || 'No hay descripción disponible para esta actividad.'}
                </p>
              </CardContent>
            </Card>

            {/* Formulario de Inscripción */}
            {activity?.registrationEnabled && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-green-600">¡Inscríbete a esta actividad!</CardTitle>
                  <p className="text-sm text-gray-600">
                    Completa el formulario para registrarte
                    {activity.requiresApproval && " (sujeto a aprobación)"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información de inscripción */}
                  <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Plazas disponibles:</span>
                      <span className="font-medium text-green-600">
                        {activity.maxRegistrations ? (
                          `${Math.max(0, activity.maxRegistrations - (registrationStats?.totalActive || 0))} de ${activity.maxRegistrations} disponibles`
                        ) : 'Sin límite'}
                      </span>
                    </div>
                    {registrationStats && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Inscritos actuales:</span>
                        <span className="font-medium text-blue-600">
                          {registrationStats.totalActive} personas
                          {registrationStats.pendingCount > 0 && (
                            <span className="text-orange-500 ml-1">
                              ({registrationStats.pendingCount} pendientes)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {activity.registrationDeadline && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fecha límite:</span>
                        <span className="font-medium text-orange-600">
                          {format(new Date(activity.registrationDeadline), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Formulario simple de inscripción */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        name="participantName"
                        value={formData.participantName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        name="participantEmail"
                        value={formData.participantEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="participantPhone"
                        value={formData.participantPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comentarios adicionales
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="¿Alguna pregunta o información adicional?"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={registrationMutation.isPending || registerMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {(registrationMutation.isPending || registerMutation.isPending) ? 'Procesando...' : 
                        (activity?.isFree || !activity?.price || activity.price === 0 
                          ? 'Inscribirse gratis'
                          : `Inscribirse - $${activity.price} MXN`
                        )
                      }
                    </Button>
                  </form>

                  <p className="text-xs text-gray-500 text-center">
                    {activity.requiresApproval 
                      ? "Tu solicitud será revisada y recibirás una confirmación por correo electrónico"
                      : "Recibirás una confirmación inmediata por correo electrónico"
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Galería de imágenes adicionales */}
            {images && images.length > 1 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Más imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.slice(0, 8).map((image: ActivityImage, index: number) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información de la actividad */}
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fecha y Horario */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Fecha y Horario</p>
                    <p className="text-sm text-gray-600">
                      {isMultiDay 
                        ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
                        : format(startDate, 'dd MMM yyyy', { locale: es })
                      }
                    </p>
                  </div>
                </div>

                {/* Hora de Inicio y Finalización */}
                {(activity?.startTime || activity?.endTime) && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Hora de Inicio y Finalización</p>
                      <p className="text-sm text-gray-600">
                        {activity?.startTime && `Inicio: ${activity.startTime}`}
                        {activity?.startTime && activity?.endTime && ' • '}
                        {activity?.endTime && `Fin: ${activity.endTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duración */}
                {activity?.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-sm text-gray-600">{activity.duration} minutos</p>
                    </div>
                  </div>
                )}

                {/* Recurrencia */}
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium">Recurrencia</p>
                    <p className="text-sm text-gray-600">
                      {activity?.isRecurring ? (
                        activity?.recurringDays && activity.recurringDays.length > 0 
                          ? `Recurrente: ${activity.recurringDays.join(', ')}`
                          : 'Actividad recurrente'
                      ) : (
                        'Actividad única'
                      )}
                    </p>
                  </div>
                </div>

                {/* Capacidad */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-sm text-gray-600">
                      {activity?.capacity ? `${activity.capacity} personas` : 'Sin límite de capacidad'}
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Precio</p>
                    <p className="text-sm text-gray-600">
                      {activity?.isFree || !activity?.price || activity.price === 0 
                        ? 'Gratuita' 
                        : `$${activity.price} MXN`
                      }
                    </p>
                  </div>
                </div>

                {/* Público (Segmentación) */}
                {activity?.targetMarket && activity.targetMarket.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Público</p>
                      <p className="text-sm text-gray-600">
                        {activity.targetMarket.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {activity?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-gray-600">{activity.location}</p>
                    </div>
                  </div>
                )}

                {/* Datos del Instructor */}
                {activity?.instructorName && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Datos del Instructor</p>
                      <p className="text-sm text-gray-600">{activity.instructorName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Espacio Publicitario - Diseño Tipo Tarjeta */}
            <AdSpace 
              spaceId="11" 
              position="card" 
              pageType="activity-detail" 
            />



            {/* Botón de contacto */}
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Contactar para más información
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Te ayudaremos con cualquier pregunta sobre esta actividad
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>



      {/* Diálogo de pago con Stripe */}
      {showPaymentDialog && registrationData && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Realizar pago</DialogTitle>
              <DialogDescription>
                Completa tu pago para confirmar tu inscripción
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">{activity?.title}</h4>
                <p className="text-sm text-gray-600">
                  Participante: {registrationData?.fullName}
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  ${activity?.price} MXN
                </p>
              </div>
              
              <Elements stripe={stripePromise}>
                <ActivityPaymentForm
                  activityId={activityId!}
                  activity={activity}
                  participantData={registrationData}
                  onSuccess={() => {
                    setShowPaymentDialog(false);
                    setRegistrationStep('success');
                    toast({
                      title: "¡Pago exitoso!",
                      description: "Tu inscripción ha sido confirmada. Recibirás un email de confirmación.",
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "Error en el pago",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                />
              </Elements>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ActivityDetailPage;