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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Filtros en formato extendido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* AMENIDADES - Estilo NYC Parks */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="bg-primary-600 text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Facilities & Amenities
              {selectedAmenities.length > 0 && (
                <span className="bg-white text-primary-600 px-2 py-1 rounded-full text-xs font-bold ml-2">
                  {selectedAmenities.length}
                </span>
              )}
            </h3>
          </div>
          
          <div className="p-4">
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {amenities.map((amenity) => (
                  <label 
                    key={amenity.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="w-4 h-4 text-primary-600 border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <AmenityIcon 
                        name={amenity.icon || 'default'} 
                        size={16} 
                        className="text-gray-600 group-hover:text-primary-600 transition-colors" 
                      />
                      <span className="text-sm text-gray-800 group-hover:text-primary-800 transition-colors">
                        {amenity.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Contador y acción rápida */}
            {selectedAmenities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedAmenities.length} amenidad{selectedAmenities.length !== 1 ? 'es' : ''} seleccionada{selectedAmenities.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedAmenities([])}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Park Search - Segunda columna */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="bg-secondary-600 text-white p-3 rounded-t-lg">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              Park Search
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Park Name
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Enter park name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <Input
                id="postal-code"
                type="text"
                placeholder="e.g. 06100"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Park Type - Tercera columna */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="bg-accent-600 text-white p-3 rounded-t-lg">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Park Type
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="parkType"
                  checked={parkType === ''}
                  onChange={() => setParkType('')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-800">All Types</span>
              </label>
              {PARK_TYPES.map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="parkType"
                    checked={parkType === type}
                    onChange={() => setParkType(type)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-800 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Parte inferior */}
      <div className="p-6 border-t-2 border-gray-300 bg-gray-50">
        <div className="flex justify-center gap-4">
          <button
            onClick={handleApplyFilters}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded border-2 border-primary-600 transition-colors duration-200"
          >
            Find Parks
          </button>
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded border-2 border-gray-300 transition-colors duration-200"
          >
            Clear All Filters
          </button>
        </div>
        
        {/* Results Summary */}
        {(search || parkType || postalCode || selectedAmenities.length > 0) && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full">
              <span className="font-medium">Active Filters:</span>
              <span className="text-primary-600 font-semibold">
                {[
                  search && '1',
                  parkType && '1', 
                  postalCode && '1',
                  selectedAmenities.length > 0 && '1'
                ].filter(Boolean).length} applied
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}