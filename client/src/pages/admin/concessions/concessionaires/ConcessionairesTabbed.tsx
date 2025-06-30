import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Edit, FileText, History, Star, Users, AlertTriangle, CheckCircle, XCircle, Search, FileUp, Loader2, UserRound, MapPin, CreditCard, ClipboardCheck, Building } from "lucide-react";

// Esquema de validación para el formulario de concesionario
const concessionaireSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  type: z.enum(["persona_fisica", "persona_moral"], {
    required_error: "Debes seleccionar un tipo de concesionario",
  }),
  rfc: z.string().min(10, { message: "El RFC debe tener al menos 10 caracteres" }).max(13, { message: "El RFC no debe exceder 13 caracteres" }),
  tax_address: z.string().min(5, { message: "La dirección fiscal es obligatoria" }),
  legal_representative: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Debe ser un correo electrónico válido" }).optional(),
  notes: z.string().optional(),
});

type ConcessionaireFormValues = z.infer<typeof concessionaireSchema>;



// Esquema de validación para el formulario de nuevo pago
const paymentSchema = z.object({
  contractId: z.string().min(1, { message: "Debes seleccionar un contrato" }),
  concept: z.string().min(3, { message: "El concepto debe tener al menos 3 caracteres" }),
  amount: z.number().min(1, { message: "El monto debe ser mayor a 0" }),
  dueDate: z.string().min(1, { message: "La fecha de vencimiento es obligatoria" }),
  paymentDate: z.string().optional(),
  status: z.enum(["pending", "paid", "late"], {
    required_error: "Debes seleccionar un estado",
  }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// Componente para la pestaña de gestión financiera
const PaymentsTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/concession-payments"],
    enabled: true,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/concession-contracts"],
    enabled: true,
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractId: "",
      concept: "",
      amount: 0,
      dueDate: "",
      paymentDate: "",
      status: "pending",
      notes: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const response = await fetch("/api/concession-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pago");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago creado",
        description: "El pago se ha registrado correctamente.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/concession-payments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el pago",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PaymentFormValues) => {
    createPaymentMutation.mutate({
      ...data,
      amount: Number(data.amount),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando información financiera...</span>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "late":
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestión Financiera</h3>
          <p className="text-sm text-muted-foreground">
            Administra los pagos y facturación de las concesiones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Pago de Concesión</DialogTitle>
              <DialogDescription>
                Registra un nuevo pago para una concesión existente
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contrato de Concesión</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un contrato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(contracts) && contracts.map((contract: any) => (
                              <SelectItem key={contract.id} value={contract.id.toString()}>
                                Contrato #{contract.id} - {contract.concessionaire?.name || "Sin concesionario"}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="late">Atrasado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto del Pago</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Renta mensual de enero 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Vencimiento</FormLabel>
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
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Pago (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Solo completar si el pago ya fue realizado
                      </FormDescription>
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
                        <Textarea 
                          placeholder="Información adicional sobre el pago..."
                          className="resize-none"
                          rows={3}
                          {...field} 
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
                    onClick={() => setIsDialogOpen(false)}
                    disabled={createPaymentMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPaymentMutation.isPending}
                    className="gap-2"
                  >
                    {createPaymentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Crear Pago
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Este Mes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,820</div>
            <p className="text-xs text-muted-foreground">
              +15% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Morosidad</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <p className="text-xs text-muted-foreground">
              -2.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(payments) && payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        Contrato #{payment.contractId}
                      </TableCell>
                      <TableCell>{payment.concept || "N/A"}</TableCell>
                      <TableCell>${payment.amount?.toLocaleString() || "0"}</TableCell>
                      <TableCell>
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Pendiente"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para la pestaña de evaluaciones
const EvaluationsTab = () => {
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["/api/concession-evaluations"],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando evaluaciones...</span>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Evaluación y Cumplimiento</h3>
          <p className="text-sm text-muted-foreground">
            Monitorea el cumplimiento y evalúa el desempeño de las concesiones
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Nueva Evaluación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones Pendientes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4</div>
            <p className="text-xs text-muted-foreground">
              +0.3 desde el trimestre pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              En proceso de resolución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Historial de Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Sanitaria</TableHead>
                  <TableHead>Operativa</TableHead>
                  <TableHead>Técnica</TableHead>
                  <TableHead>Satisfacción</TableHead>
                  <TableHead>Promedio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(evaluations) && evaluations.length > 0 ? (
                  evaluations.map((evaluation: any) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">
                        Contrato #{evaluation.contractId}
                      </TableCell>
                      <TableCell>
                        {evaluation.evaluationDate ? new Date(evaluation.evaluationDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(evaluation.sanitaryScore || 0)}>
                          {evaluation.sanitaryScore || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(evaluation.operationalScore || 0)}>
                          {evaluation.operationalScore || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(evaluation.technicalScore || 0)}>
                          {evaluation.technicalScore || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(evaluation.satisfactionScore || 0)}>
                          {evaluation.satisfactionScore || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getScoreColor(evaluation.overallScore || 0)}`}>
                          {evaluation.overallScore || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(evaluation.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No hay evaluaciones registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ConcessionairesTabbed() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConcessionaire, setSelectedConcessionaire] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("concessionaires");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar los concesionarios
  const { data: concessionaires = [], isLoading: isLoadingConcessionaires } = useQuery({
    queryKey: ["/api/concessionaires"],
    enabled: true,
  });

  // Crear concesionario
  const createConcessionaireMutation = useMutation({
    mutationFn: async (data: ConcessionaireFormValues) => {
      const response = await fetch("/api/concessionaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear el concesionario");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concessionaires"] });
      toast({
        title: "Éxito",
        description: "Concesionario creado correctamente",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el concesionario",
        variant: "destructive",
      });
    },
  });

  // Actualizar concesionario
  const updateConcessionaireMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ConcessionaireFormValues }) => {
      const response = await fetch(`/api/concessionaires/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el concesionario");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concessionaires"] });
      toast({
        title: "Éxito",
        description: "Concesionario actualizado correctamente",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedConcessionaire(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el concesionario",
        variant: "destructive",
      });
    },
  });

  // Formularios
  const createForm = useForm<ConcessionaireFormValues>({
    resolver: zodResolver(concessionaireSchema),
    defaultValues: {
      name: "",
      type: "persona_fisica",
      rfc: "",
      tax_address: "",
      legal_representative: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  const editForm = useForm<ConcessionaireFormValues>({
    resolver: zodResolver(concessionaireSchema),
    defaultValues: {
      name: "",
      type: "persona_fisica",
      rfc: "",
      tax_address: "",
      legal_representative: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  // Manejar envío del formulario de creación
  const onCreateSubmit = (data: ConcessionaireFormValues) => {
    createConcessionaireMutation.mutate(data);
  };

  // Manejar envío del formulario de edición
  const onEditSubmit = (data: ConcessionaireFormValues) => {
    if (selectedConcessionaire) {
      updateConcessionaireMutation.mutate({
        id: selectedConcessionaire.id,
        data,
      });
    }
  };

  // Abrir modal de edición
  const handleEdit = (concessionaire: any) => {
    setSelectedConcessionaire(concessionaire);
    editForm.reset({
      name: concessionaire.name || "",
      type: concessionaire.type || "persona_fisica",
      rfc: concessionaire.rfc || "",
      tax_address: concessionaire.tax_address || "",
      legal_representative: concessionaire.legal_representative || "",
      phone: concessionaire.phone || "",
      email: concessionaire.email || "",
      notes: concessionaire.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Suspendido</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filtrar concesionarios por término de búsqueda
  const filteredConcessionaires = searchTerm 
    ? concessionaires.filter((c: any) => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.rfc?.toLowerCase().includes(searchTerm.toLowerCase()))
    : concessionaires;

  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión de Concesionarios | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestión integral de concesionarios: datos, ubicaciones, finanzas y evaluaciones" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Concesionarios</h1>
            <p className="text-muted-foreground">
              Administra de forma integral todos los aspectos de los concesionarios
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="concessionaires" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Concesionarios
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Gestión Financiera
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Evaluaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="concessionaires" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar concesionarios por nombre o RFC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus size={16} />
                Nuevo Concesionario
              </Button>
            </div>

            {/* Lista de concesionarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  Concesionarios Registrados
                </CardTitle>
                <CardDescription>
                  Lista de todos los concesionarios autorizados para operar en los parques
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingConcessionaires ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Cargando concesionarios...</span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>RFC</TableHead>
                          <TableHead>Representante Legal</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(filteredConcessionaires) && filteredConcessionaires.length > 0 ? (
                          filteredConcessionaires.map((concessionaire: any) => (
                            <TableRow key={concessionaire.id}>
                              <TableCell className="font-medium">
                                {concessionaire.name}
                              </TableCell>
                              <TableCell>
                                {concessionaire.type === "persona_fisica" 
                                  ? "Persona Física" 
                                  : "Persona Moral"}
                              </TableCell>
                              <TableCell>{concessionaire.rfc}</TableCell>
                              <TableCell>{concessionaire.legal_representative || "N/A"}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {concessionaire.phone && <div>{concessionaire.phone}</div>}
                                  {concessionaire.email && <div className="text-muted-foreground">{concessionaire.email}</div>}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(concessionaire.status || "active")}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(concessionaire)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <History className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              {searchTerm ? "No se encontraron concesionarios" : "No hay concesionarios registrados"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="evaluations">
            <EvaluationsTab />
          </TabsContent>
        </Tabs>

        {/* Diálogo para crear nuevo concesionario */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Concesionario</DialogTitle>
              <DialogDescription>
                Ingresa la información básica del concesionario
              </DialogDescription>
            </DialogHeader>

            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del concesionario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="persona_fisica">Persona Física</SelectItem>
                            <SelectItem value="persona_moral">Persona Moral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC *</FormLabel>
                        <FormControl>
                          <Input placeholder="RFC del concesionario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="legal_representative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Representante Legal</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del representante legal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Teléfono de contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="tax_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Fiscal *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Dirección fiscal completa" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas adicionales..." 
                          className="resize-none" 
                          {...field} 
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
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createConcessionaireMutation.isPending}
                  >
                    {createConcessionaireMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Concesionario"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar concesionario */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Concesionario</DialogTitle>
              <DialogDescription>
                Modifica la información del concesionario
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del concesionario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="persona_fisica">Persona Física</SelectItem>
                            <SelectItem value="persona_moral">Persona Moral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC *</FormLabel>
                        <FormControl>
                          <Input placeholder="RFC del concesionario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="legal_representative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Representante Legal</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del representante legal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Teléfono de contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="tax_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Fiscal *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Dirección fiscal completa" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas adicionales..." 
                          className="resize-none" 
                          {...field} 
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
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedConcessionaire(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateConcessionaireMutation.isPending}
                  >
                    {updateConcessionaireMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Concesionario"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}