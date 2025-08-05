import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, List, Filter, Layers, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Constantes de estado y condición para activos
const ASSET_STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'maintenance', label: 'En Mantenimiento' },
  { value: 'retired', label: 'Retirado' },
  { value: 'storage', label: 'En Almacén' }
];

const ASSET_CONDITIONS = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Malo' },
  { value: 'critical', label: 'Crítico' }
];

// Tipado para los datos
interface Asset {
  id: number;
  name: string;
  description: string | null;
  status: string;
  condition: string;
  parkId: number;
  categoryId: number;
  latitude: string | null;
  longitude: string | null;
  locationDescription: string | null;
  category?: { name: string; icon: string; color: string };
  park?: { name: string };
}

interface Park {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
}

interface AssetCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// Componente mapa que utiliza Google Maps
const AssetMap: React.FC = () => {
  const [selectedPark, setSelectedPark] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<string | 'all'>('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [_, setLocation] = useLocation();

  // Cargar datos de activos, parques y categorías
  const { data: assets, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['/api/assets'],
    select: (data: Asset[]) => data.filter(asset => asset.latitude && asset.longitude),
  });

  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/asset-categories'],
  });

  // Filtrar activos según las selecciones
  const filteredAssets = React.useMemo(() => {
    if (!assets) return [];
    
    return assets.filter(asset => {
      const matchesPark = selectedPark === 'all' || asset.parkId === selectedPark;
      const matchesCategory = selectedCategory === 'all' || asset.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
      
      return matchesPark && matchesCategory && matchesStatus && matchesCondition;
    });
  }, [assets, selectedPark, selectedCategory, selectedStatus, selectedCondition]);

  // Función para mostrar un mapa estático 
  const staticMapUrl = useCallback((lat: number = 19.4326, lng: number = -99.1332, zoom: number = 12, width: number = 600, height: number = 600) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
  }, []);

  // Mapa de referencia 
  const mapRef = useCallback((node: HTMLDivElement) => {
    // Solo usaremos un enfoque más simple para la geolocalización
    console.log("Elemento del mapa cargado");
    setMapLoaded(true);
  }, []);

  // Versión simplificada para mostrar activos en mapa estático
  useEffect(() => {
    console.log(`Mostrando ${filteredAssets.length} activos en el mapa`);
    // Esta función ahora solo registra cambios pero no depende de la API de Google Maps
    setMapLoaded(true);
  }, [filteredAssets, categories]);
  
  // Esta función se usa cuando se selecciona un parque en la versión estática
  useEffect(() => {
    if (selectedPark !== 'all') {
      console.log(`Parque seleccionado: ${selectedPark}`);
    }
  }, [selectedPark, parks]);

  // Determinar si hay activos sin coordenadas de geolocalización
  const unlocatedAssets = assets?.filter(asset => !asset.latitude || !asset.longitude) || [];
  const showUnlocatedWarning = unlocatedAssets.length > 0;

  // Determinar cuántos activos se muestran en el mapa actualmente
  const displayedAssetsCount = filteredAssets.length;
  const totalLocatedAssets = assets?.filter(asset => asset.latitude && asset.longitude).length || 0;

  const isLoading = isLoadingAssets || isLoadingParks || isLoadingCategories;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Mapa de Activos</h1>
          <div className="grid gap-6">
            <Skeleton className="h-[600px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mapa de Activos</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setLocation('/admin/assets')}>
              <List className="mr-2 h-4 w-4" />
              Ver Lista
            </Button>
            <Button onClick={() => setLocation('/admin/assets/new')}>
              <Layers className="mr-2 h-4 w-4" />
              Nuevo Activo
            </Button>
          </div>
        </div>

        {/* Información sobre activos mostrados */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {displayedAssetsCount} de {totalLocatedAssets} activos con ubicación definida.
            {unlocatedAssets.length > 0 && ` (${unlocatedAssets.length} activos sin geolocalización)`}
          </p>
        </div>

        {/* Alerta para activos sin geolocalización */}
        {showUnlocatedWarning && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <AlertDescription className="text-amber-800">
              Hay {unlocatedAssets.length} activos sin coordenadas de geolocalización. 
              Estos activos no aparecerán en el mapa. Puede agregar coordenadas editando cada activo.
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Select value={selectedPark.toString()} onValueChange={(value) => setSelectedPark(value === 'all' ? 'all' : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {parks?.map((park) => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory.toString()} onValueChange={(value) => setSelectedCategory(value === 'all' ? 'all' : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ASSET_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCondition} onValueChange={(value) => setSelectedCondition(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una condición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las condiciones</SelectItem>
              {ASSET_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contenedor del mapa */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Mapa de Ubicación de Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden" style={{ width: '100%', height: '600px' }}>
            {mapLoaded ? (
              <div>
                {/* Mapa estático como alternativa */}
                <img 
                  src={staticMapUrl(19.4326, -99.1332, 12, 1200, 600)} 
                  alt="Mapa de activos"
                  className="w-full h-full object-cover"
                />
                
                {/* Simulación visual de activos en el mapa */}
                <div className="relative -mt-[600px] w-full h-[600px] pointer-events-none">
                  {filteredAssets.map((asset, index) => {
                    if (!asset.latitude || !asset.longitude) return null;
                    
                    const lat = parseFloat(asset.latitude);
                    const lng = parseFloat(asset.longitude);
                    
                    // Calcular posición aproximada en el mapa estático (simulación)
                    const category = categories?.find(cat => cat.id === asset.categoryId);
                    const color = category?.color || '#3B82F6';
                    
                    // Posiciones relativas aproximadas (solo para demo)
                    const posLeft = 50 + (index * 3) % 80;
                    const posTop = 30 + (index * 5) % 80;
                    
                    return (
                      <div 
                        key={asset.id}
                        className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md transition-all hover:scale-150 z-10"
                        style={{ 
                          backgroundColor: color,
                          left: `${posLeft}%`, 
                          top: `${posTop}%`,
                        }}
                        title={asset.name}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Cargando visualización de activos...</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Lista de activos visibles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Activos Mostrados en el Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const category = categories?.find(cat => cat.id === asset.categoryId);
                  const park = parks?.find(p => p.id === asset.parkId);
                  
                  return (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold truncate" title={asset.name}>
                              {asset.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {park?.name || 'Parque no especificado'}
                            </p>
                          </div>
                          <Badge 
                            className={
                              asset.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                              asset.status === 'maintenance' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              asset.status === 'damaged' ? 'bg-red-100 text-red-800 border-red-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }
                          >
                            {ASSET_STATUSES.find(s => s.value === asset.status)?.label || asset.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category?.color || '#3B82F6' }}
                          />
                          <span className="text-sm">{category?.name || 'Sin categoría'}</span>
                        </div>
                        {asset.locationDescription && (
                          <div className="mt-2 flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {asset.locationDescription}
                            </span>
                          </div>
                        )}
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setLocation(`/admin/assets/${asset.id}`)}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No hay activos que coincidan con los criterios de filtro.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetMap;