import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredLevel?: number;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

interface UserRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

interface CurrentUser {
  id: number;
  roles: UserRole[];
}

// Componente para proteger rutas basado en roles y permisos
export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredLevel, 
  requiredPermission,
  fallback 
}: RoleGuardProps) {
  // Query para obtener usuario actual (simulado)
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ['/api/current-user'],
    enabled: false // Deshabilitado para desarrollo
  });

  // Usuario simulado para desarrollo
  const mockUser: CurrentUser = {
    id: 1,
    roles: [
      {
        id: 'super-admin',
        name: 'Super Administrador',
        level: 10,
        permissions: ['*'] // Todos los permisos
      }
    ]
  };

  const user = currentUser || mockUser;

  // Verificar si el usuario tiene el rol requerido
  const hasRequiredRole = (role: string): boolean => {
    return user.roles.some(userRole => userRole.name === role || userRole.id === role);
  };

  // Verificar si el usuario tiene el nivel requerido
  const hasRequiredLevel = (level: number): boolean => {
    return user.roles.some(userRole => userRole.level >= level);
  };

  // Verificar si el usuario tiene el permiso requerido
  const hasRequiredPermission = (permission: string): boolean => {
    return user.roles.some(userRole => 
      userRole.permissions.includes('*') || 
      userRole.permissions.includes(permission)
    );
  };

  // Verificar acceso
  let hasAccess = true;

  if (requiredRole && !hasRequiredRole(requiredRole)) {
    hasAccess = false;
  }

  if (requiredLevel && !hasRequiredLevel(requiredLevel)) {
    hasAccess = false;
  }

  if (requiredPermission && !hasRequiredPermission(requiredPermission)) {
    hasAccess = false;
  }

  // Mostrar contenido o fallback
  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-gray-600 mb-4">
                No tienes permisos suficientes para acceder a esta sección.
              </p>
              <div className="text-sm text-gray-500">
                {requiredRole && <p>Rol requerido: {requiredRole}</p>}
                {requiredLevel && <p>Nivel requerido: {requiredLevel}+</p>}
                {requiredPermission && <p>Permiso requerido: {requiredPermission}</p>}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

// Hook para verificar permisos
export function usePermissions() {
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ['/api/current-user'],
    enabled: false
  });

  // Usuario simulado
  const mockUser: CurrentUser = {
    id: 1,
    roles: [
      {
        id: 'super-admin',
        name: 'Super Administrador',
        level: 10,
        permissions: ['*']
      }
    ]
  };

  const user = currentUser || mockUser;

  const hasRole = (role: string): boolean => {
    return user.roles.some(userRole => userRole.name === role || userRole.id === role);
  };

  const hasLevel = (level: number): boolean => {
    return user.roles.some(userRole => userRole.level >= level);
  };

  const hasPermission = (permission: string): boolean => {
    return user.roles.some(userRole => 
      userRole.permissions.includes('*') || 
      userRole.permissions.includes(permission)
    );
  };

  const getUserRoles = (): UserRole[] => {
    return user.roles;
  };

  const getHighestLevel = (): number => {
    return Math.max(...user.roles.map(role => role.level));
  };

  return {
    hasRole,
    hasLevel,
    hasPermission,
    getUserRoles,
    getHighestLevel,
    currentUser: user
  };
}