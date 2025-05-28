import React from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, Globe, Clock, Info } from "lucide-react";
import RoleBasedSidebar from "@/components/RoleBasedSidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema de validación para el formulario
const parkEditSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  municipalityId: z.coerce.number().min(1, "Seleccione un municipio"),
  parkType: z.string().min(1, "Seleccione un tipo de parque"),
  address: z.string().min(1, "La dirección es requerida"),
  postalCode: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Email inválido").or(z.literal("")),
  description: z.string().optional(),
  openingHours: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  area: z.string().optional(),
  foundationYear: z.coerce.number().optional(),
  administrator: z.string().optional(),
  conservationStatus: z.string().optional(),
  regulationUrl: z.string().url("URL inválida").or(z.literal("")),
  videoUrl: z.string().url("URL inválida").or(z.literal("")),
});

type ParkEditFormValues = z.infer<typeof parkEditSchema>;

export default function ParkEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Consultar datos del parque
  const { data: park, isLoading: isLoadingPark } = useQuery({
    queryKey: [`/api/parks/${id}`],
    enabled: !!id,
  });

  // Consultar municipios
  const { data: municipalities } = useQuery({
    queryKey: ["/api/municipalities"],
  });

  // Configurar formulario
  const form = useForm<ParkEditFormValues>({
    resolver: zodResolver(parkEditSchema),
    defaultValues: {
      name: "",
      municipalityId: 0,
      parkType: "",
      address: "",
      postalCode: "",
      contactPhone: "",
      contactEmail: "",
      description: "",
      openingHours: "",
      latitude: "",
      longitude: "",
      area: "",
      foundationYear: undefined,
      administrator: "",
      conservationStatus: "",
      regulationUrl: "",
      videoUrl: "",
    },
  });

  // Cargar datos del parque en el formulario
  React.useEffect(() => {
    if (park) {
      form.reset({
        name: park.name || "",
        municipalityId: park.municipalityId || 0,
        parkType: park.parkType || "",
        address: park.address || "",
        postalCode: park.postalCode || "",
        contactPhone: park.contactPhone || "",
        contactEmail: park.contactEmail || "",
        description: park.description || "",
        openingHours: park.openingHours || "",
        latitude: park.latitude?.toString() || "",
        longitude: park.longitude?.toString() || "",
        area: park.area?.toString() || "",
        foundationYear: park.foundationYear || undefined,
        administrator: park.administrator || "",
        conservationStatus: park.conservationStatus || "",
        regulationUrl: park.regulationUrl || "",
        videoUrl: park.videoUrl || "",
      });
    }
  }, [park, form]);

  // Mutación para actualizar el parque
  const updateParkMutation = useMutation({
    mutationFn: async (values: ParkEditFormValues) => {
      return await apiRequest(`/api/parks/${id}`, {
        method: "PUT",
        data: values,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      toast({
        title: "Parque actualizado",
        description: "La información del parque ha sido actualizada correctamente.",
      });
      setLocation(`/admin/parks/${id}/view`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar el parque: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ParkEditFormValues) => {
    updateParkMutation.mutate(values);
  };

  if (isLoadingPark) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleBasedSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando parque...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!park) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleBasedSidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Parque no encontrado</h1>
            <p className="text-muted-foreground mb-6">El parque que buscas no existe.</p>
            <Link href="/admin/parks">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Parques
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/admin/parks/${id}/view`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al parque
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Parque</h1>
            <p className="text-muted-foreground">
              Modifica la información del parque "{park.name}"
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Información Básica
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación y Contacto
                  </TabsTrigger>
                  <TabsTrigger value="characteristics" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Características
                  </TabsTrigger>
                </TabsList>

                {/* Información Básica */}
                <TabsContent value="basic">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Información General
                      </CardTitle>
                      <CardDescription>
                        Datos básicos del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Parque</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del parque" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="municipalityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Municipio</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value ? field.value.toString() : ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un municipio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {municipalities?.map((municipality: any) => (
                                    <SelectItem
                                      key={municipality.id}
                                      value={municipality.id.toString()}
                                    >
                                      {municipality.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="parkType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Parque</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un tipo de parque" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Urbano">Parque Urbano</SelectItem>
                                <SelectItem value="Metropolitano">Parque Metropolitano</SelectItem>
                                <SelectItem value="Linear">Parque Linear</SelectItem>
                                <SelectItem value="Comunitario">Parque Comunitario</SelectItem>
                                <SelectItem value="Natural">Parque Natural</SelectItem>
                                <SelectItem value="Temático">Parque Temático</SelectItem>
                              </SelectContent>
                            </Select>
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
                                placeholder="Descripción general del parque..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Clock className="inline mr-2 h-4 w-4" />
                              Horarios de Apertura
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Lunes a Domingo 6:00 AM - 10:00 PM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Ubicación y Contacto */}
                <TabsContent value="location">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Ubicación y Contacto
                      </CardTitle>
                      <CardDescription>
                        Información de ubicación y datos de contacto
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl>
                                <Input placeholder="Dirección completa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl>
                                <Input placeholder="Código postal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Phone className="inline mr-2 h-4 w-4" />
                                Teléfono
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Número de teléfono" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Mail className="inline mr-2 h-4 w-4" />
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitud</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 19.432608" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: -99.133209" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Características */}
                <TabsContent value="characteristics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Características
                      </CardTitle>
                      <CardDescription>
                        Detalles adicionales y características del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Área (m²)</FormLabel>
                              <FormControl>
                                <Input placeholder="Área en metros cuadrados" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="foundationYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año de Fundación</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Año de fundación"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="administrator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Administrador</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del administrador" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="conservationStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Conservación</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Excelente">Excelente</SelectItem>
                                  <SelectItem value="Bueno">Bueno</SelectItem>
                                  <SelectItem value="Regular">Regular</SelectItem>
                                  <SelectItem value="Malo">Malo</SelectItem>
                                  <SelectItem value="Crítico">Crítico</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="regulationUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Globe className="inline mr-2 h-4 w-4" />
                                URL de Reglamento
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://ejemplo.com/reglamento" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Globe className="inline mr-2 h-4 w-4" />
                                URL de Video
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/admin/parks/${id}/view`}>
                  <Button variant="outline">Cancelar</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={updateParkMutation.isPending}
                  className="min-w-32"
                >
                  {updateParkMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}