import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit,
  BarChart3,
  Calendar,
  DollarSign,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

const BudgetPage = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Datos del presupuesto para 2025
  const budgetData = {
    totalBudgetIncome: 3000000,
    totalBudgetExpenses: 2400000,
    actualIncome: 1560000, // Hasta junio
    actualExpenses: 936000, // Hasta junio
    year: 2025,
    monthsElapsed: 6
  };

  // Presupuesto por categorías de ingresos
  const incomeBudgetCategories = [
    { id: 1, name: 'Actividades', budget: 1350000, actual: 702000, variance: 52, status: 'on-track' },
    { id: 2, name: 'Concesiones Alimentos', budget: 900000, actual: 468000, variance: 52, status: 'on-track' },
    { id: 3, name: 'Concesiones Recreativas', budget: 450000, actual: 234000, variance: 52, status: 'on-track' },
    { id: 4, name: 'Patrocinios', budget: 225000, actual: 117000, variance: 52, status: 'on-track' },
    { id: 5, name: 'Estacionamientos', budget: 75000, actual: 39000, variance: 52, status: 'on-track' }
  ];

  // Presupuesto por categorías de egresos
  const expenseBudgetCategories = [
    { id: 1, name: 'Personal y Nómina', budget: 1200000, actual: 546000, variance: 45.5, status: 'under-budget' },
    { id: 2, name: 'Mantenimiento y Servicios', budget: 600000, actual: 351000, variance: 58.5, status: 'over-budget' },
    { id: 3, name: 'Seguridad', budget: 360000, actual: 39000, variance: 10.8, status: 'under-budget' },
    { id: 4, name: 'Gastos Operativos', budget: 240000, actual: 0, variance: 0, status: 'under-budget' }
  ];

  // Tendencia mensual vs presupuesto
  const monthlyBudgetTrend = [
    { month: 'Ene', presupuesto: 250000, real: 248000 },
    { month: 'Feb', presupuesto: 250000, real: 267000 },
    { month: 'Mar', presupuesto: 250000, real: 289000 },
    { month: 'Abr', presupuesto: 250000, real: 303000 },
    { month: 'May', presupuesto: 250000, real: 225000 },
    { month: 'Jun', presupuesto: 250000, real: 228000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'under-budget': return 'bg-blue-100 text-blue-800';
      case 'over-budget': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track': return 'En Meta';
      case 'under-budget': return 'Bajo Presupuesto';
      case 'over-budget': return 'Sobre Presupuesto';
      case 'warning': return 'Alerta';
      default: return 'Sin Estado';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Control Presupuestal
              </h1>
              <p className="text-gray-600">
                Monitoreo y análisis del presupuesto anual
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
            
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  +4.2%
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Ingresos vs Presupuesto</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {((budgetData.actualIncome / (budgetData.totalBudgetIncome * 0.5)) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(budgetData.actualIncome)} de {formatCurrency(budgetData.totalBudgetIncome * 0.5)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  -2.1%
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Egresos vs Presupuesto</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {((budgetData.actualExpenses / (budgetData.totalBudgetExpenses * 0.5)) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(budgetData.actualExpenses)} de {formatCurrency(budgetData.totalBudgetExpenses * 0.5)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  En Meta
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Cumplimiento General</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">92.4%</p>
                <p className="text-sm text-gray-500">
                  Progreso del año fiscal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  3 Alertas
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Alertas Activas</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                <p className="text-sm text-gray-500">
                  Requieren atención
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="expenses">Egresos</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia Mensual vs Presupuesto</CardTitle>
                  <CardDescription>
                    Comparativo de ingresos reales vs presupuestados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyBudgetTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="presupuesto" stroke="#8884d8" strokeDasharray="5 5" name="Presupuesto" />
                      <Line type="monotone" dataKey="real" stroke="#82ca9d" name="Real" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado del Presupuesto Anual</CardTitle>
                  <CardDescription>
                    Progreso hacia las metas establecidas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Ingresos</span>
                      <span>{((budgetData.actualIncome / budgetData.totalBudgetIncome) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(budgetData.actualIncome / budgetData.totalBudgetIncome) * 100} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(budgetData.actualIncome)}</span>
                      <span>{formatCurrency(budgetData.totalBudgetIncome)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Egresos</span>
                      <span>{((budgetData.actualExpenses / budgetData.totalBudgetExpenses) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(budgetData.actualExpenses / budgetData.totalBudgetExpenses) * 100} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(budgetData.actualExpenses)}</span>
                      <span>{formatCurrency(budgetData.totalBudgetExpenses)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                      <CheckCircle className="h-4 w-4" />
                      Superávit Proyectado
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(budgetData.totalBudgetIncome - budgetData.totalBudgetExpenses)}
                    </div>
                    <div className="text-green-700 text-sm">
                      {(((budgetData.totalBudgetIncome - budgetData.totalBudgetExpenses) / budgetData.totalBudgetIncome) * 100).toFixed(1)}% margen proyectado
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto de Ingresos por Categoría</CardTitle>
                <CardDescription>
                  Control detallado de ingresos vs presupuesto asignado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeBudgetCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="default" className={getStatusColor(category.status)}>
                            {getStatusText(category.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Real: {formatCurrency(category.actual)}</span>
                          <span>Presupuesto: {formatCurrency(category.budget)}</span>
                        </div>
                        <Progress value={category.variance} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {category.variance.toFixed(1)}% del presupuesto anual
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto de Egresos por Categoría</CardTitle>
                <CardDescription>
                  Control detallado de gastos vs presupuesto asignado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBudgetCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="default" className={getStatusColor(category.status)}>
                            {getStatusText(category.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Gastado: {formatCurrency(category.actual)}</span>
                          <span>Presupuesto: {formatCurrency(category.budget)}</span>
                        </div>
                        <Progress value={category.variance} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {category.variance.toFixed(1)}% del presupuesto anual
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Variaciones</CardTitle>
                  <CardDescription>
                    Desviaciones significativas del presupuesto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        Mantenimiento: 58.5% ejecutado
                      </div>
                      <div className="text-red-700 text-sm">
                        Supera el 50% esperado a junio. Revisar gastos extraordinarios.
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                        <CheckCircle className="h-4 w-4" />
                        Personal: 45.5% ejecutado
                      </div>
                      <div className="text-blue-700 text-sm">
                        Bajo control. 4.5% por debajo del esperado.
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1">
                        <Activity className="h-4 w-4" />
                        Seguridad: 10.8% ejecutado
                      </div>
                      <div className="text-yellow-700 text-sm">
                        Muy por debajo del esperado. Verificar programación de pagos.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proyecciones</CardTitle>
                  <CardDescription>
                    Estimaciones para el resto del año
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Ingresos Proyectados (Dic 2025)</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(budgetData.totalBudgetIncome * 1.04)}
                      </div>
                      <div className="text-xs text-green-700">+4% sobre presupuesto original</div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Egresos Proyectados (Dic 2025)</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(budgetData.totalBudgetExpenses * 0.98)}
                      </div>
                      <div className="text-xs text-blue-700">-2% bajo presupuesto original</div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">Superávit Proyectado</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatCurrency((budgetData.totalBudgetIncome * 1.04) - (budgetData.totalBudgetExpenses * 0.98))}
                      </div>
                      <div className="text-xs text-purple-700">22.4% margen proyectado</div>
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

export default BudgetPage;