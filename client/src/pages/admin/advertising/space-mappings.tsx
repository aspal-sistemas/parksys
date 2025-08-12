import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Eye, MapPin, Calendar, Grid, List, Search, Filter, Settings } from 'lucide-react';
import { Link } from 'wouter';
import AdminLayout from '@/components/AdminLayout';

interface SpaceMapping {
  id: number;
  pageType: string;
  position: string;
  spaceId: number;
  isActive: boolean;
  priority: number;
  fallbackBehavior: string;
  layoutConfig: {
    responsive: boolean;
    aspectRatio?: string;
    maxWidth?: string;
    minHeight?: string;
  };
  createdAt: string;
  updatedAt: string;
  space: {
    name: string;
    dimensions: string;
    pageType: string;
  };
}

const SpaceMappings: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');

  const { data: response, isLoading, error } = useQuery<{success: boolean, data: SpaceMapping[], total: number}>({
    queryKey: ['/api/advertising-management/space-mappings'],
  });

  const mappings = response?.data || [];

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">Error al cargar los mapeos de espacios publicitarios</div>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getPageDisplayName = (pageType: string) => {
    const names: Record<string, string> = {
      'homepage': 'Página Principal',
      'parks': 'Parques',
      'park-landing': 'Landing Pages de Parques',
      'activities': 'Actividades',
      'activity-detail': 'Detalles de Actividad',
      'concessions': 'Concesiones',
      'instructors': 'Instructores',
      'instructor-profile': 'Perfil de Instructor',
      'volunteers': 'Voluntarios',
      'tree-species': 'Especies Arbóreas'
    };
    return names[pageType] || pageType;
  };

  const getPositionDisplayName = (position: string) => {
    const names: Record<string, string> = {
      'header': 'Cabecera',
      'sidebar': 'Barra Lateral',
      'footer': 'Pie de Página',
      'hero': 'Área Principal',
      'banner': 'Banner'
    };
    return names[position] || position;
  };

  const getFallbackBehaviorName = (behavior: string) => {
    const names: Record<string, string> = {
      'hide': 'Ocultar',
      'placeholder': 'Mostrar Placeholder',
      'alternative': 'Contenido Alternativo'
    };
    return names[behavior] || behavior;
  };

  const getRouteForPage = (pageType: string) => {
    const routes: Record<string, string> = {
      'homepage': '/',
      'parks': '/parks',
      'park-landing': '/parque/bosque-los-colomos-5',
      'activities': '/activities',
      'activity-detail': '/activities',
      'concessions': '/concessions',
      'instructors': '/instructors',
      'instructor-profile': '/instructor/87',
      'volunteers': '/volunteers',
      'tree-species': '/tree-species'
    };
    return routes[pageType] || '/';
  };

  // Get unique pages
  const uniquePages = Array.from(new Set(mappings?.map(m => m.pageType))) || [];

  // Filter mappings by search term and dropdown selections
  const filteredMappings = mappings?.filter(mapping => {
    // Ensure mapping has required properties
    if (!mapping || !mapping.pageType || !mapping.position) {
      return false;
    }

    // Text search filter
    const searchMatch = !searchTerm || (() => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (mapping.space?.name || '').toLowerCase().includes(searchLower) ||
        (mapping.pageType || '').toLowerCase().includes(searchLower) ||
        (mapping.position || '').toLowerCase().includes(searchLower) ||
        (mapping.fallbackBehavior || '').toLowerCase().includes(searchLower) ||
        getPageDisplayName(mapping.pageType || '').toLowerCase().includes(searchLower) ||
        getPositionDisplayName(mapping.position || '').toLowerCase().includes(searchLower)
      );
    })();

    // Page filter
    const pageMatch = selectedPage === 'all' || mapping.pageType === selectedPage;

    return searchMatch && pageMatch;
  }) || [];

  // Agrupar por página (usando mappings filtrados)
  const groupedMappings = filteredMappings.reduce((acc, mapping) => {
    if (!acc[mapping.pageType]) {
      acc[mapping.pageType] = [];
    }
    acc[mapping.pageType].push(mapping);
    return acc;
  }, {} as Record<string, SpaceMapping[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mapeos de Espacios Publicitarios</h1>
                  <p className="text-gray-600">Configuración de espacios publicitarios por página</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {mappings.length} mapeos totales
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Buscar espacios
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, página, posición..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Filtrar por página
                </label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las páginas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las páginas</SelectItem>
                    {uniquePages.map((pageType) => (
                      <SelectItem key={pageType} value={pageType}>
                        {getPageDisplayName(pageType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {Object.entries(groupedMappings).map(([pageType, spaces]) => (
          <Card key={pageType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {getPageDisplayName(pageType)}
                  </CardTitle>
                  <CardDescription>
                    {spaces.length} espacios publicitarios configurados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={getRouteForPage(pageType)} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Página
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaces.map((space) => (
                    <div key={space.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={space.isActive ? "default" : "secondary"}>
                          {getPositionDisplayName(space.position)}
                        </Badge>
                        <span className="text-sm text-gray-500">ID: {space.spaceId}</span>
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-2">
                        {space.space?.name || `Espacio ${space.spaceId}`}
                      </h3>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Dimensiones:</span>
                          <span>{space.space?.dimensions || 'No especificadas'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">Prioridad:</span>
                          <Badge variant="outline" className="text-xs">{space.priority}</Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">Comportamiento:</span>
                          <span>{getFallbackBehaviorName(space.fallbackBehavior)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">Responsivo:</span>
                          <Badge variant={space.layoutConfig?.responsive ? "default" : "secondary"} className="text-xs">
                            {space.layoutConfig?.responsive ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>Actualizado: {space.updatedAt ? new Date(space.updatedAt).toLocaleDateString() : 'No disponible'}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {spaces.map((space) => (
                    <div key={space.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">
                            {space.space?.name || `Espacio ${space.spaceId}`}
                          </h3>
                          <Badge variant={space.isActive ? "default" : "secondary"}>
                            {getPositionDisplayName(space.position)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Prioridad {space.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Dimensiones: {space.space?.dimensions || 'No especificadas'}</span>
                          <span>•</span>
                          <span>Comportamiento: {getFallbackBehaviorName(space.fallbackBehavior)}</span>
                          <span>•</span>
                          <span>Actualizado: {space.updatedAt ? new Date(space.updatedAt).toLocaleDateString() : 'No disponible'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredMappings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron mapeos
              </h3>
              <p className="text-gray-600 mb-4">
                No hay espacios publicitarios que coincidan con los filtros seleccionados.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedPage('all');
              }}>
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SpaceMappings;