import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shield } from 'lucide-react';

// Tipos para el sistema de permisos
export interface Permission {
  id: string;
  name: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete';
}

// Estructura para almacenar permisos por rol
export interface RolePermissions {
  [role: string]: Permission[];
}

// Interfaz del contexto
interface RolePermissionsContextType {
  permissions: RolePermissions;
  hasPermission: (role: string, module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  updatePermissions: (role: string, updatedPermissions: Permission[]) => void;
  loading: boolean;
}

// Creación del contexto
const RolePermissionsContext = createContext<RolePermissionsContextType | undefined>(undefined);

// Hook personalizado para utilizar el contexto
export function useRolePermissions() {
  const context = useContext(RolePermissionsContext);
  if (context === undefined) {
    throw new Error('useRolePermissions debe ser usado dentro de un RolePermissionsProvider');
  }
  return context;
}

// Permisos predeterminados
const defaultPermissions: RolePermissions = {
  admin: [
    // Usuarios
    { id: 'users-view', name: 'Ver usuarios', module: 'users', action: 'view' },
    { id: 'users-create', name: 'Crear usuarios', module: 'users', action: 'create' },
    { id: 'users-edit', name: 'Editar usuarios', module: 'users', action: 'edit' },
    { id: 'users-delete', name: 'Eliminar usuarios', module: 'users', action: 'delete' },
    
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    { id: 'parks-create', name: 'Crear parques', module: 'parks', action: 'create' },
    { id: 'parks-edit', name: 'Editar parques', module: 'parks', action: 'edit' },
    { id: 'parks-delete', name: 'Eliminar parques', module: 'parks', action: 'delete' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    { id: 'activities-create', name: 'Crear actividades', module: 'activities', action: 'create' },
    { id: 'activities-edit', name: 'Editar actividades', module: 'activities', action: 'edit' },
    { id: 'activities-delete', name: 'Eliminar actividades', module: 'activities', action: 'delete' },
    
    // Instructores
    { id: 'instructors-view', name: 'Ver instructores', module: 'instructors', action: 'view' },
    { id: 'instructors-create', name: 'Crear instructores', module: 'instructors', action: 'create' },
    { id: 'instructors-edit', name: 'Editar instructores', module: 'instructors', action: 'edit' },
    { id: 'instructors-delete', name: 'Eliminar instructores', module: 'instructors', action: 'delete' },
    
    // Voluntarios
    { id: 'volunteers-view', name: 'Ver voluntarios', module: 'volunteers', action: 'view' },
    { id: 'volunteers-create', name: 'Crear voluntarios', module: 'volunteers', action: 'create' },
    { id: 'volunteers-edit', name: 'Editar voluntarios', module: 'volunteers', action: 'edit' },
    { id: 'volunteers-delete', name: 'Eliminar voluntarios', module: 'volunteers', action: 'delete' },
    
    // Reportes
    { id: 'reports-view', name: 'Ver reportes', module: 'reports', action: 'view' },
    
    // Configuración
    { id: 'settings-view', name: 'Ver configuración', module: 'settings', action: 'view' },
    { id: 'settings-edit', name: 'Editar configuración', module: 'settings', action: 'edit' },
    
    // Permisos
    { id: 'permissions-view', name: 'Ver permisos', module: 'permissions', action: 'view' },
    { id: 'permissions-edit', name: 'Editar permisos', module: 'permissions', action: 'edit' },
  ],
  
  director: [
    // Usuarios
    { id: 'users-view', name: 'Ver usuarios', module: 'users', action: 'view' },
    { id: 'users-create', name: 'Crear usuarios', module: 'users', action: 'create' },
    { id: 'users-edit', name: 'Editar usuarios', module: 'users', action: 'edit' },
    
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    { id: 'parks-create', name: 'Crear parques', module: 'parks', action: 'create' },
    { id: 'parks-edit', name: 'Editar parques', module: 'parks', action: 'edit' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    { id: 'activities-create', name: 'Crear actividades', module: 'activities', action: 'create' },
    { id: 'activities-edit', name: 'Editar actividades', module: 'activities', action: 'edit' },
    
    // Instructores
    { id: 'instructors-view', name: 'Ver instructores', module: 'instructors', action: 'view' },
    { id: 'instructors-create', name: 'Crear instructores', module: 'instructors', action: 'create' },
    { id: 'instructors-edit', name: 'Editar instructores', module: 'instructors', action: 'edit' },
    
    // Voluntarios
    { id: 'volunteers-view', name: 'Ver voluntarios', module: 'volunteers', action: 'view' },
    { id: 'volunteers-create', name: 'Crear voluntarios', module: 'volunteers', action: 'create' },
    { id: 'volunteers-edit', name: 'Editar voluntarios', module: 'volunteers', action: 'edit' },
    
    // Reportes
    { id: 'reports-view', name: 'Ver reportes', module: 'reports', action: 'view' },
    
    // Configuración
    { id: 'settings-view', name: 'Ver configuración', module: 'settings', action: 'view' },
  ],
  
  manager: [
    // Usuarios
    { id: 'users-view', name: 'Ver usuarios', module: 'users', action: 'view' },
    
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    { id: 'parks-create', name: 'Crear parques', module: 'parks', action: 'create' },
    { id: 'parks-edit', name: 'Editar parques', module: 'parks', action: 'edit' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    { id: 'activities-create', name: 'Crear actividades', module: 'activities', action: 'create' },
    { id: 'activities-edit', name: 'Editar actividades', module: 'activities', action: 'edit' },
    { id: 'activities-delete', name: 'Eliminar actividades', module: 'activities', action: 'delete' },
    
    // Instructores
    { id: 'instructors-view', name: 'Ver instructores', module: 'instructors', action: 'view' },
    { id: 'instructors-create', name: 'Crear instructores', module: 'instructors', action: 'create' },
    { id: 'instructors-edit', name: 'Editar instructores', module: 'instructors', action: 'edit' },
    
    // Voluntarios
    { id: 'volunteers-view', name: 'Ver voluntarios', module: 'volunteers', action: 'view' },
    { id: 'volunteers-create', name: 'Crear voluntarios', module: 'volunteers', action: 'create' },
    { id: 'volunteers-edit', name: 'Editar voluntarios', module: 'volunteers', action: 'edit' },
    
    // Reportes
    { id: 'reports-view', name: 'Ver reportes', module: 'reports', action: 'view' },
  ],
  
  supervisor: [
    // Usuarios
    { id: 'users-view', name: 'Ver usuarios', module: 'users', action: 'view' },
    
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    { id: 'parks-edit', name: 'Editar parques', module: 'parks', action: 'edit' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    { id: 'activities-create', name: 'Crear actividades', module: 'activities', action: 'create' },
    { id: 'activities-edit', name: 'Editar actividades', module: 'activities', action: 'edit' },
    
    // Instructores
    { id: 'instructors-view', name: 'Ver instructores', module: 'instructors', action: 'view' },
    { id: 'instructors-edit', name: 'Editar instructores', module: 'instructors', action: 'edit' },
    
    // Voluntarios
    { id: 'volunteers-view', name: 'Ver voluntarios', module: 'volunteers', action: 'view' },
    { id: 'volunteers-edit', name: 'Editar voluntarios', module: 'volunteers', action: 'edit' },
    
    // Reportes
    { id: 'reports-view', name: 'Ver reportes', module: 'reports', action: 'view' },
  ],
  
  instructor: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    { id: 'activities-create', name: 'Crear actividades', module: 'activities', action: 'create' },
    { id: 'activities-edit', name: 'Editar actividades', module: 'activities', action: 'edit' },
    
    // Instructores
    { id: 'instructors-view', name: 'Ver instructores', module: 'instructors', action: 'view' },
    { id: 'instructors-edit', name: 'Editar perfil de instructor', module: 'instructors', action: 'edit' },
  ],
  
  voluntario: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
    
    // Voluntarios
    { id: 'volunteers-view', name: 'Ver voluntarios', module: 'volunteers', action: 'view' },
    { id: 'volunteers-edit', name: 'Editar perfil de voluntario', module: 'volunteers', action: 'edit' },
  ],
  
  ciudadano: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
  ],
  
  guardaparques: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    { id: 'parks-edit', name: 'Editar parques', module: 'parks', action: 'edit' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
  ],
  
  guardia: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
  ],
  
  concesionario: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
  ],
  
  user: [
    // Parques
    { id: 'parks-view', name: 'Ver parques', module: 'parks', action: 'view' },
    
    // Actividades
    { id: 'activities-view', name: 'Ver actividades', module: 'activities', action: 'view' },
  ],
};

// Proveedor del contexto
export const RolePermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<RolePermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);

  // Función para verificar si un rol tiene un permiso específico
  const hasPermission = (role: string, module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!permissions[role]) return false;
    
    return permissions[role].some(
      (permission) => permission.module === module && permission.action === action
    );
  };

  // Función para actualizar los permisos de un rol
  const updatePermissions = (role: string, updatedPermissions: Permission[]) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: updatedPermissions,
    }));
  };

  // Efecto para cargar los permisos desde la API o localStorage
  useEffect(() => {
    // Aquí se podría realizar una llamada a la API para obtener los permisos actualizados
    // Por ahora usamos un timeout para simular la carga
    const timer = setTimeout(() => {
      // Intentamos cargar los permisos desde localStorage
      const savedPermissions = localStorage.getItem('rolePermissions');
      
      if (savedPermissions) {
        try {
          const parsedPermissions = JSON.parse(savedPermissions);
          setPermissions(parsedPermissions);
        } catch (error) {
          console.error('Error al parsear los permisos guardados:', error);
          // Si hay un error, usamos los permisos predeterminados
          setPermissions(defaultPermissions);
        }
      }
      
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para guardar los permisos en localStorage cuando cambien
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('rolePermissions', JSON.stringify(permissions));
    }
  }, [permissions, loading]);

  return (
    <RolePermissionsContext.Provider
      value={{
        permissions,
        hasPermission,
        updatePermissions,
        loading
      }}
    >
      {children}
    </RolePermissionsContext.Provider>
  );
};

// Componente de protección para rutas o elementos basados en permisos
export const PermissionGuard: React.FC<{
  children: ReactNode;
  requiredPermission: {
    module: string;
    action: 'view' | 'create' | 'edit' | 'delete';
  };
  userRole: string;
  fallback?: ReactNode;
}> = ({ children, requiredPermission, userRole, fallback }) => {
  const { hasPermission, loading } = useRolePermissions();

  if (loading) {
    return <div className="animate-pulse">Cargando permisos...</div>;
  }

  if (
    hasPermission(
      userRole,
      requiredPermission.module,
      requiredPermission.action
    )
  ) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center p-4 space-x-2 bg-yellow-50 text-yellow-800 rounded-md">
      <Shield className="h-5 w-5" />
      <span>No tienes permisos para realizar esta acción.</span>
    </div>
  );
};