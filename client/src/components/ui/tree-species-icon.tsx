import React from 'react';
import { Trees, Leaf, TreePine, Sprout, Flower, FlowerIcon } from 'lucide-react';

interface TreeSpeciesIconProps {
  name?: string;
  customIconUrl?: string | null;
  iconType?: 'system' | 'custom';
  size?: number;
  className?: string;
}

const TreeSpeciesIcon: React.FC<TreeSpeciesIconProps> = ({ 
  name = 'tree', 
  customIconUrl, 
  iconType = 'system',
  size = 20,
  className = '' 
}) => {
  // Si es un icono personalizado y tenemos la URL, mostrar la imagen
  if (iconType === 'custom' && customIconUrl) {
    return (
      <img 
        src={customIconUrl} 
        alt={name}
        width={size}
        height={size}
        className={`${className} object-contain`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // Para iconos de sistema, usar las clases de Tailwind apropiadas
  const iconClass = className || `h-${Math.ceil(size/4)} w-${Math.ceil(size/4)}`;
  
  const iconMap: Record<string, React.ReactNode> = {
    // Tipos de árboles comunes
    tree: <Trees className={iconClass} />,
    trees: <Trees className={iconClass} />,
    oak: <Trees className={iconClass} />,
    pine: <TreePine className={iconClass} />,
    evergreen: <TreePine className={iconClass} />,
    conifer: <TreePine className={iconClass} />,
    
    // Plantas y arbustos
    leaf: <Leaf className={iconClass} />,
    shrub: <Leaf className={iconClass} />,
    bush: <Leaf className={iconClass} />,
    sprout: <Sprout className={iconClass} />,
    seedling: <Sprout className={iconClass} />,
    
    // Árboles frutales y decorativos
    fruit: <Flower className={iconClass} />,
    flowering: <FlowerIcon className={iconClass} />,
    ornamental: <FlowerIcon className={iconClass} />,
    
    // Familias de árboles
    deciduous: <Trees className={iconClass} />,
    broadleaf: <Leaf className={iconClass} />,
    palm: <Trees className={iconClass} />,
    
    // Categorías por uso
    shade: <Trees className={iconClass} />,
    windbreak: <TreePine className={iconClass} />,
    street: <Trees className={iconClass} />,
    
    // Default fallback
    default: <Trees className={iconClass} />
  };
  
  // Buscar por nombre de especie común
  const lowerName = name.toLowerCase();
  
  // Mapeo inteligente basado en palabras clave
  let iconKey = 'default';
  
  if (lowerName.includes('pino') || lowerName.includes('pine') || lowerName.includes('abeto') || lowerName.includes('cedro')) {
    iconKey = 'pine';
  } else if (lowerName.includes('roble') || lowerName.includes('oak') || lowerName.includes('encino')) {
    iconKey = 'oak';
  } else if (lowerName.includes('palma') || lowerName.includes('palm')) {
    iconKey = 'palm';
  } else if (lowerName.includes('flor') || lowerName.includes('flower') || lowerName.includes('jacaranda') || lowerName.includes('bugambilia')) {
    iconKey = 'flowering';
  } else if (lowerName.includes('hoja') || lowerName.includes('leaf') || lowerName.includes('laurel')) {
    iconKey = 'leaf';
  } else if (lowerName.includes('frut') || lowerName.includes('fruit') || lowerName.includes('mango') || lowerName.includes('aguacate')) {
    iconKey = 'fruit';
  } else if (lowerName.includes('arbusto') || lowerName.includes('shrub')) {
    iconKey = 'shrub';
  } else {
    iconKey = 'tree';
  }
  
  return <>{iconMap[iconKey] || iconMap.default}</>;
};

export default TreeSpeciesIcon;