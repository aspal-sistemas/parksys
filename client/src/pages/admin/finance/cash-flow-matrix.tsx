import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, TrendingDown, Calculator, Download } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'semiannual'>('monthly');

  // Datos simulados para la matriz
  const cashFlowData: CashFlowMatrixData = {
    year: selectedYear,
    months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    categories: [
      {
        name: "Concesiones",
        type: "income",
        monthlyValues: [12000, 11500, 13000, 12500, 13500, 14000, 15000, 14500, 13000, 12000, 11000, 12000],
        total: 154000
      },
      {
        name: "Eventos",
        type: "income", 
        monthlyValues: [8000, 7500, 9000, 8500, 9500, 10000, 11000, 10500, 9000, 8000, 7000, 8000],
        total: 106000
      },
      {
        name: "Servicios",
        type: "income",
        monthlyValues: [1500, 1400, 1600, 1550, 1650, 1700, 1800, 1750, 1600, 1500, 1400, 1500],
        total: 18950
      },
      {
        name: "Mantenimiento",
        type: "expense",
        monthlyValues: [5000, 4800, 5200, 5100, 5300, 5500, 5800, 5600, 5200, 5000, 4800, 5000],
        total: 62300
      },
      {
        name: "Personal",
        type: "expense",
        monthlyValues: [15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000],
        total: 180000
      },
      {
        name: "Servicios Públicos",
        type: "expense",
        monthlyValues: [2500, 2300, 2600, 2400, 2700, 2800, 3000, 2900, 2600, 2500, 2300, 2500],
        total: 31100
      }
    ],
    summaries: {
      monthly: {
        income: [21500, 20400, 23600, 22550, 24650, 25700, 27800, 26750, 23600, 21500, 19400, 21500],
        expenses: [22500, 22100, 22800, 22500, 23000, 23300, 23800, 23500, 22800, 22500, 22100, 22500],
        net: [-1000, -1700, 800, 50, 1650, 2400, 4000, 3250, 800, -1000, -2700, -1000]
      },
      quarterly: {
        income: [65500, 72900, 78100, 62400],
        expenses: [67400, 68800, 70100, 67100],
        net: [-1900, 4100, 8000, -4700]
      },
      semiannual: {
        income: [138400, 140500],
        expenses: [136200, 137200],
        net: [2200, 3300]
      },
      annual: {
        income: 278900,
        expenses: 273400,
        net: 5500
      }
    }
  };

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
                {cashFlowData.months.map((month) => (
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
              {cashFlowData.categories.filter(cat => cat.type === 'income').map((category) => (
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
                {cashFlowData.summaries.monthly.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(cashFlowData.summaries.annual.income)}
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
              {cashFlowData.categories.filter(cat => cat.type === 'expense').map((category) => (
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
                {cashFlowData.summaries.monthly.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(cashFlowData.summaries.annual.expenses)}
                </td>
              </tr>

              {/* Flujo Neto */}
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">FLUJO NETO</td>
                {cashFlowData.summaries.monthly.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${cashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(cashFlowData.summaries.annual.net)}
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
                {cashFlowData.summaries.quarterly.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(cashFlowData.summaries.annual.income)}
                </td>
              </tr>
              <tr className="bg-red-100 font-semibold">
                <td className="p-3">Egresos Totales</td>
                {cashFlowData.summaries.quarterly.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(cashFlowData.summaries.annual.expenses)}
                </td>
              </tr>
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">Flujo Neto</td>
                {cashFlowData.summaries.quarterly.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${cashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(cashFlowData.summaries.annual.net)}
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
                {cashFlowData.summaries.semiannual.income.map((value, index) => (
                  <td key={index} className="text-center p-3 text-green-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-green-800">
                  {formatCurrency(cashFlowData.summaries.annual.income)}
                </td>
              </tr>
              <tr className="bg-red-100 font-semibold">
                <td className="p-3">Egresos Totales</td>
                {cashFlowData.summaries.semiannual.expenses.map((value, index) => (
                  <td key={index} className="text-center p-3 text-red-800">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="text-center p-3 text-red-800">
                  {formatCurrency(cashFlowData.summaries.annual.expenses)}
                </td>
              </tr>
              <tr className="bg-blue-100 font-bold border-t-2">
                <td className="p-3">Flujo Neto</td>
                {cashFlowData.summaries.semiannual.net.map((value, index) => (
                  <td key={index} className={`text-center p-3 ${value >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className={`text-center p-3 ${cashFlowData.summaries.annual.net >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  {formatCurrency(cashFlowData.summaries.annual.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

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
    </AdminLayout>
  );
}