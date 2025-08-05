import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge, RoleBadgeWithText, SYSTEM_ROLES } from '@/components/RoleBadge';
import { usePermissions } from '@/components/RoleGuard';
import { Link } from 'wouter';
import { 
  Shield, Users, Settings, Search, Plus, Edit, Trash2, Crown, Star, 
  Filter, BarChart, Activity, Eye, UserCog, Grid, CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Datos simulados de usuarios por rol
const ROLE_USAGE_DATA = [
  { roleId: 'super-admin', userCount: 2, activeUsers: 2, lastActivity: '2 horas' },
  { roleId: 'director-general', userCount: 3, activeUsers: 3, lastActivity: '1 hora' },
  { roleId: 'coordinador-parques', userCount: 8, activeUsers: 7, lastActivity: '30 min' },
  { roleId: 'coordinador-actividades', userCount: 6, activeUsers: 5, lastActivity: '15 min' },
  { roleId: 'admin-financiero', userCount: 4, activeUsers: 4, lastActivity: '45 min' },
  { roleId: 'operador-parque', userCount: 15, activeUsers: 12, lastActivity: '5 min' },
  { roleId: 'consultor-auditor', userCount: 5, activeUsers: 2, lastActivity: '2 días' }
];

const RolesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const permissions = usePermissions();
  
  const filteredRoles = SYSTEM_ROLES.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = ROLE_USAGE_DATA.reduce((sum, role) => sum + role.userCount, 0);
  const totalActiveUsers = ROLE_USAGE_DATA.reduce((sum, role) => sum + role.activeUsers, 0);
  const activityRate = Math.round((totalActiveUsers / totalUsers) * 100);

  return (
    <AdminLayout title="Gestión de Roles" subtitle="Sistema avanzado de roles y jerarquías">
      {/* Métricas principales del sistema de roles */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Total de Roles
            </CardTitle>
            <Shield className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{SYSTEM_ROLES.length}</div>
            <p className="text-xs text-purple-700 mt-1">7 roles jerárquicos activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Usuarios Totales
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalUsers}</div>
            <p className="text-xs text-blue-700 mt-1">Asignados a roles activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Actividad
            </CardTitle>
            <Activity className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{activityRate}%</div>
            <Progress value={activityRate} className="mt-2" />
            <p className="text-xs text-green-700 mt-1">{totalActiveUsers} usuarios activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Mi Nivel
            </CardTitle>
            <Crown className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{permissions.roleLevel}</div>
            <div className="mt-2">
              <RoleBadge roleId={permissions.userRole} size="sm" />
            </div>
            <p className="text-xs text-orange-700 mt-1">Nivel jerárquico actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas y acciones */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/permissions/matrix">
            <Button variant="outline">
              <Grid className="h-4 w-4 mr-2" />
              Matriz de Permisos
            </Button>
          </Link>
          <Link href="/admin/role-assignments">
            <Button variant="outline">
              <UserCog className="h-4 w-4 mr-2" />
              Asignar Usuarios
            </Button>
          </Link>
          {permissions.canAdmin('Seguridad') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de roles jerárquicos */}
      <Card>
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
          <CardDescription>
            Gestión de los 7 roles jerárquicos con permisos granulares por módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Activos</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => {
                const usage = ROLE_USAGE_DATA.find(u => u.roleId === role.id);
                const activityPercent = usage ? Math.round((usage.activeUsers / usage.userCount) * 100) : 0;
                
                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <RoleBadgeWithText roleId={role.id} />
                        <div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        L{role.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{usage?.userCount || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{usage?.activeUsers || 0}</span>
                        <Progress value={activityPercent} className="w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{usage?.lastActivity || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Detalles del Rol</DialogTitle>
                              <DialogDescription>
                                Información completa del rol {role.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Rol</Label>
                                <div className="mt-1">
                                  <RoleBadge roleId={role.id} showIcon={true} />
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Descripción</Label>
                                <p className="text-sm text-gray-600">{role.description}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Nivel Jerárquico</Label>
                                <p className="text-sm text-gray-600">Nivel {role.level} de 7</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Usuarios Asignados</Label>
                                <p className="text-sm text-gray-600">{usage?.userCount || 0} usuarios totales</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Usuarios Activos</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-gray-600">{usage?.activeUsers || 0} usuarios</span>
                                  <Progress value={activityPercent} className="w-24" />
                                  <span className="text-xs text-gray-500">{activityPercent}%</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Última Actividad</Label>
                                <p className="text-sm text-gray-600">{usage?.lastActivity || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Estado</Label>
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-green-600 border-green-300">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Activo
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {permissions.canWrite('Seguridad') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Editar Rol</DialogTitle>
                                <DialogDescription>
                                  Modifica las propiedades del rol {role.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Descripción</Label>
                                  <Input defaultValue={role.description} />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Estado</Label>
                                  <Select defaultValue="active">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Activo</SelectItem>
                                      <SelectItem value="inactive">Inactivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Configuración Avanzada</Label>
                                  <p className="text-xs text-gray-500 mb-2">Los niveles jerárquicos no se pueden modificar</p>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-sm">
                                      <span className="font-medium">Nivel:</span> {role.level}/7<br />
                                      <span className="font-medium">ID:</span> {role.id}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline">
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => {
                                    toast({
                                      title: "Rol actualizado",
                                      description: "Los cambios se han guardado exitosamente",
                                    });
                                  }}>
                                    Guardar Cambios
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Estadísticas del Rol</DialogTitle>
                              <DialogDescription>
                                Métricas y análisis de uso del rol {role.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{usage?.userCount || 0}</div>
                                    <p className="text-xs text-muted-foreground">Usuarios Totales</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{usage?.activeUsers || 0}</div>
                                    <p className="text-xs text-muted-foreground">Usuarios Activos</p>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Tasa de Actividad</Label>
                                <div className="mt-2">
                                  <Progress value={activityPercent} className="w-full" />
                                  <p className="text-xs text-gray-500 mt-1">{activityPercent}% de usuarios activos</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Última Actividad</Label>
                                <p className="text-sm text-gray-600">{usage?.lastActivity || 'Sin actividad reciente'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Nivel de Acceso</Label>
                                <div className="mt-1">
                                  <Badge variant="outline" className="font-mono">
                                    Nivel {role.level} - {role.level <= 2 ? 'Alto' : role.level <= 4 ? 'Medio' : 'Básico'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid className="h-5 w-5 mr-2 text-purple-500" />
              Matriz de Permisos
            </CardTitle>
            <CardDescription>
              Configura permisos granulares por módulo y rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/permissions/matrix">
              <Button className="w-full">
                Abrir Matriz
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="h-5 w-5 mr-2 text-blue-500" />
              Asignación de Usuarios
            </CardTitle>
            <CardDescription>
              Gestiona asignaciones masivas de roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/role-assignments">
              <Button className="w-full">
                Gestionar Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Auditoría de Roles
            </CardTitle>
            <CardDescription>
              Revisa logs de actividad y cambios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/role-audits">
              <Button className="w-full">
                Ver Auditoría
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesManagement;