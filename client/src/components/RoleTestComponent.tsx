import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Users, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  level: number;
  color: string;
  permissions: Record<string, any>;
  isActive: boolean;
}

interface UserWithRole {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  userRole?: Role;
}

export function RoleTestComponent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener roles
      const rolesResponse = await apiRequest('/api/roles');
      const rolesData = await rolesResponse.json();
      setRoles(rolesData);

      // Obtener usuarios con roles
      const usersResponse = await apiRequest('/api/users-with-roles');
      const usersData = await usersResponse.json();
      setUsers(usersData.slice(0, 10)); // Mostrar solo los primeros 10

    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al cargar los datos del sistema de roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoleBadgeColor = (color: string) => {
    return color || '#6366f1';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Cargando sistema de roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center text-red-700">
            <Shield className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de prueba */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-6 w-6 mr-2" />
            Sistema de Roles - Prueba de Integración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            El sistema de roles está funcionando correctamente. Se han encontrado {roles.length} roles 
            y {users.length} usuarios en la base de datos.
          </p>
        </CardContent>
      </Card>

      {/* Lista de roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Roles del Sistema ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div 
                key={role.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRoleBadgeColor(role.color) }}
                    />
                    <span className="font-medium">{role.name}</span>
                  </div>
                  <Badge variant="outline">
                    Nivel {role.level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {role.description}
                </p>
                <div className="text-xs text-gray-500">
                  Slug: <span className="font-mono">{role.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios con roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuarios con Roles Asignados ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.userRole && (
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRoleBadgeColor(user.userRole.color) }}
                      />
                    )}
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    @{user.username}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.userRole ? (
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                    >
                      {user.userRole.name}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Sin rol asignado
                    </Badge>
                  )}
                  {user.isActive && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}