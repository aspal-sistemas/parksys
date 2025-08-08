import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminSidebarComplete from "@/components/AdminSidebarComplete";
import Header from "@/components/Header";
import { 
  Zap,
  HardDrive, 
  Database,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  BarChart3,
  Activity,
  Cpu,
  MemoryStick,
  Server,
  TrendingUp,
  TrendingDown,
  Gauge
} from "lucide-react";

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export default function SystemPerformance() {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Métricas de rendimiento simuladas
  const systemMetrics: PerformanceMetric[] = [
    {
      label: "Uso de CPU",
      value: 23,
      unit: "%",
      status: "excellent",
      trend: "stable"
    },
    {
      label: "Memoria RAM",
      value: 67,
      unit: "%",
      status: "good",
      trend: "up"
    },
    {
      label: "Almacenamiento",
      value: 42,
      unit: "%",
      status: "excellent",
      trend: "stable"
    },
    {
      label: "Red I/O",
      value: 15,
      unit: "Mbps",
      status: "excellent",
      trend: "down"
    }
  ];

  const databaseMetrics: PerformanceMetric[] = [
    {
      label: "Consultas por segundo",
      value: 127,
      unit: "QPS",
      status: "good",
      trend: "up"
    },
    {
      label: "Tiempo de respuesta",
      value: 45,
      unit: "ms",
      status: "excellent",
      trend: "stable"
    },
    {
      label: "Conexiones activas",
      value: 18,
      unit: "",
      status: "excellent",
      trend: "stable"
    },
    {
      label: "Cache Hit Rate",
      value: 94,
      unit: "%",
      status: "excellent",
      trend: "up"
    }
  ];

  const webMetrics: PerformanceMetric[] = [
    {
      label: "Tiempo de carga",
      value: 1.2,
      unit: "s",
      status: "excellent",
      trend: "stable"
    },
    {
      label: "Usuarios concurrentes",
      value: 34,
      unit: "",
      status: "good",
      trend: "up"
    },
    {
      label: "Requests/min",
      value: 156,
      unit: "",
      status: "good",
      trend: "up"
    },
    {
      label: "Error Rate",
      value: 0.1,
      unit: "%",
      status: "excellent",
      trend: "stable"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      'excellent': 'Excelente',
      'good': 'Bueno',
      'warning': 'Atención',
      'critical': 'Crítico'
    };
    return names[status] || status;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simular optimización
    setTimeout(() => {
      setIsOptimizing(false);
      toast({
        title: "Optimización completada",
        description: "El sistema ha sido optimizado exitosamente",
      });
    }, 3000);
  };

  const clearCache = () => {
    toast({
      title: "Cache limpiado",
      description: "El cache del sistema ha sido limpiado",
    });
  };

  const restartServices = () => {
    toast({
      title: "Servicios reiniciados",
      description: "Los servicios del sistema han sido reiniciados",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-screen">
        <AdminSidebarComplete />
        <div className="flex-1 overflow-auto ml-64 mt-16">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
            <div className="space-y-6">
              {/* Header */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Gauge className="h-6 w-6" />
                    Monitor de Rendimiento del Sistema
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    Supervisión en tiempo real del rendimiento y optimización del sistema.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Resumen de estado general */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estado General</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Óptimo</div>
                    <p className="text-xs text-muted-foreground">
                      Todos los sistemas funcionan correctamente
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.8%</div>
                    <p className="text-xs text-muted-foreground">
                      15 días, 4 horas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Carga del Sistema</CardTitle>
                    <Server className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Baja</div>
                    <p className="text-xs text-muted-foreground">
                      23% promedio
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Última Optimización</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2h</div>
                    <p className="text-xs text-muted-foreground">
                      hace 2 horas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs de métricas detalladas */}
              <Tabs defaultValue="system" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="system" className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Sistema
                  </TabsTrigger>
                  <TabsTrigger value="database" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Base de Datos
                  </TabsTrigger>
                  <TabsTrigger value="web" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Aplicación Web
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-600" />
                        Métricas del Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {systemMetrics.map((metric, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(metric.status)}>
                                  {getStatusName(metric.status)}
                                </Badge>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                              </div>
                              <Progress 
                                value={metric.value} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="database" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-green-600" />
                        Métricas de Base de Datos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {databaseMetrics.map((metric, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(metric.status)}>
                                  {getStatusName(metric.status)}
                                </Badge>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                              </div>
                              {metric.label !== "Conexiones activas" && (
                                <Progress 
                                  value={metric.value > 100 ? 100 : metric.value} 
                                  className="h-2"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="web" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-600" />
                        Métricas de Aplicación Web
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {webMetrics.map((metric, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(metric.status)}>
                                  {getStatusName(metric.status)}
                                </Badge>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Acciones de optimización */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Herramientas de Optimización
                  </CardTitle>
                  <CardDescription>
                    Herramientas para mejorar el rendimiento del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={runOptimization}
                      disabled={isOptimizing}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Zap className="h-6 w-6" />
                      <span>Optimización Completa</span>
                      <span className="text-xs opacity-70">
                        {isOptimizing ? 'Optimizando...' : 'Optimizar sistema completo'}
                      </span>
                    </Button>

                    <Button 
                      variant="outline"
                      onClick={clearCache}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <RefreshCw className="h-6 w-6" />
                      <span>Limpiar Cache</span>
                      <span className="text-xs opacity-70">
                        Limpiar cache del sistema
                      </span>
                    </Button>

                    <Button 
                      variant="outline"
                      onClick={restartServices}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Server className="h-6 w-6" />
                      <span>Reiniciar Servicios</span>
                      <span className="text-xs opacity-70">
                        Reiniciar servicios críticos
                      </span>
                    </Button>
                  </div>

                  {isOptimizing && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-800">
                          Optimización en progreso...
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        El sistema está siendo optimizado. Este proceso puede tomar unos minutos.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}