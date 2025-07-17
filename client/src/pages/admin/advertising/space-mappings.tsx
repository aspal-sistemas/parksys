import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Eye, MapPin, Calendar, Image, Link as LinkIcon } from 'lucide-react';
import { Link } from 'wouter';
import AdminLayout from '@/components/AdminLayout';

interface SpaceMapping {
  space_id: number;
  space_name: string;
  page_type: string;
  position: string;
  description: string;
  ad_id: number;
  ad_title: string;
  ad_content: string;
  image_url: string;
  link_url: string;
  placement_id: number;
  priority: number;
  start_date: string;
  end_date: string;
  placement_active: boolean;
  space_active: boolean;
}

const SpaceMappings: React.FC = () => {
  const { data: mappings, isLoading } = useQuery<SpaceMapping[]>({
    queryKey: ['/api/advertising-management/space-mappings'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Agrupar por página
  const groupedMappings = mappings?.reduce((acc, mapping) => {
    if (!acc[mapping.page_type]) {
      acc[mapping.page_type] = [];
    }
    acc[mapping.page_type].push(mapping);
    return acc;
  }, {} as Record<string, SpaceMapping[]>) || {};

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
      'hero': 'Área Principal'
    };
    return names[position] || position;
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

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapeo de Espacios Publicitarios</h1>
          <p className="text-gray-600">Visualización completa de espacios publicitarios y sus anuncios asignados</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/advertising/advertisements">
            <Button variant="outline">
              <Image className="h-4 w-4 mr-2" />
              Gestionar Anuncios
            </Button>
          </Link>
          <Link href="/admin/advertising/spaces">
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Gestionar Espacios
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="by-page" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-page">Por Página</TabsTrigger>
          <TabsTrigger value="active-only">Solo Activos</TabsTrigger>
        </TabsList>

        <TabsContent value="by-page" className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaces.map((space) => (
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active-only" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Espacios Publicitarios Activos</CardTitle>
              <CardDescription>
                Solo espacios con anuncios activos asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mappings?.filter(m => m.ad_id && m.placement_active).map((mapping) => (
                  <div key={`${mapping.space_id}-${mapping.placement_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{mapping.space_name || `Espacio ${mapping.space_id}`}</span>
                        <span className="text-sm text-gray-600">
                          {getPageDisplayName(mapping.page_type)} - {getPositionDisplayName(mapping.position)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">{mapping.ad_title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {new Date(mapping.start_date).toLocaleDateString()} - {new Date(mapping.end_date).toLocaleDateString()}
                      </Badge>
                      <Link href={getRouteForPage(mapping.page_type)} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SpaceMappings;