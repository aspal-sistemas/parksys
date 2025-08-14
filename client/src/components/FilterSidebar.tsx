import React, { useState } from 'react';
import { Search, X, Info, Filter, MapPin, TreePine, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Amenity, PARK_TYPES } from '@shared/schema';
import AmenityIcon from './AmenityIcon';

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Deshabilitado para simplificar interfaz
  const amenities: Amenity[] = [];

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      parkType: parkType && parkType !== 'todos' ? parkType : undefined,
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

  // Simplificamos el manejo de amenidades para mostrar todas
  const amenitiesList = amenities || [];

  // Renderiza un ítem de amenidad individual
  const renderAmenityItem = (amenity: Amenity) => (
    <TooltipProvider key={amenity.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => toggleAmenity(amenity.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border w-full min-h-[80px] ${
              selectedAmenities.includes(amenity.id)
                ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 ${
              selectedAmenities.includes(amenity.id)
                ? 'bg-secondary-100 text-secondary-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <AmenityIcon name={amenity.icon || 'default'} size={24} />
            </div>
            <span className="text-xs text-center mt-1 font-medium">
              {amenity.name}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{amenity.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Mostramos todas las amenidades siempre
  const amenityItems = amenities || [];
  
  // Función para verificar si una amenidad está en la categoría activa
  const isInActiveCategory = (amenity: Amenity) => 
    activeCategory === 'todas' || true; // Simplified for now

  return (
    <div className="w-full bg-white overflow-y-auto pb-4">
      <div className="p-4 bg-gradient-to-r from-primary-100 to-primary-50 border-b border-primary-200">
        <h2 className="font-heading font-semibold text-xl text-primary-900">Buscar Parques</h2>
        <p className="text-sm text-primary-700 mt-1">Encuentra el parque perfecto para visitar</p>
      </div>
      
      {/* Layout con 2 columnas en pantallas grandes */}
      <div className="p-4 md:grid md:grid-cols-2 md:gap-4 md:items-start">
        {/* Primera columna - Búsqueda y filtros básicos */}
        <div>
          {/* Search input */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                className="pl-10 pr-3 shadow-sm border-gray-300 focus:border-primary-500"
                placeholder="Nombre del parque o zona"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filtros principales */}
          <div>
            <h3 className="text-gray-800 font-medium mb-3 flex items-center">
              <span className="inline-block w-1.5 h-4 bg-primary-500 mr-2 rounded-sm"></span>
              Filtros principales
            </h3>
            
            {/* Filter: Type */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Tipo de parque</Label>
              <Select value={parkType} onValueChange={setParkType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {['urbano', 'natural', 'lineal', 'metropolitano', 'vecinal', 'de bolsillo', 'temático'].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                className="bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Segunda columna - Amenidades */}
        <div>
          {/* Filter: Amenities (NEW Visual Interface) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-800 font-medium flex items-center">
                <span className="inline-block w-1.5 h-4 bg-secondary-500 mr-2 rounded-sm"></span>
                Amenidades
              </h3>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Selecciona las amenidades que buscas en un parque</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Amenity Category Tabs con botón para ver todas */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setActiveCategory('todas')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeCategory === 'todas' 
                    ? 'bg-primary-500 text-white font-semibold' 
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200 font-semibold'
                }`}
              >
                Todas las Amenidades
              </button>
              
              {['deportes', 'recreacion', 'naturaleza', 'servicios'].map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeCategory === category 
                      ? 'bg-secondary-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Amenity Icons Grid - Más grande y mejor visible */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {amenityItems.map((amenity: any) => (
                <TooltipProvider key={amenity.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border w-full min-h-[80px] ${
                          selectedAmenities.includes(amenity.id)
                            ? 'border-secondary-500 bg-secondary-50 shadow-sm' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-full mb-1 ${
                          selectedAmenities.includes(amenity.id)
                            ? 'bg-secondary-100 text-secondary-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <AmenityIcon 
                            name={amenity.icon || ''} 
                            size={48} 
                          />
                        </div>
                        <span className="text-xs text-center mt-1 font-medium">
                          {amenity.name}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{amenity.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Selected Amenities Count */}
            {selectedAmenities.length > 0 && (
              <div className="mt-2 text-sm text-secondary-600 font-medium">
                {selectedAmenities.length} {selectedAmenities.length === 1 ? 'amenidad seleccionada' : 'amenidades seleccionadas'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Botones de acción - Más grandes y destacados */}
      <div className="px-4 pt-0 pb-3 flex space-x-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
        <Button 
          className="flex-1 py-5 shadow-sm"
          onClick={handleApplyFilters}
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar parques
        </Button>
        <Button 
          variant="outline"
          className="py-5"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
