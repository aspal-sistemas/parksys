import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  MapPin, 
  TreePine, 
  Users, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw
} from "lucide-react";

interface AmenityStats {
  id: number;
  name: string;
  icon: string;
  description: string | null;
  parksCount: number;
  totalCapacity: number;
  utilizationRate: number;
  status: 'active' | 'maintenance' | 'inactive';
}

interface DashboardData {
  totalAmenities: number;
  totalParks: number;
  averageAmenitiesPerPark: number;
  mostPopularAmenities: AmenityStats[];
  amenityDistribution: { name: string; value: number; color: string }[];
  utilizationByPark: { parkName: string; amenitiesCount: number }[];
  statusDistribution: { status: string; count: number; color: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AmenitiesDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: amenities, isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['/api/amenities', refreshKey],
  });

  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks', refreshKey],
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoadingAmenities || isLoadingParks) {
    return (
      <AdminLayout title="Dashboard de Amenidades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Calcular estadísticas usando datos reales
  const parksData = (parks as any[]) || [];
  const amenitiesData = (amenities as any[]) || [];
  const parksWithAmenities = parksData.filter((park: any) => park.amenities && park.amenities.length > 0);
  const totalAmenityAssignments = parksData.reduce((sum: number, park: any) => sum + (park.amenities?.length || 0), 0);
  
  const amenityUsageCount = amenitiesData.map((amenity: any) => {
    const usageCount = parksData.filter((park: any) => 
      park.amenities?.some((a: any) => a.id === amenity.id)
    ).length || 0;
    return {
      ...amenity,
      parksCount: usageCount,
      utilizationRate: parksData.length > 0 ? Math.round((usageCount / parksData.length) * 100) : 0
    };
  }).sort((a: any, b: any) => b.parksCount - a.parksCount);

  const dashboardData: DashboardData = {
    totalAmenities: amenities?.length || 0,
    totalParks: parks?.length || 0,
    averageAmenitiesPerPark: parks?.length ? 
      totalAmenityAssignments / parks.length : 0,
    mostPopularAmenities: amenityUsageCount.slice(0, 5),
    amenityDistribution: amenityUsageCount.slice(0, 6).map((amenity: any, index: number) => ({
      name: amenity.name.length > 12 ? amenity.name.substring(0, 12) + '...' : amenity.name,
      value: amenity.parksCount,
      color: COLORS[index % COLORS.length]
    })),
    utilizationByPark: parks?.slice(0, 8).map((park: any) => ({
      parkName: park.name.length > 15 ? park.name.substring(0, 15) + '...' : park.name,
      amenitiesCount: park.amenities?.length || 0
    })).sort((a: any, b: any) => b.amenitiesCount - a.amenitiesCount) || [],
    statusDistribution: [
      { 
        status: 'Activas', 
        count: amenities?.length || 0, 
        color: '#00C49F' 
      },
      { 
        status: 'En Uso', 
        count: parksWithAmenities.length, 
        color: '#0088FE' 
      },
      { 
        status: 'Sin Asignar', 
        count: (amenities?.length || 0) - new Set(
          parks?.flatMap((park: any) => park.amenities?.map((a: any) => a.id) || [])
        ).size, 
        color: '#FFBB28' 
      }
    ]
  };

  return (
    <AdminLayout title="Dashboard de Amenidades">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Amenidades</h1>
            <p className="mt-2 text-gray-600">
              Estadísticas y análisis del uso de amenidades en los parques
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amenidades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalAmenities}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parques con Amenidades</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parksWithAmenities.length}</div>
              <p className="text-xs text-muted-foreground">
                De {dashboardData.totalParks} parques totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Parque</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.averageAmenitiesPerPark.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Amenidades por parque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura General</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.totalParks > 0 ? 
                  Math.round((parksWithAmenities.length / dashboardData.totalParks) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Parques con amenidades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amenidades por parque */}
          <Card>
            <CardHeader>
              <CardTitle>Amenidades por Parque</CardTitle>
              <p className="text-sm text-muted-foreground">
                Número de amenidades por parque
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.utilizationByPark}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="parkName" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amenitiesCount" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de amenidades */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Amenidades</CardTitle>
              <p className="text-sm text-muted-foreground">
                Uso por tipo de amenidad
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.amenityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.amenityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Amenidades populares y estado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de amenidades populares */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top 5 Amenidades Más Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.mostPopularAmenities.map((amenity, index) => (
                  <div key={amenity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{amenity.name}</p>
                        <p className="text-sm text-gray-500">
                          En {amenity.parksCount} parques ({amenity.utilizationRate}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        Activa
                      </Badge>
                      <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estado de amenidades */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Amenidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.statusDistribution.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium">{status.status}</span>
                    </div>
                    <span className="text-xl font-bold">{status.count}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Sistema Operativo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights y recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Insights y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Oportunidad de Expansión</p>
                  <p className="text-sm text-blue-700">
                    {dashboardData.totalParks - parksWithAmenities.length} parques aún no tienen amenidades asignadas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Cobertura Satisfactoria</p>
                  <p className="text-sm text-green-700">
                    {Math.round((parksWithAmenities.length / (dashboardData.totalParks || 1)) * 100)}% de los parques tienen amenidades disponibles
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}