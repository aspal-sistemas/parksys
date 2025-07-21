import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader, Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    fullName: '',
    phone: '',
    gender: '',
    birthDate: '',
    bio: '',
    profileImageFile: null as File | null,
    profileImageUrl: ''
  });

  // Función para obtener usuarios con múltiples intentos
  const fetchUsersWithFallback = async () => {
    const endpoints = ['/api/users', '/api/users-bypass'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Probando endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Éxito con ${endpoint}: ${data.length} usuarios`);
          return data;
        } else {
          console.log(`❌ Error ${response.status} con ${endpoint}`);
        }
      } catch (err) {
        console.log(`❌ Excepción con ${endpoint}:`, err);
      }
    }
    
    throw new Error('Todos los endpoints fallaron');
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchUsersWithFallback();
        setUsers(data || []);
      } catch (err) {
        console.error('Error final cargando usuarios:', err);
        setError('Error de conectividad con el servidor');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'gestor': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-yellow-100 text-yellow-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch('/api/upload/user-profile', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }
  };

  const saveUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const isUpdate = !!selectedUser;
      let imageUrl = null;

      if (userData.profileImageFile) {
        imageUrl = await handleImageUpload(userData.profileImageFile);
      }

      const userDataToSend = {
        ...userData,
        profileImageUrl: imageUrl || (isUpdate ? selectedUser?.profileImageUrl : null)
      };
      delete (userDataToSend as any).profileImageFile;

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
      // Recargar usuarios
      fetchUsersWithFallback().then(data => {
        setUsers(data || []);
      }).catch(err => {
        console.error('Error recargando usuarios:', err);
      });

      toast({
        title: "¡Éxito!",
        description: selectedUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      });
      setSelectedUser(null);
      setIsNewUser(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        fullName: '',
        phone: '',
        gender: '',
        birthDate: '',
        bio: '',
        profileImageFile: null,
        profileImageUrl: ''
      });
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
      // Recargar usuarios
      fetchUsersWithFallback().then(data => {
        setUsers(data || []);
      }).catch(err => {
        console.error('Error recargando usuarios:', err);
      });

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
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      fullName: user.fullName,
      phone: user.phone || '',
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      bio: user.bio || '',
      profileImageFile: null,
      profileImageUrl: user.profileImageUrl || ''
    });
  };

  const handleNewUser = () => {
    setIsNewUser(true);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      fullName: '',
      phone: '',
      gender: '',
      birthDate: '',
      bio: '',
      profileImageFile: null,
      profileImageUrl: ''
    });
  };

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

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error de conectividad</p>
            <p className="text-sm">No se pudieron cargar los usuarios del servidor.</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra los usuarios del sistema
            </p>
          </div>
          <Dialog open={isNewUser || !!selectedUser} onOpenChange={(open) => {
            if (!open) {
              setIsNewUser(false);
              setSelectedUser(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleNewUser}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                saveUserMutation.mutate(formData);
              }} className="space-y-6">
                
                {/* Sección de Fotografía */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fotografía de Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={formData.profileImageUrl} 
                          alt={formData.fullName} 
                        />
                        <AvatarFallback className="text-lg">
                          {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <Label htmlFor="profileImage">Subir nueva foto</Label>
                        <Input
                          id="profileImage"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, profileImageFile: file }));
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  profileImageUrl: e.target?.result as string 
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG o WEBP. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Básica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Nombre de usuario *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        {selectedUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required={!selectedUser}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rol *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="gestor">Gestor</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="instructor">Instructor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="fullName">Nombre completo *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Información adicional sobre el usuario"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewUser(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveUserMutation.isPending}
                  >
                    {saveUserMutation.isPending ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        {selectedUser ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barra de búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;