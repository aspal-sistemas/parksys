import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Star, Gem, Zap, Award, Shield, 
  Eye, Settings, Users 
} from 'lucide-react';

interface RoleBadgeProps {
  role: {
    id: string;
    name?: string;
    displayName: string;
    level?: number;
    badge?: {
      color: string;
      textColor?: string;
      icon?: React.ReactNode;
    };
  };
  size?: 'sm' | 'default' | 'lg';
  showLevel?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

// Mapeo de iconos por defecto según el tipo de rol
const getDefaultIcon = (roleId: string, roleName: string) => {
  const id = roleId.toLowerCase();
  const name = roleName.toLowerCase();
  
  if (id.includes('super') || name.includes('super')) return <Crown className="w-3 h-3" />;
  if (id.includes('director') || name.includes('director')) return <Star className="w-3 h-3" />;
  if (id.includes('coordinador') || name.includes('coordinador')) return <Gem className="w-3 h-3" />;
  if (id.includes('operador') || name.includes('operador')) return <Award className="w-3 h-3" />;
  if (id.includes('admin') || name.includes('admin')) return <Settings className="w-3 h-3" />;
  if (id.includes('consultor') || name.includes('consultor')) return <Eye className="w-3 h-3" />;
  return <Shield className="w-3 h-3" />;
};

// Mapeo de colores por defecto según el nivel
const getDefaultColor = (level: number = 1) => {
  if (level >= 10) return 'bg-red-500';
  if (level >= 9) return 'bg-purple-500';
  if (level >= 8) return 'bg-blue-500';
  if (level >= 7) return 'bg-green-500';
  if (level >= 6) return 'bg-yellow-500';
  if (level >= 4) return 'bg-orange-500';
  if (level >= 2) return 'bg-teal-500';
  return 'bg-gray-500';
};

export function RoleBadge({ 
  role, 
  size = 'default', 
  showLevel = false,
  variant = 'default'
}: RoleBadgeProps) {
  // Determinar icono
  const icon = role.badge?.icon || getDefaultIcon(role.id, role.displayName);
  
  // Determinar color
  const backgroundColor = role.badge?.color || getDefaultColor(role.level);
  const textColor = role.badge?.textColor || 'text-white';
  
  // Determinar tamaño
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  // Para badges personalizados con colores
  if (variant === 'default' && role.badge?.color) {
    return (
      <div className={`inline-flex items-center gap-1 rounded-lg ${backgroundColor} ${textColor} ${sizeClasses[size]}`}>
        {icon}
        <span className="font-medium">{role.displayName}</span>
        {showLevel && role.level && (
          <span className="text-xs opacity-75">Nv.{role.level}</span>
        )}
      </div>
    );
  }

  // Para badges estándar usando el componente Badge
  return (
    <Badge variant={variant} className={`${sizeClasses[size]} gap-1`}>
      {icon}
      <span>{role.displayName}</span>
      {showLevel && role.level && (
        <span className="text-xs opacity-75">Nv.{role.level}</span>
      )}
    </Badge>
  );
}

// Variante simplificada para mostrar solo el nivel
export function LevelBadge({ level }: { level: number }) {
  const color = getDefaultColor(level);
  
  return (
    <Badge variant="outline" className={`text-xs ${color.replace('bg-', 'text-')} border-current`}>
      Nivel {level}
    </Badge>
  );
}

// Variante para mostrar múltiples roles
export function MultipleRolesBadge({ roles }: { roles: RoleBadgeProps['role'][] }) {
  if (roles.length === 0) {
    return (
      <Badge variant="outline" className="text-gray-500">
        Sin roles
      </Badge>
    );
  }

  if (roles.length === 1) {
    return <RoleBadge role={roles[0]} />;
  }

  const highestRole = roles.reduce((prev, current) => 
    (current.level || 0) > (prev.level || 0) ? current : prev
  );

  return (
    <div className="flex items-center gap-1">
      <RoleBadge role={highestRole} size="sm" />
      {roles.length > 1 && (
        <Badge variant="outline" className="text-xs">
          +{roles.length - 1}
        </Badge>
      )}
    </div>
  );
}