import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Filter } from 'lucide-react';

const EvaluacionesCriterios = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criterios de Evaluación</h1>
          <p className="text-gray-600 mt-2">Configuración y gestión de criterios de evaluación</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4" />Filtros</Button>
          <Button><Plus className="h-4 w-4" />Nuevo Criterio</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-600">24</div><div className="text-sm text-gray-600">Criterios Activos</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">6</div><div className="text-sm text-gray-600">Categorías</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">18</div><div className="text-sm text-gray-600">En Uso</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">6</div><div className="text-sm text-gray-600">Borradores</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Criterios de Evaluación</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>El módulo de criterios de evaluación está en desarrollo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluacionesCriterios;