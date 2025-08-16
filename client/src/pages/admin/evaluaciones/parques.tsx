import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Eye, Plus, Filter } from 'lucide-react';

const EvaluacionesParques = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones de Parques</h1>
          <p className="text-gray-600 mt-2">
            Gestión y seguimiento de evaluaciones de parques urbanos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">24</div>
            <div className="text-sm text-gray-600">Parques Evaluados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">4.2</div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Total Evaluaciones</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Parques */}
      <Card>
        <CardHeader>
          <CardTitle>Parques con Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder para evaluaciones */}
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>El módulo de evaluaciones de parques está en desarrollo.</p>
              <p className="text-sm">Próximamente podrás gestionar evaluaciones detalladas.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluacionesParques;