import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { ArrowLeft, BarChart3, Clock, Wrench, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Función para formatear fechas
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Función para formatear moneda
const formatCurrency = (value: number | null) => {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AssetDashboardPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Consulta de estadísticas de activos
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['/api/assets-stats'],
  });
  
  // Consulta de mantenimientos próximos
  const { data: upcomingMaintenances, isLoading: isLoadingMaintenances } = useQuery({
    queryKey: ['/api/assets/maintenance/upcoming'],
  });
  
  // Función para volver a la lista de activos
  const handleBackToList = () => {
    setLocation('/admin/assets');
  };
  
  // Datos transformados para gráficas
  const statusData = React.useMemo(() => {
    if (!stats?.statusDistribution) return [];
    return Object.entries(stats.statusDistribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats]);
  
  const conditionData = React.useMemo(() => {
    if (!stats?.conditionDistribution) return [];
    return Object.entries(stats.conditionDistribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats]);
  
  const categoryData = React.useMemo(() => {
    if (!stats?.categoryCounts) return [];
    return stats.categoryCounts.map((category: any) => ({
      name: category.name,
      count: category.count,
    }));
  }, [stats]);
  
  const valueByCategoryData = React.useMemo(() => {
    if (!stats?.categoryValues) return [];
    return stats.categoryValues.map((category: any) => ({
      name: category.name,
      value: category.value,
    }));
  }, [stats]);
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard de Activos | ParquesMX</title>
        <meta name="description" content="Estadísticas y análisis de activos en los parques." />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBackToList} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Activos</h1>
            <p className="text-muted-foreground">
              Estadísticas y análisis de activos en todos los parques
            </p>
          </div>
        </div>
      </div>
      
      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-center text-red-500 mb-4">
              <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Error al cargar las estadísticas</h3>
              <p>No se han podido obtener los datos de estadísticas de activos.</p>
            </div>
            <Button onClick={handleBackToList}>
              Volver a la lista de activos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumen general */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Activos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : stats?.totalAssets || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  en todos los parques
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos Activos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : stats?.activeAssets || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeAssetsPercentage ? `${stats.activeAssetsPercentage}% del total` : ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
                <Wrench className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : stats?.maintenanceAssets || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.maintenanceAssetsPercentage ? `${stats.maintenanceAssetsPercentage}% del total` : ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <Info className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  valor actual estimado
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficas */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
                <CardDescription>
                  Cantidad de activos por estado actual
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} activos`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Condición</CardTitle>
                <CardDescription>
                  Cantidad de activos por condición actual
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {conditionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} activos`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Activos por Categoría</CardTitle>
                <CardDescription>
                  Cantidad de activos por categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Cantidad" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Valor por Categoría</CardTitle>
                <CardDescription>
                  Valor total de activos por categoría (MXN)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={valueByCategoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Valor']} />
                      <Legend />
                      <Bar dataKey="value" name="Valor" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Mantenimientos próximos */}
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Próximos</CardTitle>
              <CardDescription>
                Activos que requieren mantenimiento próximamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMaintenances ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                  ))}
                </div>
              ) : !upcomingMaintenances || upcomingMaintenances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No hay mantenimientos programados próximamente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMaintenances.map((maintenance: any) => (
                    <Card key={maintenance.id} className="overflow-hidden">
                      <div className="h-2 w-full bg-yellow-500" />
                      <CardContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="font-medium">{maintenance.asset.name}</h4>
                            <p className="text-muted-foreground text-sm">
                              Fecha: {formatDate(maintenance.nextMaintenanceDate)}
                            </p>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-muted-foreground text-sm">Parque:</p>
                                <p>{maintenance.asset.parkName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm">Categoría:</p>
                                <p>{maintenance.asset.categoryName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm">Responsable:</p>
                                <p>{maintenance.asset.responsiblePerson?.fullName || 'No asignado'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default AssetDashboardPage;