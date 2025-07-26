import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Label
} from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, TrendingUp, FileText, MapPin, Download, Calendar, Activity, Clock, Sun, PieChart, BarChart3, 
  Search, Filter, Plus, Eye, List, Grid, ChevronLeft, ChevronRight, ArrowLeft, Layers, 
  CloudSun, Cloud, CloudRain, CloudSnow, CloudDrizzle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface VisitorCount {
  id: number;
  date: string;
  parkId: number;
  parkName: string;
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  groups: number;
  weather: string;
  countingMethod: string;
  dayType: string;
  notes?: string;
  totalVisitors: number;
}

interface Park {
  id: number;
  name: string;
}

interface ParkSummary {
  parkId: number;
  parkName: string;
  totalVisitors: number;
  totalRecords: number;
  avgDaily: number;
  lastUpdate: string;
}

export default function VisitorCountPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados principales
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedParkForDetail, setSelectedParkForDetail] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados de filtros
  const [quickDateRange, setQuickDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportPark, setReportPark] = useState('all');
  const [reportPeriod, setReportPeriod] = useState('month');

  // Función para obtener rango de fechas
  const getDateRangeForQuickFilter = () => {
    const now = new Date();
    let startDate = new Date();
    
    if (customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }

    switch (quickDateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  // Query para parques
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    retry: 1
  });

  // Query para resumen por parques
  const { data: parkSummaries, isLoading: parkSummariesLoading } = useQuery({
    queryKey: ['/api/visitor-counts/park-summary', quickDateRange, customStartDate, customEndDate],
    queryFn: async () => {
      const { startDate, endDate } = getDateRangeForQuickFilter();
      const params = new URLSearchParams();
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('groupBy', 'park');
      
      const response = await fetch(`/api/visitor-counts/park-summary?${params}`);
      return response.json();
    },
    retry: 1
  });

  // Query para detalles del parque seleccionado
  const { 
    data: parkDetailData, 
    isLoading: parkDetailLoading 
  } = useQuery({
    queryKey: ['/api/visitor-counts', 'park-detail', selectedParkForDetail, quickDateRange, customStartDate, customEndDate, currentPage],
    queryFn: async () => {
      if (!selectedParkForDetail) return null;
      
      const { startDate, endDate } = getDateRangeForQuickFilter();
      const params = new URLSearchParams();
      params.set('parkId', selectedParkForDetail.toString());
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('limit', recordsPerPage.toString());
      params.set('offset', ((currentPage - 1) * recordsPerPage).toString());
      
      const response = await fetch(`/api/visitor-counts?${params}`);
      return response.json();
    },
    enabled: !!selectedParkForDetail,
    retry: 1
  });

  // Query para reportes
  const { data: reportData } = useQuery({
    queryKey: ['/api/visitor-counts/reports', reportPark, reportPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportPark !== 'all') params.set('parkId', reportPark);
      params.set('period', reportPeriod);
      
      const response = await fetch(`/api/visitor-counts/reports?${params}`);
      return response.json();
    },
    retry: 1
  });

  // Funciones auxiliares
  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'manual': 'Conteo Manual',
      'automatic': 'Contador Automático',
      'estimated': 'Estimación Visual',
      'turnstile': 'Torniquete'
    };
    return labels[method] || method;
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'snowy': return <CloudSnow className="h-4 w-4 text-blue-300" />;
      default: return <CloudSun className="h-4 w-4 text-orange-500" />;
    }
  };

  const getWeatherLabel = (weather: string) => {
    const labels: Record<string, string> = {
      'sunny': 'Soleado',
      'cloudy': 'Nublado',
      'rainy': 'Lluvioso',
      'snowy': 'Nevado',
      'other': 'Otro'
    };
    return labels[weather] || 'No especificado';
  };

  const getDayTypeLabel = (dayType: string) => {
    const labels: Record<string, string> = {
      'weekday': 'Día de semana',
      'weekend': 'Fin de semana',
      'holiday': 'Día festivo'
    };
    return labels[dayType] || dayType;
  };

  // Función para manejar clic en tarjeta de parque
  const handleParkCardClick = (parkId: number) => {
    setSelectedParkForDetail(parkId);
    setActiveTab('detalle');
    setCurrentPage(1);
  };

  // Función para volver al resumen
  const handleBackToSummary = () => {
    setSelectedParkForDetail(null);
    setActiveTab('resumen');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Conteo de Visitantes</h1>
          </div>
          
          {/* Filtros de fecha rápidos */}
          <div className="flex items-center gap-2">
            <Label htmlFor="date-range">Período:</Label>
            <Select value={quickDateRange} onValueChange={setQuickDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sistema de pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumen">Resumen por Parque</TabsTrigger>
            <TabsTrigger value="detalle">Detalle</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          {/* Pestaña Resumen por Parque */}
          <TabsContent value="resumen">
            <div className="space-y-6">
              {parkSummariesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : parkSummaries?.data?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay datos de visitantes en el período seleccionado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parkSummaries?.data?.map((parkSummary: ParkSummary) => (
                    <Card 
                      key={parkSummary.parkId} 
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => handleParkCardClick(parkSummary.parkId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {parkSummary.parkName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {parkSummary.totalRecords} registros
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Activo
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Visitantes</span>
                            <span className="font-bold text-lg text-[#067f5f]">
                              {parkSummary.totalVisitors.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Promedio Diario</span>
                            <span className="font-medium text-[#00a587]">
                              {Math.round(parkSummary.avgDaily).toLocaleString()}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Última actualización: {format(new Date(parkSummary.lastUpdate), 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pestaña Detalle */}
          <TabsContent value="detalle">
            {selectedParkForDetail ? (
              <div className="space-y-6">
                {/* Header con botón volver */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToSummary}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Resumen
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {parkDetailLoading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#067f5f] mx-auto"></div>
                      <p className="text-gray-600 mt-4">Cargando detalles del parque...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Vista Grid */}
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parkDetailData?.data?.map((record: VisitorCount) => (
                          <Card key={record.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {format(new Date(record.date), 'dd/MM/yyyy', { locale: es })}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {getMethodLabel(record.countingMethod)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Adultos:</span>
                                  <span className="font-medium ml-1">{record.adults}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Niños:</span>
                                  <span className="font-medium ml-1">{record.children}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Mayores:</span>
                                  <span className="font-medium ml-1">{record.seniors}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Mascotas:</span>
                                  <span className="font-medium ml-1">{record.pets}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-3 border-t">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1">
                                    {getWeatherIcon(record.weather)}
                                    <span>{getWeatherLabel(record.weather)}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {getDayTypeLabel(record.dayType)}
                                  </Badge>
                                </div>
                                <div className="mt-2 text-center">
                                  <span className="text-lg font-bold text-[#067f5f]">
                                    Total: {(record.adults + record.children + record.seniors).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Vista Lista */}
                    {viewMode === 'list' && (
                      <Card>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b">
                                <tr>
                                  <th className="text-left p-3 text-sm font-medium text-gray-700">Fecha</th>
                                  <th className="text-left p-3 text-sm font-medium text-gray-700">Método</th>
                                  <th className="text-center p-3 text-sm font-medium text-gray-700">Adultos</th>
                                  <th className="text-center p-3 text-sm font-medium text-gray-700">Niños</th>
                                  <th className="text-center p-3 text-sm font-medium text-gray-700">Mayores</th>
                                  <th className="text-center p-3 text-sm font-medium text-gray-700">Mascotas</th>
                                  <th className="text-center p-3 text-sm font-medium text-gray-700">Total</th>
                                  <th className="text-left p-3 text-sm font-medium text-gray-700">Clima</th>
                                  <th className="text-left p-3 text-sm font-medium text-gray-700">Tipo Día</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parkDetailData?.data?.map((record: VisitorCount, index: number) => (
                                  <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-3 text-sm">
                                      {format(new Date(record.date), 'dd/MM/yyyy', { locale: es })}
                                    </td>
                                    <td className="p-3 text-sm">
                                      <Badge variant="outline" className="text-xs">
                                        {getMethodLabel(record.countingMethod)}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-sm text-center font-medium">{record.adults}</td>
                                    <td className="p-3 text-sm text-center font-medium">{record.children}</td>
                                    <td className="p-3 text-sm text-center font-medium">{record.seniors}</td>
                                    <td className="p-3 text-sm text-center font-medium">{record.pets}</td>
                                    <td className="p-3 text-sm text-center font-bold text-emerald-700">
                                      {(record.adults + record.children + record.seniors).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-sm">
                                      <div className="flex items-center gap-1">
                                        {getWeatherIcon(record.weather)}
                                        <span>{getWeatherLabel(record.weather)}</span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-sm">
                                      <Badge variant="secondary" className="text-xs">
                                        {getDayTypeLabel(record.dayType)}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Paginación */}
                    {parkDetailData?.pagination && parkDetailData.pagination.totalPages > 1 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Mostrando {((currentPage - 1) * recordsPerPage) + 1} a {Math.min(currentPage * recordsPerPage, parkDetailData.pagination.total)} de {parkDetailData.pagination.total} registros
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, parkDetailData.pagination.totalPages) }, (_, i) => {
                                  const pageNum = i + 1;
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={currentPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentPage(pageNum)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(parkDetailData.pagination.totalPages, currentPage + 1))}
                                disabled={currentPage >= parkDetailData.pagination.totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecciona un parque del resumen para ver sus detalles</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Haz clic en cualquier tarjeta de parque en la pestaña "Resumen por Parque"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pestaña Reportes */}
          <TabsContent value="reportes">
            <div className="space-y-6">
              {/* Controles de filtro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros de Reporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Parque</Label>
                      <Select value={reportPark} onValueChange={setReportPark}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un parque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los parques</SelectItem>
                          {parks && Array.isArray(parks) && parks.filter((park: Park) => park.id && park.name).map((park: Park) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Período</Label>
                      <Select value={reportPeriod} onValueChange={setReportPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Última semana</SelectItem>
                          <SelectItem value="month">Último mes</SelectItem>
                          <SelectItem value="quarter">Último trimestre</SelectItem>
                          <SelectItem value="year">Último año</SelectItem>
                          <SelectItem value="all">Todo el año</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas resumen */}
              {reportData && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Visitantes</p>
                            <p className="text-2xl font-bold text-[#067f5f]">
                              {reportData.summary.totalVisitors.toLocaleString()}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-[#067f5f]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Promedio Diario</p>
                            <p className="text-2xl font-bold text-[#00a587]">
                              {Number(reportData.summary.avgDaily || 0).toLocaleString()}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-[#00a587]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Registros</p>
                            <p className="text-2xl font-bold text-[#bcd256]">
                              {Number(reportData.summary.totalRecords || 0).toLocaleString()}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-[#bcd256]" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Parques Únicos</p>
                            <p className="text-2xl font-bold text-[#8498a5]">
                              {Number(reportData.summary.uniqueParks || 0).toLocaleString()}
                            </p>
                          </div>
                          <MapPin className="h-8 w-8 text-[#8498a5]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}