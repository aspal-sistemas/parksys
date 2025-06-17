import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function DashboardPage() {
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/income-categories'],
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => {
      const response = await fetch('/api/income-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
      setFormData({});
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Finanzas del Restaurante</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Panel de control financiero para tu restaurante. 
            Gestiona ingresos por ventas, controla gastos operativos y mantén el seguimiento de la rentabilidad diaria.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Funcionalidades</h3>
              <p className="text-sm text-blue-700">
                5 páginas incluidas
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Base de Datos</h3>
              <p className="text-sm text-green-700">
                5 tablas configuradas
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Estado</h3>
              <p className="text-sm text-purple-700">
                Listo para personalizar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando datos...</div>
          ) : (
            <div>
              <p className="mb-4">Registros encontrados: {data?.length || 0}</p>
              {data?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(data.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
