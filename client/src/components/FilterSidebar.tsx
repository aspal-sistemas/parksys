import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Amenity, PARK_TYPES } from '@shared/schema';

interface FilterSidebarProps {
  onApplyFilters: (filters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onApplyFilters }) => {
  const [search, setSearch] = useState('');
  const [parkType, setParkType] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);

  // Fetch amenities
  const { data: amenities = [] } = useQuery<Amenity[]>({ 
    queryKey: ['/api/amenities'],
  });

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      parkType: parkType || undefined,
      postalCode: postalCode || undefined,
      amenityIds: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setParkType('');
    setPostalCode('');
    setSelectedAmenities([]);
    onApplyFilters({});
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Filter amenities for display (recreation & services first)
  const displayAmenities = amenities
    .sort((a, b) => {
      // Prioritize recreation and services categories
      const categoryOrder = { 
        "recreación": 1, 
        "servicios": 2,
        "deportes": 3,
        "accesibilidad": 4,
        "infraestructura": 5,
        "naturaleza": 6
      };
      return (categoryOrder[a.category as keyof typeof categoryOrder] || 99) - 
             (categoryOrder[b.category as keyof typeof categoryOrder] || 99);
    });

  const visibleAmenities = showMoreAmenities 
    ? displayAmenities 
    : displayAmenities.slice(0, 5);

  return (
    <div className="w-full md:w-80 bg-white md:sidebar overflow-y-auto pb-6">
      <div className="p-4 border-b">
        <h2 className="font-heading font-semibold text-xl text-gray-900">Buscar Parques</h2>
        <p className="text-sm text-gray-500 mt-1">Encuentra el parque perfecto para visitar</p>
      </div>
      
      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            className="pl-10 pr-3"
            placeholder="Nombre del parque o zona"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="px-4">
        <h3 className="text-gray-700 font-medium mb-3">Filtros</h3>
        
        {/* Filter: Type */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Tipo de parque</Label>
          <Select value={parkType} onValueChange={setParkType}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              {PARK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter: Zone */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Zona o código postal</Label>
          <Input
            type="text"
            placeholder="Ej. 44100 o Centro"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
        
        {/* Filter: Amenities */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Amenidades</Label>
          <div className="space-y-2">
            {visibleAmenities.map((amenity) => (
              <div className="flex items-start" key={amenity.id}>
                <div className="flex items-center h-5">
                  <Checkbox
                    id={`amenity-${amenity.id}`}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={`amenity-${amenity.id}`}
                    className="font-medium text-gray-700"
                  >
                    {amenity.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {amenities.length > 5 && (
            <button
              type="button"
              className="text-sm text-secondary-600 hover:text-secondary-500 mt-2"
              onClick={() => setShowMoreAmenities(!showMoreAmenities)}
            >
              {showMoreAmenities ? 'Mostrar menos amenidades' : 'Mostrar más amenidades'}
            </button>
          )}
        </div>
        
        {/* Filter: Accessibility - can be expanded in future versions */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Accesibilidad</Label>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <Checkbox 
                  id="rampas" 
                  checked={selectedAmenities.includes(6)} // Assuming ID 6 is for accessibility ramps
                  onCheckedChange={() => toggleAmenity(6)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="rampas" className="font-medium text-gray-700">
                  Rampas para sillas de ruedas
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            className="flex-1"
            onClick={handleApplyFilters}
          >
            Aplicar filtros
          </Button>
          <Button 
            variant="outline"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
