import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Trees, Calendar, Users, TrendingUp, Activity, AlertTriangle, CheckCircle, Wrench, UserCheck, AlertCircle, Package } from 'lucide-react';
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
  totalAmenities: number;
  totalInstructors: number;
  totalIncidents: number;
  totalAssets: number;
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
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-8">
              <Activity className="w-8 h-8" />
              Dashboard
            </h1>
          </div>
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
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8" />
            Dashboard
          </h1>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar los datos del dashboard</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8" />
            Dashboard
          </h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </AdminLayout>
    );
  }

  // Centro del mapa basado en México
  const mexicoCenter: [number, number] = [19.4326, -99.1332]; // Ciudad de México

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Main Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8" />
            Dashboard
          </h1>
        </div>
        
        {/* Sección 1: Información General */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-green-500 rounded-full p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Información General
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Total de Parques</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalParks}</div>
              <p className="text-xs text-emerald-100">
                {data.activeParks} activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Superficie Total</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Trees className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.totalSurface ? `${(data.totalSurface / 10000).toFixed(1)} ha` : 'N/A'}
              </div>
              <p className="text-xs text-blue-100">
                Superficie total de parques
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Área Permeable</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Trees className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.totalGreenArea ? `${(data.totalGreenArea / 10000).toFixed(1)} ha` : 'N/A'}
              </div>
              <p className="text-xs text-teal-100">
                Superficie permeable total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Actividades</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalActivities}</div>
              <p className="text-xs text-purple-100">
                Eventos programados
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Voluntarios</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalVolunteers}</div>
              <p className="text-xs text-orange-100">
                Activos en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Árboles</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Trees className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalTrees}</div>
              <p className="text-xs text-green-100">
                En inventario
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-100">Visitantes</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.totalVisitors ? data.totalVisitors.toLocaleString() : 'N/A'}
              </div>
              <p className="text-xs text-pink-100">
                Visitantes totales
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">Calificación</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.averageRating ? data.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-yellow-100">
                Promedio de evaluaciones
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">En Mantenimiento</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.maintenanceAreas}</div>
              <p className="text-xs text-red-100">
                Áreas en mantenimiento
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-100">Amenidades</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Wrench className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalAmenities}</div>
              <p className="text-xs text-cyan-100">
                Amenidades disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-100">Instructores</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalInstructors}</div>
              <p className="text-xs text-indigo-100">
                Instructores activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Incidencias</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalIncidents}</div>
              <p className="text-xs text-amber-100">
                Incidencias (últimos 30 días)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-500 to-slate-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Activos</CardTitle>
              <div className="bg-white/20 rounded-full p-2">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.totalAssets}</div>
              <p className="text-xs text-slate-100">
                Activos registrados
              </p>
            </CardContent>
          </Card>
          </div>
        </div>
        
        {/* Separador visual */}
        <div className="border-t border-gray-200 my-8"></div>
        
        {/* Sección continua con el resto del dashboard */}
        <div className="space-y-6">

          <div className="grid gap-6 md:grid-cols-2">
            {/* Parques por municipio */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-emerald-500 rounded-full p-2">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  Parques por Municipio
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.parksByMunicipality?.map((item, index) => {
                    const maxCount = Math.max(...(data.parksByMunicipality?.map(p => p.count) || [1]));
                    const percentage = (item.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-32 text-sm font-medium text-right text-gray-700 truncate">
                          {item.municipalityName}
                        </div>
                        <div className="flex-1 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-green-500 h-6 rounded-full flex items-center justify-end pr-3 transition-all duration-700 shadow-sm"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            >
                              <span className="text-white text-xs font-bold">
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
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-blue-500 rounded-full p-2">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  Distribución por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.parksByType?.map((item, index) => {
                    const maxCount = Math.max(...(data.parksByType?.map(p => p.count) || [1]));
                    const percentage = (item.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-24 text-sm font-medium text-right text-gray-700 truncate">
                          {item.type}
                        </div>
                        <div className="flex-1 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-6 rounded-full flex items-center justify-end pr-3 transition-all duration-700 shadow-sm"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            >
                              <span className="text-white text-xs font-bold">
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
          </div>

          {/* Estado de conservación */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-teal-500 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                Estado de Conservación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {data.conservationStatus?.map((item, index) => {
                  const maxCount = Math.max(...(data.conservationStatus?.map(p => p.count) || [1]));
                  const percentage = (item.count / maxCount) * 100;
                  const getStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'excelente': return 'bg-gradient-to-r from-green-500 to-green-600';
                      case 'bueno': return 'bg-gradient-to-r from-emerald-500 to-green-500';
                      case 'regular': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
                      case 'malo': return 'bg-gradient-to-r from-red-500 to-red-600';
                      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
                    }
                  };
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium text-right text-gray-700 truncate">
                        {item.status}
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className={`${getStatusColor(item.status)} h-6 rounded-full flex items-center justify-end pr-3 transition-all duration-700 shadow-sm`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-white text-xs font-bold">
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

          {/* Mapa de parques */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-emerald-500 rounded-full p-2">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Ubicación de Parques
              </CardTitle>
              <CardDescription className="text-gray-600">
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default ParksDashboard;