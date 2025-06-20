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
    <div className="h-full flex flex-col bg-white">
      {/* Header mejorado */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Filter className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
            <p className="text-sm text-gray-600">Encuentra tu parque ideal</p>
          </div>
        </div>
      </div>

      {/* Contenido de filtros */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Búsqueda general */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary-600" />
              Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="search">Nombre del parque</Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar parque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipo de parque */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-secondary-600" />
              Tipo de Parque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-types"
                  checked={parkType === ''}
                  onCheckedChange={() => setParkType('')}
                />
                <Label htmlFor="all-types" className="text-sm font-medium">
                  Todos los tipos
                </Label>
              </div>
              {PARK_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={parkType === type}
                    onCheckedChange={() => setParkType(parkType === type ? '' : type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-medium capitalize">
                    {type.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Código postal */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-600" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="postal-code">Código postal</Label>
              <Input
                id="postal-code"
                type="text"
                placeholder="Ej: 06100"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenidades */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Amenidades
              {selectedAmenities.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedAmenities.length} seleccionadas
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`amenity-${amenity.id}`}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <AmenityIcon name={amenity.icon || 'default'} size={16} className="text-primary-600" />
                    <Label htmlFor={`amenity-${amenity.id}`} className="text-sm font-medium cursor-pointer">
                      {amenity.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            Aplicar Filtros
          </Button>
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            className="px-4"
          >
            Limpiar
          </Button>
        </div>
        
        {/* Resumen de filtros activos */}
        {(search || parkType || postalCode || selectedAmenities.length > 0) && (
          <div className="mt-3 text-xs text-gray-600">
            Filtros activos: {[
              search && 'búsqueda',
              parkType && 'tipo',
              postalCode && 'ubicación',
              selectedAmenities.length > 0 && `${selectedAmenities.length} amenidades`
            ].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}