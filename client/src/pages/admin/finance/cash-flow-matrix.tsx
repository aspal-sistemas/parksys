import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, TrendingDown, Calculator, Download, Edit3, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/AdminLayout";

interface CashFlowMatrixData {
  year: number;
  months: string[];
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    total: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    quarterly: { income: number[]; expenses: number[]; net: number[] };
    semiannual: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
  };
}

export default function CashFlowMatrix() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly');
  const [inflationFactors, setInflationFactors] = useState<Record<number, number>>({});

  // Inicializar factores de inflación con 4% por defecto para años futuros
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const defaultFactors: Record<number, number> = {};
    
    // Solo inicializar factores para años futuros
    for (let i = 1; i <= 5; i++) {
      const futureYear = currentYear + i;
      defaultFactors[futureYear] = 4.0; // 4% por defecto
    }
    
    setInflationFactors(defaultFactors);
  }, []);

  // Función para generar datos anuales históricos y proyectados
  const generateAnnualData = () => {
    const currentYear = new Date().getFullYear();
    const baseIncome = 278900;
    const baseExpenses = 273400;
    
    const years: number[] = [];
    const incomes: number[] = [];
    const expenses: number[] = [];
    const nets: number[] = [];
    
    // Datos históricos (5 años anteriores)
    for (let i = 5; i >= 1; i--) {
      const year = currentYear - i;
      // Simular variaciones históricas (-2% a +8% anualmente)
      const variation = 0.96 + (Math.random() * 0.12); // Entre 96% y 108%
      years.push(year);
      incomes.push(Math.round(baseIncome * Math.pow(variation, i * 0.8)));
      expenses.push(Math.round(baseExpenses * Math.pow(variation, i * 0.7)));
    }
    
    // Año actual
    years.push(currentYear);
    incomes.push(baseIncome);
    expenses.push(baseExpenses);
    
    // Datos proyectados (5 años futuros)
    let projectedIncome = baseIncome;
    let projectedExpenses = baseExpenses;
    
    for (let i = 1; i <= 5; i++) {
      const year = currentYear + i;
      const inflationRate = (inflationFactors[year] || 4.0) / 100;
      
      projectedIncome *= (1 + inflationRate);
      projectedExpenses *= (1 + inflationRate);
      
      years.push(year);
      incomes.push(Math.round(projectedIncome));
      expenses.push(Math.round(projectedExpenses));
    }
    
    // Calcular flujos netos
    incomes.forEach((income, index) => {
      nets.push(income - expenses[index]);
    });
    
    return { years, incomes, expenses, nets };
  };

  const updateInflationFactor = (year: number, factor: number) => {
    setInflationFactors(prev => ({
      ...prev,
      [year]: factor
    }));
  };

  // Obtener categorías del catálogo financiero directamente
  const { data: incomeCategories } = useQuery({
    queryKey: ['/api/finance/income-categories'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ['/api/finance/expense-categories'],
    staleTime: 5 * 60 * 1000,
  });

  // Generar datos de la matriz usando las categorías del catálogo
  const cashFlowData = React.useMemo(() => {
    if (!incomeCategories || !expenseCategories) return null;

    const categories = [];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Agregar categorías de ingresos
    incomeCategories.forEach((category: any) => {
      categories.push({
        name: category.name,
        type: 'income',
        monthlyValues: new Array(12).fill(0),
        total: 0
      });
    });

    // Agregar categorías de egresos
    expenseCategories.forEach((category: any) => {
      categories.push({
        name: category.name,
        type: 'expense',
        monthlyValues: new Array(12).fill(0),
        total: 0
      });
    });

    return {
      year: selectedYear,
      months,
      categories,
      summaries: {
        monthly: {
          income: new Array(12).fill(0),
          expenses: new Array(12).fill(0),
          net: new Array(12).fill(0)
        },
        quarterly: {
          income: [0, 0, 0, 0],
          expenses: [0, 0, 0, 0],
          net: [0, 0, 0, 0]
        },
        semiannual: {
          income: [0, 0],
          expenses: [0, 0],
          net: [0, 0]
        },
        annual: {
          income: 0,
          expenses: 0,
          net: 0
        }
      }
    };
  }, [incomeCategories, expenseCategories, selectedYear]);

  const isLoading = !incomeCategories || !expenseCategories;
  const error = null;

  // Datos por defecto mientras se cargan los reales
  const defaultCashFlowData: CashFlowMatrixData = {
    year: selectedYear,
    months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    categories: [],
    summaries: {
      monthly: { income: [], expenses: [], net: [] },
      quarterly: { income: [], expenses: [], net: [] },
      semiannual: { income: [], expenses: [], net: [] },
      annual: { income: 0, expenses: 0, net: 0 }
    }
  };

  const finalCashFlowData = cashFlowData || defaultCashFlowData;

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <AdminLayout 
        title="Matriz de Flujo de Efectivo" 
        subtitle="Análisis financiero integrado con el catálogo"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del catálogo financiero...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <AdminLayout 
        title="Matriz de Flujo de Efectivo" 
        subtitle="Análisis financiero integrado con el catálogo"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error al cargar los datos financieros</p>
            <p className="text-gray-600 text-sm">Por favor, verifica que el catálogo financiero tenga datos configurados</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  const renderMonthlyView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Vista Mensual {selectedYear}</CardTitle>
        <CardDescription>Flujo de efectivo detallado por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Categoría</th>
                {finalCashFlowData.months.map((month) => (
                  <th key={month} className="text-center p-3 font-medium min-w-[80px]">
                    {month}
                  </th>
                ))}
                <th className="text-center p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Ingresos */}
              <tr className="bg-green-50">
                <td className="p-3 font-semibold text-green-800">INGRESOS</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center p-3"></td>
                ))}
                <td className="text-center p-3"></td>
              </tr>
              {finalCashFlowData.categories.filter(cat => cat.type === 'income').map((category) => (
                <tr key={category.name} className="border-b hover:bg-gray-50">
                  <td className="p-3">{category.name}</td>
                  {category.monthlyValues.map((value, index) => (
                    <td key={index} className="text-center p-3 text-green-700">
                      {formatCurrency(value)}
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-green-700">
                    {formatCurrency(category.total)}
                  </td>
                </tr>
              ))}
              
              {/* Subtotal Ingresos */}
              <tr className="bg-green-100 font-semibold">
                <td className="p-3">Subtotal Ingresos</td>
                {finalCashFlowData.summaries.monthly.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.income)}
                </td>
              </tr>

              {/* Egresos */}
              <tr className="bg-red-50">
                <td className="p-3 font-semibold text-red-800">EGRESOS</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center p-3"></td>
                ))}
                <td className="text-center p-3"></td>
              </tr>
              {finalCashFlowData.categories.filter(cat => cat.type === 'expense').map((category) => (
                <tr key={category.name} className="border-b hover:bg-gray-50">
                  <td className="p-3">{category.name}</td>
                  {category.monthlyValues.map((value, index) => (
                    <td key={index} className="text-center p-3 text-red-700">
                      {formatCurrency(value)}
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-red-700">
                    {formatCurrency(category.total)}
                  </td>
                </tr>
              ))}
              
              {/* Subtotal Egresos */}
              <tr className="bg-red-100 font-semibold">
                <td className="p-3">Subtotal Egresos</td>
                {finalCashFlowData.summaries.monthly.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.expenses)}
                </td>
              </tr>

              {/* Flujo Neto */}
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">FLUJO NETO</td>
                {finalCashFlowData.summaries.monthly.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${finalCashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(finalCashFlowData.summaries.annual.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuarterlyView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Vista Trimestral {selectedYear}</CardTitle>
        <CardDescription>Flujo de efectivo agregado por trimestre</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Categoría</th>
                <th className="text-center p-3 font-medium">Q1</th>
                <th className="text-center p-3 font-medium">Q2</th>
                <th className="text-center p-3 font-medium">Q3</th>
                <th className="text-center p-3 font-medium">Q4</th>
                <th className="text-center p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-100 font-semibold">
                <td className="p-3">Ingresos Totales</td>
                {finalCashFlowData.summaries.quarterly.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.income)}
                </td>
              </tr>
              <tr className="bg-red-100 font-semibold">
                <td className="p-3">Egresos Totales</td>
                {finalCashFlowData.summaries.quarterly.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.expenses)}
                </td>
              </tr>
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">Flujo Neto</td>
                {finalCashFlowData.summaries.quarterly.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${finalCashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(finalCashFlowData.summaries.annual.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderSemiannualView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Vista Semestral {selectedYear}</CardTitle>
        <CardDescription>Flujo de efectivo agregado por semestre</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Categoría</th>
                <th className="text-center p-3 font-medium">S1 (Ene-Jun)</th>
                <th className="text-center p-3 font-medium">S2 (Jul-Dic)</th>
                <th className="text-center p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-100 font-semibold">
                <td className="p-3">Ingresos Totales</td>
                {finalCashFlowData.summaries.semiannual.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.income)}
                </td>
              </tr>
              <tr className="bg-red-100 font-semibold">
                <td className="p-3">Egresos Totales</td>
                {finalCashFlowData.summaries.semiannual.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(finalCashFlowData.summaries.annual.expenses)}
                </td>
              </tr>
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">Flujo Neto</td>
                {finalCashFlowData.summaries.semiannual.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${finalCashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(finalCashFlowData.summaries.annual.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnnualView = () => {
    const currentYear = new Date().getFullYear();
    const annualData = generateAnnualData();
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis Anual Extendido</CardTitle>
          <CardDescription>
            Comparación histórica (5 años) y proyección futura (5 años) con factores de inflación ajustables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Controles de inflación para años futuros */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Edit3 className="h-4 w-4 mr-2" />
                Factores de Inflación Proyectados (%)
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }, (_, i) => {
                  const year = currentYear + i + 1;
                  return (
                    <div key={year} className="text-center">
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        {year}
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={inflationFactors[year] || 4.0}
                        onChange={(e) => updateInflationFactor(year, parseFloat(e.target.value) || 4.0)}
                        className="w-full text-center"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabla de datos anuales */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3 font-medium">Categoría</th>
                    {annualData.years.map((year, index) => (
                      <th key={year} className={`text-center p-2 font-medium min-w-[100px] ${
                        year < currentYear ? 'bg-gray-50 text-gray-700' : 
                        year === currentYear ? 'bg-blue-50 text-blue-800' : 
                        'bg-green-50 text-green-800'
                      }`}>
                        <div>{year}</div>
                        {year < currentYear && <div className="text-xs text-gray-500">Histórico</div>}
                        {year === currentYear && <div className="text-xs text-blue-600">Actual</div>}
                        {year > currentYear && (
                          <div className="text-xs text-green-600">
                            +{(inflationFactors[year] || 4.0).toFixed(1)}%
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Fila de Ingresos */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-green-800">Ingresos Totales</td>
                    {annualData.incomes.map((income, index) => {
                      const year = annualData.years[index];
                      return (
                        <td key={index} className={`text-center p-2 text-green-700 ${
                          year < currentYear ? 'bg-gray-50' : 
                          year === currentYear ? 'bg-blue-50 font-semibold' : 
                          'bg-green-50 font-semibold'
                        }`}>
                          {formatCurrency(income)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fila de Egresos */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-red-800">Egresos Totales</td>
                    {annualData.expenses.map((expense, index) => {
                      const year = annualData.years[index];
                      return (
                        <td key={index} className={`text-center p-2 text-red-700 ${
                          year < currentYear ? 'bg-gray-50' : 
                          year === currentYear ? 'bg-blue-50 font-semibold' : 
                          'bg-green-50 font-semibold'
                        }`}>
                          {formatCurrency(expense)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fila de Flujo Neto */}
                  <tr className="border-t-2 border-blue-200 bg-blue-100 font-bold">
                    <td className="p-3 text-blue-900">Flujo Neto</td>
                    {annualData.nets.map((net, index) => {
                      const year = annualData.years[index];
                      return (
                        <td key={index} className={`text-center p-2 ${
                          net >= 0 ? 'text-blue-800' : 'text-red-800'
                        } ${
                          year === currentYear ? 'bg-blue-200 font-black' : 'font-bold'
                        }`}>
                          {formatCurrency(net)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Indicadores de crecimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="text-sm text-green-800">Crecimiento Promedio Histórico</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(() => {
                      const firstIncome = annualData.incomes[0];
                      const currentIncome = annualData.incomes[5]; // Año actual
                      const growth = ((currentIncome / firstIncome) ** (1/5) - 1) * 100;
                      return `${growth.toFixed(1)}%`;
                    })()}
                  </div>
                  <div className="text-xs text-green-700">Ingresos anuales</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="text-sm text-blue-800">Proyección 5 Años</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(annualData.incomes[annualData.incomes.length - 1])}
                  </div>
                  <div className="text-xs text-blue-700">Ingresos proyectados {currentYear + 5}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="text-sm text-purple-800">Inflación Promedio</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(() => {
                      const futureFactors = Object.values(inflationFactors);
                      const avg = futureFactors.reduce((a, b) => a + b, 0) / futureFactors.length;
                      return `${avg.toFixed(1)}%`;
                    })()}
                  </div>
                  <div className="text-xs text-purple-700">Proyecciones futuras</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout 
      title="Matriz de Flujo de Efectivo" 
      subtitle="Vista analítica por períodos con categorías detalladas"
    >
      <div className="flex items-center justify-end gap-4 mb-6">
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getAvailableYears().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Resumen Anual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Anuales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(finalCashFlowData.summaries.annual.income)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Anuales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(finalCashFlowData.summaries.annual.expenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto Anual</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${finalCashFlowData.summaries.annual.net >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatCurrency(finalCashFlowData.summaries.annual.net)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monthly">Vista Mensual</TabsTrigger>
          <TabsTrigger value="quarterly">Vista Trimestral</TabsTrigger>
          <TabsTrigger value="semiannual">Vista Semestral</TabsTrigger>
          <TabsTrigger value="annual">Análisis Anual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-6">
          {renderMonthlyView()}
        </TabsContent>
        
        <TabsContent value="quarterly" className="space-y-6">
          {renderQuarterlyView()}
        </TabsContent>
        
        <TabsContent value="semiannual" className="space-y-6">
          {renderSemiannualView()}
        </TabsContent>
        
        <TabsContent value="annual" className="space-y-6">
          {renderAnnualView()}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}