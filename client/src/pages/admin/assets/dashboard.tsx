import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, AlertTriangle, Wrench, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'wouter';

// Definir tipos para los datos del dashboard
interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  inactiveAssets: number;
  maintenanceAssets: number;
  activeAssetsPercentage: number;
  maintenanceAssetsPercentage: number;
  conditionDistribution: {
    [key: string]: number;
  };
  statusDistribution: {
    [key: string]: number;
  };
  needMaintenance: number;
  needMaintenanceList: {
    id: number;
    name: string;
    condition: string;
    lastMaintenanceDate: string | null;
    nextMaintenanceDate: string | null;
  }[];
  categoryValues: {
    category: string;
    totalValue: number;
  }[];
  // Para compatibilidad
  totalValue: number;
  byCategory: {
    category: string;
    count: number;
  }[];
  byCondition: {
    condition: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
}

// Tipo para los mantenimientos próximos
interface UpcomingMaintenance {
  id: number;
  assetId: number;
  assetName: string;
  date: string;
  maintenanceType: string;
  status: string;
  performedBy: string | null;
}

const getAssetStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'bueno':
    case 'good':
    case 'óptimo':
    case 'excelente':
      return 'bg-green-500';
    case 'regular':
    case 'aceptable':
    case 'fair':
      return 'bg-yellow-500';
    case 'malo':
    case 'poor':
    case 'crítico':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getMaintenanceStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'programado':
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'pendiente':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completado':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'vencido':
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const AssetsDashboard: React.FC = () => {
  const [_, setLocation] = useLocation();

  // Obtener datos del dashboard de activos
  const { data: stats, isLoading, error } = useQuery<AssetStats>({
    queryKey: ['/api/assets-stats'],
    retry: 1,
    onError: (error) => {
      // Si hay un error 401 (no autorizado), redirigir a la página de login
      if ((error as any)?.response?.status === 401) {
        setLocation('/login');
      }
    }
  });

  // Obtener próximos mantenimientos
  const { data: upcomingMaintenances, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['/api/assets/maintenance/upcoming'],
    retry: 1,
    onError: (error) => {
      // Si hay un error 401 (no autorizado), redirigir a la página de login
      if ((error as any)?.response?.status === 401) {
        setLocation('/login');
      }
    }
  });

  // Calcular porcentajes para el gráfico de distribución de condiciones
  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Convertir objeto de distribución a array para poder mapearlo
  const conditionDistributionToArray = (distribution: Record<string, number> = {}) => {
    return Object.entries(distribution).map(([condition, count]) => ({
      condition,
      count
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard de Activos</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-60 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard de Activos</h1>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar datos</h2>
                <p className="mb-4">
                  No se pudieron cargar las estadísticas de activos. Por favor, intenta de nuevo más tarde.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard de Activos</h1>
          <Button onClick={() => setLocation('/admin/assets')}>
            Ver todos los activos
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAssets}</div>
              <p className="text-sm text-gray-500">
                {stats.activeAssets} activos, {stats.inactiveAssets} inactivos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Activos en Buen Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Buscar condiciones que indiquen buen estado */}
              <div className="text-3xl font-bold text-green-600">
                {(() => {
                  // Filtrar condiciones de buen estado del objeto
                  const goodConditionKeys = Object.keys(stats.conditionDistribution || {}).filter(
                    key => ['bueno', 'good', 'óptimo', 'excelente'].includes(key.toLowerCase())
                  );
                  // Sumar los conteos de todas las condiciones buenas
                  const total = goodConditionKeys.reduce(
                    (sum, key) => sum + (stats.conditionDistribution[key] || 0), 
                    0
                  );
                  return total;
                })()}
              </div>
              <p className="text-sm text-gray-500">
                {(() => {
                  // Filtrar condiciones de buen estado del objeto
                  const goodConditionKeys = Object.keys(stats.conditionDistribution || {}).filter(
                    key => ['bueno', 'good', 'óptimo', 'excelente'].includes(key.toLowerCase())
                  );
                  // Sumar los conteos de todas las condiciones buenas
                  const total = goodConditionKeys.reduce(
                    (sum, key) => sum + (stats.conditionDistribution[key] || 0), 
                    0
                  );
                  return calculatePercentage(total, stats.totalAssets);
                })()}% del total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Requieren Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {stats.needMaintenance || 0}
              </div>
              <p className="text-sm text-gray-500">
                {calculatePercentage(stats.needMaintenance || 0, stats.totalAssets)}% del total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Próximos Mantenimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {upcomingMaintenances?.length || 0}
              </div>
              <p className="text-sm text-gray-500">
                Programados para el próximo mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución por Condición */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de los Activos</CardTitle>
              <CardDescription>Distribución por condición</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditionDistributionToArray(stats.conditionDistribution).map((condition) => (
                  <div key={condition.condition} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getAssetStatusColor(condition.condition)}`} />
                        <span className="font-medium">{condition.condition}</span>
                      </div>
                      <span className="text-gray-500">
                        {condition.count} ({calculatePercentage(condition.count, stats.totalAssets)}%)
                      </span>
                    </div>
                    <Progress
                      value={calculatePercentage(condition.count, stats.totalAssets)}
                      className={`h-2 ${getAssetStatusColor(condition.condition)}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Valor por Categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Valor por Categoría</CardTitle>
              <CardDescription>Distribución de valor de activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.categoryValues || []).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(category.totalValue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Próximos Mantenimientos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Próximos Mantenimientos
            </CardTitle>
            <CardDescription>
              Mantenimientos programados para los próximos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUpcoming ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : upcomingMaintenances && upcomingMaintenances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMaintenances.map((maintenance) => (
                    <TableRow key={maintenance.id} 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => setLocation(`/admin/assets/${maintenance.assetId}`)}
                    >
                      <TableCell className="font-medium">{maintenance.assetName}</TableCell>
                      <TableCell>
                        {format(new Date(maintenance.date), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{maintenance.type}</TableCell>
                      <TableCell>
                        <Badge className={getMaintenanceStatusColor(maintenance.status)}>
                          {maintenance.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay mantenimientos programados para los próximos 30 días</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Mantenimientos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Mantenimientos Recientes
            </CardTitle>
            <CardDescription>
              Últimos mantenimientos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentMaintenances && Array.isArray(stats.recentMaintenances) && stats.recentMaintenances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Realizado por</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentMaintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell className="font-medium">{maintenance.assetName}</TableCell>
                      <TableCell>
                        {format(new Date(maintenance.date), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{maintenance.type}</TableCell>
                      <TableCell>{maintenance.performedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay registros de mantenimientos recientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetsDashboard;