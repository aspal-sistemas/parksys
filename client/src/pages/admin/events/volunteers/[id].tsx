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
  DialogClose,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  UserPlus, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Clipboard, 
  CheckCircle, 
  AlertCircle,
  Search,
  RefreshCw,
  XCircle,
  Star,
  ClipboardX
} from "lucide-react";

// Esquema para validar el formulario de asignación de voluntarios
const volunteerAssignmentSchema = z.object({
  volunteerId: z.string().min(1, { message: "Selecciona un voluntario" }),
  role: z.string().min(1, { message: "El rol es requerido" }),
  notes: z.string().optional().nullable(),
});

// Tipos
type VolunteerAssignmentFormValues = z.infer<typeof volunteerAssignmentSchema>;

// Roles posibles para los voluntarios en eventos
const volunteerRoles = [
  { value: "coordinador", label: "Coordinador" },
  { value: "asistente", label: "Asistente" },
  { value: "facilitador", label: "Facilitador" },
  { value: "apoyo_logistico", label: "Apoyo Logístico" },
  { value: "voluntario", label: "Voluntario General" },
];

// Estados posibles para un voluntario asignado
const volunteerStatuses = [
  { value: "assigned", label: "Asignado", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmado", color: "bg-green-100 text-green-800" },
  { value: "declined", label: "Rechazado", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Completado", color: "bg-purple-100 text-purple-800" },
];

// Filtros para búsqueda avanzada de voluntarios
const skillFilters = [
  { value: "primeros_auxilios", label: "Primeros Auxilios" },
  { value: "educacion_ambiental", label: "Educación Ambiental" },
  { value: "deportes", label: "Deportes y Recreación" },
  { value: "cultural", label: "Actividades Culturales" },
  { value: "fotografia", label: "Fotografía" },
  { value: "organizacion", label: "Organización de Eventos" },
  { value: "tecnologia", label: "Tecnología" },
];

// Días de la semana para filtrar por disponibilidad
const dayFilters = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const EventVolunteersPage: React.FC = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = params.id;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Consultar detalles del evento
  const { 
    data: event,
    isLoading: isEventLoading,
    error: eventError 
  } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Consultar voluntarios asignados al evento
  const { 
    data: volunteers = [],
    isLoading: isVolunteersLoading,
    error: volunteersError,
    refetch: refetchVolunteers
  } = useQuery({
    queryKey: [`/api/events/${eventId}/volunteers`],
    enabled: !!eventId,
  });

  // Construir la URL para obtener voluntarios disponibles con filtros
  const getAvailableVolunteersUrl = () => {
    let url = `/api/volunteers/available?eventId=${eventId}`;
    
    if (selectedSkills.length > 0) {
      url += `&skills=${selectedSkills.join(',')}`;
    }
    
    if (selectedDays.length > 0) {
      url += `&availability=${selectedDays.join(',')}`;
    }
    
    return url;
  };

  // Consultar voluntarios disponibles para asignar
  const { 
    data: availableVolunteers = [],
    isLoading: isAvailableVolunteersLoading,
    refetch: refetchAvailableVolunteers
  } = useQuery({
    queryKey: [getAvailableVolunteersUrl()],
    enabled: !!eventId && isAddDialogOpen,
  });

  // Formulario para asignar voluntario
  const form = useForm<VolunteerAssignmentFormValues>({
    resolver: zodResolver(volunteerAssignmentSchema),
    defaultValues: {
      volunteerId: "",
      role: "voluntario",
      notes: "",
    },
  });

  // Formulario para actualizar estado de voluntario
  const updateForm = useForm<{ status: string; notes: string | null }>({
    defaultValues: {
      status: selectedVolunteer?.status || "assigned",
      notes: selectedVolunteer?.notes || "",
    },
  });

  // Efecto para actualizar el formulario cuando cambia el voluntario seleccionado
  React.useEffect(() => {
    if (selectedVolunteer) {
      updateForm.reset({
        status: selectedVolunteer.status,
        notes: selectedVolunteer.notes,
      });
    }
  }, [selectedVolunteer, updateForm]);

  // Mutación para asignar voluntario
  const assignVolunteerMutation = useMutation({
    mutationFn: async (data: VolunteerAssignmentFormValues) => {
      const response = await fetch(`/api/events/${eventId}/volunteers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al asignar voluntario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Voluntario asignado",
        description: "El voluntario ha sido asignado exitosamente al evento",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/events/${eventId}/volunteers`],
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo asignar al voluntario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar estado de asignación
  const updateVolunteerAssignmentMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string | null }) => {
      const response = await fetch(`/api/events/${eventId}/volunteers/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: JSON.stringify({ status: data.status, notes: data.notes }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar asignación");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Asignación actualizada",
        description: "La asignación del voluntario ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/events/${eventId}/volunteers`],
      });
      setIsUpdateDialogOpen(false);
      setSelectedVolunteer(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la asignación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar asignación de voluntario
  const removeVolunteerMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await fetch(`/api/events/${eventId}/volunteers/${assignmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar voluntario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Voluntario eliminado",
        description: "El voluntario ha sido eliminado exitosamente del evento",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/events/${eventId}/volunteers`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar al voluntario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario de asignación
  const onSubmit = (data: VolunteerAssignmentFormValues) => {
    assignVolunteerMutation.mutate(data);
  };

  // Manejar envío del formulario de actualización
  const onUpdateSubmit = updateForm.handleSubmit((data) => {
    if (selectedVolunteer) {
      updateVolunteerAssignmentMutation.mutate({
        id: selectedVolunteer.id,
        status: data.status,
        notes: data.notes,
      });
    }
  });

  // Manejar eliminación de voluntario
  const handleRemoveVolunteer = (assignmentId: number) => {
    if (confirm("¿Estás seguro de eliminar a este voluntario del evento?")) {
      removeVolunteerMutation.mutate(assignmentId);
    }
  };

  // Manejar cambio en filtros de habilidades
  const handleSkillChange = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Manejar cambio en filtros de disponibilidad
  const handleDayChange = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Aplicar filtros y refrescar lista de voluntarios disponibles
  const applyFilters = () => {
    refetchAvailableVolunteers();
    setIsFilterDialogOpen(false);
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedDays([]);
  };

  // Filtrar voluntarios según término de búsqueda
  const filteredVolunteers = volunteers.filter((v: any) => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.contactInfo && v.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.role && v.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isEventLoading || isVolunteersLoading) {
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
          title={`Voluntarios: ${event?.title}`}
          description="Gestiona los voluntarios asignados a este evento"
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate(`/admin/events/${eventId}`)}>
                Volver al evento
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar voluntario
              </Button>
            </div>
          }
        />

        {/* Barra de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar voluntario..." 
              className="w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchVolunteers()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Lista de voluntarios */}
        {volunteers.length === 0 ? (
          <EmptyState 
            title="No hay voluntarios asignados" 
            description="Aún no hay voluntarios asignados para este evento. Asigna el primer voluntario para comenzar."
            icon={<Users className="h-10 w-10 text-primary/50" />}
            action={
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar voluntario
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
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVolunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Search className="h-10 w-10 text-muted-foreground/40 mb-2" />
                          <p className="text-muted-foreground">No se encontraron voluntarios con ese criterio de búsqueda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVolunteers.map((volunteer: any) => (
                      <TableRow key={volunteer.id}>
                        <TableCell className="font-medium">{volunteer.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {volunteer.contactInfo && (
                              <span className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                {volunteer.contactInfo}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {volunteer.role || "Voluntario"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              volunteerStatuses.find(s => s.value === volunteer.status)?.color || 
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {volunteerStatuses.find(s => s.value === volunteer.status)?.label || volunteer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {volunteer.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedVolunteer(volunteer);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              <Clipboard className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveVolunteer(volunteer.id)}
                            >
                              <ClipboardX className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Diálogo para asignar voluntario */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Asignar voluntario al evento</DialogTitle>
              <DialogDescription>
                Selecciona un voluntario disponible y asígnale un rol específico para este evento.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Search className="h-4 w-4 mr-1" />
                Filtrar voluntarios
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetchAvailableVolunteers()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar lista
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="volunteerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voluntario</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un voluntario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isAvailableVolunteersLoading ? (
                            <div className="flex justify-center p-4">
                              <LoadingSpinner size="sm" />
                            </div>
                          ) : availableVolunteers.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              No hay voluntarios disponibles
                            </div>
                          ) : (
                            availableVolunteers.map((volunteer: any) => (
                              <SelectItem key={volunteer.id} value={volunteer.id.toString()}>
                                {volunteer.name}
                                {volunteer.skills && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({volunteer.skills.slice(0, 30)}...)
                                  </span>
                                )}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {volunteerRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Instrucciones específicas o información adicional"
                          className="resize-none"
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
                    disabled={assignVolunteerMutation.isPending}
                  >
                    {assignVolunteerMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                    Asignar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para actualizar estado */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Actualizar asignación</DialogTitle>
              <DialogDescription>
                Actualiza el estado y notas del voluntario {selectedVolunteer?.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onUpdateSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    value={updateForm.watch("status")} 
                    onValueChange={val => updateForm.setValue("status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {volunteerStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FormLabel>Notas</FormLabel>
                  <Textarea 
                    placeholder="Instrucciones específicas o información adicional"
                    className="resize-none"
                    value={updateForm.watch("notes") || ""}
                    onChange={e => updateForm.setValue("notes", e.target.value)}
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
                  disabled={updateVolunteerAssignmentMutation.isPending}
                >
                  {updateVolunteerAssignmentMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                  Actualizar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para filtrar voluntarios */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Filtrar voluntarios disponibles</DialogTitle>
              <DialogDescription>
                Selecciona habilidades específicas y disponibilidad para encontrar voluntarios adecuados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Habilidades requeridas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {skillFilters.map(skill => (
                    <div className="flex items-center space-x-2" key={skill.value}>
                      <Checkbox 
                        id={`skill-${skill.value}`} 
                        checked={selectedSkills.includes(skill.value)}
                        onCheckedChange={() => handleSkillChange(skill.value)}
                      />
                      <label 
                        htmlFor={`skill-${skill.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {skill.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Disponibilidad</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dayFilters.map(day => (
                    <div className="flex items-center space-x-2" key={day.value}>
                      <Checkbox 
                        id={`day-${day.value}`} 
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => handleDayChange(day.value)}
                      />
                      <label 
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsFilterDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  onClick={applyFilters}
                >
                  Aplicar filtros
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EventVolunteersPage;