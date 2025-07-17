import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Video,
  FileImage,
  PlayCircle,
  Clock,
  Upload
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
  media_type?: 'image' | 'video' | 'gif';
  video_url?: string;
  duration?: number;
  storage_type?: 'url' | 'file';
  media_file_id?: number;
}

interface UploadedFile {
  id: number;
  filename: string;
  original_name: string;
  file_url: string;
  media_type: string;
  file_size: number;
}

const AdAdvertisements: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const [imageKeys, setImageKeys] = useState<{[key: number]: string}>({});
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    alt_text: '',
    campaign_id: 0,
    is_active: true,
    media_type: 'image',
    video_url: '',
    duration: 0,
    storage_type: 'url',
    media_file_id: undefined
  });
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener anuncios
  const { data: advertisementData = [], isLoading } = useQuery({
    queryKey: ['/api/advertising-management/advertisements'],
    queryFn: () => apiRequest('/api/advertising-management/advertisements')
  });

  // Obtener campañas
  const { data: campaignData = [] } = useQuery({
    queryKey: ['/api/advertising-management/campaigns'],
    queryFn: () => apiRequest('/api/advertising-management/campaigns')
  });

  // Validación defensiva para asegurar que las variables sean siempre arrays
  const campaigns = Array.isArray(campaignData) ? campaignData : [];
  const advertisements = Array.isArray(advertisementData) ? advertisementData : [];
  
  // Detectar cambios en updated_at para forzar re-render
  useEffect(() => {
    if (advertisements.length > 0) {
      setForceRender(prev => prev + 1);
      // Forzar actualización inmediata de refreshKey también
      setRefreshKey(prev => prev + 1);
    }
  }, [advertisements.map(ad => ad.updated_at).join(',')]);
  
  // Actualizar refreshKey cuando hay cambios en los anuncios
  useEffect(() => {
    if (advertisements.length > 0) {
      setRefreshKey(prev => prev + 1);
    }
  }, [forceRender]);
  
  // Forzar actualización cuando cambia cualquier anuncio individual
  useEffect(() => {
    if (advertisements.length > 0) {
      const timer = setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        setForceRender(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [advertisements]);
  
  // Actualización agresiva cuando los datos cambian
  useEffect(() => {
    if (advertisements.length > 0) {
      // Múltiples actualizaciones escalonadas
      const timer1 = setTimeout(() => setRefreshKey(prev => prev + 1), 200);
      const timer2 = setTimeout(() => setForceRender(prev => prev + 1), 400);
      const timer3 = setTimeout(() => setRefreshKey(prev => prev + 1), 600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [advertisementData]);
  
  // Debug logging para verificar los datos recibidos
  // console.log('📊 RefreshKey actual:', refreshKey);
  // console.log('📊 Datos de anuncios recibidos:', advertisements.length, 'anuncios');
  // if (advertisements.length > 0) {
  //   console.log('📊 Primer anuncio (ID 13) updated_at:', advertisements.find(ad => ad.id === 13)?.updated_at);
  // }

  // Mutación para crear anuncio
  const createAdMutation = useMutation({
    mutationFn: (data: AdFormData) => apiRequest('/api/advertising/advertisements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
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
    onSuccess: async () => {
      // Invalidación completa del cache
      await queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
      await queryClient.refetchQueries({ queryKey: ['/api/advertising-management/advertisements'] });
      
      // Cerrar modal y resetear estado
      setIsEditModalOpen(false);
      setSelectedAd(null);
      resetForm();
      
      // Forzar re-render con refreshKey y forceRender
      setRefreshKey(prev => prev + 1);
      setForceRender(prev => prev + 1);
      
      // Invalidación adicional después de un delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
        setRefreshKey(prev => prev + 1);
        setForceRender(prev => prev + 1);
      }, 500);
      
      // Invalidación extra agresiva
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/advertising-management/advertisements'] });
        setRefreshKey(prev => prev + 1);
        setForceRender(prev => prev + 1);
      }, 1000);
      
      // Invalidación brutal del DOM para imágenes
      setTimeout(() => {
        // Forzar recarga de todas las imágenes en el DOM
        const images = document.querySelectorAll('img[src*="unsplash"]');
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          const currentSrc = imgElement.src;
          imgElement.src = '';
          setTimeout(() => {
            imgElement.src = currentSrc;
          }, 10);
        });
        setRefreshKey(prev => prev + 1);
        setForceRender(prev => prev + 1);
      }, 1500);
      
      // Invalidación específica para el anuncio actualizado
      setTimeout(() => {
        // Buscar el anuncio actualizado más reciente
        const updatedAds = queryClient.getQueryData<any>(['/api/advertising-management/advertisements']);
        if (updatedAds?.data) {
          updatedAds.data.forEach((ad: any) => {
            forceImageReload(ad.id);
          });
        }
      }, 2000);
      
      // Invalidación extrema: recrear todos los contenedores de imágenes
      setTimeout(() => {
        const containers = document.querySelectorAll('.aspect-video');
        containers.forEach(container => {
          const img = container.querySelector('img');
          if (img) {
            const parent = container.parentNode;
            const clone = container.cloneNode(true);
            parent?.replaceChild(clone, container);
          }
        });
        console.log('🔄 Contenedores de imágenes recreados completamente');
      }, 3000);
      
      // Test final: invalidar todos los estados y forzar rerender completo
      setTimeout(() => {
        setRefreshKey(Date.now());
        setForceRender(Date.now());
        console.log('🚀 RERENDER COMPLETO EJECUTADO - Todos los estados invalidados');
      }, 4000);
      
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
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/advertisements'] });
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
      is_active: true,
      media_type: 'image',
      video_url: '',
      duration: 0,
      storage_type: 'url',
      media_file_id: undefined
    });
    setUploadedFile(null);
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/advertising-management/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir archivo');
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadedFile(result.data);
        setFormData(prev => ({
          ...prev,
          media_file_id: result.data.id,
          // Limpiar URLs externas cuando se sube archivo
          image_url: '',
          video_url: ''
        }));
        
        toast({
          title: "Archivo subido exitosamente",
          description: `${result.data.original_name} se ha subido correctamente`,
        });
      } else {
        throw new Error(result.message || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error al subir archivo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdMutation.mutate(formData);
  };

  // Función para manejar el cambio del tipo de almacenamiento
  const handleStorageTypeChange = (storageType: 'url' | 'file') => {
    setFormData(prev => ({
      ...prev,
      storage_type: storageType,
      // Limpiar campos según el tipo de almacenamiento
      ...(storageType === 'url' ? {
        media_file_id: undefined
      } : {
        image_url: '',
        video_url: ''
      })
    }));
    
    // Limpiar archivo subido si se cambia a URL
    if (storageType === 'url') {
      setUploadedFile(null);
    }
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
      is_active: ad.is_active !== undefined ? ad.is_active : true,
      media_type: (ad as any).media_type || 'image',
      video_url: (ad as any).video_url || '',
      duration: (ad as any).duration || 0,
      storage_type: (ad as any).storage_type || 'url',
      media_file_id: (ad as any).media_file_id || undefined
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

  // Función para generar URL con cache-busting ultra-agresivo
  const getImageUrlWithCacheBust = (imageUrl: string, updatedAt?: string) => {
    if (!imageUrl) return '';
    
    // Para todas las URLs, agregar timestamp basado en updated_at + refreshKey + forceRender + timestamp actual + random
    const timestamp = updatedAt ? new Date(updatedAt).getTime() : Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    const randomId = Math.random().toString(36).substr(2, 9);
    const finalUrl = `${imageUrl}${separator}v=${timestamp}&r=${refreshKey}&f=${forceRender}&t=${Date.now()}&rnd=${randomId}`;
    
    // Debug logging activo para verificar URLs
    console.log('🖼️ Cache-busting URL:', {
      original: imageUrl,
      updatedAt,
      timestamp,
      refreshKey,
      forceRender,
      now: Date.now(),
      random: randomId,
      final: finalUrl
    });
    
    return finalUrl;
  };
  
  // Función para recrear imagen con DOM limpio y cache-breaking agresivo
  const createImageElement = (src: string, alt: string, className: string, adId: number, updatedAt: string) => {
    const imageKey = `${adId}-${updatedAt}-${refreshKey}-${forceRender}-${Date.now()}`;
    
    // Generar una URL única que evite completamente el cache
    const cacheBustingSrc = `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now()}&uid=${Math.random().toString(36).substr(2, 9)}`;
    
    return React.createElement('img', {
      key: imageKey,
      src: cacheBustingSrc,
      alt: alt,
      className: className,
      style: { 
        display: 'block',
        // Forzar re-render del navegador
        imageRendering: 'auto',
        backgroundColor: 'transparent'
      },
      onLoad: () => {
        // Logging para verificar que la imagen se cargó
        console.log(`✅ Imagen cargada para anuncio ${adId}:`, cacheBustingSrc);
      },
      onError: (e) => {
        console.log(`❌ Error cargando imagen para anuncio ${adId}:`, cacheBustingSrc);
        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48cGF0aCBkPSJNNTAgNTBoMTAwdjEwSDE1MHYxMEg1MFY1MHoiIGZpbGw9IiNkMWQ1ZGIiLz48L3N2Zz4=';
      }
    });
  };

  // Función para invalidar cache de una imagen específica
  const forceImageReload = (adId: number) => {
    const imageElements = document.querySelectorAll(`img[src*="${adId}"]`);
    imageElements.forEach(img => {
      const imgElement = img as HTMLImageElement;
      const currentSrc = imgElement.src;
      
      // Técnica de cache-breaking: cambiar src a vacío y luego restaurar con nuevo timestamp
      imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      setTimeout(() => {
        const newSrc = currentSrc.split('?')[0] + `?cb=${Date.now()}&uid=${Math.random().toString(36).substr(2, 9)}`;
        imgElement.src = newSrc;
        console.log(`🔄 Imagen ${adId} forzada a recargar:`, newSrc);
      }, 50);
    });
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
                
                {/* Sección de Contenido Multimedia */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-[#00a587]" />
                    Contenido Multimedia
                  </h3>
                  
                  <div>
                    <Label htmlFor="media_type">Tipo de Contenido *</Label>
                    <Select value={formData.media_type} onValueChange={(value: 'image' | 'video' | 'gif') => setFormData({...formData, media_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Imagen</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="gif">GIF Animado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="storage_type">Método de Almacenamiento *</Label>
                    <Select value={formData.storage_type || 'url'} onValueChange={handleStorageTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL Externa</SelectItem>
                        <SelectItem value="file">Subir Archivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">
                      • URL Externa: Usar enlaces de servicios externos
                      • Subir Archivo: Almacenar en tu propia base de datos
                    </p>
                  </div>
                  
                  {formData.media_type === 'image' && (
                    <div>
                      {formData.storage_type === 'url' ? (
                        <div>
                          <Label htmlFor="image_url">URL de la Imagen *</Label>
                          <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            required
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                          <p className="text-sm text-gray-600 mt-1">Introduce la URL de tu imagen externa</p>
                        </div>
                      ) : (
                        <div>
                          <Label>Subir Imagen *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              id="image_upload"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <label htmlFor="image_upload" className="cursor-pointer">
                              <div className="flex flex-col items-center space-y-2">
                                {isUploading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                    <span className="text-sm text-[#00a587]">Subiendo...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                      Clic para seleccionar imagen
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Máximo 50MB - JPG, PNG, GIF, WEBP
                                    </p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                ✅ Imagen subida: {uploadedFile.original_name}
                              </p>
                              <p className="text-xs text-green-600">
                                {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {formData.media_type === 'video' && (
                    <div className="space-y-3">
                      {formData.storage_type === 'url' ? (
                        <div>
                          <Label htmlFor="video_url">URL del Video *</Label>
                          <Input
                            id="video_url"
                            value={formData.video_url}
                            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                            required
                            placeholder="https://ejemplo.com/video.mp4"
                          />
                          <p className="text-sm text-gray-600 mt-1">Introduce la URL de tu video externo</p>
                        </div>
                      ) : (
                        <div>
                          <Label>Subir Video *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              id="video_upload"
                              accept="video/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <label htmlFor="video_upload" className="cursor-pointer">
                              <div className="flex flex-col items-center space-y-2">
                                {isUploading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                    <span className="text-sm text-[#00a587]">Subiendo...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                      Clic para seleccionar video
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Máximo 50MB - MP4, WEBM
                                    </p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                ✅ Video subido: {uploadedFile.original_name}
                              </p>
                              <p className="text-xs text-green-600">
                                {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="duration">Duración (segundos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                          placeholder="30"
                        />
                      </div>
                      
                      {formData.storage_type === 'url' && (
                        <div>
                          <Label htmlFor="image_url">Imagen de Vista Previa</Label>
                          <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            placeholder="https://ejemplo.com/thumbnail.jpg"
                          />
                          <p className="text-sm text-gray-600 mt-1">Imagen que se mostrará antes de reproducir el video</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {formData.media_type === 'gif' && (
                    <div>
                      {formData.storage_type === 'url' ? (
                        <div>
                          <Label htmlFor="image_url">URL del GIF *</Label>
                          <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            required
                            placeholder="https://ejemplo.com/animacion.gif"
                          />
                          <p className="text-sm text-gray-600 mt-1">Los GIFs se reproducen automáticamente</p>
                        </div>
                      ) : (
                        <div>
                          <Label>Subir GIF *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              id="gif_upload"
                              accept="image/gif"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <label htmlFor="gif_upload" className="cursor-pointer">
                              <div className="flex flex-col items-center space-y-2">
                                {isUploading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                    <span className="text-sm text-[#00a587]">Subiendo...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                      Clic para seleccionar GIF
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Máximo 50MB - Solo archivos GIF
                                    </p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                ✅ GIF subido: {uploadedFile.original_name}
                              </p>
                              <p className="text-xs text-green-600">
                                {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                
                {/* Sección de Programación Temporal */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Programación Temporal
                  </h3>
                  
                  <p className="text-sm text-gray-600">
                    Los anuncios se programan automáticamente cuando se asignan a espacios publicitarios en la sección "Asignaciones".
                    Aquí puedes definir preferencias generales de programación.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferred_duration">Duración Preferida (días)</Label>
                      <Input
                        id="preferred_duration"
                        type="number"
                        placeholder="30"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Se configurará en Asignaciones</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Se configurará en Asignaciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="low">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-blue-900">💡 Consejo:</p>
                    <p className="text-sm text-blue-700">
                      Una vez creado el anuncio, ve a la sección "Asignaciones" para programar cuándo y dónde se mostrará.
                    </p>
                  </div>
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
                    {createImageElement(
                      getImageUrlWithCacheBust(ad.image_url, ad.updated_at),
                      ad.alt_text || ad.title,
                      "w-full h-full object-cover",
                      ad.id,
                      ad.updated_at
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      
                      {/* Badge de tipo de contenido multimedia */}
                      <Badge variant="outline" className="flex items-center gap-1">
                        {(ad as any).media_type === 'video' ? (
                          <>
                            <Video className="h-3 w-3" />
                            Video
                          </>
                        ) : (ad as any).media_type === 'gif' ? (
                          <>
                            <PlayCircle className="h-3 w-3" />
                            GIF
                          </>
                        ) : (
                          <>
                            <FileImage className="h-3 w-3" />
                            Imagen
                          </>
                        )}
                      </Badge>
                      
                      {/* Badge de duración para videos */}
                      {(ad as any).media_type === 'video' && (ad as any).duration > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {(ad as any).duration}s
                        </Badge>
                      )}
                    </div>
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
                  {createImageElement(
                    getImageUrlWithCacheBust(selectedAd.image_url, selectedAd.updated_at),
                    selectedAd.alt_text || selectedAd.title,
                    "w-full h-full object-cover",
                    selectedAd.id,
                    selectedAd.updated_at
                  )}
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
                  <h3 className="font-semibold text-gray-900 mb-2">Contenido Multimedia</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo de contenido:</strong> 
                      <Badge variant="outline" className="ml-2">
                        {(selectedAd as any).media_type === 'video' ? 'Video' : 
                         (selectedAd as any).media_type === 'gif' ? 'GIF Animado' : 'Imagen'}
                      </Badge>
                    </p>
                    
                    {(selectedAd as any).media_type === 'video' && (
                      <>
                        <p><strong>URL del video:</strong> 
                          <a href={(selectedAd as any).video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {(selectedAd as any).video_url}
                          </a>
                        </p>
                        <p><strong>Duración:</strong> {(selectedAd as any).duration || 0} segundos</p>
                      </>
                    )}
                    
                    <p><strong>URL de imagen:</strong> 
                      <a href={selectedAd.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {selectedAd.image_url}
                      </a>
                    </p>
                    <p><strong>Texto alternativo:</strong> {selectedAd.alt_text}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enlaces</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>URL de destino:</strong> 
                      <a href={selectedAd.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {selectedAd.link_url}
                      </a>
                    </p>
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
              
              {/* Sección de Contenido Multimedia - Edición */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#00a587]" />
                  Contenido Multimedia
                </h3>
                
                <div>
                  <Label htmlFor="edit_media_type">Tipo de Contenido *</Label>
                  <Select value={formData.media_type} onValueChange={(value: 'image' | 'video' | 'gif') => setFormData({...formData, media_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagen</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="gif">GIF Animado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit_storage_type">Método de Almacenamiento *</Label>
                  <Select value={formData.storage_type || 'url'} onValueChange={handleStorageTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL Externa</SelectItem>
                      <SelectItem value="file">Subir Archivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.media_type === 'image' && (
                  <div>
                    {formData.storage_type === 'url' ? (
                      <div>
                        <Label htmlFor="edit_image_url">URL de la Imagen *</Label>
                        <Input
                          id="edit_image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          required
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label>Subir Imagen *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="edit_image_upload"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label htmlFor="edit_image_upload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              {isUploading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                  <span className="text-sm text-[#00a587]">Subiendo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Clic para seleccionar imagen
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Máximo 50MB - JPG, PNG, GIF, WEBP
                                  </p>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                        {uploadedFile && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              ✅ Imagen subida: {uploadedFile.original_name}
                            </p>
                            <p className="text-xs text-green-600">
                              {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {formData.media_type === 'video' && (
                  <div className="space-y-3">
                    {formData.storage_type === 'url' ? (
                      <div>
                        <Label htmlFor="edit_video_url">URL del Video *</Label>
                        <Input
                          id="edit_video_url"
                          value={formData.video_url}
                          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                          required
                          placeholder="https://ejemplo.com/video.mp4"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label>Subir Video *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="edit_video_upload"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label htmlFor="edit_video_upload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              {isUploading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                  <span className="text-sm text-[#00a587]">Subiendo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Clic para seleccionar video
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Máximo 50MB - MP4, WEBM
                                  </p>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                        {uploadedFile && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              ✅ Video subido: {uploadedFile.original_name}
                            </p>
                            <p className="text-xs text-green-600">
                              {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="edit_duration">Duración (segundos)</Label>
                      <Input
                        id="edit_duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                        placeholder="30"
                      />
                    </div>
                    
                    {formData.storage_type === 'url' && (
                      <div>
                        <Label htmlFor="edit_image_url">Imagen de Vista Previa</Label>
                        <Input
                          id="edit_image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://ejemplo.com/thumbnail.jpg"
                        />
                        <p className="text-sm text-gray-600 mt-1">Imagen que se mostrará antes de reproducir el video</p>
                      </div>
                    )}
                  </div>
                )}
                
                {formData.media_type === 'gif' && (
                  <div>
                    {formData.storage_type === 'url' ? (
                      <div>
                        <Label htmlFor="edit_image_url">URL del GIF *</Label>
                        <Input
                          id="edit_image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          required
                          placeholder="https://ejemplo.com/animacion.gif"
                        />
                        <p className="text-sm text-gray-600 mt-1">Los GIFs se reproducen automáticamente</p>
                      </div>
                    ) : (
                      <div>
                        <Label>Subir GIF *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="edit_gif_upload"
                            accept="image/gif"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label htmlFor="edit_gif_upload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              {isUploading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
                                  <span className="text-sm text-[#00a587]">Subiendo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Clic para seleccionar GIF
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Máximo 50MB - Solo archivos GIF
                                  </p>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                        {uploadedFile && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              ✅ GIF subido: {uploadedFile.original_name}
                            </p>
                            <p className="text-xs text-green-600">
                              {uploadedFile.media_type} - {(uploadedFile.file_size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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