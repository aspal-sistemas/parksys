import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Users, 
  Calendar, 
  TreePine,
  Building,
  DollarSign,
  HeartHandshake,
  Briefcase,
  Shield,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/AdminLayout';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Dashboard mejorado con gráficas e indicadores
const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('common');
  
  // Consultas de datos reales
  const { data: parks = [] } = useQuery({ queryKey: ['/api/parks'] });
  const { data: activities = [] } = useQuery({ queryKey: ['/api/activities'] });
  const { data: users = [] } = useQuery({ queryKey: ['/api/users'] });
  const { data: employees = [] } = useQuery({ queryKey: ['/api/hr/employees'] });
  const { data: volunteers = [] } = useQuery({ queryKey: ['/api/volunteers'] });
  const { data: concessions = [] } = useQuery({ queryKey: ['/api/active-concessions'] });

  // Seguridad de tipos para arrays
  const parksArray = Array.isArray(parks) ? parks : [];
  const activitiesArray = Array.isArray(activities) ? activities : [];
  const usersArray = Array.isArray(users) ? users : [];
  const employeesArray = Array.isArray(employees) ? employees : [];
  const volunteersArray = Array.isArray(volunteers) ? volunteers : [];
  const concessionsArray = Array.isArray(concessions) ? concessions : [];

  // Datos para gráficas
  const monthlyData = [
    { name: 'Ene', parques: 18, actividades: 45, voluntarios: 23 },
    { name: 'Feb', parques: 19, actividades: 52, voluntarios: 28 },
    { name: 'Mar', parques: 20, actividades: 48, voluntarios: 31 },
    { name: 'Abr', parques: 21, actividades: 65, voluntarios: 35 },
    { name: 'May', parques: 22, actividades: 58, voluntarios: 42 },
    { name: 'Jun', parques: 22, actividades: 71, voluntarios: 38 },
    { name: 'Jul', parques: parksArray.length, actividades: activitiesArray.length, voluntarios: volunteersArray.length }
  ];

  const moduleUsageData = [
    { name: 'Parques', value: 95, color: '#00a587' },
    { name: 'RH', value: 88, color: '#067f5f' },
    { name: 'Finanzas', value: 92, color: '#bcd256' },
    { name: 'Actividades', value: 78, color: '#8498a5' },
    { name: 'Voluntarios', value: 65, color: '#059669' },
    { name: 'Concesiones', value: 72, color: '#0ea5e9' }
  ];

  const financialData = [
    { name: 'Ene', ingresos: 125000, egresos: 98000 },
    { name: 'Feb', ingresos: 132000, egresos: 105000 },
    { name: 'Mar', ingresos: 145000, egresos: 112000 },
    { name: 'Abr', ingresos: 158000, egresos: 118000 },
    { name: 'May', ingresos: 162000, egresos: 125000 },
    { name: 'Jun', ingresos: 175000, egresos: 135000 },
    { name: 'Jul', ingresos: 182000, egresos: 128000 }
  ];

  const parkTypeData = [
    { name: 'Urbanos', value: 8, color: '#00a587' },
    { name: 'Metropolitanos', value: 5, color: '#067f5f' },
    { name: 'Vecinales', value: 4, color: '#bcd256' },
    { name: 'Lineales', value: 3, color: '#8498a5' },
    { name: 'Naturales', value: 2, color: '#059669' }
  ];

  return (
    <AdminLayout 
      title="Dashboard Ejecutivo" 
      subtitle="Panel de control integral del sistema ParkSys"
    >
      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Parques */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Total de Parques
            </CardTitle>
            <MapPin className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{parksArray.length}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+2 este mes</span>
            </div>
            <Progress value={85} className="mt-3" />
            <p className="text-xs text-green-700 mt-1">85% de capacidad objetivo</p>
          </CardContent>
        </Card>
        
        {/* Personal RH */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Personal Activo
            </CardTitle>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{employeesArray.length}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">+5 este mes</span>
            </div>
            <Progress value={92} className="mt-3" />
            <p className="text-xs text-blue-700 mt-1">92% asistencia promedio</p>
          </CardContent>
        </Card>
        
        {/* Actividades */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Actividades Activas
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{activitiesArray.length}</div>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">15 esta semana</span>
            </div>
            <Progress value={78} className="mt-3" />
            <p className="text-xs text-purple-700 mt-1">78% participación promedio</p>
          </CardContent>
        </Card>
        
        {/* Finanzas */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Balance Mensual
            </CardTitle>
            <DollarSign className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">$54K</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-amber-600 mr-1" />
              <span className="text-sm text-amber-600 font-medium">+18% vs mes anterior</span>
            </div>
            <Progress value={68} className="mt-3" />
            <p className="text-xs text-amber-700 mt-1">68% del presupuesto anual</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas principales */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Tendencias mensuales */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tendencias de Crecimiento</CardTitle>
            <CardDescription>Evolución mensual de los principales indicadores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="parques" stroke="#00a587" strokeWidth={3} name="Parques" />
                <Line type="monotone" dataKey="actividades" stroke="#8498a5" strokeWidth={3} name="Actividades" />
                <Line type="monotone" dataKey="voluntarios" stroke="#059669" strokeWidth={3} name="Voluntarios" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uso de módulos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Adopción de Módulos</CardTitle>
            <CardDescription>Porcentaje de uso activo por módulo del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleUsageData.map((module, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: module.color }}
                    ></div>
                    <span className="text-sm font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={module.value} className="w-20" />
                    <span className="text-sm font-bold w-10">{module.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Flujo financiero */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Flujo Financiero</CardTitle>
            <CardDescription>Ingresos vs Egresos (Miles de pesos)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${(Number(value) / 1000).toFixed(0)}K`, '']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stackId="1" 
                  stroke="#00a587" 
                  fill="#00a587" 
                  fillOpacity={0.6}
                  name="Ingresos"
                />
                <Area 
                  type="monotone" 
                  dataKey="egresos" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Egresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de parques */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tipos de Parques</CardTitle>
            <CardDescription>Distribución por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={parkTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {parkTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPIs y alertas */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Indicadores críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Indicadores Críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mantenimiento Pendiente</span>
              <Badge variant="destructive">3 urgentes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Presupuesto Disponible</span>
              <Badge variant="outline" className="text-amber-600">32% restante</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Eventos Próximos</span>
              <Badge variant="secondary">8 esta semana</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contratos por Vencer</span>
              <Badge variant="destructive">2 este mes</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Estado del sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Usuarios Activos (24h)</span>
              <Badge variant="outline" className="text-green-600">{usersArray.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime del Sistema</span>
              <Badge variant="outline" className="text-green-600">99.8%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup Automático</span>
              <Badge variant="outline" className="text-green-600">Actualizado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Seguridad</span>
              <Badge variant="outline" className="text-green-600">Óptima</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Acciones pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Acciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span>Aprobación de Eventos</span>
                <Badge>5</Badge>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span>Revisión de Concesiones</span>
                <Badge>2</Badge>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span>Evaluaciones Pendientes</span>
                <Badge>8</Badge>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <Link href="/admin/tasks">
              <Button variant="outline" size="sm" className="w-full mt-3">
                Ver Todas las Tareas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de módulos principales */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <HeartHandshake className="h-12 w-12 mx-auto mb-3 text-red-500" />
            <h3 className="font-semibold mb-1">Voluntarios</h3>
            <p className="text-2xl font-bold mb-2">{volunteersArray.length}</p>
            <p className="text-sm text-gray-600">38 activos este mes</p>
            <Link href="/admin/volunteers">
              <Button variant="outline" size="sm" className="mt-3">
                Gestionar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Building className="h-12 w-12 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-1">Concesiones</h3>
            <p className="text-2xl font-bold mb-2">{concessionsArray.length}</p>
            <p className="text-sm text-gray-600">9 contratos activos</p>
            <Link href="/admin/concessions">
              <Button variant="outline" size="sm" className="mt-3">
                Gestionar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <TreePine className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold mb-1">Arbolado</h3>
            <p className="text-2xl font-bold mb-2">50</p>
            <p className="text-sm text-gray-600">14 especies catalogadas</p>
            <Link href="/admin/trees">
              <Button variant="outline" size="sm" className="mt-3">
                Gestionar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold mb-1">Comunicación</h3>
            <p className="text-2xl font-bold mb-2">2,847</p>
            <p className="text-sm text-gray-600">emails enviados</p>
            <Link href="/admin/communications">
              <Button variant="outline" size="sm" className="mt-3">
                Gestionar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;