import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { MapPin, Calendar, Image, Link as LinkIcon, ExternalLink, Grid, List, Eye, Plus, Edit, Trash2, Search, Filter, Power, PowerOff } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface AdSpace {
  id: number;
  name?: string;
  description?: string;
  page_type: string;
  position: string;
  page_identifier?: string;
  dimensions: string;
  max_file_size: number;
  allowed_formats: string[];
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdSpaces = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutación para toggle del estado de un espacio
  const toggleSpaceMutation = useMutation({
    mutationFn: async ({ space, isActive }: { space: AdSpace; isActive: boolean }) => {
      return apiRequest(`/api/advertising-management/spaces/${space.id}`, {
        method: 'PUT',
        data: {
          name: space.name,
          description: space.description,
          page_type: space.page_type,
          position: space.position,
          is_active: !isActive
        }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/spaces'] });
      toast({
        title: "Espacio actualizado",
        description: `El espacio ha sido ${data.is_active ? 'activado' : 'desactivado'} correctamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el espacio. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error('Error toggling space:', error);
    },
  });

  // Usar el endpoint de spaces que está disponible
  const { data: spaceMappings, isLoading, error } = useQuery({
    queryKey: ['/api/advertising-management/spaces'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/spaces');
      if (!response.ok) {
        throw new Error(`Error al obtener espacios publicitarios: ${response.status}`);
      }
      return response.json();
    },
  });

  // Agrupar espacios por página
  const groupedSpaces = useMemo(() => {
    if (!spaceMappings || !Array.isArray(spaceMappings)) {
      return {};
    }
    
    const filtered = spaceMappings.filter((space: AdSpace) => {
      const matchesSearch = searchTerm === '' || 
        space.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPageType = filterPageType === 'all' || space.page_type === filterPageType;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && space.is_active) ||
        (filterStatus === 'inactive' && !space.is_active);
      
      return matchesSearch && matchesPageType && matchesStatus;
    });
    
    return filtered.reduce((acc: any, space: AdSpace) => {
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
        {/* Header Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-8 h-8 text-gray-900" />
                  <h1 className="text-3xl font-bold text-gray-900">Espacios Publicitarios</h1>
                </div>
                <p className="text-gray-600 mt-2">Gestión de espacios publicitarios organizados por páginas del sistema</p>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/advertising/advertisements">
                  <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                    <Image className="h-4 w-4 mr-2" />
                    Gestionar Anuncios
                  </Button>
                </Link>
                <Link href="/admin/advertising/space-mappings">
                  <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver Mapeos
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      {(spaces as any[]).length} espacios publicitarios configurados
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
                    {spaces && Array.isArray(spaces) ? spaces.map((space: AdSpace) => (
                      <div key={`${space.id}-${space.page_type}-${space.position}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={space.is_active ? "default" : "secondary"}>
                              {getPositionDisplayName(space.position)}
                            </Badge>
                            <Badge variant="outline">
                              {space.category || 'General'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">ID: {space.id}</span>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-1">
                          {space.name || `Espacio ${space.id}`}
                        </h3>
                        
                        {space.description && (
                          <p className="text-xs text-gray-600 mb-3">{space.description}</p>
                        )}

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Dimensiones:</span>
                            <span className="text-sm">{space.dimensions}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Formatos:</span>
                            <span className="text-sm">
                              {space.allowed_formats && Array.isArray(space.allowed_formats) 
                                ? space.allowed_formats.map(format => format.split('/')[1]).join(', ')
                                : 'No especificado'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">
                              Espacio Publicitario Configurado
                            </span>
                          </div>
                          <p className="text-xs text-blue-700">
                            Este espacio está listo para mostrar anuncios
                          </p>
                        </div>
                        
                        {/* Botón de toggle */}
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant={space.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleSpaceMutation.mutate({ space: space, isActive: space.is_active })}
                            disabled={toggleSpaceMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            {space.is_active ? (
                              <>
                                <PowerOff className="h-3 w-3" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Power className="h-3 w-3" />
                                Activar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No hay espacios disponibles
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spaces && Array.isArray(spaces) ? spaces.map((space: AdSpace) => (
                      <div key={`${space.id}-${space.page_type}-${space.position}-list`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{space.name || `Espacio ${space.id}`}</span>
                            <span className="text-sm text-gray-600">
                              {getPositionDisplayName(space.position)} - {space.dimensions}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">{space.category || 'General'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={space.is_active ? "default" : "secondary"}>
                            {space.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Button
                            variant={space.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleSpaceMutation.mutate({ space: space, isActive: space.is_active })}
                            disabled={toggleSpaceMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            {space.is_active ? (
                              <>
                                <PowerOff className="h-3 w-3" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Power className="h-3 w-3" />
                                Activar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        No hay espacios disponibles
                      </div>
                    )}
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