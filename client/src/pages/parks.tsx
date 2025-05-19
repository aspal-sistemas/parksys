import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import FilterSidebar from '@/components/FilterSidebar';
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
    <main className="flex-1 flex flex-col">
      {/* Control para expandir/contraer el mapa */}
      <div className="bg-white border-b p-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Parques y Espacios Públicos</h1>
        <button 
          onClick={toggleMapExpansion}
          className="flex items-center px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded transition-all"
        >
          {mapExpanded ? 'Contraer mapa' : 'Expandir mapa'} 
          <span className="ml-2">{mapExpanded ? '↓' : '↑'}</span>
        </button>
      </div>

      {/* Contenedor principal con disposición flexible */}
      <div className={`flex flex-col md:flex-row flex-1 ${mapExpanded ? 'flex-col' : ''}`}>
        {/* Sección de mapa - más compacta y con altura más reducida */}
        <div className={`${mapExpanded ? 'w-full h-[70vh]' : 'md:w-1/3 lg:w-1/3 h-[300px] md:h-[400px]'} transition-all duration-300 ${mapExpanded ? 'order-first' : 'md:order-last'}`}>
          <div className="w-full h-full">
            <ParksMap 
              parks={parks}
              selectedParkId={selectedParkId || undefined}
              onSelectPark={handleSelectPark}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Área de búsqueda y resultados - ahora más prominente */}
        <div className={`${mapExpanded ? 'w-full' : 'md:w-2/3 lg:w-2/3'} flex flex-col transition-all duration-300`}>
          {/* Sección de filtros - ahora más visible y amplio */}
          <div className="border-b md:border-r">
            <FilterSidebar onApplyFilters={handleApplyFilters} />
          </div>
          
          {/* Lista de resultados */}
          <div className="flex-1 overflow-auto">
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
