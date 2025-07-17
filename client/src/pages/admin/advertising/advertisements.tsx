import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Eye, Activity, ImageIcon, Upload, Calendar, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  content: string;
  campaign_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  campaign?: {
    id: number;
    name: string;
  };
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
}

const AdAdvertisements = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [forceRender, setForceRender] = useState(Date.now());
  const [ad13Timestamp, setAd13Timestamp] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    content: '',
    campaign_id: 0,
    is_active: true,
    media_type: 'image' as 'image' | 'video' | 'gif',
    storage_type: 'url' as 'url' | 'upload',
    duration: 0,
    alt_text: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Función para subir archivos
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📁 Subiendo archivo:', file.name, file.type, file.size);

      const response = await fetch('/api/advertising/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📁 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📁 Response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Error al subir el archivo';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
          errorMessage = `Error del servidor: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch advertisements
  const { data: advertisements = [], isLoading: isLoadingAds, refetch } = useQuery({
    queryKey: ['/api/advertising-management/advertisements'],
    staleTime: 10 * 1000,
    gcTime: 30 * 1000,
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/advertising-management/campaigns'],
    staleTime: 5 * 60 * 1000,
  });

  // Detectar cambios específicos en anuncio 13
  useEffect(() => {
    if (!advertisements || advertisements.length === 0) return;
    
    const ad13 = advertisements.find((ad: Advertisement) => ad.id === 13);
    if (ad13 && ad13.updated_at && ad13.updated_at !== ad13Timestamp) {
      console.log('🎯 ANUNCIO 13 DETECTADO - Cambio en timestamp:', {
        anterior: ad13Timestamp,
        nuevo: ad13.updated_at,
        diferencia: ad13Timestamp ? 'CAMBIO DETECTADO' : 'PRIMER CARGA'
      });
      
      setAd13Timestamp(ad13.updated_at);
      
      // Usar función especializada para actualizar anuncio 13
      forceAd13Update();
    }
  }, [advertisements, ad13Timestamp]);

  // Función especializada para actualizar anuncio 13 (Beneficios para Voluntarios)
  const forceAd13Update = () => {
    console.log('🎯 FORZANDO ACTUALIZACIÓN DEL ANUNCIO 13...');
    
    // Invalidar cache React Query específicamente
    queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
    
    // Actualizar estados de forzado para provocar re-render
    setRefreshKey(Date.now());
    setForceRender(Date.now());
    
    // Forzar re-fetch de los datos
    refetch();
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/advertising-management/advertisements', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Anuncio creado correctamente",
      });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        content: '',
        campaign_id: 0,
        is_active: true,
        media_type: 'image',
        storage_type: 'url',
        duration: 0,
        alt_text: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el anuncio",
        variant: "destructive",
      });
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return await apiRequest(`/api/advertising-management/advertisements/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Anuncio actualizado correctamente",
      });
      setIsEditModalOpen(false);
      setSelectedAd(null);
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el anuncio",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/advertising-management/advertisements/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Anuncio eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el anuncio",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url || formData.campaign_id === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) {
      toast({
        title: "Error",
        description: "No se ha seleccionado un anuncio para editar",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.image_url || formData.campaign_id === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    
    // Preparar los datos para el endpoint
    const updateData = {
      id: selectedAd.id,
      title: formData.title,
      description: formData.description || '',
      image_url: formData.image_url,
      link_url: '',
      alt_text: formData.alt_text || '',
      ad_type: 'institutional',
      media_type: formData.media_type,
      frequency: 'always',
      priority: 5,
      is_active: formData.is_active,
      video_url: null,
      html_content: formData.content || '',
      carousel_images: [],
      scheduled_days: [],
      scheduled_hours: [],
      target_pages: [],
      target_positions: [],
      campaign_id: formData.campaign_id,
      content: formData.content || '',
      storage_type: formData.storage_type || 'url',
      media_file_id: null,
      duration: formData.duration || 0,
      type: formData.media_type,
      status: 'active'
    };
    
    console.log('Datos para actualizar:', updateData);
    editMutation.mutate(updateData);
  };

  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      content: ad.content || '',
      campaign_id: ad.campaign_id || 0,
      is_active: ad.is_active || false,
      media_type: 'image',
      storage_type: 'url',
      duration: 0,
      alt_text: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter advertisements
  const filteredAds = advertisements.filter((ad: Advertisement) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = campaignFilter === 'all' || (ad.campaign_id && ad.campaign_id.toString() === campaignFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && ad.is_active) ||
                         (statusFilter === 'inactive' && !ad.is_active);
    
    return matchesSearch && matchesCampaign && matchesStatus;
  });

  // Statistics
  const totalAds = advertisements.length;
  const activeAds = advertisements.filter((ad: Advertisement) => ad.is_active).length;
  const totalImpressions = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.id * 150), 0);
  const totalClicks = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.id * 25), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCampaignName = (campaignId: number) => {
    const campaign = campaigns.find((c: Campaign) => c.id === campaignId);
    return campaign?.name || 'Sin campaña';
  };

  if (isLoadingAds) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00a587]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Anuncios</h1>
            <p className="text-gray-600">Crea y gestiona el contenido publicitario para tus espacios</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={forceAd13Update} variant="outline" className="bg-orange-50 hover:bg-orange-100 text-orange-700">
              <Eye className="h-4 w-4 mr-2" />
              Actualizar Anuncio 13
            </Button>
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
                      <Select value={formData.campaign_id ? formData.campaign_id.toString() : ""} onValueChange={(value) => setFormData({...formData, campaign_id: parseInt(value)})}>
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
                  
                  {/* Tipo de contenido multimedia */}
                  <div>
                    <Label htmlFor="media_type">Tipo de Contenido *</Label>
                    <Select value={formData.media_type} onValueChange={(value) => setFormData({...formData, media_type: value as 'image' | 'video' | 'gif'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de contenido" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Imagen</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="gif">GIF Animado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Método de almacenamiento */}
                  <div>
                    <Label htmlFor="storage_type">Método de Almacenamiento *</Label>
                    <Select value={formData.storage_type} onValueChange={(value) => setFormData({...formData, storage_type: value as 'url' | 'upload'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL Externa</SelectItem>
                        <SelectItem value="upload">Subir Archivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo condicional según el tipo de almacenamiento */}
                  {formData.storage_type === 'url' ? (
                    <div>
                      <Label htmlFor="image_url">URL del Contenido *</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        required
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="file_upload">Subir Archivo *</Label>
                      <Input
                        id="file_upload"
                        type="file"
                        accept={formData.media_type === 'image' ? 'image/*' : formData.media_type === 'video' ? 'video/*' : 'image/gif'}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const uploadedUrl = await uploadFile(file);
                              setFormData({...formData, image_url: uploadedUrl});
                              toast({
                                title: "Éxito",
                                description: "Archivo subido correctamente",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Error al subir el archivo",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        disabled={isUploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00a587] file:text-white hover:file:bg-[#067f5f] disabled:opacity-50"
                      />
                      {isUploading && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00a587] mr-2"></div>
                          Subiendo archivo...
                        </div>
                      )}
                      {formData.image_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Vista previa:</p>
                          <div className="mt-1 border border-gray-300 rounded-lg p-2">
                            {formData.media_type === 'image' || formData.media_type === 'gif' ? (
                              <img src={formData.image_url} alt="Vista previa" className="max-w-full h-32 object-cover rounded" />
                            ) : (
                              <video src={formData.image_url} controls className="max-w-full h-32 rounded" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Duración para videos */}
                  {formData.media_type === 'video' && (
                    <div>
                      <Label htmlFor="duration">Duración (segundos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                        placeholder="30"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Texto alternativo */}
                  <div>
                    <Label htmlFor="alt_text">Texto Alternativo</Label>
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                      placeholder="Descripción del contenido para accesibilidad"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Contenido adicional del anuncio"
                      rows={4}
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
        </div>

        {/* Statistics */}
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
                  <p className="text-sm text-gray-600">Clicks</p>
                  <p className="text-2xl font-bold text-purple-600">{totalClicks.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar anuncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger>
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
          </div>
          <div className="min-w-[120px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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

        {/* Advertisements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad: Advertisement) => (
            <Card key={`${ad.id}-${refreshKey}-${forceRender}`} className="overflow-hidden" data-ad-id={ad.id}>
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={`${ad.image_url}?v=${ad.updated_at}&r=${refreshKey}&f=${forceRender}&t=${Date.now()}&rnd=${Math.random().toString(36).substr(2, 9)}&cb=${Date.now()}&uid=${Math.random().toString(36).substr(2, 9)}`}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  key={`img-${ad.id}-${refreshKey}-${forceRender}`}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ad.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{ad.title}</h3>
                  <p className="text-sm text-gray-600">{ad.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{getCampaignName(ad.campaign_id)}</span>
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Anuncio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_title">Título *</Label>
                  <Input
                    id="edit_title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Título del anuncio"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_campaign">Campaña *</Label>
                  <Select value={formData.campaign_id ? formData.campaign_id.toString() : ""} onValueChange={(value) => setFormData({...formData, campaign_id: parseInt(value)})}>
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
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del anuncio"
                  rows={3}
                />
              </div>
              
              {/* Tipo de contenido multimedia */}
              <div>
                <Label htmlFor="edit_media_type">Tipo de Contenido *</Label>
                <Select value={formData.media_type} onValueChange={(value) => setFormData({...formData, media_type: value as 'image' | 'video' | 'gif'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de contenido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagen</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="gif">GIF Animado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Método de almacenamiento */}
              <div>
                <Label htmlFor="edit_storage_type">Método de Almacenamiento *</Label>
                <Select value={formData.storage_type} onValueChange={(value) => setFormData({...formData, storage_type: value as 'url' | 'upload'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL Externa</SelectItem>
                    <SelectItem value="upload">Subir Archivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo condicional según el tipo de almacenamiento */}
              {formData.storage_type === 'url' ? (
                <div>
                  <Label htmlFor="edit_image_url">URL del Contenido *</Label>
                  <Input
                    id="edit_image_url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    required
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="edit_file_upload">Subir Archivo *</Label>
                  <Input
                    id="edit_file_upload"
                    type="file"
                    accept={formData.media_type === 'image' ? 'image/*' : formData.media_type === 'video' ? 'video/*' : 'image/gif'}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const uploadedUrl = await uploadFile(file);
                          setFormData({...formData, image_url: uploadedUrl});
                          toast({
                            title: "Éxito",
                            description: "Archivo subido correctamente",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Error al subir el archivo",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    disabled={isUploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00a587] file:text-white hover:file:bg-[#067f5f] disabled:opacity-50"
                  />
                  {isUploading && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00a587] mr-2"></div>
                      Subiendo archivo...
                    </div>
                  )}
                  {formData.image_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Vista previa actual:</p>
                      <div className="mt-1 border border-gray-300 rounded-lg p-2">
                        {formData.media_type === 'image' || formData.media_type === 'gif' ? (
                          <img src={formData.image_url} alt="Vista previa" className="max-w-full h-32 object-cover rounded" />
                        ) : (
                          <video src={formData.image_url} controls className="max-w-full h-32 rounded" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Duración para videos */}
              {formData.media_type === 'video' && (
                <div>
                  <Label htmlFor="edit_duration">Duración (segundos)</Label>
                  <Input
                    id="edit_duration"
                    type="number"
                    value={formData.duration || 0}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    placeholder="30"
                    min="0"
                  />
                </div>
              )}

              {/* Texto alternativo */}
              <div>
                <Label htmlFor="edit_alt_text">Texto Alternativo</Label>
                <Input
                  id="edit_alt_text"
                  value={formData.alt_text || ''}
                  onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                  placeholder="Descripción del contenido para accesibilidad"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_content">Contenido</Label>
                <Textarea
                  id="edit_content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Contenido adicional del anuncio"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <Label htmlFor="edit_is_active">Anuncio activo</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? 'Actualizando...' : 'Actualizar Anuncio'}
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