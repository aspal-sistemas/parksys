import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Filter } from 'lucide-react';

const EvaluacionesVoluntarios = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones de Voluntarios</h1>
          <p className="text-gray-600 mt-2">Gestión y seguimiento de evaluaciones de voluntarios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4" />Filtros</Button>
          <Button><Plus className="h-4 w-4" />Nueva Evaluación</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-purple-600">32</div><div className="text-sm text-gray-600">Voluntarios Evaluados</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">4.3</div><div className="text-sm text-gray-600">Promedio General</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">5</div><div className="text-sm text-gray-600">Pendientes</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">127</div><div className="text-sm text-gray-600">Total Evaluaciones</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Voluntarios con Evaluaciones</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>El módulo de evaluaciones de voluntarios está en desarrollo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluacionesVoluntarios;