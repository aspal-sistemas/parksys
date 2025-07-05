import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import { 
  Download, 
  Upload, 
  Printer, 
  BarChart, 
  Filter, 
  Tag,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  Calendar
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
    month: '2-digit',
    day: '2-digit'
  });
};

// Funciones para traducir estados y condiciones
const translateStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'active': 'Activo',
    'maintenance': 'Mantenimiento',
    'retired': 'Retirado',
    'damaged': 'Dañado'
  };
  return statusMap[status] || status;
};

const translateCondition = (condition: string) => {
  const conditionMap: { [key: string]: string } = {
    'excellent': 'Excelente',
    'good': 'Bueno',
    'fair': 'Regular',
    'poor': 'Malo'
  };
  return conditionMap[condition] || condition;
};

// Función para obtener el color del badge de estado
const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'activo':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'dañado':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'retirado':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

// Función para obtener el color del badge de condición
const getConditionBadgeColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'excelente':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'bueno':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'regular':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'malo':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const InventoryPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedPark, setSelectedPark] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener datos de inventario con parámetros de paginación
  const { 
    data: assetsData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/assets/inventory', currentPage, searchTerm, selectedStatus, selectedCondition, selectedPark, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: selectedStatus,
        condition: selectedCondition,
        park: selectedPark,
        category: selectedCategory
      });
      
      const response = await fetch(`/api/assets/inventory?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar inventario');
      }
      return response.json();
    },
    enabled: true
  });

  // Obtener parques para filtros
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    enabled: true
  });

  // Obtener categorías para filtros
  const { data: categories } = useQuery({
    queryKey: ['/api/asset-categories'],
    enabled: true
  });

  // Safely filter data to prevent SelectItem errors
  const safeCategories = React.useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(category => 
      category && 
      typeof category === 'object' && 
      category.id && 
      category.name && 
      category.id.toString().trim() !== '' &&
      category.name.trim() !== ''
    );
  }, [categories]);

  const safeParks = React.useMemo(() => {
    if (!Array.isArray(parks)) return [];
    return parks.filter(park => 
      park && 
      typeof park === 'object' && 
      park.id && 
      park.name && 
      park.id.toString().trim() !== '' &&
      park.name.trim() !== ''
    );
  }, [parks]);

  const assets = assetsData?.assets || [];
  const totalAssets = parseInt(assetsData?.totalAssets || '0', 10);
  
  // Los datos ya vienen filtrados y paginados del backend
  const totalPages = Math.ceil(totalAssets / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalAssets);
  const paginatedAssets = assets; // Ya están paginados del backend

  // Reset página cuando cambian filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCondition, selectedPark, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCondition('all');
    setSelectedPark('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  // Handlers para acciones
  const handleEdit = (id: number) => {
    setLocation(`/admin/assets/${id}/edit`);
  };

  const handleReportIncident = (id: number) => {
    setLocation(`/admin/incidents/new?assetId=${id}`);
  };

  const handleScheduleMaintenance = (id: number) => {
    setLocation(`/admin/assets/${id}`);
  };

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/assets/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets/inventory'] });
      toast({
        title: "Activo eliminado",
        description: "El activo ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el activo.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      deleteAssetMutation.mutate(id);
    }
  };

  // Función para exportar el inventario completo a CSV
  const exportToCSV = () => {
    if (!assets || assets.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay activos para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    // Headers completos con todos los campos de clasificación de activos
    const headers = [
      'ID',
      'Nombre',
      'Descripción',
      'Número de Serie',
      'Categoría',
      'Parque',
      'Amenidad',
      'Ubicación Descripción',
      'Latitud',
      'Longitud',
      'Estado',
      'Condición',
      'Fabricante',
      'Modelo',
      'Fecha de Adquisición',
      'Costo de Adquisición (MXN)',
      'Valor Actual (MXN)',
      'Frecuencia de Mantenimiento',
      'Último Mantenimiento',
      'Próximo Mantenimiento',
      'Vida Útil Esperada (meses)',
      'Código QR',
      'Persona Responsable',
      'Notas',
      'Fecha de Creación',
      'Última Actualización'
    ];
    
    const csvRows = [];
    
    // Agregar encabezados
    csvRows.push(headers.join(','));
    
    // Agregar datos con todos los campos disponibles
    for (const asset of assets) {
      const values = [
        asset.id || '',
        `"${(asset.name || '').replace(/"/g, '""')}"`,
        `"${(asset.description || '').replace(/"/g, '""')}"`,
        `"${(asset.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(asset.categoryName || '').replace(/"/g, '""')}"`,
        `"${(asset.parkName || '').replace(/"/g, '""')}"`,
        `"${(asset.amenityName || '').replace(/"/g, '""')}"`,
        `"${(asset.locationDescription || '').replace(/"/g, '""')}"`,
        `"${asset.latitude || ''}"`,
        `"${asset.longitude || ''}"`,
        `"${translateStatus(asset.status)}"`,
        `"${translateCondition(asset.condition)}"`,
        `"${(asset.manufacturer || '').replace(/"/g, '""')}"`,
        `"${(asset.model || '').replace(/"/g, '""')}"`,
        asset.acquisitionDate ? formatDate(asset.acquisitionDate) : '',
        asset.acquisitionCost !== null && asset.acquisitionCost !== undefined ? 
          `"$${Number(asset.acquisitionCost).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}"` : '',
        asset.currentValue !== null && asset.currentValue !== undefined ? 
          `"$${Number(asset.currentValue).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}"` : '',
        `"${(asset.maintenanceFrequency || '').replace(/"/g, '""')}"`,
        asset.lastMaintenanceDate ? formatDate(asset.lastMaintenanceDate) : '',
        asset.nextMaintenanceDate ? formatDate(asset.nextMaintenanceDate) : '',
        asset.expectedLifespan || '',
        `"${(asset.qrCode || '').replace(/"/g, '""')}"`,
        `"${(asset.responsiblePersonName || '').replace(/"/g, '""')}"`,
        `"${(asset.notes || '').replace(/"/g, '""')}"`,
        asset.createdAt ? formatDate(asset.createdAt) : '',
        asset.updatedAt ? formatDate(asset.updatedAt) : ''
      ];
      
      csvRows.push(values.join(','));
    }
    
    // Crear contenido CSV con BOM para UTF-8
    const csvContent = csvRows.join('\r\n');
    const BOM = '\uFEFF'; // UTF-8 BOM para corregir acentos en Excel
    const finalContent = BOM + csvContent;
    
    // Crear y descargar el archivo CSV con codificación UTF-8
    const blob = new Blob([finalContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_completo_activos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportación exitosa",
      description: `Se ha exportado el inventario completo con ${assets.length} activos y ${headers.length} campos.`,
    });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Inventario de Activos - ParkSys</title>
      </Helmet>
      
      {/* Header con métricas rápidas */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventario de Activos
        </h1>
        <p className="text-gray-600 mb-4">
          Gestión completa del inventario de activos de los parques
        </p>
        
        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assets.filter((a: any) => a.status === 'active').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Mantenimiento</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {assets.filter((a: any) => a.status === 'maintenance').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(assetsData?.totalValue || 0).toLocaleString('es-MX', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    })}
                  </p>
                </div>
                <BarChart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setLocation('/admin/assets/new')}
          className="bg-[#00a587] hover:bg-[#067f5f]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Activo
        </Button>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Inventario
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar Datos
        </Button>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Reporte
        </Button>
        <Button variant="outline">
          <BarChart className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Filtros avanzados */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Buscar por nombre, número de serie, categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {safeCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="retired">Retirado</SelectItem>
                  <SelectItem value="damaged">Dañado</SelectItem>
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
                  <SelectItem value="excellent">Excelente</SelectItem>
                  <SelectItem value="good">Bueno</SelectItem>
                  <SelectItem value="fair">Regular</SelectItem>
                  <SelectItem value="poor">Malo</SelectItem>
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
                  {safeParks.map((park: any) => (
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventario Detallado</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} - Mostrando {startIndex}-{endIndex} de {totalAssets} activos
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
          ) : totalAssets === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No se encontraron activos con los criterios seleccionados.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <>
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
                    {paginatedAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>{asset.id}</TableCell>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{asset.categoryName}</TableCell>
                        <TableCell>{asset.parkName}</TableCell>
                        <TableCell>{asset.serialNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(asset.status)}>
                            {translateStatus(asset.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getConditionBadgeColor(asset.condition)}>
                            {translateCondition(asset.condition)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(asset.acquisitionDate)}</TableCell>
                        <TableCell className="text-right">
                          {asset.acquisitionCost ? `$${Number(asset.acquisitionCost).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              title="Gestionar activo (editar, ver detalles)"
                              onClick={() => handleEdit(asset.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                              title="Programar mantenimiento"
                              onClick={() => handleScheduleMaintenance(asset.id)}
                            >
                              <Calendar className="h-4 w-4" />
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
              
              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex}-{endIndex} de {totalAssets} activos
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else {
                          const start = Math.max(1, currentPage - 2);
                          const end = Math.min(totalPages, start + 4);
                          pageNumber = start + i;
                          if (pageNumber > end) return null;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={currentPage === pageNumber ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }).filter(Boolean)}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default InventoryPage;