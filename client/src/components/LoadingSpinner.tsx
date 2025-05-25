import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-t-2 border-muted-foreground/20 border-r-2 border-b-2 border-transparent", 
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
};