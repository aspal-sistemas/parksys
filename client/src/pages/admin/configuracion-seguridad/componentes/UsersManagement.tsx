import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  UserRound, 
  Search,
  Plus, 
  Edit, 
  Trash2, 
  Loader,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Users,
  ArrowUpDown,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import UserProfileImage from '@/components/UserProfileImage';
import { RoleBadge, SYSTEM_ROLES } from '@/components/RoleBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  roleLevel: number;
  department: string | null;
  position: string | null;
  phone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  profileImageUrl?: string;
}

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Datos del formulario para nuevo usuario
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  // Obtener usuarios
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.roleName === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Mutación para crear usuario
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Error al crear usuario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowCreateUser(false);
      setNewUserData({
        username: '',
        email: '',
        fullName: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
      toast({
        title: "Usuario creado",
        description: "El nuevo usuario se ha creado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  });

  // Mutación para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar usuario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowEditUser(false);
      setEditingUser(null);
      toast({
        title: "Usuario actualizado",
        description: "La información del usuario se ha actualizado",
      });
    }
  });

  // Mutación para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar usuario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema",
      });
    }
  });

  const handleCreateUser = () => {
    if (newUserData.password !== newUserData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      username: newUserData.username,
      email: newUserData.email,
      fullName: newUserData.fullName,
      role: newUserData.role,
      password: newUserData.password
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        username: editingUser.username,
        email: editingUser.email,
        fullName: editingUser.fullName,
        role: editingUser.roleName,
        isActive: editingUser.isActive
      }
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const getStatusColor = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!lastLogin) return 'bg-yellow-100 text-yellow-800';
    
    const daysSinceLogin = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLogin > 30) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) return 'Inactivo';
    if (!lastLogin) return 'Sin conexión';
    
    const daysSinceLogin = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLogin > 30) return 'Inactivo';
    if (daysSinceLogin > 7) return 'Poco activo';
    return 'Activo';
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.roleLevel <= 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Nuevos (7 días)</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => 
                    (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {SYSTEM_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
              
              {selectedUsers.length > 0 && (
                <Button variant="outline" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar ({selectedUsers.length})
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
            {selectedUsers.length > 0 && (
              <span>{selectedUsers.length} usuarios seleccionados</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p>Cargando usuarios...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron usuarios
                      </h3>
                      <p className="text-gray-500">
                        Ajusta los filtros o crea un nuevo usuario.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <UserProfileImage 
                              userId={user.id} 
                              name={user.fullName || user.username}
                              role={user.roleName}
                              size="sm" 
                            />
                          ) : (
                            <UserAvatar 
                              userId={user.id}
                              name={user.fullName || user.username}
                              role={user.roleName}
                              size="sm" 
                            />
                          )}
                          <div>
                            <p className="font-medium">{user.fullName || user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.department && (
                            <p className="text-xs text-gray-500">{user.department}</p>
                          )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <RoleBadge roleId={user.roleId?.toString() || '1'} />
                          {user.position && (
                            <p className="text-xs text-gray-500 mt-1">{user.position}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.isActive, user.lastLogin)}>
                          {getStatusText(user.isActive, user.lastLogin)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          format(parseISO(user.lastLogin), 'dd/MM/yyyy', { locale: es })
                        ) : (
                          <span className="text-muted-foreground">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear usuario */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre completo</label>
                <Input
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Usuario</label>
                <Input
                  value={newUserData.username}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="jperez"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juan.perez@ejemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select 
                  value={newUserData.role} 
                  onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar contraseña</label>
                <Input
                  type="password"
                  value={newUserData.confirmPassword}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar usuario */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo</label>
                  <Input
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, fullName: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario</label>
                  <Input
                    value={editingUser.username}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, username: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select 
                    value={editingUser.roleName} 
                    onValueChange={(value) => setEditingUser(prev => prev ? ({ ...prev, roleName: value }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Usuario activo</label>
                  <Checkbox 
                    checked={editingUser.isActive}
                    onCheckedChange={(checked) => 
                      setEditingUser(prev => prev ? ({ ...prev, isActive: checked as boolean }) : null)
                    }
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}