import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, TrendingUp, DollarSign, BarChart3, Download, Upload, Filter, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface CashFlowData {
  year: number;
  months: string[];
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    projectedValues: number[];
    varianceValues: number[];
    total: number;
    projectedTotal: number;
    totalVariance: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    projected: { income: number[]; expenses: number[]; net: number[] };
    variance: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
    projectedAnnual: { income: number; expenses: number; net: number };
    annualVariance: { income: number; expenses: number; net: number };
  };
}

export default function CashFlowMatrix() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [showProjections, setShowProjections] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("optimista");
  const [inflationRate, setInflationRate] = useState(3.5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Cargar datos reales de la matriz de flujo de efectivo
  const { data: cashFlowData, isLoading, refetch } = useQuery({
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

  // Cargar datos proyectados del budget planning
  const { data: budgetData } = useQuery({
    queryKey: ['budget-projections', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/budget-projections/${selectedYear}`);
      if (!response.ok) throw new Error('Error al cargar proyecciones');
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular varianza porcentual
  const calculateVariance = (real: number, projected: number): number => {
    if (projected === 0) return real === 0 ? 0 : 100;
    return ((real - projected) / projected) * 100;
  };

  // Combinar datos reales con proyectados
  const getCombinedData = () => {
    if (!cashFlowData || !budgetData) return null;

    const combinedCategories = cashFlowData.categories.map(category => {
      // Buscar la categoría correspondiente en datos proyectados
      const categoryType = category.type === 'income' ? 'incomeCategories' : 'expenseCategories';
      const projectedCategory = budgetData[categoryType]?.find(
        (proj: any) => proj.categoryName === category.name
      );

      let projectedValues = new Array(12).fill(0);
      let projectedTotal = 0;

      if (projectedCategory) {
        for (let month = 1; month <= 12; month++) {
          const value = projectedCategory.months[month] || 0;
          projectedValues[month - 1] = value;
          projectedTotal += value;
        }
      }

      // Calcular varianzas
      const varianceValues = category.monthlyValues.map((real, index) => 
        calculateVariance(real, projectedValues[index])
      );
      const totalVariance = calculateVariance(category.total, projectedTotal);

      return {
        ...category,
        projectedValues,
        varianceValues,
        projectedTotal,
        totalVariance
      };
    });

    return {
      ...cashFlowData,
      categories: combinedCategories
    };
  };

  // Usar datos combinados
  const data = getCombinedData() || {
    year: selectedYear,
    months,
    categories: [],
    summaries: {
      monthly: { income: new Array(12).fill(0), expenses: new Array(12).fill(0), net: new Array(12).fill(0) },
      projected: { income: new Array(12).fill(0), expenses: new Array(12).fill(0), net: new Array(12).fill(0) },
      variance: { income: new Array(12).fill(0), expenses: new Array(12).fill(0), net: new Array(12).fill(0) },
      annual: { income: 0, expenses: 0, net: 0 },
      projectedAnnual: { income: 0, expenses: 0, net: 0 },
      annualVariance: { income: 0, expenses: 0, net: 0 }
    }
  };

  // Manejar actualización de datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Datos actualizados",
        description: "La matriz de flujo de efectivo se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generar proyecciones futuras
  const generateProjections = (years: number = 3) => {
    const projectedData = [];
    for (let i = 1; i <= years; i++) {
      const projectedYear = selectedYear + i;
      const growthRate = selectedScenario === "optimista" ? 0.15 : selectedScenario === "pesimista" ? -0.05 : 0.08;
      const inflation = inflationRate / 100;
      
      const adjustedIncome = data.summaries.annual.income * Math.pow(1 + growthRate + inflation, i);
      const adjustedExpenses = data.summaries.annual.expenses * Math.pow(1 + inflation, i);
      
      projectedData.push({
        year: projectedYear,
        summaries: {
          annual: {
            income: adjustedIncome,
            expenses: adjustedExpenses,
            net: adjustedIncome - adjustedExpenses
          }
        }
      });
    }
    return projectedData;
  };

  const projectedData = showProjections ? generateProjections() : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <span className="ml-2">Cargando matriz de flujo de efectivo...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Matriz de Flujo de Efectivo</h1>
            <p className="text-gray-600">Análisis Financiero Integral - {selectedYear}</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPark} onValueChange={setSelectedPark}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar parque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques</SelectItem>
                {parks?.map(park => (
                  <SelectItem key={park.id} value={park.id.toString()}>{park.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button variant="outline" onClick={() => setShowProjections(!showProjections)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              {showProjections ? 'Ocultar' : 'Mostrar'} Proyecciones
            </Button>
          </div>
        </div>

        {/* Sistema de pestañas con todas las funcionalidades */}
        <Tabs defaultValue="matriz" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="matriz" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Matriz Principal
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Pestaña: Matriz Principal */}
          <TabsContent value="matriz">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Flujo de Efectivo - {selectedYear}</CardTitle>
                <CardDescription>
                  Comparación: Proyectado vs Real con Varianza Porcentual
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eff6ff' }}></div>
                      Proyectado
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f0fdf4' }}></div>
                      Real
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fefce8' }}></div>
                      Varianza %
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" style={{ minWidth: '1200px' }}>
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold sticky left-0 bg-gray-100 z-20" style={{ minWidth: '200px' }}>
                      Categoría
                    </th>
                    {months.map((month, index) => (
                      <th key={index} className="border border-gray-300 p-2 text-center font-semibold text-sm" style={{ minWidth: '120px' }}>
                        {month}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-3 text-center font-semibold" style={{ minWidth: '120px' }}>
                      Total Anual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Categorías de Ingresos */}
                  {data.categories.filter(cat => cat.type === 'income').map((category, index) => (
                    <tr key={`income-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3 sticky left-0 bg-inherit z-10">
                        <div className="font-medium text-sm">{category.name}</div>
                      </td>
                      {months.map((_, monthIndex) => (
                        <td key={monthIndex} className="border border-gray-300 p-2 text-center">
                          <div className="space-y-1">
                            <div className="text-xs text-blue-700 font-medium" style={{ backgroundColor: '#eff6ff', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(category.projectedValues?.[monthIndex] || 0)}
                            </div>
                            <div className="text-xs text-green-700 font-medium" style={{ backgroundColor: '#f0fdf4', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(category.monthlyValues[monthIndex] || 0)}
                            </div>
                            <div className={`text-xs font-bold ${
                              Math.abs(category.varianceValues?.[monthIndex] || 0) > 20 ? 'text-red-600' : 
                              Math.abs(category.varianceValues?.[monthIndex] || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                            }`} style={{ backgroundColor: '#fefce8', padding: '2px 4px', borderRadius: '2px' }}>
                              {(category.varianceValues?.[monthIndex] || 0).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="border border-gray-300 p-2 text-center">
                        <div className="space-y-1">
                          <div className="text-xs text-blue-700 font-medium" style={{ backgroundColor: '#eff6ff', padding: '2px 4px', borderRadius: '2px' }}>
                            {formatCurrency(category.projectedTotal || 0)}
                          </div>
                          <div className="text-xs text-green-700 font-medium" style={{ backgroundColor: '#f0fdf4', padding: '2px 4px', borderRadius: '2px' }}>
                            {formatCurrency(category.total)}
                          </div>
                          <div className={`text-xs font-bold ${
                            Math.abs(category.totalVariance || 0) > 20 ? 'text-red-600' : 
                            Math.abs(category.totalVariance || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                          }`} style={{ backgroundColor: '#fefce8', padding: '2px 4px', borderRadius: '2px' }}>
                            {(category.totalVariance || 0).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total de Ingresos */}
                  <tr className="bg-green-100 font-bold border-t-2 border-green-500">
                    <td className="border border-gray-300 p-3 sticky left-0 bg-green-100 z-10">
                      <div className="font-bold text-sm text-green-800">TOTAL INGRESOS</div>
                    </td>
                    {months.map((_, monthIndex) => {
                      const monthlyProjected = data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedValues?.[monthIndex] || 0), 0);
                      const monthlyReal = data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.monthlyValues[monthIndex] || 0), 0);
                      const monthlyVariance = monthlyProjected === 0 ? 0 : ((monthlyReal - monthlyProjected) / monthlyProjected) * 100;
                      
                      return (
                        <td key={monthIndex} className="border border-gray-300 p-2 text-center bg-green-100">
                          <div className="space-y-1">
                            <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyProjected)}
                            </div>
                            <div className="text-xs text-green-800 font-bold" style={{ backgroundColor: '#dcfce7', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyReal)}
                            </div>
                            <div className={`text-xs font-bold ${
                              Math.abs(monthlyVariance) > 20 ? 'text-red-700' : 
                              Math.abs(monthlyVariance) > 10 ? 'text-yellow-700' : 'text-green-700'
                            }`} style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                              {monthlyVariance.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center bg-green-100">
                      <div className="space-y-1">
                        <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency(data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0))}
                        </div>
                        <div className="text-xs text-green-800 font-bold" style={{ backgroundColor: '#dcfce7', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency(data.summaries.annual.income)}
                        </div>
                        <div className="text-xs text-green-700 font-bold" style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                          {data.summaries.annual.income > 0 ? (((data.summaries.annual.income - data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) / data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Categorías de Gastos */}
                  {data.categories.filter(cat => cat.type === 'expense').map((category, index) => (
                    <tr key={`expense-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3 sticky left-0 bg-inherit z-10">
                        <div className="font-medium text-sm">{category.name}</div>
                      </td>
                      {months.map((_, monthIndex) => (
                        <td key={monthIndex} className="border border-gray-300 p-2 text-center">
                          <div className="space-y-1">
                            <div className="text-xs text-blue-700 font-medium" style={{ backgroundColor: '#eff6ff', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(category.projectedValues?.[monthIndex] || 0)}
                            </div>
                            <div className="text-xs text-green-700 font-medium" style={{ backgroundColor: '#f0fdf4', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(category.monthlyValues[monthIndex] || 0)}
                            </div>
                            <div className={`text-xs font-bold ${
                              Math.abs(category.varianceValues?.[monthIndex] || 0) > 20 ? 'text-red-600' : 
                              Math.abs(category.varianceValues?.[monthIndex] || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                            }`} style={{ backgroundColor: '#fefce8', padding: '2px 4px', borderRadius: '2px' }}>
                              {(category.varianceValues?.[monthIndex] || 0).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="border border-gray-300 p-2 text-center">
                        <div className="space-y-1">
                          <div className="text-xs text-blue-700 font-medium" style={{ backgroundColor: '#eff6ff', padding: '2px 4px', borderRadius: '2px' }}>
                            {formatCurrency(category.projectedTotal || 0)}
                          </div>
                          <div className="text-xs text-green-700 font-medium" style={{ backgroundColor: '#f0fdf4', padding: '2px 4px', borderRadius: '2px' }}>
                            {formatCurrency(category.total)}
                          </div>
                          <div className={`text-xs font-bold ${
                            Math.abs(category.totalVariance || 0) > 20 ? 'text-red-600' : 
                            Math.abs(category.totalVariance || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                          }`} style={{ backgroundColor: '#fefce8', padding: '2px 4px', borderRadius: '2px' }}>
                            {(category.totalVariance || 0).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total de Gastos */}
                  <tr className="bg-red-100 font-bold border-t-2 border-red-500">
                    <td className="border border-gray-300 p-3 sticky left-0 bg-red-100 z-10">
                      <div className="font-bold text-sm text-red-800">TOTAL GASTOS</div>
                    </td>
                    {months.map((_, monthIndex) => {
                      const monthlyProjected = data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedValues?.[monthIndex] || 0), 0);
                      const monthlyReal = data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.monthlyValues[monthIndex] || 0), 0);
                      const monthlyVariance = monthlyProjected === 0 ? 0 : ((monthlyReal - monthlyProjected) / monthlyProjected) * 100;
                      
                      return (
                        <td key={monthIndex} className="border border-gray-300 p-2 text-center bg-red-100">
                          <div className="space-y-1">
                            <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyProjected)}
                            </div>
                            <div className="text-xs text-red-800 font-bold" style={{ backgroundColor: '#fecaca', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyReal)}
                            </div>
                            <div className={`text-xs font-bold ${
                              Math.abs(monthlyVariance) > 20 ? 'text-red-700' : 
                              Math.abs(monthlyVariance) > 10 ? 'text-yellow-700' : 'text-green-700'
                            }`} style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                              {monthlyVariance.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center bg-red-100">
                      <div className="space-y-1">
                        <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency(data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0))}
                        </div>
                        <div className="text-xs text-red-800 font-bold" style={{ backgroundColor: '#fecaca', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency(data.summaries.annual.expenses)}
                        </div>
                        <div className="text-xs text-red-700 font-bold" style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                          {data.summaries.annual.expenses > 0 ? (((data.summaries.annual.expenses - data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) / data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Utilidad/Pérdida */}
                  <tr className={`font-bold border-t-4 ${data.summaries.annual.net >= 0 ? 'bg-blue-100 border-blue-600' : 'bg-orange-100 border-orange-600'}`}>
                    <td className={`border border-gray-300 p-3 sticky left-0 z-10 ${data.summaries.annual.net >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <div className={`font-bold text-sm ${data.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                        {data.summaries.annual.net >= 0 ? 'UTILIDAD' : 'PÉRDIDA'}
                      </div>
                    </td>
                    {months.map((_, monthIndex) => {
                      const monthlyProjectedIncome = data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedValues?.[monthIndex] || 0), 0);
                      const monthlyProjectedExpense = data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedValues?.[monthIndex] || 0), 0);
                      const monthlyProjectedNet = monthlyProjectedIncome - monthlyProjectedExpense;
                      
                      const monthlyRealIncome = data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.monthlyValues[monthIndex] || 0), 0);
                      const monthlyRealExpense = data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.monthlyValues[monthIndex] || 0), 0);
                      const monthlyRealNet = monthlyRealIncome - monthlyRealExpense;
                      
                      const monthlyVariance = monthlyProjectedNet === 0 ? 0 : ((monthlyRealNet - monthlyProjectedNet) / Math.abs(monthlyProjectedNet)) * 100;
                      
                      return (
                        <td key={monthIndex} className={`border border-gray-300 p-2 text-center ${data.summaries.annual.net >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                          <div className="space-y-1">
                            <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyProjectedNet)}
                            </div>
                            <div className={`text-xs font-bold ${monthlyRealNet >= 0 ? 'text-blue-800' : 'text-orange-800'}`} style={{ backgroundColor: monthlyRealNet >= 0 ? '#dbeafe' : '#fed7aa', padding: '2px 4px', borderRadius: '2px' }}>
                              {formatCurrency(monthlyRealNet)}
                            </div>
                            <div className={`text-xs font-bold ${
                              Math.abs(monthlyVariance) > 20 ? 'text-red-700' : 
                              Math.abs(monthlyVariance) > 10 ? 'text-yellow-700' : 'text-green-700'
                            }`} style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                              {monthlyVariance.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className={`border border-gray-300 p-2 text-center ${data.summaries.annual.net >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <div className="space-y-1">
                        <div className="text-xs text-blue-800 font-bold" style={{ backgroundColor: '#dbeafe', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency((data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) - (data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)))}
                        </div>
                        <div className={`text-xs font-bold ${data.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-orange-800'}`} style={{ backgroundColor: data.summaries.annual.net >= 0 ? '#dbeafe' : '#fed7aa', padding: '2px 4px', borderRadius: '2px' }}>
                          {formatCurrency(data.summaries.annual.net)}
                        </div>
                        <div className={`text-xs font-bold ${data.summaries.annual.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`} style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '2px' }}>
                          {Math.abs(data.summaries.annual.net) > 0 ? (((data.summaries.annual.net - ((data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) - (data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)))) / Math.abs((data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)) - (data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0)))) * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Pestaña: Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summaries.annual.income)}</div>
                <p className="text-xs text-muted-foreground">vs {formatCurrency(data.categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0))} proyectado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.summaries.annual.expenses)}</div>
                <p className="text-xs text-muted-foreground">vs {formatCurrency(data.categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + (cat.projectedTotal || 0), 0))} proyectado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{data.summaries.annual.net >= 0 ? 'Utilidad' : 'Pérdida'}</CardTitle>
                <DollarSign className={`h-4 w-4 ${data.summaries.annual.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.summaries.annual.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(data.summaries.annual.net)}
                </div>
                <p className="text-xs text-muted-foreground">Flujo neto anual</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen por Categorías</CardTitle>
              <CardDescription>Top categorías por volumen de transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categories.sort((a, b) => Math.abs(b.total) - Math.abs(a.total)).slice(0, 8).map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                        {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(category.total)}</div>
                      <div className="text-xs text-gray-500">
                        vs {formatCurrency(category.projectedTotal || 0)} proyectado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Tendencias */}
        <TabsContent value="tendencias">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tendencias</CardTitle>
              <CardDescription>Proyecciones futuras basadas en datos históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Escenario de Proyección</label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimista">Optimista (+15% crecimiento)</SelectItem>
                      <SelectItem value="realista">Realista (+8% crecimiento)</SelectItem>
                      <SelectItem value="pesimista">Pesimista (-5% decrecimiento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Tasa de Inflación (%)</label>
                  <Select value={inflationRate.toString()} onValueChange={(value) => setInflationRate(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5">2.5%</SelectItem>
                      <SelectItem value="3.0">3.0%</SelectItem>
                      <SelectItem value="3.5">3.5%</SelectItem>
                      <SelectItem value="4.0">4.0%</SelectItem>
                      <SelectItem value="5.0">5.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {projectedData && (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Reportes */}
        <TabsContent value="reportes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Datos</CardTitle>
                <CardDescription>Descargar información de la matriz en diferentes formatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel (.xlsx)
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Importar Datos</CardTitle>
                <CardDescription>Cargar proyecciones o datos históricos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Proyecciones
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Histórico
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña: Configuración */}
        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Matriz</CardTitle>
              <CardDescription>Personalizar visualización y parámetros de cálculo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visualización</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Mostrar varianza porcentual</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Agrupar por tipo (Ingresos/Gastos)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Mostrar proyecciones automáticamente</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cálculos</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Incluir inflación en proyecciones</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Ajustar por estacionalidad</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Aplicar factor de riesgo</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}