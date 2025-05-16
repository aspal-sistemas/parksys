import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertActivitySchema, InsertActivity, Activity, Park } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Extendemos el schema para añadir validaciones adicionales
const formSchema = insertActivitySchema.extend({
  // Verificamos que la fecha sea en el futuro si es una actividad nueva
  startDate: z.coerce.date().refine(
    (date) => {
      if (!date) return false;
      // Solo validamos para el futuro si es una actividad nueva (sin id)
      return true;
    },
    {
      message: "La fecha de inicio debe ser en el futuro",
    }
  ),
  endDate: z.coerce.date().optional(),
  parkId: z.coerce.number({
    required_error: "Debes seleccionar un parque",
    invalid_type_error: "Debes seleccionar un parque válido"
  }),
  // Añadimos las demás validaciones
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").optional(),
  category: z.string().min(2, "La categoría debe tener al menos 2 caracteres").optional(),
});

// Categorías predefinidas
const CATEGORIES = [
  { value: "deporte", label: "Deporte" },
  { value: "cultura", label: "Cultura" },
  { value: "educacion", label: "Educación" },
  { value: "comunidad", label: "Comunidad" },
  { value: "medio_ambiente", label: "Medio Ambiente" },
  { value: "evento", label: "Evento Especial" },
];

interface ActivityFormProps {
  parks: Park[];
  activity?: Activity;
  onSuccess: () => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ 
  parks, 
  activity,
  onSuccess, 
  onCancel 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!activity;
  
  // Inicializar formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parkId: activity?.parkId || 0,
      title: activity?.title || '',
      description: activity?.description || '',
      category: activity?.category || '',
      location: activity?.location || '',
      startDate: activity?.startDate ? new Date(activity.startDate) : new Date(),
      endDate: activity?.endDate ? new Date(activity.endDate) : undefined,
    },
  });
  
  // Mutation para crear/actualizar actividad
  const mutation = useMutation({
    mutationFn: (data: InsertActivity) => {
      if (isEditing && activity) {
        return apiRequest(`/api/activities/${activity.id}`, 'PUT', data);
      } else {
        return apiRequest('/api/activities', 'POST', data);
      }
    },
    onSuccess: () => {
      // Invalidar consultas para actualizar datos
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parks'] });
      
      // Notificar y cerrar
      toast({
        title: isEditing ? "Actividad actualizada" : "Actividad creada",
        description: isEditing
          ? "La actividad ha sido actualizada exitosamente"
          : "La nueva actividad ha sido creada exitosamente",
      });
      
      onSuccess();
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Hubo un problema al ${isEditing ? 'actualizar' : 'crear'} la actividad. Inténtalo de nuevo.`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data as InsertActivity);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de parque */}
        <FormField
          control={form.control}
          name="parkId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parque</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar parque" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parks.map((park) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Elige el parque donde se realizará esta actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la actividad</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Yoga en el Parque" {...field} />
              </FormControl>
              <FormDescription>
                Un título descriptivo y atractivo para la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe la actividad con detalles para los asistentes..." 
                  className="resize-y min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Detalles sobre la actividad, qué llevar, requisitos, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Categoría */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Clasifica la actividad para facilitar su búsqueda
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Ubicación dentro del parque */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación específica</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input placeholder="Ej. Área central del parque" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Lugar exacto dentro del parque donde se realizará la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fecha y hora de inicio */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha y hora de inicio</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP' - 'HH:mm", { locale: es })
                      ) : (
                        <span>Selecciona fecha y hora</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <Input
                      type="time"
                      value={format(field.value || new Date(), "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const date = new Date(field.value || new Date());
                        date.setHours(parseInt(hours));
                        date.setMinutes(parseInt(minutes));
                        field.onChange(date);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Cuándo comienza la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fecha y hora de fin (opcional) */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha y hora de finalización (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP' - 'HH:mm", { locale: es })
                      ) : (
                        <span>Seleccionar finalización (opcional)</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => {
                      // No permitir seleccionar fechas antes de la fecha de inicio
                      const startDate = form.getValues().startDate;
                      return date < new Date(startDate.setHours(0, 0, 0, 0));
                    }}
                  />
                  <div className="p-3 border-t border-border">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        if (!field.value && !e.target.value) return;
                        
                        const [hours, minutes] = e.target.value.split(":");
                        // Si no hay fecha seleccionada, usar la fecha de inicio
                        const date = new Date(field.value || form.getValues().startDate);
                        date.setHours(parseInt(hours));
                        date.setMinutes(parseInt(minutes));
                        field.onChange(date);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Cuándo termina la actividad (deja en blanco si no tiene un final definido)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <CalendarDays className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              isEditing ? "Actualizar actividad" : "Crear actividad"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ActivityForm;