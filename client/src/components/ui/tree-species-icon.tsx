import React from 'react';
import { TreePine, Leaf, Trees, Shrub, Flower } from 'lucide-react';

interface TreeSpeciesIconProps {
  iconType?: string;
  customIconUrl?: string;
  size?: number;
  className?: string;
}

const TreeSpeciesIcon: React.FC<TreeSpeciesIconProps> = ({ 
  iconType, 
  customIconUrl, 
  size = 32,
  className = "" 
}) => {
  // Si hay un icono personalizado, mostrar la imagen
  if (iconType === 'custom' && customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt="Icono de especie"
        width={size}
        height={size}
        className={`object-cover rounded ${className}`}
        onError={(e) => {
          // Si falla cargar la imagen personalizada, mostrar icono por defecto
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  // Iconos del sistema por defecto
  const iconProps = {
    size,
    className: `text-green-600 ${className}`,
  };

  // Usar diferentes iconos según el tipo o por defecto TreePine
  switch (iconType) {
    case 'leaf':
      return <Leaf {...iconProps} />;
    case 'trees':
      return <Trees {...iconProps} />;
    case 'shrub':
      return <Shrub {...iconProps} />;
    case 'flower':
      return <Flower {...iconProps} />;
    default:
      return <TreePine {...iconProps} />;
  }
};

export default TreeSpeciesIcon;