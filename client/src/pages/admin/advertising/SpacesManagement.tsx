import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Users, Target, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import SpaceForm from '@/components/admin/advertising/SpaceForm';
import AdvertisementForm from '@/components/admin/advertising/AdvertisementForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdSpace {
  id: number;
  position: string;
  page_type: string;
  page_identifier: string;
  name: string;
  description: string;
  width: number;
  height: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  alt_text: string;
  ad_type: string;
  media_type: string;
  is_active: boolean;
  campaign_id: number;
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: number;
  name: string;
  client: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface Placement {
  id: number;
  ad_space_id: number;
  advertisement_id: number;
  start_date: string;
  end_date: string;
  frequency: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  advertisement: Advertisement;
  ad_space: AdSpace;
}

export default function SpacesManagement() {
  const [activeTab, setActiveTab] = useState('spaces');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingSpace, setEditingSpace] = useState<AdSpace | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [viewingPlacements, setViewingPlacements] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar espacios publicitarios
  const { data: spaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ['/api/advertising-management/spaces'],
    queryFn: () => apiRequest('/api/advertising-management/spaces')
  });

  // Cargar anuncios
  const { data: advertisements = [], isLoading: adsLoading } = useQuery({
    queryKey: ['/api/advertising-management/advertisements'],
    queryFn: () => apiRequest('/api/advertising-management/advertisements')
  });

  // Cargar campañas
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/advertising-management/campaigns'],
    queryFn: () => apiRequest('/api/advertising-management/campaigns')
  });

  // Cargar asignaciones
  const { data: placements = [], isLoading: placementsLoading } = useQuery({
    queryKey: ['/api/advertising-management/placements'],
    queryFn: () => apiRequest('/api/advertising-management/placements')
  });

  // Mutaciones para eliminar
  const deleteSpaceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/advertising-management/spaces/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/spaces'] });
      toast({ title: 'Espacio eliminado correctamente' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al eliminar espacio', description: error.message, variant: 'destructive' });
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/advertising-management/advertisements/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
      toast({ title: 'Anuncio eliminado correctamente' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al eliminar anuncio', description: error.message, variant: 'destructive' });
    }
  });

  // Filtros
  const filteredSpaces = spaces.filter((space: AdSpace) => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || space.category === categoryFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && space.is_active) ||
                         (statusFilter === 'inactive' && !space.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredAds = advertisements.filter((ad: Advertisement) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || ad.ad_type === categoryFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && ad.is_active) ||
                         (statusFilter === 'inactive' && !ad.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSpaceSave = () => {
    setIsSpaceDialogOpen(false);
    setEditingSpace(null);
    queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/spaces'] });
  };

  const handleAdSave = () => {
    setIsAdDialogOpen(false);
    setEditingAd(null);
    queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
  };

  const getSpacePlacements = (spaceId: number) => {
    return placements.filter((placement: Placement) => placement.ad_space_id === spaceId);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Publicidad</h1>
          <p className="text-gray-600">Administra espacios publicitarios, anuncios y campañas</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingSpace(null);
              setIsSpaceDialogOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Espacio
          </Button>
          <Button
            onClick={() => {
              setEditingAd(null);
              setIsAdDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espacios Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {spaces.filter((s: AdSpace) => s.is_active).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anuncios Activos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {advertisements.filter((a: Advertisement) => a.is_active).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campañas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaigns.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Asignaciones</p>
                <p className="text-2xl font-bold text-orange-600">
                  {placements.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="institutional">Institucional</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal con tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spaces">Espacios ({spaces.length})</TabsTrigger>
          <TabsTrigger value="advertisements">Anuncios ({advertisements.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="placements">Asignaciones ({placements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="spaces" className="space-y-4">
          {spacesLoading ? (
            <div className="text-center py-8">Cargando espacios...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpaces.map((space: AdSpace) => (
                <Card key={space.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{space.name}</CardTitle>
                        <p className="text-sm text-gray-600">{space.page_type}</p>
                      </div>
                      <Badge variant={space.is_active ? "default" : "secondary"}>
                        {space.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{space.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Posición:</span>
                        <span className="font-medium">{space.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensiones:</span>
                        <span className="font-medium">{space.width}x{space.height}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categoría:</span>
                        <Badge variant="outline" className="text-xs">
                          {space.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Asignaciones:</span>
                        <span className="font-medium">{getSpacePlacements(space.id).length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingPlacements(space.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSpace(space);
                          setIsSpaceDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSpaceMutation.mutate(space.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="advertisements" className="space-y-4">
          {adsLoading ? (
            <div className="text-center py-8">Cargando anuncios...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad: Advertisement) => (
                <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                        <p className="text-sm text-gray-600">{ad.ad_type}</p>
                      </div>
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
                    {ad.image_url && (
                      <img 
                        src={ad.image_url} 
                        alt={ad.alt_text}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tipo de Media:</span>
                        <Badge variant="outline" className="text-xs">
                          {ad.media_type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Campaña:</span>
                        <span className="font-medium">
                          {campaigns.find((c: Campaign) => c.id === ad.campaign_id)?.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAd(ad);
                          setIsAdDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAdMutation.mutate(ad.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {campaignsLoading ? (
            <div className="text-center py-8">Cargando campañas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign: Campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <p className="text-sm text-gray-600">{campaign.client}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Inicio:</span>
                        <span className="font-medium">{new Date(campaign.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fin:</span>
                        <span className="font-medium">{new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Presupuesto:</span>
                        <span className="font-medium">${campaign.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prioridad:</span>
                        <Badge variant="outline" className="text-xs">
                          {campaign.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          {placementsLoading ? (
            <div className="text-center py-8">Cargando asignaciones...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {placements.map((placement: Placement) => (
                <Card key={placement.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{placement.advertisement.title}</CardTitle>
                        <p className="text-sm text-gray-600">{placement.ad_space.name}</p>
                      </div>
                      <Badge variant={placement.is_active ? "default" : "secondary"}>
                        {placement.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Inicio:</span>
                        <span className="font-medium">{new Date(placement.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fin:</span>
                        <span className="font-medium">{new Date(placement.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frecuencia:</span>
                        <Badge variant="outline" className="text-xs">
                          {placement.frequency}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Prioridad:</span>
                        <span className="font-medium">{placement.priority}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para espacios */}
      <Dialog open={isSpaceDialogOpen} onOpenChange={setIsSpaceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpace ? 'Editar Espacio Publicitario' : 'Nuevo Espacio Publicitario'}
            </DialogTitle>
          </DialogHeader>
          <SpaceForm
            space={editingSpace}
            onSave={handleSpaceSave}
            onCancel={() => setIsSpaceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para anuncios */}
      <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </DialogTitle>
          </DialogHeader>
          <AdvertisementForm
            advertisement={editingAd}
            onSave={handleAdSave}
            onCancel={() => setIsAdDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}