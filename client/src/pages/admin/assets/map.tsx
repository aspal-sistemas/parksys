import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  List, 
  AlertTriangle, 
  Filter, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  RotateCcw,
  Eye,
  Edit,
  Wrench,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constantes de estado y condición para activos (valores en español para coincidir con la BD)
const ASSET_STATUSES = [
  { value: 'activo', label: 'Activo', color: '#10B981' },
  { value: 'mantenimiento', label: 'En Mantenimiento', color: '#F59E0B' },
  { value: 'retirado', label: 'Retirado', color: '#EF4444' },
  { value: 'almacen', label: 'En Almacén', color: '#6B7280' }
];

const ASSET_CONDITIONS = [
  { value: 'excelente', label: 'Excelente', color: '#10B981' },
  { value: 'bueno', label: 'Bueno', color: '#3B82F6' },
  { value: 'regular', label: 'Regular', color: '#F59E0B' },
  { value: 'malo', label: 'Malo', color: '#EF4444' },
  { value: 'critico', label: 'Crítico', color: '#DC2626' }
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
  nextMaintenanceDate?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | null;
  lastMaintenanceDate?: string | null;
  maintenanceFrequency?: number | null;
  maintenanceStatus?: string | null;
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

// Crear iconos personalizados para cada categoría y estado
const createCustomIcon = (category: AssetCategory, status: string, condition: string) => {
  const statusInfo = ASSET_STATUSES.find(s => s.value === status);
  const conditionInfo = ASSET_CONDITIONS.find(c => c.value === condition);
  
  const color = conditionInfo?.color || category.color || '#3B82F6';
  const borderColor = statusInfo?.color || '#6B7280';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        width: 20px;
        height: 20px;
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Componente para centrar el mapa
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Componente principal
const AssetMapPage: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [selectedPark, setSelectedPark] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<string | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.676667, -103.347222]); // Guadalajara center
  const [mapZoom, setMapZoom] = useState<number>(12);

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

  const assets = apiAssets || [];
  const parks = apiParks || [];
  const categories = apiCategories || [];

  // Filtrar activos según criterios seleccionados
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Solo mostrar activos con coordenadas válidas
      if (!asset.latitude || !asset.longitude) return false;
      
      const matchesPark = selectedPark === 'all' || asset.parkId === selectedPark;
      const matchesCategory = selectedCategory === 'all' || asset.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
      
      return matchesPark && matchesCategory && matchesStatus && matchesCondition;
    });
  }, [assets, selectedPark, selectedCategory, selectedStatus, selectedCondition]);

  // Calcular estadísticas
  const unlocatedAssets = assets.filter(asset => !asset.latitude || !asset.longitude);
  const showUnlocatedWarning = unlocatedAssets.length > 0;
  const displayedAssetsCount = filteredAssets.length;
  const totalLocatedAssets = assets.filter(asset => asset.latitude && asset.longitude).length;

  // Centrar el mapa en los activos filtrados
  useEffect(() => {
    if (filteredAssets.length > 0) {
      const validAssets = filteredAssets.filter(asset => asset.latitude && asset.longitude);
      if (validAssets.length > 0) {
        const lats = validAssets.map(asset => parseFloat(asset.latitude!));
        const lngs = validAssets.map(asset => parseFloat(asset.longitude!));
        
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        
        setMapCenter([centerLat, centerLng]);
        
        // Ajustar zoom basado en la dispersión de los puntos
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);
        
        let zoom = 12;
        if (maxRange > 0.1) zoom = 10;
        else if (maxRange > 0.05) zoom = 11;
        else if (maxRange > 0.01) zoom = 13;
        else if (maxRange > 0.005) zoom = 14;
        else zoom = 15;
        
        setMapZoom(zoom);
      }
    }
  }, [filteredAssets]);

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
            <Button variant="outline" onClick={() => setLocation('/admin/assets/inventory')}>
              <List className="mr-2 h-4 w-4" />
              Ver Inventario
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-50">
          <Select value={selectedPark.toString()} onValueChange={(value) => setSelectedPark(value === 'all' ? 'all' : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un parque" />
            </SelectTrigger>
            <SelectContent className="z-[60]">
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
            <SelectContent className="z-[60]">
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
            <SelectContent className="z-[60]">
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
            <SelectContent className="z-[60]">
              <SelectItem value="all">Todas las condiciones</SelectItem>
              {ASSET_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mapa interactivo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mapa Interactivo de Activos</span>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{filteredAssets.length} activos mostrados</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full rounded-lg overflow-hidden border relative z-10">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                className="leaflet-container"
                zoomControl={true}
              >
                <MapController center={mapCenter} zoom={mapZoom} />
                
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                >
                  {filteredAssets.map((asset) => {
                    if (!asset.latitude || !asset.longitude) return null;
                    
                    const category = categories.find(c => c.id === asset.categoryId);
                    const park = parks.find(p => p.id === asset.parkId);
                    const statusInfo = ASSET_STATUSES.find(s => s.value === asset.status);
                    const conditionInfo = ASSET_CONDITIONS.find(c => c.value === asset.condition);
                    
                    const icon = createCustomIcon(
                      category || { id: 0, name: 'Sin categoría', icon: 'default', color: '#3B82F6' },
                      asset.status,
                      asset.condition
                    );

                    return (
                      <Marker
                        key={asset.id}
                        position={[parseFloat(asset.latitude), parseFloat(asset.longitude)]}
                        icon={icon}
                      >
                        <Popup className="asset-popup" maxWidth={300}>
                          <div className="p-2">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                                {asset.name}
                              </h3>
                              <div 
                                className="w-4 h-4 rounded-full ml-2 flex-shrink-0" 
                                style={{ backgroundColor: category?.color || '#3B82F6' }}
                              />
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <p className="text-sm text-gray-600">
                                <strong>Categoría:</strong> {category?.name || 'Sin categoría'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Parque:</strong> {park?.name || 'Sin parque'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Ubicación:</strong> {asset.locationDescription || 'Sin descripción específica'}
                              </p>
                              {asset.description && (
                                <p className="text-sm text-gray-600">
                                  <strong>Descripción:</strong> {asset.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: statusInfo?.color, color: statusInfo?.color }}
                              >
                                {statusInfo?.label || asset.status}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: conditionInfo?.color, color: conditionInfo?.color }}
                              >
                                {conditionInfo?.label || asset.condition}
                              </Badge>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/admin/assets/${asset.id}`)}
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setLocation(`/admin/assets/edit/${asset.id}`)}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leyenda del mapa */}
        <Card>
          <CardHeader>
            <CardTitle>Leyenda del Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estados */}
              <div>
                <h4 className="font-medium mb-3">Estados de Activos</h4>
                <div className="space-y-2">
                  {ASSET_STATUSES.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2"
                        style={{ 
                          backgroundColor: '#f3f4f6',
                          borderColor: status.color
                        }}
                      />
                      <span className="text-sm">{status.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Condiciones */}
              <div>
                <h4 className="font-medium mb-3">Condiciones de Activos</h4>
                <div className="space-y-2">
                  {ASSET_CONDITIONS.map((condition) => (
                    <div key={condition.value} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: condition.color }}
                      />
                      <span className="text-sm">{condition.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Cómo leer el mapa:</strong> Los marcadores muestran la condición del activo (color del círculo) 
                y el estado operativo (color del borde). Haga clic en cualquier marcador para ver más detalles y opciones de acción.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssetMapPage;