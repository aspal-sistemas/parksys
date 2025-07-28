import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, MessageSquare, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AdminLayout from '@/components/AdminLayout';

// Dashboard integral de visitantes que combina datos de conteo, evaluaciones y feedback
export default function VisitorsDashboardSimple() {
  // Queries usando endpoints existentes
  const { data: visitorCounts = [] } = useQuery({
    queryKey: ['/api/visitor-counts'],
    retry: 1
  });

  const { data: parkEvaluations = [] } = useQuery({
    queryKey: ['/api/park-evaluations'],
    retry: 1
  });

  const { data: parkFeedback = [] } = useQuery({
    queryKey: ['/api/feedback'],
    retry: 1
  });

  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
    retry: 1
  });

  // Acceso seguro a datos de parques
  const parks = parksResponse?.data || parksResponse || [];

  // Cálculos de métricas principales
  const totalVisitors = Array.isArray(visitorCounts) 
    ? visitorCounts.reduce((sum, record) => sum + (record.adults || 0) + (record.children || 0) + (record.seniors || 0), 0)
    : 0;

  const totalEvaluations = Array.isArray(parkEvaluations) ? parkEvaluations.length : 0;
  const totalFeedback = Array.isArray(parkFeedback) ? parkFeedback.length : 0;
  const totalParks = Array.isArray(parks) ? parks.length : 0;

  // Promedio de calificaciones
  const averageRating = Array.isArray(parkEvaluations) && parkEvaluations.length > 0
    ? (parkEvaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.overallRating || 0), 0) / parkEvaluations.length).toFixed(1)
    : 0;

  // Datos para gráficas - Visitantes por método
  const methodData = Array.isArray(visitorCounts) ? visitorCounts.reduce((acc, record) => {
    const method = record.method || 'Directo';
    acc[method] = (acc[method] || 0) + ((record.adults || 0) + (record.children || 0) + (record.seniors || 0));
    return acc;
  }, {} as Record<string, number>) : {};

  const methodChartData = Object.entries(methodData).map(([method, count]) => ({
    method,
    count
  }));

  // Datos para gráficas - Distribución demográfica
  const demographicData = Array.isArray(visitorCounts) ? [{
    name: 'Adultos',
    value: visitorCounts.reduce((sum, record) => sum + (record.adults || 0), 0),
    color: '#00a587'
  }, {
    name: 'Niños',
    value: visitorCounts.reduce((sum, record) => sum + (record.children || 0), 0),
    color: '#00d4aa'
  }, {
    name: 'Adultos Mayores',
    value: visitorCounts.reduce((sum, record) => sum + (record.seniors || 0), 0),
    color: '#067f5f'
  }] : [];

  // Top parques por visitantes
  const parkVisitors = Array.isArray(visitorCounts) && Array.isArray(parks) ? parks.map(park => {
    const parkRecords = visitorCounts.filter(vc => vc.parkId === park.id);
    const totalParkVisitors = parkRecords.reduce((sum, record) => 
      sum + (record.adults || 0) + (record.children || 0) + (record.seniors || 0), 0);
    return {
      name: park.name,
      visitors: totalParkVisitors
    };
  }).sort((a, b) => b.visitors - a.visitors).slice(0, 5) : [];

  // Datos de tendencias (últimos 7 días)
  const last7Days = Array.isArray(visitorCounts) ? (() => {
    const today = new Date();
    const daysData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = visitorCounts.filter(vc => vc.date === dateStr);
      const dayTotal = dayRecords.reduce((sum, record) => 
        sum + (record.adults || 0) + (record.children || 0) + (record.seniors || 0), 0);
      
      const dayEvaluations = Array.isArray(parkEvaluations) ? parkEvaluations.filter((evaluation: any) => {
        const evalDate = new Date(evaluation.createdAt).toISOString().split('T')[0];
        return evalDate === dateStr;
      }).length : 0;
      
      const dayFeedback = Array.isArray(parkFeedback) ? parkFeedback.filter((feedback: any) => {
        const fbDate = new Date(feedback.createdAt).toISOString().split('T')[0];
        return fbDate === dateStr;
      }).length : 0;

      daysData.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        visitors: dayTotal,
        evaluations: dayEvaluations,
        feedback: dayFeedback
      });
    }
    
    return daysData;
  })() : [];

  return (
    <AdminLayout 
      title="Dashboard Integral de Visitantes"
      subtitle="Vista consolidada de visitantes, evaluaciones y retroalimentación"
    >
      <div className="space-y-6">
        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Visitantes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalVisitors.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Registros históricos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Evaluaciones</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalEvaluations}</div>
              <p className="text-xs text-gray-500 mt-1">Promedio: {averageRating} ⭐</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Retroalimentación</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalFeedback}</div>
              <p className="text-xs text-gray-500 mt-1">Comentarios ciudadanos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Parques Activos</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalParks}</div>
              <p className="text-xs text-gray-500 mt-1">En sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencias de 7 días */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Tendencias (Últimos 7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7Days}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" stroke="#00a587" strokeWidth={2} name="Visitantes" />
                  <Line type="monotone" dataKey="evaluations" stroke="#f59e0b" strokeWidth={2} name="Evaluaciones" />
                  <Line type="monotone" dataKey="feedback" stroke="#10b981" strokeWidth={2} name="Feedback" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución demográfica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Distribución Demográfica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secciones adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top parques por visitantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Top Parques por Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parkVisitors.map((park, index) => (
                  <div key={park.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{park.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{park.visitors.toLocaleString()} visitantes</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visitantes por método */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Métodos de Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={methodChartData}>
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00a587" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumen ejecutivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Participación Ciudadana</div>
                <div className="text-sm text-gray-600 mt-1">
                  {totalEvaluations + totalFeedback} interacciones registradas
                </div>
                <Badge variant="secondary" className="mt-2">
                  {totalParks > 0 ? ((totalEvaluations + totalFeedback) / totalParks).toFixed(1) : 0} por parque
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Satisfacción</div>
                <div className="text-sm text-gray-600 mt-1">
                  Calificación promedio: {averageRating}/5
                </div>
                <Badge variant={parseFloat(averageRating as string) >= 4 ? "default" : "secondary"} className="mt-2">
                  {parseFloat(averageRating as string) >= 4 ? "Excelente" : "Bueno"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Cobertura</div>
                <div className="text-sm text-gray-600 mt-1">
                  {totalParks} parques en sistema
                </div>
                <Badge variant="outline" className="mt-2">
                  {totalVisitors > 0 ? (totalVisitors / totalParks).toFixed(0) : 0} visitantes/parque
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}