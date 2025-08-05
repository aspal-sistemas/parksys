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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
            {/* Imagen del parque - skeleton */}
            <div className="aspect-[4/3] bg-gray-200"></div>
            {/* Área para nombre - integrada en la imagen */}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parks.map((park) => (
        <Link 
          key={park.id}
          href={`/parque/${generateParkSlug(park.name, park.id)}`}
          className="group cursor-pointer"
        >
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Imagen del parque con overlay y Green Flag */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {park.primaryImage ? (
                <img
                  src={park.primaryImage}
                  alt={park.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary-600" />
                </div>
              )}
              
              {/* Overlay con gradiente para el nombre */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Green Flag Award Logo - Integrado en la esquina superior derecha */}
              {shouldShowGreenFlag(park.id) && (
                <div className="absolute top-3 right-3 z-10">
                  <img 
                    src={greenFlagLogo} 
                    alt="Green Flag Award" 
                    className="h-16 w-24 object-contain bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-green-500/30"
                    title="Green Flag Award"
                  />
                </div>
              )}
              
              {/* Nombre del parque - Siempre visible en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                  {park.name}
                </h3>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ExtendedParksList;