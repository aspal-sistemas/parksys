import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Tag, Filter } from 'lucide-react';
import { Amenity, PARK_TYPES } from '@shared/schema';
import AmenityIcon from './AmenityIcon';

interface SimpleFilterSidebarProps {
  onApplyFilters: (filters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }) => void;
}

export default function SimpleFilterSidebar({ onApplyFilters }: SimpleFilterSidebarProps) {
  const [search, setSearch] = useState('');
  const [parkType, setParkType] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  // Obtenemos las amenidades disponibles
  const { data: amenities = [] } = useQuery<Amenity[]>({
    queryKey: ['/api/amenities']
  });

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      parkType: parkType || undefined,
      postalCode: postalCode || undefined,
      amenityIds: selectedAmenities.length > 0 ? selectedAmenities : undefined
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setParkType('');
    setPostalCode('');
    setSelectedAmenities([]);
    onApplyFilters({});
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header compacto */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Filter className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Encuentra tu parque</h2>
          </div>
        </div>
      </div>

      {/* Contenido de filtros */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* AMENIDADES - Sección principal y más destacada */}
        <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-xl p-1 shadow-lg">
          <Card className="border-0 shadow-none bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Tag className="h-5 w-5 text-primary-600" />
                  </div>
                  ¿Qué buscas en tu parque?
                </CardTitle>
                {selectedAmenities.length > 0 && (
                  <Badge className="bg-primary-600 text-white px-3 py-1">
                    {selectedAmenities.length} seleccionadas
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">Selecciona las amenidades que más te interesan</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-2">
                {amenities.map((amenity) => (
                  <div 
                    key={amenity.id} 
                    className={`
                      group relative flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${selectedAmenities.includes(amenity.id) 
                        ? 'border-primary-300 bg-primary-50 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-25 hover:shadow-sm'
                      }
                    `}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    {/* Checkbox personalizado */}
                    <div className={`
                      flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200
                      ${selectedAmenities.includes(amenity.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 group-hover:border-primary-400'
                      }
                    `}>
                      {selectedAmenities.includes(amenity.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Icono de amenidad */}
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                      ${selectedAmenities.includes(amenity.id)
                        ? 'bg-primary-100'
                        : 'bg-gray-100 group-hover:bg-primary-100'
                      }
                    `}>
                      <AmenityIcon 
                        name={amenity.icon || 'default'} 
                        size={20} 
                        className={`
                          transition-colors duration-200
                          ${selectedAmenities.includes(amenity.id)
                            ? 'text-primary-600'
                            : 'text-gray-600 group-hover:text-primary-600'
                          }
                        `} 
                      />
                    </div>

                    {/* Nombre de amenidad */}
                    <div className="flex-1">
                      <Label 
                        htmlFor={`amenity-${amenity.id}`} 
                        className={`
                          text-sm font-medium cursor-pointer transition-colors duration-200
                          ${selectedAmenities.includes(amenity.id)
                            ? 'text-primary-900'
                            : 'text-gray-700 group-hover:text-primary-800'
                          }
                        `}
                      >
                        {amenity.name}
                      </Label>
                    </div>

                    {/* Indicador visual de selección */}
                    {selectedAmenities.includes(amenity.id) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mensaje motivacional cuando hay amenidades seleccionadas */}
              {selectedAmenities.length > 0 && (
                <div className="mt-4 p-3 bg-primary-100 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-800 font-medium">
                    ¡Perfecto! Buscaremos parques con {selectedAmenities.length} {selectedAmenities.length === 1 ? 'amenidad' : 'amenidades'} específicas.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros adicionales compactos */}
        <div className="grid grid-cols-1 gap-3">
          {/* Búsqueda rápida */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Label htmlFor="search" className="text-sm text-gray-700">Buscar por nombre</Label>
            </div>
            <Input
              id="search"
              type="text"
              placeholder="Nombre del parque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 text-sm"
            />
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Label htmlFor="postal-code" className="text-sm text-gray-700">Código postal</Label>
            </div>
            <Input
              id="postal-code"
              type="text"
              placeholder="Ej: 06100"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Botones de acción destacados */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-3">
          {/* Botón principal */}
          <Button 
            onClick={handleApplyFilters}
            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar Parques
          </Button>
          
          {/* Botón secundario */}
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            className="w-full h-10 border-gray-300 text-gray-600 hover:bg-gray-50"
            size="sm"
          >
            Limpiar filtros
          </Button>
        </div>
        
        {/* Resumen visual de filtros activos */}
        {(search || parkType || postalCode || selectedAmenities.length > 0) && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <div className="text-xs font-medium text-primary-800 mb-2">Filtros activos:</div>
            <div className="flex flex-wrap gap-1">
              {search && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: {search}
                </Badge>
              )}
              {parkType && (
                <Badge variant="secondary" className="text-xs">
                  Tipo: {parkType}
                </Badge>
              )}
              {postalCode && (
                <Badge variant="secondary" className="text-xs">
                  CP: {postalCode}
                </Badge>
              )}
              {selectedAmenities.length > 0 && (
                <Badge className="bg-primary-600 text-white text-xs">
                  {selectedAmenities.length} amenidades
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}