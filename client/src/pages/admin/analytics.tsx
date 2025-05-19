import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, Users, Map, Activity, AlertTriangle, MessageSquare, BarChart, PieChart, LineChart } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('uso');
  
  const handleExportData = (reportType: string) => {
    // TODO: Implement actual export functionality
    alert(`Exportando datos de ${reportType}...`);
  };
  
  return (
    <AdminLayout title="Análisis y Reportes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Análisis y Reportes</h2>
            <p className="text-muted-foreground">
              Visualiza estadísticas y genera reportes para la gestión y toma de decisiones
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData(activeTab)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="uso">
              <Users className="h-4 w-4 mr-2" />
              Uso de Parques
            </TabsTrigger>
            <TabsTrigger value="actividades">
              <Activity className="h-4 w-4 mr-2" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="incidencias">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidencias
            </TabsTrigger>
            <TabsTrigger value="mantenimiento">
              <Calendar className="h-4 w-4 mr-2" />
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="participacion">
              <MessageSquare className="h-4 w-4 mr-2" />
              Participación
            </TabsTrigger>
          </TabsList>
          
          {/* Uso de Parques */}
          <TabsContent value="uso" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Parques</CardTitle>
                  <CardDescription>Total de parques y distribución por tipo</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-4xl font-bold mb-2">24</div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-blue-50">Urbanos: 12</Badge>
                    <Badge variant="outline" className="bg-green-50">Lineales: 5</Badge>
                    <Badge variant="outline" className="bg-amber-50">Bosques: 3</Badge>
                    <Badge variant="outline" className="bg-purple-50">De Bolsillo: 4</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Visitantes Mensuales</CardTitle>
                  <CardDescription>Promedio de visitantes por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">23,400</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑12.5%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Eventos</CardTitle>
                  <CardDescription>Total de eventos realizados en parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">453</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑8.3%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Uso Anual</CardTitle>
                <CardDescription>Visitantes y eventos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de tendencia de uso anual</p>
                    <p className="text-sm text-muted-foreground">Muestra la evolución mensual de visitantes y eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Actividades */}
          <TabsContent value="actividades" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Actividades</CardTitle>
                  <CardDescription>Actividades programadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">195</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑15.8%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Participación</CardTitle>
                  <CardDescription>Promedio de participantes por actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">28</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑5.2%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Satisfacción</CardTitle>
                  <CardDescription>Valoración promedio de las actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">4.7 / 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Basado en 845 valoraciones
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Actividades</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de distribución de actividades</p>
                      <p className="text-sm text-muted-foreground">Muestra los tipos de actividades más comunes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Parques con más Actividades</CardTitle>
                  <CardDescription>Top 5 parques por número de actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de parques más activos</p>
                      <p className="text-sm text-muted-foreground">Muestra los 5 parques con más actividades programadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Incidencias */}
          <TabsContent value="incidencias" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Incidencias</CardTitle>
                  <CardDescription>Incidencias reportadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">153</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑5.3%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Respuesta</CardTitle>
                  <CardDescription>Promedio para resolver incidencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">3.2 días</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↓15%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Resolución</CardTitle>
                  <CardDescription>Porcentaje de incidencias resueltas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑4%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Incidencias</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de tipos de incidencias</p>
                      <p className="text-sm text-muted-foreground">Muestra la distribución de incidencias por tipo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Incidencias por Parque</CardTitle>
                  <CardDescription>Top 5 parques con más reportes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de incidencias por parque</p>
                      <p className="text-sm text-muted-foreground">Muestra los 5 parques con más incidencias reportadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Mantenimiento */}
          <TabsContent value="mantenimiento" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas de Mantenimiento</CardTitle>
                  <CardDescription>Total de tareas programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">105</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 28 parques diferentes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Presupuesto Utilizado</CardTitle>
                  <CardDescription>Del presupuesto anual de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">65%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    MXN 3,250,000 de 5,000,000
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Costo Promedio</CardTitle>
                  <CardDescription>Por tarea de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">MXN 30,952</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑8%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Tareas</CardTitle>
                  <CardDescription>Distribución por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de estados de tareas</p>
                      <p className="text-sm text-muted-foreground">Muestra las tareas completadas, en progreso y pendientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Mantenimiento</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Gráfico de tipos de mantenimiento</p>
                      <p className="text-sm text-muted-foreground">Muestra los tipos de tareas de mantenimiento más comunes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Participación Ciudadana */}
          <TabsContent value="participacion" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Comentarios</CardTitle>
                  <CardDescription>Comentarios recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">865</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑22%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Encuestas Completadas</CardTitle>
                  <CardDescription>Total de participaciones en encuestas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,245</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 12 encuestas publicadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Propuestas Ciudadanas</CardTitle>
                  <CardDescription>Ideas y propuestas recibidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">196</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑32%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Participación</CardTitle>
                <CardDescription>Evolución mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de tendencia de participación</p>
                    <p className="text-sm text-muted-foreground">Muestra la evolución mensual de comentarios, encuestas y propuestas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Parques con Mayor Participación</CardTitle>
                <CardDescription>Top 5 parques con más interacciones ciudadanas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Gráfico de participación por parque</p>
                    <p className="text-sm text-muted-foreground">Muestra los 5 parques con mayor participación ciudadana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
  
  return (
    <AdminLayout title="Análisis y Reportes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Análisis y Reportes</h2>
            <p className="text-muted-foreground">
              Visualiza estadísticas y genera reportes para la gestión y toma de decisiones
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData(activeTab)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="uso">
              <Users className="h-4 w-4 mr-2" />
              Uso de Parques
            </TabsTrigger>
            <TabsTrigger value="actividades">
              <Activity className="h-4 w-4 mr-2" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="incidencias">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidencias
            </TabsTrigger>
            <TabsTrigger value="mantenimiento">
              <Calendar className="h-4 w-4 mr-2" />
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="participacion">
              <MessageSquare className="h-4 w-4 mr-2" />
              Participación
            </TabsTrigger>
          </TabsList>
          
          {/* Uso de Parques */}
          <TabsContent value="uso" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Parques</CardTitle>
                  <CardDescription>Total de parques y distribución por tipo</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-4xl font-bold mb-2">{parks.length}</div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-blue-50">Urbanos: {parks.filter((p: any) => p.parkType === 'Urbano').length}</Badge>
                    <Badge variant="outline" className="bg-green-50">Lineales: {parks.filter((p: any) => p.parkType === 'Lineal').length}</Badge>
                    <Badge variant="outline" className="bg-amber-50">Bosques: {parks.filter((p: any) => p.parkType === 'Bosque').length}</Badge>
                    <Badge variant="outline" className="bg-purple-50">De Bolsillo: {parks.filter((p: any) => p.parkType === 'Bolsillo').length}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Visitantes Mensuales</CardTitle>
                  <CardDescription>Promedio de visitantes por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">23,400</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑12.5%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Eventos</CardTitle>
                  <CardDescription>Total de eventos realizados en parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">453</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑8.3%</span> vs el año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Uso Anual</CardTitle>
                <CardDescription>Visitantes y eventos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={parkUsageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="visitantes" stroke="#0088FE" activeDot={{ r: 8 }} name="Visitantes" />
                      <Line yAxisId="right" type="monotone" dataKey="eventos" stroke="#00C49F" name="Eventos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Actividades */}
          <TabsContent value="actividades" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Actividades</CardTitle>
                  <CardDescription>Actividades programadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{activities.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑15.8%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Participación</CardTitle>
                  <CardDescription>Promedio de participantes por actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">28</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑5.2%</span> vs trimestre anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Satisfacción</CardTitle>
                  <CardDescription>Valoración promedio de las actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">4.7 / 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Basado en 845 valoraciones
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Actividades</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={actividadesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {actividadesData.map((entry, index) => (
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
                  <CardTitle>Parques con más Actividades</CardTitle>
                  <CardDescription>Top 5 parques por número de actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: "Parque Metropolitano", actividades: 42 },
                          { name: "Parque Agua Azul", actividades: 36 },
                          { name: "Parque Alcalde", actividades: 28 },
                          { name: "Parque González Gallo", actividades: 22 },
                          { name: "Parque Mirador", actividades: 18 }
                        ]}
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="actividades" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Incidencias */}
          <TabsContent value="incidencias" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Incidencias</CardTitle>
                  <CardDescription>Incidencias reportadas en todos los parques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{incidents.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑5.3%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Respuesta</CardTitle>
                  <CardDescription>Promedio para resolver incidencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">3.2 días</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↓15%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Resolución</CardTitle>
                  <CardDescription>Porcentaje de incidencias resueltas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">87%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑4%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Incidencias</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incidentesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incidentesData.map((entry, index) => (
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
                  <CardTitle>Incidencias por Parque</CardTitle>
                  <CardDescription>Top 5 parques con más reportes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: "Parque Agua Azul", incidencias: 32 },
                          { name: "Parque Metropolitano", incidencias: 28 },
                          { name: "Parque Morelos", incidencias: 24 },
                          { name: "Parque Alcalde", incidencias: 18 },
                          { name: "Parque Liberación", incidencias: 15 }
                        ]}
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="incidencias" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Mantenimiento */}
          <TabsContent value="mantenimiento" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas de Mantenimiento</CardTitle>
                  <CardDescription>Total de tareas programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">105</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 28 parques diferentes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Presupuesto Utilizado</CardTitle>
                  <CardDescription>Del presupuesto anual de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">65%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    MXN 3,250,000 de 5,000,000
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Costo Promedio</CardTitle>
                  <CardDescription>Por tarea de mantenimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">MXN 30,952</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-rose-500 font-medium">↑8%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Tareas</CardTitle>
                  <CardDescription>Distribución por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mantenimientoData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mantenimientoData.map((entry, index) => (
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
                  <CardTitle>Tipos de Mantenimiento</CardTitle>
                  <CardDescription>Distribución por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Áreas verdes", valor: 42 },
                          { name: "Mobiliario", valor: 35 },
                          { name: "Iluminación", valor: 28 },
                          { name: "Senderos", valor: 22 },
                          { name: "Instalaciones", valor: 18 },
                          { name: "Otros", valor: 10 }
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="valor" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Participación Ciudadana */}
          <TabsContent value="participacion" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Comentarios</CardTitle>
                  <CardDescription>Comentarios recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{comments.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑22%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Encuestas Completadas</CardTitle>
                  <CardDescription>Total de participaciones en encuestas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,245</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    En 12 encuestas publicadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Propuestas Ciudadanas</CardTitle>
                  <CardDescription>Ideas y propuestas recibidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">196</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-500 font-medium">↑32%</span> vs año anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Participación</CardTitle>
                <CardDescription>Evolución mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={participacionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="comentarios" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="encuestas" stroke="#00C49F" />
                      <Line type="monotone" dataKey="propuestas" stroke="#FFBB28" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Parques con Mayor Participación</CardTitle>
                <CardDescription>Top 5 parques con más interacciones ciudadanas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: "Parque Metropolitano", total: 245 },
                        { name: "Parque Agua Azul", total: 198 },
                        { name: "Parque Alcalde", total: 156 },
                        { name: "Parque Revolución", total: 132 },
                        { name: "Parque Mirador", total: 118 }
                      ]}
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884D8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;