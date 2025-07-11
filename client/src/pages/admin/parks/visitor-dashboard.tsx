import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Calendar, Users, TrendingUp, MapPin, Clock, Activity, Eye, Download, Filter } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminLayout } from '@/components/AdminLayout';

interface VisitorCount {
  id: number;
  parkId: number;
  parkName: string;
  date: string;
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  groups: number;
  totalVisitors: number;
  countingMethod: string;
  dayType: string;
  weather: string;
  notes: string;
  createdAt: string;
}

interface ParkSummary {
  parkId: number;
  parkName: string;
  totalVisitors: number;
  totalRecords: number;
  avgDailyVisitors: number;
  lastCountDate: string;
}

const COLORS = ['#00a587', '#067f5f', '#bcd256', '#8498a5', '#4CAF50', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const methodLabels = {
  'estimation': 'Estimación',
  'manual_counter': 'Contador Manual',
  'event_based': 'Basado en Eventos',
  'entrance_control': 'Control de Acceso'
};

const weatherLabels = {
  'sunny': 'Soleado',
  'cloudy': 'Nublado',
  'rainy': 'Lluvioso',
  'other': 'Otro'
};

const dayTypeLabels = {
  'weekday': 'Día Laboral',
  'weekend': 'Fin de Semana',
  'holiday': 'Día Festivo'
};

export default function VisitorDashboard() {
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener datos de visitantes
  const { data: visitorData, isLoading } = useQuery<VisitorCount[]>({
    queryKey: ['/api/visitor-counts', selectedPark, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPark !== 'all') params.append('parkId', selectedPark);
      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
        params.append('startDate', startDate);
      }
      params.append('limit', '1000');
      
      const response = await fetch(`/api/visitor-counts?${params}`);
      return response.json();
    }
  });

  // Obtener lista de parques
  const { data: parks } = useQuery<Array<{id: number, name: string}>>({
    queryKey: ['/api/parks'],
  });

  // Procesar datos para métricas
  const metrics = useMemo(() => {
    if (!visitorData || !Array.isArray(visitorData)) return null;

    const totalVisitors = visitorData.reduce((sum, record) => sum + record.totalVisitors, 0);
    const totalAdults = visitorData.reduce((sum, record) => sum + record.adults, 0);
    const totalChildren = visitorData.reduce((sum, record) => sum + record.children, 0);
    const totalSeniors = visitorData.reduce((sum, record) => sum + record.seniors, 0);
    const totalPets = visitorData.reduce((sum, record) => sum + record.pets, 0);
    const totalRecords = visitorData.length;
    const avgDailyVisitors = totalRecords > 0 ? Math.round(totalVisitors / totalRecords) : 0;
    const uniqueParks = new Set(visitorData.map(r => r.parkId)).size;

    return {
      totalVisitors,
      totalAdults,
      totalChildren,
      totalSeniors,
      totalPets,
      totalRecords,
      avgDailyVisitors,
      uniqueParks
    };
  }, [visitorData]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (!visitorData || !Array.isArray(visitorData)) return { daily: [], parks: [], methods: [], weather: [] };

    // Datos diarios
    const dailyData = visitorData.reduce((acc, record) => {
      const date = record.date;
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.visitors += record.totalVisitors;
        existing.adults += record.adults;
        existing.children += record.children;
        existing.seniors += record.seniors;
        existing.pets += record.pets;
      } else {
        acc.push({
          date,
          visitors: record.totalVisitors,
          adults: record.adults,
          children: record.children,
          seniors: record.seniors,
          pets: record.pets,
          formattedDate: format(parseISO(date), 'dd/MM', { locale: es })
        });
      }
      return acc;
    }, [] as any[]).sort((a, b) => a.date.localeCompare(b.date));

    // Datos por parque
    const parkData = visitorData.reduce((acc, record) => {
      const existing = acc.find(item => item.parkName === record.parkName);
      if (existing) {
        existing.visitors += record.totalVisitors;
        existing.records += 1;
      } else {
        acc.push({
          parkName: record.parkName,
          visitors: record.totalVisitors,
          records: 1
        });
      }
      return acc;
    }, [] as any[]).sort((a, b) => b.visitors - a.visitors);

    // Datos por método
    const methodData = visitorData.reduce((acc, record) => {
      const method = methodLabels[record.countingMethod] || record.countingMethod;
      const existing = acc.find(item => item.method === method);
      if (existing) {
        existing.count += 1;
        existing.visitors += record.totalVisitors;
      } else {
        acc.push({
          method,
          count: 1,
          visitors: record.totalVisitors
        });
      }
      return acc;
    }, [] as any[]);

    // Datos por clima
    const weatherData = visitorData.reduce((acc, record) => {
      const weather = weatherLabels[record.weather] || record.weather;
      const existing = acc.find(item => item.weather === weather);
      if (existing) {
        existing.count += 1;
        existing.visitors += record.totalVisitors;
      } else {
        acc.push({
          weather,
          count: 1,
          visitors: record.totalVisitors
        });
      }
      return acc;
    }, [] as any[]);

    return {
      daily: dailyData,
      parks: parkData,
      methods: methodData,
      weather: weatherData
    };
  }, [visitorData]);

  // Resumen por parques
  const parkSummaries = useMemo(() => {
    if (!visitorData || !Array.isArray(visitorData)) return [];

    const summaries: Record<number, ParkSummary> = {};
    
    visitorData.forEach(record => {
      if (!summaries[record.parkId]) {
        summaries[record.parkId] = {
          parkId: record.parkId,
          parkName: record.parkName,
          totalVisitors: 0,
          totalRecords: 0,
          avgDailyVisitors: 0,
          lastCountDate: record.date
        };
      }
      
      summaries[record.parkId].totalVisitors += record.totalVisitors;
      summaries[record.parkId].totalRecords += 1;
      if (record.date > summaries[record.parkId].lastCountDate) {
        summaries[record.parkId].lastCountDate = record.date;
      }
    });

    Object.values(summaries).forEach(summary => {
      summary.avgDailyVisitors = Math.round(summary.totalVisitors / summary.totalRecords);
    });

    return Object.values(summaries).sort((a, b) => b.totalVisitors - a.totalVisitors);
  }, [visitorData]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Visitantes</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Visitantes</h1>
            <p className="text-gray-600">Análisis y estadísticas del conteo de visitantes</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parque</label>
                <Select value={selectedPark} onValueChange={setSelectedPark}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar parque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parks?.map(park => (
                      <SelectItem key={park.id} value={park.id.toString()}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 días</SelectItem>
                    <SelectItem value="30">Últimos 30 días</SelectItem>
                    <SelectItem value="90">Últimos 90 días</SelectItem>
                    <SelectItem value="all">Todo el tiempo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <Input
                  placeholder="Buscar en notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visitantes</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalVisitors?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.avgDailyVisitors || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalRecords || 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Parques Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.uniqueParks || 0}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desglose demográfico */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Adultos</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalAdults?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.totalVisitors ? Math.round((metrics.totalAdults / metrics.totalVisitors) * 100) : 0}% del total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Niños</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalChildren?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.totalVisitors ? Math.round((metrics.totalChildren / metrics.totalVisitors) * 100) : 0}% del total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Adultos Mayores</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalSeniors?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">
                  {metrics?.totalVisitors ? Math.round((metrics.totalSeniors / metrics.totalVisitors) * 100) : 0}% del total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Mascotas</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.totalPets?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Acompañantes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="parks">Por Parques</TabsTrigger>
            <TabsTrigger value="methods">Métodos</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visitors" stackId="1" stroke="#00a587" fill="#00a587" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desglose Demográfico por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="adults" stackId="a" fill="#00a587" name="Adultos" />
                    <Bar dataKey="children" stackId="a" fill="#bcd256" name="Niños" />
                    <Bar dataKey="seniors" stackId="a" fill="#8498a5" name="Adultos Mayores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parks">
          <Card>
            <CardHeader>
              <CardTitle>Visitantes por Parque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.parks} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="parkName" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#00a587" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Conteo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.methods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartData.methods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Condiciones Climáticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.weather}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ weather, percent }) => `${weather} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartData.weather.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Parques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parkSummaries.map((summary, index) => (
                  <div key={summary.parkId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{summary.parkName}</p>
                        <p className="text-sm text-gray-500">
                          Último conteo: {format(parseISO(summary.lastCountDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{summary.totalVisitors.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {summary.avgDailyVisitors} promedio diario ({summary.totalRecords} registros)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}