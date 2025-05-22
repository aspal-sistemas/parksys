import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mapeo de roles a colores de avatar y letras iniciales
const roleAvatarConfig: Record<string, { bgColor: string, textColor: string }> = {
  admin: { bgColor: 'bg-red-500', textColor: 'text-white' },
  director: { bgColor: 'bg-purple-500', textColor: 'text-white' },
  manager: { bgColor: 'bg-blue-500', textColor: 'text-white' },
  supervisor: { bgColor: 'bg-teal-500', textColor: 'text-white' },
  instructor: { bgColor: 'bg-green-500', textColor: 'text-white' },
  volunteer: { bgColor: 'bg-yellow-500', textColor: 'text-black' },
  citizen: { bgColor: 'bg-orange-500', textColor: 'text-white' },
  user: { bgColor: 'bg-gray-500', textColor: 'text-white' },
};

// Imágenes aleatorias para cada rol (simuladas)
const randomProfileImages: Record<string, string[]> = {
  admin: [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
  ],
  director: [
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
  ],
  manager: [
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
  ],
  supervisor: [
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
  ],
  instructor: [
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
  ],
  volunteer: [
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
  ],
  citizen: [
    'https://i.pravatar.cc/150?img=13',
    'https://i.pravatar.cc/150?img=14',
  ],
  user: [
    'https://i.pravatar.cc/150?img=15',
    'https://i.pravatar.cc/150?img=16',
  ],
};

// Función para obtener una imagen aleatoria basada en el ID del usuario y su rol
const getRandomAvatarUrl = (userId: number, role: string): string => {
  // Si el rol no existe en el mapeo, usar 'user' como fallback
  const avatarSet = randomProfileImages[role] || randomProfileImages.user;
  
  // Usar el ID del usuario como semilla para hacer consistente la selección
  const index = userId % avatarSet.length;
  
  return avatarSet[index];
};

// Obtener iniciales del nombre
const getInitials = (fullName: string): string => {
  if (!fullName) return '??';
  
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface UserAvatarProps {
  userId: number;
  role?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  role = 'user', 
  name = '',
  className = '',
  size = 'md',
  imageUrl
}) => {
  // Determinar el tamaño del avatar
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-lg',
  }[size];
  
  // Generar la URL del avatar basada en el usuario
  const avatarUrl = imageUrl || getRandomAvatarUrl(userId, role);
  
  // Configuración visual basada en el rol
  const avatarConfig = roleAvatarConfig[role] || roleAvatarConfig.user;
  
  return (
    <Avatar className={`${sizeClass} ${className}`}>
      <AvatarImage src={avatarUrl} alt={name || `Usuario ${userId}`} />
      <AvatarFallback className={`${avatarConfig.bgColor} ${avatarConfig.textColor}`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;