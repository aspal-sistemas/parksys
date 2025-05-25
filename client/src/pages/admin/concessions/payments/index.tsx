import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Download,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
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
  paymentDate: z.string().min(1, "La fecha de pago es obligatoria"),
  amount: z.string().min(1, "El monto del pago es obligatorio"),
  paymentType: z.string().min(1, "El tipo de pago es obligatorio"),
  paymentStatus: z.string().min(1, "El estado del pago es obligatorio"),
  invoiceNumber: z.string().optional(),
  invoiceUrl: z.string().optional(),
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
      paymentDate: "",
      amount: "",
      paymentType: "monthly",
      paymentStatus: "pending",
      invoiceNumber: "",
      invoiceUrl: "",
      notes: ""
    },
  });

  // Formulario para editar un pago existente
  const editForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractId: "",
      paymentDate: "",
      amount: "",
      paymentType: "",
      paymentStatus: "",
      invoiceNumber: "",
      invoiceUrl: "",
      notes: ""
    },
  });

  // Mutación para crear un nuevo pago
  const createMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const response = await fetch("/api/concession-payments", {
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
        throw new Error(error.message || "Error al crear el pago");
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
      const response = await fetch(`/api/concession-payments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
        body: JSON.stringify(updateData),
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
      paymentDate: payment.paymentDate,
      amount: payment.amount.toString(),
      paymentType: payment.paymentType,
      paymentStatus: payment.paymentStatus,
      invoiceNumber: payment.invoiceNumber || "",
      invoiceUrl: payment.invoiceUrl || "",
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
          payment.contractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          payment.paymentStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Función para obtener el nombre de contrato a partir de su ID
  const getContractName = (contractId: number) => {
    if (!contracts) return "Desconocido";
    const contract = contracts.find((c: any) => c.id === contractId);
    return contract ? `${contract.parkName} - ${contract.concessionaireName}` : "Desconocido";
  };

  // Función para formatear fechas
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

  // Función para obtener el badge de estado de pago
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Función para obtener el nombre del tipo de pago
  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case "monthly":
        return "Mensual";
      case "quarterly":
        return "Trimestral";
      case "biannual":
        return "Semestral";
      case "annual":
        return "Anual";
      case "one_time":
        return "Único";
      case "variable":
        return "Variable";
      default:
        return type;
    }
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts;

  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión Financiera de Concesiones | ParquesMX</title>
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
              Administra los pagos, facturación y control financiero de las concesiones
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Registrar pago
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
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
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de pago</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Monto del pago" 
                              step="0.01"
                              {...field} 
                            />
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
                          <FormLabel>Tipo de pago</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Mensual</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="biannual">Semestral</SelectItem>
                              <SelectItem value="annual">Anual</SelectItem>
                              <SelectItem value="one_time">Único</SelectItem>
                              <SelectItem value="variable">Variable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="overdue">Vencido</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                              <SelectItem value="refunded">Reembolsado</SelectItem>
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
                          <FormLabel>Número de factura (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Número o referencia de factura" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="invoiceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de factura (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="URL del documento de factura" {...field} />
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
                        <FormLabel>Notas (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones o notas adicionales" 
                            {...field} 
                            className="min-h-[100px]"
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
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center mb-2">
              <CardTitle>Historial de pagos</CardTitle>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filtrar por estado:</span>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="refunded">Reembolsados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <div className="flex justify-center items-center h-40">
                <p>Cargando pagos...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No hay pagos registrados</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron pagos que coincidan con tu búsqueda o filtro" 
                    : "Comienza registrando el primer pago de concesión"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{getContractName(payment.contractId)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{formatAmount(payment.amount)}</TableCell>
                      <TableCell>{getPaymentTypeName(payment.paymentType)}</TableCell>
                      <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                      <TableCell>
                        {payment.invoiceNumber ? (
                          <Badge variant="outline">{payment.invoiceNumber}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(payment)}
                            title="Ver detalles"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(payment)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={isDeleteDialogOpen && currentPayment?.id === payment.id} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(payment)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente
                                  el registro del pago del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>
                                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Diálogo para editar pago */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar registro de pago</DialogTitle>
              <DialogDescription>
                Modifica la información del pago de concesión
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
                    control={editForm.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de pago</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Monto del pago" 
                            step="0.01"
                            {...field} 
                          />
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
                        <FormLabel>Tipo de pago</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Mensual</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="biannual">Semestral</SelectItem>
                            <SelectItem value="annual">Anual</SelectItem>
                            <SelectItem value="one_time">Único</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="overdue">Vencido</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
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
                        <FormLabel>Número de factura (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Número o referencia de factura" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="invoiceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de factura (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="URL del documento de factura" {...field} />
                        </FormControl>
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
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones o notas adicionales" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Guardando cambios..." : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo para ver detalles del pago */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del pago</DialogTitle>
              <DialogDescription>
                Información completa del registro de pago
              </DialogDescription>
            </DialogHeader>
            {currentPayment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contrato</p>
                    <p className="font-medium">{getContractName(currentPayment.contractId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monto</p>
                    <p className="font-medium text-lg">{formatAmount(currentPayment.amount)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de pago</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{formatDate(currentPayment.paymentDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className="mt-1">
                      {getStatusBadge(currentPayment.paymentStatus)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de pago</p>
                    <div className="flex items-center mt-1">
                      <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{getPaymentTypeName(currentPayment.paymentType)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Factura</p>
                    <p className="mt-1">
                      {currentPayment.invoiceNumber || "No disponible"}
                    </p>
                  </div>
                </div>
                
                {currentPayment.invoiceUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground">Documento de factura</p>
                    <div className="mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2" 
                        onClick={() => window.open(currentPayment.invoiceUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                        Ver factura
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentPayment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="mt-1 p-2 bg-muted rounded-md text-sm">
                      {currentPayment.notes}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p>ID de registro: {currentPayment.id}</p>
                  <p>Fecha de registro: {formatDate(currentPayment.createdAt)}</p>
                  {currentPayment.createdById && (
                    <p>Registrado por: ID {currentPayment.createdById}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}