import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader, Calendar, MapPin } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@shared/schema';

const AdminActivitiesSimple = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all activities
  const { 
    data: activitiesData = [], 
    isLoading: isLoadingActivities,
    isError: isErrorActivities,
  } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Format date
  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha no válida';
    }
  };

  // Filter activities based on search
  const filteredActivities = activitiesData.filter((activity: any) =>
    activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingActivities) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando actividades...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isErrorActivities) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center text-red-600">
            <p>Error al cargar las actividades</p>
            <p className="text-sm text-gray-500 mt-2">
              Verifica que el servidor esté funcionando correctamente
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
            <p className="text-gray-600 mt-2">
              Administra todas las actividades de los parques
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar actividades por título, descripción o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{activitiesData.length}</div>
            <div className="text-sm text-gray-500">Total de Actividades</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{filteredActivities.length}</div>
            <div className="text-sm text-gray-500">Actividades Mostradas</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {activitiesData.filter((a: any) => new Date(a.startDate) > new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Próximas Actividades</div>
          </div>
        </div>

        {/* Activities table */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Parque</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron actividades</p>
                      <p className="text-sm">
                        {searchQuery ? 'Intenta ajustar tu búsqueda' : 'No hay actividades registradas aún'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity: any) => (
                  <TableRow key={activity.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{activity.title}</div>
                        {activity.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {activity.parkName || `Parque ${activity.parkId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(activity.startDate)}
                      </div>
                    </TableCell>
                    <TableCell>{activity.location || '-'}</TableCell>
                    <TableCell>
                      {activity.category ? (
                        <Badge variant="secondary">{activity.category}</Badge>
                      ) : (
                        <span className="text-gray-400">Sin categoría</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={new Date(activity.startDate) > new Date() ? "default" : "outline"}
                      >
                        {new Date(activity.startDate) > new Date() ? "Próxima" : "Pasada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Mostrando {filteredActivities.length} de {activitiesData.length} actividades totales
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivitiesSimple;