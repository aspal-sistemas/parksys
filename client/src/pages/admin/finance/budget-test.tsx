import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";

export default function BudgetTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/budgets'],
  });

  console.log('Budget data:', data);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Prueba de Presupuesto</h1>
        
        {isLoading && <div>Cargando...</div>}
        
        {error && <div className="text-red-600">Error: {error.toString()}</div>}
        
        {data && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Datos recibidos:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        {!isLoading && !error && !data && (
          <div>No hay datos disponibles</div>
        )}
      </div>
    </AdminLayout>
  );
}