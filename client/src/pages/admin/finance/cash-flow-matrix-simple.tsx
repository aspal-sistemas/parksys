import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const selectedYear = new Date().getFullYear();
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Cargar datos reales de la matriz de flujo de efectivo
  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ["/api/cash-flow-matrix", selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams({ year: selectedYear.toString() });
      const response = await fetch(`/api/cash-flow-matrix?${params}`);
      return response.json();
    }
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
            <p className="text-gray-600">Proyectado vs Real con Varianza - {selectedYear}</p>
          </div>
        </div>

        {/* Matriz de Flujo de Efectivo con Proyec/Real/Var */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Flujo de Efectivo - {selectedYear}</CardTitle>
            <CardDescription>
              Comparación: Proyectado vs Real con Varianza Porcentual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" style={{ minWidth: '1200px' }}>
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-gray-100">
                    <th rowSpan={2} className="border border-gray-300 p-3 text-left font-semibold sticky left-0 bg-gray-100 z-20" style={{ minWidth: '150px' }}>
                      Categoría
                    </th>
                    <th rowSpan={2} className="border border-gray-300 p-3 text-center font-semibold" style={{ minWidth: '80px' }}>
                      Tipo
                    </th>
                    {months.map((month, index) => (
                      <th key={index} colSpan={3} className="border border-gray-300 p-2 text-center font-semibold text-sm">
                        {month}
                      </th>
                    ))}
                    <th rowSpan={2} className="border border-gray-300 p-3 text-center font-semibold" style={{ minWidth: '100px' }}>
                      Total Anual
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    {months.map((_, index) => (
                      <React.Fragment key={index}>
                        <th className="border border-gray-300 p-1 text-center font-medium text-xs bg-blue-50">Proyec</th>
                        <th className="border border-gray-300 p-1 text-center font-medium text-xs bg-green-50">Real</th>
                        <th className="border border-gray-300 p-1 text-center font-medium text-xs bg-yellow-50">Var%</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((category, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3 font-medium sticky left-0 bg-inherit z-10">
                        {category.name}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <Badge variant={category.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                          {category.type === 'income' ? 'Ing' : 'Gasto'}
                        </Badge>
                      </td>
                      {months.map((_, monthIndex) => (
                        <React.Fragment key={monthIndex}>
                          <td className="border border-gray-300 p-1 text-right text-xs bg-blue-25">
                            {formatCurrency(category.projectedValues?.[monthIndex] || 0)}
                          </td>
                          <td className="border border-gray-300 p-1 text-right text-xs bg-green-25">
                            {formatCurrency(category.monthlyValues[monthIndex] || 0)}
                          </td>
                          <td className={`border border-gray-300 p-1 text-right text-xs font-medium ${
                            Math.abs(category.varianceValues?.[monthIndex] || 0) > 20 ? 'text-red-600' : 
                            Math.abs(category.varianceValues?.[monthIndex] || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {(category.varianceValues?.[monthIndex] || 0).toFixed(1)}%
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border border-gray-300 p-2 text-right font-semibold text-sm">
                        <div className="text-blue-600 text-xs">P: {formatCurrency(category.projectedTotal || 0)}</div>
                        <div className="text-green-600 text-xs">R: {formatCurrency(category.total)}</div>
                        <div className={`text-xs font-bold ${
                          Math.abs(category.totalVariance || 0) > 20 ? 'text-red-600' : 
                          Math.abs(category.totalVariance || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          V: {(category.totalVariance || 0).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}