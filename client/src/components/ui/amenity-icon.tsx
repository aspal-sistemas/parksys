import React from 'react';
import { 
  Bike, 
  Dumbbell, 
  UmbrellaOff, 
  Warehouse, 
  Waves, 
  Trees, 
  Wifi, 
  LandPlot, 
  ParkingSquare, 
  UtensilsCrossed, 
  Theater, 
  Lightbulb, 
  ShieldCheck, 
  Dog, 
  Accessibility, 
  Footprints, 
  Baby, 
  Bath,
  PlayCircle,
  Droplets
} from 'lucide-react';

interface AmenityIconProps {
  name: string;
  customIconUrl?: string | null;
  iconType?: 'system' | 'custom';
  size?: number;
  className?: string;
}

const AmenityIcon: React.FC<AmenityIconProps> = ({ 
  name, 
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
    // Recreation
    playground: <PlayCircle className={iconClass} />,
    hiking: <Footprints className={iconClass} />,
    
    // Sports
    bicycle: <Bike className={iconClass} />,
    sportsCourt: <Dumbbell className={iconClass} />,
    
    // Services
    toilet: <Bath className={iconClass} />,
    security: <ShieldCheck className={iconClass} />,
    wifi: <Wifi className={iconClass} />,
    
    // Accessibility
    accessibility: <Accessibility className={iconClass} />,
    
    // Infrastructure
    parking: <ParkingSquare className={iconClass} />,
    bikeParking: <ParkingSquare className={iconClass} />,
    lightbulb: <Lightbulb className={iconClass} />,
    
    // Nature
    pets: <Dog className={iconClass} />,
    water: <Droplets className={iconClass} />,
    trees: <Trees className={iconClass} />,
    
    // Other common amenities
    restaurant: <UtensilsCrossed className={iconClass} />,
    theater: <Theater className={iconClass} />,
    
    // Default fallback
    default: <Trees className={iconClass} />
  };
  
  return <>{iconMap[name] || iconMap.default}</>;
};

export default AmenityIcon;
