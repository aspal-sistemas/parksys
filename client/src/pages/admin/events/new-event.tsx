import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, MapPin, Users, Clock, FileText, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';

// Schema de validación para nuevo evento
const newEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'El título es muy largo'),
  description: z.string().min(1, 'La descripción es requerida'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  end_time: z.string().optional(),
  park_id: z.string().min(1, 'Debe seleccionar un parque'),
  category: z.string().min(1, 'Debe seleccionar una categoría'),
  capacity: z.string().optional(),
  location: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  registration_required: z.boolean().default(false),
  price: z.string().optional(),
  notes: z.string().optional()
});

type NewEventForm = z.infer<typeof newEventSchema>;

export default function NewEventPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewEventForm>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      park_id: '',
      category: '',
      capacity: '',
      location: '',
      contact_email: '',
      contact_phone: '',
      registration_required: false,
      price: '',
      notes: ''
    }
  });

  // Obtener parques para el selector
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    select: (data: any[]) => data.map((park: any) => ({
      id: park.id,
      name: park.name
    }))
  });

  // Obtener categorías de eventos
  const { data: categories } = useQuery({
    queryKey: ['/api/event-categories']
  });

  // Mutación para crear evento
  const createEventMutation = useMutation({
    mutationFn: async (data: NewEventForm) => {
      const eventData = {
        title: data.title,
        description: data.description,
        eventType: data.category, // Usar category del formulario como eventType
        startDate: data.start_date,
        endDate: data.end_date || null,
        startTime: data.start_time || null,
        endTime: data.end_time || null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        location: data.location || null,
        organizerEmail: data.contact_email || null,
        organizerPhone: data.contact_phone || null,
        registrationType: data.registration_required ? 'registration' : 'free',
        status: 'published',
        targetAudience: 'general'
      };

      return apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Evento creado',
        description: 'El evento ha sido creado exitosamente.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setLocation('/admin/events');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el evento',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (data: NewEventForm) => {
    createEventMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Evento</h1>
            <p className="text-gray-600">Crear un nuevo evento o actividad para los parques</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Evento *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Ej: Yoga matutino en el parque"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select onValueChange={(value) => form.setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe el evento, actividades incluidas, requisitos, etc."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fecha y Hora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fecha y Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...form.register('start_date')}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...form.register('end_date')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Hora de Inicio *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...form.register('start_time')}
                  />
                  {form.formState.errors.start_time && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.start_time.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="end_time">Hora de Fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...form.register('end_time')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Detalles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Detalles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="park_id">Parque *</Label>
                  <Select onValueChange={(value) => form.setValue('park_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar parque" />
                    </SelectTrigger>
                    <SelectContent>
                      {parks?.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.park_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.park_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Ubicación Específica</Label>
                  <Input
                    id="location"
                    {...form.register('location')}
                    placeholder="Ej: Área de juegos, Kiosco central"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacidad (personas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...form.register('capacity')}
                    placeholder="Ej: 50"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Precio (MXN)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price')}
                    placeholder="0.00 (gratis)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email de Contacto</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    {...form.register('contact_email')}
                    placeholder="evento@ejemplo.com"
                  />
                  {form.formState.errors.contact_email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.contact_email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                  <Input
                    id="contact_phone"
                    {...form.register('contact_phone')}
                    placeholder="(33) 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Información adicional, requisitos especiales, materiales necesarios, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin/activities')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createEventMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}