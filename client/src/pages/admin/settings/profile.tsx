import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import UserProfileImage from '@/components/UserProfileImage';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Camera, 
  Edit,
  Save,
  Eye,
  EyeOff,
  Lock,
  Building
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado para edición de perfil
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    birthDate: '',
    gender: ''
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar datos del usuario actual desde la API
  const { data: userDetails, isLoading } = useQuery({
    queryKey: [`/api/users/${(user as any)?.id}`],
    enabled: !!(user as any)?.id,
  });

  // Efecto para actualizar los datos del formulario cuando se cargan los datos del usuario
  React.useEffect(() => {
    if (userDetails) {
      setProfileData({
        fullName: (userDetails as any).fullName || '',
        email: (userDetails as any).email || '',
        phone: (userDetails as any).phone || '',
        bio: (userDetails as any).bio || '',
        birthDate: (userDetails as any).birthDate || '',
        gender: (userDetails as any).gender || ''
      });
    }
  }, [userDetails]);

  // Mutación para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/users/${(user as any)?.id}`, {
        method: 'PUT',
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${(user as any)?.id}`] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha actualizado correctamente.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/users/${(user as any)?.id}/change-password`, {
        method: 'PUT',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente.",
      });
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Administrador</Badge>;
      case 'director':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Director</Badge>;
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Gerente</Badge>;
      case 'instructor':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Instructor</Badge>;
      case 'volunteer':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Voluntario</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Mi Perfil">
        <div className="flex justify-center py-12">
          <p>Cargando perfil...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Mi Perfil">
      <Helmet>
        <title>Mi Perfil | ParquesMX</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header del perfil */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <UserProfileImage 
                  userId={(user as any)?.id} 
                  size="lg" 
                  className="h-24 w-24" 
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                  onClick={() => {
                    toast({
                      title: "Próximamente",
                      description: "La función de cambio de foto estará disponible pronto.",
                    });
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {(userDetails as any)?.fullName || (user as any)?.username}
                </h1>
                <p className="text-gray-500 mb-2">{(userDetails as any)?.email}</p>
                <div className="flex items-center space-x-3">
                  {getRoleBadge((user as any)?.role)}
                  {(userDetails as any)?.municipality && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{(userDetails as any).municipality.name}</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        // Restaurar datos originales
                        setProfileData({
                          fullName: userDetails?.fullName || '',
                          email: userDetails?.email || '',
                          phone: userDetails?.phone || '',
                          bio: userDetails?.bio || '',
                          birthDate: userDetails?.birthDate || '',
                          gender: userDetails?.gender || ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pestañas de información */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información Personal</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
                <CardDescription>
                  Información básica de tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Tu nombre completo"
                        />
                      ) : (
                        <span className="text-gray-900">{profileData.fullName || 'No especificado'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="tu@email.com"
                        />
                      ) : (
                        <span className="text-gray-900">{profileData.email || 'No especificado'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Tu número de teléfono"
                        />
                      ) : (
                        <span className="text-gray-900">{profileData.phone || 'No especificado'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <Input
                          id="birthDate"
                          type="date"
                          value={profileData.birthDate ? profileData.birthDate.split('T')[0] : ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                        />
                      ) : (
                        <span className="text-gray-900">
                          {profileData.birthDate 
                            ? format(new Date(profileData.birthDate), 'dd/MM/yyyy', { locale: es })
                            : 'No especificado'
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografía</Label>
                  <div className="mt-1">
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Cuéntanos sobre ti..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[100px]">
                        {profileData.bio || 'No hay biografía disponible'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seguridad */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>
                  Gestiona tu contraseña y configuración de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Contraseña</p>
                      <p className="text-sm text-gray-500">Gestiona tu contraseña de acceso</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Cambiar Contraseña
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Rol del Sistema</p>
                      <p className="text-sm text-gray-500">
                        Tu nivel de acceso: {(user as any)?.role}
                      </p>
                    </div>
                  </div>
                  {getRoleBadge((user as any)?.role)}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Información de la Cuenta</p>
                      <p className="text-sm text-gray-500">
                        Miembro desde: {userDetails?.createdAt 
                          ? format(new Date(userDetails.createdAt), 'MMMM yyyy', { locale: es })
                          : 'Fecha no disponible'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actividad */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Resumen de tu actividad en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>El historial de actividad estará disponible próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Tu contraseña actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Tu nueva contraseña"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowChangePassword(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
            >
              {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}