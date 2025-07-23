import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  MapPin,
  Leaf,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

const FinancialReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Q4-2025");
  const [activeTab, setActiveTab] = useState("executive");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Datos ejecutivos consolidados
  const executiveMetrics = {
    totalRevenue: 3120000,
    totalExpenses: 2340000,
    netProfit: 780000,
    profitMargin: 25.0,
    budgetCompliance: 96.2,
    growthRate: 12.3,
    activeParks: 14,
    totalEvents: 156,
    concessionRevenue: 890000,
    sustainabilityScore: 87
  };

  // Análisis por parques
  const parkPerformance = [
    { park: 'Chapultepec', revenue: 850000, events: 45, visitors: 125000, efficiency: 92 },
    { park: 'Agua Azul', revenue: 620000, events: 32, visitors: 89000, efficiency: 88 },
    { park: 'Metropolitano', revenue: 540000, events: 28, visitors: 76000, efficiency: 85 },
    { park: 'La Mexicana', revenue: 480000, events: 24, visitors: 65000, efficiency: 83 },
    { park: 'Bicentenario', revenue: 350000, events: 18, visitors: 48000, efficiency: 78 }
  ];

  // Tendencias estacionales
  const seasonalTrends = [
    { month: 'Ene', ingresos: 240000, eventos: 12, visitantes: 18000 },
    { month: 'Feb', ingresos: 260000, eventos: 14, visitantes: 22000 },
    { month: 'Mar', ingresos: 285000, eventos: 16, visitantes: 26000 },
    { month: 'Abr', ingresos: 320000, eventos: 18, visitantes: 32000 },
    { month: 'May', ingresos: 310000, eventos: 17, visitantes: 30000 },
    { month: 'Jun', ingresos: 295000, eventos: 15, visitantes: 28000 },
    { month: 'Jul', ingresos: 340000, eventos: 20, visitantes: 38000 },
    { month: 'Ago', ingresos: 330000, eventos: 19, visitantes: 36000 },
    { month: 'Sep', ingresos: 305000, eventos: 16, visitantes: 29000 },
    { month: 'Oct', ingresos: 290000, eventos: 15, visitantes: 27000 },
    { month: 'Nov', ingresos: 275000, eventos: 13, visitantes: 24000 },
    { month: 'Dic', ingresos: 310000, eventos: 17, visitantes: 31000 }
  ];

  // Distribución de ingresos
  const revenueDistribution = [
    { name: 'Eventos', value: 1350000, percentage: 43.3, color: '#8884d8' },
    { name: 'Concesiones', value: 890000, percentage: 28.5, color: '#82ca9d' },
    { name: 'Patrocinios', value: 520000, percentage: 16.7, color: '#ffc658' },
    { name: 'Estacionamientos', value: 220000, percentage: 7.1, color: '#ff7c7c' },
    { name: 'Otros', value: 140000, percentage: 4.5, color: '#8dd1e1' }
  ];

  // Métricas de sustentabilidad
  const sustainabilityMetrics = [
    { metric: 'Eficiencia Energética', current: 87, target: 90, trend: '+5%' },
    { metric: 'Gestión de Residuos', current: 92, target: 95, trend: '+8%' },
    { metric: 'Consumo de Agua', current: 78, target: 85, trend: '+12%' },
    { metric: 'Transporte Sostenible', current: 65, target: 75, trend: '+15%' },
    { metric: 'Biodiversidad', current: 89, target: 90, trend: '+3%' }
  ];

  // Alertas y recomendaciones
  const alerts = [
    {
      type: 'warning',
      title: 'Presupuesto de Mantenimiento',
      message: 'Parque Bicentenario supera en 15% su presupuesto de mantenimiento',
      action: 'Revisar contratos'
    },
    {
      type: 'success',
      title: 'Meta de Ingresos',
      message: 'Se alcanzó el 96.2% de la meta anual de ingresos',
      action: 'Mantener estrategia'
    },
    {
      type: 'info',
      title: 'Temporada Alta',
      message: 'Diciembre muestra 18% más visitantes que el promedio',
      action: 'Optimizar recursos'
    }
  ];

  // Proyecciones 2026
  const projections2026 = {
    estimatedRevenue: 3650000,
    growthRate: 17.0,
    newParks: 2,
    additionalEvents: 48,
    sustainabilityTarget: 92,
    digitalTransformation: 85
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-600 mt-2">
              Análisis integral y proyecciones estratégicas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q4-2025">Q4 2025</SelectItem>
                <SelectItem value="2025">Año 2025</SelectItem>
                <SelectItem value="Q1-2026">Q1 2026</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>

            <Button className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar Reporte
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive">Ejecutivo</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="sustainability">Sustentabilidad</TabsTrigger>
            <TabsTrigger value="projections">Proyecciones</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="executive">
            <div className="space-y-6">
              {/* KPIs Ejecutivos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        +{executiveMetrics.growthRate}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600">Ingresos Totales</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(executiveMetrics.totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Margen: {executiveMetrics.profitMargin}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {executiveMetrics.budgetCompliance}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600">Cumplimiento Presupuestal</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        96.2%
                      </p>
                      <p className="text-sm text-gray-500">
                        Meta: 95%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        {executiveMetrics.totalEvents}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600">Eventos Realizados</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        156
                      </p>
                      <p className="text-sm text-gray-500">
                        En {executiveMetrics.activeParks} parques
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <Leaf className="h-6 w-6 text-emerald-600" />
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                        {executiveMetrics.sustainabilityScore}/100
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600">Índice de Sustentabilidad</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        87
                      </p>
                      <p className="text-sm text-gray-500">
                        Excelente nivel
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficas principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Ingresos 2025</CardTitle>
                    <CardDescription>
                      Evolución mensual de ingresos y eventos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={seasonalTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value, name) => [
                          name === 'ingresos' ? formatCurrency(Number(value)) : value,
                          name === 'ingresos' ? 'Ingresos' : name === 'eventos' ? 'Eventos' : 'Visitantes'
                        ]} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="ingresos" 
                          stackId="1" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                          name="Ingresos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Ingresos</CardTitle>
                    <CardDescription>
                      Composición por fuente de ingresos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={revenueDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {revenueDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Parque</CardTitle>
                <CardDescription>
                  Análisis comparativo de eficiencia y rentabilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parkPerformance.map((park, index) => (
                    <div key={park.park} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <h3 className="font-medium text-lg">{park.park}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(park.revenue)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {park.efficiency}% eficiencia
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{park.events}</div>
                          <div className="text-xs text-gray-500">Eventos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(park.visitors / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500">Visitantes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {(park.revenue / park.visitors).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">$/Visitante</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Eficiencia Operativa</span>
                          <span>{park.efficiency}%</span>
                        </div>
                        <Progress value={park.efficiency} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sustainabilityMetrics.map((metric) => (
                  <Card key={metric.metric}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{metric.metric}</h3>
                        <Badge variant="outline" className="text-green-600">
                          {metric.trend}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Actual: {metric.current}%</span>
                          <span>Meta: {metric.target}%</span>
                        </div>
                        <Progress value={metric.current} className="h-3" />
                        <div className="text-xs text-gray-500">
                          {metric.current >= metric.target ? "Meta alcanzada" : 
                           `Falta ${metric.target - metric.current}% para la meta`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Impacto Ambiental y Social</CardTitle>
                  <CardDescription>
                    Métricas de sostenibilidad y responsabilidad social
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">2,340</div>
                      <div className="text-sm text-green-700">Toneladas CO₂ evitadas</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">89,500</div>
                      <div className="text-sm text-blue-700">Litros agua reciclada</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">1,248</div>
                      <div className="text-sm text-purple-700">Empleos generados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projections">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proyecciones 2026</CardTitle>
                  <CardDescription>
                    Estimaciones basadas en tendencias actuales y planes estratégicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                        <TrendingUp className="h-5 w-5" />
                        Crecimiento Proyectado
                      </div>
                      <div className="text-3xl font-bold text-green-900">
                        {projections2026.growthRate}%
                      </div>
                      <div className="text-sm text-green-700">
                        Ingresos estimados: {formatCurrency(projections2026.estimatedRevenue)}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                        <MapPin className="h-5 w-5" />
                        Expansión
                      </div>
                      <div className="text-3xl font-bold text-blue-900">
                        {projections2026.newParks}
                      </div>
                      <div className="text-sm text-blue-700">
                        Nuevos parques planeados
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-800 font-medium mb-2">
                        <Activity className="h-5 w-5" />
                        Eventos Adicionales
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        +{projections2026.additionalEvents}
                      </div>
                      <div className="text-sm text-purple-700">
                        Incremento en programación
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-4">Iniciativas Estratégicas 2026</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Transformación Digital</span>
                        <div className="flex items-center gap-2">
                          <Progress value={projections2026.digitalTransformation} className="w-24 h-2" />
                          <span className="text-sm font-medium">{projections2026.digitalTransformation}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Meta de Sustentabilidad</span>
                        <div className="flex items-center gap-2">
                          <Progress value={projections2026.sustainabilityTarget} className="w-24 h-2" />
                          <span className="text-sm font-medium">{projections2026.sustainabilityTarget}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-100' :
                        alert.type === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {alert.type === 'warning' ? (
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.type === 'warning' ? 'text-yellow-600' :
                            alert.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                        ) : alert.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                        <p className="text-gray-600 mb-3">{alert.message}</p>
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FinancialReports;