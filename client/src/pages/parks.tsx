import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import SimpleFilterSidebar from '@/components/SimpleFilterSidebar';
import ParksMap from '@/components/ParksMap';
import ParksList from '@/components/ParksList';
import ParkDetail from '@/components/ParkDetail';

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
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header moderno mejorado */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Parques y Espacios Públicos</h1>
              <p className="text-white/80 mt-2">Descubre los mejores espacios verdes de la ciudad</p>
            </div>
            <div className="text-right bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{parks.length}</div>
              <div className="text-white/80 text-sm">parques disponibles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor principal con sidebar mejorado */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de filtros renovado */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <SimpleFilterSidebar onApplyFilters={handleApplyFilters} />
        </div>

        {/* Área de contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Lista de parques con diseño mejorado */}
          <div className="flex-1 overflow-y-auto p-6">
            <ParksList 
              parks={parks}
              isLoading={isLoading}
              totalCount={parks.length}
              currentPage={1}
            />
          </div>
        </div>
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
