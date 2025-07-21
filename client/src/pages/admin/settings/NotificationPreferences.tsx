import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Bell, Settings, Users, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";

interface NotificationPreference {
  key: string;
  label: string;
  description: string;
}

interface UserPreferences {
  userId: number;
  role: string;
  fullName: string;
  email: string;
  preferences: Record<string, boolean>;
  availableNotifications: NotificationPreference[];
}

interface PreferenceSummary {
  role: string;
  total_users: number;
  feedback_enabled: number;
  events_enabled: number;
  maintenance_enabled: number;
  payroll_enabled: number;
}

export default function NotificationPreferences() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Obtener usuarios para seleccionar
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    select: (data: any) => data?.users || data || []
  });

  // Obtener preferencias del usuario seleccionado
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/users', selectedUserId, 'notification-preferences'],
    enabled: !!selectedUserId,
  });

  // Obtener resumen de preferencias por rol
  const { data: summaryData } = useQuery<{ summary: PreferenceSummary[] }>({
    queryKey: ['/api/users/notification-preferences/summary'],
  });

  // Mutación para actualizar preferencias
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ userId, preferences }: { userId: number; preferences: Record<string, boolean> }) => {
      return apiRequest(`/api/users/${userId}/notification-preferences`, {
        method: 'PUT',
        data: preferences,
      });
    },
    onSuccess: () => {
      toast({
        title: "Preferencias actualizadas",
        description: "Las preferencias de notificación se han guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', selectedUserId, 'notification-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/notification-preferences/summary'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudieron actualizar las preferencias.",
        variant: "destructive",
      });
    },
  });

  // Seleccionar automáticamente el primer usuario admin
  useEffect(() => {
    if (usersData && usersData.length > 0 && !selectedUserId) {
      const adminUser = usersData.find((user: any) => user.role === 'admin' || user.role === 'super_admin');
      if (adminUser) {
        setSelectedUserId(adminUser.id);
      }
    }
  }, [usersData, selectedUserId]);

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (!selectedUserId || !userPreferences) return;

    const updatedPreferences = {
      ...userPreferences.preferences,
      [key]: value
    };

    updatePreferencesMutation.mutate({
      userId: selectedUserId,
      preferences: updatedPreferences
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'volunteer':
        return 'bg-purple-100 text-purple-800';
      case 'concessionaire':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'super_admin':
        return 'Super Admin';
      case 'manager':
        return 'Gestor';
      case 'instructor':
        return 'Instructor';
      case 'volunteer':
        return 'Voluntario';
      case 'concessionaire':
        return 'Concesionario';
      default:
        return role;
    }
  };

  // Filtrar usuarios por roles relevantes
  const relevantUsers = usersData?.filter((user: any) => 
    ['admin', 'super_admin', 'manager', 'instructor', 'volunteer', 'concessionaire'].includes(user.role)
  ) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
            <p className="text-gray-500">Configura qué tipos de notificaciones recibe cada usuario del sistema</p>
          </div>
        </div>

        {/* Resumen por Roles */}
        {summaryData?.summary && Array.isArray(summaryData.summary) && summaryData.summary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resumen por Roles
              </CardTitle>
              <CardDescription>
                Vista general de las preferencias de notificación por tipo de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summaryData.summary.map((summary: PreferenceSummary) => (
                <div key={summary.role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getRoleColor(summary.role)}>
                      {getRoleLabel(summary.role)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {summary.total_users} usuarios
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Feedback:</span>
                      <span className="font-medium">{summary.feedback_enabled}/{summary.total_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eventos:</span>
                      <span className="font-medium">{summary.events_enabled}/{summary.total_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mantenimiento:</span>
                      <span className="font-medium">{summary.maintenance_enabled}/{summary.total_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nómina:</span>
                      <span className="font-medium">{summary.payroll_enabled}/{summary.total_users}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selector de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seleccionar Usuario
              </CardTitle>
              <CardDescription>
                Elige un usuario para configurar sus preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Cargando usuarios...</p>
                </div>
              ) : relevantUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No se encontraron usuarios relevantes</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {relevantUsers.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración de Preferencias */}
          <div className="lg:col-span-2">
          {preferencesLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando preferencias...</p>
              </CardContent>
            </Card>
          ) : userPreferences ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferencias de {userPreferences.fullName}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userPreferences.email}
                    <Badge className={getRoleColor(userPreferences.role)}>
                      {getRoleLabel(userPreferences.role)}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userPreferences.availableNotifications?.map((notification, index) => (
                  <div key={notification.key}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.label}</h4>
                          {notification.key === 'emergency' && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                      </div>
                      <Switch
                        checked={userPreferences.preferences[notification.key] || false}
                        onCheckedChange={(checked) => handlePreferenceChange(notification.key, checked)}
                        disabled={updatePreferencesMutation.isPending}
                      />
                    </div>
                    {index < (userPreferences.availableNotifications?.length || 0) - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                )) || (
                  <div className="p-4 text-center text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No hay preferencias de notificación disponibles para este usuario</p>
                  </div>
                )}

                {updatePreferencesMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Guardando cambios...
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un usuario
                </h3>
                <p className="text-sm text-gray-500">
                  Elige un usuario de la lista para configurar sus preferencias de notificación
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}