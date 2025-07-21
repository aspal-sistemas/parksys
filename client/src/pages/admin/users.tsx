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

interface UserData {
  id: number;
  username: string;
  email: string;
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
  fullName: string;
  role: string;
  password: string;
  phone: string;
  gender: string;
  birthDate: string;
  bio: string;
  municipalityId: number | null;
  profileImageFile?: File | null;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-500 text-white';
    case 'manager': return 'bg-purple-500 text-white';
    case 'supervisor': return 'bg-orange-500 text-white';
    case 'instructor': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'manager': return 'Gestor';
    case 'supervisor': return 'Supervisor';
    case 'instructor': return 'Instructor';
    default: return role;
  }
};

const FormularioUsuario: React.FC<{
  user: UserData | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  isSaving: boolean;
}> = ({ user, isNew, onClose, onSave, isSaving }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UserFormData>({
    role: user?.role || 'instructor',
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
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
    
    if (!formData.username || !formData.email || !formData.fullName) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isNew ? '👤 Nuevo Usuario' : '✏️ Editar Usuario'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {isNew ? 'Crear un nuevo usuario del sistema' : 'Modificar información del usuario'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN FOTOGRAFÍA - MUY VISIBLE */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-4">📷 Fotografía de Perfil</h3>
              
              <div className="flex flex-col items-center space-y-4">
                {previewImage ? (
                  <div className="relative">
                    <img 
                      src={previewImage} 
                      alt="Foto de perfil" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-8 h-8 p-0 rounded-full shadow-md"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                    <Camera className="h-12 w-12 text-gray-500" />
                  </div>
                )}
                
                <div className="flex flex-col space-y-3">
                  <label 
                    htmlFor="profile-image-input"
                    className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="font-medium">Subir Fotografía</span>
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                    📁 JPG, PNG, WEBP • Máximo 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CAMPOS BÁSICOS */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-700">Información Básica</h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1 block">Nombre Completo *</label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Nombre completo del usuario"
                  className="border-2 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1 block">Usuario *</label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Nombre de usuario único"
                className="border-2 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1 block">Rol del Sistema *</label>
              <Select value={formData.role} onValueChange={(value: any) => handleChange('role', value)}>
                <SelectTrigger className="border-2 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">🔴 Administrador</SelectItem>
                  <SelectItem value="manager">🟣 Gestor</SelectItem>
                  <SelectItem value="supervisor">🟠 Supervisor</SelectItem>
                  <SelectItem value="instructor">🔵 Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Correo Electrónico *</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="border-2 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                {isNew ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={isNew ? 'Contraseña segura' : 'Dejar vacío para mantener actual'}
                className="border-2 focus:border-blue-500"
                required={isNew}
              />
            </div>
          </div>

          {/* INFORMACIÓN ADICIONAL */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-700">Información Personal</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Número de contacto"
                  className="border-2 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="birthDate" className="text-sm font-medium text-gray-700 mb-1 block">Fecha de Nacimiento</label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="border-2 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-1 block">Género</label>
              <Select value={formData.gender} onValueChange={(value: any) => handleChange('gender', value)}>
                <SelectTrigger className="border-2 focus:border-blue-500">
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
              <label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-1 block">Biografía</label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Breve descripción personal o profesional"
                rows={3}
                className="border-2 focus:border-blue-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSaving}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? '✅ Crear Usuario' : '💾 Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users', Date.now()], // Cache único por timestamp
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const saveUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const isUpdate = selectedUser !== null;
      
      // 1. Primero subir imagen si existe
      let imageUrl = null;
      if (userData.profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', userData.profileImageFile);
        if (isUpdate && selectedUser?.id) {
          imageFormData.append('userId', selectedUser.id.toString());
        }
        
        const imageResponse = await fetch('/api/upload/user-profile', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          imageUrl = imageResult.url;
          console.log('✅ Imagen subida correctamente:', imageUrl);
        } else {
          console.error('❌ Error subiendo imagen');
        }
      }
      
      // 2. Luego guardar/actualizar usuario
      const userDataToSend = {
        ...userData,
        profileImageUrl: imageUrl || (isUpdate ? selectedUser?.profileImageUrl : null)
      };
      delete (userDataToSend as any).profileImageFile; // Remover archivo del objeto
      
      console.log('📤 Enviando datos con imagen:', {
        imageUrl,
        profileImageUrl: userDataToSend.profileImageUrl,
        isUpdate,
        userId: selectedUser?.id
      });
      
      const url = isUpdate ? `/api/users/${selectedUser?.id}` : '/api/users';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al guardar usuario');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache de manera más agresiva
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "¡Éxito!",
        description: selectedUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      });
      setSelectedUser(null);
      setIsNewUser(false);
      
      // Forzar recarga de la página para mostrar cambios inmediatamente
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  const filteredUsers = (users as UserData[]).filter((user: UserData) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">Administración de personal y usuarios del sistema ParkSys</p>
          </div>
          <Button 
            onClick={() => setIsNewUser(true)}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Usuario
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="🔍 Buscar usuarios por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    👤 Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    🏷️ Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    📞 Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    📅 Registro
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ⚙️ Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: UserData) => (
                  <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">

                          {user.profileImageUrl ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover border-2 border-blue-300 shadow-sm" 
                              src={`${user.profileImageUrl}?t=${Date.now()}`}
                              alt={user.fullName}
                              onError={(e) => {
                                console.log('❌ Error cargando imagen:', user.profileImageUrl);
                                console.log('Usuario:', user.fullName, 'ID:', user.id);
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'flex';
                                }
                              }}
                              onLoad={() => {
                                console.log('✅ Imagen cargada correctamente:', user.profileImageUrl);
                              }}
                            />
                          ) : null}
                          <div 
                            className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center"
                            style={{ display: user.profileImageUrl ? 'none' : 'flex' }}
                          >
                            <UserRound className="h-7 w-7 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
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
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar a ${user.fullName}?`)) {
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
            <UserRound className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-2 text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron usuarios que coincidan con tu búsqueda.' : 'Comienza agregando un nuevo usuario.'}
            </p>
          </div>
        )}

        {(selectedUser || isNewUser) && (
          <FormularioUsuario
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