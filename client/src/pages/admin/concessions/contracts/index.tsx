import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  FileUp,
  Building,
  User,
  Search
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Esquema para validación del formulario de contratos
const contractSchema = z.object({
  parkId: z.string().min(1, "Debes seleccionar un parque"),
  concessionaireId: z.string().min(1, "Debes seleccionar un concesionario"),
  concessionTypeId: z.string().min(1, "Debes seleccionar un tipo de concesión"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  fee: z.string().min(1, "El canon o tarifa es obligatorio"),
  exclusivityClauses: z.string().optional(),
  restrictions: z.string().optional(),
  contractFile: z.instanceof(File).optional(),
  status: z.enum(["active", "pending", "expired", "terminated"]).default("active"),
  hasExtension: z.boolean().default(false),
  extensionDate: z.string().optional(),
  notes: z.string().optional()
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function ConcessionContracts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de contratos
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["/api/concession-contracts"],
  });

  // Obtener lista de parques
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ["/api/parks/list"],
  });

  // Obtener lista de concesionarios
  const { data: concessionaires, isLoading: isLoadingConcessionaires } = useQuery({
    queryKey: ["/api/concessionaires"],
  });

  // Obtener lista de tipos de concesiones
  const { data: concessionTypes, isLoading: isLoadingConcessionTypes } = useQuery({
    queryKey: ["/api/concession-types"],
  });

  // Formulario para crear un nuevo contrato
  const createForm = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      parkId: "",
      concessionaireId: "",
      concessionTypeId: "",
      startDate: "",
      endDate: "",
      fee: "",
      exclusivityClauses: "",
      restrictions: "",
      status: "active",
      hasExtension: false,
      extensionDate: "",
      notes: ""
    },
  });

  // Formulario para editar un contrato existente
  const editForm = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      parkId: "",
      concessionaireId: "",
      concessionTypeId: "",
      startDate: "",
      endDate: "",
      fee: "",
      exclusivityClauses: "",
      restrictions: "",
      status: "active",
      hasExtension: false,
      extensionDate: "",
      notes: ""
    },
  });

  // Mutación para crear un nuevo contrato
  const createMutation = useMutation({
    mutationFn: async (data: ContractFormValues) => {
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'contractFile') {
          formData.append(key, value?.toString() || '');
        }
      });
      
      // Agregar el archivo del contrato si existe
      if (data.contractFile) {
        formData.append('contractFile', data.contractFile);
      }
      
      const response = await fetch("/api/concession-contracts", {
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
        throw new Error(error.message || "Error al crear el contrato");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-contracts"] });
      toast({
        title: "Contrato creado",
        description: "El contrato ha sido creado exitosamente.",
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

  // Mutación para actualizar un contrato existente
  const updateMutation = useMutation({
    mutationFn: async (data: ContractFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'contractFile') {
          formData.append(key, value?.toString() || '');
        }
      });
      
      // Agregar el archivo del contrato si existe
      if (data.contractFile) {
        formData.append('contractFile', data.contractFile);
      }
      
      const response = await fetch(`/api/concession-contracts/${id}`, {
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
        throw new Error(error.message || "Error al actualizar el contrato");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-contracts"] });
      toast({
        title: "Contrato actualizado",
        description: "El contrato ha sido actualizado exitosamente.",
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

  // Mutación para eliminar un contrato
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/concession-contracts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el contrato");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-contracts"] });
      toast({
        title: "Contrato eliminado",
        description: "El contrato ha sido eliminado exitosamente.",
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

  const onCreateSubmit = (values: ContractFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: ContractFormValues) => {
    if (currentContract) {
      updateMutation.mutate({
        ...values,
        id: currentContract.id,
      });
    }
  };

  const handleEdit = (contract: any) => {
    setCurrentContract(contract);
    editForm.reset({
      parkId: contract.parkId.toString(),
      concessionaireId: contract.concessionaireId.toString(),
      concessionTypeId: contract.concessionTypeId.toString(),
      startDate: contract.startDate,
      endDate: contract.endDate,
      fee: contract.fee.toString(),
      exclusivityClauses: contract.exclusivityClauses || "",
      restrictions: contract.restrictions || "",
      status: contract.status,
      hasExtension: contract.hasExtension,
      extensionDate: contract.extensionDate || "",
      notes: contract.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (contract: any) => {
    setCurrentContract(contract);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (contract: any) => {
    setCurrentContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentContract) {
      deleteMutation.mutate(currentContract.id);
    }
  };

  // Filtra los contratos según términos de búsqueda y filtro de estado
  const filteredContracts = contracts
    ? contracts.filter((contract: any) => {
        const matchesSearch =
          searchTerm === "" ||
          contract.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.concessionaireName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.concessionTypeName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          contract.status === statusFilter;
        
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

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case "terminated":
        return <Badge className="bg-gray-100 text-gray-800">Terminado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingParks || isLoadingConcessionaires || isLoadingConcessionTypes;

  return (
    <AdminLayout>
      <Helmet>
        <title>Contratos de Concesiones | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestiona los contratos de concesiones para los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contratos de Concesiones</h1>
            <p className="text-muted-foreground">
              Administra los contratos de concesiones para los espacios de los parques
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nuevo contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear nuevo contrato de concesión</DialogTitle>
                <DialogDescription>
                  Introduce la información del nuevo contrato de concesión
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Información Básica</TabsTrigger>
                      <TabsTrigger value="details">Detalles</TabsTrigger>
                      <TabsTrigger value="document">Documento</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="parkId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parque / Espacio</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isFormDataLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un parque" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingParks ? (
                                    <SelectItem value="">Cargando parques...</SelectItem>
                                  ) : parks && parks.length > 0 ? (
                                    parks.map((park: any) => (
                                      <SelectItem key={park.id} value={park.id.toString()}>
                                        {park.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="">No hay parques disponibles</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="concessionaireId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Concesionario</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isFormDataLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un concesionario" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingConcessionaires ? (
                                    <SelectItem value="">Cargando concesionarios...</SelectItem>
                                  ) : concessionaires && concessionaires.length > 0 ? (
                                    concessionaires.map((concessionaire: any) => (
                                      <SelectItem key={concessionaire.id} value={concessionaire.id.toString()}>
                                        {concessionaire.name || concessionaire.fullName}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="">No hay concesionarios disponibles</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="concessionTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Concesión</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isFormDataLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un tipo de concesión" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingConcessionTypes ? (
                                  <SelectItem value="">Cargando tipos de concesiones...</SelectItem>
                                ) : concessionTypes && concessionTypes.length > 0 ? (
                                  concessionTypes.map((type: any) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                      {type.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="">No hay tipos de concesiones disponibles</SelectItem>
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
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de inicio</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de vencimiento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado del contrato</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el estado del contrato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="expired">Vencido</SelectItem>
                                <SelectItem value="terminated">Terminado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4 py-4">
                      <FormField
                        control={createForm.control}
                        name="fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canon o tarifa (MXN)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 5000.00" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ingresa la cantidad en pesos mexicanos sin símbolos ni separadores
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="exclusivityClauses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cláusulas de exclusividad</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe las cláusulas de exclusividad que aplican a esta concesión" 
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="restrictions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restricciones</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe las restricciones que aplican a esta concesión" 
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="hasExtension"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  className="w-4 h-4 mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Tiene prórroga</FormLabel>
                                <FormDescription>
                                  Marcar si el contrato tiene una prórroga aprobada
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {createForm.watch("hasExtension") && (
                          <FormField
                            control={createForm.control}
                            name="extensionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha de prórroga</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas adicionales</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Notas adicionales sobre el contrato" 
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="document" className="space-y-4 py-4">
                      <FormField
                        control={createForm.control}
                        name="contractFile"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Documento del contrato (PDF)</FormLabel>
                            <FormControl>
                              <div className="flex flex-col space-y-2">
                                <Input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      onChange(file);
                                    }
                                  }}
                                  {...fieldProps}
                                />
                                <FormDescription>
                                  Sube el contrato en formato PDF. Tamaño máximo: 10MB.
                                </FormDescription>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-800">Información importante</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              El documento del contrato debe estar firmado por todas las partes involucradas
                              y debe contener todos los términos y condiciones acordados.
                            </p>
                            <p className="text-sm text-amber-700 mt-2">
                              La subida del documento es obligatoria para formalizar el contrato de concesión.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

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
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Guardando...' : 'Guardar contrato'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por parque o concesionario..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                  <SelectItem value="terminated">Terminados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contratos de concesiones</CardTitle>
            <CardDescription>
              Lista de contratos de concesiones para los espacios de los parques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingContracts ? (
              <div className="flex justify-center items-center py-8">
                <p>Cargando contratos...</p>
              </div>
            ) : filteredContracts && filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parque / Espacio</TableHead>
                      <TableHead>Concesionario</TableHead>
                      <TableHead>Tipo de concesión</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Canon (MXN)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract: any) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.parkName}</TableCell>
                        <TableCell>{contract.concessionaireName}</TableCell>
                        <TableCell>{contract.concessionTypeName}</TableCell>
                        <TableCell>{formatDate(contract.startDate)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(contract.endDate)}</span>
                            {contract.hasExtension && (
                              <span className="text-xs text-muted-foreground mt-1">
                                Prórroga: {formatDate(contract.extensionDate)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${parseFloat(contract.fee).toLocaleString('es-MX')}</TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(contract)}
                              title="Ver detalles"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(contract)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog open={isDeleteDialogOpen && currentContract?.id === contract.id} onOpenChange={setIsDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(contract)}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el contrato de concesión
                                    y no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={confirmDelete}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            {contract.contractFileUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(contract.contractFileUrl, '_blank')}
                                title="Descargar contrato"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay contratos de concesión</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No se encontraron contratos con los criterios de búsqueda aplicados."
                    : "Aún no hay contratos de concesión registrados en el sistema."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear nuevo contrato
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para ver detalles del contrato */}
      {currentContract && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del contrato de concesión</DialogTitle>
              <DialogDescription>
                Información completa del contrato de concesión
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{currentContract.parkName}</h3>
                    <p className="text-sm text-muted-foreground">Espacio concesionado</p>
                  </div>
                  {getStatusBadge(currentContract.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Concesionario
                  </h4>
                  <p>{currentContract.concessionaireName}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    Tipo de concesión
                  </h4>
                  <p>{currentContract.concessionTypeName}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Fecha de inicio
                  </h4>
                  <p>{formatDate(currentContract.startDate)}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Fecha de vencimiento
                  </h4>
                  <p>{formatDate(currentContract.endDate)}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    Canon o tarifa
                  </h4>
                  <p>${parseFloat(currentContract.fee).toLocaleString('es-MX')} MXN</p>
                </div>
              </div>
              
              {currentContract.hasExtension && (
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Prórroga de contrato</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Este contrato cuenta con una prórroga hasta:
                        <span className="font-medium"> {formatDate(currentContract.extensionDate)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(currentContract.exclusivityClauses || currentContract.restrictions) && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    {currentContract.exclusivityClauses && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Cláusulas de exclusividad</h4>
                        <p className="text-sm">{currentContract.exclusivityClauses}</p>
                      </div>
                    )}
                    
                    {currentContract.restrictions && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Restricciones</h4>
                        <p className="text-sm">{currentContract.restrictions}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {currentContract.notes && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Notas adicionales</h4>
                    <p className="text-sm">{currentContract.notes}</p>
                  </div>
                </>
              )}
              
              {currentContract.contractFileUrl && (
                <>
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Documento del contrato
                      </h4>
                      <p className="text-sm">Contrato digital en formato PDF</p>
                    </div>
                    <Button onClick={() => window.open(currentContract.contractFileUrl, '_blank')} className="gap-2">
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} variant="outline">
                Cerrar
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEdit(currentContract);
              }} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para editar contrato */}
      {currentContract && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar contrato de concesión</DialogTitle>
              <DialogDescription>
                Modifica la información del contrato de concesión
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Información Básica</TabsTrigger>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="document">Documento</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="parkId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parque / Espacio</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isFormDataLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un parque" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingParks ? (
                                  <SelectItem value="">Cargando parques...</SelectItem>
                                ) : parks && parks.length > 0 ? (
                                  parks.map((park: any) => (
                                    <SelectItem key={park.id} value={park.id.toString()}>
                                      {park.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="">No hay parques disponibles</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="concessionaireId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Concesionario</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isFormDataLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un concesionario" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingConcessionaires ? (
                                  <SelectItem value="">Cargando concesionarios...</SelectItem>
                                ) : concessionaires && concessionaires.length > 0 ? (
                                  concessionaires.map((concessionaire: any) => (
                                    <SelectItem key={concessionaire.id} value={concessionaire.id.toString()}>
                                      {concessionaire.name || concessionaire.fullName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="">No hay concesionarios disponibles</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="concessionTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Concesión</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isFormDataLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo de concesión" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingConcessionTypes ? (
                                <SelectItem value="">Cargando tipos de concesiones...</SelectItem>
                              ) : concessionTypes && concessionTypes.length > 0 ? (
                                concessionTypes.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="">No hay tipos de concesiones disponibles</SelectItem>
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
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de inicio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de vencimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado del contrato</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el estado del contrato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="expired">Vencido</SelectItem>
                              <SelectItem value="terminated">Terminado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4 py-4">
                    <FormField
                      control={editForm.control}
                      name="fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canon o tarifa (MXN)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 5000.00" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ingresa la cantidad en pesos mexicanos sin símbolos ni separadores
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="exclusivityClauses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cláusulas de exclusividad</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe las cláusulas de exclusividad que aplican a esta concesión" 
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="restrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restricciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe las restricciones que aplican a esta concesión" 
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="hasExtension"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="w-4 h-4 mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Tiene prórroga</FormLabel>
                              <FormDescription>
                                Marcar si el contrato tiene una prórroga aprobada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {editForm.watch("hasExtension") && (
                        <FormField
                          control={editForm.control}
                          name="extensionDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de prórroga</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas adicionales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas adicionales sobre el contrato" 
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="document" className="space-y-4 py-4">
                    {currentContract.contractFileUrl && (
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg mb-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Documento actual</h4>
                          <p className="text-sm text-muted-foreground">
                            Ya hay un contrato cargado en el sistema
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(currentContract.contractFileUrl, '_blank')}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Ver documento
                        </Button>
                      </div>
                    )}
                    
                    <FormField
                      control={editForm.control}
                      name="contractFile"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Actualizar documento del contrato (PDF)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                {...fieldProps}
                              />
                              <FormDescription>
                                {currentContract.contractFileUrl 
                                  ? "Sube un nuevo archivo para reemplazar el documento actual" 
                                  : "Sube el contrato en formato PDF. Tamaño máximo: 10MB."}
                              </FormDescription>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Actualizar contrato'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}