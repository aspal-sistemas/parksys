import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TreeDeciduous, LineChart, CloudRain, Waves, Wind, Thermometer, Leaf, AlertTriangle } from "lucide-react";

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

// Tipo simplificado para servicios ambientales
type EnvironmentalService = {
  id: number;
  treeId: number;
  calculationDate: string;
  calculationMethod: string;
  co2SequestrationAnnual: number;
  co2SequestrationLifetime: number;
  pollutantRemovalNO2: number;
  pollutantRemovalSO2: number;
  pollutantRemovalPM25: number;
  stormwaterInterception: number;
  shadeAreaSummer: number;
  temperatureReduction: number;
  totalEconomicBenefitAnnual: number;
  notes?: string;
};

// Constantes para opciones de selección
const CALCULATION_METHODS = [
  { value: "itree", label: "i-Tree" },
  { value: "citygreen", label: "CityGreen" },
  { value: "manual", label: "Cálculo Manual" },
  { value: "estimate", label: "Estimación Basada en Especie" },
];

// Formatear números con unidades
const formatNumber = (value: number | null | undefined, unit: string = "", decimals: number = 2) => {
  if (value === null || value === undefined) return "N/A";
  // Asegurarse de que value sea un número antes de usar toFixed
  if (typeof value !== 'number') {
    return `${value} ${unit}`;
  }
  return `${value.toFixed(decimals)} ${unit}`;
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

export default function TreeEnvironmentalManagement() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [parkFilter, setParkFilter] = useState("");
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);

  // Datos de prueba para la interfaz mientras se desarrolla el backend
  const mockEnvironmentalServices: EnvironmentalService[] = [
    {
      id: 1,
      treeId: 1,
      calculationDate: "2023-04-10",
      calculationMethod: "itree",
      co2SequestrationAnnual: 25.7,
      co2SequestrationLifetime: 1285,
      pollutantRemovalNO2: 0.25,
      pollutantRemovalSO2: 0.18,
      pollutantRemovalPM25: 0.32,
      stormwaterInterception: 2.8,
      shadeAreaSummer: 42.5,
      temperatureReduction: 1.2,
      totalEconomicBenefitAnnual: 156.87,
      notes: "Cálculo basado en condiciones climáticas locales y estado actual del árbol."
    },
    {
      id: 2,
      treeId: 1,
      calculationDate: "2022-05-15",
      calculationMethod: "citygreen",
      co2SequestrationAnnual: 23.4,
      co2SequestrationLifetime: 1170,
      pollutantRemovalNO2: 0.22,
      pollutantRemovalSO2: 0.15,
      pollutantRemovalPM25: 0.28,
      stormwaterInterception: 2.5,
      shadeAreaSummer: 38.2,
      temperatureReduction: 1.1,
      totalEconomicBenefitAnnual: 142.50,
      notes: "Evaluación anterior a la poda de mantenimiento."
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

  // Ordenar árboles por tamaño (como ejemplo)
  const sortedTrees = [...(filteredTrees || [])].sort((a, b) => {
    if (a.height !== b.height) {
      return ((b.height || 0) - (a.height || 0));
    }
    return ((b.trunk_diameter || 0) - (a.trunk_diameter || 0));
  });

  // Función para ver detalles de un árbol
  const handleViewTree = (tree: Tree) => {
    setSelectedTree(tree);
    // En una implementación real, aquí cargaríamos los datos de servicios ambientales
  };

  // Función para cerrar el panel de detalles
  const handleCloseDetails = () => {
    setSelectedTree(null);
  };

  // Función para registrar un nuevo cálculo de servicios ambientales
  const handleAddEnvironmentalService = (formData: any) => {
    toast({
      title: "Cálculo ambiental registrado",
      description: "El cálculo de servicios ambientales ha sido registrado correctamente.",
    });
    setShowAddServiceDialog(false);
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
        <TableCaption>Lista de árboles para gestión ambiental</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Parque</TableHead>
            <TableHead>Altura</TableHead>
            <TableHead>Diámetro</TableHead>
            <TableHead>Último Cálculo</TableHead>
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
              <TableCell>{formatNumber(tree.height, "m")}</TableCell>
              <TableCell>{formatNumber(tree.trunk_diameter, "cm")}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  No calculado
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
              <CardTitle className="text-sm font-medium text-gray-500">Altura y Diámetro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-xs text-gray-500">Altura</p>
                  <p className="text-lg font-medium">{formatNumber(selectedTree.height, "m")}</p>
                </div>
                <div className="h-8 border-l border-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500">Diámetro</p>
                  <p className="text-lg font-medium">{formatNumber(selectedTree.trunk_diameter, "cm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Condición</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{selectedTree.condition || "No especificada"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Beneficios Ambientales Calculados */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Historial de Cálculos Ambientales</h3>
            <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Leaf className="h-4 w-4 mr-2" />
                  Nuevo Cálculo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Cálculo de Servicios Ambientales</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo cálculo de beneficios ambientales para el árbol #{selectedTree.id}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calculationDate">Fecha de Cálculo</Label>
                      <Input id="calculationDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calculationMethod">Metodología</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {CALCULATION_METHODS.map(method => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Secuestro de Carbono</h4>
                      <div className="space-y-2">
                        <Label htmlFor="co2SequestrationAnnual">Secuestro CO2 Anual (kg/año)</Label>
                        <Input id="co2SequestrationAnnual" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="co2SequestrationLifetime">Secuestro CO2 Vida Útil (kg)</Label>
                        <Input id="co2SequestrationLifetime" type="number" step="0.01" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Remoción de Contaminantes</h4>
                      <div className="space-y-2">
                        <Label htmlFor="pollutantRemovalNO2">Remoción NO2 (kg/año)</Label>
                        <Input id="pollutantRemovalNO2" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pollutantRemovalSO2">Remoción SO2 (kg/año)</Label>
                        <Input id="pollutantRemovalSO2" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pollutantRemovalPM25">Remoción PM2.5 (kg/año)</Label>
                        <Input id="pollutantRemovalPM25" type="number" step="0.01" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Agua y Temperatura</h4>
                      <div className="space-y-2">
                        <Label htmlFor="stormwaterInterception">Intercepción Agua Pluvial (m³/año)</Label>
                        <Input id="stormwaterInterception" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shadeAreaSummer">Área de Sombra Verano (m²)</Label>
                        <Input id="shadeAreaSummer" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperatureReduction">Reducción de Temperatura (°C)</Label>
                        <Input id="temperatureReduction" type="number" step="0.01" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Valor Económico</h4>
                      <div className="space-y-2">
                        <Label htmlFor="totalEconomicBenefitAnnual">Beneficio Económico Anual ($/año)</Label>
                        <Input id="totalEconomicBenefitAnnual" type="number" step="0.01" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observaciones</Label>
                    <textarea 
                      id="notes" 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Detalles del cálculo"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>Cancelar</Button>
                  <Button onClick={() => handleAddEnvironmentalService({})}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {mockEnvironmentalServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
              <Leaf className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Sin cálculos ambientales</h3>
              <p className="text-sm text-gray-500 mt-2">
                No hay cálculos de servicios ambientales registrados para este árbol.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {mockEnvironmentalServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {CALCULATION_METHODS.find(m => m.value === service.calculationMethod)?.label || service.calculationMethod}
                      </CardTitle>
                      <Badge variant="outline">
                        {formatDate(service.calculationDate)}
                      </Badge>
                    </div>
                    <CardDescription>{service.notes}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="shadow-none border">
                        <CardHeader className="py-2 px-4">
                          <CardTitle className="text-sm flex items-center">
                            <CloudRain className="h-4 w-4 mr-2 text-blue-500" />
                            Captura de CO2
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Anual:</span>
                            <span className="text-sm font-medium">{formatNumber(service.co2SequestrationAnnual, "kg/año")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Vida útil:</span>
                            <span className="text-sm font-medium">{formatNumber(service.co2SequestrationLifetime, "kg")}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-none border">
                        <CardHeader className="py-2 px-4">
                          <CardTitle className="text-sm flex items-center">
                            <Wind className="h-4 w-4 mr-2 text-green-500" />
                            Filtración de Contaminantes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">NO2:</span>
                            <span className="text-sm font-medium">{formatNumber(service.pollutantRemovalNO2, "kg/año")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">SO2:</span>
                            <span className="text-sm font-medium">{formatNumber(service.pollutantRemovalSO2, "kg/año")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">PM2.5:</span>
                            <span className="text-sm font-medium">{formatNumber(service.pollutantRemovalPM25, "kg/año")}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-none border">
                        <CardHeader className="py-2 px-4">
                          <CardTitle className="text-sm flex items-center">
                            <Waves className="h-4 w-4 mr-2 text-blue-500" />
                            Agua y Temperatura
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Intercepción:</span>
                            <span className="text-sm font-medium">{formatNumber(service.stormwaterInterception, "m³/año")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Sombra:</span>
                            <span className="text-sm font-medium">{formatNumber(service.shadeAreaSummer, "m²")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Reducción temp.:</span>
                            <span className="text-sm font-medium">{formatNumber(service.temperatureReduction, "°C")}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <LineChart className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-medium">Valor económico anual:</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatNumber(service.totalEconomicBenefitAnnual, "$")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Helmet>
        <title>Gestión Ambiental de Arbolado | ParquesMX</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión Ambiental de Arbolado</h1>
          <p className="text-gray-500 mt-1">
            Evalúa y gestiona los servicios ambientales proporcionados por árboles en parques
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/admin/trees/dashboard")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al Dashboard de Arbolado
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