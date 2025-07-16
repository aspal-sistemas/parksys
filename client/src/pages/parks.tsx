import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import SimpleFilterSidebar from '@/components/SimpleFilterSidebar';
import ParksMap from '@/components/ParksMap';
import ParksList from '@/components/ParksList';
import ParkDetail from '@/components/ParkDetail';
import ExtendedParksList from '@/components/ExtendedParksList';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin, Trees, Users, Search } from 'lucide-react';
import heroImage from '@assets/group-of-tourists-walking-through-natural-reserve-2024-05-27-02-02-13-utc_1751508792698.jpg';
import AdSpace from '@/components/AdSpace';
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
  const parksPerPage = 5;
  
  // Reset scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.parkType) params.append('parkType', filters.parkType);
    if (filters.postalCode) params.append('postalCode', filters.postalCode);
    if (filters.municipality) params.append('municipality', filters.municipality);
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

  // Function to scroll to results section
  const scrollToResults = () => {
    const resultsSection = document.getElementById('resultados-busqueda');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to handle page change with scroll
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(scrollToResults, 100); // Small delay to ensure page change has occurred
  };
  
  // Fetch detailed park data when selected
  const { data: selectedPark, isLoading: isLoadingPark } = useQuery<ExtendedPark>({
    queryKey: [selectedParkId ? `/api/parks/${selectedParkId}` : ''],
    enabled: !!selectedParkId,
  });
  
  const handleApplyFilters = (newFilters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    municipality?: string;
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

  // Calcular estadísticas para el hero
  const uniqueTypes = new Set(filteredParks.map(park => park.parkType)).size;
  const totalAmenities = filteredParks.reduce((acc, park) => acc + (park.amenities?.length || 0), 0);
  const averageAmenities = filteredParks.length > 0 ? Math.round(totalAmenities / filteredParks.length) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando parques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow bg-gray-50">
      {/* Hero Section con imagen de fondo */}
      <div 
        className="relative text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Explora Nuestros <span className="text-yellow-300">Parques</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Descubre espacios verdes únicos en la Zona Metropolitana de Guadalajara para toda la familia
            </p>
            <div className="mt-8 flex justify-center items-center space-x-8 text-green-100">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalParks}</div>
                <div className="text-sm">Parques Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{uniqueTypes}</div>
                <div className="text-sm">Tipos Diferentes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{averageAmenities}</div>
                <div className="text-sm">Amenidades Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio Publicitario - Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <AdSpace spaceId="1" position="header" pageType="parks" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros modernos */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Encuentra tu Parque Ideal</h3>
            </div>
            <SimpleFilterSidebar onApplyFilters={handleApplyFilters} />
          </div>
        </div>

        {/* Resultados con Sidebar */}
        <div className="mb-8" id="resultados-busqueda">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Resultados de Búsqueda
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {totalParks} parques encontrados que coinciden con tus criterios
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(endIndex, totalParks)} de {totalParks}
                    </div>
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
              </div>
            </div>

            {/* Sidebar Publicitario */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <AdSpace spaceId="2" position="sidebar" pageType="parks" />
              </div>
            </div>
          </div>
        </div>

        {/* Paginación moderna */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 transition-all duration-200 ${
                        currentPage === pageNumber 
                          ? "bg-primary hover:bg-primary-600 text-white shadow-md" 
                          : "text-primary border-primary hover:bg-primary hover:text-white"
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Información adicional de paginación */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Navegando por {totalParks} parques en {totalPages} páginas
              </p>
            </div>
          </div>
        )}

        {/* Sección de estadísticas adicionales */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Red de Parques Metropolitanos
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Nuestra red de parques urbanos ofrece espacios diversos para recreación, deporte, cultura y conexión con la naturaleza en toda la zona metropolitana.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Trees className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Espacios Verdes</h4>
                <p className="text-gray-600">
                  Áreas naturales diseñadas para la conservación y disfrute de la biodiversidad urbana
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Actividades Familiares</h4>
                <p className="text-gray-600">
                  Programas y eventos diseñados para fortalecer los vínculos comunitarios y familiares
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ubicaciones Estratégicas</h4>
                <p className="text-gray-600">
                  Parques distribuidos estratégicamente para garantizar acceso equitativo en toda la ciudad
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Espacio Publicitario - Footer */}
        <div className="mt-8 mb-6">
          <AdSpace spaceId="3" position="footer" pageType="parks" />
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
    </div>
  );
};

export default Parks;