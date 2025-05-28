import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";

const FinanceDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [viewMode, setViewMode] = useState('monthly'); // monthly, quarterly, yearly
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/financial-dashboard/3"],
  });

  const { data: cashFlowData } = useQuery({
    queryKey: ["/api/cash-flow/3", selectedYear],
  });

  const { data: incomes } = useQuery({
    queryKey: ["/api/actual-incomes"],
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/actual-expenses"],
  });

  const { data: incomeCategories } = useQuery({
    queryKey: ["/api/income-categories"],
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard financiero...</p>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Preparar datos para gráficas
  const monthlyTrendData = [
    { month: 'Ene', ingresos: 145000, egresos: 98000, anterior: 120000 },
    { month: 'Feb', ingresos: 167000, egresos: 112000, anterior: 135000 },
    { month: 'Mar', ingresos: 189000, egresos: 125000, anterior: 155000 },
    { month: 'Abr', ingresos: 203000, egresos: 134000, anterior: 178000 },
    { month: 'May', ingresos: 225000, egresos: 145000, anterior: 195000 },
    { month: 'Jun', ingresos: 248000, egresos: 156000, anterior: 210000 },
  ];

  const incomeDistributionData = [
    { name: 'Actividades', value: 45, amount: 112000, color: '#3B82F6' },
    { name: 'Concesiones', value: 30, amount: 75000, color: '#10B981' },
    { name: 'Patrocinios', value: 15, amount: 37500, color: '#F59E0B' },
    { name: 'Estacionamiento', value: 7, amount: 17500, color: '#8B5CF6' },
    { name: 'Otros', value: 3, amount: 7500, color: '#EF4444' }
  ];

  const expenseDistributionData = [
    { name: 'Personal', value: 50, amount: 78000, color: '#EF4444' },
    { name: 'Mantenimiento', value: 25, amount: 39000, color: '#F97316' },
    { name: 'Seguridad', value: 15, amount: 23400, color: '#6366F1' },
    { name: 'Operativos', value: 10, amount: 15600, color: '#EC4899' }
  ];

  const kpiData = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(dashboardData?.totalIncome || 250000),
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Egresos Totales', 
      value: formatCurrency(dashboardData?.totalExpenses || 156000),
      change: '+5.2%',
      trend: 'up',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Utilidad Neta',
      value: formatCurrency((dashboardData?.totalIncome || 250000) - (dashboardData?.totalExpenses || 156000)),
      change: '+23.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Margen Operativo',
      value: `${(((dashboardData?.totalIncome || 250000) - (dashboardData?.totalExpenses || 156000)) / (dashboardData?.totalIncome || 250000) * 100).toFixed(1)}%`,
      change: '+8.7%',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Financiero
              </h1>
              <p className="text-gray-600">
                Analytics avanzado y resumen ejecutivo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs principales con mejor diseño */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráfica de tendencias principales */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos vs Egresos</CardTitle>
            <CardDescription>
              Comparativo mensual con año anterior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(Number(value)), name === 'ingresos' ? 'Ingresos' : name === 'egresos' ? 'Egresos' : 'Año Anterior']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Ingresos 2025"
                />
                <Area 
                  type="monotone" 
                  dataKey="egresos" 
                  stackId="2" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3}
                  name="Egresos 2025"
                />
                <Line 
                  type="monotone" 
                  dataKey="anterior" 
                  stroke="#6B7280" 
                  strokeDasharray="5 5"
                  name="Ingresos 2024"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de ingresos y egresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ingresos</CardTitle>
              <CardDescription>
                Fuentes principales de ingresos del mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={incomeDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {incomeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  {incomeDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-500">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Egresos</CardTitle>
              <CardDescription>
                Principales categorías de gastos del mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Actividades</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Concesiones</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">30%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Patrocinios</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Otros</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Egresos</CardTitle>
              <CardDescription>
                Principales categorías de gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Personal y Nómina</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">50%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mantenimiento</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seguridad</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gastos Operativos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y estado financiero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Liquidez</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Buena</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rentabilidad</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">Estable</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Crecimiento</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Positivo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">Presupuesto de mantenimiento al 85%</p>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800">Ingresos por concesiones en crecimiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  📊 Ver reporte mensual
                </button>
                <button className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  💰 Registrar nuevo ingreso
                </button>
                <button className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  📋 Revisar presupuesto
                </button>
                <button className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  🧮 Usar calculadora
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceDashboard;