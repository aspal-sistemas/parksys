/**
 * GESTOR COMPLETO DE AMENIDADES PARA PARQUES
 * ========================================
 * 
 * Componente integral para gestión de amenidades y servicios de parques
 * con funcionalidades de agregar, editar y eliminar amenidades
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AmenityIcon from '@/components/AmenityIcon';
import { 
  Plus, 
  Trash2, 
  Edit, 
  MapPin,
  Settings,
  Info
} from 'lucide-react';

interface ParkAmenity {
  id: number;
  parkId: number;
  amenityId: number;
  moduleName?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  surfaceArea?: string;
  status: string;
  description?: string;
  amenityName: string;
  amenityIcon: string;
  customIconUrl?: string;
}

interface Amenity {
  id: number;
  name: string;
  icon: string;
  category?: string;
}

interface ParkAmenitiesManagerProps {
  parkId: number;
}

const categoryTranslations: Record<string, string> = {
  'general': 'General',
  'servicios': 'Servicios',
  'infraestructura': 'Infraestructura', 
  'naturaleza': 'Naturaleza',
  'accesibilidad': 'Accesibilidad',
  'recreacion': 'Recreación',
  'educacion': 'Educación'
};

const statusTranslations: Record<string, string> = {
  'activo': 'Activo',
  'inactivo': 'Inactivo',
  'mantenimiento': 'En Mantenimiento'
};

export default function ParkAmenitiesManager({ parkId }: ParkAmenitiesManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para modales
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<ParkAmenity | null>(null);

  // Estados para formularios
  const [selectedAmenityId, setSelectedAmenityId] = useState<number | null>(null);
  const [moduleName, setModuleName] = useState('');
  const [surfaceArea, setSurfaceArea] = useState('');
  const [description, setDescription] = useState('');

  // Consulta para obtener amenidades del parque
  const { data: parkAmenities = [], isLoading: amenitiesLoading, error: amenitiesError } = useQuery<ParkAmenity[]>({
    queryKey: [`/api/parks/${parkId}/amenities`],
    queryFn: async () => {
      console.log('🔍 FRONTEND: Cargando amenidades para parque', parkId);
      const response = await fetch(`/api/parks/${parkId}/amenities`, {
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
      if (!response.ok) throw new Error('Error cargando amenidades');
      const data = await response.json();
      console.log('✅ FRONTEND: Amenidades cargadas:', data);
      return data;
    },
    enabled: !!parkId
  });

  // Consulta para obtener todas las amenidades disponibles
  const { data: availableAmenities = [] } = useQuery<Amenity[]>({
    queryKey: ['/api/amenities'],
    queryFn: async () => {
      const response = await fetch('/api/amenities', {
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
      if (!response.ok) throw new Error('Error cargando amenidades disponibles');
      return response.json();
    }
  });

  // Mutación para agregar amenidad
  const addAmenityMutation = useMutation({
    mutationFn: async (amenityData: any) => {
      return apiRequest(`/api/parks/${parkId}/amenities`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        },
        data: amenityData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Amenidad agregada",
        description: "La amenidad se ha agregado exitosamente al parque."
      });
    },
    onError: (error) => {
      console.error('Error agregando amenidad:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la amenidad al parque.",
        variant: "destructive"
      });
    }
  });

  // Mutación para eliminar amenidad
  const removeAmenityMutation = useMutation({
    mutationFn: async (parkAmenityId: number) => {
      return apiRequest(`/api/park-amenities/${parkAmenityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
      toast({
        title: "Amenidad eliminada",
        description: "La amenidad se ha eliminado del parque."
      });
    },
    onError: (error) => {
      console.error('Error eliminando amenidad:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la amenidad del parque.",
        variant: "destructive"
      });
    }
  });

  // Mutación para actualizar amenidad
  const updateAmenityMutation = useMutation({
    mutationFn: async ({ parkAmenityId, data }: { parkAmenityId: number, data: any }) => {
      return apiRequest(`/api/park-amenities/${parkAmenityId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        },
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
      setIsEditDialogOpen(false);
      setEditingAmenity(null);
      toast({
        title: "Amenidad actualizada",
        description: "La información de la amenidad se ha actualizado."
      });
    },
    onError: (error) => {
      console.error('Error actualizando amenidad:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la amenidad.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedAmenityId(null);
    setModuleName('');
    setSurfaceArea('');
    setDescription('');
  };

  const handleAddAmenity = () => {
    if (!selectedAmenityId) {
      toast({
        title: "Error",
        description: "Por favor selecciona una amenidad.",
        variant: "destructive"
      });
      return;
    }

    const amenityData = {
      amenityId: selectedAmenityId,
      moduleName: moduleName || null,
      surfaceArea: surfaceArea || null,
      description: description || null,
      status: 'activo'
    };

    addAmenityMutation.mutate(amenityData);
  };

  const handleEditAmenity = (amenity: ParkAmenity) => {
    setEditingAmenity(amenity);
    setModuleName(amenity.moduleName || '');
    setSurfaceArea(amenity.surfaceArea || '');
    setDescription(amenity.description || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateAmenity = () => {
    if (!editingAmenity) return;

    const updateData = {
      moduleName: moduleName || null,
      surfaceArea: surfaceArea || null,
      description: description || null
    };

    updateAmenityMutation.mutate({
      parkAmenityId: editingAmenity.id,
      data: updateData
    });
  };

  const handleRemoveAmenity = (parkAmenityId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta amenidad del parque?')) {
      removeAmenityMutation.mutate(parkAmenityId);
    }
  };

  // Agrupar amenidades por categoría - necesitamos obtener la categoría del endpoint de amenidades
  const amenitiesByCategory = parkAmenities.reduce((acc, amenity) => {
    // Por ahora usamos una categoría genérica hasta que tengamos los datos completos
    const category = 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, ParkAmenity[]>);

  console.log('🔍 AMENITIES MANAGER - Renderizando con:', {
    parkId,
    amenitiesCount: parkAmenities.length,
    amenitiesLoading,
    amenitiesError: amenitiesError?.message || null,
    categoriesCount: Object.keys(amenitiesByCategory).length
  });

  if (amenitiesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando amenidades...</p>
      </div>
    );
  }

  if (amenitiesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error cargando amenidades: {amenitiesError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón agregar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Amenidades del Parque</h3>
          <p className="text-sm text-gray-600">
            Total: {parkAmenities.length} amenidades configuradas
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Amenidad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Amenidad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amenidad</label>
                <select
                  value={selectedAmenityId || ''}
                  onChange={(e) => setSelectedAmenityId(parseInt(e.target.value) || null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar amenidad...</option>
                  {availableAmenities
                    .filter(amenity => !parkAmenities.some(pa => pa.id === amenity.id))
                    .map((amenity) => (
                      <option key={amenity.id} value={amenity.id}>
                        {amenity.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Módulo/Ubicación</label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Ej: Zona Norte, Entrada Principal..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Superficie (m²)</label>
                <Input
                  value={surfaceArea}
                  onChange={(e) => setSurfaceArea(e.target.value)}
                  placeholder="Ej: 150.5"
                  type="number"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descripción</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción adicional..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddAmenity}
                disabled={!selectedAmenityId || addAmenityMutation.isPending}
              >
                {addAmenityMutation.isPending ? 'Agregando...' : 'Agregar Amenidad'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de amenidades por categoría */}
      {parkAmenities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No hay amenidades configuradas para este parque</p>
          <p className="text-sm mt-2">Haz clic en "Agregar Amenidad" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-900 mb-3 capitalize">
                {categoryTranslations[category] || category} ({amenities.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <Card key={amenity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AmenityIcon 
                            name={amenity.amenityName}
                            iconType={amenity.amenityIcon === 'custom' ? 'custom' : 'system'}
                            customIconUrl={amenity.customIconUrl}
                            size={40}
                          />
                          <div>
                            <h5 className="font-medium">{amenity.amenityName}</h5>
                            <Badge variant="outline" className="text-xs">
                              {statusTranslations[amenity.status as keyof typeof statusTranslations] || amenity.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAmenity(amenity)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveAmenity(amenity.id)}
                            disabled={removeAmenityMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {amenity.moduleName && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{amenity.moduleName}</span>
                        </div>
                      )}
                      
                      {amenity.surfaceArea && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <Settings className="h-3 w-3" />
                          <span>{amenity.surfaceArea} m²</span>
                        </div>
                      )}
                      
                      {amenity.description && (
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{amenity.description}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Amenidad</DialogTitle>
          </DialogHeader>
          {editingAmenity && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AmenityIcon 
                  name={editingAmenity.amenityName}
                  iconType={editingAmenity.amenityIcon === 'custom' ? 'custom' : 'system'}
                  customIconUrl={editingAmenity.customIconUrl}
                  size={32}
                />
                <div>
                  <h5 className="font-medium">{editingAmenity.amenityName}</h5>
                  <p className="text-sm text-gray-600 capitalize">
                    General
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Módulo/Ubicación</label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="Ej: Zona Norte, Entrada Principal..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Superficie (m²)</label>
                <Input
                  value={surfaceArea}
                  onChange={(e) => setSurfaceArea(e.target.value)}
                  placeholder="Ej: 150.5"
                  type="number"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descripción</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción adicional..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={handleUpdateAmenity}
              disabled={updateAmenityMutation.isPending}
            >
              {updateAmenityMutation.isPending ? 'Actualizando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}