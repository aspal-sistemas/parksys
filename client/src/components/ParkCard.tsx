import React from 'react';
import { Link } from 'wouter';
import { ExtendedPark } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileImage } from 'lucide-react';
import AmenityIcon from '@/components/ui/amenity-icon';
import greenFlagLogo from '@assets/PHOTO-2025-07-01-12-36-16_1751396336894.jpg';

interface ParkCardProps {
  park: ExtendedPark;
  onClick?: () => void;
}

// Función para generar slug del parque
const generateParkSlug = (parkName: string, parkId: number) => {
  return parkName
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + parkId;
};

const ParkCard: React.FC<ParkCardProps> = ({ park, onClick }) => {
  // Función para verificar si el parque debe mostrar el Green Flag Award
  const shouldShowGreenFlag = (parkId: number) => {
    // Solo Bosque Los Colomos (ID: 5) y Parque Metropolitano (ID: 2)
    return parkId === 5 || parkId === 2;
  };

  // Determine park type label
  const getParkTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'metropolitano': 'Metropolitano',
      'barrial': 'Barrial',
      'vecinal': 'Vecinal',
      'lineal': 'Lineal',
      'ecologico': 'Ecológico',
      'botanico': 'Botánico',
      'deportivo': 'Deportivo'
    };
    return typeMap[type] || type;
  };

  // Color class for park type badge
  const getParkTypeBadgeClass = (type: string) => {
    const typeColorMap: Record<string, string> = {
      'metropolitano': 'bg-primary-100 text-primary-800',
      'barrial': 'bg-yellow-100 text-yellow-800',
      'vecinal': 'bg-orange-100 text-orange-800',
      'lineal': 'bg-blue-100 text-blue-800',
      'ecologico': 'bg-green-100 text-green-800',
      'botanico': 'bg-emerald-100 text-emerald-800',
      'deportivo': 'bg-purple-100 text-purple-800'
    };
    return typeColorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="park-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col relative">
      {/* Park image */}
      <div className="w-full h-40 overflow-hidden relative">
        {park.primaryImage || park.mainImageUrl ? (
          <img 
            src={park.primaryImage || park.mainImageUrl} 
            alt={park.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si la imagen falla al cargar, mostrar un fallback
              e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Sin+Imagen';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FileImage className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Green Flag Award Logo - Solo para parques específicos */}
      {shouldShowGreenFlag(park.id) && (
        <div className="absolute bottom-2 right-2 z-10">
          <img 
            src={greenFlagLogo} 
            alt="Green Flag Award" 
            className="w-12 h-8 object-contain bg-white/90 rounded-md p-1 shadow-sm"
            title="Green Flag Award"
          />
        </div>
      )}
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg text-gray-900">{park.name}</h3>
            <p className="text-gray-600 text-sm">
              {park.municipality?.name || ''}, {park.municipality?.state || ''}
            </p>
          </div>
          <Badge className={`${getParkTypeBadgeClass(park.parkType)} font-medium`}>
            {getParkTypeLabel(park.parkType)}
          </Badge>
        </div>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-2 mb-auto">
          {park.amenities && park.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity.id} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
              <AmenityIcon 
                name={amenity.icon || 'default'} 
                customIconUrl={amenity.customIconUrl || null}
                iconType={amenity.icon === 'custom' ? 'custom' : 'system'}
                size={12}
                className="mr-1" 
              />
              {amenity.name}
            </span>
          ))}
          
          {park.amenities && park.amenities.length > 3 && (
            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
              +{park.amenities.length - 3} más
            </span>
          )}
        </div>
        
        <div className="mt-3">
          <Link href={`/parque/${generateParkSlug(park.name, park.id)}`} className="block">
            <Button 
              variant="default" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Ir al Parque
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParkCard;
