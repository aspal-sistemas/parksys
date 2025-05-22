import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserAvatar from './UserAvatar';

interface UserProfileImageProps {
  userId: number;
  role?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const UserProfileImage: React.FC<UserProfileImageProps> = ({ 
  userId, 
  role = 'user', 
  name = '', 
  className = '',
  size = 'md'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Configurar el tamaño del avatar
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  }[size];

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Primero verificamos si tenemos la imagen guardada en localStorage
      const localStorageKey = `profile_image_${userId}`;
      const localImageUrl = localStorage.getItem(localStorageKey);
      
      // Casos especiales para usuarios problemáticos (compatibilidad con versiones anteriores)
      if (userId === 3) {
        const adminGuadalajaraImage = localStorage.getItem('admin_guadalajara_image');
        if (adminGuadalajaraImage) {
          setImageUrl(adminGuadalajaraImage);
          setLoading(false);
          return;
        }
      }
      
      if (userId === 1) {
        const adminGearImage = localStorage.getItem('admin_gear_image');
        if (adminGearImage) {
          setImageUrl(adminGearImage);
          setLoading(false);
          return;
        }
      }
      
      // Si encontramos una imagen en localStorage, la usamos
      if (localImageUrl) {
        console.log(`Usando imagen desde localStorage para usuario ${userId}`);
        setImageUrl(localImageUrl);
        setLoading(false);
        return;
      }

      // Si no hay imagen en localStorage, intentamos obtenerla del servidor
      try {
        const response = await fetch(`/api/users/${userId}/profile-image`);
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
          
          // Guardamos también en localStorage como respaldo
          localStorage.setItem(localStorageKey, data.imageUrl);
        } else {
          // Si no hay imagen en la caché, usamos el avatar generado
          setError(true);
        }
      } catch (err) {
        console.error('Error al obtener la imagen de perfil:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImage();
  }, [userId]);

  if (loading) {
    return (
      <Avatar className={`${sizeClass} ${className}`}>
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    );
  }

  if (error || !imageUrl) {
    // Usar el avatar generado como fallback
    return <UserAvatar userId={userId} role={role} name={name} className={className} size={size} />;
  }

  return (
    <Avatar className={`${sizeClass} ${className}`}>
      <AvatarImage src={imageUrl} alt={name || `Usuario ${userId}`} />
      <AvatarFallback>
        <UserAvatar userId={userId} role={role} name={name} className={className} size={size} />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserProfileImage;