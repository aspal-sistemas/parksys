import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RoleBadge, SYSTEM_ROLES } from '@/components/RoleBadge';
import { usePermissions } from '@/components/RoleGuard';
import { Link } from 'wouter';
import { 
  UserCog, Users, Search, Filter, Plus, Edit, Shield, Star, 
  CheckCircle, XCircle, Clock, ArrowUpDown, Download, Upload,
  UserPlus, UserMinus, RotateCcw, Activity, Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Datos simulados de usuarios del sistema
const MOCK_USERS = [
  { id: 1, name: 'Ana García Ruiz', email: 'ana.garcia@guadalajara.gob.mx', currentRole: 'director-general', department: 'Dirección General', status: 'active', lastLogin: '2 horas' },
  { id: 2, name: 'Carlos Mendoza Torres', email: 'carlos.mendoza@guadalajara.gob.mx', currentRole: 'coordinador-parques', department: 'Parques y Jardines', status: 'active', lastLogin: '15 min' },
  { id: 3, name: 'María Elena Vázquez', email: 'maria.vazquez@guadalajara.gob.mx', currentRole: 'coordinador-actividades', department: 'Actividades Recreativas', status: 'active', lastLogin: '30 min' },
  { id: 4, name: 'Roberto Silva Jiménez', email: 'roberto.silva@guadalajara.gob.mx', currentRole: 'admin-financiero', department: 'Administración', status: 'active', lastLogin: '1 hora' },
  { id: 5, name: 'Laura Fernández Morales', email: 'laura.fernandez@guadalajara.gob.mx', currentRole: 'operador-parque', department: 'Operaciones', status: 'active', lastLogin: '5 min' },
  { id: 6, name: 'Diego Ramírez Castro', email: 'diego.ramirez@guadalajara.gob.mx', currentRole: 'operador-parque', department: 'Operaciones', status: 'inactive', lastLogin: '3 días' },
  { id: 7, name: 'Patricia López Herrera', email: 'patricia.lopez@guadalajara.gob.mx', currentRole: 'consultor-auditor', department: 'Auditoría', status: 'active', lastLogin: '2 días' },
  { id: 8, name: 'Fernando González Medina', email: 'fernando.gonzalez@guadalajara.gob.mx', currentRole: 'coordinador-parques', department: 'Parques y Jardines', status: 'active', lastLogin: '45 min' }
];

const RoleAssignments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const permissions = usePermissions();

  const filteredUsers = MOCK_USERS.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'all' || user.currentRole === selectedRole)
  );

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkRoleAssignment = () => {
    if (!permissions.canAdmin('Seguridad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para asignar roles",
        variant: "destructive"
      });
      return;
    }

    if (selectedUsers.length === 0 || !selectedNewRole) {
      toast({
        title: "Selección incompleta",
        description: "Selecciona usuarios y un rol a asignar",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Roles asignados",
      description: `Se asignó el rol a ${selectedUsers.length} usuarios`,
    });
    
    setSelectedUsers([]);
    setSelectedNewRole('');
  };

  const handleSingleRoleChange = (userId: number, newRole: string) => {
    if (!permissions.canWrite('Seguridad')) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para modificar roles",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Rol actualizado",
      description: `Rol cambiado exitosamente`,
    });
  };

  const roleStats = SYSTEM_ROLES.map(role => ({
    ...role,
    userCount: MOCK_USERS.filter(u => u.currentRole === role.id).length,
    activeCount: MOCK_USERS.filter(u => u.currentRole === role.id && u.status === 'active').length
  }));

  return (
    <AdminLayout title="Asignación de Usuarios" subtitle="Gestión masiva de roles y permisos de usuario">
      {/* Estadísticas rápidas por rol */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {roleStats.filter(role => role.userCount > 0).slice(0, 4).map((role) => (
          <Card key={role.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <RoleBadge roleId={role.id} size="sm" />
                <Badge variant="outline">{role.userCount}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{role.activeCount}</div>
              <p className="text-xs text-blue-700">usuarios activos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Herramientas de asignación masiva */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            Asignación Masiva de Roles
          </CardTitle>
          <CardDescription>
            Selecciona usuarios y asigna roles de forma masiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nuevo rol para usuarios seleccionados ({selectedUsers.length})
              </label>
              <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol a asignar" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_ROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <RoleBadge roleId={role.id} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleBulkRoleAssignment}
                disabled={selectedUsers.length === 0 || !selectedNewRole || !permissions.canAdmin('Seguridad')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Roles
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedUsers([])}
                disabled={selectedUsers.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {SYSTEM_ROLES.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <RoleBadge roleId={role.id} size="sm" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/admin/roles">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Gestión de Roles
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Gestiona asignaciones individuales y masivas de roles de usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol Actual</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Conexión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge roleId={user.currentRole} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.department}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{user.lastLogin}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Detalles del Usuario</DialogTitle>
                            <DialogDescription>
                              Información completa del perfil del usuario
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Nombre Completo</Label>
                              <p className="text-sm text-gray-600">{user.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Correo Electrónico</Label>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Rol Actual</Label>
                              <div className="mt-1">
                                <RoleBadge roleId={user.currentRole} />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Departamento</Label>
                              <p className="text-sm text-gray-600">{user.department}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Estado</Label>
                              <div className="mt-1">
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Última Conexión</Label>
                              <p className="text-sm text-gray-600">{user.lastLogin}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                            <DialogDescription>
                              Modifica la información del usuario y sus asignaciones
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Rol</Label>
                              <Select defaultValue={user.currentRole}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SYSTEM_ROLES.map(role => (
                                    <SelectItem key={role.id} value={role.id}>
                                      <div className="flex items-center gap-2">
                                        <RoleBadge roleId={role.id} size="sm" showText={false} />
                                        {role.displayName}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Departamento</Label>
                              <Select defaultValue={user.department}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Dirección General">Dirección General</SelectItem>
                                  <SelectItem value="Parques y Jardines">Parques y Jardines</SelectItem>
                                  <SelectItem value="Actividades Recreativas">Actividades Recreativas</SelectItem>
                                  <SelectItem value="Administración">Administración</SelectItem>
                                  <SelectItem value="Operaciones">Operaciones</SelectItem>
                                  <SelectItem value="Auditoría">Auditoría</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Estado</Label>
                              <Select defaultValue={user.status}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Activo</SelectItem>
                                  <SelectItem value="inactive">Inactivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline">
                                Cancelar
                              </Button>
                              <Button onClick={() => {
                                toast({
                                  title: "Usuario actualizado",
                                  description: "Los cambios se han guardado exitosamente",
                                });
                              }}>
                                Guardar Cambios
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Información de selección */}
      {selectedUsers.length > 0 && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedUsers.length} usuarios seleccionados
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setSelectedUsers([])}>
                  Limpiar selección
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleBulkRoleAssignment}
                  disabled={!selectedNewRole}
                >
                  Asignar rol seleccionado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default RoleAssignments;