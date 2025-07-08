import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  ClockIcon,
  Download,
  Receipt
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Esquema para validación del formulario de pagos
const paymentSchema = z.object({
  contractId: z.string().min(1, "Debes seleccionar un contrato"),
  amount: z.string().min(1, "El monto es obligatorio"),
  paymentDate: z.string().min(1, "La fecha de pago es obligatoria"),
  paymentType: z.string().min(1, "El tipo de pago es obligatorio"),
  invoiceNumber: z.string().optional(),
  invoiceFile: z.instanceof(File).optional(),
  status: z.enum(["paid", "pending", "late", "cancelled"]).default("paid"),
  notes: z.string().optional()
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function ConcessionPayments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de pagos
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/concession-payments"],
  });

  // Obtener lista de contratos
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["/api/concession-contracts"],
  });

  // Formulario para crear un nuevo pago
  const createForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractId: "",
      amount: "",
      paymentDate: "",
      paymentType: "",
      invoiceNumber: "",
      status: "paid",
      notes: ""
    },
  });

  // Formulario para editar un pago existente
  const editForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractId: "",
      amount: "",
      paymentDate: "",
      paymentType: "",
      invoiceNumber: "",
      status: "paid",
      notes: ""
    },
  });

  // Mutación para crear un nuevo pago
  const createMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'invoiceFile') {
          formData.append(key, value?.toString() || '');
        }
      });
      
      // Agregar el archivo de factura si existe
      if (data.invoiceFile) {
        formData.append('invoiceFile', data.invoiceFile);
      }
      
      const response = await fetch("/api/concession-payments", {
        method: "POST",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al registrar el pago");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-payments"] });
      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente.",
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar un pago existente
  const updateMutation = useMutation({
    mutationFn: async (data: PaymentFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'invoiceFile') {
          formData.append(key, value?.toString() || '');
        }
      });
      
      // Agregar el archivo de factura si existe
      if (data.invoiceFile) {
        formData.append('invoiceFile', data.invoiceFile);
      }
      
      const response = await fetch(`/api/concession-payments/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el pago");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-payments"] });
      toast({
        title: "Pago actualizado",
        description: "El pago ha sido actualizado exitosamente.",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar un pago
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/concession-payments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el pago");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-payments"] });
      toast({
        title: "Pago eliminado",
        description: "El pago ha sido eliminado exitosamente.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (values: PaymentFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: PaymentFormValues) => {
    if (currentPayment) {
      updateMutation.mutate({
        ...values,
        id: currentPayment.id,
      });
    }
  };

  const handleEdit = (payment: any) => {
    setCurrentPayment(payment);
    editForm.reset({
      contractId: payment.contractId.toString(),
      amount: payment.amount.toString(),
      paymentDate: payment.paymentDate,
      paymentType: payment.paymentType,
      invoiceNumber: payment.invoiceNumber || "",
      status: payment.status,
      notes: payment.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (payment: any) => {
    setCurrentPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (payment: any) => {
    setCurrentPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentPayment) {
      deleteMutation.mutate(currentPayment.id);
    }
  };

  // Filtra los pagos según términos de búsqueda y filtro de estado
  const filteredPayments = payments
    ? payments.filter((payment: any) => {
        const matchesSearch =
          searchTerm === "" ||
          payment.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.concessionaireName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          payment.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Función para formatear las fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear montos
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "late":
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts;

  // Calcular el total de pagos
  const totalPayments = filteredPayments ? filteredPayments.reduce((total: number, payment: any) => {
    return payment.status === 'paid' ? total + Number(payment.amount) : total;
  }, 0) : 0;

  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión Financiera de Concesiones | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestiona los pagos y finanzas de las concesiones en los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera de Concesiones</h1>
            <p className="text-muted-foreground">
              Administra los pagos y finanzas de las concesiones en los parques
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Registrar pago
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar nuevo pago</DialogTitle>
                <DialogDescription>
                  Introduce la información del pago de concesión
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="contractId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contrato de Concesión</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isFormDataLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un contrato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingContracts ? (
                              <SelectItem value="loading">Cargando contratos...</SelectItem>
                            ) : contracts && contracts.length > 0 ? (
                              contracts.map((contract: any) => (
                                <SelectItem key={contract.id} value={contract.id.toString()}>
                                  {contract.parkName} - {contract.concessionaireName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="empty">No hay contratos disponibles</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto (MXN)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 5000.00" {...field} type="number" min="0" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Pago</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pago</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="transfer">Transferencia</SelectItem>
                              <SelectItem value="cash">Efectivo</SelectItem>
                              <SelectItem value="check">Cheque</SelectItem>
                              <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                              <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="late">Atrasado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Factura/CFDI</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. A-12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="invoiceFile"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Archivo de Factura</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="file" 
                              accept=".pdf,.xml"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cualquier información adicional sobre el pago" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Guardando..." : "Registrar pago"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalPayments)}</div>
              <p className="text-xs text-muted-foreground">
                Total de pagos recibidos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pagos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPayments && filteredPayments.filter((p: any) => p.status === "paid").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pagos registrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPayments && filteredPayments.filter((p: any) => p.status === "pending" || p.status === "late").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pagos por cobrar
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pagos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="paid">Pagados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="late">Atrasados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Registro de Pagos</CardTitle>
            <CardDescription>
              Historial de pagos de las concesiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concesionario</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPayments ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando pagos...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments && filteredPayments.length > 0 ? (
                    filteredPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.concessionaireName}</TableCell>
                        <TableCell>{payment.parkName}</TableCell>
                        <TableCell>{formatAmount(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.invoiceNumber ? (
                            <div className="flex items-center gap-1">
                              <Receipt size={14} className="text-gray-500" />
                              <span className="text-sm">{payment.invoiceNumber}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(payment)}
                              title="Ver detalles"
                            >
                              <FileText size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(payment)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(payment)}
                              title="Eliminar"
                              className="text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay pagos registrados. Registra un pago usando el botón "Registrar pago".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para ver detalles de pago */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Pago</DialogTitle>
          </DialogHeader>
          {currentPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Contrato</h3>
                  <p className="text-sm text-gray-500">{currentPayment.contractName || "No disponible"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Parque</h3>
                  <p className="text-sm text-gray-500">{currentPayment.parkName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Concesionario</h3>
                  <p className="text-sm text-gray-500">{currentPayment.concessionaireName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Fecha de Pago</h3>
                  <p className="text-sm text-gray-500">{formatDate(currentPayment.paymentDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Monto</h3>
                  <p className="text-sm text-gray-500">{formatAmount(currentPayment.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Tipo de Pago</h3>
                  <p className="text-sm text-gray-500">
                    {currentPayment.paymentType === "transfer" ? "Transferencia" :
                     currentPayment.paymentType === "cash" ? "Efectivo" :
                     currentPayment.paymentType === "check" ? "Cheque" :
                     currentPayment.paymentType === "credit_card" ? "Tarjeta de Crédito" :
                     currentPayment.paymentType === "debit_card" ? "Tarjeta de Débito" :
                     "Otro"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Estado</h3>
                  <div className="mt-1">{getStatusBadge(currentPayment.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Factura/CFDI</h3>
                  <p className="text-sm text-gray-500">{currentPayment.invoiceNumber || "No disponible"}</p>
                </div>
              </div>
              
              {currentPayment.invoiceUrl && (
                <div>
                  <h3 className="text-sm font-medium">Archivo de Factura</h3>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={currentPayment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                        <Download size={14} />
                        Descargar factura
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium">Notas</h3>
                <p className="text-sm text-gray-500">{currentPayment.notes || "Sin notas adicionales"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar pago */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Pago</DialogTitle>
            <DialogDescription>
              Modifica la información del pago
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrato de Concesión</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={true} // No permitir cambiar el contrato
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingContracts ? (
                          <SelectItem value="loading">Cargando contratos...</SelectItem>
                        ) : contracts && contracts.length > 0 ? (
                          contracts.map((contract: any) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.parkName} - {contract.concessionaireName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty">No hay contratos disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto (MXN)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 5000.00" {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Pago</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pago</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                          <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Pagado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="late">Atrasado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Factura/CFDI</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. A-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="invoiceFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Archivo de Factura</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="file" 
                          accept=".pdf,.xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {currentPayment?.invoiceUrl ? "Ya hay un archivo cargado. Sube uno nuevo para reemplazarlo." : ""}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cualquier información adicional sobre el pago" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}