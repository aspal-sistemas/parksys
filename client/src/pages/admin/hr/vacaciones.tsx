import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  XCircle,
  Filter,
  BarChart3,
  X
} from "lucide-react";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación para solicitudes
const requestFormSchema = z.object({
  employeeId: z.string().min(1, "Selecciona un empleado"),
  requestType: z.string().min(1, "Selecciona el tipo de solicitud"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  reason: z.string().min(1, "Motivo requerido"),
  description: z.string().optional()
});

type RequestFormData = z.infer<typeof requestFormSchema>;

// Tipos de solicitudes
const REQUEST_TYPES = [
  { value: "vacation", label: "Vacaciones", color: "bg-blue-500" },
  { value: "personal", label: "Permiso Personal", color: "bg-green-500" },
  { value: "sick", label: "Incapacidad Médica", color: "bg-red-500" },
  { value: "maternity", label: "Licencia de Maternidad", color: "bg-purple-500" },
  { value: "emergency", label: "Emergencia Familiar", color: "bg-orange-500" }
];

// Configuración de estados
const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Aprobada", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rechazada", color: "bg-red-500", icon: XCircle },
  cancelled: { label: "Cancelada", color: "bg-gray-500", icon: XCircle }
};

// Función auxiliar para obtener configuración del tipo de solicitud
const getRequestTypeConfig = (type: string) => {
  return REQUEST_TYPES.find(t => t.value === type) || REQUEST_TYPES[0];
};

export default function VacacionesPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("balances");
  
  // Estados para filtros
  const [searchName, setSearchName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Generar opciones de años (últimos 3 años + próximos 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  // Opciones de meses
  const monthOptions = [
    { value: "all", label: "Todos los meses" },
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ];

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

  // Construir parámetros de filtro
  const buildFilterParams = () => {
    const params = new URLSearchParams();
    params.append('year', selectedYear.toString());
    if (selectedMonth) params.append('month', selectedMonth);
    if (searchName) params.append('name', searchName);
    if (selectedDepartment) params.append('department', selectedDepartment);
    if (hireDateFrom) params.append('hireDateFrom', hireDateFrom);
    if (hireDateTo) params.append('hireDateTo', hireDateTo);
    return params.toString();
  };

  // Consultar solicitudes de tiempo libre con filtros
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/time-off/time-off-requests", selectedYear, selectedMonth, searchName, selectedDepartment, hireDateFrom, hireDateTo],
    queryFn: async () => {
      const response = await fetch(`/api/time-off/time-off-requests?${buildFilterParams()}`);
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

  // Consultar balances de vacaciones con filtros
  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/time-off/vacation-balances", selectedYear, selectedMonth, searchName, selectedDepartment],
    queryFn: async () => {
      const response = await fetch(`/api/time-off/vacation-balances?${buildFilterParams()}`);
      if (!response.ok) throw new Error("Error al cargar balances");
      return response.json();
    }
  });

  // Obtener departamentos únicos para el filtro
  const departments = [...new Set(employees.map((emp: any) => emp.department).filter(Boolean))].sort();

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
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/vacation-balances"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Solicitud creada",
        description: "La solicitud de tiempo libre ha sido creada exitosamente"
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

  // Mutación para aprobar/rechazar solicitudes
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: number; action: string; rejectionReason?: string }) => {
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
      toast({
        title: "Solicitud procesada",
        description: "La solicitud ha sido procesada exitosamente"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Vacaciones y Permisos</h1>
            <p className="text-gray-600">Administra solicitudes de tiempo libre y balances de vacaciones</p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nueva Solicitud de Tiempo Libre</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para crear una nueva solicitud
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
                                <SelectValue placeholder="Selecciona un empleado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {`${employee.firstName} ${employee.lastName}`}
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
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vacation">Vacaciones</SelectItem>
                              <SelectItem value="sick_leave">Permiso por Enfermedad</SelectItem>
                              <SelectItem value="personal_leave">Permiso Personal</SelectItem>
                              <SelectItem value="maternity_leave">Permiso de Maternidad</SelectItem>
                              <SelectItem value="paternity_leave">Permiso de Paternidad</SelectItem>
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
                            <Textarea placeholder="Describe el motivo de la solicitud..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={createRequestMutation.isPending}>
                        {createRequestMutation.isPending ? "Creando..." : "Crear Solicitud"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month-filter">Mes</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los meses" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-name">Nombre del Empleado</Label>
                <Input
                  id="search-name"
                  placeholder="Buscar por nombre..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-filter">Departamento</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchName("");
                  setSelectedDepartment("all");
                  setSelectedMonth("all");
                  setHireDateFrom("");
                  setHireDateTo("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              <div className="text-sm text-muted-foreground">
                {activeTab === "balances" 
                  ? `${balances.length} balances encontrados`
                  : `${requests.length} solicitudes encontradas`
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Balances de Vacaciones
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Solicitudes de Tiempo Libre
            </TabsTrigger>
          </TabsList>

          {/* Balances Tab */}
          <TabsContent value="balances" className="space-y-6">
            {balancesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Balances de Vacaciones {selectedYear}
                  </CardTitle>
                  <CardDescription>
                    Días de vacaciones disponibles por empleado para el año {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances.map((balance: any) => (
                      <div key={balance.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{balance.employeeName}</h4>
                          <Badge variant="outline" className="text-xs">{balance.employeePosition}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="text-blue-600 font-bold text-xl">{balance.totalDays}</p>
                            <p className="text-gray-600 text-xs">Total Asignados</p>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <p className="text-red-600 font-bold text-xl">{balance.usedDays}</p>
                            <p className="text-gray-600 text-xs">Días Usados</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-green-600 font-bold text-xl">{balance.availableDays}</p>
                            <p className="text-gray-600 text-xs">Disponibles</p>
                          </div>
                        </div>
                        {balance.availableDays <= 5 && balance.availableDays > 0 && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Días limitados
                            </Badge>
                          </div>
                        )}
                        {balance.availableDays === 0 && (
                          <div className="text-center">
                            <Badge variant="destructive">Sin días disponibles</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {balances.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay balances de vacaciones registrados para {selectedYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Solicitudes de Tiempo Libre {selectedYear}</h3>
                <p className="text-sm text-gray-600">Gestiona todas las solicitudes de vacaciones, permisos e incapacidades</p>
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
                              <FormLabel>Fecha Inicio</FormLabel>
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
                              <FormLabel>Fecha Fin</FormLabel>
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
                              <Input placeholder="Motivo de la solicitud" {...field} />
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
                              <Textarea 
                                placeholder="Detalles adicionales..." 
                                className="min-h-[80px]"
                                {...field} 
                              />
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

            {requestsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : (
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
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay solicitudes de tiempo libre registradas para {selectedYear}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}