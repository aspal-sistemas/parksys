import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExtendedPark } from '@shared/schema';
import ParkDetail from '@/components/ParkDetail';
import { Button } from '@/components/ui/button';
import { MapPin, Trees, Users, Star } from 'lucide-react';
import heroImage from '@assets/group-of-tourists-walking-through-natural-reserve-2024-05-27-02-02-13-utc_1752940583323.jpg';
import logoImage from '@assets/logo_1751306368691.png';
import AdSpace from '@/components/AdSpace';

const ParksGrid: React.FC = () => {
  const [filters, setFilters] = useState<{
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }>({});
  
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
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
  const { data: parksResponse, isLoading } = useQuery<{data: ExtendedPark[], pagination: any}>({
    queryKey: [`/api/parks${buildQueryString()}`],
  });
  
  const allParks = parksResponse?.data || [];
  
  // Filtrar parques sin nombre o marcados como eliminados - mostrar todos en grid
  const parks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );
  
  const totalParks = parks.length;
  
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
  const uniqueTypes = new Set(parks.map(park => park.parkType)).size;
  const totalAmenities = parks.reduce((acc, park) => acc + (park.amenities?.length || 0), 0);
  const averageAmenities = parks.length > 0 ? Math.round(totalAmenities / parks.length) : 0;

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-primary via-primary-600 to-emerald-600 text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 165, 135, 0.8), rgba(0, 165, 135, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={logoImage} 
                alt="Agencia Metropolitana de Bosques Urbanos" 
                className="h-16 w-auto filter brightness-0 invert drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Descubre Nuestros Parques
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
              Explora los espacios verdes más hermosos de Guadalajara. Cada parque es una oportunidad para conectar con la naturaleza y crear recuerdos inolvidables.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                <div className="text-3xl font-bold mb-2">{totalParks}</div>
                <div className="text-white/90">Parques Disponibles</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                <div className="text-3xl font-bold mb-2">{uniqueTypes}</div>
                <div className="text-white/90">Tipos de Espacios</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                <div className="text-3xl font-bold mb-2">{averageAmenities}</div>
                <div className="text-white/90">Amenidades Promedio</div>
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
        {/* Banner publicitario */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-8">
          <AdSpace 
            spaceId="31" 
            position="banner" 
            pageType="parks" 
            className="w-full"
          />
        </div>

        {/* Grid de Parques */}
        <div className="mb-8" id="resultados-busqueda">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Todos los Parques
                </h2>
                <p className="text-gray-600 mt-1">
                  {totalParks} parques disponibles en nuestro sistema
                </p>
              </div>
            </div>
            
            {/* Grid responsivo de parques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.map((park) => (
                <div 
                  key={park.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSelectedParkId(park.id);
                    setModalOpen(true);
                  }}
                >
                  {/* Imagen del parque */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {park.imageUrl ? (
                      <img 
                        src={park.imageUrl}
                        alt={park.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                        <Trees className="h-12 w-12 text-green-600" />
                      </div>
                    )}
                    
                    {/* Badge de tipo de parque */}
                    {park.parkType && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        {park.parkType}
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {park.name}
                    </h3>
                    
                    {/* Ubicación */}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {park.municipality || 'Guadalajara'}, {park.state || 'Jalisco'}
                      </span>
                    </div>
                    
                    {/* Descripción corta */}
                    {park.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {park.description.substring(0, 100)}...
                      </p>
                    )}
                    
                    {/* Estadísticas del parque */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Trees className="h-3 w-3" />
                        Parque urbano
                      </span>
                      {park.amenities && park.amenities.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {park.amenities.length} amenidades
                        </span>
                      )}
                    </div>
                    
                    {/* Botón de acción */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mensaje si no hay parques */}
            {parks.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Trees className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron parques
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar tus filtros de búsqueda para encontrar más resultados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para mostrar detalles del parque seleccionado */}
      {modalOpen && selectedPark && (
        <ParkDetail
          park={selectedPark}
          onClose={() => {
            setModalOpen(false);
            setSelectedParkId(null);
          }}
          isOpen={modalOpen}
        />
      )}
    </div>
  );
};

export default ParksGrid;