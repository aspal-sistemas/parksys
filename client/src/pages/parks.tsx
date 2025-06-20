import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import SimpleFilterSidebar from '@/components/SimpleFilterSidebar';
import ParksMap from '@/components/ParksMap';
import ParksList from '@/components/ParksList';
import ParkDetail from '@/components/ParkDetail';
import ExtendedParksList from '@/components/ExtendedParksList';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Parks: React.FC = () => {
  const [filters, setFilters] = useState<{
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }>({});
  
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const parksPerPage = 10;
  
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
  const filteredParks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );

  // Calculate pagination
  const totalParks = filteredParks.length;
  const totalPages = Math.ceil(totalParks / parksPerPage);
  const startIndex = (currentPage - 1) * parksPerPage;
  const endIndex = startIndex + parksPerPage;
  const parks = filteredParks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
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
            Resultados de Búsqueda ({totalParks} parques encontrados)
          </h2>
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(endIndex, totalParks)} de {totalParks} parques
          </div>
        </div>
        
        <ExtendedParksList 
          parks={parks}
          isLoading={isLoading}
          onParkSelect={(park: ExtendedPark) => {
            setSelectedParkId(park.id);
            setModalOpen(true);
          }}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 ${
                      currentPage === pageNumber 
                        ? "bg-[#00a587] hover:bg-[#067f5f] text-white" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
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
