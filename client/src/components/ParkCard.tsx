import React from 'react';
import { Link } from 'wouter';
import { ExtendedPark } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileImage } from 'lucide-react';
import AmenityIcon from '@/components/ui/amenity-icon';
const greenFlagLogo = "/images/green-flag-logo.jpg";

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
  console.log(`ParkCard rendered for: ${park.name} (ID: ${park.id})`);
  
  // Función para verificar si el parque debe mostrar el Green Flag Award
  const shouldShowGreenFlag = (parkId: number) => {
    // Bosque Los Colomos (ID: 5), Parque Metropolitano (ID: 2), Parque Alcalde (ID: 4), Bosque Urbano Tlaquepaque (ID: 18)
    const shouldShow = parkId === 5 || parkId === 2 || parkId === 4 || parkId === 18;
    console.log(`Green Flag check for park ID ${parkId}: ${shouldShow}`);
    return shouldShow;
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
    <Link 
      href={`/parque/${generateParkSlug(park.name, park.id)}`}
      className="group cursor-pointer block"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Imagen del parque con overlay y Green Flag */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {park.primaryImage || park.mainImageUrl ? (
            <img 
              src={park.primaryImage || park.mainImageUrl || ''} 
              alt={park.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <FileImage className="h-12 w-12 text-primary-600" />
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
  );
};

export default ParkCard;
