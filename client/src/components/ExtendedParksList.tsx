import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark, Amenity } from '@shared/schema';
import { MapPin, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AmenityIcon from './AmenityIcon';
import greenFlagLogo from '@assets/PHOTO-2025-07-01-12-36-16_1751396336894.jpg';

interface ExtendedParksListProps {
  parks: ExtendedPark[];
  isLoading: boolean;
  onParkSelect: (park: ExtendedPark) => void;
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

function ExtendedParksList({ parks, isLoading, onParkSelect }: ExtendedParksListProps) {
  // Función para verificar si el parque debe mostrar el Green Flag Award
  const shouldShowGreenFlag = (parkId: number) => {
    // Bosque Los Colomos (ID: 5), Parque Metropolitano (ID: 2), Parque Alcalde (ID: 4), Bosque Urbano Tlaquepaque (ID: 18)
    return parkId === 5 || parkId === 2 || parkId === 4 || parkId === 18;
  };

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
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            {/* Sección superior */}
            <div className="flex gap-4 mb-3">
              <div className="w-40 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-32 h-8 bg-gray-200 rounded"></div>
            </div>
            {/* Amenidades ancho completo - TEMPORALMENTE OCULTAS PARA CONSISTENCIA CON DISEÑO
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            */}
          </div>
        ))}
      </div>
    );
  }

  if (parks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-500 text-lg mb-2">No se encontraron parques</div>
        <div className="text-gray-400">Intenta ajustar los criterios de búsqueda</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parks.map((park) => (
        <div 
          key={park.id}
          className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
        >
          <div className="p-4">
            {/* Sección superior con imagen, título y botón */}
            <div className="flex gap-4 mb-3">
              {/* Imagen del parque */}
              <div className="w-40 h-24 flex-shrink-0">
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

              {/* Información básica del parque */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {park.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{park.address}</span>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {park.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {park.description}
                  </p>
                )}
              </div>

              {/* Botón de acción y Green Flag Award */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <Link href={`/parque/${generateParkSlug(park.name, park.id)}`}>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-32 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Ir al Parque
                  </Button>
                </Link>
                
                {/* Green Flag Award Logo - Solo para parques específicos */}
                {shouldShowGreenFlag(park.id) && (
                  <img 
                    src={greenFlagLogo} 
                    alt="Green Flag Award" 
                    className="h-20 w-30 object-contain bg-white rounded-md p-2 shadow-lg border-2 border-green-500"
                    title="Green Flag Award"
                  />
                )}
              </div>
            </div>

            {/* Amenidades del parque - TEMPORALMENTE OCULTAS (FUNCIONALIDAD PRESERVADA PARA REACTIVAR MÁS ADELANTE)
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Amenidades, Instalaciones y Servicios:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {park.amenities && park.amenities.length > 0 ? (
                  park.amenities.slice(0, 12).map((amenity, index) => (
                    <div
                      key={`${park.id}-${amenity.id}-${index}`}
                      className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs min-w-0"
                    >
                      <AmenityIcon 
                        name={amenity.icon || 'default'} 
                        customIconUrl={(amenity as any).customIconUrl || null}
                        iconType={(amenity as any).customIconUrl ? 'custom' : 'system'}
                        size={16} 
                        className="text-primary-600 flex-shrink-0" 
                      />
                      <span className="truncate">{amenity.name}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic col-span-full">Sin instalaciones registradas</span>
                )}
                {park.amenities && park.amenities.length > 12 && (
                  <Badge variant="secondary" className="text-xs">
                    +{park.amenities.length - 12} más
                  </Badge>
                )}
              </div>
            </div>
            */}

            {/* Información adicional compacta - Sin área del parque */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {/* Información específica del parque sin mostrar área */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExtendedParksList;