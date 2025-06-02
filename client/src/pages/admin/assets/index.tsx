import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Search, 
  Filter, 
  Tag,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Eye
} from 'lucide-react';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/constants';

// Función para formatear fechas
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Función para obtener color de badge basado en estado
const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'activo':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'maintenance':
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'retired':
    case 'retirado':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'storage':
    case 'almacenado':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Función para obtener color de badge basado en condición
const getConditionBadgeColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'excellent':
    case 'excelente':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'good':
    case 'bueno':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'fair':
    case 'regular':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'poor':
    case 'malo':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    case 'critical':
    case 'crítico':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Interfaz para los datos de activos
interface Asset {
  id: number;
  name: string;
  description: string | null;
  serialNumber: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  parkId: number;
  parkName?: string;
  categoryId: number;
  categoryName?: string;
  status: string;
  condition: string;
  location: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const AssetsPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPark, setSelectedPark] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Consultar datos de activos con clave de actualización manual
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ['/api/assets', refreshKey],
    queryFn: () => fetch(`/api/assets?_=${refreshKey}`).then(res => res.json()),
  });
  
  // Consultar datos de categorías
  const { data: categories } = useQuery({
    queryKey: ['/api/asset-categories'],
  });
  
  // Consultar datos de parques
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Filtrar activos según criterios seleccionados
  const filteredAssets = React.useMemo(() => {
    if (!assets) return [];
    
    return assets.filter((asset) => {
      // Filtrar por término de búsqueda
      const matchesSearch = 
        searchTerm === '' ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por estado
      const matchesStatus = selectedStatus === '' || asset.status === selectedStatus;
      
      // Filtrar por condición
      const matchesCondition = selectedCondition === '' || asset.condition === selectedCondition;
      
      // Filtrar por categoría
      const matchesCategory = selectedCategory === '' || asset.categoryId.toString() === selectedCategory;
      
      // Filtrar por parque
      const matchesPark = selectedPark === '' || asset.parkId.toString() === selectedPark;
      
      // Filtrar por pestaña activa
      let matchesTab = true;
      if (activeTab === 'maintenance') {
        const now = new Date();
        const nextMaintenance = asset.nextMaintenanceDate ? new Date(asset.nextMaintenanceDate) : null;
        matchesTab = !!nextMaintenance && nextMaintenance <= now;
      }
      
      return matchesSearch && matchesStatus && matchesCondition && matchesCategory && matchesPark && matchesTab;
    });
  }, [assets, searchTerm, selectedStatus, selectedCondition, selectedCategory, selectedPark, activeTab]);
  
  // Número de activos que requieren mantenimiento
  const maintenanceDueCount = React.useMemo(() => {
    if (!assets) return 0;
    
    const now = new Date();
    return assets.filter(asset => {
      const nextMaintenance = asset.nextMaintenanceDate ? new Date(asset.nextMaintenanceDate) : null;
      return !!nextMaintenance && nextMaintenance <= now;
    }).length;
  }, [assets]);
  
  // Funciones de navegación
  const handleAddAsset = () => {
    setLocation('/admin/assets/new');
  };
  
  const handleViewAsset = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}`);
  };
  
  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCondition('');
    setSelectedCategory('');
    setSelectedPark('');
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión de Activos | ParquesMX</title>
        <meta name="description" content="Administra los activos físicos de los parques y espacios públicos." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Activos</h1>
            <p className="text-muted-foreground">
              Administra el inventario de activos físicos de los parques y espacios públicos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                // Navegación forzada debido a problemas con el router
                window.location.href = '/admin/assets/map';
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Ver Mapa
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Navegación forzada con ruta actualizada a la versión simple
                window.location.href = '/admin/assets/maintenance/calendar';
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              Calendario de Mantenimiento
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Navegación para asignar responsables
                window.location.href = '/admin/assets/assign-manager';
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Asignar Responsable
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Redirigir al módulo de incidencias para reportar un problema relacionado con un activo
                window.location.href = '/admin/incidents?reportType=asset';
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reportar Problema
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Navegación para asignar equipamiento a instructores
                window.location.href = '/admin/assets/assign-equipment';
              }}
            >
              <Tag className="mr-2 h-4 w-4" />
              Asignar a Instructor
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Activo
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : assets?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `$${assets?.reduce((total, asset) => total + (asset.acquisitionCost || 0), 0).toLocaleString('es-MX')}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className={maintenanceDueCount > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : maintenanceDueCount}
              </div>
              {maintenanceDueCount > 0 && (
                <AlertTriangle className="ml-2 h-5 w-5 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos los Activos</TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Requieren Mantenimiento
            {maintenanceDueCount > 0 && (
              <Badge className="ml-2 bg-yellow-200 text-yellow-800 hover:bg-yellow-200">{maintenanceDueCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <Input
                placeholder="Buscar activos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {ASSET_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las condiciones</SelectItem>
                  {ASSET_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedPark} onValueChange={setSelectedPark}>
                <SelectTrigger>
                  <SelectValue placeholder="Parque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parks?.map((park: any) => (
                    <SelectItem key={park.id} value={park.id.toString()}>{park.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'all' ? 'Listado de Activos' : 'Activos que Requieren Mantenimiento'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-4 text-red-500">
              <p>Error al cargar los datos de activos.</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No se encontraron activos con los criterios seleccionados.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Condición</TableHead>
                    <TableHead>Último Mantenimiento</TableHead>
                    <TableHead>Próximo Mantenimiento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow 
                      key={asset.id} 
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.categoryName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{asset.location || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{asset.parkName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getConditionBadgeColor(asset.condition)}>
                          {asset.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(asset.lastMaintenanceDate)}</TableCell>
                      <TableCell>
                        {asset.nextMaintenanceDate && (
                          <div className="flex items-center">
                            {new Date(asset.nextMaintenanceDate) <= new Date() && (
                              <AlertTriangle className="mr-1 h-4 w-4 text-yellow-500" />
                            )}
                            {formatDate(asset.nextMaintenanceDate)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {asset.acquisitionCost 
                          ? `$${asset.acquisitionCost.toLocaleString('es-MX')}` 
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewAsset(asset.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Redirigir a incidencias con parámetro para reportar problema
                              window.location.href = `/admin/incidents?reportType=asset&assetId=${asset.id}`;
                            }}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <span className="sr-only">Reportar problema</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AssetsPage;