import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface Budget {
  id: number;
  name: string;
  year: number;
  status: string;
  totalIncome: string;
  totalExpenses: string;
  notes: string;
  municipalityId?: number;
}

const statusLabels = {
  draft: "Borrador",
  approved: "Aprobado", 
  active: "Activo",
  archived: "Archivado"
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  approved: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800"
};

export default function BudgetSimple() {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['/api/budgets'],
  });

  // Asegurar que budgets es un array
  const budgetList = Array.isArray(budgets) ? budgets : [];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Presupuesto Anual</h1>
          <div>Cargando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Presupuesto Anual</h1>
        
        {budgetList.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No hay presupuestos disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgetList.map((budget: Budget) => (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{budget.name}</CardTitle>
                      <p className="text-sm text-gray-500">Año {budget.year}</p>
                    </div>
                    <Badge className={statusColors[budget.status as keyof typeof statusColors]}>
                      {statusLabels[budget.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(budget.totalIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(budget.totalExpenses)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Balance</p>
                    <p className={`text-lg font-semibold ${
                      parseFloat(budget.totalIncome) - parseFloat(budget.totalExpenses) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(
                        (parseFloat(budget.totalIncome) - parseFloat(budget.totalExpenses)).toString()
                      )}
                    </p>
                  </div>
                  {budget.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">Notas</p>
                      <p className="text-sm text-gray-800">{budget.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}