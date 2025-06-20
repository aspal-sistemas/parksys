import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import ModernFilterSidebar from '@/components/ModernFilterSidebar';
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
    <main className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar de filtros moderno */}
      <div className="w-80 flex-shrink-0 h-full">
        <ModernFilterSidebar onApplyFilters={handleApplyFilters} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parques y Espacios Públicos</h1>
              <p className="text-gray-600 mt-1">Descubre los mejores espacios verdes de la ciudad</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{parks.length}</div>
                <div className="text-sm text-gray-500">parques disponibles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de resultados */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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
