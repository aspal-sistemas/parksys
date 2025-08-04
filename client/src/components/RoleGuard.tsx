import React from 'react';
import { SYSTEM_ROLES, hasRoleLevel } from './RoleBadge';

// Definición de módulos y permisos del sistema
export const SYSTEM_MODULES = [
  'Configuración',
  'Gestión', 
  'Operaciones',
  'Finanzas',
  'Marketing',
  'RH',
  'Seguridad'
] as const;

export type SystemModule = typeof SYSTEM_MODULES[number];
export type PermissionType = 'read' | 'write' | 'admin';

// Matriz de permisos por defecto basada en jerarquía
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<SystemModule, PermissionType[]>> = {
  'super-admin': {
    'Configuración': ['read', 'write', 'admin'],
    'Gestión': ['read', 'write', 'admin'],
    'Operaciones': ['read', 'write', 'admin'],
    'Finanzas': ['read', 'write', 'admin'],
    'Marketing': ['read', 'write', 'admin'],
    'RH': ['read', 'write', 'admin'],
    'Seguridad': ['read', 'write', 'admin']
  },
  'director-general': {
    'Configuración': ['read', 'write'],
    'Gestión': ['read', 'write', 'admin'],
    'Operaciones': ['read', 'write', 'admin'],
    'Finanzas': ['read', 'write', 'admin'],
    'Marketing': ['read', 'write', 'admin'],
    'RH': ['read', 'write', 'admin'],
    'Seguridad': ['read', 'write']
  },
  'coordinador-parques': {
    'Configuración': ['read'],
    'Gestión': ['read', 'write', 'admin'],
    'Operaciones': ['read', 'write', 'admin'],
    'Finanzas': ['read'],
    'Marketing': ['read', 'write'],
    'RH': ['read'],
    'Seguridad': ['read']
  },
  'coordinador-actividades': {
    'Configuración': ['read'],
    'Gestión': ['read', 'write'],
    'Operaciones': ['read', 'write'],
    'Finanzas': ['read'],
    'Marketing': ['read', 'write', 'admin'],
    'RH': ['read'],
    'Seguridad': ['read']
  },
  'admin-financiero': {
    'Configuración': ['read'],
    'Gestión': ['read'],
    'Operaciones': ['read'],
    'Finanzas': ['read', 'write', 'admin'],
    'Marketing': ['read'],
    'RH': ['read', 'write'],
    'Seguridad': ['read']
  },
  'operador-parque': {
    'Configuración': [],
    'Gestión': ['read'],
    'Operaciones': ['read', 'write'],
    'Finanzas': [],
    'Marketing': ['read'],
    'RH': [],
    'Seguridad': []
  },
  'consultor-auditor': {
    'Configuración': ['read'],
    'Gestión': ['read'],
    'Operaciones': ['read'],
    'Finanzas': ['read'],
    'Marketing': ['read'],
    'RH': ['read'],
    'Seguridad': ['read']
  }
};

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredLevel?: number;
  requiredModule?: SystemModule;
  requiredPermission?: PermissionType;
  fallback?: React.ReactNode;
  userRole?: string; // En producción vendría del contexto de auth
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredLevel,
  requiredModule,
  requiredPermission = 'read',
  fallback = null,
  userRole = 'super-admin' // Default para desarrollo
}) => {
  // Verificar rol específico
  if (requiredRole && userRole !== requiredRole) {
    return <>{fallback}</>;
  }

  // Verificar nivel jerárquico
  if (requiredLevel && !hasRoleLevel(userRole, requiredLevel)) {
    return <>{fallback}</>;
  }

  // Verificar permisos de módulo
  if (requiredModule && requiredPermission) {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) {
      return <>{fallback}</>;
    }

    const modulePermissions = rolePermissions[requiredModule];
    if (!modulePermissions || !modulePermissions.includes(requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Hook para verificar permisos
export const usePermissions = (userRole: string = 'super-admin') => {
  const hasPermission = (module: SystemModule, permission: PermissionType): boolean => {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return false;
    
    const modulePermissions = rolePermissions[module];
    return modulePermissions ? modulePermissions.includes(permission) : false;
  };

  const hasModuleAccess = (module: SystemModule): boolean => {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return false;
    
    const modulePermissions = rolePermissions[module];
    return modulePermissions ? modulePermissions.length > 0 : false;
  };

  const canRead = (module: SystemModule) => hasPermission(module, 'read');
  const canWrite = (module: SystemModule) => hasPermission(module, 'write');
  const canAdmin = (module: SystemModule) => hasPermission(module, 'admin');

  return {
    hasPermission,
    hasModuleAccess,
    canRead,
    canWrite,
    canAdmin,
    userRole,
    roleLevel: SYSTEM_ROLES.find(r => r.id === userRole)?.level || 0
  };
};

export default RoleGuard;