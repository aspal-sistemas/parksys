import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Star, Gem, Zap, Award, BarChart, Eye,
  Shield, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Definición de roles jerárquicos - Sistema integrado
export interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
}

// Sistema de 7 roles jerárquicos sincronizado
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'super-admin',
    name: 'super-admin',
    displayName: 'Super Admin',
    level: 10,
    description: 'Acceso total al sistema',
    color: 'bg-red-500',
    icon: Crown
  },
  {
    id: 'director-general',
    name: 'director-general',
    displayName: 'Director General',
    level: 9,
    description: 'Director general del sistema',
    color: 'bg-purple-500',
    icon: Star
  },
  {
    id: 'coordinador-parques',
    name: 'coordinador-parques',
    displayName: 'Coord. Parques',
    level: 8,
    description: 'Coordinador de parques urbanos',
    color: 'bg-green-500',
    icon: Gem
  },
  {
    id: 'coordinador-actividades',
    name: 'coordinador-actividades',
    displayName: 'Coord. Actividades',
    level: 7,
    description: 'Coordinador de actividades',
    color: 'bg-blue-500',
    icon: Zap
  },
  {
    id: 'admin-financiero',
    name: 'admin-financiero',
    displayName: 'Admin Financiero',
    level: 6,
    description: 'Administrador financiero',
    color: 'bg-yellow-500',
    icon: BarChart
  },
  {
    id: 'operador-parque',
    name: 'operador-parque',
    displayName: 'Operador',
    level: 4,
    description: 'Operador de parque',
    color: 'bg-orange-500',
    icon: Award
  },
  {
    id: 'consultor-auditor',
    name: 'consultor-auditor',
    displayName: 'Consultor',
    level: 1,
    description: 'Consultor auditor externo',
    color: 'bg-gray-500',
    icon: Eye
  }
];

interface RoleBadgeProps {
  roleId: string;
  showLevel?: boolean;
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  roleId,
  showLevel = false,
  showIcon = true,
  showText = true,
  size = 'md',
  variant = 'default',
  className
}) => {
  const role = SYSTEM_ROLES.find(r => r.id === roleId);
  
  if (!role) {
    return (
      <Badge variant="outline" className={cn("text-gray-500", className)}>
        <Users className="w-3 h-3 mr-1" />
        {showText && "Rol desconocido"}
      </Badge>
    );
  }

  const Icon = role.icon;
  
  // Para solo icono (tabla limpia)
  if (!showText) {
    return (
      <div className={cn(
        "inline-flex items-center justify-center rounded text-white",
        role.color,
        size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8',
        className
      )}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      </div>
    );
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const badgeColor = variant === 'default' 
    ? `${role.color} text-white hover:${role.color}/80` 
    : variant === 'outline'
    ? `border-2 border-current text-${role.color.replace('bg-', '')}-600`
    : '';

  return (
    <Badge 
      variant={variant}
      className={cn(
        sizeClasses[size],
        badgeColor,
        "font-medium flex items-center gap-1 transition-colors",
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{role.name.toUpperCase()}</span>
      {showLevel && (
        <span className="ml-1 text-xs opacity-80">
          (N{role.level})
        </span>
      )}
    </Badge>
  );
};

// Hook para obtener rol por ID
export const useRole = (roleId: string) => {
  return SYSTEM_ROLES.find(r => r.id === roleId);
};

// Función para verificar jerarquía de roles
export const hasRoleLevel = (userRoleId: string, requiredLevel: number): boolean => {
  const userRole = SYSTEM_ROLES.find(r => r.id === userRoleId);
  return userRole ? userRole.level >= requiredLevel : false;
};

// Función para verificar si un rol es superior a otro
export const isRoleHigherThan = (roleId1: string, roleId2: string): boolean => {
  const role1 = SYSTEM_ROLES.find(r => r.id === roleId1);
  const role2 = SYSTEM_ROLES.find(r => r.id === roleId2);
  
  if (!role1 || !role2) return false;
  return role1.level > role2.level;
};

export default RoleBadge;