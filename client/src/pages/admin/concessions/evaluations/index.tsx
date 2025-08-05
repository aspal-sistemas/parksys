import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { 
  ClipboardCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Thermometer,
  Download,
  Star,
  User
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
  CardFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Esquema para validación del formulario de evaluaciones
const evaluationSchema = z.object({
  contractId: z.string().min(1, "Debes seleccionar un contrato"),
  evaluationDate: z.string().min(1, "La fecha de evaluación es obligatoria"),
  sanitaryScore: z.string().min(1, "La calificación sanitaria es obligatoria"),
  operationalScore: z.string().min(1, "La calificación operativa es obligatoria"),
  technicalScore: z.string().min(1, "La calificación técnica es obligatoria"),
  customerSatisfactionScore: z.string().min(1, "La calificación de satisfacción es obligatoria"),
  observations: z.string().optional(),
  hasIncidents: z.boolean().default(false),
  incidentDescription: z.string().optional(),
  actionRequired: z.boolean().default(false),
  actionDescription: z.string().optional(),
  status: z.enum(["completed", "pending", "in_progress"]).default("completed"),
  attachments: z.instanceof(FileList).optional().transform(files => {
    if (!files || files.length === 0) return undefined;
    return Array.from(files);
  })
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
      evaluationDate: new Date().toISOString().split('T')[0],
      sanitaryScore: "",
      operationalScore: "",
      technicalScore: "",
      customerSatisfactionScore: "",
      observations: "",
      hasIncidents: false,
      incidentDescription: "",
      actionRequired: false,
      actionDescription: "",
      status: "completed"
    },
  });

  // Formulario para editar una evaluación existente
  const editForm = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      contractId: "",
      evaluationDate: "",
      sanitaryScore: "",
      operationalScore: "",
      technicalScore: "",
      customerSatisfactionScore: "",
      observations: "",
      hasIncidents: false,
      incidentDescription: "",
      actionRequired: false,
      actionDescription: "",
      status: "completed"
    },
  });

  // Mutación para crear una nueva evaluación
  const createMutation = useMutation({
    mutationFn: async (data: EvaluationFormValues) => {
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'attachments') {
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, value?.toString() || '');
          }
        }
      });
      
      // Agregar los archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        Array.from(data.attachments).forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }
      
      const response = await fetch("/api/concession-evaluations", {
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
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'attachments') {
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, value?.toString() || '');
          }
        }
      });
      
      // Agregar los archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        Array.from(data.attachments).forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }
      
      const response = await fetch(`/api/concession-evaluations/${id}`, {
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
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: EvaluationFormValues) => {
    if (currentEvaluation) {
      updateMutation.mutate({
        ...values,
        id: currentEvaluation.id,
      });
    }
  };

  const handleEdit = (evaluation: any) => {
    setCurrentEvaluation(evaluation);
    editForm.reset({
      contractId: evaluation.contractId.toString(),
      evaluationDate: evaluation.evaluationDate,
      sanitaryScore: evaluation.sanitaryScore.toString(),
      operationalScore: evaluation.operationalScore.toString(),
      technicalScore: evaluation.technicalScore.toString(),
      customerSatisfactionScore: evaluation.customerSatisfactionScore.toString(),
      observations: evaluation.observations || "",
      hasIncidents: evaluation.hasIncidents,
      incidentDescription: evaluation.incidentDescription || "",
      actionRequired: evaluation.actionRequired,
      actionDescription: evaluation.actionDescription || "",
      status: evaluation.status
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
          evaluation.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.concessionaireName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.evaluatorName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          evaluation.status === statusFilter;
        
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
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Función para obtener el color según la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  // Calcular el promedio de las puntuaciones
  const calculateAverageScore = (evaluation: any) => {
    const scores = [
      evaluation.sanitaryScore,
      evaluation.operationalScore,
      evaluation.technicalScore,
      evaluation.customerSatisfactionScore
    ];
    const validScores = scores.filter(score => !isNaN(Number(score)));
    if (validScores.length === 0) return 0;
    
    const sum = validScores.reduce((total, score) => total + Number(score), 0);
    return (sum / validScores.length).toFixed(1);
  };

  // Estado de carga de datos para el formulario
  const isFormDataLoading = isLoadingContracts;

  return (
    <AdminLayout>
      <Helmet>
        <title>Evaluación y Cumplimiento | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestiona la evaluación y cumplimiento de las concesiones en los parques" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluación y Cumplimiento</h1>
            <p className="text-muted-foreground">
              Administra las evaluaciones y el cumplimiento de las concesiones en los parques
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
                  Introduce la información de la evaluación de concesión
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Información Básica</TabsTrigger>
                      <TabsTrigger value="scores">Calificaciones</TabsTrigger>
                      <TabsTrigger value="incidents">Incidencias</TabsTrigger>
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
                          name="evaluationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Evaluación</FormLabel>
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
                                    <SelectValue placeholder="Selecciona un estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="completed">Completada</SelectItem>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="in_progress">En progreso</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={createForm.control}
                        name="observations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observaciones</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Observaciones generales sobre la evaluación" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="attachments"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Archivos Adjuntos</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="file" 
                                multiple
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    onChange(files);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Puedes adjuntar imágenes, PDFs u otros documentos relevantes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="scores" className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="sanitaryScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Sanitaria (1-10)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  step="1" 
                                  placeholder="Ej. 8" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Evalúa la limpieza, higiene y condiciones sanitarias
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="operationalScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Operativa (1-10)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  step="1" 
                                  placeholder="Ej. 8" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Evalúa la eficiencia, orden y gestión operativa
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="technicalScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación Técnica (1-10)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  step="1" 
                                  placeholder="Ej. 8" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Evalúa el mantenimiento, equipos y aspectos técnicos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="customerSatisfactionScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Satisfacción del Cliente (1-10)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  step="1" 
                                  placeholder="Ej. 8" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Evalúa la calidad del servicio y satisfacción de usuarios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="incidents" className="space-y-4 py-4">
                      <FormField
                        control={createForm.control}
                        name="hasIncidents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                ¿Se detectaron incidencias?
                              </FormLabel>
                              <FormDescription>
                                Marca esta opción si se detectaron problemas o incumplimientos
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {createForm.watch("hasIncidents") && (
                        <FormField
                          control={createForm.control}
                          name="incidentDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción de Incidencias</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe las incidencias detectadas" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={createForm.control}
                        name="actionRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                ¿Se requiere acción?
                              </FormLabel>
                              <FormDescription>
                                Marca esta opción si se requieren acciones correctivas
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {createForm.watch("actionRequired") && (
                        <FormField
                          control={createForm.control}
                          name="actionDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción de Acciones Requeridas</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe las acciones correctivas requeridas" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Guardando..." : "Crear evaluación"}
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
              <CardTitle className="text-sm font-medium">Evaluaciones Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredEvaluations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones registradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Detectadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredEvaluations?.filter((e: any) => e.hasIncidents).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones con incidencias
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Acciones Requeridas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredEvaluations?.filter((e: any) => e.actionRequired).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones que requieren acción
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar evaluaciones..."
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
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Evaluaciones de Concesiones</CardTitle>
            <CardDescription>
              Historial de evaluaciones y cumplimiento de las concesiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concesionario</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Promedio</TableHead>
                    <TableHead>Incidencias</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEvaluations ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando evaluaciones...
                      </TableCell>
                    </TableRow>
                  ) : filteredEvaluations && filteredEvaluations.length > 0 ? (
                    filteredEvaluations.map((evaluation: any) => {
                      const averageScore = calculateAverageScore(evaluation);
                      const scoreColorClass = getScoreColor(Number(averageScore));
                      
                      return (
                        <TableRow key={evaluation.id}>
                          <TableCell>{evaluation.concessionaireName}</TableCell>
                          <TableCell>{evaluation.parkName}</TableCell>
                          <TableCell>{formatDate(evaluation.evaluationDate)}</TableCell>
                          <TableCell>
                            <span className={`font-bold ${scoreColorClass}`}>
                              {averageScore}/10
                            </span>
                          </TableCell>
                          <TableCell>
                            {evaluation.hasIncidents ? (
                              <Badge className="bg-red-100 text-red-800">Sí</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(evaluation)}
                                title="Ver detalles"
                              >
                                <FileText size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(evaluation)}
                                title="Editar"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(evaluation)}
                                title="Eliminar"
                                className="text-destructive"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay evaluaciones registradas. Crea una evaluación usando el botón "Nueva evaluación".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para ver detalles de evaluación */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Evaluación</DialogTitle>
          </DialogHeader>
          {currentEvaluation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Contrato</h3>
                  <p className="text-sm text-gray-500">{currentEvaluation.contractName || "No disponible"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Parque</h3>
                  <p className="text-sm text-gray-500">{currentEvaluation.parkName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Concesionario</h3>
                  <p className="text-sm text-gray-500">{currentEvaluation.concessionaireName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Fecha de Evaluación</h3>
                  <p className="text-sm text-gray-500">{formatDate(currentEvaluation.evaluationDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Evaluador</h3>
                  <p className="text-sm text-gray-500">{currentEvaluation.evaluatorName || "No especificado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Estado</h3>
                  <div className="mt-1">{getStatusBadge(currentEvaluation.status)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Calificaciones</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-50">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium">Sanitaria</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className={`text-xl font-bold ${getScoreColor(currentEvaluation.sanitaryScore)}`}>
                        {currentEvaluation.sanitaryScore}/10
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium">Operativa</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className={`text-xl font-bold ${getScoreColor(currentEvaluation.operationalScore)}`}>
                        {currentEvaluation.operationalScore}/10
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium">Técnica</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className={`text-xl font-bold ${getScoreColor(currentEvaluation.technicalScore)}`}>
                        {currentEvaluation.technicalScore}/10
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className={`text-xl font-bold ${getScoreColor(currentEvaluation.customerSatisfactionScore)}`}>
                        {currentEvaluation.customerSatisfactionScore}/10
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Promedio General</h3>
                <Card className="bg-gray-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">Calificación Promedio</span>
                    <span className={`text-2xl font-bold ${getScoreColor(Number(calculateAverageScore(currentEvaluation)))}`}>
                      {calculateAverageScore(currentEvaluation)}/10
                    </span>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Observaciones</h3>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
                  {currentEvaluation.observations || "Sin observaciones registradas"}
                </p>
              </div>
              
              {currentEvaluation.hasIncidents && (
                <div>
                  <h3 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Incidencias Detectadas
                  </h3>
                  <p className="text-sm text-gray-700 p-3 bg-red-50 rounded-md border border-red-100">
                    {currentEvaluation.incidentDescription || "No se especificaron detalles"}
                  </p>
                </div>
              )}
              
              {currentEvaluation.actionRequired && (
                <div>
                  <h3 className="font-medium mb-2 text-amber-600 flex items-center gap-2">
                    <ClipboardCheck size={16} />
                    Acciones Requeridas
                  </h3>
                  <p className="text-sm text-gray-700 p-3 bg-amber-50 rounded-md border border-amber-100">
                    {currentEvaluation.actionDescription || "No se especificaron detalles"}
                  </p>
                </div>
              )}
              
              {currentEvaluation.attachments && currentEvaluation.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Archivos Adjuntos</h3>
                  <div className="space-y-2">
                    {currentEvaluation.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <FileText size={16} className="text-gray-500" />
                        <span className="text-sm truncate">{attachment.filename}</span>
                        <Button variant="outline" size="sm" className="ml-auto" asChild>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <Download size={14} className="mr-1" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar evaluación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evaluación</DialogTitle>
            <DialogDescription>
              Modifica la información de la evaluación
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="scores">Calificaciones</TabsTrigger>
                  <TabsTrigger value="incidents">Incidencias</TabsTrigger>
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
                      name="evaluationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Evaluación</FormLabel>
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
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="completed">Completada</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in_progress">En progreso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones generales sobre la evaluación" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="attachments"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Archivos Adjuntos Adicionales</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="file" 
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                onChange(files);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {currentEvaluation?.attachments?.length > 0 
                            ? "Ya hay archivos adjuntos. Sube nuevos para añadirlos a los existentes." 
                            : "Puedes adjuntar imágenes, PDFs u otros documentos relevantes"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="scores" className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="sanitaryScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación Sanitaria (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              step="1" 
                              placeholder="Ej. 8" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Evalúa la limpieza, higiene y condiciones sanitarias
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="operationalScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación Operativa (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              step="1" 
                              placeholder="Ej. 8" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Evalúa la eficiencia, orden y gestión operativa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="technicalScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación Técnica (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              step="1" 
                              placeholder="Ej. 8" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Evalúa el mantenimiento, equipos y aspectos técnicos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="customerSatisfactionScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Satisfacción del Cliente (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              step="1" 
                              placeholder="Ej. 8" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Evalúa la calidad del servicio y satisfacción de usuarios
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="incidents" className="space-y-4 py-4">
                  <FormField
                    control={editForm.control}
                    name="hasIncidents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            ¿Se detectaron incidencias?
                          </FormLabel>
                          <FormDescription>
                            Marca esta opción si se detectaron problemas o incumplimientos
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {editForm.watch("hasIncidents") && (
                    <FormField
                      control={editForm.control}
                      name="incidentDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de Incidencias</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe las incidencias detectadas" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={editForm.control}
                    name="actionRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            ¿Se requiere acción?
                          </FormLabel>
                          <FormDescription>
                            Marca esta opción si se requieren acciones correctivas
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {editForm.watch("actionRequired") && (
                    <FormField
                      control={editForm.control}
                      name="actionDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de Acciones Requeridas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe las acciones correctivas requeridas" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>
              </Tabs>

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
              Esta acción eliminará permanentemente la evaluación y todos sus datos asociados.
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