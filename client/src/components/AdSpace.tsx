import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';

interface AdSpaceProps {
  spaceId: string | number;
  position: 'header' | 'sidebar' | 'footer' | 'hero' | 'profile' | 'banner' | 'sidebar-sports' | 'sidebar-events' | 'sidebar-nature' | 'sidebar-family';
  pageType: 'homepage' | 'parks' | 'tree-species' | 'activities' | 'concessions' | 'activity-detail' | 'instructors' | 'instructor-profile' | 'volunteers';
  className?: string;
}

interface AdPlacement {
  id: number;
  adSpaceId: number;
  advertisementId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  advertisement: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    altText: string;
    isActive: boolean;
    updatedAt?: string;
  };
}

interface AdSpace {
  id: number;
  pageType: string;
  position: string;
  dimensions: string;
  maxFileSize: number;
  allowedFormats: string[];
  isActive: boolean;
}

const AdSpace: React.FC<AdSpaceProps> = ({ spaceId, position, pageType, className = '' }) => {
  // Removido isVisible para usuarios públicos
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRender, setForceRender] = useState(0);

  // Obtener el espacio publicitario y sus asignaciones activas
  const { data: placementsResponse, isLoading, refetch } = useQuery({
    queryKey: [`/api/advertising/placements`, spaceId, pageType], // Query key estable
    queryFn: async () => {
      const timestamp = Date.now();
      const response = await fetch(`/api/advertising/placements?spaceId=${spaceId}&pageType=${pageType}&_t=${timestamp}`);
      if (!response.ok) throw new Error('Error al cargar asignaciones');
      return response.json();
    },
    refetchInterval: 3 * 1000, // Refrescar cada 3 segundos
    staleTime: 1000, // Considerar datos válidos por 1 segundo
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Obtener la asignación activa (si existe)
  const activePlacement = placementsResponse?.success && placementsResponse.data?.length > 0 
    ? placementsResponse.data[0] 
    : null;





  // Registrar impresión cuando el componente carga
  useEffect(() => {
    if (activePlacement && !hasTrackedImpression) {
      trackImpression(activePlacement.id);
      setHasTrackedImpression(true);
    }
  }, [activePlacement, hasTrackedImpression]);



  // Escuchar eventos globales de actualización de publicidad
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adForceUpdate') {
        refetch();
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      refetch();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    };
  }, [refetch]);

  const trackImpression = async (placementId: number) => {
    try {
      await fetch('/api/advertising/track-impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placementId })
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (placementId: number) => {
    try {
      await fetch('/api/advertising/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placementId })
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activePlacement) {
      trackClick(activePlacement.id);
      
      if (activePlacement.advertisement.targetUrl) {
        window.open(activePlacement.advertisement.targetUrl, '_blank');
      }
    }
  };

  // Removido handleClose para usuarios públicos

  // Si está cargando o no hay asignación activa, no mostrar nada
  if (isLoading || !activePlacement) {
    return null;
  }

  const { advertisement } = activePlacement;
  
  // Sistema simple de cache-busting
  const getImageUrlWithCacheBuster = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    const updatedAt = advertisement.updatedAt || new Date().toISOString();
    const timestamp = new Date(updatedAt).getTime();
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    return `${imageUrl}${separator}v=${timestamp}`;
  };


  
  // Estilos base según la posición
  const baseStyles = {
    header: 'w-full max-w-6xl mx-auto h-24 bg-white border border-gray-200 rounded-lg shadow-sm mb-6',
    hero: 'w-full max-w-4xl mx-auto h-20 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg',
    sidebar: 'w-full h-64 bg-white border border-gray-200 rounded-lg shadow-sm mb-6',
    profile: 'w-full h-48 bg-white border border-gray-200 rounded-lg shadow-sm',
    footer: 'w-full max-w-6xl mx-auto h-20 bg-white border border-gray-200 rounded-lg shadow-sm mt-6',
    banner: 'w-full h-[150px] bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden',
    'sidebar-sports': 'bg-white rounded-lg border shadow-sm p-4',
    'sidebar-events': 'bg-white rounded-lg border shadow-sm p-4',
    'sidebar-nature': 'bg-white rounded-lg border shadow-sm p-4',
    'sidebar-family': 'bg-white rounded-lg border shadow-sm p-4'
  };

  const containerStyle = baseStyles[position as keyof typeof baseStyles] || baseStyles.sidebar;

  return (
    <div 
      className={`${containerStyle} ${className} relative overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        position.startsWith('sidebar-') ? '' : 'cursor-pointer'
      }`} 
      onClick={position.startsWith('sidebar-') ? undefined : handleAdClick}
    >
      {/* Botón de cerrar removido para usuarios públicos */}

      {/* Contenido del anuncio */}
      <div className={`h-full ${position === 'sidebar' ? 'flex flex-col' : position === 'banner' ? 'flex items-center justify-center' : position.startsWith('sidebar-') ? 'text-center' : 'flex items-center justify-between'} ${position === 'banner' ? 'p-0' : position.startsWith('sidebar-') ? '' : 'p-4'}`}>
        {position === 'banner' ? (
          // Layout específico para banner - imagen completa
          <div className="w-full h-full">
            {advertisement.imageUrl && (
              <img
                src={getImageUrlWithCacheBuster(advertisement.imageUrl)}
                alt={advertisement.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : position.startsWith('sidebar-') ? (
          // Layout tipo tarjeta para espacios promocionales
          <div className="text-center">
            {advertisement.imageUrl && (
              <img 
                src={getImageUrlWithCacheBuster(advertisement.imageUrl)}
                alt={advertisement.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="font-semibold text-gray-900 mb-2">{advertisement.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {advertisement.description}
            </p>
            <button 
              className={`w-full text-white py-2 px-4 rounded-lg transition-colors text-sm ${
                position === 'sidebar-sports' ? 'bg-blue-600 hover:bg-blue-700' :
                position === 'sidebar-events' ? 'bg-purple-600 hover:bg-purple-700' :
                position === 'sidebar-nature' ? 'bg-green-600 hover:bg-green-700' :
                position === 'sidebar-family' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={(e) => {
                e.stopPropagation(); // Evitar doble click
                handleAdClick(e);
              }}
            >
              {position === 'sidebar-sports' ? 'Inscríbete Ahora' :
               position === 'sidebar-events' ? 'Ver Calendario' :
               position === 'sidebar-nature' ? 'Más Información' :
               position === 'sidebar-family' ? 'Explorar' :
               'Ver Más'}
            </button>
          </div>
        ) : position === 'sidebar' ? (
          // Layout vertical para sidebar
          <>
            {/* Imagen del anuncio */}
            {advertisement.imageUrl && (
              <div className="flex-shrink-0 mb-3">
                <img
                  src={getImageUrlWithCacheBuster(advertisement.imageUrl)}
                  alt={advertisement.title}
                  className="w-full h-32 object-contain rounded bg-gray-50"
                />
              </div>
            )}

            {/* Contenido textual */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {advertisement.title}
                </h4>
                <ExternalLink className="h-3 w-3 text-gray-400 ml-1 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                {advertisement.description}
              </p>
              
              {/* Indicador de publicidad */}
              <div className="flex justify-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Publicidad
                </span>
              </div>
            </div>
          </>
        ) : (
          // Layout horizontal para otras posiciones
          <>
            {/* Imagen del anuncio */}
            {advertisement.imageUrl && (
              <div key={`horizontal-container-${advertisement.id}-${refreshKey}-${forceRender}`} className="flex-shrink-0 mr-4">
                <img
                  key={`horizontal-${advertisement.id}-${refreshKey}-${forceRender}`}
                  src={getImageUrlWithCacheBuster(advertisement.imageUrl)}
                  alt={advertisement.title}
                  className="h-full w-auto max-h-16 object-contain rounded"
                />
              </div>
            )}

            {/* Contenido textual */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {advertisement.title}
                </h4>
                <ExternalLink className="h-3 w-3 text-gray-400 ml-1 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {advertisement.description}
              </p>
              {advertisement.altText && (
                <p className="text-xs text-gray-500 mt-1">
                  {advertisement.altText}
                </p>
              )}
            </div>

            {/* Indicador de publicidad */}
            <div className="flex-shrink-0 ml-4">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                Publicidad
              </span>
            </div>
          </>
        )}
      </div>

      {/* Overlay de hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00a587]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
};

export default AdSpace;