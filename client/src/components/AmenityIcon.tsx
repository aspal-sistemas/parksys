import React from 'react';
import {
  Accessibility, 
  Bike, 
  Droplet, 
  LucideProps,
  ParkingCircle, 
  Dog, 
  PlaySquare, 
  ShieldCheck, 
  Theater, 
  BadgeDollarSign, 
  UtensilsCrossed, 
  Wifi,
  Car,
  LucideIcon,
  GalleryHorizontalEnd,
  Footprints,
  Lamp
} from 'lucide-react';

type IconProps = {
  name: string;
  size?: number | string;
  className?: string;
};

// Mapping de nombres de iconos a componentes de Lucide
const iconMap: Record<string, LucideIcon> = {
  playground: PlaySquare,
  toilet: BadgeDollarSign,
  sportsCourt: GalleryHorizontalEnd,
  bicycle: Bike,
  pets: Dog,
  accessibility: Accessibility,
  hiking: Footprints,
  parking: ParkingCircle,
  restaurant: UtensilsCrossed,
  water: Droplet,
  theater: Theater,
  lightbulb: Lamp,
  security: ShieldCheck,
  wifi: Wifi,
  bikeParking: Car
};

const AmenityIcon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  // Obtener el componente del icono según el nombre
  const IconComponent = iconMap[name];
  
  // Si no se encuentra el icono, mostrar un mensaje de alerta y devolver un icono genérico
  if (!IconComponent) {
    console.warn(`Icon '${name}' not found in icon map`);
    return <Wifi size={size} className={className} />;
  }
  
  // Renderizar el icono
  return <IconComponent size={size} className={className} />;
};

export default AmenityIcon;