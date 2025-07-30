import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  fullName: string;
  email: string;
}

interface UserPermissions {
  [key: string]: boolean;
}

export const usePermissions = () => {
  const [user, setUser] = useState<User | null>(null);

  // Obtener usuario del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  // Obtener permisos del usuario actual
  const { data: userPermissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ['/api/user-permissions'],
    enabled: !!user?.role,
    staleTime: 5 * 60 * 1000, // Cache 5 minutos
  });

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (module: string, action: 'view' | 'edit' = 'view', submodule?: string): boolean => {
    if (!user || !userPermissions) return false;

    // Super admin y admin tienen todos los permisos
    if (user.role === 'super_admin' || user.role === 'admin') {
      return true;
    }

    const permissionKey = submodule 
      ? `${module}.${submodule}.${action}` 
      : `${module}.${action}`;

    return userPermissions[permissionKey] || false;
  };

  // Función para verificar si tiene acceso a cualquier acción en un módulo
  const hasAnyPermission = (module: string, submodule?: string): boolean => {
    return hasPermission(module, 'view', submodule) || hasPermission(module, 'edit', submodule);
  };

  // Función para verificar múltiples permisos
  const hasAllPermissions = (permissions: Array<{module: string, action?: 'view' | 'edit', submodule?: string}>): boolean => {
    return permissions.every(p => hasPermission(p.module, p.action || 'view', p.submodule));
  };

  // Función para verificar si puede editar (implica que también puede ver)
  const canEdit = (module: string, submodule?: string): boolean => {
    return hasPermission(module, 'edit', submodule);
  };

  // Función para verificar si puede solo ver (read-only)
  const canView = (module: string, submodule?: string): boolean => {
    return hasPermission(module, 'view', submodule);
  };

  // Función para obtener el nivel de acceso
  const getAccessLevel = (module: string, submodule?: string): 'none' | 'view' | 'edit' => {
    if (canEdit(module, submodule)) return 'edit';
    if (canView(module, submodule)) return 'view';
    return 'none';
  };

  return {
    user,
    userPermissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEdit,
    canView,
    getAccessLevel,
    isAdmin: user?.role === 'super_admin' || user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isOperator: user?.role === 'operator'
  };
};

export default usePermissions;