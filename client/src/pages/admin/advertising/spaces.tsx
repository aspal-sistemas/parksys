import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/AdminLayout';
import { LayoutGrid, Monitor, Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface AdSpace {
  id: number;
  pageType: string;
  position: string;
  dimensions: string;
  maxFileSize: number;
  allowedFormats: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdSpaces = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['/api/advertising/spaces'],
    queryFn: async () => {
      const response = await fetch('/api/advertising/spaces');
      if (!response.ok) {
        throw new Error('Error al cargar espacios publicitarios');
      }
      return response.json();
    }
  });

  // Extraer los datos del wrapper de respuesta
  const spaces = apiResponse?.success ? apiResponse.data : [];

  const filteredSpaces = Array.isArray(spaces) ? spaces.filter(space => {
    const spaceName = `${space.pageType} - ${space.position}`;
    const matchesSearch = spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.dimensions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPageType = filterPageType === 'all' || space.pageType === filterPageType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && space.isActive) ||
                         (filterStatus === 'inactive' && !space.isActive);
    
    return matchesSearch && matchesPageType && matchesStatus;
  }) : [];

  const getPageTypeColor = (pageType: string) => {
    const colors = {
      'parks': 'bg-green-100 text-green-800',
      'tree-species': 'bg-blue-100 text-blue-800',
      'activities': 'bg-purple-100 text-purple-800',
      'concessions': 'bg-orange-100 text-orange-800',
      'homepage': 'bg-red-100 text-red-800'
    };
    return colors[pageType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPositionBadge = (position: string) => {
    const positions = {
      'header': 'Header',
      'sidebar': 'Sidebar',
      'footer': 'Footer',
      'hero': 'Hero',
      'content': 'Contenido'
    };
    return positions[position as keyof typeof positions] || position;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando espacios publicitarios...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error al cargar espacios publicitarios</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Espacios Publicitarios</h1>
          <p className="text-gray-600">Gestión de espacios publicitarios disponibles en el sistema</p>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar espacios por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterPageType} onValueChange={setFilterPageType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las páginas</SelectItem>
                  <SelectItem value="parks">Parques</SelectItem>
                  <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
                  <SelectItem value="activities">Actividades</SelectItem>
                  <SelectItem value="concessions">Concesiones</SelectItem>
                  <SelectItem value="homepage">Homepage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Espacio
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Espacios</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Monitor className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.filter(s => s.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <Monitor className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.filter(s => !s.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamaño Promedio</CardTitle>
              <Monitor className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spaces.length > 0 ? Math.round(spaces.reduce((sum, s) => sum + s.maxFileSize, 0) / spaces.length / 1024 / 1024) : 0}MB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de espacios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{space.pageType} - {space.position}</CardTitle>
                  <Badge variant={space.isActive ? "default" : "secondary"}>
                    {space.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <CardDescription>Espacio publicitario en {space.pageType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tipo de página:</span>
                    <Badge className={getPageTypeColor(space.pageType)}>
                      {space.pageType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Posición:</span>
                    <Badge variant="outline">{getPositionBadge(space.position)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dimensiones:</span>
                    <span className="text-sm text-gray-600">{space.dimensions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tamaño máximo:</span>
                    <span className="text-sm font-bold text-[#00a587]">{Math.round(space.maxFileSize / 1024 / 1024)}MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Formatos:</span>
                    <span className="text-sm text-gray-600">{space.allowedFormats.join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron espacios</h3>
            <p className="text-gray-600">
              {searchTerm || filterPageType !== 'all' || filterStatus !== 'all'
                ? 'No hay espacios que coincidan con los filtros aplicados'
                : 'Aún no hay espacios publicitarios configurados'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdSpaces;