import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Esquema para validar el formulario
const eventFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres" })
    .max(255, { message: "El título no puede exceder los 255 caracteres" }),
  description: z.string().optional().nullable(),
  eventType: z.string({
    required_error: "Selecciona un tipo de evento",
  }),
  targetAudience: z.string().optional().nullable(),
  status: z.string().default("draft"),
  featuredImageUrl: z.string().optional().nullable(),
  startDate: z.date({
    required_error: "Selecciona una fecha de inicio",
  }),
  endDate: z.date().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.coerce
    .number()
    .int()
    .positive({ message: "La capacidad debe ser un número positivo" })
    .optional()
    .nullable(),
  registrationType: z.string().default("free"),
  organizerName: z.string().optional().nullable(),
  organizerEmail: z.string().email().optional().nullable(),
  organizerPhone: z.string().optional().nullable(),
  parkIds: z.array(z.number()).min(1, {
    message: "Selecciona al menos un parque",
  }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Componente para crear un nuevo evento
const NewEventPage: React.FC = () => {
  const [, navigate] = useLocation();

  // Formulario con validación zod
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "cultural",
      targetAudience: "all",
      status: "draft",
      featuredImageUrl: "",
      startDate: new Date(),
      endDate: null,
      startTime: "",
      endTime: "",
      location: "",
      capacity: null,
      registrationType: "free",
      organizerName: "",
      organizerEmail: "",
      organizerPhone: "",
      parkIds: [],
    },
  });

  // Obtener la lista de parques
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ["/api/parks"],
  });

  // Mutación para crear un nuevo evento
  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el evento");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento creado correctamente",
        description: `El evento "${data.title}" ha sido creado con éxito.`,
      });
      navigate("/admin/events");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear el evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EventFormValues) => {
    createEventMutation.mutate(values);
  };

  // Datos de referencia para los selectores
  const eventTypes = [
    { value: "cultural", label: "Cultural" },
    { value: "sports", label: "Deportivo" },
    { value: "environmental", label: "Ambiental" },
    { value: "social", label: "Social" },
    { value: "educational", label: "Educativo" },
  ];

  const targetAudiences = [
    { value: "all", label: "Todos" },
    { value: "children", label: "Niños" },
    { value: "youth", label: "Jóvenes" },
    { value: "adults", label: "Adultos" },
    { value: "seniors", label: "Adultos mayores" },
    { value: "families", label: "Familias" },
  ];

  const registrationTypes = [
    { value: "free", label: "Entrada libre" },
    { value: "registration", label: "Con registro" },
    { value: "invitation", label: "Solo con invitación" },
    { value: "paid", label: "De pago" },
  ];

  const eventStatuses = [
    { value: "draft", label: "Borrador" },
    { value: "published", label: "Publicado" },
    { value: "canceled", label: "Cancelado" },
    { value: "postponed", label: "Pospuesto" },
  ];

  if (isLoadingParks) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Nuevo Evento"
        description="Crea un nuevo evento para los parques"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del evento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el título del evento"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Un título descriptivo y claro para el evento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el evento, sus objetivos y actividades..."
                        className="min-h-32"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Información detallada sobre el evento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de evento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Público objetivo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el público" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {targetAudiences.map((audience) => (
                            <SelectItem
                              key={audience.value}
                              value={audience.value}
                            >
                              {audience.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de registro</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de registro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {registrationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-2">
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
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de fin (opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date <
                              new Date(
                                form.getValues("startDate") ||
                                  new Date().setHours(0, 0, 0, 0)
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="HH:MM"
                            className="pl-8"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de fin</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="HH:MM"
                            className="pl-8"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación específica</FormLabel>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="Ej: Entrada principal, Área de juegos..."
                            className="pl-8"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Punto específico dentro del parque
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad</FormLabel>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Número de personas"
                            className="pl-8"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="featuredImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen destacada</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    URL de una imagen para mostrar en la página del evento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de contacto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+52 55 1234 5678"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parkIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parques donde se realizará el evento</FormLabel>
                  <div className="grid gap-4 md:grid-cols-3">
                    {parks?.map((park: any) => (
                      <div key={park.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`park-${park.id}`}
                          value={park.id}
                          checked={field.value.includes(park.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const parkId = Number(e.target.value);
                            const currentValues = [...field.value];

                            if (checked) {
                              field.onChange([...currentValues, parkId]);
                            } else {
                              field.onChange(
                                currentValues.filter((id) => id !== parkId)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`park-${park.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {park.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Selecciona al menos un parque donde se realizará el evento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/events")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="min-w-24"
            >
              {createEventMutation.isPending ? "Guardando..." : "Guardar Evento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
    </AdminLayout>
  );
};

export default NewEventPage;