import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Trees, Calendar, Users, TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ParksDashboardData {
  totalParks: number;
  totalSurface: number;
  totalGreenArea: number;
  totalVisitors: number;
  activeParks: number;
  maintenanceAreas: number;
  totalActivities: number;
  totalVolunteers: number;
  totalTrees: number;
  averageRating: number;
  parksByMunicipality: Array<{
    municipalityName: string;
    count: number;
  }>;
  parksByType: Array<{
    type: string;
    count: number;
  }>;
  recentActivities: Array<{
    id: number;
    title: string;
    parkName: string;
    date: string;
    participants: number;
  }>;
  parksWithCoordinates: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    municipality: string;
    type: string;
    area: number;
    status: string;
  }>;
  conservationStatus: Array<{
    status: string;
    count: number;
  }>;
}

const ParksDashboard = () => {
  const { data, isLoading, error } = useQuery<ParksDashboardData>({
    queryKey: ['/api/parks/dashboard'],
  });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard de Parques">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Resumen Operativo de Parques">
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar los datos del resumen operativo</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="Resumen Operativo de Parques">
        <div className="text-center py-8">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </AdminLayout>
    );
  }

  // Centro del mapa basado en México
  const mexicoCenter: [number, number] = [19.4326, -99.1332]; // Ciudad de México

  return (
    <AdminLayout title="Dashboard de Parques">
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Parques</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalParks}</div>
              <p className="text-xs text-muted-foreground">
                {data.activeParks} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Superficie Total</CardTitle>
              <Trees className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalSurface ? `${(data.totalSurface / 10000).toFixed(1)} ha` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Área verde: {data.totalGreenArea ? `${(data.totalGreenArea / 10000).toFixed(1)} ha` : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividades</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalActivities}</div>
              <p className="text-xs text-muted-foreground">
                Eventos programados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalVolunteers}</div>
              <p className="text-xs text-muted-foreground">
                Activos en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Árboles</CardTitle>
              <Trees className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalTrees}</div>
              <p className="text-xs text-muted-foreground">
                En inventario
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalVisitors ? data.totalVisitors.toLocaleString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Visitantes totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.averageRating ? data.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio de evaluaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.maintenanceAreas}</div>
              <p className="text-xs text-muted-foreground">
                Áreas en mantenimiento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de parques */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación de Parques</CardTitle>
            <CardDescription>
              Mapa interactivo mostrando la ubicación de todos los parques en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <MapContainer
                center={mexicoCenter}
                zoom={6}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data.parksWithCoordinates?.filter(park => 
                  park.latitude != null && park.longitude != null && 
                  !isNaN(park.latitude) && !isNaN(park.longitude)
                ).map((park) => (
                  <Marker
                    key={park.id}
                    position={[park.latitude, park.longitude]}
                  >
                    <Popup>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{park.name}</h3>
                        <p className="text-sm text-gray-600">{park.municipality}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {park.type}
                          </Badge>
                          {park.area && (
                            <Badge variant="secondary" className="text-xs">
                              {(park.area / 10000).toFixed(1)} ha
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Parques por municipio */}
          <Card>
            <CardHeader>
              <CardTitle>Parques por Municipio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.parksByMunicipality?.map((item, index) => {
                  const maxCount = Math.max(...(data.parksByMunicipality?.map(p => p.count) || [1]));
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-32 text-sm font-medium text-right text-gray-700 truncate">
                        {item.municipalityName}
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Parques por tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.parksByType?.map((item, index) => {
                  const maxCount = Math.max(...(data.parksByType?.map(p => p.count) || [1]));
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium text-right text-gray-700 truncate">
                        {item.type}
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Estado de conservación */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Conservación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.conservationStatus?.map((item, index) => {
                  const maxCount = Math.max(...(data.conservationStatus?.map(p => p.count) || [1]));
                  const percentage = (item.count / maxCount) * 100;
                  const getStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'excelente': return 'bg-green-600';
                      case 'bueno': return 'bg-green-500';
                      case 'regular': return 'bg-yellow-500';
                      case 'malo': return 'bg-red-500';
                      default: return 'bg-gray-500';
                    }
                  };
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium text-right text-gray-700 truncate">
                        {item.status}
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className={`${getStatusColor(item.status)} h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actividades recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivities?.length > 0 ? (
                  data.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.parkName}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{new Date(activity.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{activity.participants} participantes</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay actividades recientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ParksDashboard;