import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit, Trash2, Loader, Phone, Calendar, Upload, X, Camera } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

// Función para obtener colores por rol
const getRoleColor = (role: string) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800', 
    supervisor: 'bg-orange-100 text-orange-800',
    instructor: 'bg-green-100 text-green-800',
    voluntario: 'bg-blue-100 text-blue-800',
    ciudadano: 'bg-gray-100 text-gray-800',
    guardaparques: 'bg-emerald-100 text-emerald-800',
    guardia: 'bg-yellow-100 text-yellow-800',
    concesionario: 'bg-indigo-100 text-indigo-800',
    user: 'bg-slate-100 text-slate-800'
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Función para obtener etiqueta en español
const getRoleLabel = (role: string) => {
  const labels = {
    admin: 'Administrador',
    manager: 'Gestor',
    supervisor: 'Supervisor', 
    instructor: 'Instructor',
    voluntario: 'Voluntario',
    ciudadano: 'Ciudadano',
    guardaparques: 'Guardaparques',
    guardia: 'Guardia',
    concesionario: 'Concesionario',
    user: 'Usuario'
  };
  return labels[role as keyof typeof labels] || role;
};

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
  profileImageFile?: File | null;
  profileImageUrl?: string;
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
    profileImageFile: null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImageUrl || null);

  const handleChange = (field: keyof UserFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error de archivo",
          description: "La imagen no puede superar 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast({
          title: "Error de formato",
          description: "Solo se permiten archivos JPG, PNG, WEBP",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, profileImageFile: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImageFile: null }));
    setPreviewImage(user?.profileImageUrl || null);
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
          <DialogDescription id="user-form-description">
            Formulario simplificado para {isNew ? 'crear un nuevo usuario' : 'editar información del usuario'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fotografía de perfil */}
          <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-4">
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Vista previa" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <label 
                  htmlFor="profile-image-input"
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Seleccionar foto</span>
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">JPG, PNG, WEBP (máx. 5MB)</p>
              </div>
            </div>
          </div>

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
      
      // Si hay archivo de imagen, subir primero
      if (userData.profileImageFile) {
        const formDataImage = new FormData();
        formDataImage.append('image', userData.profileImageFile);
        
        const uploadResponse = await fetch('/api/upload/user-profile', {
          method: 'POST',
          body: formDataImage,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          userData.profileImageUrl = uploadResult.filePath;
        }
      }

      // Remover el archivo del objeto antes de enviarlo
      const { profileImageFile, ...userDataWithoutFile } = userData;
      
      const url = isUpdate ? `/api/users/${selectedUser?.id}` : '/api/users';
      const method = isUpdate ? 'PUT' : 'POST';

      let finalUserData = userDataWithoutFile;
      if (isUpdate && !userData.password) {
        const { password, ...dataWithoutPassword } = userDataWithoutFile;
        finalUserData = dataWithoutPassword;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalUserData),
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
    <AdminLayout>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
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
    </AdminLayout>
  );
};

export default AdminUsers;