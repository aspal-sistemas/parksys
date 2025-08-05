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
  className?: string;
}

const AmenityIcon: React.FC<AmenityIconProps> = ({ name, className = 'h-5 w-5' }) => {
  // Map icon names to Lucide React components
  const iconMap: Record<string, React.ReactNode> = {
    // Recreation
    playground: <PlayCircle className={className} />,
    hiking: <Footprints className={className} />,
    
    // Sports
    bicycle: <Bike className={className} />,
    sportsCourt: <Dumbbell className={className} />,
    
    // Services
    toilet: <Bath className={className} />,
    security: <ShieldCheck className={className} />,
    wifi: <Wifi className={className} />,
    
    // Accessibility
    accessibility: <Accessibility className={className} />,
    
    // Infrastructure
    parking: <ParkingSquare className={className} />,
    bikeParking: <ParkingSquare className={className} />,
    lightbulb: <Lightbulb className={className} />,
    
    // Nature
    pets: <Dog className={className} />,
    water: <Droplets className={className} />,
    trees: <Trees className={className} />,
    
    // Other common amenities
    restaurant: <UtensilsCrossed className={className} />,
    theater: <Theater className={className} />,
    
    // Default fallback
    default: <LandPlot className={className} />
  };
  
  return <>{iconMap[name] || iconMap.default}</>;
};

export default AmenityIcon;
