import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink } from 'lucide-react';

interface AdSpaceProps {
  spaceId: string;
  position: 'header' | 'sidebar' | 'footer' | 'hero' | 'profile';
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
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRender, setForceRender] = useState(0);

  // Obtener el espacio publicitario y sus asignaciones activas con invalidación ultra-agresiva
  const { data: placementsResponse, isLoading } = useQuery({
    queryKey: [`/api/advertising/placements`, spaceId, pageType, position],
    queryFn: async () => {
      const response = await fetch(`/api/advertising/placements?spaceId=${spaceId}&pageType=${pageType}&position=${position}`);
      if (!response.ok) throw new Error('Error al cargar asignaciones');
      return response.json();
    },
    refetchInterval: 10 * 1000, // Refrescar cada 10 segundos para detectar cambios más rápido
    staleTime: 0, // Considerar los datos siempre obsoletos para forzar actualizaciones
    gcTime: 0, // No mantener cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Obtener la asignación activa (si existe)
  const activePlacement = placementsResponse?.success && placementsResponse.data?.length > 0 
    ? placementsResponse.data[0] 
    : null;

  // Debug logging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🎯 AdSpace Debug:', {
      spaceId,
      position,
      pageType,
      isLoading,
      placementsResponse,
      activePlacement
    });
  }

  // Registrar impresión cuando el componente es visible
  useEffect(() => {
    if (activePlacement && !hasTrackedImpression && isVisible) {
      trackImpression(activePlacement.id);
      setHasTrackedImpression(true);
    }
  }, [activePlacement, hasTrackedImpression, isVisible]);

  // Detectar cambios en updated_at y forzar re-render
  useEffect(() => {
    if (activePlacement?.advertisement?.updatedAt) {
      const currentTime = new Date(activePlacement.advertisement.updatedAt).getTime();
      setForceRender(currentTime);
      setRefreshKey(prev => prev + 1);
    }
  }, [activePlacement?.advertisement?.updatedAt]);

  // Escuchar eventos globales de actualización de publicidad
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adForceUpdate') {
        console.log('🔄 AdSpace: Forzando actualización por cambio en localStorage');
        setRefreshKey(Date.now());
        setForceRender(prev => prev + 1);
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      console.log('🔄 AdSpace: Forzando actualización por evento personalizado');
      setRefreshKey(Date.now());
      setForceRender(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    };
  }, []);

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

  const handleAdClick = () => {
    if (activePlacement) {
      trackClick(activePlacement.id);
      if (activePlacement.advertisement.targetUrl) {
        window.open(activePlacement.advertisement.targetUrl, '_blank');
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Si está cargando o no hay asignación activa, no mostrar nada
  if (isLoading || !activePlacement || !isVisible) {
    return null;
  }

  const { advertisement } = activePlacement;
  
  // Sistema ultra-extremo de cache-busting para imágenes con 7 parámetros
  const getImageUrlWithCacheBuster = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    // Parámetros de cache-busting ultra-agresivos
    const updatedAt = advertisement.updatedAt || new Date().toISOString();
    const timestamp = new Date(updatedAt).getTime();
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    // 7 parámetros de cache-busting para máxima invalidación
    const cacheBustParams = `v=${timestamp}&r=${refreshKey}&f=${forceRender}&t=${Date.now()}&rnd=${Math.random().toString(36).substring(7)}&cb=${Math.random()}&uid=${advertisement.id}_${timestamp}`;
    
    return `${imageUrl}${separator}${cacheBustParams}`;
  };

  // Función para forzar recarga de imágenes en el DOM
  const forceImageReload = () => {
    const images = document.querySelectorAll(`img[src*="${advertisement.imageUrl}"]`);
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      const originalSrc = imgElement.src;
      imgElement.src = '';
      setTimeout(() => {
        imgElement.src = getImageUrlWithCacheBuster(advertisement.imageUrl);
      }, 100);
    });
  };

  // Función para crear elemento de imagen completamente nuevo
  const createImageElement = (src: string, className: string, alt: string) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = className;
    img.alt = alt;
    img.key = `${advertisement.id}_${refreshKey}_${forceRender}`;
    return img;
  };
  
  // Estilos base según la posición
  const baseStyles = {
    header: 'w-full max-w-6xl mx-auto h-24 bg-white border border-gray-200 rounded-lg shadow-sm mb-6',
    hero: 'w-full max-w-4xl mx-auto h-20 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg',
    sidebar: 'w-full h-64 bg-white border border-gray-200 rounded-lg shadow-sm mb-6',
    profile: 'w-full h-48 bg-white border border-gray-200 rounded-lg shadow-sm',
    footer: 'w-full max-w-6xl mx-auto h-20 bg-white border border-gray-200 rounded-lg shadow-sm mt-6'
  };

  const containerStyle = baseStyles[position];

  return (
    <div className={`${containerStyle} ${className} relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-200`} onClick={handleAdClick}>
      {/* Botón de cerrar - aparece al hacer hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-2 right-2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        <X className="h-3 w-3 text-gray-600" />
      </button>

      {/* Contenido del anuncio */}
      <div className={`h-full ${position === 'sidebar' ? 'flex flex-col' : 'flex items-center justify-between'} p-4`}>
        {position === 'sidebar' ? (
          // Layout vertical para sidebar
          <>
            {/* Imagen del anuncio */}
            {advertisement.imageUrl && (
              <div key={`sidebar-container-${advertisement.id}-${refreshKey}-${forceRender}`} className="flex-shrink-0 mb-3">
                <img
                  key={`sidebar-${advertisement.id}-${refreshKey}-${forceRender}`}
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