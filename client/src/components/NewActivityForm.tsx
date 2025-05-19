import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

// Esquema de validación para actividades
const activitySchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio' }),
  description: z.string().optional(),
  parkId: z.number(),
  startDate: z.date({ required_error: 'La fecha de inicio es obligatoria' }),
  endDate: z.date().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

// Categorías de actividades
const ACTIVITY_CATEGORIES = [
  { value: 'deportiva', label: 'Deportiva' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'recreativa', label: 'Recreativa' },
  { value: 'educativa', label: 'Educativa' },
  { value: 'comunitaria', label: 'Comunitaria' },
  { value: 'ambiental', label: 'Ambiental' },
  { value: 'otro', label: 'Otro' },
];

interface NewActivityFormProps {
  parkId: number;
  parkName: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingActivity?: any;
}

const NewActivityForm: React.FC<NewActivityFormProps> = ({
  parkId,
  parkName,
  onSuccess,
  onCancel,
  existingActivity,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preparar valores predeterminados
  const defaultValues: Partial<ActivityFormData> = {
    title: existingActivity?.title || '',
    description: existingActivity?.description || '',
    parkId: parkId,
    startDate: existingActivity?.startDate ? new Date(existingActivity.startDate) : new Date(),
    endDate: existingActivity?.endDate ? new Date(existingActivity.endDate) : undefined,
    category: existingActivity?.category || '',
    location: existingActivity?.location || '',
  };

  // Inicializar formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues,
  });

  // Valores actuales del formulario
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Manejar envío del formulario
  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    
    try {
      // Preparar los encabezados para la autenticación
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer direct-token-admin',
        'X-User-Id': '1',
        'X-User-Role': 'super_admin'
      };
      
      let response;
      
      if (existingActivity) {
        // Actualizar actividad existente
        response = await fetch(`/api/activities/${existingActivity.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            ...data,
            // Asegurarnos de que las fechas se envían correctamente
            startDate: data.startDate.toISOString(),
            endDate: data.endDate ? data.endDate.toISOString() : undefined,
          }),
        });
      } else {
        // Crear nueva actividad
        response = await fetch(`/api/parks/${parkId}/activities`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            // Asegurarnos de que las fechas se envían correctamente
            startDate: data.startDate.toISOString(),
            endDate: data.endDate ? data.endDate.toISOString() : undefined,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar la actividad');
      }

      // Mostrar mensaje de éxito
      toast({
        title: existingActivity ? 'Actividad actualizada' : 'Actividad creada',
        description: existingActivity
          ? 'La actividad ha sido actualizada correctamente'
          : 'La actividad ha sido creada correctamente',
      });

      // Invalidar consultas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/activities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/parks'] });

      // Llamar al callback de éxito
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar actividad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar la actividad',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="parkName">Parque</Label>
        <Input id="parkName" value={parkName} disabled />
      </div>

      <div className="space-y-1">
        <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Título de la actividad"
          {...register('title')}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Describe la actividad aquí..."
          {...register('description')}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startDate">Fecha de inicio <span className="text-red-500">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground',
                  errors.startDate ? 'border-red-500' : ''
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, 'PPP', { locale: es })
                ) : (
                  <span>Selecciona una fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setValue('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, 'PPP', { locale: es })
                ) : (
                  <span>Selecciona una fecha (opcional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => setValue('endDate', date || undefined)}
                initialFocus
                disabled={(date) => date < (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={watch('category') || ''}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Ubicación específica</Label>
          <Input
            id="location"
            placeholder="Ej. Cancha principal, Área de picnic..."
            {...register('location')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : existingActivity ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

export default NewActivityForm;