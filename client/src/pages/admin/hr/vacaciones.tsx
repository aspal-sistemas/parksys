import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

const requestFormSchema = z.object({
  employeeId: z.string().min(1, "Selecciona un empleado"),
  requestType: z.string().min(1, "Selecciona el tipo de solicitud"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  reason: z.string().min(1, "Motivo requerido"),
  description: z.string().optional()
});

type RequestFormData = z.infer<typeof requestFormSchema>;

const REQUEST_TYPES = [
  { value: "vacation", label: "Vacaciones", color: "bg-blue-500" },
  { value: "permission", label: "Permiso", color: "bg-green-500" },
  { value: "sick_leave", label: "Incapacidad médica", color: "bg-red-500" },
  { value: "maternity_leave", label: "Licencia de maternidad", color: "bg-pink-500" },
  { value: "paternity_leave", label: "Licencia de paternidad", color: "bg-purple-500" },
  { value: "personal_leave", label: "Licencia personal", color: "bg-orange-500" },
  { value: "bereavement", label: "Luto", color: "bg-gray-500" },
  { value: "study_leave", label: "Licencia de estudios", color: "bg-indigo-500" },
  { value: "unpaid_leave", label: "Licencia sin goce", color: "bg-yellow-500" }
];

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: AlertCircle },
  approved: { label: "Aprobada", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rechazada", color: "bg-red-500", icon: XCircle },
  cancelled: { label: "Cancelada", color: "bg-gray-500", icon: XCircle }
};

export default function VacacionesPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      employeeId: "",
      requestType: "",
      startDate: "",
      endDate: "",
      reason: "",
      description: ""
    }
  });

  // Consultar solicitudes de tiempo libre
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["/api/time-off/time-off-requests"],
    queryFn: async () => {
      const response = await fetch("/api/time-off/time-off-requests");
      if (!response.ok) throw new Error("Error al cargar solicitudes");
      return response.json();
    }
  });

  // Consultar empleados
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/hr/employees"],
    queryFn: async () => {
      const response = await fetch("/api/hr/employees");
      if (!response.ok) throw new Error("Error al cargar empleados");
      return response.json();
    }
  });

  // Consultar balances de vacaciones
  const { data: balances = [] } = useQuery({
    queryKey: ["/api/time-off/vacation-balances"],
    queryFn: async () => {
      const response = await fetch("/api/time-off/vacation-balances");
      if (!response.ok) throw new Error("Error al cargar balances");
      return response.json();
    }
  });

  // Mutación para crear solicitud
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await fetch("/api/time-off/time-off-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al crear solicitud");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/time-off-requests"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Solicitud creada",
        description: "La solicitud ha sido enviada para aprobación",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la solicitud",
        variant: "destructive"
      });
    }
  });

  // Mutación para aprobar/rechazar solicitud
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: number, action: 'approve' | 'reject', rejectionReason?: string }) => {
      const response = await fetch(`/api/time-off/time-off-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason })
      });
      if (!response.ok) throw new Error("Error al procesar solicitud");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/vacation-balances"] });
      setSelectedRequest(null);
      toast({
        title: "Solicitud procesada",
        description: "El estado de la solicitud ha sido actualizado",
      });
    }
  });

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  const getRequestTypeConfig = (type: string) => {
    return REQUEST_TYPES.find(t => t.value === type) || REQUEST_TYPES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vacaciones y Permisos</h1>
          <p className="text-gray-600">Administra solicitudes de tiempo libre y balances de vacaciones</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Solicitud de Tiempo Libre</DialogTitle>
              <DialogDescription>
                Completa los datos para crear una nueva solicitud
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empleado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empleado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee: any) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.fullName} - {employee.position}
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
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Solicitud</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REQUEST_TYPES.map((type) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe el motivo de la solicitud" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalles adicionales" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createRequestMutation.isPending}>
                    {createRequestMutation.isPending ? "Creando..." : "Crear Solicitud"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balances de Vacaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Balances de Vacaciones 2025
          </CardTitle>
          <CardDescription>
            Días de vacaciones disponibles por empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((balance: any) => (
              <div key={balance.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{balance.employeeName}</h4>
                  <Badge variant="outline">{balance.employeePosition}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-blue-600 font-semibold">{balance.totalDays}</p>
                    <p className="text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-600 font-semibold">{balance.usedDays}</p>
                    <p className="text-gray-500">Usados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-600 font-semibold">{balance.availableDays}</p>
                    <p className="text-gray-500">Disponibles</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes de Tiempo Libre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Solicitudes de Tiempo Libre
          </CardTitle>
          <CardDescription>
            Gestiona todas las solicitudes de vacaciones, permisos e incapacidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request: any) => {
              const typeConfig = getRequestTypeConfig(request.requestType);
              const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{request.employeeName}</span>
                        <Badge variant="outline">{request.employeePosition}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${typeConfig.color} text-white`}>
                        {typeConfig.label}
                      </Badge>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Período</p>
                      <p className="font-medium">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                      <p className="text-gray-500">({request.requestedDays} días)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Motivo</p>
                      <p className="font-medium">{request.reason}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enviada</p>
                      <p className="font-medium">{formatDate(request.submittedAt)}</p>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-sm">Descripción</p>
                      <p className="text-sm">{request.description}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveRequestMutation.mutate({ id: request.id, action: 'approve' })}
                        disabled={approveRequestMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => approveRequestMutation.mutate({ id: request.id, action: 'reject', rejectionReason: 'Rechazada por administrador' })}
                        disabled={approveRequestMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {request.status === 'approved' && request.approvedAt && (
                    <div className="mt-3 text-sm text-green-600">
                      Aprobada el {formatDate(request.approvedAt)} por {request.approverName}
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-3 text-sm text-red-600">
                      Rechazada: {request.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}

            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes de tiempo libre registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}