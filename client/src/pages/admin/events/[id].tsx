import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  CalendarDays, 
  Clock, 
  Edit, 
  MapPin, 
  Users, 
  Building, 
  Mail, 
  Phone,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  FileCog,
  ListChecks
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

// Definimos los tipos que necesitamos para los eventos
interface Event {
  id: number;
  title: string;
  description: string | null;
  eventType: string;
  targetAudience: string | null;
  status: string;
  featuredImageUrl: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  location: string | null;
  capacity: number | null;
  registrationType: string;
  organizerName: string | null;
  organizerEmail: string | null;
  organizerPhone: string | null;
  geolocation: any | null;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  parks: { id: number; name: string; address: string }[];
}

// Tipo para los participantes
interface Participant {
  id: number;
  eventId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string; // registered, confirmed, attended, cancelled
  notes: string | null;
  registrationDate: string;
}

// Tipos para el formulario de registro de participantes
interface RegisterParticipantFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EventDetailPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterParticipantFormData>({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  // Obtenemos los datos del evento
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
  });

  // Obtenemos los participantes del evento
  const { data: participants, isLoading: isLoadingParticipants } = useQuery<Participant[]>({
    queryKey: [`/api/events/${id}/participants`],
    enabled: !!id,
  });

  // Mutación para registrar un nuevo participante
  const registerParticipant = useMutation({
    mutationFn: async (data: RegisterParticipantFormData) => {
      const response = await fetch(`/api/events/${id}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Error al registrar participante");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidamos la consulta para actualizar la lista de participantes
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/participants`] });
      setIsRegisterDialogOpen(false);
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        notes: ""
      });
      toast({
        title: "Participante registrado",
        description: "El participante ha sido registrado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al registrar participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Función para manejar el envío del formulario de registro
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerParticipant.mutate(registerForm);
  };

  // Si está cargando, mostramos un spinner
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <PageHeader
            title="Cargando evento..."
            description="Obteniendo información del evento"
            actions={
              <Button variant="outline" onClick={() => navigate("/admin/events")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            }
          />
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  // Si hay un error, mostramos un mensaje
  if (error || !event) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <PageHeader
            title="Error"
            description="No se pudo cargar la información del evento"
            actions={
              <Button variant="outline" onClick={() => navigate("/admin/events")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            }
          />
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle>Error al cargar el evento</CardTitle>
              <CardDescription>
                No se pudo obtener la información del evento. Verifica que el ID sea correcto.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Mapa de colores para los diferentes tipos de eventos
  const typeColorMap: Record<string, string> = {
    cultural: "bg-indigo-100 text-indigo-800 border-indigo-300",
    sports: "bg-green-100 text-green-800 border-green-300",
    environmental: "bg-emerald-100 text-emerald-800 border-emerald-300",
    social: "bg-orange-100 text-orange-800 border-orange-300",
    educational: "bg-blue-100 text-blue-800 border-blue-300",
    default: "bg-gray-100 text-gray-800 border-gray-300",
  };

  // Traducir tipos de eventos a español
  const eventTypeTranslations: Record<string, string> = {
    cultural: "Cultural",
    sports: "Deportivo",
    environmental: "Ambiental",
    social: "Social",
    educational: "Educativo",
  };

  // Mapa de colores para los diferentes estados
  const statusColorMap: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    postponed: "bg-amber-100 text-amber-800",
    completed: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  // Traducir estados a español
  const statusTranslations: Record<string, string> = {
    draft: "Borrador",
    published: "Publicado",
    canceled: "Cancelado",
    postponed: "Pospuesto",
    completed: "Completado",
  };

  // Traducir estados de participantes a español
  const participantStatusTranslations: Record<string, string> = {
    registered: "Registrado",
    confirmed: "Confirmado",
    attended: "Asistió",
    cancelled: "Cancelado",
  };

  // Generar un mapa de colores para los diferentes estados de participantes
  const participantStatusColorMap: Record<string, string> = {
    registered: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    attended: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  // Formatear las fechas
  const formattedStartDate = event.startDate
    ? format(new Date(event.startDate), "dd 'de' MMMM 'de' yyyy", { locale: es })
    : "Sin fecha";
  
  const formattedEndDate = event.endDate
    ? format(new Date(event.endDate), "dd 'de' MMMM 'de' yyyy", { locale: es })
    : null;

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <PageHeader
          title={event.title}
          description={
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={typeColorMap[event.eventType] || typeColorMap.default}
              >
                {eventTypeTranslations[event.eventType] || event.eventType}
              </Badge>
              <Badge
                variant="secondary"
                className={statusColorMap[event.status] || statusColorMap.default}
              >
                {statusTranslations[event.status] || event.status}
              </Badge>
            </div>
          }
          actions={
            <>
              <Button variant="outline" onClick={() => navigate("/admin/events")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button asChild>
                <Link href={`/admin/events/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </>
          }
        />

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="details">
              <Calendar className="h-4 w-4 mr-2" />
              Detalles
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileCog className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Detalles */}
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información Principal */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Información del Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {event.featuredImageUrl && (
                    <div className="overflow-hidden rounded-lg mb-6">
                      <img
                        src={event.featuredImageUrl}
                        alt={event.title}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-base mb-2">Descripción</h3>
                    <p className="text-gray-700">{event.description || "Sin descripción"}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-base mb-2">Fecha</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formattedStartDate}
                          {formattedEndDate && formattedStartDate !== formattedEndDate && (
                            <> al {formattedEndDate}</>
                          )}
                        </span>
                      </div>
                    </div>

                    {(event.startTime || event.endTime) && (
                      <div>
                        <h3 className="font-semibold text-base mb-2">Horario</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.startTime || ""}
                            {event.startTime && event.endTime && " a "}
                            {event.endTime || ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {event.location && (
                      <div>
                        <h3 className="font-semibold text-base mb-2">Ubicación</h3>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    )}

                    {event.capacity && (
                      <div>
                        <h3 className="font-semibold text-base mb-2">Capacidad</h3>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.capacity} personas</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información del organizador y parques */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organizador</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.organizerName && (
                      <div>
                        <h3 className="font-semibold text-base mb-1">Nombre</h3>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{event.organizerName}</span>
                        </div>
                      </div>
                    )}

                    {event.organizerEmail && (
                      <div>
                        <h3 className="font-semibold text-base mb-1">Email</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${event.organizerEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {event.organizerEmail}
                          </a>
                        </div>
                      </div>
                    )}

                    {event.organizerPhone && (
                      <div>
                        <h3 className="font-semibold text-base mb-1">Teléfono</h3>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${event.organizerPhone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {event.organizerPhone}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Parques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.parks && event.parks.length > 0 ? (
                      <ul className="space-y-2">
                        {event.parks.map((park) => (
                          <li key={park.id} className="border-b pb-2 last:border-0">
                            <div className="font-medium">{park.name}</div>
                            <div className="text-sm text-muted-foreground">{park.address}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        No hay parques asociados a este evento.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Participantes */}
          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Participantes Registrados</CardTitle>
                  <CardDescription>
                    {isLoadingParticipants
                      ? "Cargando participantes..."
                      : participants && participants.length > 0
                      ? `${participants.length} participante${participants.length > 1 ? "s" : ""} registrado${participants.length > 1 ? "s" : ""}`
                      : "No hay participantes registrados para este evento."}
                  </CardDescription>
                </div>
                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrar Participante
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Registrar Nuevo Participante</DialogTitle>
                      <DialogDescription>
                        Complete el formulario para registrar un nuevo participante en el evento.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nombre completo</Label>
                          <Input
                            id="name"
                            placeholder="Nombre del participante"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, email: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Teléfono (opcional)</Label>
                          <Input
                            id="phone"
                            placeholder="Teléfono de contacto"
                            value={registerForm.phone}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, phone: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notas (opcional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Información adicional"
                            value={registerForm.notes}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, notes: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={registerParticipant.isPending}>
                          {registerParticipant.isPending ? "Registrando..." : "Registrar Participante"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoadingParticipants ? (
                  <div className="py-8 flex justify-center">
                    <LoadingSpinner />
                  </div>
                ) : participants && participants.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contacto
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha de registro
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {participants.map((participant) => (
                          <tr key={participant.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">{participant.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{participant.email}</div>
                              {participant.phone && (
                                <div className="text-sm text-gray-500">{participant.phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant="secondary"
                                className={
                                  participantStatusColorMap[participant.status] ||
                                  participantStatusColorMap.default
                                }
                              >
                                {participantStatusTranslations[participant.status] || participant.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(participant.registrationDate), "dd/MM/yyyy HH:mm", {
                                locale: es,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/participants/${participant.id}`)}
                              >
                                <span className="sr-only">Ver detalles</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sin participantes</h3>
                    <p className="text-gray-500 mb-4">
                      No hay participantes registrados para este evento.
                    </p>
                    <Button
                      onClick={() => setIsRegisterDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrar Participante
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Recursos */}
          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Necesarios</CardTitle>
                <CardDescription>
                  Gestiona los recursos necesarios para el evento.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8 text-center">
                <ListChecks className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                <p className="text-gray-500 mb-4 max-w-lg mx-auto">
                  La gestión detallada de recursos estará disponible en una próxima actualización.
                  Esta funcionalidad permitirá asignar personal, equipamiento y materiales
                  necesarios para cada evento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EventDetailPage;