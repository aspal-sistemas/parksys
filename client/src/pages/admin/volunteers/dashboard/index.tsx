import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UsersRound, 
  Award, 
  ClipboardCheck, 
  Clock, 
  Star, 
  CalendarDays,
  ArrowUpRight,
  UserCheck,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const VolunteersDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('mes');
  
  // Datos simulados para demostración
  // En una implementación real, estos datos vendrían de la API
  
  // Datos para gráficos
  const volunteeringData = [
    { mes: 'Ene', horas: 120, voluntarios: 15 },
    { mes: 'Feb', horas: 150, voluntarios: 18 },
    { mes: 'Mar', horas: 180, voluntarios: 22 },
    { mes: 'Abr', horas: 170, voluntarios: 20 },
    { mes: 'May', horas: 200, voluntarios: 25 },
    { mes: 'Jun', horas: 220, voluntarios: 28 },
  ];
  
  const pieData = [
    { name: 'Limpieza', value: 35 },
    { name: 'Jardinería', value: 25 },
    { name: 'Educación', value: 20 },
    { name: 'Eventos', value: 15 },
    { name: 'Otros', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Datos para tarjetas estadísticas
  const stats = {
    totalVolunteers: 85,
    activeVolunteers: 72,
    totalHours: 1240,
    averageHoursPerVolunteer: 14.6,
    participationRate: 85,
    totalRecognitions: 28,
  };
  
  // Datos para la tabla de voluntarios más activos
  const topVolunteers = [
    { id: 1, name: 'Ana García Martínez', hours: 42, activities: 8, status: 'active' },
    { id: 2, name: 'Carlos López Sánchez', hours: 38, activities: 7, status: 'active' },
    { id: 3, name: 'María Rodríguez Torres', hours: 36, activities: 6, status: 'active' },
    { id: 4, name: 'Javier Méndez Castro', hours: 32, activities: 5, status: 'active' },
    { id: 5, name: 'Laura Díaz Fernández', hours: 28, activities: 4, status: 'active' },
  ];
  
  // Datos para las actividades recientes
  const recentActivities = [
    { id: 1, name: 'Limpieza del Parque Metropolitano', date: '2023-06-15', volunteers: 12, hours: 36 },
    { id: 2, name: 'Plantación de árboles en Colomos', date: '2023-06-10', volunteers: 8, hours: 24 },
    { id: 3, name: 'Taller educativo ambiental', date: '2023-06-05', volunteers: 5, hours: 15 },
    { id: 4, name: 'Mantenimiento de juegos infantiles', date: '2023-05-28', volunteers: 6, hours: 18 },
    { id: 5, name: 'Censo de fauna local', date: '2023-05-20', volunteers: 4, hours: 12 },
  ];
  
  // Datos para las evaluaciones y reconocimientos
  const evaluations = {
    averageScore: 4.7,
    totalEvaluations: 120,
    improvementAreas: [
      { area: 'Puntualidad', percentage: 15 },
      { area: 'Comunicación', percentage: 12 },
      { area: 'Trabajo en equipo', percentage: 8 },
    ]
  };
  
  const recognitions = [
    { id: 1, type: 'Voluntario del Mes', recipient: 'Ana García Martínez', date: '2023-06-01' },
    { id: 2, type: 'Mejor Equipo', recipient: 'Grupo Reforestación', date: '2023-05-15' },
    { id: 3, type: 'Mayor Dedicación', recipient: 'Carlos López Sánchez', date: '2023-05-01' },
  ];
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Voluntariado</h1>
            <p className="text-gray-500">Análisis y métricas del programa de voluntariado</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="anual">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Personalizar
            </Button>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Voluntarios Totales</CardTitle>
              <UsersRound className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalVolunteers}</div>
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12% vs. periodo anterior
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Horas de Voluntariado</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalHours}</div>
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8% vs. periodo anterior
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Participación</CardTitle>
              <UserCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.participationRate}%</div>
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +5% vs. periodo anterior
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Voluntariado</CardTitle>
              <CardDescription>Horas acumuladas y voluntarios activos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volunteeringData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="horas" name="Horas" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="voluntarios" name="Voluntarios" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Actividades</CardTitle>
              <CardDescription>Porcentaje por tipo de actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs para más métricas */}
        <Tabs defaultValue="volunteers" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volunteers">Voluntarios Destacados</TabsTrigger>
            <TabsTrigger value="activities">Actividades Recientes</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluaciones & Reconocimientos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle>Voluntarios Más Activos</CardTitle>
                <CardDescription>Los voluntarios con más horas de participación en el periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Actividades</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <div className="font-medium">{volunteer.name}</div>
                        </TableCell>
                        <TableCell>{volunteer.hours}</TableCell>
                        <TableCell>{volunteer.activities}</TableCell>
                        <TableCell>
                          {volunteer.status === 'active' ? (
                            <Badge className="bg-green-500">Activo</Badge>
                          ) : (
                            <Badge variant="outline">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Ver perfil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Actividades Recientes</CardTitle>
                <CardDescription>Últimas actividades organizadas con voluntarios</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Voluntarios</TableHead>
                      <TableHead>Horas totales</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="font-medium">{activity.name}</div>
                        </TableCell>
                        <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                        <TableCell>{activity.volunteers}</TableCell>
                        <TableCell>{activity.hours}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Ver detalles</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="evaluations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluaciones</CardTitle>
                  <CardDescription>Estado de las evaluaciones de voluntarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Puntuación media</span>
                      <span className="flex items-center">
                        {evaluations.averageScore}
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${(evaluations.averageScore / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Total evaluaciones: {evaluations.totalEvaluations}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Áreas de mejora</div>
                    {evaluations.improvementAreas.map((area, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{area.area}</span>
                          <span>{area.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${area.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reconocimientos Recientes</CardTitle>
                  <CardDescription>Últimos reconocimientos otorgados</CardDescription>
                </CardHeader>
                <CardContent>
                  {recognitions.map((recognition) => (
                    <div key={recognition.id} className="mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex items-start">
                        <div className="mr-4 p-2 bg-amber-50 rounded-full">
                          <Award className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <div className="font-medium">{recognition.type}</div>
                          <div className="text-sm text-gray-500">Otorgado a: {recognition.recipient}</div>
                          <div className="text-xs text-gray-400">{new Date(recognition.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-2">
                    Ver todos los reconocimientos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Tarjetas de estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Promedio de Horas</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageHoursPerVolunteer}</div>
              <p className="text-sm text-gray-500">Horas por voluntario</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Voluntarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeVolunteers}</div>
              <p className="text-sm text-gray-500">De {stats.totalVolunteers} totales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reconocimientos</CardTitle>
              <Award className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRecognitions}</div>
              <p className="text-sm text-gray-500">Otorgados en el periodo</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VolunteersDashboard;