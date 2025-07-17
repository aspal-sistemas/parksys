import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { MapPin, Calendar, Image, Link as LinkIcon, ExternalLink, Grid, List, Eye, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Link } from 'wouter';

interface SpaceMapping {
  space_id: number;
  space_name: string;
  page_type: string;
  position: string;
  description: string;
  ad_id: number | null;
  ad_title: string | null;
  ad_content: string | null;
  image_url: string | null;
  link_url: string | null;
  placement_id: number | null;
  priority: number | null;
  start_date: string | null;
  end_date: string | null;
  placement_active: boolean;
  space_active: boolean;
}

const AdSpaces = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Usar el endpoint de space-mappings que tiene información completa
  const { data: spaceMappings, isLoading } = useQuery({
    queryKey: ['/api/advertising-management/space-mappings'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/space-mappings');
      if (!response.ok) {
        throw new Error('Error al obtener espacios publicitarios');
      }
      return response.json();
    },
  });

  // Agrupar espacios por página
  const groupedSpaces = useMemo(() => {
    if (!spaceMappings) return {};
    
    const filtered = spaceMappings.filter((space: SpaceMapping) => {
      const matchesSearch = searchTerm === '' || 
        space.space_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.ad_title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPageType = filterPageType === 'all' || space.page_type === filterPageType;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && space.space_active) ||
        (filterStatus === 'inactive' && !space.space_active) ||
        (filterStatus === 'with_ad' && space.ad_id) ||
        (filterStatus === 'without_ad' && !space.ad_id);
      
      return matchesSearch && matchesPageType && matchesStatus;
    });
    
    return filtered.reduce((acc: any, space: SpaceMapping) => {
      if (!acc[space.page_type]) {
        acc[space.page_type] = [];
      }
      acc[space.page_type].push(space);
      return acc;
    }, {});
  }, [spaceMappings, searchTerm, filterPageType, filterStatus]);

  // Funciones de utilidad
  const getPageDisplayName = (pageType: string) => {
    const pageNames: { [key: string]: string } = {
      'parks': 'Parques',
      'park-landing': 'Landing Pages de Parques',
      'activities': 'Actividades',
      'activity-detail': 'Detalles de Actividades',
      'instructors': 'Instructores',
      'concessions': 'Concesiones',
      'tree-species': 'Especies Arbóreas',
      'volunteers': 'Voluntarios',
      'home': 'Página Principal'
    };
    return pageNames[pageType] || pageType;
  };

  const getPositionDisplayName = (position: string) => {
    const positionNames: { [key: string]: string } = {
      'header': 'Cabecera',
      'sidebar': 'Barra lateral',
      'footer': 'Pie de página',
      'content': 'Contenido',
      'profile': 'Perfil',
      'gallery': 'Galería',
      'hero': 'Hero'
    };
    return positionNames[position] || position;
  };

  const getRouteForPage = (pageType: string) => {
    const routes: { [key: string]: string } = {
      'parks': '/parks',
      'park-landing': '/parks',
      'activities': '/activities',
      'activity-detail': '/activities',
      'instructors': '/instructors',
      'concessions': '/concessions',
      'tree-species': '/tree-species',
      'volunteers': '/volunteers',
      'home': '/'
    };
    return routes[pageType] || '/';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando espacios publicitarios...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espacios Publicitarios</h1>
            <p className="text-gray-600">Gestión de espacios publicitarios organizados por páginas del sistema</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/advertising/advertisements">
              <Button variant="outline">
                <Image className="h-4 w-4 mr-2" />
                Gestionar Anuncios
              </Button>
            </Link>
            <Link href="/admin/advertising/space-mappings">
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Ver Mapeos
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, descripción o anuncio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterPageType} onValueChange={setFilterPageType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las páginas</SelectItem>
              <SelectItem value="parks">Parques</SelectItem>
              <SelectItem value="park-landing">Landing Pages</SelectItem>
              <SelectItem value="activities">Actividades</SelectItem>
              <SelectItem value="instructors">Instructores</SelectItem>
              <SelectItem value="concessions">Concesiones</SelectItem>
              <SelectItem value="tree-species">Especies Arbóreas</SelectItem>
              <SelectItem value="volunteers">Voluntarios</SelectItem>
              <SelectItem value="home">Página Principal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Espacios activos</SelectItem>
              <SelectItem value="inactive">Espacios inactivos</SelectItem>
              <SelectItem value="with_ad">Con anuncio</SelectItem>
              <SelectItem value="without_ad">Sin anuncio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controles de vista */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {Object.keys(groupedSpaces).length} páginas con espacios publicitarios
          </div>
          <div className="flex items-center gap-2">
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

        {/* Contenido organizado por páginas */}
        <div className="space-y-6">
          {Object.entries(groupedSpaces).map(([pageType, spaces]) => (
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
                    {spaces.map((space: SpaceMapping) => (
                      <div key={`${space.space_id}-${space.placement_id}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={space.space_active ? "default" : "secondary"}>
                              {getPositionDisplayName(space.position)}
                            </Badge>
                            <Badge variant={space.placement_active ? "default" : "outline"}>
                              {space.placement_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">ID: {space.space_id}</span>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-1">
                          {space.space_name || `Espacio ${space.space_id}`}
                        </h3>
                        
                        {space.description && (
                          <p className="text-xs text-gray-600 mb-3">{space.description}</p>
                        )}

                        {space.ad_id ? (
                          <div className="space-y-3">
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">
                                  Anuncio Asignado
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Título:</span>
                                  <span className="text-sm font-medium">{space.ad_title}</span>
                                </div>
                                
                                {space.image_url && (
                                  <div className="flex items-center gap-2">
                                    <Image className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-gray-600">Imagen disponible</span>
                                  </div>
                                )}
                                
                                {space.link_url && (
                                  <div className="flex items-center gap-2">
                                    <LinkIcon className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-gray-600">Enlace configurado</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-600">
                                    {new Date(space.start_date).toLocaleDateString()} - {new Date(space.end_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm font-medium text-yellow-800">
                                Sin Anuncio Asignado
                              </span>
                            </div>
                            <p className="text-xs text-yellow-700">
                              Este espacio está disponible para asignar anuncios
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spaces.map((space: SpaceMapping) => (
                      <div key={`${space.space_id}-${space.placement_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{space.space_name || `Espacio ${space.space_id}`}</span>
                            <span className="text-sm text-gray-600">
                              {getPositionDisplayName(space.position)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {space.ad_id ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium">{space.ad_title}</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-yellow-700">Sin anuncio asignado</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={space.space_active ? "default" : "secondary"}>
                            {getPositionDisplayName(space.position)}
                          </Badge>
                          <Badge variant={space.placement_active ? "default" : "outline"}>
                            {space.placement_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {space.ad_id && (
                            <Badge variant="outline">
                              {new Date(space.start_date).toLocaleDateString()} - {new Date(space.end_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(groupedSpaces).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No se encontraron espacios publicitarios</div>
            <p className="text-sm text-gray-400">
              Ajusta los filtros o verifica que existan espacios configurados
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdSpaces;