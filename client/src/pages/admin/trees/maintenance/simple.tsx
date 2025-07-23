import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, PlusCircle } from 'lucide-react';

export default function TreeMaintenanceSimple() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <Card className="p-4 bg-gray-50 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wrench className="w-8 h-8 text-gray-900" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mantenimiento de Árboles</h1>
                <p className="text-gray-600 mt-2">
                  Gestiona y registra las actividades de mantenimiento realizadas en árboles
                </p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Mantenimiento
            </Button>
          </div>
        </Card>

        {/* Contenido temporal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total de Mantenimientos</h3>
            <p className="text-2xl font-bold">0</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Mantenimientos Recientes</h3>
            <p className="text-2xl font-bold">0</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Cobertura</h3>
            <p className="text-2xl font-bold">0%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Tipo Más Común</h3>
            <p className="text-sm text-gray-500">Sin datos</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="text-center text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Sistema de Mantenimiento</h3>
            <p>El módulo de mantenimiento de árboles está siendo configurado.</p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}