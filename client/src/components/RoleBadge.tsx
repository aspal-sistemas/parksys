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

// Sistema de 7 roles jerárquicos sincronizado con BD
export const SYSTEM_ROLES: Role[] = [
  {
    id: '1', // Super Administrador
    name: 'super-admin',
    displayName: 'Super Administrador',
    level: 1,
    description: 'Acceso total al sistema',
    color: 'bg-blue-100 text-blue-800', // Color unificado estilo actual
    icon: Crown
  },
  {
    id: '2', // Administrador General
    name: 'admin-general',
    displayName: 'Administrador General',
    level: 2,
    description: 'Administrador general del sistema',
    color: 'bg-blue-100 text-blue-800',
    icon: Star
  },
  {
    id: '3', // Coordinador de Parques
    name: 'coordinador-parques',
    displayName: 'Coordinador de Parques',
    level: 3,
    description: 'Coordinador de parques urbanos',
    color: 'bg-blue-100 text-blue-800',
    icon: Gem
  },
  {
    id: '4', // Supervisor de Operaciones
    name: 'supervisor-operaciones',
    displayName: 'Supervisor de Operaciones',
    level: 4,
    description: 'Supervisor de operaciones de campo',
    color: 'bg-blue-100 text-blue-800',
    icon: Zap
  },
  {
    id: '5', // Técnico Especialista
    name: 'tecnico-especialista',
    displayName: 'Técnico Especialista',
    level: 5,
    description: 'Técnico especialista en áreas',
    color: 'bg-blue-100 text-blue-800',
    icon: BarChart
  },
  {
    id: '6', // Operador de Campo
    name: 'operador-campo',
    displayName: 'Operador de Campo',
    level: 6,
    description: 'Operador de campo',
    color: 'bg-blue-100 text-blue-800',
    icon: Award
  },
  {
    id: '7', // Consultor Auditor
    name: 'consultor-auditor',
    displayName: 'Consultor Auditor',
    level: 7,
    description: 'Consultor auditor externo',
    color: 'bg-blue-100 text-blue-800',
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
  const role = SYSTEM_ROLES.find(r => r.id === roleId || r.id === String(roleId));
  
  if (!role) {
    return (
      <Badge variant="outline" className={cn("bg-gray-100 text-gray-800 hover:bg-gray-100", className)}>
        <Users className={cn("mr-1", size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
        {showText && "Rol desconocido"}
      </Badge>
    );
  }

  const Icon = role.icon;
  
  // Para solo icono (tabla limpia)
  if (!showText) {
    return (
      <div className={cn(
        "inline-flex items-center justify-center rounded",
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

  return (
    <Badge 
      className={cn(
        sizeClasses[size],
        role.color,
        "hover:bg-blue-100 font-medium flex items-center gap-1 transition-colors",
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{role.displayName}</span>
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

// Componente helper para mostrar badge con icono + texto separado
export const RoleBadgeWithText: React.FC<{
  roleId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ roleId, size = 'md', className }) => {
  const role = SYSTEM_ROLES.find(r => r.id === roleId);
  
  if (!role) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="text-gray-500">
          <Users className="w-3 h-3" />
        </Badge>
        <span className="text-sm text-gray-500">Rol desconocido</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RoleBadge roleId={roleId} showText={false} size={size} />
      <span className={cn(
        "font-medium",
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      )}>
        {role.displayName}
      </span>
    </div>
  );
};

export default RoleBadge;