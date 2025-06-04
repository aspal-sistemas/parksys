import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, AlertTriangle, Wrench, Clock, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Definir tipos para los datos del dashboard
interface AssetStats {
  total: number;
  totalValue: number;
  byStatus: {
    [key: string]: number;
  };
  byCondition: {
    [key: string]: number;
  };
  categoryValues: {
    category: string;
    totalValue: number;
  }[];
}

const formatCurrency = (value: number | string | null) => {
  if (value === null || value === undefined) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(numValue);
};

const AssetsDashboard: React.FC = () => {
  const [_, setLocation] = useLocation();

  // Consulta para obtener todos los activos
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useQuery<any[]>({
    queryKey: ['/api/assets'],
  });
  
  // Debug: verificar datos
  React.useEffect(() => {
    console.log('Dashboard - Assets data:', assets);
    console.log('Dashboard - Assets loading:', assetsLoading);
    console.log('Dashboard - Assets error:', assetsError);
  }, [assets, assetsLoading, assetsError]);

  // Consulta para obtener estadísticas de activos
  const { data: stats, isLoading: statsLoading, error } = useQuery<AssetStats>({
    queryKey: ['/api/assets-stats'],
    enabled: true,
  });

  const isLoading = assetsLoading || statsLoading;

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las estadísticas de activos. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  // Calcular valores de la misma manera que en la página de inventario
  const totalAssets = assets?.length || 0;
  const totalValue = assets?.reduce((sum: number, asset: any) => {
    const cost = typeof asset.acquisitionCost === 'string' 
      ? parseFloat(asset.acquisitionCost) 
      : (asset.acquisitionCost || 0);
    return sum + cost;
  }, 0) || 0;

  const activeAssets = stats?.byStatus?.active || 0;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Activos</h1>
          <p className="text-muted-foreground">
            Panel de control y estadísticas de activos del parque.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLocation('/admin/assets/inventory')}>
            Ver Inventario
          </Button>
          <Button onClick={() => setLocation('/admin/assets/create')} variant="default">
            Agregar Activo
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Activos
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalAssets}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activos Activos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : activeAssets}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAssets > 0 ? `${Math.round((activeAssets / totalAssets) * 100)}% del total` : '0% del total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Mantenimiento
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : (stats?.byStatus?.maintenance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por condición */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Condición</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats?.byCondition || {}).map(([condition, count]) => (
                  <div key={condition} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{condition}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.categoryValues?.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="font-medium">{formatCurrency(category.totalValue)}</span>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetsDashboard;