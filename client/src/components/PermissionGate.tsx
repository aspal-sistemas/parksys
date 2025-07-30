import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface PermissionGateProps {
  module: string;
  action?: 'view' | 'edit';
  submodule?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  requireAll?: boolean;
  permissions?: Array<{module: string, action?: 'view' | 'edit', submodule?: string}>;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  module,
  action = 'view',
  submodule,
  children,
  fallback,
  showFallback = true,
  requireAll = false,
  permissions
}) => {
  const { hasPermission, hasAllPermissions, isLoading, user } = usePermissions();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  let hasAccess = false;

  if (permissions && requireAll) {
    // Verificar múltiples permisos (requiere todos)
    hasAccess = hasAllPermissions(permissions);
  } else if (permissions) {
    // Verificar múltiples permisos (requiere al menos uno)
    hasAccess = permissions.some(p => hasPermission(p.module, p.action || 'view', p.submodule));
  } else {
    // Verificar permiso individual
    hasAccess = hasPermission(module, action, submodule);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showFallback) {
    return null;
  }

  // Fallback por defecto
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-orange-700">
          <Lock className="w-5 h-5" />
          <div>
            <h4 className="font-semibold">Acceso Restringido</h4>
            <p className="text-sm text-orange-600 mt-1">
              Tu rol ({user?.role}) no tiene permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar información de solo lectura
export const ReadOnlyGate: React.FC<{
  module: string;
  submodule?: string;
  children: React.ReactNode;
}> = ({ module, submodule, children }) => {
  const { canEdit, canView } = usePermissions();

  if (!canView(module, submodule)) {
    return (
      <PermissionGate module={module} action="view" submodule={submodule}>
        {children}
      </PermissionGate>
    );
  }

  if (!canEdit(module, submodule)) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-75">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
            <Shield className="w-3 h-3" />
            Solo lectura
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGate;