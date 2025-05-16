import React from 'react';
import { Link } from 'wouter';
import { ExtendedPark } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AmenityIcon from '@/components/ui/amenity-icon';

interface ParkCardProps {
  park: ExtendedPark;
  onClick?: () => void;
}

const ParkCard: React.FC<ParkCardProps> = ({ park, onClick }) => {
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
    <Card className="park-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      {/* Park image */}
      <div className="w-full h-40 overflow-hidden">
        <img 
          src={park.primaryImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Sin+Imagen'} 
          alt={park.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
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
              <AmenityIcon name={amenity.icon} className="h-3 w-3 mr-1" />
              {amenity.name}
            </span>
          ))}
          
          {park.amenities && park.amenities.length > 3 && (
            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
              +{park.amenities.length - 3} más
            </span>
          )}
        </div>
        
        {onClick ? (
          <Button 
            variant="secondary" 
            className="mt-3 w-full bg-primary-50 hover:bg-primary-100 text-primary-700"
            onClick={onClick}
          >
            Ver detalles
          </Button>
        ) : (
          <Link href={`/parks/${park.id}`}>
            <Button 
              variant="secondary" 
              className="mt-3 w-full bg-primary-50 hover:bg-primary-100 text-primary-700"
            >
              Ver detalles
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default ParkCard;
