import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Simplified dashboard component for the admin panel
const AdminDashboard: React.FC = () => {
  // Fetch parks count - we'll use the parks endpoint and just get the count
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  const parkData = [
    { name: "Ene", total: 15 },
    { name: "Feb", total: 19 },
    { name: "Mar", total: 24 },
    { name: "Abr", total: 28 },
    { name: "May", total: 35 },
    { name: "Jun", total: 39 },
    { name: "Jul", total: 42 },
    { name: "Ago", total: 45 },
    { name: "Sep", total: 48 },
    { name: "Oct", total: 52 },
    { name: "Nov", total: 54 },
    { name: "Dic", total: parks.length || 56 },
  ];
  
  const activityData = [
    { name: "Ene", total: 5 },
    { name: "Feb", total: 8 },
    { name: "Mar", total: 12 },
    { name: "Abr", total: 15 },
    { name: "May", total: 18 },
    { name: "Jun", total: 21 },
    { name: "Jul", total: 24 },
    { name: "Ago", total: 27 },
    { name: "Sep", total: 30 },
    { name: "Oct", total: 32 },
    { name: "Nov", total: 34 },
    { name: "Dic", total: 36 },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Bienvenido al panel de administración de ParquesMX
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/parks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Parque
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Parks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Parques
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parks.length}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-emerald-500 bg-emerald-50">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +4.5%
                  </Badge>
                  <span className="ml-1">desde el mes pasado</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-emerald-500 bg-emerald-50">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                  <span className="ml-1">desde el mes pasado</span>
                </p>
              </CardContent>
            </Card>
            
            {/* Activities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actividades
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">36</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-rose-500 bg-rose-50">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    -2.5%
                  </Badge>
                  <span className="ml-1">desde el mes pasado</span>
                </p>
              </CardContent>
            </Card>
            
            {/* Incidents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Incidentes Reportados
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-rose-500 bg-rose-50">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +8%
                  </Badge>
                  <span className="ml-1">desde el mes pasado</span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Analytics */}
          <Tabs defaultValue="overview" className="mb-6 space-y-4">
            <TabsList>
              <TabsTrigger value="overview">General</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Parques Registrados</CardTitle>
                    <CardDescription>
                      Crecimiento mensual del número de parques en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={parkData}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="total"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Actividades</CardTitle>
                    <CardDescription>
                      Actividades programadas por mes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={activityData}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis</CardTitle>
                  <CardDescription>
                    Análisis detallado de uso y rendimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Datos de análisis avanzados disponibles próximamente
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    Reportes y estadísticas del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Funcionalidad de reportes disponible próximamente
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Recent activity */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent parks */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Parques Recientes</CardTitle>
                <CardDescription>Los últimos parques agregados al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parks.slice(-3).reverse().map((park: any, i: number) => (
                    <div key={i} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{park.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {park.address.substring(0, 30)}...
                        </p>
                      </div>
                      <Link href={`/admin/parks/${park.id}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  
                  <Link href="/admin/parks">
                    <Button variant="outline" className="w-full mt-2">
                      Ver todos los parques
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent comments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Comentarios Recientes</CardTitle>
                <CardDescription>Los últimos comentarios de los ciudadanos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">María L.</p>
                      <p className="text-xs text-muted-foreground">
                        "Excelente parque, muy limpio y seguro. Me encanta venir los fines de semana."
                      </p>
                      <div className="flex items-center pt-1">
                        <p className="text-xs text-muted-foreground">Parque Metropolitano • Hace 2 días</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Carlos R.</p>
                      <p className="text-xs text-muted-foreground">
                        "Las instalaciones deportivas están en muy buen estado. Recomendado."
                      </p>
                      <div className="flex items-center pt-1">
                        <p className="text-xs text-muted-foreground">Parque Deportivo • Hace 3 días</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Sofia T.</p>
                      <p className="text-xs text-muted-foreground">
                        "Me encantaron las áreas para mascotas. Mi perro lo disfrutó mucho."
                      </p>
                      <div className="flex items-center pt-1">
                        <p className="text-xs text-muted-foreground">Bosque Los Colomos • Hace 5 días</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2">
                    Ver todos los comentarios
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent incidents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Incidentes Recientes</CardTitle>
                <CardDescription>Los últimos reportes de incidentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Luces dañadas</p>
                      <p className="text-xs text-muted-foreground">
                        "Varias luces del sendero principal no funcionan."
                      </p>
                      <div className="flex items-center pt-1">
                        <Badge variant="outline" className="text-amber-500">Pendiente</Badge>
                        <p className="text-xs text-muted-foreground ml-2">Parque Metropolitano • Hace 1 día</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Sanitarios sucios</p>
                      <p className="text-xs text-muted-foreground">
                        "Los baños del área de picnic necesitan limpieza."
                      </p>
                      <div className="flex items-center pt-1">
                        <Badge variant="outline" className="text-emerald-500">Resuelto</Badge>
                        <p className="text-xs text-muted-foreground ml-2">Bosque Los Colomos • Hace 3 días</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Juego infantil dañado</p>
                      <p className="text-xs text-muted-foreground">
                        "El tobogán está roto y puede ser peligroso."
                      </p>
                      <div className="flex items-center pt-1">
                        <Badge variant="outline" className="text-amber-500">En proceso</Badge>
                        <p className="text-xs text-muted-foreground ml-2">Parque Independencia • Hace 4 días</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2">
                    Ver todos los incidentes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
