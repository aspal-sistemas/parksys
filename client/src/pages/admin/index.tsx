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
  Plus,
  UserCheck,
  Lock,
  Crown,
  Star,
  Settings as SettingsIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/AdminLayout';
import { RoleBadge, SYSTEM_ROLES } from '@/components/RoleBadge';
import { usePermissions } from '@/components/RoleGuard';
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
  const permissions = usePermissions(); // Sistema de roles integrado
  
  // Consultas de datos reales
  const { data: parksResponse } = useQuery({ queryKey: ['/api/parks'] });
  const { data: activities = [] } = useQuery({ queryKey: ['/api/activities'] });
  const { data: users = [] } = useQuery({ queryKey: ['/api/users'] });
  const { data: employees = [] } = useQuery({ queryKey: ['/api/hr/employees'] });
  const { data: volunteers = [] } = useQuery({ queryKey: ['/api/volunteers'] });
  const { data: concessions = [] } = useQuery({ queryKey: ['/api/active-concessions'] });

  // Seguridad de tipos para arrays - corrigiendo acceso a datos de parques
  const parksArray = Array.isArray(parksResponse) ? parksResponse : [];
  const activitiesArray = Array.isArray(activities) ? activities : [];
  const usersArray = Array.isArray(users) ? users : [];
  const employeesArray = Array.isArray(employees) ? employees : [];
  const volunteersArray = Array.isArray(volunteers) ? volunteers : [];
  const concessionsArray = Array.isArray(concessions) ? concessions : [];

  // Datos para gráficas
  const monthlyData = [
    { name: t('dashboard.months.jan', 'Ene'), parques: 18, actividades: 45, voluntarios: 23 },
    { name: t('dashboard.months.feb', 'Feb'), parques: 19, actividades: 52, voluntarios: 28 },
    { name: t('dashboard.months.mar', 'Mar'), parques: 20, actividades: 48, voluntarios: 31 },
    { name: t('dashboard.months.apr', 'Abr'), parques: 21, actividades: 65, voluntarios: 35 },
    { name: t('dashboard.months.may', 'May'), parques: 22, actividades: 58, voluntarios: 42 },
    { name: t('dashboard.months.jun', 'Jun'), parques: 22, actividades: 71, voluntarios: 38 },
    { name: t('dashboard.months.jul', 'Jul'), parques: parksArray.length, actividades: activitiesArray.length, voluntarios: volunteersArray.length }
  ];

  const moduleUsageData = [
    { name: t('dashboard.modules.parks', 'Parques'), value: 95, color: '#00a587' },
    { name: t('dashboard.modules.hr', 'RH'), value: 88, color: '#067f5f' },
    { name: t('dashboard.modules.finance', 'Finanzas'), value: 92, color: '#bcd256' },
    { name: t('dashboard.modules.activities', 'Actividades'), value: 78, color: '#8498a5' },
    { name: t('dashboard.modules.volunteers', 'Voluntarios'), value: 65, color: '#059669' },
    { name: t('dashboard.modules.concessions', 'Concesiones'), value: 72, color: '#0ea5e9' }
  ];

  const financialData = [
    { name: t('dashboard.months.jan', 'Ene'), ingresos: 125000, egresos: 98000 },
    { name: t('dashboard.months.feb', 'Feb'), ingresos: 132000, egresos: 105000 },
    { name: t('dashboard.months.mar', 'Mar'), ingresos: 145000, egresos: 112000 },
    { name: t('dashboard.months.apr', 'Abr'), ingresos: 158000, egresos: 118000 },
    { name: t('dashboard.months.may', 'May'), ingresos: 162000, egresos: 125000 },
    { name: t('dashboard.months.jun', 'Jun'), ingresos: 175000, egresos: 135000 },
    { name: t('dashboard.months.jul', 'Jul'), ingresos: 182000, egresos: 128000 }
  ];

  const parkTypeData = [
    { name: t('dashboard.parkCategories.urban', 'Urbanos'), value: 8, color: '#00a587' },
    { name: t('dashboard.parkCategories.metropolitan', 'Metropolitanos'), value: 5, color: '#067f5f' },
    { name: t('dashboard.parkCategories.neighborhood', 'Vecinales'), value: 4, color: '#bcd256' },
    { name: t('dashboard.parkCategories.linear', 'Lineales'), value: 3, color: '#8498a5' },
    { name: t('dashboard.parkCategories.natural', 'Naturales'), value: 2, color: '#059669' }
  ];

  // Datos del sistema de roles - INTEGRACIÓN DEL SISTEMA AVANZADO
  const roleStatsData = [
    { role: 'super-admin', users: 2, activity: 95 },
    { role: 'director-general', users: 3, activity: 88 },
    { role: 'coordinador-parques', users: 8, activity: 92 },
    { role: 'coordinador-actividades', users: 6, activity: 85 },
    { role: 'admin-financiero', users: 4, activity: 90 },
    { role: 'operador-parque', users: 15, activity: 78 },
    { role: 'consultor-auditor', users: 5, activity: 65 }
  ];

  const totalActiveUsers = roleStatsData.reduce((sum, role) => sum + role.users, 0);
  const averageActivity = Math.round(roleStatsData.reduce((sum, role) => sum + role.activity, 0) / roleStatsData.length);

  return (
    <AdminLayout 
      title={t('dashboard.title', 'Dashboard Ejecutivo')} 
      subtitle={t('dashboard.subtitle', 'Panel de control integral del sistema ParkSys')}
    >
      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Parques */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {t('dashboard.metrics.totalParks', 'Total de Parques')}
            </CardTitle>
            <MapPin className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{parksArray.length}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">{t('dashboard.metrics.growthThisMonth', '+2 este mes')}</span>
            </div>
            <Progress value={85} className="mt-3" />
            <p className="text-xs text-green-700 mt-1">{t('dashboard.metrics.capacityTarget', '85% de capacidad objetivo')}</p>
          </CardContent>
        </Card>
        
        {/* Personal RH */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              {t('dashboard.metrics.activeStaff', 'Personal Activo')}
            </CardTitle>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{employeesArray.length}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">{t('dashboard.metrics.staffGrowthThisMonth', '+5 este mes')}</span>
            </div>
            <Progress value={92} className="mt-3" />
            <p className="text-xs text-blue-700 mt-1">{t('dashboard.metrics.averageAttendance', '92% asistencia promedio')}</p>
          </CardContent>
        </Card>
        
        {/* Actividades */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              {t('dashboard.metrics.activeActivities', 'Actividades Activas')}
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{activitiesArray.length}</div>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">{t('dashboard.metrics.activitiesThisWeek', '15 esta semana')}</span>
            </div>
            <Progress value={78} className="mt-3" />
            <p className="text-xs text-purple-700 mt-1">{t('dashboard.metrics.averageParticipation', '78% participación promedio')}</p>
          </CardContent>
        </Card>
        
        {/* Finanzas */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              {t('dashboard.metrics.monthlyBalance', 'Balance Mensual')}
            </CardTitle>
            <DollarSign className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">$54K</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-amber-600 mr-1" />
              <span className="text-sm text-amber-600 font-medium">{t('dashboard.metrics.vsLastMonth', '+18% vs mes anterior')}</span>
            </div>
            <Progress value={68} className="mt-3" />
            <p className="text-xs text-amber-700 mt-1">{t('dashboard.metrics.annualBudget', '68% del presupuesto anual')}</p>
          </CardContent>
        </Card>
      </div>



      {/* Gráficas principales */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Tendencias mensuales */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.charts.growthTrends', 'Tendencias de Crecimiento')}</CardTitle>
            <CardDescription>{t('dashboard.charts.growthTrendsDescription', 'Evolución mensual de los principales indicadores')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="parques" stroke="#00a587" strokeWidth={3} name={t('dashboard.modules.parks', 'Parques')} />
                <Line type="monotone" dataKey="actividades" stroke="#8498a5" strokeWidth={3} name={t('dashboard.modules.activities', 'Actividades')} />
                <Line type="monotone" dataKey="voluntarios" stroke="#059669" strokeWidth={3} name={t('dashboard.modules.volunteers', 'Voluntarios')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NUEVA GRÁFICA: Distribución de Roles - SISTEMA AVANZADO INTEGRADO */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribución de Roles</CardTitle>
            <CardDescription>Usuarios asignados por nivel jerárquico del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="role" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={10}
                  tickFormatter={(value) => SYSTEM_ROLES.find(r => r.id === value)?.displayName || value}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => SYSTEM_ROLES.find(r => r.id === value)?.displayName || value}
                  formatter={(value, name) => [value, name === 'users' ? 'Usuarios' : 'Actividad %']}
                />
                <Bar dataKey="users" fill="#6366f1" name="Usuarios" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uso de módulos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.charts.moduleAdoption', 'Adopción de Módulos')}</CardTitle>
            <CardDescription>{t('dashboard.charts.moduleAdoptionDescription', 'Porcentaje de uso activo por módulo del sistema')}</CardDescription>
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
            <CardTitle>{t('dashboard.charts.financialFlow', 'Flujo Financiero')}</CardTitle>
            <CardDescription>{t('dashboard.charts.financialFlowDescription', 'Ingresos vs Egresos (Miles de pesos)')}</CardDescription>
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
                  name={t('dashboard.charts.income', 'Ingresos')}
                />
                <Area 
                  type="monotone" 
                  dataKey="egresos" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name={t('dashboard.charts.expenses', 'Egresos')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de parques */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.charts.parkTypes', 'Tipos de Parques')}</CardTitle>
            <CardDescription>{t('dashboard.charts.parkTypesDescription', 'Distribución por categoría')}</CardDescription>
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

      {/* Sistema de Roles - Información secundaria justo antes de indicadores críticos */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">
              Sistema de Roles
            </CardTitle>
            <Shield className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{SYSTEM_ROLES.length}</div>
            <div className="flex items-center mt-2">
              <UserCheck className="h-4 w-4 text-indigo-600 mr-1" />
              <span className="text-sm text-indigo-600 font-medium">{totalActiveUsers} usuarios</span>
            </div>
            <Progress value={averageActivity} className="mt-3" />
            <p className="text-xs text-indigo-700 mt-1">{averageActivity}% actividad</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800">
              Mi Rol
            </CardTitle>
            <Crown className="h-5 w-5 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <RoleBadge roleId={permissions.userRole} size="sm" />
            </div>
            <div className="text-sm text-rose-700">
              <div className="flex items-center justify-between mb-1">
                <span>Nivel:</span>
                <span className="font-medium">{permissions.roleLevel}/10</span>
              </div>
              <Progress value={permissions.roleLevel * 10} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Permisos
            </CardTitle>
            <Lock className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">7</div>
            <div className="flex items-center mt-2">
              <SettingsIcon className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Módulos</span>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                Admin completo
              </Badge>
            </div>
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
              {t('dashboard.kpis.criticalIndicators', 'Indicadores Críticos')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.pendingMaintenance', 'Mantenimiento Pendiente')}</span>
              <Badge variant="destructive">{t('dashboard.kpis.urgentItems', '3 urgentes')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.availableBudget', 'Presupuesto Disponible')}</span>
              <Badge variant="outline" className="text-amber-600">{t('dashboard.kpis.remainingBudget', '32% restante')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.upcomingEvents', 'Eventos Próximos')}</span>
              <Badge variant="secondary">{t('dashboard.kpis.thisWeekEvents', '8 esta semana')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.expiringContracts', 'Contratos por Vencer')}</span>
              <Badge variant="destructive">{t('dashboard.kpis.thisMonthContracts', '2 este mes')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Estado del sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              {t('dashboard.kpis.systemStatus', 'Estado del Sistema')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.activeUsers24h', 'Usuarios Activos (24h)')}</span>
              <Badge variant="outline" className="text-green-600">{usersArray.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.systemUptime', 'Uptime del Sistema')}</span>
              <Badge variant="outline" className="text-green-600">99.8%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.automaticBackup', 'Backup Automático')}</span>
              <Badge variant="outline" className="text-green-600">{t('dashboard.kpis.updated', 'Actualizado')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dashboard.kpis.security', 'Seguridad')}</span>
              <Badge variant="outline" className="text-green-600">{t('dashboard.kpis.optimal', 'Óptima')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* NUEVA SECCIÓN: Acciones Rápidas Basadas en Roles - SISTEMA AVANZADO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-500" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Acciones disponibles según tu rol: <RoleBadge roleId={permissions.userRole} size="sm" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {permissions.canAdmin('Gestión') && (
              <Link href="/admin/parks/create">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Parque
                </Button>
              </Link>
            )}
            {permissions.canWrite('Marketing') && (
              <Link href="/admin/activities/create">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Actividad
                </Button>
              </Link>
            )}
            {permissions.canAdmin('Seguridad') && (
              <Link href="/admin/roles">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestionar Roles
                </Button>
              </Link>
            )}
            {permissions.canWrite('Finanzas') && (
              <Link href="/admin/finance">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Revisar Finanzas
                </Button>
              </Link>
            )}
            {permissions.canRead('RH') && (
              <Link href="/admin/hr">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Recursos Humanos
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen de módulos principales */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <HeartHandshake className="h-12 w-12 mx-auto mb-3 text-red-500" />
            <h3 className="font-semibold mb-1">{t('dashboard.moduleSummary.volunteers', 'Voluntarios')}</h3>
            <p className="text-2xl font-bold mb-2">{volunteersArray.length}</p>
            <p className="text-sm text-gray-600">{t('dashboard.moduleSummary.activeThisMonth', '38 activos este mes')}</p>
            <Link href="/admin/volunteers">
              <Button variant="outline" size="sm" className="mt-3">
                {t('dashboard.moduleSummary.manage', 'Gestionar')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Building className="h-12 w-12 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-1">{t('dashboard.moduleSummary.concessions', 'Concesiones')}</h3>
            <p className="text-2xl font-bold mb-2">{concessionsArray.length}</p>
            <p className="text-sm text-gray-600">{t('dashboard.moduleSummary.activeContracts', '9 contratos activos')}</p>
            <Link href="/admin/concessions">
              <Button variant="outline" size="sm" className="mt-3">
                {t('dashboard.moduleSummary.manage', 'Gestionar')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <TreePine className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold mb-1">{t('dashboard.moduleSummary.forestry', 'Arbolado')}</h3>
            <p className="text-2xl font-bold mb-2">50</p>
            <p className="text-sm text-gray-600">{t('dashboard.moduleSummary.catalogedSpecies', '14 especies catalogadas')}</p>
            <Link href="/admin/trees">
              <Button variant="outline" size="sm" className="mt-3">
                {t('dashboard.moduleSummary.manage', 'Gestionar')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold mb-1">{t('dashboard.moduleSummary.communication', 'Comunicación')}</h3>
            <p className="text-2xl font-bold mb-2">2,847</p>
            <p className="text-sm text-gray-600">{t('dashboard.moduleSummary.emailsSent', 'emails enviados')}</p>
            <Link href="/admin/communications">
              <Button variant="outline" size="sm" className="mt-3">
                {t('dashboard.moduleSummary.manage', 'Gestionar')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;