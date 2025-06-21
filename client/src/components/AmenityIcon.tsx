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
  size = 96, 
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

  // Mapeo inteligente basado en el nombre de la amenidad (español e inglés)
  const lowerName = name.toLowerCase();
  
  // Juegos y áreas infantiles
  if (lowerName.includes('juego') || lowerName.includes('infantil') || lowerName.includes('niños') || 
      lowerName.includes('playground') || lowerName.includes('columpios')) {
    return <Gamepad2 {...iconProps} />;
  }
  
  // Baños y sanitarios
  if (lowerName.includes('baño') || lowerName.includes('sanitario') || lowerName.includes('toilet') ||
      lowerName.includes('wc') || lowerName.includes('restroom')) {
    return <Bath {...iconProps} />;
  }
  
  // Deportes y canchas
  if (lowerName.includes('cancha') || lowerName.includes('deporte') || lowerName.includes('futbol') ||
      lowerName.includes('basquet') || lowerName.includes('tenis') || lowerName.includes('voley') ||
      lowerName.includes('sport') || lowerName.includes('court') || lowerName.includes('field')) {
    return <Dumbbell {...iconProps} />;
  }
  
  // Bicicletas y ciclismo
  if (lowerName.includes('biciclet') || lowerName.includes('ciclov') || lowerName.includes('bike') ||
      lowerName.includes('cycling')) {
    return <Bike {...iconProps} />;
  }
  
  // Mascotas
  if (lowerName.includes('mascota') || lowerName.includes('perro') || lowerName.includes('pet') ||
      lowerName.includes('dog')) {
    return <Dog {...iconProps} />;
  }
  
  // Accesibilidad
  if (lowerName.includes('accesibil') || lowerName.includes('discapacidad') || lowerName.includes('rampa')) {
    return <Accessibility {...iconProps} />;
  }
  
  // Senderos y caminatas
  if (lowerName.includes('sendero') || lowerName.includes('camino') || lowerName.includes('hiking') ||
      lowerName.includes('trail') || lowerName.includes('walking')) {
    return <Footprints {...iconProps} />;
  }
  
  // Estacionamiento
  if (lowerName.includes('estacionamiento') || lowerName.includes('parking') || lowerName.includes('auto')) {
    return <Car {...iconProps} />;
  }
  
  // Restaurantes y comida
  if (lowerName.includes('restauran') || lowerName.includes('comida') || lowerName.includes('cafeter') ||
      lowerName.includes('food') || lowerName.includes('restaurant')) {
    return <Utensils {...iconProps} />;
  }
  
  // Agua y fuentes
  if (lowerName.includes('agua') || lowerName.includes('fuente') || lowerName.includes('bebedero') ||
      lowerName.includes('water') || lowerName.includes('fountain')) {
    return <Droplets {...iconProps} />;
  }
  
  // Teatro y cultura
  if (lowerName.includes('teatro') || lowerName.includes('auditorio') || lowerName.includes('cultural') ||
      lowerName.includes('theater') || lowerName.includes('culture')) {
    return <Theater {...iconProps} />;
  }
  
  // Iluminación
  if (lowerName.includes('iluminac') || lowerName.includes('luz') || lowerName.includes('light')) {
    return <Lightbulb {...iconProps} />;
  }
  
  // Seguridad
  if (lowerName.includes('seguridad') || lowerName.includes('security') || lowerName.includes('vigilancia')) {
    return <Shield {...iconProps} />;
  }
  
  // WiFi
  if (lowerName.includes('wifi') || lowerName.includes('internet') || lowerName.includes('conectividad')) {
    return <Wifi {...iconProps} />;
  }
  
  // Gimnasio
  if (lowerName.includes('gimnasio') || lowerName.includes('gym') || lowerName.includes('ejercicio')) {
    return <Dumbbell {...iconProps} />;
  }
  
  // Piscina
  if (lowerName.includes('piscina') || lowerName.includes('alberca') || lowerName.includes('pool') ||
      lowerName.includes('natacion')) {
    return <Waves {...iconProps} />;
  }
  
  // Árboles y naturaleza
  if (lowerName.includes('arbol') || lowerName.includes('jardin') || lowerName.includes('verde') ||
      lowerName.includes('tree') || lowerName.includes('garden') || lowerName.includes('nature')) {
    return <Trees {...iconProps} />;
  }
  
  // Por defecto, ícono de información
  return <Info {...iconProps} />;
};

export default AmenityIcon;