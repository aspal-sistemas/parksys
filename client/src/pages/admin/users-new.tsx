import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  UserRound, 
  Plus,
  Edit,
  Trash2,
  Search,
  Camera,
  Upload,
  X,
  Loader
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserData {
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
  role: string;
  password: string;
  phone: string;
  gender: string;
  birthDate: string;
  bio: string;
  municipalityId: number | null;
  profileImageFile: File | null;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-500 text-white';
    case 'manager': return 'bg-purple-500 text-white';
    case 'supervisor': return 'bg-orange-500 text-white';
    case 'instructor': return 'bg-blue-500 text-white';
    case 'volunteer': return 'bg-green-500 text-white';
    case 'concessionaire': return 'bg-yellow-500 text-black';
    default: return 'bg-gray-500 text-white';
  }
};

const UserNewFormDialog: React.FC<{
  user: UserData | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  isSaving: boolean;
}> = ({ user, isNew, onClose, onSave, isSaving }) => {
  const { toast } = useToast();
  
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
            Formulario para {isNew ? 'crear un nuevo usuario' : 'editar información del usuario'} con funcionalidad de fotografía
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECCIÓN DE FOTOGRAFÍA */}
          <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Fotografía de Perfil</h3>
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
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">JPG, PNG, WEBP (máx. 5MB)</p>
              </div>
            </div>
          </div>

          {/* CAMPOS DEL FORMULARIO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium">Nombre</label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="text-sm font-medium">Apellido</label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-medium">Usuario</label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium">Rol</label>
            <Select value={formData.role} onValueChange={(value: any) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gestor</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="volunteer">Voluntario</SelectItem>
                <SelectItem value="concessionaire">Concesionario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
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
              {isNew ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isNew ? 'Contraseña' : 'Dejar vacío para mantener actual'}
              required={isNew}
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Número de teléfono"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="text-sm font-medium">Fecha de Nacimiento</label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
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

export default function UsersNewPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Query para obtener usuarios
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutación para guardar usuario
  const saveUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const isUpdate = selectedUser !== null;
      
      // Crear FormData para subir archivos
      const formData = new FormData();
      
      // Campos del usuario
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== 'profileImageFile' && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Archivo de imagen
      if (userData.profileImageFile) {
        formData.append('profileImage', userData.profileImageFile);
      }
      
      const url = isUpdate ? `/api/users/${selectedUser?.id}` : '/api/users';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al guardar usuario');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Éxito",
        description: selectedUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      });
      setSelectedUser(null);
      setIsNewUser(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: UserData) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">Administración de personal y usuarios del sistema</p>
          </div>
          <Button 
            onClick={() => setIsNewUser(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Usuario
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: UserData) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImageUrl ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={user.profileImageUrl} 
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserRound className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' && 'Administrador'}
                        {user.role === 'manager' && 'Gestor'}
                        {user.role === 'supervisor' && 'Supervisor'}
                        {user.role === 'instructor' && 'Instructor'}
                        {user.role === 'volunteer' && 'Voluntario'}
                        {user.role === 'concessionaire' && 'Concesionario'}
                        {!['admin', 'manager', 'supervisor', 'instructor', 'volunteer', 'concessionaire'].includes(user.role) && user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserRound className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron usuarios que coincidan con tu búsqueda.' : 'Comienza agregando un nuevo usuario.'}
            </p>
          </div>
        )}

        {/* Dialog del formulario */}
        {(selectedUser || isNewUser) && (
          <UserNewFormDialog
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
      </div>
    </AdminLayout>
  );
}