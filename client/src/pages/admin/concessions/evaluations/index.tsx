import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  ClipboardCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarHalf,
  FileText,
  Calendar,
  AlertTriangle,
  User,
  Info
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Esquema para validación del formulario de evaluaciones
const evaluationSchema = z.object({
  contractId: z.string().min(1, "Debes seleccionar un contrato"),
  evaluationDate: z.string().min(1, "La fecha de evaluación es obligatoria"),
  sanitaryRating: z.string().min(1, "La calificación sanitaria es obligatoria"),
  operationalRating: z.string().min(1, "La calificación operativa es obligatoria"),
  technicalRating: z.string().min(1, "La calificación técnica es obligatoria"),
  complianceRating: z.string().min(1, "La calificación de cumplimiento es obligatoria"),
  customerSatisfactionRating: z.string().min(1, "La calificación de satisfacción es obligatoria"),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  status: z.string().min(1, "El estado de la evaluación es obligatorio"),
  attachments: z.string().optional()
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function ConcessionEvaluations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de evaluaciones
  const { data: evaluations, isLoading: isLoadingEvaluations } = useQuery({
    queryKey: ["/api/concession-evaluations"],
  });

  // Obtener lista de contratos
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["/api/concession-contracts"],
  });

  // Formulario para crear una nueva evaluación
  const createForm = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      contractId: "",
      evaluationDate: "",
      sanitaryRating: "3",
      operationalRating: "3",
      technicalRating: "3",
      complianceRating: "3",
      customerSatisfactionRating: "3",
      findings: "",
      recommendations: "",
      followUpRequired: false,
      followUpDate: "",
      status: "draft",
      attachments: ""
    },
  });

  // Formulario para editar una evaluación existente
  const editForm = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      contractId: "",
      evaluationDate: "",
      sanitaryRating: "",
      operationalRating: "",
      technicalRating: "",
      complianceRating: "",
      customerSatisfactionRating: "",
      findings: "",
      recommendations: "",
      followUpRequired: false,
      followUpDate: "",
      status: "",
      attachments: ""
    },
  });

  // Observar el campo followUpRequired para habilitar/deshabilitar la fecha de seguimiento
  const watchFollowUpRequired = createForm.watch("followUpRequired");
  const editWatchFollowUpRequired = editForm.watch("followUpRequired");

  // Mutación para crear una nueva evaluación
  const createMutation = useMutation({
    mutationFn: async (data: EvaluationFormValues) => {
      const response = await fetch("/api/concession-evaluations", {
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
        throw new Error(error.message || "Error al crear la evaluación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-evaluations"] });
      toast({
        title: "Evaluación creada",
        description: "La evaluación ha sido creada exitosamente.",
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

  // Mutación para actualizar una evaluación existente
  const updateMutation = useMutation({
    mutationFn: async (data: EvaluationFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/concession-evaluations/${id}`, {
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
        throw new Error(error.message || "Error al actualizar la evaluación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-evaluations"] });
      toast({
        title: "Evaluación actualizada",
        description: "La evaluación ha sido actualizada exitosamente.",
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

  // Mutación para eliminar una evaluación
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/concession-evaluations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("token") || "",
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-User-Role": localStorage.getItem("userRole") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar la evaluación");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concession-evaluations"] });
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación ha sido eliminada exitosamente.",
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

  const onCreateSubmit = (values: EvaluationFormValues) => {
    // Solo incluir followUpDate si followUpRequired es true
    const submitData = {
      ...values,
      followUpDate: values.followUpRequired ? values.followUpDate : undefined
    };
    createMutation.mutate(submitData);
  };

  const onEditSubmit = (values: EvaluationFormValues) => {
    if (currentEvaluation) {
      // Solo incluir followUpDate si followUpRequired es true
      const submitData = {
        ...values,
        followUpDate: values.followUpRequired ? values.followUpDate : undefined,
        id: currentEvaluation.id
      };
      updateMutation.mutate(submitData);
    }
  };

  const handleEdit = (evaluation: any) => {
    setCurrentEvaluation(evaluation);
    editForm.reset({
      contractId: evaluation.contractId.toString(),
      evaluationDate: evaluation.evaluationDate,
      sanitaryRating: evaluation.sanitaryRating.toString(),
      operationalRating: evaluation.operationalRating.toString(),
      technicalRating: evaluation.technicalRating.toString(),
      complianceRating: evaluation.complianceRating.toString(),
      customerSatisfactionRating: evaluation.customerSatisfactionRating.toString(),
      findings: evaluation.findings || "",
      recommendations: evaluation.recommendations || "",
      followUpRequired: evaluation.followUpRequired,
      followUpDate: evaluation.followUpDate || "",
      status: evaluation.status,
      attachments: evaluation.attachments?.join(", ") || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (evaluation: any) => {
    setCurrentEvaluation(evaluation);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (evaluation: any) => {
    setCurrentEvaluation(evaluation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentEvaluation) {
      deleteMutation.mutate(currentEvaluation.id);
    }
  };

  // Filtra las evaluaciones según términos de búsqueda y filtro de estado
  const filteredEvaluations = evaluations
    ? evaluations.filter((evaluation: any) => {
        const matchesSearch =
          searchTerm === "" ||
          evaluation.contractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.findings?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.recommendations?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          evaluation.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Función para obtener el nombre de contrato a partir de su ID
  const getContractName = (contractId: number) => {
    if (!contracts) return "Desconocido";
    const contract = contracts.find((c: any) => c.id === contractId);
    return contract ? `${contract.parkName} - ${contract.concessionTypeName}` : "Desconocido";
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case "pending_review":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente de revisión</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Aprobada</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Función para calcular la calificación promedio
  const calculateAverage = (evaluation: any) => {
    const ratings = [
      evaluation.sanitaryRating,
      evaluation.operationalRating,
      evaluation.technicalRating,
      evaluation.complianceRating,
      evaluation.customerSatisfactionRating
    ].filter(Boolean).map(Number);
    
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, val) => acc + val, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // Función para renderizar estrellas basadas en la calificación
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts;

  return (
    <AdminLayout>
      <Helmet>
        <title>Evaluación de Concesiones | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestiona las evaluaciones de cumplimiento de las concesiones en los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluación y Cumplimiento</h1>
            <p className="text-muted-foreground">
              Administra las evaluaciones, auditorías y verificación de cumplimiento de concesiones
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Nueva evaluación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear nueva evaluación</DialogTitle>
                <DialogDescription>
                  Introduce la información para la evaluación de concesión
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Información Básica</TabsTrigger>
                      <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4 py-4">
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
                                      {contract.parkName} - {contract.concessionTypeName}
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
                          name="evaluationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de evaluación</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
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
                                    <SelectValue placeholder="Selecciona estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="draft">Borrador</SelectItem>
                                  <SelectItem value="completed">Completada</SelectItem>
                                  <SelectItem value="pending_review">Pendiente de revisión</SelectItem>
                                  <SelectItem value="approved">Aprobada</SelectItem>
                                  <SelectItem value="rejected">Rechazada</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="findings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hallazgos</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe los hallazgos encontrados durante la evaluación" 
                                {...field} 
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="recommendations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recomendaciones</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Recomendaciones para mejorar o corregir problemas" 
                                {...field} 
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <FormField
                          control={createForm.control}
                          name="followUpRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </FormControl>
                              <FormLabel className="m-0">Requiere seguimiento</FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="followUpDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de seguimiento</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  disabled={!watchFollowUpRequired} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="attachments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anexos (URLs separadas por comas)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ej: https://url1.com, https://url2.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ingresa URLs separadas por comas para fotos o documentos adjuntos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="ratings" className="space-y-4 py-4">
                      <div className="space-y-4">
                        <FormField
                          control={createForm.control}
                          name="sanitaryRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Sanitaria (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona calificación" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                  <SelectItem value="2">2 - Deficiente</SelectItem>
                                  <SelectItem value="3">3 - Regular</SelectItem>
                                  <SelectItem value="4">4 - Bueno</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Evalúa las condiciones de higiene, salubridad y manejo de residuos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="operationalRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Operativa (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona calificación" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                  <SelectItem value="2">2 - Deficiente</SelectItem>
                                  <SelectItem value="3">3 - Regular</SelectItem>
                                  <SelectItem value="4">4 - Bueno</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Evalúa el funcionamiento diario, organización y horarios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="technicalRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Técnica (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona calificación" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                  <SelectItem value="2">2 - Deficiente</SelectItem>
                                  <SelectItem value="3">3 - Regular</SelectItem>
                                  <SelectItem value="4">4 - Bueno</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Evalúa la calidad técnica, equipamiento y mantenimiento
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="complianceRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación de Cumplimiento (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona calificación" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                  <SelectItem value="2">2 - Deficiente</SelectItem>
                                  <SelectItem value="3">3 - Regular</SelectItem>
                                  <SelectItem value="4">4 - Bueno</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Evalúa el cumplimiento contractual, permisos y requisitos legales
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="customerSatisfactionRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación de Satisfacción Ciudadana (1-5)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona calificación" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                  <SelectItem value="2">2 - Deficiente</SelectItem>
                                  <SelectItem value="3">3 - Regular</SelectItem>
                                  <SelectItem value="4">4 - Bueno</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Evalúa la experiencia y satisfacción de los usuarios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Guardando..." : "Guardar evaluación"}
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
              <CardTitle>Evaluaciones de concesiones</CardTitle>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Buscar evaluaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <ClipboardCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending_review">Pendientes de revisión</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </CardHeader>
          <CardContent>
            {isLoadingEvaluations ? (
              <div className="flex justify-center items-center h-40">
                <p>Cargando evaluaciones...</p>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No hay evaluaciones registradas</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron evaluaciones que coincidan con tu búsqueda o filtro" 
                    : "Comienza registrando la primera evaluación de concesión"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Seguimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation: any) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">{getContractName(evaluation.contractId)}</TableCell>
                      <TableCell>{formatDate(evaluation.evaluationDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(parseFloat(calculateAverage(evaluation)))}
                          <span className="text-sm">({calculateAverage(evaluation)})</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
                      <TableCell>
                        {evaluation.followUpRequired ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{formatDate(evaluation.followUpDate)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No requerido</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(evaluation)}
                            title="Ver detalles"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(evaluation)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={isDeleteDialogOpen && currentEvaluation?.id === evaluation.id} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(evaluation)}
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
                                  la evaluación del sistema.
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
        
        {/* Diálogo para editar evaluación */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar evaluación</DialogTitle>
              <DialogDescription>
                Modifica la información de la evaluación de concesión
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Información Básica</TabsTrigger>
                    <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 py-4">
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
                                    {contract.parkName} - {contract.concessionTypeName}
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
                        name="evaluationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de evaluación</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
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
                                  <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Borrador</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                                <SelectItem value="pending_review">Pendiente de revisión</SelectItem>
                                <SelectItem value="approved">Aprobada</SelectItem>
                                <SelectItem value="rejected">Rechazada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="findings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hallazgos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe los hallazgos encontrados durante la evaluación" 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="recommendations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recomendaciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recomendaciones para mejorar o corregir problemas" 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <FormField
                        control={editForm.control}
                        name="followUpRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormLabel className="m-0">Requiere seguimiento</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="followUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de seguimiento</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                disabled={!editWatchFollowUpRequired} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="attachments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anexos (URLs separadas por comas)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ej: https://url1.com, https://url2.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ingresa URLs separadas por comas para fotos o documentos adjuntos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="ratings" className="space-y-4 py-4">
                    <div className="space-y-4">
                      <FormField
                        control={editForm.control}
                        name="sanitaryRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación Sanitaria (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona calificación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                <SelectItem value="2">2 - Deficiente</SelectItem>
                                <SelectItem value="3">3 - Regular</SelectItem>
                                <SelectItem value="4">4 - Bueno</SelectItem>
                                <SelectItem value="5">5 - Excelente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Evalúa las condiciones de higiene, salubridad y manejo de residuos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="operationalRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación Operativa (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona calificación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                <SelectItem value="2">2 - Deficiente</SelectItem>
                                <SelectItem value="3">3 - Regular</SelectItem>
                                <SelectItem value="4">4 - Bueno</SelectItem>
                                <SelectItem value="5">5 - Excelente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Evalúa el funcionamiento diario, organización y horarios
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="technicalRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación Técnica (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona calificación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                <SelectItem value="2">2 - Deficiente</SelectItem>
                                <SelectItem value="3">3 - Regular</SelectItem>
                                <SelectItem value="4">4 - Bueno</SelectItem>
                                <SelectItem value="5">5 - Excelente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Evalúa la calidad técnica, equipamiento y mantenimiento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="complianceRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación de Cumplimiento (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona calificación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                <SelectItem value="2">2 - Deficiente</SelectItem>
                                <SelectItem value="3">3 - Regular</SelectItem>
                                <SelectItem value="4">4 - Bueno</SelectItem>
                                <SelectItem value="5">5 - Excelente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Evalúa el cumplimiento contractual, permisos y requisitos legales
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="customerSatisfactionRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación de Satisfacción Ciudadana (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona calificación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Muy deficiente</SelectItem>
                                <SelectItem value="2">2 - Deficiente</SelectItem>
                                <SelectItem value="3">3 - Regular</SelectItem>
                                <SelectItem value="4">4 - Bueno</SelectItem>
                                <SelectItem value="5">5 - Excelente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Evalúa la experiencia y satisfacción de los usuarios
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Guardando cambios..." : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo para ver detalles de la evaluación */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la evaluación</DialogTitle>
              <DialogDescription>
                Información completa de la evaluación de concesión
              </DialogDescription>
            </DialogHeader>
            {currentEvaluation && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contrato</p>
                    <p className="font-medium">{getContractName(currentEvaluation.contractId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div>{getStatusBadge(currentEvaluation.status)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de evaluación</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{formatDate(currentEvaluation.evaluationDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Evaluador</p>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{currentEvaluation.evaluatorId 
                        ? `ID: ${currentEvaluation.evaluatorId}` 
                        : "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Calificaciones</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-muted p-3 rounded-md">
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">Sanitaria</p>
                      <div className="text-lg font-semibold">{currentEvaluation.sanitaryRating}/5</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">Operativa</p>
                      <div className="text-lg font-semibold">{currentEvaluation.operationalRating}/5</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">Técnica</p>
                      <div className="text-lg font-semibold">{currentEvaluation.technicalRating}/5</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">Cumplimiento</p>
                      <div className="text-lg font-semibold">{currentEvaluation.complianceRating}/5</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">Satisfacción</p>
                      <div className="text-lg font-semibold">{currentEvaluation.customerSatisfactionRating}/5</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Calificación promedio:</p>
                    <div className="flex items-center gap-2">
                      {renderStars(parseFloat(calculateAverage(currentEvaluation)))}
                      <span className="font-semibold">{calculateAverage(currentEvaluation)}</span>
                    </div>
                  </div>
                </div>
                
                {currentEvaluation.findings && (
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Hallazgos</h3>
                    <p className="p-3 bg-muted rounded-md text-sm">
                      {currentEvaluation.findings}
                    </p>
                  </div>
                )}
                
                {currentEvaluation.recommendations && (
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Recomendaciones</h3>
                    <p className="p-3 bg-muted rounded-md text-sm">
                      {currentEvaluation.recommendations}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Seguimiento</h3>
                  {currentEvaluation.followUpRequired ? (
                    <div className="flex gap-2 items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <p>Requiere seguimiento para el {formatDate(currentEvaluation.followUpDate)}</p>
                    </div>
                  ) : (
                    <p>No requiere seguimiento</p>
                  )}
                </div>
                
                {currentEvaluation.attachments && currentEvaluation.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Anexos</h3>
                    <div className="space-y-2">
                      {currentEvaluation.attachments.map((url: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Anexo {idx + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p>ID de evaluación: {currentEvaluation.id}</p>
                  <p>Fecha de registro: {formatDate(currentEvaluation.createdAt)}</p>
                  <p>Última actualización: {formatDate(currentEvaluation.updatedAt)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}