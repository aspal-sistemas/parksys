import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, TrendingUp, TrendingDown, Calculator, BarChart3, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [viewPeriod, setViewPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProjections, setShowProjections] = useState<boolean>(false);
  const [projectionYears, setProjectionYears] = useState<number>(5);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [selectedScenario, setSelectedScenario] = useState<'optimista' | 'realista' | 'pesimista'>('realista');
  const [customGrowthRates, setCustomGrowthRates] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  // Cargar datos reales de la matriz de flujo de efectivo
  const { data: cashFlowData, isLoading, refetch } = useQuery({
    queryKey: ["/api/cash-flow-matrix", selectedYear, selectedPark],
    enabled: true
  });

  // Cargar parques para el filtro
  const { data: parks } = useQuery({
    queryKey: ["/api/parks"],
  });

  // Cargar categorías
  const { data: incomeCategories } = useQuery({
    queryKey: ["/api/income-categories"],
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  // Cargar datos históricos para proyecciones (últimos 3 años)
  const { data: historicalData } = useQuery({
    queryKey: ["/api/cash-flow-historical", selectedPark],
    enabled: showProjections
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
    const sum = historicalValues.reduce((acc, val, idx) => acc + val * (idx + 1), 0);
    const sumX = historicalValues.reduce((acc, _, idx) => acc + (idx + 1), 0);
    const sumY = historicalValues.reduce((acc, val) => acc + val, 0);
    const sumXY = sum;
    const sumX2 = historicalValues.reduce((acc, _, idx) => acc + Math.pow(idx + 1, 2), 0);
    const n = historicalValues.length;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const lastValue = historicalValues[historicalValues.length - 1];
    return lastValue > 0 ? (slope / lastValue) * 100 : 0;
  };

  const getScenarioMultiplier = (scenario: 'optimista' | 'realista' | 'pesimista') => {
    switch (scenario) {
      case 'optimista': return 1.2;
      case 'pesimista': return 0.8;
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
          const baseGrowth = customGrowthRates[category.name] !== undefined 
            ? customGrowthRates[category.name] 
            : calculateTrendGrowth(category.monthlyValues);
          
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
      title: "Exportación",
      description: "La funcionalidad de exportación estará disponible próximamente.",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Datos actualizados",
        description: "La matriz de flujo de efectivo se ha actualizado con los datos más recientes.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron actualizar los datos.",
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

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const quarterNames = ["1er Trimestre", "2do Trimestre", "3er Trimestre", "4to Trimestre"];

  // Función para agrupar datos por trimestre
  const groupByQuarter = (monthlyData: number[]) => {
    const quarterData = [];
    for (let i = 0; i < 4; i++) {
      const start = i * 3;
      const quarterSum = monthlyData.slice(start, start + 3).reduce((sum, val) => sum + val, 0);
      quarterData.push(quarterSum);
    }
    return quarterData;
  };

  // Función para obtener las columnas según el período seleccionado
  const getColumns = () => {
    switch (viewPeriod) {
      case 'monthly':
        return months;
      case 'quarterly':
        return quarterNames;
      case 'annual':
        return ['Anual'];
      default:
        return months;
    }
  };

  // Función para obtener los datos según el período seleccionado
  const getDataForPeriod = (monthlyValues: number[]) => {
    switch (viewPeriod) {
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

  const data: CashFlowData = (cashFlowData as CashFlowData) || {
    year: selectedYear,
    months,
    categories: [],
    summaries: {
      monthly: { income: new Array(12).fill(0), expenses: new Array(12).fill(0), net: new Array(12).fill(0) },
      annual: { income: 0, expenses: 0, net: 0 }
    }
  };

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
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select value={selectedPark} onValueChange={setSelectedPark}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar parque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques (Consolidado)</SelectItem>
                {(parks as any[])?.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <Select value={viewPeriod} onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setViewPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumen anual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summaries.annual.income)}
              </div>
              <p className="text-xs text-muted-foreground">
                Año {selectedYear}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summaries.annual.expenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Año {selectedYear}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
              <TrendingUp className={`h-4 w-4 ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.summaries.annual.net)}
              </div>
              <p className="text-xs text-muted-foreground">
                Año {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz principal */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Flujo de Efectivo {selectedYear}</CardTitle>
            <CardDescription>
              {selectedPark === "all" ? "Vista consolidada de todos los parques" : `Parque seleccionado: ${(parks as any[])?.find((p: any) => p.id.toString() === selectedPark)?.name || 'Cargando...'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Categoría</th>
                    {getColumns().map((column: string) => (
                      <th key={column} className="text-center p-2 font-medium min-w-[80px]">{column}</th>
                    ))}
                    <th className="text-center p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ingresos */}
                  <tr className="bg-green-50">
                    <td colSpan={14} className="p-2 font-semibold text-green-700">INGRESOS</td>
                  </tr>
                  {data.categories.filter((cat: any) => cat.type === 'income').map((category: any, idx: number) => (
                    <tr key={`income-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="p-2">{category.name}</td>
                      {getDataForPeriod(category.monthlyValues).map((value: number, periodIdx: number) => (
                        <td key={periodIdx} className="p-2 text-center text-green-600 font-medium">
                          {value > 0 ? formatCurrency(value) : '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center font-semibold text-green-600">
                        {formatCurrency(category.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b bg-green-100 font-semibold">
                    <td className="p-2">TOTAL INGRESOS</td>
                    {getDataForPeriod(data.summaries.monthly.income).map((income: number, idx: number) => (
                      <td key={idx} className="p-2 text-center text-green-700">
                        {formatCurrency(income)}
                      </td>
                    ))}
                    <td className="p-2 text-center text-green-700">
                      {formatCurrency(data.summaries.annual.income)}
                    </td>
                  </tr>

                  {/* Gastos */}
                  <tr className="bg-red-50">
                    <td colSpan={14} className="p-2 font-semibold text-red-700">GASTOS</td>
                  </tr>
                  {data.categories.filter((cat: any) => cat.type === 'expense').map((category: any, idx: number) => (
                    <tr key={`expense-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="p-2">{category.name}</td>
                      {getDataForPeriod(category.monthlyValues).map((value: number, periodIdx: number) => (
                        <td key={periodIdx} className="p-2 text-center text-red-600 font-medium">
                          {value > 0 ? formatCurrency(value) : '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center font-semibold text-red-600">
                        {formatCurrency(category.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b bg-red-100 font-semibold">
                    <td className="p-2">TOTAL GASTOS</td>
                    {getDataForPeriod(data.summaries.monthly.expenses).map((expense: number, idx: number) => (
                      <td key={idx} className="p-2 text-center text-red-700">
                        {formatCurrency(expense)}
                      </td>
                    ))}
                    <td className="p-2 text-center text-red-700">
                      {formatCurrency(data.summaries.annual.expenses)}
                    </td>
                  </tr>

                  {/* Flujo neto */}
                  <tr className="border-b-2 bg-blue-100 font-bold">
                    <td className="p-2">FLUJO NETO</td>
                    {getDataForPeriod(data.summaries.monthly.net).map((net: number, idx: number) => (
                      <td key={idx} className={`p-2 text-center ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(net)}
                      </td>
                    ))}
                    <td className={`p-2 text-center ${data.summaries.annual.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(data.summaries.annual.net)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-6 text-sm text-gray-600">
          <p>
            * Los datos mostrados reflejan los ingresos y gastos reales registrados en el sistema.
          </p>
          <p>
            * Para ver datos específicos de un parque, selecciona el parque en el filtro superior.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}