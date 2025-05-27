import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, TrendingDown, Calculator, Download } from "lucide-react";

interface CashFlowMatrixData {
  year: number;
  months: string[];
  incomeCategories: {
    id: number;
    name: string;
    monthlyData: number[];
    total: number;
  }[];
  expenseCategories: {
    id: number;
    name: string;
    monthlyData: number[];
    total: number;
  }[];
  monthlyTotals: {
    income: number[];
    expenses: number[];
    netFlow: number[];
  };
  summaries: {
    quarterly: {
      q1: { income: number; expenses: number; net: number };
      q2: { income: number; expenses: number; net: number };
      q3: { income: number; expenses: number; net: number };
      q4: { income: number; expenses: number; net: number };
    };
    semiannual: {
      h1: { income: number; expenses: number; net: number };
      h2: { income: number; expenses: number; net: number };
    };
    annual: {
      income: number;
      expenses: number;
      net: number;
    };
  };
}

const monthNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export default function CashFlowMatrix() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"monthly" | "quarterly" | "semiannual">("monthly");

  const { data: cashFlowData, isLoading } = useQuery<CashFlowMatrixData>({
    queryKey: ["/direct/cash-flow-matrix", selectedYear],
    queryFn: () => fetch(`/direct/cash-flow-matrix?year=${selectedYear}`).then(res => res.json()),
    enabled: true
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matriz de Flujo de Efectivo</h1>
            <p className="text-muted-foreground">Vista analítica por períodos</p>
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cashFlowData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matriz de Flujo de Efectivo</h1>
            <p className="text-muted-foreground">Vista analítica por períodos</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No hay datos disponibles para el año seleccionado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderMonthlyView = () => (
    <div className="space-y-6">
      {/* Tabla de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Ingresos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold min-w-[200px]">Categoría</th>
                  {monthNames.map((month, index) => (
                    <th key={month} className="text-center p-3 font-semibold min-w-[100px]">
                      {month}
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold min-w-[120px] bg-green-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.incomeCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{category.name}</td>
                    {category.monthlyData.map((amount, index) => (
                      <td key={index} className="p-3 text-center">
                        {amount > 0 ? (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center bg-green-50">
                      <span className="text-green-700 font-bold">
                        {formatCurrency(category.total)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 bg-green-100">
                  <td className="p-3 font-bold">Total Ingresos</td>
                  {cashFlowData.monthlyTotals.income.map((total, index) => (
                    <td key={index} className="p-3 text-center font-bold text-green-700">
                      {formatCurrency(total)}
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold text-green-700 bg-green-200">
                    {formatCurrency(cashFlowData.summaries.annual.income)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Egresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Egresos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold min-w-[200px]">Categoría</th>
                  {monthNames.map((month, index) => (
                    <th key={month} className="text-center p-3 font-semibold min-w-[100px]">
                      {month}
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold min-w-[120px] bg-red-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.expenseCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{category.name}</td>
                    {category.monthlyData.map((amount, index) => (
                      <td key={index} className="p-3 text-center">
                        {amount > 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatCurrency(amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center bg-red-50">
                      <span className="text-red-700 font-bold">
                        {formatCurrency(category.total)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 bg-red-100">
                  <td className="p-3 font-bold">Total Egresos</td>
                  {cashFlowData.monthlyTotals.expenses.map((total, index) => (
                    <td key={index} className="p-3 text-center font-bold text-red-700">
                      {formatCurrency(total)}
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold text-red-700 bg-red-200">
                    {formatCurrency(cashFlowData.summaries.annual.expenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Flujo Neto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Flujo Neto de Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold min-w-[200px]">Concepto</th>
                  {monthNames.map((month, index) => (
                    <th key={month} className="text-center p-3 font-semibold min-w-[100px]">
                      {month}
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold min-w-[120px] bg-blue-50">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-blue-50">
                  <td className="p-3 font-bold">Flujo Neto</td>
                  {cashFlowData.monthlyTotals.netFlow.map((net, index) => (
                    <td key={index} className="p-3 text-center font-bold">
                      <span className={net >= 0 ? "text-green-700" : "text-red-700"}>
                        {formatCurrency(net)}
                      </span>
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold bg-blue-100">
                    <span className={cashFlowData.summaries.annual.net >= 0 ? "text-green-700" : "text-red-700"}>
                      {formatCurrency(cashFlowData.summaries.annual.net)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuarterlyView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Trimestral {selectedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(cashFlowData.summaries.quarterly).map(([quarter, data]) => (
            <Card key={quarter}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {quarter.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Ingresos:</span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(data.income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Egresos:</span>
                  <span className="font-medium text-red-700">
                    {formatCurrency(data.expenses)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-semibold">Neto:</span>
                  <span className={`font-bold ${data.net >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatCurrency(data.net)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSemiannualView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Semestral {selectedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(cashFlowData.summaries.semiannual).map(([semester, data]) => (
            <Card key={semester}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  {semester === 'h1' ? 'Primer Semestre' : 'Segundo Semestre'}
                </CardTitle>
                <CardDescription>
                  {semester === 'h1' ? 'Enero - Junio' : 'Julio - Diciembre'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">Ingresos:</span>
                  <span className="font-medium text-green-700 text-lg">
                    {formatCurrency(data.income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Egresos:</span>
                  <span className="font-medium text-red-700 text-lg">
                    {formatCurrency(data.expenses)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold text-lg">Flujo Neto:</span>
                  <span className={`font-bold text-xl ${data.net >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatCurrency(data.net)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matriz de Flujo de Efectivo</h1>
          <p className="text-muted-foreground">Vista analítica por períodos con categorías detalladas</p>
        </div>
        <div className="flex items-center gap-4">
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
      </div>

      {/* Resumen Anual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Anuales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(cashFlowData.summaries.annual.income)}
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
              {formatCurrency(cashFlowData.summaries.annual.expenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo Neto Anual</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlowData.summaries.annual.net >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatCurrency(cashFlowData.summaries.annual.net)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Vista Mensual</TabsTrigger>
          <TabsTrigger value="quarterly">Vista Trimestral</TabsTrigger>
          <TabsTrigger value="semiannual">Vista Semestral</TabsTrigger>
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
      </Tabs>
    </div>
  );
}