import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Wrench, Plus, MapPin, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interfaz para los datos de activos (copiada exactamente de inventory)
interface Asset {
  id: number;
  name: string;
  description: string | null;
  serialNumber: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | string | null;
  parkId: number;
  parkName?: string;
  categoryId: number;
  categoryName?: string;
  status: string;
  condition: string;
  locationDescription: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (value: number | string | null) => {
  if (value === null || value === undefined) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX');
};

const AssetsDashboardFixed: React.FC = () => {
  const [_, setLocation] = useLocation();

  // Consultar datos de activos
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <Alert>
          <AlertDescription>
            Error al cargar los datos de activos. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  // Estadísticas exactamente igual que en inventory
  const totalAssets = assets?.length || 0;
  const totalValue = assets?.reduce((sum, asset) => {
    const cost = typeof asset.acquisitionCost === 'string' 
      ? parseFloat(asset.acquisitionCost) || 0
      : asset.acquisitionCost || 0;
    return sum + cost;
  }, 0) || 0;

  const activeAssets = assets?.filter(asset => asset.status === 'active').length || 0;
  const maintenanceAssets = assets?.filter(asset => asset.status === 'maintenance').length || 0;

  // Calcular activos por condición
  const conditionCounts = assets?.reduce((acc: any, asset) => {
    acc[asset.condition] = (acc[asset.condition] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calcular valores por categoría
  const categoryValues = assets?.reduce((acc: any, asset) => {
    const category = asset.categoryName || 'Sin categoría';
    const cost = typeof asset.acquisitionCost === 'string' 
      ? parseFloat(asset.acquisitionCost) || 0
      : asset.acquisitionCost || 0;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += cost;
    return acc;
  }, {}) || {};

  // Calcular activos por parque
  const assetsByPark = assets?.reduce((acc: any, asset) => {
    const park = asset.parkName || 'Sin parque';
    if (!acc[park]) {
      acc[park] = 0;
    }
    acc[park] += 1;
    return acc;
  }, {}) || {};

  // Obtener el parque con más activos
  const topPark = Object.entries(assetsByPark).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  const totalParks = Object.keys(assetsByPark).length;

  return (
    <AdminLayout>
      {/* Header con patrón Card estandarizado */}
      <Card className="p-4 bg-gray-50 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <p className="text-gray-600 mt-2">
              Análisis y estadísticas de activos en parques
            </p>
          </div>
        </div>
      </Card>



      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Activos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activos en Uso
            </CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
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
            <div className="text-2xl font-bold">{maintenanceAssets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de detalles */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Activos por Condición</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(conditionCounts).map(([condition, count]) => (
                <div key={condition} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{condition}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
              {Object.keys(conditionCounts).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryValues).map(([category, value]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="font-medium">{formatCurrency(value as number)}</span>
                </div>
              ))}
              {Object.keys(categoryValues).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de navegación rápida */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setLocation('/admin/assets/inventory')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Inventario Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ver y gestionar el listado detallado de todos los activos
            </p>
            <div className="mt-2">
              <Badge variant="outline">{totalAssets} activos</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setLocation('/admin/assets/map')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Activos por Parque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Distribución de activos en {totalParks} parques
            </p>
            <div className="mt-2">
              <Badge variant="outline">
                {topPark ? `${topPark[0]}: ${topPark[1]} activos` : 'Sin datos'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setLocation('/admin/assets/maintenance')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Programar y gestionar el mantenimiento de activos
            </p>
            <div className="mt-2">
              <Badge variant="outline">{maintenanceAssets} en mantenimiento</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetsDashboardFixed;