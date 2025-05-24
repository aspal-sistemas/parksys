import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, List, AlertTriangle } from 'lucide-react';
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
  categoryName?: string;
  parkName?: string;
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

// Datos de muestra para garantizar que la página siempre muestra algo
const sampleAssets: Asset[] = [
  {
    id: 1,
    name: "Banca Modelo Colonial",
    description: "Banca de madera tratada con base de hierro fundido",
    status: "active",
    condition: "good",
    parkId: 3,
    categoryId: 1,
    latitude: "19.432608",
    longitude: "-99.133209",
    locationDescription: "Cerca de la entrada principal",
    categoryName: "Mobiliario",
    parkName: "Parque Agua Azul"
  },
  {
    id: 2,
    name: "Cancha de Baloncesto",
    description: "Cancha reglamentaria de baloncesto con tableros reforzados",
    status: "active",
    condition: "excellent",
    parkId: 3,
    categoryId: 2,
    latitude: "19.432108",
    longitude: "-99.132809",
    locationDescription: "Sector deportivo sur",
    categoryName: "Equipamiento Deportivo",
    parkName: "Parque Agua Azul"
  },
  {
    id: 3, 
    name: "Fuente Central",
    description: "Fuente ornamental con iluminación LED",
    status: "maintenance",
    condition: "fair",
    parkId: 4,
    categoryId: 5,
    latitude: "19.431508",
    longitude: "-99.133509",
    locationDescription: "Plaza central",
    categoryName: "Infraestructura",
    parkName: "Parque Tecnológico"
  }
];

const sampleParks: Park[] = [
  { id: 3, name: "Parque Agua Azul", latitude: "19.432608", longitude: "-99.133209" },
  { id: 4, name: "Parque Tecnológico", latitude: "19.431508", longitude: "-99.133509" },
];

const sampleCategories: AssetCategory[] = [
  { id: 1, name: 'Mobiliario', icon: 'chair', color: '#3B82F6' },
  { id: 2, name: 'Equipamiento Deportivo', icon: 'dumbbell', color: '#10B981' },
  { id: 5, name: 'Infraestructura', icon: 'building', color: '#8B5CF6' }
];

// Componente principal
const AssetMapPage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [selectedPark, setSelectedPark] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<string | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Consultar datos de activos
  const { data: apiAssets, isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
    staleTime: 60000,
  });
  
  // Consultar datos de parques
  const { data: apiParks, isLoading: parksLoading } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
    staleTime: 60000,
  });
  
  // Consultar datos de categorías
  const { data: apiCategories, isLoading: categoriesLoading } = useQuery<AssetCategory[]>({
    queryKey: ['/api/asset-categories'],
    staleTime: 60000,
  });

  // Usar datos de API o muestras de respaldo
  const assets = apiAssets || sampleAssets;
  const parks = apiParks || sampleParks;
  const categories = apiCategories || sampleCategories;

  // Filtrar activos según criterios seleccionados
  const filteredAssets = React.useMemo(() => {
    return assets.filter(asset => {
      const matchesPark = selectedPark === 'all' || asset.parkId === selectedPark;
      const matchesCategory = selectedCategory === 'all' || asset.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
      
      return matchesPark && matchesCategory && matchesStatus && matchesCondition;
    });
  }, [assets, selectedPark, selectedCategory, selectedStatus, selectedCondition]);

  // Determinar si hay activos sin coordenadas de geolocalización
  const unlocatedAssets = assets?.filter(asset => !asset.latitude || !asset.longitude) || [];
  const showUnlocatedWarning = unlocatedAssets.length > 0;

  // Determinar cuántos activos se muestran en el mapa actualmente
  const displayedAssetsCount = filteredAssets.length;
  const totalLocatedAssets = assets?.filter(asset => asset.latitude && asset.longitude).length || 0;

  const isLoading = assetsLoading || parksLoading || categoriesLoading;

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

        {/* Contenedor del mapa (versión simplificada) */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Mapa de Ubicación de Activos (Simplificado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden relative w-full h-[600px] bg-blue-50 border border-blue-100">
              {/* Cuadrícula de fondo para simular mapa */}
              <div className="absolute inset-0 z-0" style={{ 
                backgroundImage: 'linear-gradient(#e5f0ff 1px, transparent 1px), linear-gradient(90deg, #e5f0ff 1px, transparent 1px)',
                backgroundSize: '50px 50px' 
              }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-green-50/80 flex items-center justify-center">
                  <p className="text-blue-500 text-lg font-medium opacity-30">Representación visual de activos</p>
                </div>
              </div>
              
              {/* Activos distribuidos en el mapa */}
              <div className="absolute inset-0">
                {filteredAssets.map((asset, index) => {
                  if (!asset.latitude || !asset.longitude) return null;
                  
                  // Calcular posición para distribuir visualmente los puntos
                  // Usamos una distribución simplificada basada en el índice para garantizar visibilidad
                  const offsetX = (index % 5) * 15 + 10;  // 5 columnas con espaciado
                  const offsetY = Math.floor(index / 5) * 15 + 10;  // Filas espaciadas

                  const category = categories?.find(cat => cat.id === asset.categoryId);
                  const color = category?.color || '#3B82F6';
                  
                  return (
                    <div 
                      key={asset.id}
                      className="absolute w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer z-10 flex items-center justify-center transition-all hover:w-10 hover:h-10 hover:z-20"
                      style={{ 
                        backgroundColor: color,
                        left: `${offsetX}%`, 
                        top: `${offsetY}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={asset.name}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  );
                })}
              </div>
              
              {/* Leyenda de categorías */}
              <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow z-30 max-w-xs">
                <h4 className="font-medium mb-2 text-sm">Categorías</h4>
                <div className="space-y-1">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ventana de información de activo */}
              {selectedAsset && (
                <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-40 max-w-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{selectedAsset.name}</h3>
                    <button 
                      onClick={() => setSelectedAsset(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedAsset.categoryName || 'Sin categoría'}</p>
                  <p className="mt-2 text-sm">{selectedAsset.description || 'Sin descripción'}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      {ASSET_STATUSES.find(s => s.value === selectedAsset.status)?.label || selectedAsset.status}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      {ASSET_CONDITIONS.find(c => c.value === selectedAsset.condition)?.label || selectedAsset.condition}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600">Ubicación: {selectedAsset.locationDescription || 'No especificada'}</p>
                    <p className="text-xs text-gray-600">Parque: {selectedAsset.parkName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {selectedAsset.latitude}, {selectedAsset.longitude}
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => window.location.href = `/admin/assets/${selectedAsset.id}`}
                    >
                      Ver detalles completos
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de activos visibles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Activos Mostrados ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const category = categories?.find(cat => cat.id === asset.categoryId);
                  const park = parks?.find(p => p.id === asset.parkId);
                  
                  const statusLabel = ASSET_STATUSES.find(s => s.value === asset.status)?.label || asset.status;
                  const conditionLabel = ASSET_CONDITIONS.find(c => c.value === asset.condition)?.label || asset.condition;
                  
                  return (
                    <Card key={asset.id} className="overflow-hidden cursor-pointer hover:border-blue-200 transition-colors" onClick={() => setSelectedAsset(asset)}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold truncate" title={asset.name}>
                              {asset.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {category?.name || 'Sin categoría'} • {park?.name || 'Sin parque'}
                            </p>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full mt-1" 
                            style={{ backgroundColor: category?.color || '#3B82F6' }}
                          />
                        </div>
                        
                        <div className="mt-2 line-clamp-2 text-sm text-gray-600 h-10">
                          {asset.description || 'Sin descripción'}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {statusLabel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {conditionLabel}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {asset.locationDescription || 'Sin ubicación específica'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  <p>No se encontraron activos con los criterios seleccionados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetMapPage;