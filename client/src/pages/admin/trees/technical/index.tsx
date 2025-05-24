import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TreeDeciduous, AlertTriangle, Wrench, Clock, CalendarCheck2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

// Tipo para los árboles, incluyendo sus evaluaciones de riesgo e intervenciones
type Tree = {
  id: number;
  species_id: number;
  park_id: number;
  latitude: string;
  longitude: string;
  height: number;
  trunk_diameter: number;
  health_status: string;
  condition: string;
  location_description?: string;
  notes?: string;
  species?: {
    id: number;
    common_name: string;
    scientific_name: string;
    image_url?: string;
  };
  park?: {
    id: number;
    name: string;
  };
  lastRiskAssessment?: {
    id: number;
    assessmentDate: string;
    methodology: string;
    riskLevel: string;
    assessedBy: string;
  };
  lastIntervention?: {
    id: number;
    interventionType: string;
    subType: string;
    status: string;
    priority: string;
    completedDate: string | null;
  };
  pendingInterventionsCount: number;
  highRiskCount: number;
};

// Tipo para las evaluaciones de riesgo
type RiskAssessment = {
  id: number;
  treeId: number;
  assessmentDate: string;
  methodology: string;
  assessedBy: string;
  riskLevel: string;
  likelihoodOfFailure: string;
  consequenceOfFailure: string;
  targetRating: string;
  recommendedActions: string;
  timeframe: string;
  notes?: string;
  attachments?: string;
};

// Tipo para las intervenciones
type Intervention = {
  id: number;
  treeId: number;
  interventionType: string;
  subType: string;
  priority: string;
  status: string;
  justification: string;
  plannedDate: string | null;
  completedDate: string | null;
  performedBy: string | null;
  notes?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
};

// Constantes para opciones de selección
const RISK_LEVELS = [
  { value: "bajo", label: "Bajo" },
  { value: "moderado", label: "Moderado" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const METHODOLOGIES = [
  { value: "traq", label: "TRAQ" },
  { value: "qtra", label: "QTRA" },
  { value: "simple", label: "Evaluación Simple" },
  { value: "otro", label: "Otro" },
];

const INTERVENTION_TYPES = [
  { value: "poda", label: "Poda" },
  { value: "retiro", label: "Retiro" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "sustitucion", label: "Sustitución" },
  { value: "reforestacion", label: "Reforestación" },
];

const INTERVENTION_SUBTYPES = [
  // Poda
  { value: "poda_sanitaria", label: "Poda Sanitaria", parentType: "poda" },
  { value: "poda_estructural", label: "Poda Estructural", parentType: "poda" },
  { value: "poda_despeje", label: "Poda de Despeje", parentType: "poda" },
  { value: "poda_reduccion", label: "Poda de Reducción", parentType: "poda" },
  { value: "poda_estetica", label: "Poda Estética", parentType: "poda" },
  
  // Retiro
  { value: "retiro_riesgo", label: "Retiro por Riesgo", parentType: "retiro" },
  { value: "retiro_muerte", label: "Retiro por Muerte", parentType: "retiro" },
  { value: "retiro_interferencia", label: "Retiro por Interferencia", parentType: "retiro" },
  { value: "retiro_enfermedad", label: "Retiro por Enfermedad", parentType: "retiro" },
  
  // Tratamiento
  { value: "tratamiento_fitosanitario", label: "Tratamiento Fitosanitario", parentType: "tratamiento" },
  { value: "endoterapia", label: "Endoterapia", parentType: "tratamiento" },
  { value: "tratamiento_heridas", label: "Tratamiento de Heridas", parentType: "tratamiento" },
  { value: "tratamiento_suelo", label: "Tratamiento de Suelo", parentType: "tratamiento" },
];

const INTERVENTION_PRIORITIES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const INTERVENTION_STATUS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "programada", label: "Programada" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

// Obtener el color de fondo para el nivel de riesgo
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "bajo":
      return "bg-green-100 text-green-800";
    case "moderado":
      return "bg-yellow-100 text-yellow-800";
    case "alto":
      return "bg-orange-100 text-orange-800";
    case "critico":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener el color para la prioridad de la intervención
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "baja":
      return "bg-blue-100 text-blue-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "alta":
      return "bg-orange-100 text-orange-800";
    case "urgente":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener el color para el estado de la intervención
const getStatusColor = (status: string) => {
  switch (status) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "programada":
      return "bg-blue-100 text-blue-800";
    case "en_proceso":
      return "bg-purple-100 text-purple-800";
    case "completada":
      return "bg-green-100 text-green-800";
    case "cancelada":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Formatear fecha para mostrar en la interfaz
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function TreeTechnicalManagement() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [parkFilter, setParkFilter] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("");
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [activeTab, setActiveTab] = useState("risk-assessments");
  const [showAddRiskDialog, setShowAddRiskDialog] = useState(false);
  const [showAddInterventionDialog, setShowAddInterventionDialog] = useState(false);

  // Consulta para obtener todos los árboles con sus evaluaciones técnicas
  const { data: trees, isLoading, error, refetch } = useQuery<{ data: Tree[] }>({
    queryKey: ["/api/trees"],
    select: (response) => response,
  });

  // Consulta para obtener parques para el filtro
  const { data: parks } = useQuery<{ data: any[] }>({
    queryKey: ["/api/parks"],
    select: (response) => response,
  });

  // Consulta para obtener evaluaciones de riesgo del árbol seleccionado
  const { data: riskAssessments, refetch: refetchRiskAssessments } = useQuery<{ data: RiskAssessment[] }>({
    queryKey: ["/api/trees", selectedTree?.id, "risk-assessments"],
    enabled: !!selectedTree,
    select: (response) => response,
  });

  // Consulta para obtener intervenciones del árbol seleccionado
  const { data: interventions, refetch: refetchInterventions } = useQuery<{ data: Intervention[] }>({
    queryKey: ["/api/trees", selectedTree?.id, "interventions"],
    enabled: !!selectedTree,
    select: (response) => response,
  });

  // Filtrar árboles según los criterios
  const filteredTrees = trees?.data?.filter((tree) => {
    const matchesSearch = 
      tree.id.toString().includes(searchTerm.toLowerCase()) ||
      tree.species?.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tree.park?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPark = parkFilter ? tree.park_id === parseInt(parkFilter) : true;
    const matchesRiskLevel = riskLevelFilter ? 
      (tree.lastRiskAssessment?.riskLevel === riskLevelFilter) : true;
    
    return matchesSearch && matchesPark && matchesRiskLevel;
  });

  // Ordenar árboles por prioridad (primero los de alto riesgo, luego los de intervenciones pendientes)
  const sortedTrees = [...(filteredTrees || [])].sort((a, b) => {
    // Primero por nivel de riesgo (crítico > alto > moderado > bajo)
    const riskOrder: Record<string, number> = { 
      critico: 0, alto: 1, moderado: 2, bajo: 3, undefined: 4 
    };
    
    const aRiskLevel = a.lastRiskAssessment?.riskLevel || "undefined";
    const bRiskLevel = b.lastRiskAssessment?.riskLevel || "undefined";
    
    if (riskOrder[aRiskLevel] !== riskOrder[bRiskLevel]) {
      return riskOrder[aRiskLevel] - riskOrder[bRiskLevel];
    }
    
    // Luego por número de intervenciones pendientes
    return (b.pendingInterventionsCount || 0) - (a.pendingInterventionsCount || 0);
  });

  // Función para ver detalles de un árbol
  const handleViewTree = (tree: Tree) => {
    setSelectedTree(tree);
  };

  // Función para cerrar el panel de detalles
  const handleCloseDetails = () => {
    setSelectedTree(null);
    setActiveTab("risk-assessments");
  };

  // Renderizar la lista de árboles
  const renderTreeList = () => {
    if (isLoading) {
      return <div className="flex justify-center p-8">Cargando árboles...</div>;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los árboles. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      );
    }

    if (!sortedTrees?.length) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <TreeDeciduous className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No se encontraron árboles</h3>
          <p className="text-sm text-gray-500 mt-2">
            No hay árboles que coincidan con tus criterios de búsqueda.
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableCaption>Lista de árboles para gestión técnica</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Parque</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Riesgo</TableHead>
            <TableHead>Intervenciones Pendientes</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrees.map((tree) => (
            <TableRow key={tree.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{tree.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {tree.species?.image_url ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tree.species.image_url} alt={tree.species.common_name} />
                      <AvatarFallback>{tree.species.common_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <TreeDeciduous className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <div>{tree.species?.common_name}</div>
                    <div className="text-xs text-gray-500 italic">{tree.species?.scientific_name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{tree.park?.name}</TableCell>
              <TableCell>
                <Badge variant={tree.health_status === "bueno" ? "outline" : "secondary"}>
                  {tree.health_status}
                </Badge>
              </TableCell>
              <TableCell>
                {tree.lastRiskAssessment ? (
                  <Badge className={getRiskLevelColor(tree.lastRiskAssessment.riskLevel)}>
                    {tree.lastRiskAssessment.riskLevel.toUpperCase()}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sin evaluar</Badge>
                )}
              </TableCell>
              <TableCell>
                {tree.pendingInterventionsCount > 0 ? (
                  <Badge variant="destructive">{tree.pendingInterventionsCount}</Badge>
                ) : (
                  <Badge variant="outline">0</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleViewTree(tree)}>
                  Ver detalles
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Renderizar los detalles del árbol seleccionado
  const renderTreeDetails = () => {
    if (!selectedTree) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Árbol #{selectedTree.id}</h2>
            <p className="text-gray-500">
              {selectedTree.species?.common_name} ({selectedTree.species?.scientific_name})
            </p>
          </div>
          <Button variant="outline" onClick={handleCloseDetails}>
            Volver a la lista
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Parque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{selectedTree.park?.name}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Estado de Salud</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg font-medium">
                {selectedTree.health_status}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Nivel de Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTree.lastRiskAssessment ? (
                <Badge className={`text-lg ${getRiskLevelColor(selectedTree.lastRiskAssessment.riskLevel)}`}>
                  {selectedTree.lastRiskAssessment.riskLevel.toUpperCase()}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-lg">Sin evaluar</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="risk-assessments" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Evaluaciones de Riesgo
            </TabsTrigger>
            <TabsTrigger value="interventions" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Intervenciones
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="risk-assessments" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historial de Evaluaciones de Riesgo</h3>
              <Dialog open={showAddRiskDialog} onOpenChange={setShowAddRiskDialog}>
                <DialogTrigger asChild>
                  <Button>Nueva Evaluación</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nueva Evaluación de Riesgo</DialogTitle>
                    <DialogDescription>
                      Registra una nueva evaluación de riesgo para el árbol #{selectedTree.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessmentDate">Fecha de Evaluación</Label>
                        <Input id="assessmentDate" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="methodology">Metodología</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona metodología" />
                          </SelectTrigger>
                          <SelectContent>
                            {METHODOLOGIES.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="assessedBy">Evaluado por</Label>
                      <Input id="assessedBy" placeholder="Nombre del evaluador" required />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {RISK_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="likelihoodOfFailure">Probabilidad de Falla</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="improbable">Improbable</SelectItem>
                            <SelectItem value="posible">Posible</SelectItem>
                            <SelectItem value="probable">Probable</SelectItem>
                            <SelectItem value="inminente">Inminente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="consequenceOfFailure">Consecuencia de Falla</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="insignificante">Insignificante</SelectItem>
                            <SelectItem value="menor">Menor</SelectItem>
                            <SelectItem value="significante">Significante</SelectItem>
                            <SelectItem value="severo">Severo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recommendedActions">Acciones Recomendadas</Label>
                      <Input id="recommendedActions" placeholder="Acciones recomendadas" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas Adicionales</Label>
                      <Input id="notes" placeholder="Notas y observaciones" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddRiskDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      // Aquí iría la lógica para guardar la evaluación
                      toast({
                        title: "Evaluación registrada",
                        description: "La evaluación de riesgo ha sido registrada exitosamente.",
                      });
                      setShowAddRiskDialog(false);
                      // Recargar datos
                      setTimeout(() => {
                        refetchRiskAssessments();
                        refetch();
                      }, 500);
                    }}>Guardar Evaluación</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {riskAssessments?.data?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Metodología</TableHead>
                    <TableHead>Evaluador</TableHead>
                    <TableHead>Nivel de Riesgo</TableHead>
                    <TableHead>Acciones Recomendadas</TableHead>
                    <TableHead className="text-right">Opciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskAssessments.data.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                      <TableCell>{assessment.methodology}</TableCell>
                      <TableCell>{assessment.assessedBy}</TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                          {assessment.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {assessment.recommendedActions || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Este árbol no tiene evaluaciones de riesgo registradas.
                  </p>
                  <Button className="mt-4" onClick={() => setShowAddRiskDialog(true)}>
                    Registrar Primera Evaluación
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="interventions" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historial de Intervenciones</h3>
              <Dialog open={showAddInterventionDialog} onOpenChange={setShowAddInterventionDialog}>
                <DialogTrigger asChild>
                  <Button>Nueva Intervención</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nueva Intervención</DialogTitle>
                    <DialogDescription>
                      Registra una nueva intervención para el árbol #{selectedTree.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="interventionType">Tipo de Intervención</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERVENTION_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subType">Subtipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona subtipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERVENTION_SUBTYPES
                              .filter(subtype => subtype.parentType === "poda") // Por defecto muestra los de poda
                              .map(subtype => (
                                <SelectItem key={subtype.value} value={subtype.value}>
                                  {subtype.label}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERVENTION_PRIORITIES.map(priority => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERVENTION_STATUS.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="justification">Justificación</Label>
                      <Input id="justification" placeholder="Motivo de la intervención" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plannedDate">Fecha Programada</Label>
                        <Input id="plannedDate" type="date" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="performedBy">Responsable</Label>
                        <Input id="performedBy" placeholder="Persona o equipo responsable" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas Adicionales</Label>
                      <Input id="notes" placeholder="Notas y observaciones" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddInterventionDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      // Aquí iría la lógica para guardar la intervención
                      toast({
                        title: "Intervención registrada",
                        description: "La intervención ha sido registrada exitosamente.",
                      });
                      setShowAddInterventionDialog(false);
                      // Recargar datos
                      setTimeout(() => {
                        refetchInterventions();
                        refetch();
                      }, 500);
                    }}>Guardar Intervención</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {interventions?.data?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead>Fecha Completada</TableHead>
                    <TableHead className="text-right">Opciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.data.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell>
                        <div>
                          <div>{INTERVENTION_TYPES.find(t => t.value === intervention.interventionType)?.label}</div>
                          <div className="text-xs text-gray-500">
                            {INTERVENTION_SUBTYPES.find(st => st.value === intervention.subType)?.label}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(intervention.priority)}>
                          {intervention.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(intervention.status)}>
                          {intervention.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(intervention.plannedDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(intervention.completedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Ver Detalles</Button>
                          {intervention.status !== "completada" && intervention.status !== "cancelada" && (
                            <Button variant="secondary" size="sm">Actualizar Estado</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <Wrench className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Este árbol no tiene intervenciones registradas.
                  </p>
                  <Button className="mt-4" onClick={() => setShowAddInterventionDialog(true)}>
                    Programar Primera Intervención
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container py-6">
      <Helmet>
        <title>Gestión Técnica de Árboles - ParquesMX</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión Técnica de Árboles</h1>
        <p className="text-gray-500 mt-1">
          Evaluaciones de riesgo, planificación e implementación de intervenciones
        </p>
      </div>

      {!selectedTree ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/3">
              <Label htmlFor="search" className="sr-only">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por código, especie o parque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/3">
              <Label htmlFor="park-filter" className="sr-only">Filtrar por Parque</Label>
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por parque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los parques</SelectItem>
                  {parks?.data?.map((park) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:w-1/3">
              <Label htmlFor="risk-filter" className="sr-only">Filtrar por Nivel de Riesgo</Label>
              <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por nivel de riesgo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los niveles</SelectItem>
                  {RISK_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {renderTreeList()}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            {renderTreeDetails()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}