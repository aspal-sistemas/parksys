import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Image as ImageIcon,
  Link,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  campaign_id: number;
  campaign_name: string;
  is_active: boolean;
  active_placements: number;
  total_impressions: number;
  total_clicks: number;
  click_rate: number;
  created_at: string;
}

interface Campaign {
  id: number;
  name: string;
  client: string;
  status: string;
}

interface AdFormData {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  campaign_id: number;
  is_active: boolean;
}

const AdAdvertisements: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    alt_text: '',
    campaign_id: 0,
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener anuncios
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ['/api/advertising/advertisements'],
    queryFn: () => apiRequest('/api/advertising/advertisements')
  });

  // Obtener campañas
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/advertising/campaigns'],
    queryFn: () => apiRequest('/api/advertising/campaigns')
  });

  // Mutación para crear anuncio
  const createAdMutation = useMutation({
    mutationFn: (data: AdFormData) => apiRequest('/api/advertising/advertisements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/advertisements'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Anuncio creado",
        description: "El anuncio se ha creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el anuncio",
        variant: "destructive"
      });
    }
  });

  // Mutación para actualizar anuncio
  const updateAdMutation = useMutation({
    mutationFn: (data: AdFormData) => apiRequest(`/api/advertising/advertisements/${selectedAd?.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/advertisements'] });
      setIsEditModalOpen(false);
      setSelectedAd(null);
      resetForm();
      toast({
        title: "Anuncio actualizado",
        description: "El anuncio se ha actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el anuncio",
        variant: "destructive"
      });
    }
  });

  // Mutación para eliminar anuncio
  const deleteAdMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/advertising/advertisements/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising/advertisements'] });
      toast({
        title: "Anuncio eliminado",
        description: "El anuncio se ha eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el anuncio",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      alt_text: '',
      campaign_id: 0,
      is_active: true
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdMutation.mutate(formData);
  };

  const handleEditClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      alt_text: ad.alt_text || '',
      campaign_id: ad.campaign_id || 0,
      is_active: ad.is_active !== undefined ? ad.is_active : true
    });
    setIsEditModalOpen(true);
  };

  const handleViewClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (ad: Advertisement) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el anuncio "${ad.title}"?`)) {
      deleteAdMutation.mutate(ad.id);
    }
  };

  // Filtrar anuncios
  const filteredAdvertisements = advertisements.filter((ad: Advertisement) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = filterCampaign === 'all' || ad.campaign_id.toString() === filterCampaign;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && ad.is_active) ||
                         (filterStatus === 'inactive' && !ad.is_active);
    
    return matchesSearch && matchesCampaign && matchesStatus;
  });

  // Estadísticas
  const totalAds = advertisements.length;
  const activeAds = advertisements.filter((ad: Advertisement) => ad.is_active).length;
  const totalImpressions = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.total_impressions || 0), 0);
  const totalClicks = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.total_clicks || 0), 0);
  const averageClickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCampaignName = (campaignId: number) => {
    const campaign = campaigns.find((c: Campaign) => c.id === campaignId);
    return campaign?.name || 'Sin campaña';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Anuncios</h1>
            <p className="text-gray-600">Crea y gestiona el contenido publicitario para tus espacios</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Anuncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="Título del anuncio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign">Campaña *</Label>
                    <Select value={formData.campaign_id.toString()} onValueChange={(value) => setFormData({...formData, campaign_id: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar campaña" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((campaign: Campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id.toString()}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del anuncio"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image_url">URL de la Imagen *</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    required
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_url">URL de Destino</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                    placeholder="https://ejemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt_text">Texto Alternativo</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                    placeholder="Descripción de la imagen para accesibilidad"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <Label htmlFor="is_active">Anuncio activo</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]">
                    Crear Anuncio
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Anuncios</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAds}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-[#00a587]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anuncios Activos</p>
                  <p className="text-2xl font-bold text-green-600">{activeAds}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Impresiones</p>
                  <p className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CTR Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{averageClickRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar anuncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las campañas</SelectItem>
                    {campaigns.map((campaign: Campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de anuncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvertisements.map((ad: Advertisement) => (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Imagen preview */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={ad.image_url} 
                      alt={ad.alt_text || ad.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48cGF0aCBkPSJNNTAgNTBoMTAwdjEwSDE1MHYxMEg1MFY1MHoiIGZpbGw9IiNkMWQ1ZGIiLz48L3N2Zz4=';
                      }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={ad.is_active ? "default" : "secondary"}>
                      {ad.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    <span className="text-xs text-gray-500">{getCampaignName(ad.campaign_id)}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">{ad.active_placements || 0}</span> asignaciones
                    </div>
                    <div>
                      <span className="font-medium">{ad.total_impressions || 0}</span> impresiones
                    </div>
                    <div>
                      <span className="font-medium">{ad.click_rate || 0}%</span> CTR
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewClick(ad)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClick(ad)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(ad)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAdvertisements.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron anuncios</h3>
            <p className="text-gray-600">
              {searchTerm || filterCampaign !== 'all' || filterStatus !== 'all'
                ? 'No hay anuncios que coincidan con los filtros aplicados'
                : 'Aún no hay anuncios configurados'}
            </p>
          </div>
        )}

        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del Anuncio</DialogTitle>
            </DialogHeader>
            {selectedAd && (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={selectedAd.image_url} 
                    alt={selectedAd.alt_text || selectedAd.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Título:</strong> {selectedAd.title}</p>
                      <p><strong>Campaña:</strong> {getCampaignName(selectedAd.campaign_id)}</p>
                      <p><strong>Estado:</strong> 
                        <Badge className="ml-2" variant={selectedAd.is_active ? "default" : "secondary"}>
                          {selectedAd.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </p>
                      <p><strong>Creado:</strong> {formatDate(selectedAd.created_at)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Métricas</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Asignaciones activas:</strong> {selectedAd.active_placements || 0}</p>
                      <p><strong>Impresiones:</strong> {selectedAd.total_impressions || 0}</p>
                      <p><strong>Clicks:</strong> {selectedAd.total_clicks || 0}</p>
                      <p><strong>CTR:</strong> {selectedAd.click_rate || 0}%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-sm text-gray-600">{selectedAd.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enlaces</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>URL de destino:</strong> 
                      <a href={selectedAd.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {selectedAd.link_url}
                      </a>
                    </p>
                    <p><strong>Texto alternativo:</strong> {selectedAd.alt_text}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Anuncio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_title">Título *</Label>
                  <Input
                    id="edit_title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_campaign">Campaña *</Label>
                  <Select value={formData.campaign_id.toString()} onValueChange={(value) => setFormData({...formData, campaign_id: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campaña" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign: Campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id.toString()}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_description">Descripción</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_image_url">URL de la Imagen *</Label>
                <Input
                  id="edit_image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_link_url">URL de Destino</Label>
                <Input
                  id="edit_link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_alt_text">Texto Alternativo</Label>
                <Input
                  id="edit_alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <Label htmlFor="edit_is_active">Anuncio activo</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]">
                  Actualizar Anuncio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdAdvertisements;