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
  const parks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );

  // Calcular paginación
  const totalPages = Math.ceil(parks.length / parksPerPage);
  const startIndex = (currentPage - 1) * parksPerPage;
  const endIndex = startIndex + parksPerPage;
  const currentParks = parks.slice(startIndex, endIndex);

  // Reset page when filters change
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
          <h1 className="text-2xl font-bold">Agencia Metropolitana de Bosques Urbanos de Guadalajara</h1>
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
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </div>
        
        <ExtendedParksList 
          parks={currentParks}
          isLoading={isLoading}
          onParkSelect={(park: ExtendedPark) => {
            setSelectedParkId(park.id);
            setModalOpen(true);
          }}
        />

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {/* Números de página */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Mostrar solo algunas páginas alrededor de la actual
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Información adicional de paginación */}
        {parks.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {startIndex + 1} - {Math.min(endIndex, parks.length)} de {parks.length} parques
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
