import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, XCircle, Clock, Plus, Filter, Search, FileText, User, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VacationRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  requestType: string;
  startDate: string;
  endDate: string;
  requestedDays: string;
  reason: string;
  status: string;
  submittedAt: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
}

interface Employee {
  id: number;
  fullName: string;
}

export default function VacationManagement() {
  const [selectedTab, setSelectedTab] = useState("requests");
  const [filters, setFilters] = useState({
    status: "all",
    employeeId: "",
    requestType: "all",
    page: 1
  });
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<{open: boolean, request: VacationRequest | null}>({
    open: false,
    request: null
  });
  const [newRequest, setNewRequest] = useState({
    employeeId: "",
    requestType: "vacation",
    startDate: "",
    endDate: "",
    requestedDays: "",
    reason: "",
    description: ""
  });

  const queryClient = useQueryClient();

  // Obtener solicitudes de vacaciones
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['vacation-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.requestType !== "all") params.append("requestType", filters.requestType);
      params.append("page", filters.page.toString());
      params.append("limit", "10");
      
      const response = await apiRequest(`/api/hr/vacation-requests?${params}`);
      return response;
    }
  });

  // Obtener empleados activos
  const { data: employees } = useQuery({
    queryKey: ['employees-active'],
    queryFn: async () => {
      const response = await apiRequest('/api/hr/employees');
      return response.filter((emp: Employee) => emp.fullName);
    }
  });

  // Crear nueva solicitud
  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof newRequest) => {
      return await apiRequest('/api/hr/vacation-requests', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitud creada",
        description: "La solicitud de vacaciones ha sido creada exitosamente",
      });
      setNewRequestDialog(false);
      setNewRequest({
        employeeId: "",
        requestType: "vacation",
        startDate: "",
        endDate: "",
        requestedDays: "",
        reason: "",
        description: ""
      });
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la solicitud",
        variant: "destructive",
      });
    }
  });

  // Revisar solicitud (aprobar/rechazar)
  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, action, reviewComments }: { id: number, action: string, reviewComments: string }) => {
      return await apiRequest(`/api/hr/vacation-requests/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ action, reviewComments })
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitud procesada",
        description: "La solicitud ha sido procesada exitosamente",
      });
      setReviewDialog({ open: false, request: null });
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al procesar la solicitud",
        variant: "destructive",
      });
    }
  });

  // Calcular días solicitados automáticamente
  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays.toString();
  };

  useEffect(() => {
    if (newRequest.startDate && newRequest.endDate) {
      const days = calculateDays(newRequest.startDate, newRequest.endDate);
      setNewRequest(prev => ({ ...prev, requestedDays: days }));
    }
  }, [newRequest.startDate, newRequest.endDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Aprobada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    const types = {
      vacation: { label: "Vacaciones", color: "bg-blue-50 text-blue-700 border-blue-200" },
      sick_leave: { label: "Incapacidad", color: "bg-orange-50 text-orange-700 border-orange-200" },
      personal_leave: { label: "Permiso Personal", color: "bg-purple-50 text-purple-700 border-purple-200" },
      maternity_leave: { label: "Maternidad", color: "bg-pink-50 text-pink-700 border-pink-200" },
      paternity_leave: { label: "Paternidad", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      unpaid_leave: { label: "Sin Goce", color: "bg-gray-50 text-gray-700 border-gray-200" }
    };
    
    const typeInfo = types[type as keyof typeof types] || { label: type, color: "bg-gray-50 text-gray-700 border-gray-200" };
    return <Badge variant="outline" className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vacaciones</h1>
          <p className="text-gray-600">Sistema integral para gestión de vacaciones, permisos e incapacidades</p>
        </div>
        <Button 
          onClick={() => setNewRequestDialog(true)}
          className="bg-[#00a587] hover:bg-[#067f5f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Panel de Control
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">Estado</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="approved">Aprobadas</SelectItem>
                      <SelectItem value="rejected">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="employee-filter">Empleado</Label>
                  <Select value={filters.employeeId} onValueChange={(value) => setFilters(prev => ({ ...prev, employeeId: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los empleados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los empleados</SelectItem>
                      {employees?.map((emp: Employee) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type-filter">Tipo</Label>
                  <Select value={filters.requestType} onValueChange={(value) => setFilters(prev => ({ ...prev, requestType: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="sick_leave">Incapacidad</SelectItem>
                      <SelectItem value="personal_leave">Permiso Personal</SelectItem>
                      <SelectItem value="maternity_leave">Maternidad</SelectItem>
                      <SelectItem value="paternity_leave">Paternidad</SelectItem>
                      <SelectItem value="unpaid_leave">Sin Goce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => setFilters({ status: "all", employeeId: "", requestType: "all", page: 1 })}
                    variant="outline"
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Solicitudes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Vacaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Solicitado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsData?.data?.map((request: VacationRequest) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>{getRequestTypeBadge(request.requestType)}</TableCell>
                        <TableCell>
                          {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: es })} - {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{request.requestedDays} días</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{format(new Date(request.submittedAt), 'dd/MM/yyyy', { locale: es })}</TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewDialog({ open: true, request })}
                            >
                              Revisar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {/* Paginación */}
              {requestsData?.pagination && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Página {requestsData.pagination.page} de {requestsData.pagination.pages} 
                    - Total: {requestsData.pagination.total} solicitudes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={requestsData.pagination.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={requestsData.pagination.page === requestsData.pagination.pages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Otros tabs serán implementados como componentes separados */}
        <TabsContent value="dashboard">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Panel de Control</h3>
                <p className="text-gray-600">Próximamente: Dashboard con estadísticas y métricas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="balances">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance de Vacaciones</h3>
                <p className="text-gray-600">Próximamente: Gestión de balances por empleado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración</h3>
                <p className="text-gray-600">Próximamente: Configuración del sistema</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nueva Solicitud */}
      <Dialog open={newRequestDialog} onOpenChange={setNewRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Vacaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Empleado</Label>
                <Select value={newRequest.employeeId} onValueChange={(value) => setNewRequest(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp: Employee) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Solicitud</Label>
                <Select value={newRequest.requestType} onValueChange={(value) => setNewRequest(prev => ({ ...prev, requestType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="sick_leave">Incapacidad</SelectItem>
                    <SelectItem value="personal_leave">Permiso Personal</SelectItem>
                    <SelectItem value="maternity_leave">Maternidad</SelectItem>
                    <SelectItem value="paternity_leave">Paternidad</SelectItem>
                    <SelectItem value="unpaid_leave">Sin Goce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start-date">Fecha Inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Fecha Fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="days">Días Solicitados</Label>
                <Input
                  id="days"
                  type="number"
                  value={newRequest.requestedDays}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={newRequest.reason}
                onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Motivo de la solicitud"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalles adicionales"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewRequestDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => createRequestMutation.mutate(newRequest)}
                disabled={!newRequest.employeeId || !newRequest.startDate || !newRequest.endDate || !newRequest.reason}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                Crear Solicitud
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Revisar Solicitud */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, request: reviewDialog.request })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Solicitud</DialogTitle>
          </DialogHeader>
          {reviewDialog.request && (
            <div className="space-y-4">
              <div>
                <p><strong>Empleado:</strong> {reviewDialog.request.employeeName}</p>
                <p><strong>Tipo:</strong> {reviewDialog.request.requestType}</p>
                <p><strong>Período:</strong> {format(new Date(reviewDialog.request.startDate), 'dd/MM/yyyy', { locale: es })} - {format(new Date(reviewDialog.request.endDate), 'dd/MM/yyyy', { locale: es })}</p>
                <p><strong>Días:</strong> {reviewDialog.request.requestedDays}</p>
                <p><strong>Motivo:</strong> {reviewDialog.request.reason}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => reviewRequestMutation.mutate({ id: reviewDialog.request!.id, action: "approve", reviewComments: "" })}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
                <Button 
                  onClick={() => reviewRequestMutation.mutate({ id: reviewDialog.request!.id, action: "reject", reviewComments: "Rechazada" })}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}