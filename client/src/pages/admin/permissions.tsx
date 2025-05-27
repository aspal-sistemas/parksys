import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Save, 
  RotateCcw, 
  Users, 
  Home, 
  MapPin, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Settings,
  Box,
  Activity,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Tag,
  Map,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Definición de todos los módulos y submenús del sistema
const SYSTEM_MODULES = {
  dashboard: {
    name: 'Dashboard',
    icon: Home,
    path: '/admin',
    children: {}
  },
  operations: {
    name: 'Operaciones',
    icon: MapPin,
    children: {
      parks: { name: 'Parques', icon: Map, path: '/admin/parks' },
      assets: { name: 'Activos', icon: Box, path: '/admin/assets' },
      incidents: { name: 'Incidentes', icon: AlertCircle, path: '/admin/incidents' }
    }
  },
  finance: {
    name: 'Finanzas',
    icon: DollarSign,
    children: {
      catalog: { name: 'Catálogo', icon: Tag, path: '/admin/finance/catalog' },
      incomes: { name: 'Ingresos', icon: TrendingUp, path: '/admin/finance/incomes' },
      expenses: { name: 'Egresos', icon: TrendingDown, path: '/admin/finance/expenses' }
    }
  },
  activities: {
    name: 'Actividades',
    icon: Calendar,
    children: {
      list: { name: 'Listado', icon: Activity, path: '/admin/activities' },
      calendar: { name: 'Calendario', icon: Calendar, path: '/admin/activities/calendar' },
      instructors: { name: 'Instructores', icon: GraduationCap, path: '/admin/instructors' }
    }
  },
  users: {
    name: 'Personal',
    icon: Users,
    path: '/admin/users',
    children: {}
  },
  settings: {
    name: 'Configuración',
    icon: Settings,
    path: '/admin/settings',
    children: {}
  }
};

const ROLES = [
  { id: 'admin', name: 'Administrador', color: 'bg-red-100 text-red-800' },
  { id: 'director', name: 'Director', color: 'bg-purple-100 text-purple-800' },
  { id: 'manager', name: 'Manager', color: 'bg-blue-100 text-blue-800' },
  { id: 'instructor', name: 'Instructor', color: 'bg-green-100 text-green-800' },
  { id: 'supervisor', name: 'Supervisor', color: 'bg-yellow-100 text-yellow-800' }
];

const AdminPermissions = () => {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current permissions
  const { data: currentPermissions, isLoading } = useQuery({
    queryKey: ['/api/role-permissions'],
    enabled: true
  });

  // Initialize permissions when data loads
  useEffect(() => {
    if (currentPermissions) {
      setPermissions(currentPermissions);
    }
  }, [currentPermissions]);

  // Save permissions mutation
  const savePermissionsMutation = useMutation({
    mutationFn: async (newPermissions: Record<string, Record<string, boolean>>) => {
      return apiRequest('/api/role-permissions', {
        method: 'PUT',
        body: JSON.stringify(newPermissions),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: 'Permisos guardados exitosamente' });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
    },
    onError: () => {
      toast({ 
        title: 'Error al guardar permisos', 
        variant: 'destructive' 
      });
    }
  });

  const togglePermission = (role: string, module: string, submodule?: string) => {
    const permissionKey = submodule ? `${module}.${submodule}` : module;
    
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role]?.[permissionKey]
      }
    }));
    setHasChanges(true);
  };

  const hasPermission = (role: string, module: string, submodule?: string) => {
    const permissionKey = submodule ? `${module}.${submodule}` : module;
    return permissions[role]?.[permissionKey] || false;
  };

  const resetPermissions = () => {
    if (currentPermissions) {
      setPermissions(currentPermissions);
      setHasChanges(false);
    }
  };

  const savePermissions = () => {
    savePermissionsMutation.mutate(permissions);
  };

  const getModulePermissionCount = (role: string, moduleKey: string) => {
    const module = SYSTEM_MODULES[moduleKey as keyof typeof SYSTEM_MODULES];
    if (!module) return { granted: 0, total: 0 };

    let granted = 0;
    let total = 0;

    if (Object.keys(module.children || {}).length === 0) {
      // Module without children
      total = 1;
      granted = hasPermission(role, moduleKey) ? 1 : 0;
    } else {
      // Module with children
      Object.keys(module.children || {}).forEach(subKey => {
        total++;
        if (hasPermission(role, moduleKey, subKey)) {
          granted++;
        }
      });
    }

    return { granted, total };
  };

  const renderPermissionMatrix = () => (
    <div className="space-y-6">
      {Object.entries(SYSTEM_MODULES).map(([moduleKey, module]) => {
        const IconComponent = module.icon;
        
        return (
          <Card key={moduleKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="w-5 h-5" />
                {module.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(module.children || {}).length === 0 ? (
                  // Module without children
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium text-gray-700">Acceso completo</div>
                    {ROLES.map(role => (
                      <div key={role.id} className="flex justify-center">
                        <Checkbox
                          checked={hasPermission(role.id, moduleKey)}
                          onCheckedChange={() => togglePermission(role.id, moduleKey)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Module with children
                  Object.entries(module.children || {}).map(([subKey, subModule]) => {
                    const SubIconComponent = subModule.icon;
                    return (
                      <div key={subKey} className="grid grid-cols-5 gap-4 items-center">
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                          <SubIconComponent className="w-4 h-4" />
                          {subModule.name}
                        </div>
                        {ROLES.map(role => (
                          <div key={role.id} className="flex justify-center">
                            <Checkbox
                              checked={hasPermission(role.id, moduleKey, subKey)}
                              onCheckedChange={() => togglePermission(role.id, moduleKey, subKey)}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderRolesSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ROLES.map(role => (
        <Card key={role.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Badge className={role.color}>{role.name}</Badge>
              <User className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(SYSTEM_MODULES).map(([moduleKey, module]) => {
                const { granted, total } = getModulePermissionCount(role.id, moduleKey);
                const IconComponent = module.icon;
                
                return (
                  <div key={moduleKey} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{module.name}</span>
                    </div>
                    <Badge variant={granted === total ? 'default' : granted > 0 ? 'secondary' : 'outline'}>
                      {granted}/{total}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">Cargando permisos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Gestión de Permisos
            </h1>
            <p className="text-gray-600 mt-2">
              Configura qué secciones del panel puede acceder cada rol del sistema
            </p>
          </div>
          
          {hasChanges && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetPermissions}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Revertir
              </Button>
              <Button 
                onClick={savePermissions}
                disabled={savePermissionsMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savePermissionsMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="matrix" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matrix">Matriz de Permisos</TabsTrigger>
            <TabsTrigger value="summary">Resumen por Rol</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Permisos por Módulo</CardTitle>
                <CardDescription>
                  Marca las casillas para otorgar acceso a cada sección del sistema por rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Headers */}
                <div className="grid grid-cols-5 gap-4 items-center mb-4 pb-2 border-b">
                  <div className="font-semibold text-gray-900">Módulo / Sección</div>
                  {ROLES.map(role => (
                    <div key={role.id} className="text-center">
                      <Badge className={role.color}>{role.name}</Badge>
                    </div>
                  ))}
                </div>
                
                {renderPermissionMatrix()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Permisos por Rol</CardTitle>
                <CardDescription>
                  Visualiza cuántos módulos tiene acceso cada rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderRolesSummary()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
                    Hay cambios sin guardar en los permisos
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetPermissions}
                  >
                    Revertir
                  </Button>
                  <Button 
                    size="sm"
                    onClick={savePermissions}
                    disabled={savePermissionsMutation.isPending}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPermissions;