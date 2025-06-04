import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Tag, Users, MapPin, Clock, Edit, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

// Mapeo de categorías
const CATEGORIAS_MAP = {
  'artecultura': 'Arte y Cultura',
  'recreacionbienestar': 'Recreación y Bienestar',
  'temporada': 'Eventos de Temporada',
  'naturalezaciencia': 'Naturaleza y Ciencia',
  'deportivo': 'Deportivo',
  'comunidad': 'Comunidad'
};

// Página principal del módulo de Organizador
const OrganizadorPage: React.FC = () => {
  // Obtener actividades
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/activities']
  });

  // Obtener parques
  const { data: parks = [], isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks']
  });

  // Calcular estadísticas
  const totalActivities = activities.length;
  const activeActivities = activities.filter(a => new Date(a.startDate) >= new Date()).length;
  
  // Contar actividades por categoría
  const categoryCounts = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {});

  // Contar actividades por parque
  const parkCounts = activities.reduce((acc, activity) => {
    acc[activity.parkId] = (acc[activity.parkId] || 0) + 1;
    return acc;
  }, {});

  // Crear mapa de nombres de parques
  const parkNamesMap = parks.reduce((acc, park) => {
    acc[park.id] = park.name;
    return acc;
  }, {});

  // Obtener parques con más actividades
  const topParks = Object.entries(parkCounts)
    .map(([parkId, count]) => ({
      parkId: parseInt(parkId),
      name: parkNamesMap[parkId] || `Parque ${parkId}`,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Actividades próximas (próximas 5)
  const upcomingActivities = activities
    .filter(a => new Date(a.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  const maxParkCount = Math.max(...Object.values(parkCounts), 1);
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizador</h1>
          <p className="text-gray-500">Gestión de actividades y eventos en parques</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/organizador/nueva-actividad">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nueva Actividad
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Actividades</h3>
              <p className="text-3xl font-bold mt-2">{isLoadingActivities ? '...' : totalActivities}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Actividades Próximas</h3>
              <p className="text-3xl font-bold mt-2">{isLoadingActivities ? '...' : activeActivities}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Categorías Activas</h3>
              <p className="text-3xl font-bold mt-2">{isLoadingActivities ? '...' : Object.keys(categoryCounts).length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4">Actividades Próximas</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Parque</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingActivities ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Cargando actividades...
                </TableCell>
              </TableRow>
            ) : upcomingActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay actividades próximas programadas
                </TableCell>
              </TableRow>
            ) : (
              upcomingActivities.map((activity: any) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORIAS_MAP[activity.category] || activity.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{parkNamesMap[activity.parkId] || `Parque ${activity.parkId}`}</TableCell>
                  <TableCell>
                    {new Date(activity.startDate).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>{activity.location || 'Sin especificar'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/organizador/catalogo/${activity.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/organizador/catalogo/editar/${activity.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Categorías de Actividades</h2>
          <div className="space-y-2">
            {isLoadingActivities ? (
              <div className="text-center py-4 text-gray-500">Cargando categorías...</div>
            ) : Object.keys(categoryCounts).length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay categorías disponibles</div>
            ) : (
              Object.entries(categoryCounts).map(([category, count]: [string, any]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      category === 'artecultura' ? 'bg-green-100 text-green-800' :
                      category === 'recreacionbienestar' ? 'bg-blue-100 text-blue-800' :
                      category === 'temporada' ? 'bg-orange-100 text-orange-800' :
                      category === 'deportivo' ? 'bg-red-100 text-red-800' :
                      category === 'comunidad' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                    } hover:${
                      category === 'artecultura' ? 'bg-green-100' :
                      category === 'recreacionbienestar' ? 'bg-blue-100' :
                      category === 'temporada' ? 'bg-orange-100' :
                      category === 'deportivo' ? 'bg-red-100' :
                      category === 'comunidad' ? 'bg-purple-100' :
                      'bg-emerald-100'
                    }`}>
                      {CATEGORIAS_MAP[category] || category}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">{count} actividades</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Parques con Más Actividades</h2>
          <div className="space-y-2">
            {isLoadingParks || isLoadingActivities ? (
              <div className="text-center py-4 text-gray-500">Cargando parques...</div>
            ) : topParks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay parques con actividades</div>
            ) : (
              topParks.map((park: any) => (
                <div key={park.parkId} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{park.name}</span>
                      <span className="text-sm text-gray-500">{park.count} actividades</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(park.count / maxParkCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrganizadorPage;