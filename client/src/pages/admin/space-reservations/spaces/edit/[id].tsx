import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SpaceMediaManager } from "@/components/SpaceMediaManager";
import { ArrowLeft, MapPin, Users, Clock, DollarSign, AlertCircle } from "lucide-react";

const editSpaceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  parkId: z.string().min(1, "Debe seleccionar un parque"),
  spaceType: z.string().min(1, "Debe seleccionar un tipo de espacio"),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  hourlyRate: z.number().min(0, "La tarifa debe ser mayor o igual a 0"),
  minimumHours: z.number().min(1, "Las horas mínimas deben ser mayor a 0"),
  maximumHours: z.number().min(1, "Las horas máximas deben ser mayor a 0"),
  amenities: z.string().optional(),
  rules: z.string().optional(),
  isActive: z.boolean(),
  requiresApproval: z.boolean(),
  advanceBookingDays: z.number().min(1, "Los días de anticipación deben ser mayor a 0"),
});

type EditSpaceFormData = z.infer<typeof editSpaceSchema>;

interface Park {
  id: number;
  name: string;
}

interface SpaceData {
  id: number;
  name: string;
  description: string;
  spaceType: string;
  capacity: number;
  hourlyRate: string;
  minimumHours: number;
  maximumHours: number;
  amenities: string;
  rules: string;
  isActive: boolean;
  requiresApproval: boolean;
  advanceBookingDays: number;
  parkId: number;
  parkName: string;
}

export default function EditSpacePage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditSpaceFormData>({
    resolver: zodResolver(editSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
      parkId: "",
      spaceType: "",
      capacity: 1,
      hourlyRate: 0,
      minimumHours: 1,
      maximumHours: 8,
      amenities: "",
      rules: "",
      isActive: true,
      requiresApproval: false,
      advanceBookingDays: 30,
    },
  });

  // Obtener datos del espacio
  const { data: spaceData, isLoading: spaceLoading } = useQuery<SpaceData>({
    queryKey: [`/api/reservable-spaces/${id}`],
    enabled: !!id,
  });

  // Obtener lista de parques
  const { data: parksData = [], isLoading: parksLoading } = useQuery<Park[]>({
    queryKey: ["/api/parks"],
  });

  // Asegurar que parks es siempre un array
  const parks = Array.isArray(parksData) ? parksData : [];

  // Llenar el formulario cuando se cargan los datos
  useEffect(() => {
    if (spaceData) {
      form.reset({
        name: spaceData.name,
        description: spaceData.description,
        parkId: spaceData.parkId.toString(),
        spaceType: spaceData.spaceType,
        capacity: spaceData.capacity,
        hourlyRate: parseFloat(spaceData.hourlyRate),
        minimumHours: spaceData.minimumHours,
        maximumHours: spaceData.maximumHours,
        amenities: spaceData.amenities || "",
        rules: spaceData.rules || "",
        isActive: spaceData.isActive,
        requiresApproval: spaceData.requiresApproval,
        advanceBookingDays: spaceData.advanceBookingDays,
      });
    }
  }, [spaceData, form]);

  const updateSpaceMutation = useMutation({
    mutationFn: async (data: EditSpaceFormData) => {
      const response = await apiRequest(`/api/reservable-spaces/${id}`, {
        method: "PUT",
        data: {
          ...data,
          parkId: parseInt(data.parkId),
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Espacio actualizado",
        description: "El espacio reservable ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservable-spaces"] });
      queryClient.invalidateQueries({ queryKey: [`/api/reservable-spaces/${id}`] });
      setLocation("/admin/space-reservations/spaces");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el espacio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditSpaceFormData) => {
    // Validar que las horas máximas sean mayores que las mínimas
    if (data.maximumHours <= data.minimumHours) {
      toast({
        title: "Error de validación",
        description: "Las horas máximas deben ser mayores que las horas mínimas",
        variant: "destructive",
      });
      return;
    }

    updateSpaceMutation.mutate(data);
  };

  if (spaceLoading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando espacio...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!spaceData) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Espacio no encontrado</h3>
              <p className="text-gray-600 mb-4">El espacio que buscas no existe o ha sido eliminado.</p>
              <Button onClick={() => setLocation("/admin/space-reservations/spaces")} variant="outline">
                Volver a la lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/space-reservations/spaces")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Espacio Reservable</h1>
          <p className="text-gray-600">Modifica la información del espacio: {spaceData.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Información del Espacio
            </CardTitle>
            <CardDescription>
              Actualiza las características y reglas del espacio reservable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Espacio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Kiosco Principal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parque</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parksLoading ? (
                              <SelectItem value="loading" disabled>Cargando parques...</SelectItem>
                            ) : parks.length > 0 ? (
                              parks.map((park) => (
                                <SelectItem key={park.id} value={park.id.toString()}>
                                  {park.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-parks" disabled>No hay parques disponibles</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spaceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Espacio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de espacio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kiosco">Kiosco</SelectItem>
                            <SelectItem value="area_juegos">Área de Juegos</SelectItem>
                            <SelectItem value="picnic">Área de Picnic</SelectItem>
                            <SelectItem value="jardin_eventos">Jardín de Eventos</SelectItem>
                            <SelectItem value="pabellon">Pabellón</SelectItem>
                            <SelectItem value="cancha_deportiva">Cancha Deportiva</SelectItem>
                            <SelectItem value="anfiteatro">Anfiteatro</SelectItem>
                            <SelectItem value="salon_usos_multiples">Salón de Usos Múltiples</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Capacidad Máxima
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Tarifa por Hora (MXN)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="250.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimumHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Horas Mínimas de Reserva
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maximumHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Horas Máximas de Reserva
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="8" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="advanceBookingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días de Anticipación para Reserva</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe las características principales del espacio..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amenidades */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenidades Incluidas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Electricidad, agua potable, mesas, sillas, estacionamiento..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reglas */}
                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reglas y Restricciones</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Prohibido el consumo de alcohol, música hasta las 20:00 hrs..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Configuraciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Espacio Activo</FormLabel>
                          <div className="text-sm text-gray-600">
                            El espacio estará disponible para reservas públicas
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requiere Aprobación</FormLabel>
                          <div className="text-sm text-gray-600">
                            Las reservas deben ser aprobadas manualmente
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/space-reservations/spaces")}
                    className="flex-1"
                    disabled={updateSpaceMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={updateSpaceMutation.isPending}
                  >
                    {updateSpaceMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Gestión de Multimedia */}
        <Card>
          <CardHeader>
            <CardTitle>Multimedia del Espacio</CardTitle>
            <CardDescription>
              Gestiona las imágenes y documentos del espacio reservable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpaceMediaManager spaceId={parseInt(id)} isEditMode={true} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}