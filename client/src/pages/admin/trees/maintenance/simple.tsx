import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  PlusCircle, 
  Search, 
  Filter, 
  Download,
  Upload,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function TreeMaintenanceSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [open, setOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar mantenimientos
  const { data: maintenancesData, isLoading } = useQuery({
    queryKey: ['/api/trees/maintenances'],
    retry: 1,
  });

  const maintenances = (maintenancesData as any)?.data || [];

  // Cargar estadísticas básicas
  const totalMaintenances = maintenances.length || 0;
  const recentMaintenances = maintenances.filter((m: any) => {
    const maintenanceDate = new Date(m.maintenanceDate || m.maintenance_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return maintenanceDate >= thirtyDaysAgo;
  }).length || 0;

  // Filtrar mantenimientos
  const filteredMaintenances = maintenances.filter((maintenance: any) => {
    const searchMatch = searchTerm === '' || 
      (maintenance.notes && maintenance.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (maintenance.performedBy && maintenance.performedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const typeMatch = filterType === 'all' || maintenance.maintenanceType === filterType;
    
    return searchMatch && typeMatch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        {/* Header con patrón Card estandarizado */}
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
            <Button 
              onClick={() => setOpen(true)} 
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Mantenimiento
            </Button>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMaintenances}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mantenimientos Recientes</CardTitle>
              <p className="text-xs text-gray-500">Últimos 30 días</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentMaintenances}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMaintenances > 0 ? Math.round((recentMaintenances / totalMaintenances) * 100) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {recentMaintenances > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Activo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Pendiente</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y controles */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar mantenimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos los tipos</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="poda">Poda</option>
                <option value="riego">Riego</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de mantenimientos */}
        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando mantenimientos...</p>
            </div>
          ) : filteredMaintenances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No hay mantenimientos registrados</h3>
              <p>Comienza registrando el primer mantenimiento de árboles.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredMaintenances.map((maintenance: any) => (
                <Card key={maintenance.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{maintenance.maintenanceType || 'Mantenimiento General'}</h4>
                      <p className="text-sm text-gray-500">
                        {maintenance.maintenanceDate || maintenance.maintenance_date || 'Sin fecha'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {maintenance.notes || 'Sin observaciones'}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Por: {maintenance.performedBy || 'No especificado'}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      maintenance.urgency === 'alta' ? 'bg-red-100 text-red-800' :
                      maintenance.urgency === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {maintenance.urgency || 'Normal'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}