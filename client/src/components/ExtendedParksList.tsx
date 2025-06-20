import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark, Amenity } from '@shared/schema';
import { MapPin, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AmenityIcon from './AmenityIcon';

interface ExtendedParksListProps {
  parks: ExtendedPark[];
  isLoading: boolean;
  onParkSelect: (park: ExtendedPark) => void;
}

export default function ExtendedParksList({ parks, isLoading, onParkSelect }: ExtendedParksListProps) {
  // Obtenemos las amenidades para mostrar los iconos
  const { data: amenities = [] } = useQuery<Amenity[]>({
    queryKey: ['/api/amenities']
  });

  const getAmenityName = (amenityId: number) => {
    const amenity = amenities.find(a => a.id === amenityId);
    return amenity ? amenity.name : 'Amenidad';
  };

  const getAmenityIcon = (amenityId: number) => {
    const amenity = amenities.find(a => a.id === amenityId);
    return amenity ? amenity.icon : 'default';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-6 w-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (parks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-500 text-lg mb-2">No parks found</div>
        <div className="text-gray-400">Try adjusting your search criteria</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parks.map((park) => (
        <div 
          key={park.id}
          className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => onParkSelect(park)}
        >
          <div className="p-6">
            <div className="flex gap-6">
              {/* Imagen del parque */}
              <div className="w-48 h-32 flex-shrink-0">
                {park.primaryImage ? (
                  <img
                    src={park.primaryImage}
                    alt={park.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Información del parque */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                      {park.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{park.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {park.parkType?.replace('_', ' ') || 'Park'}
                    </Badge>
                    {park.area && (
                      <Badge variant="secondary" className="text-xs">
                        {park.area}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {park.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {park.description}
                  </p>
                )}

                {/* Amenidades del parque */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Available Facilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {park.amenities && park.amenities.length > 0 ? (
                      park.amenities.slice(0, 8).map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs"
                        >
                          <AmenityIcon 
                            name={amenity.icon || 'default'} 
                            size={12} 
                            className="text-primary-600" 
                          />
                          <span>{amenity.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">No facilities listed</span>
                    )}
                    {park.amenities && park.amenities.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{park.amenities.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {park.postalCode && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Zip: {park.postalCode}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Open Daily</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>Public Park</span>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex-shrink-0 flex flex-col justify-center">
                <button 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onParkSelect(park);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}