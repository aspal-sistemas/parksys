import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import UserProfileImage from '@/components/UserProfileImage';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  age: string;
  gender: string;
  previousExperience: string;
  availability: string;
  availableDays: string[];
  interestAreas: string[];
  preferredParkId: string;
  legalConsent: boolean;
  userId: number;
}

const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'no_especificar', label: 'Prefiero no especificar' },
  { value: 'otro', label: 'Otro' }
];

const daysOfWeek = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const interestAreaOptions = [
  { value: 'deportes', label: 'Deportes y actividad física' },
  { value: 'medio_ambiente', label: 'Medio ambiente y conservación' },
  { value: 'educacion', label: 'Educación y talleres' },
  { value: 'arte_cultura', label: 'Arte y cultura' },
  { value: 'mantenimiento', label: 'Mantenimiento de parques' },
  { value: 'eventos', label: 'Organización de eventos' },
  { value: 'recaudacion', label: 'Recaudación de fondos' },
  { value: 'atencion_publico', label: 'Atención al público' }
];

const ConvertVolunteerPage = () => {
  const { userId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Inicializar formulario
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    age: '',
    gender: 'no_especificar',
    previousExperience: '',
    availability: '',
    availableDays: [],
    interestAreas: [],
    preferredParkId: '',
    legalConsent: false,
    userId: parseInt(userId || '0')
  });

  // Obtener datos del usuario
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Obtener parques para el selector
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Actualizar formulario cuando se cargan los datos del usuario
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        userId: parseInt(userId || '0')
      }));
    }
  }, [user, userId]);

  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Manejar cambio en dias disponibles
  const handleDayToggle = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(updatedDays);
    setFormData({ ...formData, availableDays: updatedDays });
  };

  // Manejar cambio en áreas de interés
  const handleInterestToggle = (interest: string) => {
    const updatedInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(updatedInterests);
    setFormData({ ...formData, interestAreas: updatedInterests });
  };

  // Mutación para crear voluntario desde usuario
  const createVolunteerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest('/api/volunteers/create-from-user', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Perfil de voluntario creado",
        description: "El usuario ha sido convertido exitosamente en voluntario",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      setLocation('/admin/volunteers');
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear el perfil",
        description: error.message || "Ha ocurrido un error, intente nuevamente",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createVolunteerMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error al crear el perfil de voluntario:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando información del usuario...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/volunteers')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista de voluntarios
            </Button>
            <h1 className="text-2xl font-bold">Convertir Usuario en Voluntario</h1>
            <p className="text-muted-foreground">
              Complete la información adicional para crear un perfil de voluntario para este usuario.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>
                Datos del usuario existente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <div className="mb-2">
                  {user?.id && (
                    <UserProfileImage 
                      userId={user.id} 
                      role={user.role} 
                      name={user.fullName}
                      size="xl"
                      className="w-24 h-24 border border-gray-300"
                    />
                  )}
                </div>
                <h3 className="text-lg font-medium">{user?.fullName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    ID de Usuario: {user?.id}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rol:</span>
                  <span>{user?.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usuario:</span>
                  <span>{user?.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de conversión */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Perfil de Voluntario</CardTitle>
                <CardDescription>
                  Complete la información adicional necesaria para el perfil de voluntario
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Información personal */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-base">Información Personal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Teléfono</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => handleChange('phoneNumber', e.target.value)}
                          placeholder="(123) 456-7890"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleChange('age', e.target.value)}
                          placeholder="Ej: 30"
                          min="18"
                          max="99"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => handleChange('gender', value)}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          placeholder="Calle, número, colonia, código postal"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Experiencia y disponibilidad */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-base">Experiencia y Disponibilidad</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="previousExperience">Experiencia previa como voluntario</Label>
                      <Textarea
                        id="previousExperience"
                        value={formData.previousExperience}
                        onChange={(e) => handleChange('previousExperience', e.target.value)}
                        placeholder="Describe brevemente tu experiencia previa como voluntario"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability">Disponibilidad horaria</Label>
                      <Input
                        id="availability"
                        value={formData.availability}
                        onChange={(e) => handleChange('availability', e.target.value)}
                        placeholder="Ej: Tardes de 4pm a 7pm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Días disponibles</Label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`day-${day.value}`}
                              checked={selectedDays.includes(day.value)}
                              onCheckedChange={() => handleDayToggle(day.value)}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-sm font-normal">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preferencias */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-base">Preferencias e Intereses</h3>
                    
                    <div className="space-y-2">
                      <Label>Áreas de interés</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {interestAreaOptions.map(interest => (
                          <div key={interest.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`interest-${interest.value}`}
                              checked={selectedInterests.includes(interest.value)}
                              onCheckedChange={() => handleInterestToggle(interest.value)}
                            />
                            <Label htmlFor={`interest-${interest.value}`} className="text-sm font-normal">
                              {interest.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferredParkId">Parque preferido</Label>
                      <Select 
                        value={formData.preferredParkId} 
                        onValueChange={(value) => handleChange('preferredParkId', value)}
                      >
                        <SelectTrigger id="preferredParkId">
                          <SelectValue placeholder="Seleccionar parque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin preferencia</SelectItem>
                          {parks.map((park: any) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Consentimiento legal */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="legalConsent"
                        checked={formData.legalConsent}
                        onCheckedChange={(checked) => handleChange('legalConsent', checked)}
                        required
                      />
                      <Label htmlFor="legalConsent" className="text-sm">
                        Acepto los términos y condiciones del programa de voluntariado
                      </Label>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/volunteers')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Perfil de Voluntario
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConvertVolunteerPage;