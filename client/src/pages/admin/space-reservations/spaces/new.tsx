import { useState } from "react";
import { useLocation } from "wouter";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, MapPin, Users, Clock, DollarSign } from "lucide-react";

const newSpaceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  parkId: z.string().min(1, "Debe seleccionar un parque"),
  spaceType: z.string().min(1, "Debe seleccionar un tipo de espacio"),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  hourlyRate: z.number().min(0, "La tarifa debe ser mayor o igual a 0"),
  amenities: z.string().optional(),
  reservationRules: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

type NewSpaceFormData = z.infer<typeof newSpaceSchema>;

interface Park {
  id: number;
  name: string;
}

export default function NewSpacePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewSpaceFormData>({
    resolver: zodResolver(newSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
      parkId: "",
      capacity: 1,
      hourlyRate: 0,
      amenities: "",
      reservationRules: "",
      location: "",
      isActive: true,
    },
  });

  // Obtener lista de parques
  const { data: parksData = [], isLoading: parksLoading } = useQuery<Park[]>({
    queryKey: ["/api/parks"],
  });

  // Asegurar que parks es siempre un array
  const parks = Array.isArray(parksData) ? parksData : [];

  const createSpaceMutation = useMutation({
    mutationFn: async (data: NewSpaceFormData) => {
      return apiRequest("/api/reservable-spaces", {
        method: "POST",
        data: {
          ...data,
          parkId: parseInt(data.parkId),
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Espacio creado",
        description: "El espacio reservable ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservable-spaces"] });
      setLocation("/admin/space-reservations/spaces");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el espacio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewSpaceFormData) => {
    createSpaceMutation.mutate(data);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Espacio Reservable</h1>
          <p className="text-gray-600">Crea un nuevo espacio que los ciudadanos pueden reservar para eventos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Información del Espacio
            </CardTitle>
            <CardDescription>
              Define las características y reglas del nuevo espacio reservable
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parksLoading ? (
                              <SelectItem value="" disabled>Cargando parques...</SelectItem>
                            ) : parks.length > 0 ? (
                              parks.map((park) => (
                                <SelectItem key={park.id} value={park.id.toString()}>
                                  {park.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No hay parques disponibles</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe las características del espacio..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Detalles Operativos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Capacidad
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
                          Tarifa por Hora ($)
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Sector Norte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amenidades y Reglas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenidades Incluidas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ej: Mesas, sillas, asador, toma de corriente..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reservationRules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reglas de Reservación</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ej: Reservar con 24h de anticipación, máximo 4 horas..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/space-reservations/spaces")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSpaceMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createSpaceMutation.isPending ? "Creando..." : "Crear Espacio"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}