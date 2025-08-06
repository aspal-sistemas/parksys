import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// ====================================
// INTERFACES
// ====================================

interface SpaceMapping {
  id: number;
  pageType: string;
  position: string;
  spaceId: number;
  isActive: boolean;
  priority: number;
  fallbackBehavior: 'hide' | 'placeholder' | 'alternative';
  layoutConfig?: {
    responsive: boolean;
    aspectRatio?: string;
    maxWidth?: string;
    minHeight?: string;
    customStyles?: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdSpace {
  id: number;
  name: string;
  pageType: string;
  position: string;
  dimensions: string;
  isActive: boolean;
  maxFileSize: number;
  allowedFormats: string[];
  category?: string;
}

interface AdPlacement {
  id: number;
  spaceId: number;
  advertisementId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  frequency: string;
  advertisement: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    altText: string;
    buttonText?: string;
    mediaType: 'image' | 'video' | 'gif';
    duration?: number;
    isActive: boolean;
    updatedAt: string;
  };
}

interface AnalyticsData {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  activeSpaces: number;
  activePlacements: number;
  topPerformingAds: Array<{
    id: number;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  spaceUtilization: Array<{
    pageType: string;
    position: string;
    spaceId: number;
    isUtilized: boolean;
    placementCount: number;
  }>;
}

// ====================================
// HOOK PRINCIPAL DEL SISTEMA DE PUBLICIDAD
// ====================================

export const useAdSystem = () => {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ====================================
  // QUERIES PARA DATOS
  // ====================================

  // Obtener todos los espacios publicitarios
  const spacesQuery = useQuery({
    queryKey: ['ad-spaces'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/spaces');
      if (!response.ok) throw new Error('Error al obtener espacios');
      return response.json();
    },
    staleTime: 60000, // 1 minuto
  });

  // Obtener mapeos de espacios
  const mappingsQuery = useQuery({
    queryKey: ['space-mappings'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/space-mappings');
      if (!response.ok) throw new Error('Error al obtener mapeos');
      return response.json();
    },
    staleTime: 60000,
  });

  // Obtener asignaciones activas
  const placementsQuery = useQuery({
    queryKey: ['ad-placements-active'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/placements?active=true');
      if (!response.ok) throw new Error('Error al obtener asignaciones');
      return response.json();
    },
    staleTime: 30000, // 30 segundos
  });

  // Obtener analytics
  const analyticsQuery = useQuery({
    queryKey: ['ad-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/analytics');
      if (!response.ok) throw new Error('Error al obtener analytics');
      return response.json();
    },
    staleTime: 120000, // 2 minutos
  });

  // ====================================
  // MUTATIONS PARA ACCIONES
  // ====================================

  // Crear/actualizar mapeo de espacio
  const createSpaceMappingMutation = useMutation({
    mutationFn: async (mapping: Partial<SpaceMapping>) => {
      const response = await fetch('/api/advertising-management/space-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapping),
      });
      if (!response.ok) throw new Error('Error al crear mapeo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      triggerGlobalUpdate();
    },
  });

  // Eliminar mapeo de espacio
  const deleteSpaceMappingMutation = useMutation({
    mutationFn: async (mappingId: number) => {
      const response = await fetch(`/api/advertising-management/space-mappings/${mappingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar mapeo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      triggerGlobalUpdate();
    },
  });

  // Actualizar estado de espacio
  const toggleSpaceStateMutation = useMutation({
    mutationFn: async ({ spaceId, isActive }: { spaceId: number; isActive: boolean }) => {
      const response = await fetch(`/api/advertising-management/spaces/${spaceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
      if (!response.ok) throw new Error('Error al actualizar espacio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['ad-placements-active'] });
      triggerGlobalUpdate();
    },
  });

  // Forzar actualización del sistema
  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      // Invalidar todas las caches
      await queryClient.invalidateQueries({ queryKey: ['ad-spaces'] });
      await queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-placements-active'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-analytics'] });
      
      // Disparar evento global
      triggerGlobalUpdate();
      
      return { success: true, timestamp: new Date().toISOString() };
    },
    onSuccess: () => {
      setLastUpdate(new Date());
    },
  });

  // ====================================
  // FUNCIONES DE UTILIDAD
  // ====================================

  const triggerGlobalUpdate = () => {
    // Disparar evento personalizado para actualizar todos los AdSpaces
    window.dispatchEvent(new CustomEvent('adSystemUpdate', {
      detail: { timestamp: Date.now() }
    }));
    
    // También enviar a localStorage para comunicación entre pestañas
    localStorage.setItem('adForceUpdate', Date.now().toString());
  };

  // Obtener mapeo específico por página y posición
  const getSpaceMapping = (pageType: string, position: string): SpaceMapping | null => {
    const mappings = mappingsQuery.data?.success ? mappingsQuery.data.data : [];
    return mappings.find((mapping: SpaceMapping) => 
      mapping.pageType === pageType && mapping.position === position && mapping.isActive
    ) || null;
  };

  // Obtener espacios huérfanos (configurados pero sin mapeo)
  const getOrphanedSpaces = (): AdSpace[] => {
    const spaces = spacesQuery.data || [];
    const mappings = mappingsQuery.data?.success ? mappingsQuery.data.data : [];
    
    const mappedSpaceIds = new Set(mappings.map((m: SpaceMapping) => m.spaceId));
    
    return spaces.filter((space: AdSpace) => 
      space.isActive && !mappedSpaceIds.has(space.id)
    );
  };

  // Obtener estadísticas de utilización
  const getUtilizationStats = () => {
    const spaces = spacesQuery.data || [];
    const mappings = mappingsQuery.data?.success ? mappingsQuery.data.data : [];
    const placements = placementsQuery.data?.success ? placementsQuery.data.data : [];
    
    const totalSpaces = spaces.length;
    const mappedSpaces = mappings.filter((m: SpaceMapping) => m.isActive).length;
    const spacesWithPlacements = new Set(placements.map((p: AdPlacement) => p.spaceId)).size;
    
    return {
      totalSpaces,
      mappedSpaces,
      spacesWithPlacements,
      utilizationRate: totalSpaces > 0 ? (spacesWithPlacements / totalSpaces) * 100 : 0,
      mappingRate: totalSpaces > 0 ? (mappedSpaces / totalSpaces) * 100 : 0,
    };
  };

  // Validar configuración del sistema
  const validateSystemHealth = () => {
    const issues: string[] = [];
    
    const orphanedSpaces = getOrphanedSpaces();
    if (orphanedSpaces.length > 0) {
      issues.push(`${orphanedSpaces.length} espacios huérfanos detectados`);
    }
    
    const mappings = mappingsQuery.data?.success ? mappingsQuery.data.data : [];
    const invalidMappings = mappings.filter((m: SpaceMapping) => {
      const spaces = spacesQuery.data || [];
      return !spaces.find((s: AdSpace) => s.id === m.spaceId && s.isActive);
    });
    
    if (invalidMappings.length > 0) {
      issues.push(`${invalidMappings.length} mapeos inválidos detectados`);
    }
    
    const placements = placementsQuery.data?.success ? placementsQuery.data.data : [];
    const expiredPlacements = placements.filter((p: AdPlacement) => {
      const endDate = new Date(p.endDate);
      return endDate < new Date() && p.isActive;
    });
    
    if (expiredPlacements.length > 0) {
      issues.push(`${expiredPlacements.length} asignaciones expiradas pero activas`);
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      lastCheck: new Date().toISOString(),
    };
  };

  // ====================================
  // EFECTOS Y EVENTOS
  // ====================================

  useEffect(() => {
    // Escuchar eventos de actualización desde otros componentes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adForceUpdate') {
        queryClient.invalidateQueries({ queryKey: ['ad-spaces'] });
        queryClient.invalidateQueries({ queryKey: ['space-mappings'] });
        queryClient.invalidateQueries({ queryKey: ['ad-placements-active'] });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  // ====================================
  // RETURN DEL HOOK
  // ====================================

  return {
    // Datos
    spaces: spacesQuery.data || [],
    mappings: mappingsQuery.data?.success ? mappingsQuery.data.data : [],
    placements: placementsQuery.data?.success ? placementsQuery.data.data : [],
    analytics: analyticsQuery.data?.success ? analyticsQuery.data.data : null,
    
    // Estados de carga
    isLoading: spacesQuery.isLoading || mappingsQuery.isLoading || placementsQuery.isLoading,
    isError: spacesQuery.isError || mappingsQuery.isError || placementsQuery.isError,
    
    // Acciones
    createSpaceMapping: createSpaceMappingMutation.mutate,
    deleteSpaceMapping: deleteSpaceMappingMutation.mutate,
    toggleSpaceState: toggleSpaceStateMutation.mutate,
    forceRefresh: forceRefreshMutation.mutate,
    
    // Estados de mutaciones
    isCreatingMapping: createSpaceMappingMutation.isPending,
    isDeletingMapping: deleteSpaceMappingMutation.isPending,
    isTogglingSpace: toggleSpaceStateMutation.isPending,
    isRefreshing: forceRefreshMutation.isPending,
    
    // Utilidades
    getSpaceMapping,
    getOrphanedSpaces,
    getUtilizationStats,
    validateSystemHealth,
    triggerGlobalUpdate,
    lastUpdate,
  };
};

// ====================================
// HOOK ESPECÍFICO PARA PÁGINA
// ====================================

export const usePageAdSpaces = (pageType: string) => {
  const { mappings, getSpaceMapping } = useAdSystem();
  
  const pageSpaces = mappings.filter((mapping: SpaceMapping) => 
    mapping.pageType === pageType && mapping.isActive
  );
  
  const getPositionMapping = (position: string) => getSpaceMapping(pageType, position);
  
  return {
    pageSpaces,
    getPositionMapping,
    hasSpaces: pageSpaces.length > 0,
  };
};