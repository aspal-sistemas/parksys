import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function VentasDiariasPage() {
  const [ventaData, setVentaData] = useState({
    mesa: '',
    mesero: '',
    platillos: [],
    bebidas: [],
    total: 0,
    metodoPago: 'efectivo',
    propina: 0
  });

  const queryClient = useQueryClient();

  const { data: ventasHoy, isLoading } = useQuery({
    queryKey: ['/api/ventas-diarias'],
  });

  const registrarVenta = useMutation({
    mutationFn: async (venta) => {
      const response = await fetch('/api/actual-incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: 1, // Ventas de comida
          concept: `Mesa ${venta.mesa} - ${venta.mesero}`,
          amount: venta.total,
          date: new Date().toISOString().split('T')[0],
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          description: `Platillos: ${venta.platillos.join(', ')}, Pago: ${venta.metodoPago}`
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/actual-incomes'] });
      setVentaData({
        mesa: '',
        mesero: '',
        platillos: [],
        bebidas: [],
        total: 0,
        metodoPago: 'efectivo',
        propina: 0
      });
    },
  });

  const calcularTotal = () => {
    // Lógica para calcular total de platillos y bebidas
    return ventaData.platillos.length * 150 + ventaData.bebidas.length * 50;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ventas Diarias</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de venta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Registrar Nueva Venta</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); registrarVenta.mutate(ventaData); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mesa</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={ventaData.mesa}
                  onChange={(e) => setVentaData(prev => ({...prev, mesa: e.target.value}))}
                  placeholder="Número de mesa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mesero</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={ventaData.mesero}
                  onChange={(e) => setVentaData(prev => ({...prev, mesero: e.target.value}))}
                  placeholder="Nombre del mesero"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total ($)</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-md"
                value={ventaData.total}
                onChange={(e) => setVentaData(prev => ({...prev, total: parseFloat(e.target.value)}))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <select
                className="w-full p-2 border rounded-md"
                value={ventaData.metodoPago}
                onChange={(e) => setVentaData(prev => ({...prev, metodoPago: e.target.value}))}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={registrarVenta.isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {registrarVenta.isPending ? 'Registrando...' : 'Registrar Venta'}
            </button>
          </form>
        </div>

        {/* Resumen del día */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Resumen del Día</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Ventas de Hoy</h3>
              <p className="text-2xl font-bold text-green-700">$2,450.00</p>
              <p className="text-sm text-green-600">32 órdenes procesadas</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Ticket Promedio</h3>
              <p className="text-2xl font-bold text-blue-700">$76.56</p>
              <p className="text-sm text-blue-600">Por mesa servida</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Método Más Usado</h3>
              <p className="text-lg font-bold text-purple-700">Tarjeta (65%)</p>
              <p className="text-sm text-purple-600">Efectivo: 25%, Transferencia: 10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de ventas del día */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Ventas de Hoy</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Cargando ventas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Hora</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Mesa</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Mesero</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Método</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">14:30</td>
                  <td className="border border-gray-200 px-4 py-2">Mesa 5</td>
                  <td className="border border-gray-200 px-4 py-2">Carlos</td>
                  <td className="border border-gray-200 px-4 py-2">Tarjeta</td>
                  <td className="border border-gray-200 px-4 py-2 text-right font-semibold">$180.50</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">14:15</td>
                  <td className="border border-gray-200 px-4 py-2">Mesa 3</td>
                  <td className="border border-gray-200 px-4 py-2">Ana</td>
                  <td className="border border-gray-200 px-4 py-2">Efectivo</td>
                  <td className="border border-gray-200 px-4 py-2 text-right font-semibold">$95.00</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">13:45</td>
                  <td className="border border-gray-200 px-4 py-2">Mesa 8</td>
                  <td className="border border-gray-200 px-4 py-2">Miguel</td>
                  <td className="border border-gray-200 px-4 py-2">Transferencia</td>
                  <td className="border border-gray-200 px-4 py-2 text-right font-semibold">$220.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}