import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, DollarSign, AlertTriangle, Wrench, Plus, MoreHorizontal, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
    currency: 'MXN'
  }).format(numValue);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX');
};

const AssetsDashboardFixed: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultar datos de activos exactamente igual que en inventory
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  // Mutación para eliminar activo
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      const response = await apiRequest(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo eliminado",
        description: "El activo ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el activo. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Funciones para manejar acciones
  const handleViewAsset = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}/details`);
  };

  const handleEditAsset = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}/edit`);
  };

  const handleDeleteAsset = (assetId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción no se puede deshacer.')) {
      deleteAssetMutation.mutate(assetId);
    }
  };

  const handleReportIssue = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}/report-issue`);
  };

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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Activos</h1>
          <p className="text-muted-foreground">
            Panel de control para la gestión de activos del parque
          </p>
        </div>
        <Button onClick={() => setLocation('/admin/assets/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Activo
        </Button>
      </div>

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
              Activos Activos
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

      {/* Lista detallada de activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Listado de Activos</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation('/admin/assets/inventory')}>
                <Package className="mr-2 h-4 w-4" />
                Ver Inventario Completo
              </Button>
              <Button onClick={() => setLocation('/admin/assets/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Activo
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : assets && assets.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Condición</TableHead>
                    <TableHead>Fecha Adquisición</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.id}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.categoryName || 'Sin categoría'}</TableCell>
                      <TableCell>{asset.parkName || 'Sin asignar'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={asset.status === 'active' ? 'default' : 'secondary'}
                          className={
                            asset.status === 'active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }
                        >
                          {asset.status === 'active' ? 'Activo' : 'Mantenimiento'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            asset.condition === 'excellent' ? 'border-green-500 text-green-700' :
                            asset.condition === 'good' ? 'border-blue-500 text-blue-700' :
                            asset.condition === 'fair' ? 'border-yellow-500 text-yellow-700' :
                            asset.condition === 'poor' ? 'border-orange-500 text-orange-700' :
                            'border-red-500 text-red-700'
                          }
                        >
                          {asset.condition === 'excellent' ? 'Excelente' :
                           asset.condition === 'good' ? 'Bueno' :
                           asset.condition === 'fair' ? 'Regular' :
                           asset.condition === 'poor' ? 'Malo' : 'Crítico'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(asset.acquisitionDate)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(asset.acquisitionCost)}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewAsset(asset.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditAsset(asset.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReportIssue(asset.id)}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Reportar Incidencia
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No hay activos registrados en el sistema.</p>
              <Button className="mt-4" onClick={() => setLocation('/admin/assets/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Activo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AssetsDashboardFixed;