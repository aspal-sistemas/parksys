import React from 'react';
import {
  Bike,
  Trees,
  Theater,
  Utensils,
  Dumbbell,
  Droplets,
  Dog,
  Car,
  Lightbulb,
  Shield,
  Wifi,
  Footprints,
  CircleUser, 
  Waves,
  PenTool,
  Accessibility,
  BatteryCharging,
  Move,
  Info,
  Bath,
  Gamepad2,
  Circle,
  Image as ImageIcon 
} from 'lucide-react';

interface AmenityIconProps {
  name: string;
  size?: number;
  className?: string;
  iconType?: 'system' | 'custom';
  customIconUrl?: string | null;
}

const AmenityIcon: React.FC<AmenityIconProps> = ({ 
  name, 
  size = 64, 
  className = "",
  iconType = 'system',
  customIconUrl = null
}) => {
  const iconProps = {
    size,
    className: `amenity-icon ${className}`,
  };

  // Si es un icono personalizado y tiene URL, mostrar la imagen
  if (iconType === 'custom' && customIconUrl) {
    return (
      <div 
        className={`custom-icon ${className}`} 
        style={{ 
          width: size, 
          height: size,
          backgroundImage: `url(${customIconUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} 
      />
    );
  }

  // Si debería ser personalizado pero no tiene URL, mostrar un placeholder
  if (iconType === 'custom') {
    return <ImageIcon {...iconProps} />;
  }

  // Si es un icono del sistema, usar el switch para determinar el componente
  switch (name) {
    case 'playground':
      return <Gamepad2 {...iconProps} />;
    case 'toilet':
      return <Bath {...iconProps} />;
    case 'sportsCourt':
      return <Circle {...iconProps} />;
    case 'bicycle':
      return <Bike {...iconProps} />;
    case 'pets':
      return <Dog {...iconProps} />;
    case 'accessibility':
      return <Accessibility {...iconProps} />;
    case 'hiking':
      return <Footprints {...iconProps} />;
    case 'parking':
      return <Car {...iconProps} />;
    case 'restaurant':
      return <Utensils {...iconProps} />;
    case 'water':
      return <Droplets {...iconProps} />;
    case 'theater':
      return <Theater {...iconProps} />;
    case 'lightbulb':
      return <Lightbulb {...iconProps} />;
    case 'security':
      return <Shield {...iconProps} />;
    case 'wifi':
      return <Wifi {...iconProps} />;
    case 'bikeParking':
      return <BatteryCharging {...iconProps} />;
    case 'gym':
      return <Dumbbell {...iconProps} />;
    case 'running':
      return <Move {...iconProps} />;
    case 'basketball':
      return <CircleUser {...iconProps} />;
    case 'soccer':
      return <Circle {...iconProps} />;
    case 'tennis':
      return <Circle {...iconProps} />;
    case 'pool':
      return <Waves {...iconProps} />;
    case 'skate':
      return <PenTool {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

export default AmenityIcon;