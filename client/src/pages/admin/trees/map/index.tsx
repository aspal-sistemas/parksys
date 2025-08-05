import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Map, 
  MapPin, 
  TreeDeciduous, 
  CircleCheck, 
  CircleAlert, 
  Info,
  Calendar,
  Ruler,
  FilterX
} from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Tipos para los árboles del inventario
interface TreeInventory {
  id: number;
  code: string;
  speciesId: number;
  speciesName: string;
  scientificName: string;
  parkId: number;
  parkName: string;
  latitude: string;
  longitude: string;
  plantingDate: string | null;
  healthStatus: string;
  height: number | null;
  diameter: number | null;
  lastInspectionDate: string | null;
}

// Tipo para el árbol seleccionado
interface TreeDetail extends TreeInventory {
  locationDescription?: string;
  notes?: string;
  condition?: string;
}

function TreeMapPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [parkFilter, setParkFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [selectedTree, setSelectedTree] = useState<TreeDetail | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [activeView, setActiveView] = useState('mapa');

  // Consultar los parques para el filtro
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar los parques');
      }
      return response.json();
    },
  });

  // Consultar las especies para el filtro
  const { data: species, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['/api/tree-species'],
    queryFn: async () => {
      const response = await fetch('/api/tree-species');
      if (!response.ok) {
        throw new Error('Error al cargar las especies');
      }
      return response.json();
    },
  });

  // Consultar todos los árboles
  const { data: treeInventory, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/trees', parkFilter, speciesFilter, healthFilter, categoryFilter, maintenanceFilter],
    queryFn: async () => {
      let url = '/api/trees?limit=1000'; // Solicitamos un límite alto para mostrar más árboles en el mapa
      
      if (parkFilter !== 'all') {
        url += `&parkId=${parkFilter}`;
      }
      
      if (speciesFilter !== 'all') {
        url += `&speciesId=${speciesFilter}`;
      }
      
      if (healthFilter !== 'all') {
        url += `&healthStatus=${healthFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar el inventario de árboles');
      }
      
      return response.json();
    },
  });

  // Inicializar el mapa cuando el componente se monte
  useEffect(() => {
    const initMap = () => {
      // Ubicación por defecto (Guadalajara, Jalisco)
      const defaultCenter = { lat: 20.6597, lng: -103.3496 };
      
      const mapElement = document.getElementById('tree-map');
      if (mapElement) {
        const mapOptions: google.maps.MapOptions = {
          center: mapCenter || defaultCenter,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        };
        
        const newMap = new google.maps.Map(mapElement, mapOptions);
        setMap(newMap);
        setMapLoaded(true);
      }
    };

    if (!mapLoaded && window.google && window.google.maps) {
      initMap();
    } else if (!window.google || !window.google.maps) {
      // Si la API de Google Maps no está cargada, utilizamos una solución alternativa
      // Marcamos como cargado para mostrar el estado alternativo
      setMapLoaded(true);
    }
  }, [mapCenter, mapLoaded]);

  // Cuando se carguen los árboles, añadimos los marcadores al mapa
  useEffect(() => {
    if (mapLoaded && map && treeInventory && treeInventory.data && treeInventory.data.length > 0) {
      // Limpiar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];
      
      // Filtrar los árboles según la categoría seleccionada
      let filteredTrees = [...treeInventory.data];
      
      if (categoryFilter !== 'all') {
        filteredTrees = filteredTrees.filter((tree: TreeInventory) => {
          // Categorizar árboles según su plantingDate (edad)
          const plantingDate = tree.plantingDate ? new Date(tree.plantingDate) : null;
          const now = new Date();
          const ageYears = plantingDate ? (now.getFullYear() - plantingDate.getFullYear()) : null;
          
          switch (categoryFilter) {
            case 'joven':
              return ageYears !== null && ageYears < 5;
            case 'maduro':
              return ageYears !== null && ageYears >= 5 && ageYears < 15;
            case 'antiguo':
              return ageYears !== null && ageYears >= 15;
            case 'riesgo':
              return tree.healthStatus.toLowerCase() === 'malo' || tree.healthStatus.toLowerCase() === 'crítico';
            default:
              return true;
          }
        });
      }
      
      // Filtrar árboles según el criterio de mantenimiento
      if (maintenanceFilter !== 'all') {
        filteredTrees = filteredTrees.filter((tree: TreeInventory) => {
          const lastInspection = tree.lastInspectionDate ? new Date(tree.lastInspectionDate) : null;
          const now = new Date();
          
          // Calcular la diferencia en meses
          const monthsDiff = lastInspection 
            ? Math.floor((now.getTime() - lastInspection.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) 
            : null;
          
          switch (maintenanceFilter) {
            case 'urgente':
              // Árboles sin inspección en más de 12 meses o en estado crítico
              return (monthsDiff === null || monthsDiff > 12) || tree.healthStatus.toLowerCase() === 'crítico';
            case 'pendiente':
              // Árboles sin inspección entre 6 y 12 meses
              return monthsDiff !== null && monthsDiff >= 6 && monthsDiff <= 12;
            case 'reciente':
              // Árboles inspeccionados en los últimos 6 meses
              return monthsDiff !== null && monthsDiff < 6;
            default:
              return true;
          }
        });
      }
      
      // Añadir nuevos marcadores para los árboles filtrados
      filteredTrees.forEach((tree: TreeInventory) => {
        if (tree.latitude && tree.longitude) {
          try {
            const lat = parseFloat(tree.latitude);
            const lng = parseFloat(tree.longitude);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              // Determinar el color del marcador según el estado de salud
              let markerIcon = '';
              switch (tree.healthStatus.toLowerCase()) {
                case 'bueno':
                  markerIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                  break;
                case 'regular':
                  markerIcon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                  break;
                case 'malo':
                  markerIcon = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                  break;
                case 'crítico':
                  markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                  break;
                default:
                  markerIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
              }
              
              const marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: `${tree.code} - ${tree.speciesName}`,
                icon: markerIcon
              });
              
              // Añadir evento de clic al marcador
              marker.addListener('click', () => {
                setSelectedTree(tree);
                
                // Crear una ventana de información
                const infoWindow = new google.maps.InfoWindow({
                  content: `
                    <div style="padding: 10px; max-width: 200px;">
                      <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e5128;">${tree.code}</h3>
                      <p style="margin: 5px 0; font-size: 14px;"><b>Especie:</b> ${tree.speciesName}</p>
                      <p style="margin: 5px 0; font-size: 14px;"><b>Parque:</b> ${tree.parkName}</p>
                      <p style="margin: 5px 0; font-size: 14px;"><b>Estado:</b> ${tree.healthStatus}</p>
                      <button style="background: #1e5128; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;" onclick="window.location.href='/admin/trees/inventory/${tree.id}'">Ver detalles</button>
                    </div>
                  `
                });
                
                infoWindow.open(map, marker);
              });
              
              newMarkers.push(marker);
            }
          } catch (error) {
            console.error('Error al procesar coordenadas:', error);
          }
        }
      });
      
      setMarkers(newMarkers);
      
      // Si es la primera carga y tenemos árboles, centramos el mapa en el primer árbol
      if (newMarkers.length > 0 && !mapCenter) {
        const firstTree = treeInventory.data[0];
        try {
          const lat = parseFloat(firstTree.latitude);
          const lng = parseFloat(firstTree.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter({ lat, lng });
            map.setCenter({ lat, lng });
          }
        } catch (error) {
          console.error('Error al centrar mapa:', error);
        }
      }
    }
  }, [treeInventory, map, mapLoaded, mapCenter, markers, categoryFilter, maintenanceFilter]);

  // Usamos useEffect para evitar re-renders infinitos al mostrar el toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario de árboles. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setParkFilter('all');
    setSpeciesFilter('all');
    setHealthFilter('all');
    setCategoryFilter('all');
    setMaintenanceFilter('all');
  };

  // Función para calcular estadísticas por categoría
  const getCategoryStats = () => {
    if (!treeInventory || !treeInventory.data) return {};
    
    let young = 0;
    let mature = 0;
    let old = 0;
    let atRisk = 0;
    
    treeInventory.data.forEach((tree: TreeInventory) => {
      // Categorizar árboles según su plantingDate (edad)
      const plantingDate = tree.plantingDate ? new Date(tree.plantingDate) : null;
      const now = new Date();
      const ageYears = plantingDate ? (now.getFullYear() - plantingDate.getFullYear()) : null;
      
      if (ageYears !== null && ageYears < 5) {
        young++;
      } else if (ageYears !== null && ageYears >= 5 && ageYears < 15) {
        mature++;
      } else if (ageYears !== null && ageYears >= 15) {
        old++;
      }
      
      if (tree.healthStatus.toLowerCase() === 'malo' || tree.healthStatus.toLowerCase() === 'crítico') {
        atRisk++;
      }
    });
    
    return {
      young,
      mature,
      old,
      atRisk
    };
  };

  // Función para calcular estadísticas por estado de salud
  const getHealthStats = () => {
    if (!treeInventory || !treeInventory.data) return {};
    
    let good = 0;
    let regular = 0;
    let bad = 0;
    let critical = 0;
    
    treeInventory.data.forEach((tree: TreeInventory) => {
      switch (tree.healthStatus.toLowerCase()) {
        case 'bueno':
          good++;
          break;
        case 'regular':
          regular++;
          break;
        case 'malo':
          bad++;
          break;
        case 'crítico':
          critical++;
          break;
      }
    });
    
    return {
      good,
      regular,
      bad,
      critical
    };
  };

  // Función para calcular estadísticas por mantenimiento
  const getMaintenanceStats = () => {
    if (!treeInventory || !treeInventory.data) return {};
    
    let urgent = 0;
    let pending = 0;
    let recent = 0;
    
    treeInventory.data.forEach((tree: TreeInventory) => {
      const lastInspection = tree.lastInspectionDate ? new Date(tree.lastInspectionDate) : null;
      const now = new Date();
      
      // Calcular la diferencia en meses
      const monthsDiff = lastInspection 
        ? Math.floor((now.getTime() - lastInspection.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) 
        : null;
      
      if ((monthsDiff === null || monthsDiff > 12) || tree.healthStatus.toLowerCase() === 'crítico') {
        urgent++;
      } else if (monthsDiff !== null && monthsDiff >= 6 && monthsDiff <= 12) {
        pending++;
      } else if (monthsDiff !== null && monthsDiff < 6) {
        recent++;
      }
    });
    
    return {
      urgent,
      pending,
      recent
    };
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'bueno':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
            <CircleCheck className="h-3 w-3 mr-1" /> Bueno
          </Badge>
        );
      case 'regular':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
            <Info className="h-3 w-3 mr-1" /> Regular
          </Badge>
        );
      case 'malo':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
            <CircleAlert className="h-3 w-3 mr-1" /> Malo
          </Badge>
        );
      case 'crítico':
        return (
          <Badge variant="destructive">
            <CircleAlert className="h-3 w-3 mr-1" /> Crítico
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Obtener estadísticas
  const categoryStats = getCategoryStats();
  const healthStats = getHealthStats();
  const maintenanceStats = getMaintenanceStats();

  return (
    <AdminLayout>
      <Helmet>
        <title>Mapa de Árboles | ParquesMX</title>
        <meta name="description" content="Visualización geográfica del inventario de árboles en los parques." />
      </Helmet>
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Mapa de Árboles</h1>
            <p className="text-gray-600">
              Visualización geográfica del inventario de árboles en los parques
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={clearAllFilters}
              variant="outline"
              className="flex items-center"
            >
              <FilterX className="mr-2 h-4 w-4" /> Limpiar filtros
            </Button>
            <Button 
              onClick={() => setLocation('/admin/trees/inventory')}
              className="bg-green-600 hover:bg-green-700 flex items-center"
            >
              <TreeDeciduous className="mr-2 h-4 w-4" /> Ver Inventario
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="mapa" value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid grid-cols-2 w-[300px] mb-6">
            <TabsTrigger value="mapa">Vista de Mapa</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapa">
            <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <CardDescription>
                Utiliza los filtros para visualizar árboles específicos en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Select
                    value={parkFilter}
                    onValueChange={setParkFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por parque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los parques</SelectItem>
                      {!isLoadingParks && parks?.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={speciesFilter}
                    onValueChange={setSpeciesFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las especies</SelectItem>
                      {!isLoadingSpecies && species?.data?.map((species: any) => (
                        <SelectItem key={species.id} value={species.id.toString()}>
                          {species.commonName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={healthFilter}
                    onValueChange={setHealthFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Bueno">Bueno</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Malo">Malo</SelectItem>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="joven">Árboles jóvenes (&lt;5 años)</SelectItem>
                      <SelectItem value="maduro">Árboles maduros (5-15 años)</SelectItem>
                      <SelectItem value="antiguo">Árboles antiguos (&gt;15 años)</SelectItem>
                      <SelectItem value="riesgo">Árboles en riesgo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={maintenanceFilter}
                    onValueChange={setMaintenanceFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por mantenimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="urgente">Mantenimiento urgente</SelectItem>
                      <SelectItem value="pendiente">Mantenimiento pendiente</SelectItem>
                      <SelectItem value="reciente">Mantenimiento reciente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>Visualización Geográfica</CardTitle>
                  <CardDescription>
                    Haz clic en un marcador para ver detalles del árbol
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[520px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : window.google && window.google.maps ? (
                    <div id="tree-map" className="h-full w-full"></div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                      <Map className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Mapa no disponible</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        No se pudo cargar el mapa de Google Maps. Puedes ver los árboles en formato de lista en la sección de inventario.
                      </p>
                      <Button 
                        onClick={() => setLocation('/admin/trees/inventory')}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        Ver inventario de árboles
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="h-[600px] overflow-auto">
                <CardHeader className="pb-2">
                  <CardTitle>Leyenda</CardTitle>
                  <CardDescription>
                    Información sobre los marcadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Estados de Salud</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          <span>Bueno</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                          <span>Regular</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                          <span>Malo</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                          <span>Crítico</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-2">Estadísticas</h3>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      ) : treeInventory && treeInventory.data ? (
                        <div className="space-y-1 text-sm">
                          <p>Total de árboles: <span className="font-semibold">{treeInventory.total || treeInventory.data.length}</span></p>
                          <p>Árboles visibles: <span className="font-semibold">{markers.length}</span></p>
                          {parkFilter !== 'all' && (
                            <p>Parque: <span className="font-semibold">
                              {parks?.find((p: any) => p.id.toString() === parkFilter)?.name}
                            </span></p>
                          )}
                          {speciesFilter !== 'all' && (
                            <p>Especie: <span className="font-semibold">
                              {species?.data?.find((s: any) => s.id.toString() === speciesFilter)?.commonName}
                            </span></p>
                          )}
                          {categoryFilter !== 'all' && (
                            <p>Categoría: <span className="font-semibold">
                              {categoryFilter === 'joven' ? 'Árboles jóvenes' : 
                               categoryFilter === 'maduro' ? 'Árboles maduros' : 
                               categoryFilter === 'antiguo' ? 'Árboles antiguos' : 
                               'Árboles en riesgo'}
                            </span></p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No hay datos disponibles</p>
                      )}
                    </div>
                    
                    {selectedTree && (
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Árbol Seleccionado</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-semibold text-green-700">{selectedTree.code}</h4>
                          <p className="text-sm">Especie: {selectedTree.speciesName}</p>
                          <p className="text-sm">Parque: {selectedTree.parkName}</p>
                          <p className="text-sm flex items-center">Estado: {getHealthStatusBadge(selectedTree.healthStatus)}</p>
                          {selectedTree.height && <p className="text-sm">Altura: {selectedTree.height} m</p>}
                          {selectedTree.diameter && <p className="text-sm">Diámetro: {selectedTree.diameter} cm</p>}
                          <Button 
                            onClick={() => setLocation(`/admin/trees/inventory/${selectedTree.id}`)}
                            variant="outline" 
                            size="sm"
                            className="mt-2 w-full border-green-600 text-green-700 hover:bg-green-50"
                          >
                            <TreeDeciduous className="mr-2 h-4 w-4" /> Ver detalles
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
          <TabsContent value="categorias" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categorías por edad */}
            <Card>
              <CardHeader>
                <CardTitle>Árboles por Categoría de Edad</CardTitle>
                <CardDescription>Distribución del arbolado según su etapa de desarrollo</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Árboles jóvenes (&lt;5 años)</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-300 mr-2"></div>
                        <span className="font-semibold">{categoryStats.young || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Árboles maduros (5-15 años)</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-semibold">{categoryStats.mature || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Árboles antiguos (&gt;15 años)</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-700 mr-2"></div>
                        <span className="font-semibold">{categoryStats.old || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Árboles en riesgo</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="font-semibold">{categoryStats.atRisk || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          setCategoryFilter('joven');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver jóvenes
                      </Button>
                      <Button 
                        onClick={() => {
                          setCategoryFilter('maduro');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver maduros
                      </Button>
                      <Button 
                        onClick={() => {
                          setCategoryFilter('antiguo');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver antiguos
                      </Button>
                      <Button 
                        onClick={() => {
                          setCategoryFilter('riesgo');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver en riesgo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Categorías por estado de salud */}
            <Card>
              <CardHeader>
                <CardTitle>Árboles por Estado de Salud</CardTitle>
                <CardDescription>Distribución del arbolado según su condición actual</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estado bueno</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-semibold">{healthStats.good || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estado regular</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="font-semibold">{healthStats.regular || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estado malo</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="font-semibold">{healthStats.bad || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estado crítico</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="font-semibold">{healthStats.critical || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          setHealthFilter('Bueno');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver buenos
                      </Button>
                      <Button 
                        onClick={() => {
                          setHealthFilter('Regular');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver regulares
                      </Button>
                      <Button 
                        onClick={() => {
                          setHealthFilter('Malo');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver malos
                      </Button>
                      <Button 
                        onClick={() => {
                          setHealthFilter('Crítico');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver críticos
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Categorías por mantenimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Árboles por Mantenimiento</CardTitle>
                <CardDescription>Distribución del arbolado según sus necesidades de mantenimiento</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mantenimiento urgente</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="font-semibold">{maintenanceStats.urgent || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mantenimiento pendiente</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="font-semibold">{maintenanceStats.pending || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mantenimiento reciente</span>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-semibold">{maintenanceStats.recent || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          setMaintenanceFilter('urgente');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver urgentes
                      </Button>
                      <Button 
                        onClick={() => {
                          setMaintenanceFilter('pendiente');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver pendientes
                      </Button>
                      <Button 
                        onClick={() => {
                          setMaintenanceFilter('reciente');
                          setActiveView('mapa');
                        }}
                        variant="outline" 
                        size="sm"
                        className="mr-2 mb-2"
                      >
                        Ver recientes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default TreeMapPage;