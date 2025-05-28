import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  User, 
  Clock, 
  LogIn, 
  LogOut,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download
} from "lucide-react";

export default function UserActivity() {
  const activityData = [
    {
      id: 1,
      user: "Ana García",
      role: "Director",
      action: "Creó nuevo parque",
      details: "Parque Central Norte",
      timestamp: "2025-05-27 14:30:25",
      type: "create",
      ip: "192.168.1.100"
    },
    {
      id: 2,
      user: "Carlos Ruiz",
      role: "Manager",
      action: "Actualizó información de usuario",
      details: "Usuario: María López",
      timestamp: "2025-05-27 14:15:10",
      type: "update",
      ip: "192.168.1.101"
    },
    {
      id: 3,
      user: "María López",
      role: "Instructor",
      action: "Inició sesión",
      details: "Dashboard principal",
      timestamp: "2025-05-27 13:45:00",
      type: "login",
      ip: "192.168.1.102"
    },
    {
      id: 4,
      user: "José Martínez",
      role: "Supervisor",
      action: "Eliminó actividad",
      details: "Actividad: Yoga matutino",
      timestamp: "2025-05-27 12:20:35",
      type: "delete",
      ip: "192.168.1.103"
    },
    {
      id: 5,
      user: "Laura Fernández",
      role: "Ciudadano",
      action: "Registró nueva actividad",
      details: "Taller de jardinería",
      timestamp: "2025-05-27 11:30:15",
      type: "create",
      ip: "192.168.1.104"
    },
    {
      id: 6,
      user: "Ana García",
      role: "Director",
      action: "Cerró sesión",
      details: "Sesión finalizada",
      timestamp: "2025-05-27 10:45:20",
      type: "logout",
      ip: "192.168.1.100"
    }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-red-600" />;
      case 'create':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-orange-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'view':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'login':
        return <Badge variant="default" className="bg-green-500">Inicio Sesión</Badge>;
      case 'logout':
        return <Badge variant="destructive">Cierre Sesión</Badge>;
      case 'create':
        return <Badge variant="default" className="bg-blue-500">Creación</Badge>;
      case 'update':
        return <Badge variant="default" className="bg-orange-500">Actualización</Badge>;
      case 'delete':
        return <Badge variant="destructive">Eliminación</Badge>;
      case 'view':
        return <Badge variant="secondary">Visualización</Badge>;
      default:
        return <Badge variant="outline">Actividad</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Director':
        return <Badge variant="default" className="bg-purple-500">Director</Badge>;
      case 'Manager':
        return <Badge variant="default" className="bg-blue-500">Manager</Badge>;
      case 'Instructor':
        return <Badge variant="default" className="bg-green-500">Instructor</Badge>;
      case 'Supervisor':
        return <Badge variant="default" className="bg-orange-500">Supervisor</Badge>;
      case 'Ciudadano':
        return <Badge variant="secondary">Ciudadano</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actividad de Usuarios</h1>
          <p className="text-muted-foreground">
            Monitorea las acciones realizadas por los usuarios en el sistema
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Activity className="w-4 h-4 mr-2" />
          {activityData.length} registros
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar usuario</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Nombre del usuario..." 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de acción</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="login">Inicio de sesión</SelectItem>
                  <SelectItem value="logout">Cierre de sesión</SelectItem>
                  <SelectItem value="create">Creación</SelectItem>
                  <SelectItem value="update">Actualización</SelectItem>
                  <SelectItem value="delete">Eliminación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="ciudadano">Ciudadano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Últimas 24 horas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos Hoy</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sesiones Activas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <LogIn className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acciones Hoy</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">2.5h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Actividades */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
          <CardDescription>
            Últimas acciones realizadas por los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getActionIcon(activity.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{activity.user}</span>
                      {getRoleBadge(activity.role)}
                      {getActionBadge(activity.type)}
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </div>
                  <div className="text-xs">
                    IP: {activity.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}