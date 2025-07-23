import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Bell, Settings, Users, Mail, AlertTriangle, CheckCircle, BarChart3, Search, X } from "lucide-react";
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
  feedback_share_enabled: number;
  feedback_report_problem_enabled: number;
  feedback_suggest_improvement_enabled: number;
  feedback_propose_event_enabled: number;
  events_enabled: number;
  maintenance_enabled: number;
  payroll_enabled: number;
}

export default function NotificationPreferences() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Efecto para debug en caso de problemas de carga
  useEffect(() => {
    console.log('🔍 NotificationPreferences component mounted');
    return () => {
      console.log('🔍 NotificationPreferences component unmounted');
    };
  }, []);

  // Obtener usuarios para seleccionar
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/users'],
    select: (data: any) => data?.users || data || [],
    retry: 3,
    retryDelay: 1000
  });

  // Obtener preferencias del usuario seleccionado
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: [`/api/users/${selectedUserId}/notification-preferences`],
    enabled: !!selectedUserId,
  });

  // Obtener resumen de preferencias por rol
  const { data: summaryData, error: summaryError } = useQuery<{ summary: PreferenceSummary[] }>({
    queryKey: ['/api/users/notification-preferences/summary'],
    retry: 3,
    retryDelay: 1000
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
      queryClient.invalidateQueries({ queryKey: [`/api/users/${selectedUserId}/notification-preferences`] });
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
    if (!userPreferences) return;
    
    const updatedPreferences = {
      ...userPreferences.preferences,
      [key]: value,
    };
    
    updatePreferencesMutation.mutate({
      userId: userPreferences.userId,
      preferences: updatedPreferences,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'volunteer':
        return 'bg-orange-100 text-orange-800';
      case 'concessionaire':
        return 'bg-yellow-100 text-yellow-800';
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

  // Aplicar filtros de búsqueda y rol
  const filteredUsers = relevantUsers.filter((user: any) => {
    const matchesSearch = searchTerm === "" || 
      (user.fullName || user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Obtener roles únicos para el filtro
  const availableRoles = [...new Set(relevantUsers.map((user: any) => user.role))];

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con título */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="w-8 h-8 text-gray-900" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
              <p className="text-gray-600 mt-2">
                Configura qué tipos de notificaciones recibe cada usuario del sistema
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="configuracion" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración de Usuario
            </TabsTrigger>
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen por Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuracion">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna 1: Selección de usuario */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Seleccionar Usuario
                  </CardTitle>
                  <CardDescription>
                    Elige el usuario para configurar sus preferencias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filtros */}
                  <div className="space-y-4 mb-4">
                    {/* Búsqueda por nombre */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-9"
                      />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Filtro por rol */}
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleLabel(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Información de filtros y botón limpiar */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {filteredUsers.length} de {relevantUsers.length} usuarios
                      </span>
                      {(searchTerm || roleFilter !== "all") && (
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={clearFilters}
                          className="h-6 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </div>
                  {usersLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium mb-1">
                        {searchTerm || roleFilter !== "all" ? "Sin resultados" : "No hay usuarios"}
                      </p>
                      <p className="text-xs">
                        {searchTerm || roleFilter !== "all" ? 
                          "Prueba ajustando los filtros de búsqueda" : 
                          "No se encontraron usuarios relevantes"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredUsers.map((user: any) => (
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
                              <div className="font-medium text-sm">{user.fullName || user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            <Badge className={getRoleColor(user.role)} variant="secondary">
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Columnas 2-3: Configuración de preferencias */}
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
                        Preferencias de {userPreferences.fullName || 'Usuario'}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {userPreferences.email}
                          <Badge className={getRoleColor(userPreferences.role)} variant="secondary">
                            {getRoleLabel(userPreferences.role)}
                          </Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userPreferences.availableNotifications?.map((notification, index) => {
                        // Detectar si es una notificación granular de feedback
                        const isFeedbackSubNotification = notification.key.startsWith('feedback_');
                        const isFeedbackMain = notification.key === 'feedback';
                        
                        return (
                          <div key={notification.key} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {isFeedbackMain ? (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-sm text-blue-800">{notification.label}</span>
                                    </div>
                                  ) : isFeedbackSubNotification ? (
                                    <div className="flex items-center gap-2 ml-2">
                                      <div className="w-3 h-px bg-gray-300"></div>
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      <span className="font-medium text-xs">{notification.label.replace('  └─ ', '')}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-sm">{notification.label}</span>
                                    </div>
                                  )}
                                </div>
                                <p className={`text-xs text-gray-500 ${isFeedbackSubNotification ? 'ml-8' : 'ml-6'}`}>
                                  {notification.description}
                                </p>
                              </div>
                              <Switch
                                checked={userPreferences.preferences?.[notification.key] || false}
                                onCheckedChange={(checked) => handlePreferenceChange(notification.key, checked)}
                                disabled={updatePreferencesMutation.isPending}
                                className={isFeedbackSubNotification ? "scale-90" : ""}
                              />
                            </div>
                            {index < (userPreferences.availableNotifications?.length || 0) - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        );
                      }) || (
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
          </TabsContent>

          <TabsContent value="resumen">
            {summaryData?.summary && Array.isArray(summaryData.summary) && summaryData.summary.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
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
                            <span>Feedback general:</span>
                            <span className="font-medium">{summary.feedback_enabled}/{summary.total_users}</span>
                          </div>
                          <div className="flex justify-between ml-2">
                            <span>├ Experiencias:</span>
                            <span className="font-medium text-green-600">{summary.feedback_share_enabled}/{summary.total_users}</span>
                          </div>
                          <div className="flex justify-between ml-2">
                            <span>├ Problemas:</span>
                            <span className="font-medium text-red-600">{summary.feedback_report_problem_enabled}/{summary.total_users}</span>
                          </div>
                          <div className="flex justify-between ml-2">
                            <span>├ Mejoras:</span>
                            <span className="font-medium text-blue-600">{summary.feedback_suggest_improvement_enabled}/{summary.total_users}</span>
                          </div>
                          <div className="flex justify-between ml-2">
                            <span>└ Eventos:</span>
                            <span className="font-medium text-purple-600">{summary.feedback_propose_event_enabled}/{summary.total_users}</span>
                          </div>
                          <div className="flex justify-between pt-1">
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
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin datos de resumen
                  </h3>
                  <p className="text-sm text-gray-500">
                    No hay datos disponibles para mostrar el resumen por roles
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}