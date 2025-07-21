import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit, Trash2, Loader, Phone, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// Interfaces simplificadas
interface UserData {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  password?: string;
  role: string;
  phone?: string;
  gender?: 'masculino' | 'femenino' | 'no_especificar';
  birthDate?: string;
  bio?: string;
  profileImageUrl?: string;
  municipalityId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  phone?: string;
  gender?: 'masculino' | 'femenino' | 'no_especificar';
  birthDate?: string;
  bio?: string;
  municipalityId?: number | null;
}

// Formulario simplificado para todos los roles - UNIFORME
const UserFormDialog: React.FC<{
  user: UserData | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  isSaving: boolean;
}> = ({ user, isNew, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState<UserFormData>({
    role: user?.role || 'user',
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || '',
    password: '',
    phone: user?.phone || '',
    gender: user?.gender || 'no_especificar',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
    municipalityId: user?.municipalityId || null,
  });

  const handleChange = (field: keyof UserFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Error de validación",
        description: "Los campos básicos son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (isNew && !formData.password) {
      toast({
        title: "Error de validación", 
        description: "La contraseña es obligatoria para nuevos usuarios.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="user-form-description">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
        </DialogHeader>
        <div id="user-form-description" className="sr-only">
          Formulario simplificado para {isNew ? 'crear un nuevo usuario' : 'editar información del usuario'}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos básicos - IGUALES PARA TODOS LOS ROLES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium">Nombre *</label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium">Apellido *</label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Apellido"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">Usuario *</label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Nombre de usuario"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="text-sm font-medium">Rol *</label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="voluntario">Voluntario</SelectItem>
                  <SelectItem value="ciudadano">Ciudadano</SelectItem>
                  <SelectItem value="guardaparques">Guardaparques</SelectItem>
                  <SelectItem value="guardia">Guardia</SelectItem>
                  <SelectItem value="concesionario">Concesionario</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email *</label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              {isNew ? 'Contraseña *' : 'Nueva contraseña (opcional)'}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isNew ? "Contraseña" : "Dejar vacío para no cambiar"}
              required={isNew}
            />
          </div>
          
          {/* Campos opcionales - IGUALES PARA TODOS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Número telefónico"
              />
            </div>
            <div>
              <label htmlFor="birthDate" className="text-sm font-medium">Fecha de nacimiento</label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="text-sm font-medium">Género</label>
            <Select value={formData.gender} onValueChange={(value: any) => handleChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="no_especificar">Prefiero no especificar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="bio" className="text-sm font-medium">Biografía</label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Breve descripción personal"
              rows={3}
            />
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

// Componente principal simplificado
const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  // Fetch users
  const {
    data: users = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }
  });

  // Create or update user mutation
  const saveUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const isUpdate = !!selectedUser;
      const url = isUpdate ? `/api/users/${selectedUser?.id}` : '/api/users';
      const method = isUpdate ? 'PUT' : 'POST';

      if (isUpdate && !userData.password) {
        const { password, ...dataWithoutPassword } = userData;
        userData = dataWithoutPassword as UserFormData;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar usuario');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSelectedUser(null);
      setIsNewUser(false);
      toast({
        title: "Usuario guardado",
        description: selectedUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter users
  const filteredUsers = users.filter((user: UserData) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsNewUser(true);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsNewUser(false);
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id!);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600">
        Error al cargar usuarios
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleNewUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: UserData) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
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
                        onClick={() => handleDeleteUser(user)}
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
      </div>

      {/* User Form Dialog */}
      {(selectedUser || isNewUser) && (
        <UserFormDialog
          user={selectedUser}
          isNew={isNewUser}
          onClose={() => {
            setSelectedUser(null);
            setIsNewUser(false);
          }}
          onSave={(userData) => saveUserMutation.mutate(userData)}
          isSaving={saveUserMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent aria-describedby="delete-confirmation-description">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <div id="delete-confirmation-description" className="py-4">
              <p>¿Estás seguro de que deseas eliminar al usuario {userToDelete?.fullName || userToDelete?.username}?</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
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
};

export default AdminUsers;