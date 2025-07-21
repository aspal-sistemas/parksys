import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  UserRound, 
  Calendar, 
  Loader, 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

// Tipos simplificados
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  municipalityId: number | null;
  phone?: string;
  gender?: 'masculino' | 'femenino' | 'no_especificar';
  birthDate?: string;
  profileImageUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  municipalityId: number | null;
  phone?: string;
  profileImageUrl?: string;
  profileImageFile?: File | null;
  bio?: string;
  gender?: 'masculino' | 'femenino' | 'no_especificar';
  birthDate?: string;
}

// Componente principal del formulario simplificado
const UserFormDialog: React.FC<{
  user?: User | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  isSaving: boolean;
}> = ({ user, isNew, onClose, onSave, isSaving }) => {
  const [userData, setUserData] = useState<UserFormData>({
    role: user?.role || 'user',
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || '',
    password: '',
    municipalityId: user?.municipalityId || null,
    phone: user?.phone || '',
    gender: user?.gender || 'no_especificar',
    birthDate: user?.birthDate || '',
    profileImageUrl: user?.profileImageUrl || '',
    profileImageFile: null,
    bio: user?.bio || '',
  });

  const handleChange = (field: keyof UserFormData, value: string | number | null | boolean | File) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        handleChange('profileImageUrl', imageUrl);
        handleChange('profileImageFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Crear nuevo usuario' : `Editar usuario: ${user?.username}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la cuenta */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Información de la cuenta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Rol del usuario *</label>
                <Select
                  value={userData.role}
                  onValueChange={(value) => handleChange('role', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="guardaparques">Guardaparques</SelectItem>
                    <SelectItem value="guardia">Guardia</SelectItem>
                    <SelectItem value="voluntario">Voluntario</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="concesionario">Concesionario</SelectItem>
                    <SelectItem value="ciudadano">Ciudadano</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Nombre de usuario *</label>
                <Input
                  id="username"
                  value={userData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="nombre_usuario"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">Nombre *</label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Nombre"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Apellidos *</label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Apellidos"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Correo electrónico *</label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            {isNew && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Contraseña *</label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            )}
          </div>

          {/* Información del perfil */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Información del perfil</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Foto de perfil */}
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium">Foto de perfil</label>
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    {userData.profileImageUrl ? (
                      <div className="relative">
                        <img 
                          src={userData.profileImageUrl} 
                          alt="Vista previa" 
                          className="w-32 h-32 rounded-full object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                          onClick={() => {
                            handleChange('profileImageUrl', '');
                            handleChange('profileImageFile', null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserRound className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="imageUpload"
                    className="cursor-pointer py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm text-center"
                  >
                    Subir imagen
                    <input 
                      id="imageUpload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Formatos: JPG, PNG. Máx: 5MB
                  </p>
                </div>
              </div>
              
              {/* Información de contacto */}
              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Ej: 555-123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium">Género</label>
                    <Select
                      value={userData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="no_especificar">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-medium">Fecha de nacimiento</label>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      type="date"
                      value={userData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className="w-full"
                    />
                    <Calendar className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Biografía</label>
                  <Textarea
                    id="bio"
                    value={userData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Breve descripción personal"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? 'Crear usuario' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function UsersSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados locales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Estados de filtrado
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Query para obtener usuarios
  const { 
    data: users = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 30000, // 30 segundos
  });

  // Mutación para crear/actualizar usuario
  const saveUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar el usuario');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: isNewUser ? 'Usuario creado' : 'Usuario actualizado',
        description: `El usuario ha sido ${isNewUser ? 'creado' : 'actualizado'} exitosamente`,
      });
      handleCloseUserDialog();
    },
    onError: (error) => {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: `No se pudo ${isNewUser ? 'crear' : 'actualizar'} el usuario. Inténtalo de nuevo.`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el usuario');
      }
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente',
      });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      setShowDeleteConfirm(false);
    },
  });

  // Handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsNewUser(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsNewUser(false);
  };

  const handleCloseUserDialog = () => {
    setSelectedUser(null);
    setIsNewUser(false);
  };

  const handleSaveUser = (userData: UserFormData) => {
    saveUserMutation.mutate(userData);
  };

  const handleConfirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter((user: User) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
      user.role.toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Paginación
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error al cargar usuarios</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra las cuentas de usuario del sistema
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, usuario, email o rol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="guardaparques">Guardaparques</SelectItem>
              <SelectItem value="guardia">Guardia</SelectItem>
              <SelectItem value="voluntario">Voluntario</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="concesionario">Concesionario</SelectItem>
              <SelectItem value="ciudadano">Ciudadano</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profileImageUrl}
                            alt={user.fullName || user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserRound className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || 'No especificado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelete(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalUsers)} de {totalUsers} usuarios
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diálogos */}
      {(selectedUser || isNewUser) && (
        <UserFormDialog
          user={selectedUser}
          isNew={isNewUser}
          onClose={handleCloseUserDialog}
          onSave={handleSaveUser}
          isSaving={saveUserMutation.isPending}
        />
      )}

      {showDeleteConfirm && userToDelete && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <strong>{userToDelete.fullName || userToDelete.username}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}