import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';

interface EventCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const defaultColors = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#EF4444', // Rojo
  '#8B5CF6', // Púrpura
  '#F97316', // Naranja
  '#06B6D4', // Cian
  '#84CC16', // Lima
];

export default function EventCategoriesPage() {
  // Obtener categorías simples del endpoint
  const { data: categoriesData = [], isLoading } = useQuery<string[]>({
    queryKey: ['/api/event-categories']
  });

  // Convertir strings a objetos EventCategory para la interfaz
  const categories: EventCategory[] = categoriesData.map((name, index) => ({
    id: index + 1,
    name,
    description: `Categoría de eventos ${name.toLowerCase()}`,
    color: defaultColors[index % defaultColors.length],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Categorías de Eventos</h1>
              </div>
              <p className="text-gray-600 mt-2">Categorías disponibles para clasificar eventos</p>
            </div>
            
            <Badge variant="secondary" className="text-sm">
              {categories.length} categorías disponibles
            </Badge>
          </div>
        </Card>

        {/* Lista de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  
                  <Badge 
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                    className="text-xs"
                  >
                    {category.name}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay categorías disponibles</h3>
              <p className="text-sm">Las categorías de eventos se configuran desde el servidor</p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}