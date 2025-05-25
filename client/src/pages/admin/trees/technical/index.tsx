import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TreeDeciduous, AlertTriangle, Wrench, Clock, CalendarCheck2, Flower2 } from "lucide-react";

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

// Tipo para los árboles adaptado a la estructura actual
type Tree = {
  id: number;
  species_id: number;
  park_id: number;
  latitude: string | null;
  longitude: string | null;
  height: number | null;
  trunk_diameter: number | null;
  health_status: string | null;
  condition: string | null;
  location_description?: string | null;
  notes?: string | null;
  species?: {
    id: number;
    common_name: string;
    scientific_name: string;
    image_url?: string | null;
  };
  park?: {
    id: number;
    name: string;
  };
};

// Tipo simplificado para evaluaciones de riesgo
type RiskAssessment = {
  id: number;
  treeId: number;
  assessmentDate: string;
  methodology: string;
  assessedBy: string;
  riskLevel: string;
  notes?: string;
};

// Tipo simplificado para intervenciones
type Intervention = {
  id: number;
  treeId: number;
  interventionType: string;
  priority: string;
  status: string;
  plannedDate: string | null;
  completedDate: string | null;
  notes?: string;
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

// Formatear números
const formatNumber = (value: number | null | undefined, unit: string = "") => {
  if (value === null || value === undefined) return "N/A";
  return `${value} ${unit}`;
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

  // Datos de prueba para la interfaz mientras se desarrolla el backend
  const mockRiskAssessments: RiskAssessment[] = [
    {
      id: 1,
      treeId: 1,
      assessmentDate: "2023-05-15",
      methodology: "traq",
      assessedBy: "Juan Pérez",
      riskLevel: "bajo",
      notes: "Árbol en buenas condiciones, no presenta riesgos significativos."
    },
    {
      id: 2,
      treeId: 1,
      assessmentDate: "2023-08-20",
      methodology: "qtra",
      assessedBy: "María López",
      riskLevel: "moderado",
      notes: "Se observa una rama con signos de deterioro que podría requerir poda preventiva."
    }
  ];

  const mockInterventions: Intervention[] = [
    {
      id: 1,
      treeId: 1,
      interventionType: "poda",
      priority: "media",
      status: "completada",
      plannedDate: "2023-09-10",
      completedDate: "2023-09-12",
      notes: "Poda de ramas con deterioro en el sector norte del árbol."
    },
    {
      id: 2,
      treeId: 1,
      interventionType: "tratamiento",
      priority: "alta",
      status: "pendiente",
      plannedDate: "2023-10-15",
      completedDate: null,
      notes: "Aplicación de tratamiento preventivo contra plagas."
    }
  ];

  // Consulta para obtener todos los árboles
  const { data: trees, isLoading, error } = useQuery<{ data: Tree[] }>({
    queryKey: ["/api/trees"],
    select: (response) => response,
  });

  // Consulta para obtener parques para el filtro
  const { data: parks } = useQuery<{ data: any[] }>({
    queryKey: ["/api/parks"],
    select: (response) => response,
  });

  // Filtrar árboles según los criterios
  const filteredTrees = trees?.data?.filter((tree) => {
    const matchesSearch = 
      tree.id.toString().includes(searchTerm.toLowerCase()) ||
      tree.species?.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tree.park?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPark = parkFilter ? tree.park_id === parseInt(parkFilter) : true;
    
    return matchesSearch && matchesPark;
  });

  // Ordenar árboles (por ID como ejemplo)
  const sortedTrees = [...(filteredTrees || [])].sort((a, b) => a.id - b.id);

  // Función para ver detalles de un árbol
  const handleViewTree = (tree: Tree) => {
    setSelectedTree(tree);
    // En una implementación real, aquí cargaríamos los datos de evaluaciones e intervenciones
  };

  // Función para cerrar el panel de detalles
  const handleCloseDetails = () => {
    setSelectedTree(null);
    setActiveTab("risk-assessments");
  };

  // Función para registrar una nueva evaluación de riesgo
  const handleAddRiskAssessment = (formData: any) => {
    toast({
      title: "Evaluación de riesgo registrada",
      description: "La evaluación ha sido registrada correctamente.",
    });
    setShowAddRiskDialog(false);
    // En una implementación real, aquí enviaríamos los datos al backend
  };

  // Función para registrar una nueva intervención
  const handleAddIntervention = (formData: any) => {
    toast({
      title: "Intervención registrada",
      description: "La intervención ha sido registrada correctamente.",
    });
    setShowAddInterventionDialog(false);
    // En una implementación real, aquí enviaríamos los datos al backend
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
            <TableHead>ID</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Parque</TableHead>
            <TableHead>Estado</TableHead>
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
                  {tree.health_status || "No especificado"}
                </Badge>
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
                {selectedTree.health_status || "No especificado"}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Condición</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg" variant="outline">
                {selectedTree.condition || "No evaluada"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="risk-assessments">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Evaluaciones de Riesgo
            </TabsTrigger>
            <TabsTrigger value="interventions">
              <Wrench className="h-4 w-4 mr-2" />
              Intervenciones
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="risk-assessments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historial de Evaluaciones de Riesgo</h3>
              <Dialog open={showAddRiskDialog} onOpenChange={setShowAddRiskDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Nueva Evaluación
                  </Button>
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
                        <Input id="assessmentDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="methodology">Metodología</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessedBy">Evaluado por</Label>
                        <Input id="assessedBy" placeholder="Nombre del evaluador" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observaciones</Label>
                      <textarea 
                        id="notes" 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        placeholder="Detalles de la evaluación"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddRiskDialog(false)}>Cancelar</Button>
                    <Button onClick={() => handleAddRiskAssessment({})}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {mockRiskAssessments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Sin evaluaciones de riesgo</h3>
                <p className="text-sm text-gray-500 mt-2">
                  No hay evaluaciones de riesgo registradas para este árbol.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockRiskAssessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                            {RISK_LEVELS.find(level => level.value === assessment.riskLevel)?.label || assessment.riskLevel}
                          </Badge>
                          <CardTitle className="text-base">
                            {METHODOLOGIES.find(method => method.value === assessment.methodology)?.label || assessment.methodology}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDate(assessment.assessmentDate)}
                        </div>
                      </div>
                      <CardDescription>
                        Evaluado por: {assessment.assessedBy}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{assessment.notes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="interventions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historial de Intervenciones</h3>
              <Dialog open={showAddInterventionDialog} onOpenChange={setShowAddInterventionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Wrench className="h-4 w-4 mr-2" />
                    Nueva Intervención
                  </Button>
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
                            <SelectValue placeholder="Seleccionar" />
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
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
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
                      <div className="space-y-2">
                        <Label htmlFor="plannedDate">Fecha Planificada</Label>
                        <Input id="plannedDate" type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observaciones</Label>
                      <textarea 
                        id="notes" 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        placeholder="Detalles de la intervención"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddInterventionDialog(false)}>Cancelar</Button>
                    <Button onClick={() => handleAddIntervention({})}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {mockInterventions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <Wrench className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Sin intervenciones</h3>
                <p className="text-sm text-gray-500 mt-2">
                  No hay intervenciones registradas para este árbol.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockInterventions.map((intervention) => (
                  <Card key={intervention.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(intervention.priority)}>
                            {INTERVENTION_PRIORITIES.find(p => p.value === intervention.priority)?.label || intervention.priority}
                          </Badge>
                          <CardTitle className="text-base">
                            {INTERVENTION_TYPES.find(t => t.value === intervention.interventionType)?.label || intervention.interventionType}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(intervention.status)}>
                          {INTERVENTION_STATUS.find(s => s.value === intervention.status)?.label || intervention.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <CalendarCheck2 className="h-3 w-3" /> Planificada: {formatDate(intervention.plannedDate)}
                        </span>
                        {intervention.completedDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Completada: {formatDate(intervention.completedDate)}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{intervention.notes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Helmet>
        <title>Gestión Técnica de Arbolado | ParquesMX</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión Técnica de Arbolado</h1>
          <p className="text-gray-500 mt-1">
            Administra evaluaciones de riesgo e intervenciones para árboles en parques
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/admin/trees")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al menú de Arbolado
        </Button>
      </div>

      {!selectedTree ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por ID, especie o parque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los parques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parks?.data?.map((park) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderTreeList()}
        </>
      ) : (
        renderTreeDetails()
      )}
    </div>
  );
}