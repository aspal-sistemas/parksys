import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Target,
  Calendar,
  RefreshCw,
  Download
} from "lucide-react";

interface BudgetDashboard {
  year: number;
  parkId: number | null;
  summary: {
    totalRealIncome: number;
    totalRealExpense: number;
    netReal: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
  };
  monthlyComparison: Array<{
    month: number;
    monthName: string;
    realIncome: number;
    realExpense: number;
    incomeCategories: Array<{
      categoryId: number;
      categoryName: string;
      real: number;
    }>;
    expenseCategories: Array<{
      categoryId: number;
      categoryName: string;
      real: number;
    }>;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    month: number;
  }>;
}

interface VarianceAnalysis {
  incomeVariances: Array<{
    categoryId: number;
    categoryName: string;
    totalReal: number;
    monthlyData: Array<{
      month: number;
      real: number;
    }>;
    avgMonthly: number;
    trend: string;
  }>;
  expenseVariances: Array<{
    categoryId: number;
    categoryName: string;
    totalReal: number;
    monthlyData: Array<{
      month: number;
      real: number;
    }>;
    avgMonthly: number;
    trend: string;
  }>;
}

interface AdjustedProjections {
  year: number;
  currentMonth: number;
  incomeProjections: Array<{
    categoryId: number;
    categoryName: string;
    realToDate: number;
    monthlyAverage: number;
    projectedRemaining: number;
    yearEndProjection: number;
    confidenceLevel: string;
  }>;
  expenseProjections: Array<{
    categoryId: number;
    categoryName: string;
    realToDate: number;
    monthlyAverage: number;
    projectedRemaining: number;
    yearEndProjection: number;
    confidenceLevel: string;
  }>;
  yearEndProjection: {
    totalIncome: number;
    totalExpense: number;
    netProjection: number;
  };
}

interface AlertsData {
  alerts: Array<{
    type: string;
    severity: string;
    category: string;
    message: string;
    amount: number;
    threshold: number;
  }>;
  generatedAt: string;
}

export default function BudgetTracking() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPark, setSelectedPark] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Query para obtener parques
  const { data: parks } = useQuery({
    queryKey: ["/api/parks"],
  });

  // Query para dashboard principal
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<BudgetDashboard>({
    queryKey: [`/api/budget-tracking/dashboard/${selectedPark}/${selectedYear}`],
    enabled: selectedYear > 0
  });

  // Query para análisis de variaciones
  const { data: varianceAnalysis, isLoading: varianceLoading } = useQuery<VarianceAnalysis>({
    queryKey: [`/api/budget-tracking/variance-analysis/${selectedPark}/${selectedYear}`],
    enabled: selectedYear > 0 && activeTab === "variance"
  });

  // Query para proyecciones ajustadas
  const { data: adjustedProjections, isLoading: projectionsLoading } = useQuery<AdjustedProjections>({
    queryKey: [`/api/budget-tracking/adjusted-projections/${selectedPark}/${selectedYear}`],
    enabled: selectedYear > 0 && activeTab === "projections"
  });

  // Query para alertas
  const { data: alertsData, isLoading: alertsLoading } = useQuery<AlertsData>({
    queryKey: [`/api/budget-tracking/alerts/${selectedPark}`],
    enabled: activeTab === "alerts"
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceBadge = (level: string) => {
    const variants = {
      high: "default",
      medium: "secondary", 
      low: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[level as keyof typeof variants] || "secondary"}>
        {level === 'high' ? 'Alta' : level === 'medium' ? 'Media' : 'Baja'}
      </Badge>
    );
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'danger' ? 'text-red-600' : 
           severity === 'warning' ? 'text-yellow-600' : 'text-blue-600';
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento Presupuestario</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del presupuesto vs gastos reales
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPark} onValueChange={setSelectedPark}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {parks?.map((park: any) => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => refetchDashboard()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="variance">Análisis de Variaciones</TabsTrigger>
          <TabsTrigger value="projections">Proyecciones Ajustadas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboard && (
            <>
              {/* Resumen general */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboard.summary.totalRealIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Promedio mensual: {formatCurrency(dashboard.summary.avgMonthlyIncome)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(dashboard.summary.totalRealExpense)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Promedio mensual: {formatCurrency(dashboard.summary.avgMonthlyExpense)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
                    <DollarSign className={`h-4 w-4 ${dashboard.summary.netReal >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${dashboard.summary.netReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dashboard.summary.netReal)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Año {selectedYear}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
                    <AlertTriangle className={`h-4 w-4 ${dashboard.alerts.length > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboard.alerts.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requieren atención
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas activas */}
              {dashboard.alerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Alertas Activas</h3>
                  {dashboard.alerts.map((alert, index) => (
                    <Alert key={index} className={`border-l-4 ${alert.type === 'danger' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className={getSeverityColor(alert.type)}>
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Gráfico de comparación mensual */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparación Mensual - Ingresos vs Egresos</CardTitle>
                  <CardDescription>
                    Datos reales de ingresos y egresos por mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dashboard.monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label) => `Mes: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="realIncome" fill="#10b981" name="Ingresos Reales" />
                      <Bar dataKey="realExpense" fill="#ef4444" name="Egresos Reales" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="variance" className="space-y-6">
          {varianceLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : varianceAnalysis && (
            <>
              {/* Análisis de ingresos */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Variaciones - Ingresos</CardTitle>
                  <CardDescription>
                    Análisis detallado por categoría de ingresos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {varianceAnalysis.incomeVariances.map((variance) => (
                      <div key={variance.categoryId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{variance.categoryName}</h4>
                          <Badge variant="outline">{variance.trend}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Real</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(variance.totalReal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Promedio Mensual</p>
                            <p className="text-lg font-bold">
                              {formatCurrency(variance.avgMonthly)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Análisis de egresos */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Variaciones - Egresos</CardTitle>
                  <CardDescription>
                    Análisis detallado por categoría de egresos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {varianceAnalysis.expenseVariances.map((variance) => (
                      <div key={variance.categoryId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{variance.categoryName}</h4>
                          <Badge variant="outline">{variance.trend}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Real</p>
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(variance.totalReal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Promedio Mensual</p>
                            <p className="text-lg font-bold">
                              {formatCurrency(variance.avgMonthly)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {projectionsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : adjustedProjections && (
            <>
              {/* Resumen de proyecciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Proyección Fin de Año {selectedYear}</CardTitle>
                  <CardDescription>
                    Basada en datos reales hasta el mes {adjustedProjections.currentMonth}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Ingresos Proyectados</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(adjustedProjections.yearEndProjection.totalIncome)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Egresos Proyectados</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(adjustedProjections.yearEndProjection.totalExpense)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Balance Proyectado</p>
                      <p className={`text-2xl font-bold ${adjustedProjections.yearEndProjection.netProjection >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(adjustedProjections.yearEndProjection.netProjection)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proyecciones detalladas de ingresos */}
              <Card>
                <CardHeader>
                  <CardTitle>Proyecciones de Ingresos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adjustedProjections.incomeProjections.map((projection) => (
                      <div key={projection.categoryId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{projection.categoryName}</h4>
                          {getConfidenceBadge(projection.confidenceLevel)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Real a la fecha</p>
                            <p className="font-semibold">{formatCurrency(projection.realToDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Promedio mensual</p>
                            <p className="font-semibold">{formatCurrency(projection.monthlyAverage)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Proyección restante</p>
                            <p className="font-semibold">{formatCurrency(projection.projectedRemaining)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total fin de año</p>
                            <p className="font-semibold text-green-600">{formatCurrency(projection.yearEndProjection)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Proyecciones detalladas de egresos */}
              <Card>
                <CardHeader>
                  <CardTitle>Proyecciones de Egresos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adjustedProjections.expenseProjections.map((projection) => (
                      <div key={projection.categoryId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{projection.categoryName}</h4>
                          {getConfidenceBadge(projection.confidenceLevel)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Real a la fecha</p>
                            <p className="font-semibold">{formatCurrency(projection.realToDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Promedio mensual</p>
                            <p className="font-semibold">{formatCurrency(projection.monthlyAverage)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Proyección restante</p>
                            <p className="font-semibold">{formatCurrency(projection.projectedRemaining)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total fin de año</p>
                            <p className="font-semibold text-red-600">{formatCurrency(projection.yearEndProjection)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {alertsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : alertsData && (
            <Card>
              <CardHeader>
                <CardTitle>Alertas Presupuestarias</CardTitle>
                <CardDescription>
                  Generadas el {new Date(alertsData.generatedAt).toLocaleString('es-MX')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsData.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Todo está en orden</h3>
                    <p className="text-muted-foreground">No hay alertas presupuestarias activas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alertsData.alerts.map((alert, index) => (
                      <Alert key={index} className={`border-l-4 ${alert.severity === 'danger' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <div>
                          <div className="flex justify-between items-start">
                            <AlertDescription className={getSeverityColor(alert.severity)}>
                              <strong>{alert.category}</strong>: {alert.message}
                            </AlertDescription>
                            <Badge variant={alert.severity === 'danger' ? 'destructive' : 'secondary'}>
                              {alert.severity === 'danger' ? 'Crítico' : 'Advertencia'}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Monto actual: {formatCurrency(alert.amount)} | 
                            Umbral: {formatCurrency(alert.threshold)}
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}