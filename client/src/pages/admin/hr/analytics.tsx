import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  Brain,
  Heart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
  category: 'headcount' | 'performance' | 'cost' | 'satisfaction';
}

interface DepartmentAnalytics {
  department: string;
  headcount: number;
  avgSalary: number;
  turnover: number;
  satisfaction: number;
  productivity: number;
  trainingHours: number;
  absenteeism: number;
}

interface TurnoverData {
  month: string;
  voluntary: number;
  involuntary: number;
  total: number;
  retention: number;
}

const HRAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("12m");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // KPIs principales
  const kpis: KPI[] = [
    {
      id: "headcount",
      name: "Total Empleados",
      value: 105,
      previousValue: 98,
      unit: "empleados",
      trend: "up",
      target: 110,
      category: "headcount"
    },
    {
      id: "turnover",
      name: "Rotación Anual",
      value: 8.5,
      previousValue: 12.2,
      unit: "%",
      trend: "down",
      target: 10,
      category: "performance"
    },
    {
      id: "satisfaction",
      name: "Satisfacción Laboral",
      value: 4.2,
      previousValue: 3.8,
      unit: "/5.0",
      trend: "up",
      target: 4.5,
      category: "satisfaction"
    },
    {
      id: "avgSalary",
      name: "Salario Promedio",
      value: 28500,
      previousValue: 27200,
      unit: "MXN",
      trend: "up",
      target: 30000,
      category: "cost"
    },
    {
      id: "trainingHours",
      name: "Horas Capacitación",
      value: 42,
      previousValue: 35,
      unit: "hrs/empleado",
      trend: "up",
      target: 50,
      category: "performance"
    },
    {
      id: "absenteeism",
      name: "Ausentismo",
      value: 3.2,
      previousValue: 4.1,
      unit: "%",
      trend: "down",
      target: 3,
      category: "performance"
    }
  ];

  // Analytics por departamento
  const departmentAnalytics: DepartmentAnalytics[] = [
    {
      department: "Eventos y Actividades",
      headcount: 25,
      avgSalary: 29000,
      turnover: 6.5,
      satisfaction: 4.3,
      productivity: 88,
      trainingHours: 45,
      absenteeism: 2.8
    },
    {
      department: "Mantenimiento",
      headcount: 32,
      avgSalary: 26500,
      turnover: 4.2,
      satisfaction: 4.6,
      productivity: 92,
      trainingHours: 52,
      absenteeism: 2.1
    },
    {
      department: "Administración",
      headcount: 18,
      avgSalary: 32000,
      turnover: 12.8,
      satisfaction: 3.8,
      productivity: 78,
      trainingHours: 38,
      absenteeism: 4.5
    },
    {
      department: "Seguridad",
      headcount: 22,
      avgSalary: 27500,
      turnover: 8.1,
      satisfaction: 4.1,
      productivity: 85,
      trainingHours: 48,
      absenteeism: 3.8
    },
    {
      department: "Recursos Humanos",
      headcount: 8,
      avgSalary: 35000,
      turnover: 5.0,
      satisfaction: 4.4,
      productivity: 90,
      trainingHours: 55,
      absenteeism: 2.5
    }
  ];

  // Datos de rotación
  const turnoverData: TurnoverData[] = [
    { month: 'Ene', voluntary: 2, involuntary: 1, total: 3, retention: 97 },
    { month: 'Feb', voluntary: 1, involuntary: 0, total: 1, retention: 99 },
    { month: 'Mar', voluntary: 3, involuntary: 1, total: 4, retention: 96 },
    { month: 'Abr', voluntary: 2, involuntary: 0, total: 2, retention: 98 },
    { month: 'May', voluntary: 1, involuntary: 1, total: 2, retention: 98 },
    { month: 'Jun', voluntary: 2, involuntary: 0, total: 2, retention: 98 }
  ];

  // Distribución por edad
  const ageDistribution = [
    { range: '18-25', count: 15, percentage: 14.3 },
    { range: '26-35', count: 42, percentage: 40.0 },
    { range: '36-45', count: 28, percentage: 26.7 },
    { range: '46-55', count: 16, percentage: 15.2 },
    { range: '56+', count: 4, percentage: 3.8 }
  ];

  // Evolución de costos de RH
  const hrCostTrends = [
    { month: 'Ene', salarios: 2850000, beneficios: 342000, capacitacion: 85000 },
    { month: 'Feb', salarios: 2920000, beneficios: 350400, capacitacion: 92000 },
    { month: 'Mar', salarios: 2980000, beneficios: 357600, capacitacion: 78000 },
    { month: 'Abr', salarios: 3050000, beneficios: 366000, capacitacion: 115000 },
    { month: 'May', salarios: 3120000, beneficios: 374400, capacitacion: 98000 },
    { month: 'Jun', salarios: 3180000, beneficios: 381600, capacitacion: 125000 }
  ];

  // Métricas de productividad
  const productivityMetrics = [
    { metric: 'Eficiencia Operativa', value: 87, target: 90 },
    { metric: 'Calidad del Trabajo', value: 92, target: 95 },
    { metric: 'Cumplimiento Objetivos', value: 89, target: 85 },
    { metric: 'Innovación', value: 76, target: 80 },
    { metric: 'Colaboración', value: 94, target: 90 }
  ];

  // Colores para gráficas
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getKPIColor = (value: number, target: number, isInverse: boolean = false) => {
    const ratio = value / target;
    if (isInverse) {
      return ratio <= 1 ? 'text-green-600' : 'text-red-600';
    }
    return ratio >= 0.9 ? 'text-green-600' : ratio >= 0.7 ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics de Recursos Humanos
              </h1>
              <p className="text-gray-600">
                Métricas avanzadas y análisis de talento humano
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
                <SelectItem value="24m">24 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Desempeño</TabsTrigger>
            <TabsTrigger value="retention">Retención</TabsTrigger>
            <TabsTrigger value="costs">Costos</TabsTrigger>
            <TabsTrigger value="demographics">Demografia</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* KPIs principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {kpis.map((kpi) => (
                <Card key={kpi.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {kpi.unit === 'MXN' ? formatCurrency(kpi.value) : kpi.value}
                        </span>
                        <span className="text-sm text-gray-500">{kpi.unit !== 'MXN' && kpi.unit}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className={getTrendColor(kpi.trend)}>
                          {kpi.value > kpi.previousValue ? '+' : ''}
                          {((kpi.value - kpi.previousValue) / kpi.previousValue * 100).toFixed(1)}%
                        </span>
                        <span className="text-gray-500">vs período anterior</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Meta: {kpi.unit === 'MXN' ? formatCurrency(kpi.target) : kpi.target}{kpi.unit !== 'MXN' && kpi.unit}</span>
                          <span className={getKPIColor(kpi.value, kpi.target, kpi.id === 'turnover' || kpi.id === 'absenteeism')}>
                            {Math.round((kpi.value / kpi.target) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráficas principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Plantilla</CardTitle>
                  <CardDescription>Crecimiento del equipo en el tiempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={turnoverData}>
                      <defs>
                        <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="retention" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorHeadcount)" 
                        name="Retención %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Departamento</CardTitle>
                  <CardDescription>Número de empleados por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={departmentAnalytics}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="headcount"
                        nameKey="department"
                        label={({ department, headcount }) => `${department}: ${headcount}`}
                      >
                        {departmentAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-6">
              {/* Métricas de productividad */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Productividad</CardTitle>
                  <CardDescription>Indicadores de rendimiento organizacional</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productivityMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{metric.metric}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Actual: {metric.value}%</span>
                                <span>Meta: {metric.target}%</span>
                              </div>
                              <Progress value={metric.value} className="h-2" />
                            </div>
                            <div className={`text-lg font-bold ${getKPIColor(metric.value, metric.target)}`}>
                              {metric.value}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analytics por departamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Desempeño por Departamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentAnalytics.map((dept) => (
                      <div key={dept.department} className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg mb-3">{dept.department}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{dept.productivity}%</div>
                            <div className="text-xs text-gray-600">Productividad</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{dept.satisfaction}/5</div>
                            <div className="text-xs text-gray-600">Satisfacción</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{dept.trainingHours}h</div>
                            <div className="text-xs text-gray-600">Capacitación</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{dept.absenteeism}%</div>
                            <div className="text-xs text-gray-600">Ausentismo</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Rotación</CardTitle>
                  <CardDescription>Tendencias de entrada y salida de personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={turnoverData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="voluntary" fill="#ef4444" name="Voluntaria" />
                      <Bar dataKey="involuntary" fill="#f59e0b" name="Involuntaria" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rotación por Departamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={departmentAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Rotación']} />
                        <Bar dataKey="turnover" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Factores de Retención</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { factor: 'Compensación Competitiva', impact: 92 },
                        { factor: 'Desarrollo Profesional', impact: 88 },
                        { factor: 'Balance Vida-Trabajo', impact: 85 },
                        { factor: 'Ambiente Laboral', impact: 91 },
                        { factor: 'Reconocimiento', impact: 76 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.factor}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={item.impact} className="w-24 h-2" />
                            <span className="text-sm font-medium w-12">{item.impact}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Costos de RH</CardTitle>
                  <CardDescription>Tendencia mensual de gastos en recursos humanos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hrCostTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                      <Legend />
                      <Line type="monotone" dataKey="salarios" stroke="#22c55e" name="Salarios" strokeWidth={3} />
                      <Line type="monotone" dataKey="beneficios" stroke="#3b82f6" name="Beneficios" strokeWidth={3} />
                      <Line type="monotone" dataKey="capacitacion" stroke="#f59e0b" name="Capacitación" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Costo por Empleado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={departmentAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Salario Promedio']} />
                        <Bar dataKey="avgSalary" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Costos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Salarios', value: 75 },
                            { name: 'Beneficios', value: 15 },
                            { name: 'Capacitación', value: 7 },
                            { name: 'Otros', value: 3 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demographics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Edad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Diversidad y Género</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Mujeres</span>
                          <span>58% (61 empleadas)</span>
                        </div>
                        <Progress value={58} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Hombres</span>
                          <span>42% (44 empleados)</span>
                        </div>
                        <Progress value={42} className="h-3" />
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Diversidad en Liderazgo</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Mujeres en cargos directivos</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Promedio de edad líderes</span>
                            <span className="font-medium">38 años</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Antigüedad y Experiencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">4.2</div>
                      <div className="text-sm text-blue-800">Años promedio antigüedad</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">78%</div>
                      <div className="text-sm text-green-800">Empleados con +2 años</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">15</div>
                      <div className="text-sm text-purple-800">Promociones internas/año</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default HRAnalytics;