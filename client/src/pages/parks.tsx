import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import SimpleFilterSidebar from '@/components/SimpleFilterSidebar';
import ParksMap from '@/components/ParksMap';
import ParksList from '@/components/ParksList';
import ParkDetail from '@/components/ParkDetail';
import ExtendedParksList from '@/components/ExtendedParksList';

const Parks: React.FC = () => {
  const [filters, setFilters] = useState<{
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }>({});
  
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.parkType) params.append('parkType', filters.parkType);
    if (filters.postalCode) params.append('postalCode', filters.postalCode);
    if (filters.amenityIds && filters.amenityIds.length > 0) {
      params.append('amenities', filters.amenityIds.join(','));
    }
    
    return params.toString() ? `?${params.toString()}` : '';
  };
  
  // Fetch parks with filters
  const { data: allParks = [], isLoading } = useQuery<ExtendedPark[]>({
    queryKey: [`/api/parks${buildQueryString()}`],
  });
  
  // Filtrar parques sin nombre o marcados como eliminados
  const parks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );
  
  // Fetch detailed park data when selected
  const { data: selectedPark, isLoading: isLoadingPark } = useQuery<ExtendedPark>({
    queryKey: [selectedParkId ? `/api/parks/${selectedParkId}` : ''],
    enabled: !!selectedParkId,
  });
  
  const handleApplyFilters = (newFilters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }) => {
    setFilters(newFilters);
  };
  
  const handleSelectPark = (parkId: number) => {
    setSelectedParkId(parkId);
    setModalOpen(true);
  };
  
  const [mapExpanded, setMapExpanded] = useState(false);

  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-[#00a587] to-[#067f5f] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Encuentra Parques y Espacios Recreativos</h1>
          <p className="text-white/80 mt-1">Busca y descubre parques por instalaciones y ubicación</p>
        </div>
      </div>

      {/* Filtros extendidos en toda la pantalla */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SimpleFilterSidebar onApplyFilters={handleApplyFilters} />
      </div>

      {/* Lista de parques extendida */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#067f5f]">
            Resultados de Búsqueda ({parks.length} parques encontrados)
          </h2>
        </div>
        
        <ExtendedParksList 
          parks={parks}
          isLoading={isLoading}
          onParkSelect={(park: ExtendedPark) => {
            setSelectedPark(park);
            setModalOpen(true);
          }}
        />
      </div>

      {/* Modal de detalle del parque */}
      {selectedPark && (
        <ParkDetail 
          park={selectedPark}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
};

export default Parks;
