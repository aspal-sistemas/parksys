import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, InsertActivity, Park, insertActivitySchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Categorías de actividades
const ACTIVITY_CATEGORIES = [
  { value: "deportiva", label: "Deportiva" },
  { value: "cultural", label: "Cultural" },
  { value: "recreativa", label: "Recreativa" },
  { value: "educativa", label: "Educativa" },
  { value: "comunitaria", label: "Comunitaria" },
  { value: "ambiental", label: "Ambiental" },
  { value: "otro", label: "Otro" },
];

interface ActivityFormProps {
  parks: Park[];
  activity?: Activity;
  onSuccess: () => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ parks, activity, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extender el esquema de actividad con validaciones adicionales
  const activityFormSchema = insertActivitySchema.extend({
    startDate: z.date({
      required_error: "La fecha de inicio es requerida",
    }),
    endDate: z.date().optional(),
    parkId: z.number({
      required_error: "El parque es requerido",
    }),
  });

  // Crear tipo para el formulario con la extensión de tipos
  type ActivityFormValues = z.infer<typeof activityFormSchema>;

  // Configurar valores por defecto
  const defaultValues: Partial<ActivityFormValues> = {
    title: activity?.title || "",
    description: activity?.description || "",
    parkId: activity?.parkId || undefined,
    category: activity?.category || undefined,
    location: activity?.location || "",
    startDate: activity?.startDate ? new Date(activity.startDate) : undefined,
    endDate: activity?.endDate ? new Date(activity.endDate) : undefined,
  };

  // Configurar el formulario
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues,
  });

  // Mutation para crear o actualizar una actividad
  const mutation = useMutation({
    mutationFn: (data: InsertActivity) => {
      if (activity) {
        // Si existe, actualizar
        return apiRequest(`/api/activities/${activity.id}`, "PUT", data);
      } else {
        // Si no existe, crear nueva
        return apiRequest(`/api/parks/${data.parkId}/activities`, "POST", data);
      }
    },
    onSuccess: () => {
      // Invalidar consultas para recargar datos
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parks"] });
      
      toast({
        title: activity ? "Actividad actualizada" : "Actividad creada",
        description: activity
          ? "La actividad ha sido actualizada exitosamente."
          : "La nueva actividad ha sido creada exitosamente.",
      });
      
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo ${activity ? 'actualizar' : 'crear'} la actividad: ${error.message || 'Ocurrió un error inesperado.'}`,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: ActivityFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Selección del parque */}
        <FormField
          control={form.control}
          name="parkId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parque</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
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
                Selecciona el parque donde se realizará la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Título de la actividad */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la actividad" {...field} />
              </FormControl>
              <FormDescription>
                Nombre claro y conciso para la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción de la actividad */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe la actividad en detalle" 
                  className="min-h-[80px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Información detallada sobre la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoría de la actividad */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Tipo de actividad que se realizará
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ubicación específica dentro del parque */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ubicación específica dentro del parque" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Lugar específico dentro del parque (ej. "Área de picnic", "Cancha principal")
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
              <FormLabel>Fecha de inicio</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                </PopoverContent>
              </Popover>
              <FormDescription>
                Fecha en que inicia la actividad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha y hora de finalización (opcional) */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de finalización (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                </PopoverContent>
              </Popover>
              <FormDescription>
                Fecha en que termina la actividad (dejar en blanco para actividades de un solo día)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4">
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
              <span className="inline-flex items-center gap-1">
                <span className="animate-spin">⏳</span> Guardando...
              </span>
            ) : activity ? "Actualizar actividad" : "Crear actividad"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ActivityForm;