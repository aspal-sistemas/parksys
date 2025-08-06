import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Crown, 
  Shield, 
  UserCheck, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SYSTEM_ROLES } from '@/components/RoleBadge';

interface RoleStats {
  roleId: string;
  userCount: number;
  activeUsers: number;
}

export default function RolesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Datos simulados de estadísticas de roles
  const roleStats: RoleStats[] = [
    { roleId: '1', userCount: 2, activeUsers: 2 },
    { roleId: '2', userCount: 3, activeUsers: 3 },
    { roleId: '3', userCount: 8, activeUsers: 7 },
    { roleId: '4', userCount: 5, activeUsers: 4 },
    { roleId: '5', userCount: 3, activeUsers: 3 },
    { roleId: '6', userCount: 15, activeUsers: 12 },
    { roleId: '7', userCount: 2, activeUsers: 1 },
  ];

  // Filtrar roles
  const filteredRoles = SYSTEM_ROLES.filter(role => 
    searchTerm === '' || role.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStats = (roleId: string) => {
    return roleStats.find(stats => stats.roleId === roleId) || { userCount: 0, activeUsers: 0 };
  };

  const getRoleColor = (level: number) => {
    if (level <= 2) return 'border-red-200 bg-red-50';
    if (level <= 4) return 'border-orange-200 bg-orange-50';
    return 'border-green-200 bg-green-50';
  };

  const getRoleDescription = (roleId: string) => {
    const descriptions: Record<string, string> = {
      '1': 'Control total del sistema. Acceso a todas las funcionalidades y configuraciones críticas.',
      '2': 'Supervisión ejecutiva con acceso a reportes estratégicos y decisiones de alto nivel.',
      '3': 'Gestión operativa de parques, mantenimiento y coordinación de equipos de campo.',
      '4': 'Planificación y gestión de actividades recreativas, eventos y programas comunitarios.',
      '5': 'Administración financiera, presupuestos, contabilidad y reportes fiscales.',
      '6': 'Operación diaria de parques específicos, mantenimiento básico y atención ciudadana.',
      '7': 'Acceso de solo lectura para auditorías, consultoría y análisis de datos.'
    };
    return descriptions[roleId] || 'Descripción no disponible';
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Permisos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Administrativos</p>
                <p className="text-2xl font-bold">
                  {roleStats.filter(r => {
                    const role = SYSTEM_ROLES.find(role => role.id === r.roleId);
                    return (role?.level || 0) <= 2;
                  }).reduce((acc, r) => acc + r.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Coordinadores</p>
                <p className="text-2xl font-bold">
                  {roleStats.filter(r => {
                    const role = SYSTEM_ROLES.find(role => role.id === r.roleId);
                    const level = role?.level || 0;
                    return level > 2 && level <= 4;
                  }).reduce((acc, r) => acc + r.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Operativos</p>
                <p className="text-2xl font-bold">
                  {roleStats.filter(r => {
                    const role = SYSTEM_ROLES.find(role => role.id === r.roleId);
                    return (role?.level || 0) > 4;
                  }).reduce((acc, r) => acc + r.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoles.map((role) => {
          const stats = getRoleStats(role.id);
          const RoleIcon = role.icon;
          
          return (
            <Card key={role.id} className={`${getRoleColor(role.level)} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${
                      role.level <= 2 ? 'bg-red-100' :
                      role.level <= 4 ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      <RoleIcon className={`h-6 w-6 ${
                        role.level <= 2 ? 'text-red-700' :
                        role.level <= 4 ? 'text-orange-700' : 'text-green-700'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.displayName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Nivel {role.level}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            stats.userCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {stats.userCount} usuarios
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">
                  {getRoleDescription(role.id)}
                </CardDescription>
                
                {/* Estadísticas del rol */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-lg font-bold">{stats.userCount}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Total usuarios</span>
                  </div>
                  
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold">{stats.activeUsers}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Activos</span>
                  </div>
                </div>
                
                {/* Indicadores de capacidades */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Acceso administrativo</span>
                    {role.level <= 2 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Gestión de usuarios</span>
                    {role.level <= 3 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Operación de campo</span>
                    {role.level >= 4 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Sistema Jerárquico de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-900 mb-2">Nivel Administrativo (1-2)</h3>
                <p className="text-sm text-red-700">
                  Control total del sistema con acceso a configuraciones críticas y gestión de seguridad.
                </p>
              </div>
              
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <h3 className="font-medium text-orange-900 mb-2">Nivel Coordinación (3-4)</h3>
                <p className="text-sm text-orange-700">
                  Supervisión operativa con acceso a gestión de equipos y planificación estratégica.
                </p>
              </div>
              
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h3 className="font-medium text-green-900 mb-2">Nivel Operativo (5-7)</h3>
                <p className="text-sm text-green-700">
                  Ejecución de tareas específicas con acceso limitado a funciones operativas diarias.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Jerarquía de Permisos</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Los roles de nivel superior heredan automáticamente los permisos de los niveles inferiores, 
                    garantizando una estructura de seguridad consistente y escalable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}