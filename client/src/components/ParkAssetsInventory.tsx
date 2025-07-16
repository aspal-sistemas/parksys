import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Wrench, Edit, MapPin, Calendar, Clock, Plus, SortAsc, Filter } from 'lucide-react';
import { Link } from 'wouter';

interface Asset {
  id: number;
  name: string;
  category: string;
  status: string;
  condition: string;
  serialNumber?: string;
  locationDescription?: string;
  manufacturer?: string;
  model?: string;
  acquisitionDate?: string;
  lastMaintenance?: string;
  nextMaintenanceDate?: string;
  acquisitionCost?: string;
  currentValue?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

interface ParkAssetsInventoryProps {
  parkId: number;
  assets: Asset[];
  amenities: Array<{
    id: number;
    name: string;
    moduleName?: string;
  }>;
}

const ParkAssetsInventory: React.FC<ParkAssetsInventoryProps> = ({ parkId, assets, amenities }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 10;

  // Función para filtrar y ordenar activos
  const getFilteredAndSortedAssets = () => {
    let filtered = [...assets];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.locationDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filtrar por condición
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(asset => asset.condition?.toLowerCase() === conditionFilter.toLowerCase());
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortBy) {
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'condition':
          aValue = a.condition?.toLowerCase() || '';
          bValue = b.condition?.toLowerCase() || '';
          break;
        case 'acquisitionDate':
          aValue = a.acquisitionDate || '';
          bValue = b.acquisitionDate || '';
          break;
        case 'lastMaintenance':
          aValue = a.lastMaintenance || '';
          bValue = b.lastMaintenance || '';
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return filtered;
  };

  const filteredAssets = getFilteredAndSortedAssets();
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, conditionFilter, sortBy, sortOrder]);

  // Crear mapas de valores únicos normalizados
  const createUniqueValueMap = (values: (string | undefined)[]) => {
    const uniqueMap = new Map<string, string>();
    values.filter(Boolean).forEach(value => {
      if (value) {
        const lowerKey = value.toLowerCase();
        if (!uniqueMap.has(lowerKey)) {
          uniqueMap.set(lowerKey, value);
        }
      }
    });
    return Array.from(uniqueMap.keys());
  };

  const uniqueCategories = createUniqueValueMap(assets.map(asset => asset.category));
  const uniqueStatuses = createUniqueValueMap(assets.map(asset => asset.status));
  const uniqueConditions = createUniqueValueMap(assets.map(asset => asset.condition));

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setConditionFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      pendiente: "secondary",
      critico: "destructive",
      completado: "outline"
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      excelente: "default",
      bueno: "default", 
      regular: "secondary",
      malo: "destructive"
    };
    return variants[condition?.toLowerCase()] || "secondary";
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      {assets.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">Filtros y Ordenamiento</span>
            <span className="ml-auto text-sm text-gray-500">
              ({filteredAssets.length} de {assets.length} activos)
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar activos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'active' ? 'Activo' : 
                       status === 'activo' ? 'Activo' :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Filtro por condición */}
            <div>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las condiciones</SelectItem>
                  {uniqueConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition === 'excellent' ? 'Excelente' : 
                       condition === 'excelente' ? 'Excelente' :
                       condition === 'good' ? 'Bueno' : 
                       condition === 'bueno' ? 'Bueno' :
                       condition === 'regular' ? 'Regular' : 
                       condition === 'bad' ? 'Malo' : 
                       condition === 'malo' ? 'Malo' :
                       condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="condition">Condición</SelectItem>
                  <SelectItem value="acquisitionDate">Fecha de Adquisición</SelectItem>
                  <SelectItem value="lastMaintenance">Último Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dirección de ordenamiento */}
            <div className="flex gap-2">
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
                className="flex-1"
              >
                <SortAsc className="h-4 w-4" />
              </Button>
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
                className="flex-1"
              >
                <SortAsc className="h-4 w-4 rotate-180" />
              </Button>
            </div>

            {/* Botón limpiar filtros */}
            <div>
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de activos */}
      {filteredAssets.length === 0 && assets.length > 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No se encontraron activos</p>
          <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No hay activos registrados</p>
          <p className="text-sm">Este parque aún no tiene activos asignados.</p>
          <Link href={`/admin/assets/new?parkId=${parkId}`}>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer activo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentAssets.map((asset) => (
            <div key={asset.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{asset.name}</h4>
                    <Badge variant={getConditionBadge(asset.condition)}>
                      {asset.condition}
                    </Badge>
                    {asset.status && (
                      <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                        {asset.status === 'active' ? 'Activo' : asset.status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Categoría:</span>
                        <span className="text-gray-600">{asset.category || 'Sin categoría'}</span>
                      </div>
                      
                      {asset.serialNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Número de Serie:</span>
                          <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {asset.serialNumber}
                          </span>
                        </div>
                      )}
                      
                      {asset.locationDescription && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Ubicación:</span>
                          <span className="text-gray-600">{asset.locationDescription}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {asset.acquisitionDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Fecha de Adquisición:</span>
                          <span className="text-gray-600">
                            {new Date(asset.acquisitionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {asset.lastMaintenance && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Último Mantenimiento:</span>
                          <span className="text-gray-600">
                            {new Date(asset.lastMaintenance).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {asset.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Notas:</span> {asset.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  <Link href={`/admin/assets/${asset.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAssets.length)} de {filteredAssets.length} activos
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkAssetsInventory;