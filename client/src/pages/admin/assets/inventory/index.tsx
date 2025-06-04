import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  Download, 
  Upload, 
  Printer, 
  BarChart, 
  Filter, 
  Tag,
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  MoreHorizontal,
  Plus
} from 'lucide-react';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
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

// Función para dar formato a valores monetarios
const formatCurrency = (value: number | string | null) => {
  if (value === null || value === undefined) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(numValue);
};

// Obtener el color de la badge por estado
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
    case 'en uso':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Obtener el color de la badge por condición
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

const InventoryPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedPark, setSelectedPark] = useState<string>('');
  
  // Consultar datos de activos
  const { data: assets, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });
  
  // Consultar datos de parques
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Estadísticas y valores calculados
  const totalAssets = assets?.length || 0;
  const totalValue = assets?.reduce((sum, asset) => {
    const cost = typeof asset.acquisitionCost === 'string' 
      ? parseFloat(asset.acquisitionCost) 
      : (asset.acquisitionCost || 0);
    return sum + cost;
  }, 0) || 0;
  
  // Agrupar por categoría y calcular valores
  const assetsByCategory = React.useMemo(() => {
    if (!assets) return [];
    
    const categories = new Map();
    
    assets.forEach(asset => {
      const categoryName = asset.categoryName || 'Sin categoría';
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          name: categoryName,
          count: 0,
          value: 0
        });
      }
      
      const category = categories.get(categoryName);
      category.count++;
      const cost = typeof asset.acquisitionCost === 'string' 
        ? parseFloat(asset.acquisitionCost) 
        : (asset.acquisitionCost || 0);
      category.value += cost;
    });
    
    return Array.from(categories.values()).sort((a, b) => b.count - a.count);
  }, [assets]);
  
  // Agrupar por condición
  const assetsByCondition = React.useMemo(() => {
    if (!assets) return [];
    
    const conditions = new Map();
    
    assets.forEach(asset => {
      if (!conditions.has(asset.condition)) {
        conditions.set(asset.condition, {
          name: asset.condition,
          count: 0,
          value: 0
        });
      }
      
      const condition = conditions.get(asset.condition);
      condition.count++;
      const cost = typeof asset.acquisitionCost === 'string' 
        ? parseFloat(asset.acquisitionCost) 
        : (asset.acquisitionCost || 0);
      condition.value += cost;
    });
    
    return Array.from(conditions.values());
  }, [assets]);
  
  // Aplicar filtros al listado de activos
  const filteredAssets = React.useMemo(() => {
    if (!assets) return [];
    
    return assets.filter((asset) => {
      // Filtrar por término de búsqueda
      const matchesSearch = 
        searchTerm === '' ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por estado
      const matchesStatus = selectedStatus === '' || asset.status === selectedStatus;
      
      // Filtrar por condición
      const matchesCondition = selectedCondition === '' || asset.condition === selectedCondition;
      
      // Filtrar por parque
      const matchesPark = selectedPark === '' || asset.parkId.toString() === selectedPark;
      
      return matchesSearch && matchesStatus && matchesCondition && matchesPark;
    });
  }, [assets, searchTerm, selectedStatus, selectedCondition, selectedPark]);
  
  // Función para exportar el inventario a CSV
  const exportToCSV = () => {
    if (!assets) return;
    
    const headers = [
      'ID',
      'Nombre',
      'Categoría',
      'Parque',
      'Número de Serie',
      'Estado',
      'Condición',
      'Ubicación',
      'Fecha de Adquisición',
      'Costo de Adquisición',
      'Último Mantenimiento',
      'Próximo Mantenimiento'
    ];
    
    const csvRows = [];
    
    // Agregar encabezados
    csvRows.push(headers.join(','));
    
    // Agregar datos
    for (const asset of assets) {
      const values = [
        asset.id,
        `"${asset.name}"`,
        `"${asset.categoryName || ''}"`,
        `"${asset.parkName || ''}"`,
        `"${asset.serialNumber || ''}"`,
        `"${asset.status}"`,
        `"${asset.condition}"`,
        `"${asset.location || ''}"`,
        asset.acquisitionDate ? formatDate(asset.acquisitionDate) : '',
        asset.acquisitionCost !== null ? asset.acquisitionCost : '',
        asset.lastMaintenanceDate ? formatDate(asset.lastMaintenanceDate) : '',
        asset.nextMaintenanceDate ? formatDate(asset.nextMaintenanceDate) : ''
      ];
      
      csvRows.push(values.join(','));
    }
    
    // Crear y descargar el archivo CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_activos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Función para imprimir el inventario
  const printInventory = () => {
    window.print();
  };
  
  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCondition('');
    setSelectedPark('');
  };

  // Handlers para las acciones
  const handleViewDetails = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}`);
  };

  const handleEdit = (assetId: number) => {
    setLocation(`/admin/assets/${assetId}/edit-enhanced`);
  };

  const handleReportIncident = (assetId: number) => {
    setLocation(`/admin/incidents/new?assetId=${assetId}`);
  };

  const handleDelete = (assetId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción no se puede deshacer.')) {
      // Aquí iría la lógica de eliminación
      console.log('Eliminar activo:', assetId);
      // TODO: Implementar llamada a la API para eliminar
    }
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Inventario de Activos | ParquesMX</title>
        <meta name="description" content="Gestión de inventario de activos físicos de los parques." />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Activos</h1>
          <p className="text-muted-foreground">
            Gestión y reportes del inventario de activos físicos.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={printInventory} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={() => setLocation('/admin/assets/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Activo
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalAssets}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(totalValue)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Buscar por nombre o número de serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              
              <div>
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventario Detallado</CardTitle>
          <CardDescription>
            {filteredAssets.length} activos mostrados de un total de {totalAssets}
          </CardDescription>
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
              <p>Error al cargar los datos de inventario.</p>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Parque</TableHead>
                    <TableHead>Núm. Serie</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Condición</TableHead>
                    <TableHead>Fecha Adquisición</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.id}</TableCell>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.categoryName}</TableCell>
                      <TableCell>{asset.parkName}</TableCell>
                      <TableCell>{asset.serialNumber || 'N/A'}</TableCell>
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
                      <TableCell>{formatDate(asset.acquisitionDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(asset.acquisitionCost)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Ver detalles"
                            onClick={() => handleViewDetails(asset.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Editar"
                            onClick={() => handleEdit(asset.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                            title="Reportar incidencia"
                            onClick={() => handleReportIncident(asset.id)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Eliminar"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

export default InventoryPage;