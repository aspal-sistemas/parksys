import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, MapPin, Plus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

const timeRecordFormSchema = z.object({
  employeeId: z.string().min(1, "Selecciona un empleado"),
  recordType: z.string().min(1, "Selecciona el tipo de registro"),
  timestamp: z.string().min(1, "Hora y fecha requerida"),
  location: z.string().optional(),
  notes: z.string().optional(),
  isManualEntry: z.boolean().default(true),
  manualReason: z.string().optional()
});

type TimeRecordFormData = z.infer<typeof timeRecordFormSchema>;

const RECORD_TYPES = [
  { value: "check_in", label: "Entrada", color: "bg-green-500", icon: "↗" },
  { value: "check_out", label: "Salida", color: "bg-red-500", icon: "↙" },
  { value: "break_start", label: "Inicio de descanso", color: "bg-yellow-500", icon: "⏸" },
  { value: "break_end", label: "Fin de descanso", color: "bg-blue-500", icon: "▶" },
  { value: "overtime_start", label: "Inicio horas extra", color: "bg-purple-500", icon: "⏰" },
  { value: "overtime_end", label: "Fin horas extra", color: "bg-indigo-500", icon: "🏁" }
];

export default function ControlHorasPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TimeRecordFormData>({
    resolver: zodResolver(timeRecordFormSchema),
    defaultValues: {
      employeeId: "",
      recordType: "",
      timestamp: "",
      location: "Oficina Central",
      notes: "",
      isManualEntry: true,
      manualReason: ""
    }
  });

  // Consultar registros de tiempo
  const { data: timeRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/time-off/time-records", selectedDate, selectedEmployee],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('dateFrom', selectedDate);
      if (selectedDate) params.append('dateTo', selectedDate);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      
      const response = await fetch(`/api/time-off/time-records?${params}`);
      if (!response.ok) throw new Error("Error al cargar registros");
      return response.json();
    }
  });

  // Consultar hojas de tiempo diarias
  const { data: timeSheets = [], isLoading: sheetsLoading } = useQuery({
    queryKey: ["/api/time-off/daily-time-sheets", selectedDate, selectedEmployee],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('dateFrom', selectedDate);
      if (selectedDate) params.append('dateTo', selectedDate);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      
      const response = await fetch(`/api/time-off/daily-time-sheets?${params}`);
      if (!response.ok) throw new Error("Error al cargar hojas de tiempo");
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

  // Consultar horarios de trabajo
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/time-off/work-schedules"],
    queryFn: async () => {
      const response = await fetch("/api/time-off/work-schedules?active=true");
      if (!response.ok) throw new Error("Error al cargar horarios");
      return response.json();
    }
  });

  // Consultar estadísticas de tiempo
  const { data: stats } = useQuery({
    queryKey: ["/api/time-off/time-stats", selectedEmployee, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      const date = new Date(selectedDate);
      params.append('month', (date.getMonth() + 1).toString());
      params.append('year', date.getFullYear().toString());
      
      const response = await fetch(`/api/time-off/time-stats?${params}`);
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      return response.json();
    },
    enabled: !!selectedEmployee
  });

  // Mutación para crear registro de tiempo
  const createRecordMutation = useMutation({
    mutationFn: async (data: TimeRecordFormData) => {
      const recordData = {
        ...data,
        date: data.timestamp.split('T')[0]
      };
      
      const response = await fetch("/api/time-off/time-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData)
      });
      if (!response.ok) throw new Error("Error al crear registro");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/time-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/daily-time-sheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off/time-stats"] });
      setIsRecordDialogOpen(false);
      form.reset();
      toast({
        title: "Registro creado",
        description: "El registro de tiempo ha sido guardado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el registro de tiempo",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TimeRecordFormData) => {
    createRecordMutation.mutate(data);
  };

  const getRecordTypeConfig = (type: string) => {
    return RECORD_TYPES.find(t => t.value === type) || RECORD_TYPES[0];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isLoading = recordsLoading || sheetsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Horas Trabajadas</h1>
          <p className="text-gray-600">Gestiona registros de entrada, salida y control de asistencias</p>
        </div>
        <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Tiempo</DialogTitle>
              <DialogDescription>
                Crear un registro manual de tiempo para un empleado
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
                  name="recordType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Registro</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RECORD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                {type.label}
                              </span>
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
                  name="timestamp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          defaultValue={new Date().toISOString().slice(0, 16)}
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
                        <Input placeholder="Ubicación del registro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manualReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo del Registro Manual</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explica por qué se registra manualmente" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observaciones adicionales" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createRecordMutation.isPending}>
                    {createRecordMutation.isPending ? "Guardando..." : "Guardar Registro"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Empleado</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los empleados</SelectItem>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del mes (si hay empleado seleccionado) */}
      {selectedEmployee && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estadísticas del Mes
            </CardTitle>
            <CardDescription>
              Resumen de horas trabajadas para {employees.find((e: any) => e.id.toString() === selectedEmployee)?.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
                <div className="text-sm text-gray-500">Horas Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalRegularHours}</div>
                <div className="text-sm text-gray-500">Horas Regulares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalOvertimeHours}</div>
                <div className="text-sm text-gray-500">Horas Extra</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.daysWorked}</div>
                <div className="text-sm text-gray-500">Días Trabajados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.daysAbsent}</div>
                <div className="text-sm text-gray-500">Días Ausente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.daysLate}</div>
                <div className="text-sm text-gray-500">Días Tarde</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalLateMinutes}</div>
                <div className="text-sm text-gray-500">Min. Tarde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hojas de Tiempo Diarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen Diario de Horas
          </CardTitle>
          <CardDescription>
            Resumen calculado de horas trabajadas por empleado y día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeSheets.map((sheet: any) => (
              <div key={sheet.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{sheet.employeeName}</span>
                    <Badge variant="outline">{sheet.employeePosition}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sheet.isLate && (
                      <Badge className="bg-yellow-500 text-white">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Tardanza ({sheet.lateMinutes} min)
                      </Badge>
                    )}
                    {sheet.isAbsent ? (
                      <Badge className="bg-red-500 text-white">
                        <XCircle className="h-3 w-3 mr-1" />
                        Ausente
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Presente
                      </Badge>
                    )}
                    {sheet.isJustified && (
                      <Badge className="bg-blue-500 text-white">
                        Justificado
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Entrada</p>
                    <p className="font-medium">
                      {sheet.checkInTime ? formatTime(sheet.checkInTime) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Salida</p>
                    <p className="font-medium">
                      {sheet.checkOutTime ? formatTime(sheet.checkOutTime) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Horas Regulares</p>
                    <p className="font-medium text-green-600">{sheet.regularHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Horas Extra</p>
                    <p className="font-medium text-purple-600">{sheet.overtimeHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Horas</p>
                    <p className="font-medium text-blue-600">{sheet.totalHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha</p>
                    <p className="font-medium">{formatDate(sheet.date)}</p>
                  </div>
                </div>

                {sheet.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">{sheet.notes}</p>
                  </div>
                )}
              </div>
            ))}

            {timeSheets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay registros de tiempo para los filtros seleccionados
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registros de Tiempo Detallados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registros de Tiempo Detallados
          </CardTitle>
          <CardDescription>
            Todos los registros de entrada, salida y pausas por empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeRecords.map((record: any) => {
              const typeConfig = getRecordTypeConfig(record.recordType);
              
              return (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{record.employeeName}</span>
                      <Badge className={`${typeConfig.color} text-white`}>
                        <span className="mr-1">{typeConfig.icon}</span>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-mono">{formatTime(record.timestamp)}</span>
                      {record.isManualEntry && (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha y Hora</p>
                      <p className="font-medium">{formatDate(record.date)} - {formatTime(record.timestamp)}</p>
                    </div>
                    {record.location && (
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Ubicación
                        </p>
                        <p className="font-medium">{record.location}</p>
                      </div>
                    )}
                    {record.registeredByName && (
                      <div>
                        <p className="text-gray-500">Registrado por</p>
                        <p className="font-medium">{record.registeredByName}</p>
                      </div>
                    )}
                  </div>

                  {record.manualReason && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Motivo de registro manual:</strong> {record.manualReason}
                      </p>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {timeRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay registros de tiempo para los filtros seleccionados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}