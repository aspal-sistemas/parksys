import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Eye,
  Edit,
  Trash2,
  RefreshCw
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
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  serial_number: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  park_id: number;
  parkName?: string;
  category_id: number;
  categoryName?: string;
  status: string;
  condition: string;
  location_description: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  created_at: string;
  updated_at: string;
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
  const { toast } = useToast();
  
  // Consultar datos de activos
  const { data: assets, isLoading, isError, refetch } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  // Auto-refrescar cada 30 segundos para mostrar cambios inmediatamente
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Consultar datos de categorías
  const { data: categories } = useQuery({
    queryKey: ['/api/asset-categories'],
  });
  
  // Consultar datos de parques
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Mutación para eliminar activos
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      return apiRequest(`/api/assets/${assetId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Activo eliminado",
        description: "El activo ha sido eliminado correctamente del sistema.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
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
        (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.location_description && asset.location_description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por estado
      const matchesStatus = selectedStatus === '' || selectedStatus === 'all' || asset.status === selectedStatus;
      
      // Filtrar por condición
      const matchesCondition = selectedCondition === '' || selectedCondition === 'all' || asset.condition === selectedCondition;
      
      // Filtrar por categoría
      const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || (asset.category_id && asset.category_id.toString() === selectedCategory);
      
      // Filtrar por parque
      const matchesPark = selectedPark === '' || selectedPark === 'all' || (asset.park_id && asset.park_id.toString() === selectedPark);
      
      // Filtrar por pestaña activa
      let matchesTab = true;
      if (activeTab === 'maintenance') {
        const now = new Date();
        const nextMaintenance = asset.next_maintenance_date ? new Date(asset.next_maintenance_date) : null;
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
      const nextMaintenance = asset.next_maintenance_date ? new Date(asset.next_maintenance_date) : null;
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

  const handleEditAsset = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}/edit-enhanced`);
  };

  // State for delete confirmation
  const [deleteAssetId, setDeleteAssetId] = useState<number | null>(null);
  const [deleteAssetName, setDeleteAssetName] = useState<string>('');

  const handleDeleteAsset = (assetId: number, assetName: string) => {
    setDeleteAssetId(assetId);
    setDeleteAssetName(assetName);
  };

  const confirmDeleteAsset = () => {
    if (deleteAssetId) {
      deleteAssetMutation.mutate(deleteAssetId);
      setDeleteAssetId(null);
      setDeleteAssetName('');
    }
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
        <title>Gestión de Activos | Bosques Urbanos</title>
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
                `$${assets?.reduce((total, asset) => {
                  const cost = parseFloat(asset.acquisition_cost?.toString() || '0') || 0;
                  return total + cost;
                }, 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar activos</h3>
                  <p className="text-red-600 text-center mb-4">
                    No se pudieron cargar los datos de activos. Esto puede deberse a una conexión intermitente.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Recargar página
                    </Button>
                  </div>
                </div>
              </div>
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
                          <span>{asset.location_description || 'N/A'}</span>
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
                      <TableCell>{formatDate(asset.last_maintenance_date)}</TableCell>
                      <TableCell>
                        {asset.next_maintenance_date && (
                          <div className="flex items-center">
                            {new Date(asset.next_maintenance_date) <= new Date() && (
                              <AlertTriangle className="mr-1 h-4 w-4 text-yellow-500" />
                            )}
                            {formatDate(asset.next_maintenance_date)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {(asset as any).acquisitionCost 
                          ? `$${parseFloat((asset as any).acquisitionCost.toString()).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            onClick={() => handleEditAsset(asset.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar activo</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            onClick={() => handleDeleteAsset(asset.id, asset.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar activo</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAssetId !== null} onOpenChange={() => setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este activo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El activo "{deleteAssetName}" se eliminará permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAssetId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAsset}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AssetsPage;