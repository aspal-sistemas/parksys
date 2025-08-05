import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  UserPlus, 
  Users, 
  QrCode, 
  Calendar, 
  Mail, 
  Phone, 
  Clipboard, 
  CheckCircle, 
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  XCircle
} from "lucide-react";

// Esquema para validar el formulario de registro de participantes
const participantFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional().nullable(),
  phone: z.string().optional().nullable(),
  attendeeCount: z.coerce.number().min(1).default(1),
  notes: z.string().optional().nullable(),
  status: z.string().default("registered"),
});

// Tipos
type ParticipantFormValues = z.infer<typeof participantFormSchema>;

// Estados posibles para un participante
const participantStatuses = [
  { value: "registered", label: "Registrado", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmado", color: "bg-green-100 text-green-800" },
  { value: "canceled", label: "Cancelado", color: "bg-red-100 text-red-800" },
  { value: "attended", label: "Asistió", color: "bg-purple-100 text-purple-800" },
  { value: "no-show", label: "No asistió", color: "bg-gray-100 text-gray-800" },
];

const EventParticipantsPage: React.FC = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = params.id;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Consultar detalles del evento
  const { 
    data: event,
    isLoading: isEventLoading,
    error: eventError 
  } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Consultar participantes del evento
  const { 
    data: participants = [],
    isLoading: isParticipantsLoading,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: [`/api/events/${eventId}/participants`],
    enabled: !!eventId,
  });

  // Formulario para agregar participante
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      attendeeCount: 1,
      notes: "",
      status: "registered",
    },
  });

  // Formulario para actualizar estado de participante
  const updateForm = useForm<{ status: string; notes: string | null }>({
    defaultValues: {
      status: selectedParticipant?.status || "registered",
      notes: selectedParticipant?.notes || "",
    },
  });

  // Efecto para actualizar el formulario cuando cambia el participante seleccionado
  React.useEffect(() => {
    if (selectedParticipant) {
      updateForm.reset({
        status: selectedParticipant.status,
        notes: selectedParticipant.notes,
      });
    }
  }, [selectedParticipant, updateForm]);

  // Mutación para registrar participante
  const registerParticipantMutation = useMutation({
    mutationFn: async (data: ParticipantFormValues) => {
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al registrar participante");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Participante registrado",
        description: "El participante ha sido registrado exitosamente",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/events/${eventId}/participants`],
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo registrar al participante: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar estado de participante
  const updateParticipantStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string | null }) => {
      const response = await fetch(`/api/events/${eventId}/participants/${data.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: data.status, notes: data.notes }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar estado");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado del participante ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/events/${eventId}/participants`],
      });
      setIsUpdateDialogOpen(false);
      setSelectedParticipant(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario de registro
  const onSubmit = (data: ParticipantFormValues) => {
    registerParticipantMutation.mutate(data);
  };

  // Manejar envío del formulario de actualización
  const onUpdateSubmit = updateForm.handleSubmit((data) => {
    if (selectedParticipant) {
      updateParticipantStatusMutation.mutate({
        id: selectedParticipant.id,
        status: data.status,
        notes: data.notes,
      });
    }
  });

  // Función para generar informe CSV
  const generateCSV = () => {
    if (!participants.length) return;
    
    const headers = ["ID", "Nombre", "Email", "Teléfono", "Estado", "Fecha de Registro", "Asistentes", "Notas"];
    const csvData = participants.map((p: any) => [
      p.id,
      p.fullName,
      p.email || "",
      p.phone || "",
      participantStatuses.find(s => s.value === p.status)?.label || p.status,
      new Date(p.registrationDate).toLocaleString(),
      p.attendeeCount,
      p.notes || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `participantes-evento-${eventId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar participantes según término de búsqueda
  const filteredParticipants = participants.filter((p: any) => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.phone && p.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular estadísticas
  const stats = {
    total: participants.length,
    confirmed: participants.filter((p: any) => p.status === "confirmed").length,
    attended: participants.filter((p: any) => p.status === "attended").length,
    canceled: participants.filter((p: any) => p.status === "canceled").length,
    noShow: participants.filter((p: any) => p.status === "no-show").length,
    totalAttendees: participants.reduce((sum: number, p: any) => sum + (p.attendeeCount || 1), 0),
  };

  if (isEventLoading || isParticipantsLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6 flex items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (eventError) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <EmptyState
            title="Error al cargar el evento"
            description="No se pudo obtener la información del evento. Por favor, intenta nuevamente."
            icon={<AlertCircle className="h-10 w-10 text-red-500" />}
            action={
              <Button onClick={() => navigate("/admin/events")}>
                Volver a eventos
              </Button>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <PageHeader
          title={`Participantes: ${event?.title}`}
          description="Gestiona los participantes registrados en este evento"
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate(`/admin/events/${eventId}`)}>
                Volver al evento
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir participante
              </Button>
            </div>
          }
        />

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Asistieron</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.attended}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Asistentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttendees}</div>
              <CardDescription className="text-xs">Incluyendo grupos</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Barra de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar participante..." 
              className="w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchParticipants()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={generateCSV}>
              <Download className="h-4 w-4 mr-1" />
              Exportar CSV
            </Button>
            {event.capacity && (
              <Badge variant={stats.total >= event.capacity ? "destructive" : "outline"} className="ml-2">
                {stats.total} / {event.capacity} plazas
              </Badge>
            )}
          </div>
        </div>

        {/* Lista de participantes */}
        {participants.length === 0 ? (
          <EmptyState 
            title="No hay participantes registrados" 
            description="Aún no hay participantes registrados para este evento. Añade el primer participante para comenzar."
            icon={<Users className="h-10 w-10 text-primary/50" />}
            action={
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir participante
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Asistentes</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Search className="h-10 w-10 text-muted-foreground/40 mb-2" />
                          <p className="text-muted-foreground">No se encontraron participantes con ese criterio de búsqueda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant: any) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.fullName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {participant.email && (
                              <span className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1" /> {participant.email}
                              </span>
                            )}
                            {participant.phone && (
                              <span className="flex items-center text-sm mt-1">
                                <Phone className="h-3 w-3 mr-1" /> {participant.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            participantStatuses.find(s => s.value === participant.status)?.color || ""
                          }>
                            {participantStatuses.find(s => s.value === participant.status)?.label || participant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{participant.attendeeCount || 1}</TableCell>
                        <TableCell>{new Date(participant.registrationDate).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setIsUpdateDialogOpen(true);
                            }}
                          >
                            Actualizar estado
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Diálogo para añadir participante */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir participante</DialogTitle>
              <DialogDescription>
                Registra un nuevo participante para el evento. Los campos marcados con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del participante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@ejemplo.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attendeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de asistentes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            placeholder="1" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Para grupos o familias
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {participantStatuses.map((status) => (
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
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el participante" 
                          className="resize-none min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerParticipantMutation.isPending}
                  >
                    {registerParticipantMutation.isPending ? "Guardando..." : "Guardar participante"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para actualizar estado */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Actualizar estado del participante</DialogTitle>
              <DialogDescription>
                Actualiza el estado de {selectedParticipant?.fullName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onUpdateSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={(value) => updateForm.setValue("status", value)} 
                    defaultValue={updateForm.getValues("status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {participantStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FormLabel>Notas</FormLabel>
                  <Textarea 
                    placeholder="Información adicional sobre el cambio de estado"
                    className="resize-none min-h-[80px]"
                    value={updateForm.getValues("notes") || ""}
                    onChange={(e) => updateForm.setValue("notes", e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateParticipantStatusMutation.isPending}
                >
                  {updateParticipantStatusMutation.isPending ? "Guardando..." : "Actualizar estado"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EventParticipantsPage;