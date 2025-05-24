import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TreeDeciduous, LineChart, CloudRain, Waves, Wind, Thermometer, Leaf } from "lucide-react";

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

// Tipo para los árboles, incluyendo sus servicios ambientales
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
  latestEnvironmentalService?: {
    id: number;
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
  };
};

// Tipo para los servicios ambientales
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
  energySavingsValue: number;
  totalEconomicBenefitAnnual: number;
  totalEconomicBenefitLifetime: number;
  notes?: string;
};

// Constantes para opciones de selección
const CALCULATION_METHODS = [
  { value: "formula_basica", label: "Fórmula Básica" },
  { value: "itree", label: "i-Tree" },
  { value: "otro", label: "Otro" },
];

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

// Formatear número para mostrar en la interfaz
const formatNumber = (value: number | null | undefined, unit: string = "") => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toLocaleString("es-MX", { maximumFractionDigits: 2 })} ${unit}`;
};

// Componente para mostrar un valor ambiental con icono
const EnvironmentalValueCard = ({ 
  icon, 
  title, 
  value, 
  unit, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number | null | undefined; 
  unit: string;
  description: string;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <div className="rounded-full bg-green-100 p-2">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatNumber(value, unit)}
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default function TreeEnvironmentalManagement() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [parkFilter, setParkFilter] = useState("");
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showAddCalculationDialog, setShowAddCalculationDialog] = useState(false);

  // Consulta para obtener todos los árboles con sus servicios ambientales
  const { data: trees, isLoading, error, refetch } = useQuery<{ data: Tree[] }>({
    queryKey: ["/api/trees"],
    select: (response) => response,
  });

  // Consulta para obtener parques para el filtro
  const { data: parks } = useQuery<{ data: any[] }>({
    queryKey: ["/api/parks"],
    select: (response) => response,
  });

  // Consulta para obtener servicios ambientales del árbol seleccionado
  const { data: environmentalServices, refetch: refetchEnvironmentalServices } = useQuery<{ data: EnvironmentalService[] }>({
    queryKey: ["/api/trees", selectedTree?.id, "environmental-services"],
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
    
    return matchesSearch && matchesPark;
  });

  // Ordenar árboles por tamaño (altura y diámetro) y condición
  const sortedTrees = [...(filteredTrees || [])].sort((a, b) => {
    // Por altura
    if (a.height !== b.height) {
      return (b.height || 0) - (a.height || 0);
    }
    
    // Por diámetro
    if (a.trunk_diameter !== b.trunk_diameter) {
      return (b.trunk_diameter || 0) - (a.trunk_diameter || 0);
    }
    
    // Por condición (considerando mejor condición los árboles en mejor estado)
    const conditionOrder: Record<string, number> = {
      "bueno": 0, "regular": 1, "malo": 2, "critico": 3, undefined: 4
    };
    const aCondition = a.condition || "undefined";
    const bCondition = b.condition || "undefined";
    return conditionOrder[aCondition] - conditionOrder[bCondition];
  });

  // Función para ver detalles de un árbol
  const handleViewTree = (tree: Tree) => {
    setSelectedTree(tree);
  };

  // Función para cerrar el panel de detalles
  const handleCloseDetails = () => {
    setSelectedTree(null);
  };

  // Renderizar la lista de árboles
  const renderTreeList = () => {
    if (isLoading) {
      return <div className="flex justify-center p-8">Cargando árboles...</div>;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
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
            <TableHead>Código</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Parque</TableHead>
            <TableHead>Altura (m)</TableHead>
            <TableHead>Diámetro (cm)</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead>CO₂ Anual (kg/año)</TableHead>
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
                {tree.latestEnvironmentalService ? (
                  formatDate(tree.latestEnvironmentalService.calculationDate)
                ) : (
                  <Badge variant="outline">Sin cálculos</Badge>
                )}
              </TableCell>
              <TableCell>
                {tree.latestEnvironmentalService ? (
                  formatNumber(tree.latestEnvironmentalService.co2SequestrationAnnual, "kg/año")
                ) : (
                  "N/A"
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
            <h3 className="text-xl font-semibold">Beneficios Ambientales</h3>
            <Dialog open={showAddCalculationDialog} onOpenChange={setShowAddCalculationDialog}>
              <DialogTrigger asChild>
                <Button>
                  <LineChart className="h-4 w-4 mr-2" />
                  Nuevo Cálculo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
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
                      <Input id="calculationDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calculationMethod">Método de Cálculo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona método" />
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
                  
                  <h4 className="text-sm font-semibold pt-2">Captura de CO₂</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="co2SequestrationAnnual">Anual (kg/año)</Label>
                      <Input id="co2SequestrationAnnual" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="co2SequestrationLifetime">Total Estimado (kg)</Label>
                      <Input id="co2SequestrationLifetime" type="number" step="0.01" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold pt-2">Filtración de Contaminantes</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pollutantRemovalNO2">NO₂ (g/año)</Label>
                      <Input id="pollutantRemovalNO2" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pollutantRemovalSO2">SO₂ (g/año)</Label>
                      <Input id="pollutantRemovalSO2" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pollutantRemovalPM25">PM2.5 (g/año)</Label>
                      <Input id="pollutantRemovalPM25" type="number" step="0.01" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold pt-2">Agua e Impacto Climático</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stormwaterInterception">Intercepción Agua (L/año)</Label>
                      <Input id="stormwaterInterception" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shadeAreaSummer">Área de Sombra (m²)</Label>
                      <Input id="shadeAreaSummer" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperatureReduction">Reducción Temp. (°C)</Label>
                      <Input id="temperatureReduction" type="number" step="0.01" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold pt-2">Beneficios Económicos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalEconomicBenefitAnnual">Anual ($/año)</Label>
                      <Input id="totalEconomicBenefitAnnual" type="number" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalEconomicBenefitLifetime">Total Estimado ($)</Label>
                      <Input id="totalEconomicBenefitLifetime" type="number" step="0.01" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Input id="notes" placeholder="Notas y observaciones" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddCalculationDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    // Aquí iría la lógica para guardar el cálculo ambiental
                    toast({
                      title: "Cálculo registrado",
                      description: "El cálculo de servicios ambientales ha sido registrado exitosamente.",
                    });
                    setShowAddCalculationDialog(false);
                    // Recargar datos
                    setTimeout(() => {
                      refetchEnvironmentalServices();
                      refetch();
                    }, 500);
                  }}>Guardar Cálculo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {selectedTree.latestEnvironmentalService ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <EnvironmentalValueCard
                  icon={<Leaf className="h-4 w-4 text-green-600" />}
                  title="Captura de CO₂"
                  value={selectedTree.latestEnvironmentalService.co2SequestrationAnnual}
                  unit="kg/año"
                  description="Cantidad de dióxido de carbono capturado anualmente"
                />
                
                <EnvironmentalValueCard
                  icon={<Wind className="h-4 w-4 text-blue-600" />}
                  title="Filtración de Contaminantes"
                  value={selectedTree.latestEnvironmentalService.pollutantRemovalNO2 + 
                         selectedTree.latestEnvironmentalService.pollutantRemovalSO2 + 
                         selectedTree.latestEnvironmentalService.pollutantRemovalPM25}
                  unit="g/año"
                  description="Total de contaminantes filtrados del aire"
                />
                
                <EnvironmentalValueCard
                  icon={<CloudRain className="h-4 w-4 text-blue-600" />}
                  title="Intercepción de Agua"
                  value={selectedTree.latestEnvironmentalService.stormwaterInterception}
                  unit="L/año"
                  description="Captación de agua de lluvia evitando escorrentía"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <EnvironmentalValueCard
                  icon={<Waves className="h-4 w-4 text-indigo-600" />}
                  title="Área de Sombra"
                  value={selectedTree.latestEnvironmentalService.shadeAreaSummer}
                  unit="m²"
                  description="Área cubierta por la sombra del árbol en verano"
                />
                
                <EnvironmentalValueCard
                  icon={<Thermometer className="h-4 w-4 text-orange-600" />}
                  title="Reducción de Temperatura"
                  value={selectedTree.latestEnvironmentalService.temperatureReduction}
                  unit="°C"
                  description="Disminución de temperatura en el área circundante"
                />
                
                <EnvironmentalValueCard
                  icon={<LineChart className="h-4 w-4 text-emerald-600" />}
                  title="Beneficio Económico"
                  value={selectedTree.latestEnvironmentalService.totalEconomicBenefitAnnual}
                  unit="$/año"
                  description="Valor económico estimado de los servicios ambientales"
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Cálculos</CardTitle>
                  <CardDescription>
                    Último cálculo realizado el {formatDate(selectedTree.latestEnvironmentalService.calculationDate)} 
                    utilizando el método {CALCULATION_METHODS.find(m => m.value === selectedTree.latestEnvironmentalService?.calculationMethod)?.label || selectedTree.latestEnvironmentalService.calculationMethod}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {environmentalServices?.data?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>CO₂ Anual</TableHead>
                          <TableHead>Intercepción Agua</TableHead>
                          <TableHead>Valor Anual</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {environmentalServices.data.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>{formatDate(service.calculationDate)}</TableCell>
                            <TableCell>
                              {CALCULATION_METHODS.find(m => m.value === service.calculationMethod)?.label || service.calculationMethod}
                            </TableCell>
                            <TableCell>{formatNumber(service.co2SequestrationAnnual, "kg/año")}</TableCell>
                            <TableCell>{formatNumber(service.stormwaterInterception, "L/año")}</TableCell>
                            <TableCell>{formatNumber(service.totalEconomicBenefitAnnual, "$/año")}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">Ver Detalles</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No hay cálculos históricos disponibles.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <LineChart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Este árbol no tiene cálculos de servicios ambientales registrados.
                </p>
                <Button className="mt-4" onClick={() => setShowAddCalculationDialog(true)}>
                  Registrar Primer Cálculo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6">
      <Helmet>
        <title>Gestión Ambiental de Árboles - ParquesMX</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión Ambiental de Árboles</h1>
        <p className="text-gray-500 mt-1">
          Cálculo y seguimiento de servicios ambientales proporcionados por árboles urbanos
        </p>
      </div>

      {!selectedTree ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/2">
              <Label htmlFor="search" className="sr-only">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por código, especie o parque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/2">
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