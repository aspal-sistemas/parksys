import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, Calculator, TrendingUp, TrendingDown, Download, Settings, Upload, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

interface CashFlowData {
  year: number;
  months: string[];
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    total: number;
    growthRate?: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
  };
}

interface ProjectedYearData {
  year: number;
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    total: number;
    growthRate: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
  };
}

export default function CashFlowMatrix() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para proyecciones
  const [showProjections, setShowProjections] = useState(false);
  const [projectionYears, setProjectionYears] = useState(3);
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');
  const [inflationRate, setInflationRate] = useState(4.5);
  const [customGrowthRates, setCustomGrowthRates] = useState<Record<string, number>>({});
  const [showCustomGrowthPanel, setShowCustomGrowthPanel] = useState(false);
  const [categoryGrowthByYear, setCategoryGrowthByYear] = useState<Record<string, Record<number, number>>>({});

  // Estados para importación CSV
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importType, setImportType] = useState<'historical' | 'projections'>('historical');
  const [importDataType, setImportDataType] = useState<'income' | 'expense'>('income');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultas de datos
  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ["/api/cash-flow-matrix", selectedYear, selectedPark],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedPark !== "all" && { parkId: selectedPark })
      });
      const response = await fetch(`/api/cash-flow-matrix?${params}`);
      return response.json();
    }
  });

  // Cargar datos proyectados desde planificación presupuestaria
  const { data: budgetMatrix } = useQuery({
    queryKey: ['budget-projections', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/budget-projections/${selectedYear}`);
      if (!response.ok) throw new Error('Error al cargar proyecciones');
      return response.json();
    }
  });

  const { data: parks } = useQuery({
    queryKey: ["/api/parks"],
  });

  const { data: incomeCategories } = useQuery({
    queryKey: ["/api/income-categories/active"],
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ["/api/expense-categories/active"],
  });

  // Cargar datos históricos para proyecciones (últimos 3 años)
  const { data: historicalData } = useQuery({
    queryKey: ["/api/cash-flow-historical", selectedPark],
    enabled: showProjections
  });

  // Mutación para importar datos CSV
  const importCsvMutation = useMutation({
    mutationFn: async ({ file, type, dataType }: { file: File; type: 'historical' | 'projections'; dataType: 'income' | 'expense' }) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('type', dataType);
      if (selectedPark !== "all") {
        formData.append('parkId', selectedPark);
      }
      
      const endpoint = type === 'historical' ? '/api/import/historical-data' : '/api/import/projections';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al importar archivo CSV');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Importación exitosa",
        description: `${data.message}. ${data.successCount} registros procesados.`,
      });
      
      // Invalidar caché para actualizar datos
      queryClient.invalidateQueries({ queryKey: ["/api/cash-flow-matrix"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cash-flow-historical"] });
      
      setShowImportDialog(false);
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error en la importación",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  // Preparar datos base
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  const data: CashFlowData = (cashFlowData as CashFlowData) || {
    year: selectedYear,
    months,
    categories: [],
    summaries: {
      monthly: { income: new Array(12).fill(0), expenses: new Array(12).fill(0), net: new Array(12).fill(0) },
      annual: { income: 0, expenses: 0, net: 0 }
    }
  };

  // Funciones de cálculo de proyecciones
  const calculateTrendGrowth = (historicalValues: number[]) => {
    if (historicalValues.length < 2) return 0;
    
    let totalGrowth = 0;
    let validPeriods = 0;
    
    for (let i = 1; i < historicalValues.length; i++) {
      if (historicalValues[i - 1] !== 0) {
        const growth = ((historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1]) * 100;
        totalGrowth += growth;
        validPeriods++;
      }
    }
    
    return validPeriods > 0 ? totalGrowth / validPeriods : 0;
  };

  const getScenarioMultiplier = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 1.2;
      case 'pessimistic': return 0.8;
      default: return 1.0;
    }
  };

  const calculateProjections = (currentData: CashFlowData): ProjectedYearData[] | null => {
    if (!currentData) return null;

    const projections: ProjectedYearData[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear + 1; year <= currentYear + projectionYears; year++) {
      const yearProjection: ProjectedYearData = {
        year,
        categories: currentData.categories.map(category => {
          // Verificar si hay un factor de crecimiento específico para esta categoría y año
          const specificGrowthRate = categoryGrowthByYear[category.name]?.[year];
          
          let baseGrowth: number;
          if (specificGrowthRate !== undefined) {
            // Usar el factor específico por año
            baseGrowth = specificGrowthRate;
          } else if (customGrowthRates[category.name] !== undefined) {
            // Usar el factor general de la categoría
            baseGrowth = customGrowthRates[category.name];
          } else {
            // Calcular tendencia histórica
            baseGrowth = calculateTrendGrowth(category.monthlyValues);
          }
          
          const adjustedGrowth = baseGrowth * getScenarioMultiplier(selectedScenario);
          const inflationAdjustment = category.type === 'expense' ? inflationRate : 0;
          const totalGrowth = (adjustedGrowth + inflationAdjustment) / 100;
          
          const projectedTotal = category.total * Math.pow(1 + totalGrowth, year - currentYear);
          const monthlyAverage = projectedTotal / 12;
          
          return {
            ...category,
            total: projectedTotal,
            monthlyValues: Array(12).fill(monthlyAverage),
            growthRate: totalGrowth * 100
          };
        }),
        summaries: {
          annual: { income: 0, expenses: 0, net: 0 },
          monthly: {
            income: Array(12).fill(0),
            expenses: Array(12).fill(0),
            net: Array(12).fill(0)
          }
        }
      };
      
      // Calcular resúmenes del año proyectado
      const income = yearProjection.categories
        .filter(cat => cat.type === 'income')
        .reduce((sum, cat) => sum + cat.total, 0);
      
      const expenses = yearProjection.categories
        .filter(cat => cat.type === 'expense')
        .reduce((sum, cat) => sum + cat.total, 0);
      
      yearProjection.summaries = {
        annual: { income, expenses, net: income - expenses },
        monthly: {
          income: Array(12).fill(income / 12),
          expenses: Array(12).fill(expenses / 12),
          net: Array(12).fill((income - expenses) / 12)
        }
      };
      
      projections.push(yearProjection);
    }
    
    return projections;
  };

  // Calcular proyecciones
  const projectedData = showProjections ? calculateProjections(data) : null;

  // Preparar datos para gráficos
  const prepareChartData = () => {
    if (!data) return [];
    
    const chartData = [{
      year: selectedYear,
      ingresos: data.summaries.annual.income,
      gastos: data.summaries.annual.expenses,
      flujoNeto: data.summaries.annual.net,
      tipo: 'histórico'
    }];
    
    if (projectedData) {
      projectedData.forEach(projection => {
        chartData.push({
          year: projection.year,
          ingresos: projection.summaries.annual.income,
          gastos: projection.summaries.annual.expenses,
          flujoNeto: projection.summaries.annual.net,
          tipo: 'proyectado'
        });
      });
    }
    
    return chartData;
  };

  const exportToExcel = () => {
    // Implementar exportación a Excel
    toast({
      title: "Exportación iniciada",
      description: "Los datos se están preparando para descargar.",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/cash-flow"] });
      toast({
        title: "Datos actualizados",
        description: "La matriz de flujo de efectivo se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron cargar los datos más recientes.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Funciones para importación CSV
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      importCsvMutation.mutate({
        file,
        type: importType,
        dataType: importDataType
      });
    }
  };

  const downloadTemplate = (type: 'historical' | 'projections', dataType: 'income' | 'expense') => {
    const url = `/api/import/template/${type}?type=${dataType}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_${dataType === 'income' ? 'ingresos' : 'egresos'}_${type === 'historical' ? 'historicos' : 'proyecciones'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const quarterNames = ["1er Trimestre", "2do Trimestre", "3er Trimestre", "4to Trimestre"];

  // Función para agrupar datos por trimestre
  const groupByQuarter = (monthlyData: number[]) => {
    const quarterData = [];
    for (let i = 0; i < 4; i++) {
      const quarterSum = monthlyData.slice(i * 3, (i + 1) * 3).reduce((sum, val) => sum + val, 0);
      quarterData.push(quarterSum);
    }
    return quarterData;
  };

  // Función para obtener etiquetas según el modo de vista
  const getLabels = () => {
    switch (viewMode) {
      case 'monthly':
        return months;
      case 'quarterly':
        return quarterNames;
      case 'annual':
        return [selectedYear.toString()];
      default:
        return months;
    }
  };

  // Función para agrupar valores según el modo de vista
  const groupValues = (monthlyValues: number[]) => {
    switch (viewMode) {
      case 'monthly':
        return monthlyValues;
      case 'quarterly':
        return groupByQuarter(monthlyValues);
      case 'annual':
        return [monthlyValues.reduce((sum, val) => sum + val, 0)];
      default:
        return monthlyValues;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando matriz de flujo de efectivo...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matriz de Flujo de Efectivo</h1>
            <p className="text-gray-600 mt-2">
              Seguimiento financiero mensual con datos reales de ingresos y gastos
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowProjections(!showProjections)} 
              variant={showProjections ? "default" : "outline"}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showProjections ? 'Ocultar' : 'Mostrar'} Proyecciones
            </Button>
            {showProjections && (
              <Button 
                onClick={() => setShowCustomGrowthPanel(!showCustomGrowthPanel)}
                variant={showCustomGrowthPanel ? "default" : "outline"}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showCustomGrowthPanel ? 'Ocultar' : 'Configurar'} Factores
              </Button>
            )}
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Importar Datos desde CSV</DialogTitle>
                  <DialogDescription>
                    Importe datos históricos o proyecciones financieras desde archivos CSV
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de importación</Label>
                    <Select value={importType} onValueChange={(value: 'historical' | 'projections') => setImportType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="historical">Datos históricos</SelectItem>
                        <SelectItem value="projections">Proyecciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de datos</Label>
                    <Select value={importDataType} onValueChange={(value: 'income' | 'expense') => setImportDataType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Ingresos</SelectItem>
                        <SelectItem value="expense">Egresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 mb-4">
                        Seleccione un archivo CSV para importar
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="mb-2"
                      >
                        {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
                      </Button>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate(importType, importDataType)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Plantilla
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>Formato esperado:</strong>
                    {importType === 'historical' ? (
                      <div>fecha, categoria, monto, descripcion, parque_id</div>
                    ) : (
                      <div>categoria, año, mes, monto, escenario, parque_id</div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Controles de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="year-select">Año</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="park-select">Parque</Label>
            <Select value={selectedPark} onValueChange={setSelectedPark}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques</SelectItem>
                {parks && Array.isArray(parks) && parks.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="view-mode">Vista</Label>
            <Select value={viewMode} onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setViewMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showProjections && (
            <div className="space-y-2">
              <Label htmlFor="scenario-select">Escenario</Label>
              <Select value={selectedScenario} onValueChange={(value: 'optimistic' | 'realistic' | 'pessimistic') => setSelectedScenario(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimistic">Optimista</SelectItem>
                  <SelectItem value="realistic">Realista</SelectItem>
                  <SelectItem value="pessimistic">Pesimista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Panel de configuración de factores personalizados */}
        {showCustomGrowthPanel && data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Factores de Crecimiento Personalizados
              </CardTitle>
              <CardDescription>
                Configure factores específicos por categoría y año para proyecciones más precisas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.categories.map((category) => (
                  <div key={category.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-sm">
                        {category.name} ({category.type === 'income' ? 'Ingreso' : 'Egreso'})
                      </h4>
                      <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                        {formatCurrency(category.total)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {Array.from({ length: projectionYears }, (_, i) => {
                        const year = new Date().getFullYear() + 1 + i;
                        const currentValue = categoryGrowthByYear[category.name]?.[year] || 0;
                        return (
                          <div key={year} className="space-y-2">
                            <Label className="text-xs">{year}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={currentValue || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setCategoryGrowthByYear(prev => ({
                                    ...prev,
                                    [category.name]: {
                                      ...prev[category.name],
                                      [year]: value
                                    }
                                  }));
                                }}
                                className="text-xs"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Los valores negativos representan decrementos. Si no se especifica un valor, se usará la tendencia histórica.
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCategoryGrowthByYear({})}
                  >
                    Limpiar Todo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuración de proyecciones */}
        {showProjections && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Proyecciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projection-years">Años a proyectar</Label>
                  <Input
                    id="projection-years"
                    type="number"
                    min="1"
                    max="10"
                    value={projectionYears}
                    onChange={(e) => setProjectionYears(parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inflation-rate">Tasa de inflación (%)</Label>
                  <Input
                    id="inflation-rate"
                    type="number"
                    step="0.1"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(parseFloat(e.target.value) || 4.5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Escenario seleccionado</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant={selectedScenario === 'optimistic' ? 'default' : 'secondary'}>
                      {selectedScenario === 'optimistic' && 'Optimista (+20%)'}
                      {selectedScenario === 'realistic' && 'Realista (Base)'}
                      {selectedScenario === 'pessimistic' && 'Pesimista (-20%)'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráficos de proyecciones */}
        {showProjections && projectedData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyección de Flujo Neto</CardTitle>
                <CardDescription>Comparación histórica vs proyectada</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="flujoNeto" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos vs Gastos Proyectados</CardTitle>
                <CardDescription>Evolución esperada por año</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                    <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summaries.annual.income)}
              </div>
              <p className="text-xs text-muted-foreground">
                {viewMode === 'annual' ? 'Año completo' : `Acumulado ${selectedYear}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summaries.annual.expenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {viewMode === 'annual' ? 'Año completo' : `Acumulado ${selectedYear}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
              <div className={`h-4 w-4 ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.summaries.annual.net >= 0 ? <TrendingUp /> : <TrendingDown />}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.summaries.annual.net)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.summaries.annual.net >= 0 ? 'Superávit' : 'Déficit'} {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz de Flujo de Efectivo */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Flujo de Efectivo - {selectedYear}</CardTitle>
            <CardDescription>
              Vista {viewMode} de ingresos y gastos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Categoría</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Tipo</th>
                    {getLabels().map((label, index) => (
                      <th key={index} className="border border-gray-300 p-3 text-center font-semibold text-xs">
                        {label}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-3 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((category, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3 font-medium">{category.name}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                          {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Badge>
                      </td>
                      {groupValues(category.monthlyValues).map((value, monthIndex) => (
                        <td key={monthIndex} className="border border-gray-300 p-3 text-right text-sm">
                          {formatCurrency(value)}
                        </td>
                      ))}
                      <td className="border border-gray-300 p-3 text-right font-semibold">
                        {formatCurrency(category.total)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Fila de totales */}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="border border-gray-300 p-3">TOTAL INGRESOS</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Badge variant="default">Ingreso</Badge>
                    </td>
                    {groupValues(data.summaries.monthly.income).map((value, index) => (
                      <td key={index} className="border border-gray-300 p-3 text-right">
                        {formatCurrency(value)}
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-right">
                      {formatCurrency(data.summaries.annual.income)}
                    </td>
                  </tr>
                  
                  <tr className="bg-red-50 font-semibold">
                    <td className="border border-gray-300 p-3">TOTAL GASTOS</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Badge variant="destructive">Gasto</Badge>
                    </td>
                    {groupValues(data.summaries.monthly.expenses).map((value, index) => (
                      <td key={index} className="border border-gray-300 p-3 text-right">
                        {formatCurrency(value)}
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-right">
                      {formatCurrency(data.summaries.annual.expenses)}
                    </td>
                  </tr>
                  
                  <tr className="bg-green-50 font-bold">
                    <td className="border border-gray-300 p-3">FLUJO NETO</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Badge variant={data.summaries.annual.net >= 0 ? 'default' : 'destructive'}>
                        {data.summaries.annual.net >= 0 ? 'Positivo' : 'Negativo'}
                      </Badge>
                    </td>
                    {groupValues(data.summaries.monthly.net).map((value, index) => (
                      <td key={index} className={`border border-gray-300 p-3 text-right ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(value)}
                      </td>
                    ))}
                    <td className={`border border-gray-300 p-3 text-right ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.summaries.annual.net)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de proyecciones */}
        {showProjections && projectedData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Proyecciones Financieras</CardTitle>
              <CardDescription>
                Proyecciones basadas en escenario {selectedScenario} con inflación del {inflationRate}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Año</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Ingresos Proyectados</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Gastos Proyectados</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Flujo Neto</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectedData.map((projection, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-3 font-medium">{projection.year}</td>
                        <td className="border border-gray-300 p-3 text-right text-green-600">
                          {formatCurrency(projection.summaries.annual.income)}
                        </td>
                        <td className="border border-gray-300 p-3 text-right text-red-600">
                          {formatCurrency(projection.summaries.annual.expenses)}
                        </td>
                        <td className={`border border-gray-300 p-3 text-right font-semibold ${
                          projection.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(projection.summaries.annual.net)}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <Badge variant={projection.summaries.annual.net >= 0 ? 'default' : 'destructive'}>
                            {projection.summaries.annual.net >= 0 ? 'Superávit' : 'Déficit'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}