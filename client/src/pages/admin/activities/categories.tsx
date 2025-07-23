import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tag, Plus, Edit, Trash2, Search } from 'lucide-react';

// Página de gestión de categorías de actividades
const ActivityCategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Obtener categorías de actividades
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/activity-categories'],
    retry: 1,
  });

  // Obtener actividades para contar por categoría
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/activities'],
    retry: 1,
  });

  // Contar actividades por categoría
  const categoryCounts = (activities as any[]).reduce((acc: any, activity: any) => {
    const categoryName = activity.category || 'Sin categoría';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  // Filtrar categorías por búsqueda
  const filteredCategories = (categories as any[]).filter((category: any) =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryData = [
    { name: 'Arte y Cultura', description: 'Actividades culturales y artísticas', count: categoryCounts['Arte y Cultura'] || 0 },
    { name: 'Deportivo', description: 'Actividades físicas y deportivas', count: categoryCounts['Deportivo'] || 0 },
    { name: 'Recreación y Bienestar', description: 'Actividades de recreación y salud', count: categoryCounts['Recreación y Bienestar'] || 0 },
    { name: 'Naturaleza y Ciencia', description: 'Actividades de educación ambiental', count: categoryCounts['Naturaleza y Ciencia'] || 0 },
    { name: 'Comunidad', description: 'Actividades comunitarias y sociales', count: categoryCounts['Comunidad'] || 0 },
    { name: 'Eventos de Temporada', description: 'Eventos especiales y estacionales', count: categoryCounts['Eventos de Temporada'] || 0 },
    { name: 'Fitness y Ejercicio', description: 'Actividades de acondicionamiento físico', count: categoryCounts['Fitness y Ejercicio'] || 0 },
  ].filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
              </div>
              <p className="text-gray-600 mt-2">Gestión de categorías para actividades en parques</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Categorías</h3>
                <p className="text-3xl font-bold mt-2">{categoryData.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Categorías Activas</h3>
                <p className="text-3xl font-bold mt-2">
                  {categoryData.filter(cat => cat.count > 0).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Actividades</h3>
                <p className="text-3xl font-bold mt-2">
                  {Object.values(categoryCounts).reduce((a: number, b: any) => a + Number(b), 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla de categorías */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Actividades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Cargando categorías...
                  </TableCell>
                </TableRow>
              ) : categoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron categorías
                  </TableCell>
                </TableRow>
              ) : (
                categoryData.map((category, index) => (
                  <TableRow key={category.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {category.count} actividades
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.count > 0 ? "default" : "secondary"}
                        className={category.count > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                      >
                        {category.count > 0 ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Distribución de actividades por categoría */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Distribución por Categoría</h2>
          <div className="space-y-3">
            {categoryData
              .filter(cat => cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((category) => {
                const maxCount = Math.max(...categoryData.map(c => c.count));
                const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
                
                return (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Badge className={`${
                        category.name === 'Arte y Cultura' ? 'bg-green-100 text-green-800' :
                        category.name === 'Deportivo' ? 'bg-red-100 text-red-800' :
                        category.name === 'Recreación y Bienestar' ? 'bg-blue-100 text-blue-800' :
                        category.name === 'Naturaleza y Ciencia' ? 'bg-teal-100 text-teal-800' :
                        category.name === 'Comunidad' ? 'bg-purple-100 text-purple-800' :
                        category.name === 'Eventos de Temporada' ? 'bg-orange-100 text-orange-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {category.name}
                      </Badge>
                      <div className="flex-1">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{category.count} actividades</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityCategoriesPage;