import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, Image, Video, Carousel, FileText, Zap, Building, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const advertisementSchema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().min(1, 'Descripción es requerida'),
  alt_text: z.string().min(1, 'Texto alternativo es requerido'),
  target_url: z.string().url('URL debe ser válida'),
  ad_type: z.enum(['institutional', 'commercial']),
  media_type: z.enum(['image', 'gif', 'video', 'carousel', 'html']),
  is_active: z.boolean(),
  // Campos específicos para cada tipo de media
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  html_content: z.string().optional(),
  carousel_images: z.array(z.string()).optional(),
  // Campos que se asignan automáticamente desde el backend
  campaign_id: z.number().optional(),
});

type AdvertisementFormData = z.infer<typeof advertisementSchema>;

interface AdvertisementFormProps {
  advertisement?: any;
  onSave: (data: AdvertisementFormData) => void;
  onCancel: () => void;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({ advertisement, onSave, onCancel }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>(advertisement?.carousel_images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdvertisementFormData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: advertisement?.title || '',
      description: advertisement?.description || '',
      alt_text: advertisement?.alt_text || '',
      target_url: advertisement?.target_url || '',
      ad_type: advertisement?.ad_type || 'institutional',
      media_type: advertisement?.media_type || 'image',
      is_active: advertisement?.is_active ?? true,
      image_url: advertisement?.image_url || '',
      video_url: advertisement?.video_url || '',
      html_content: advertisement?.html_content || '',
      carousel_images: advertisement?.carousel_images || [],
      campaign_id: advertisement?.campaign_id || undefined,
    },
  });

  const watchedMediaType = watch('media_type');
  const watchedAdType = watch('ad_type');

  const mediaTypes = [
    { value: 'image', label: 'Imagen Estática', icon: Image, description: 'JPG, PNG, WebP' },
    { value: 'gif', label: 'GIF Animado', icon: Image, description: 'GIF con animación' },
    { value: 'video', label: 'Video', icon: Video, description: 'MP4, WebM autoplay' },
    { value: 'carousel', label: 'Carrusel', icon: Carousel, description: 'Múltiples imágenes rotativas' },
    { value: 'html', label: 'HTML/Banner', icon: FileText, description: 'Código HTML personalizado' },
  ];

  const frequencies = [
    { value: 'always', label: 'Siempre Visible', description: 'Mostrar continuamente' },
    { value: 'daily', label: 'Rotación Diaria', description: 'Cambiar cada día' },
    { value: 'weekly', label: 'Rotación Semanal', description: 'Cambiar cada semana' },
    { value: 'monthly', label: 'Rotación Mensual', description: 'Cambiar cada mes' },
    { value: 'scheduled', label: 'Programado', description: 'Horarios específicos' },
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

  const pageTypes = [
    'homepage', 'parks', 'activities', 'concessions', 'instructors', 'volunteers', 'tree-species'
  ];

  const positions = [
    'header', 'sidebar', 'footer', 'hero', 'profile'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
    
    // Aquí implementarías la subida real del archivo
    // Por ahora simularemos URLs
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      
      if (watchedMediaType === 'image' || watchedMediaType === 'gif') {
        setValue('image_url', url);
      } else if (watchedMediaType === 'video') {
        setValue('video_url', url);
      } else if (watchedMediaType === 'carousel') {
        setCarouselImages([...carouselImages, url]);
        setValue('carousel_images', [...carouselImages, url]);
      }
    }
  };

  const removeCarouselImage = (index: number) => {
    const newImages = carouselImages.filter((_, i) => i !== index);
    setCarouselImages(newImages);
    setValue('carousel_images', newImages);
  };

  const onSubmit = async (data: AdvertisementFormData) => {
    setIsSubmitting(true);
    try {
      const method = advertisement ? 'PUT' : 'POST';
      const url = advertisement 
        ? `/api/advertising-management/advertisements/${advertisement.id}`
        : '/api/advertising-management/advertisements';
      
      await apiRequest(url, method, {
        ...data,
        carousel_images: carouselImages,
      });
      
      toast({ 
        title: `Anuncio ${advertisement ? 'actualizado' : 'creado'} correctamente`,
        description: `El anuncio "${data.title}" ha sido ${advertisement ? 'actualizado' : 'creado'} exitosamente.`
      });
      
      onSave(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Hubo un error al procesar la solicitud',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="media">Contenido Multimedia</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
          <TabsTrigger value="targeting">Segmentación</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {watchedAdType === 'institutional' ? <Building className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                Información del Anuncio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Anuncio *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Ej: Promoción Especial Parques"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="adType">Tipo de Anuncio *</Label>
                  <Select
                    value={watchedAdType}
                    onValueChange={(value) => setValue('adType', value as 'institutional' | 'commercial')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institutional">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Institucional</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>Comercial</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.adType && (
                    <p className="text-sm text-red-600">{errors.adType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe el anuncio y su propósito..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="target_url">URL de Destino *</Label>
                  <Input
                    id="target_url"
                    {...register('target_url')}
                    placeholder="https://ejemplo.com"
                  />
                  {errors.target_url && (
                    <p className="text-sm text-red-600">{errors.target_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alt_text">Texto Alternativo *</Label>
                  <Input
                    id="alt_text"
                    {...register('alt_text')}
                    placeholder="Descripción para accesibilidad"
                  />
                  {errors.alt_text && (
                    <p className="text-sm text-red-600">{errors.alt_text.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="campaign_id">Campaña *</Label>
                  <Select onValueChange={(value) => setValue('campaign_id', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campaña" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Campaña Parques Verdes</SelectItem>
                      <SelectItem value="2">Campaña Eventos Comunitarios</SelectItem>
                      <SelectItem value="3">Campaña Voluntariado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.campaign_id && (
                    <p className="text-sm text-red-600">{errors.campaign_id.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Estado Activo</Label>
                  <p className="text-sm text-gray-600">
                    Anuncios activos pueden ser mostrados
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Multimedia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Contenido *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {mediaTypes.map(type => {
                    const Icon = type.icon;
                    const isSelected = watchedMediaType === type.value;
                    
                    return (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-[#00a587] bg-[#00a587]/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setValue('mediaType', type.value as any)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-[#00a587]' : 'text-gray-600'}`} />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload de archivos */}
              <div className="space-y-4">
                <Label>Subir Contenido</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept={watchedMediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    multiple={watchedMediaType === 'carousel'}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-[#00a587] hover:text-[#067f5f]"
                  >
                    Haz clic para subir archivos
                  </label>
                  <p className="text-sm text-gray-600 mt-2">
                    {watchedMediaType === 'video' ? 'MP4, WebM hasta 50MB' : 'JPG, PNG, GIF hasta 10MB'}
                  </p>
                </div>
              </div>

              {/* Preview para imagen/gif */}
              {(watchedMediaType === 'image' || watchedMediaType === 'gif') && watch('image_url') && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={watch('image_url')}
                      alt="Vista previa"
                      className="max-w-full max-h-64 mx-auto rounded"
                    />
                  </div>
                </div>
              )}

              {/* Preview para video */}
              {watchedMediaType === 'video' && watch('video_url') && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <video
                      src={watch('video_url')}
                      controls
                      className="max-w-full max-h-64 mx-auto rounded"
                    />
                  </div>
                </div>
              )}

              {/* Editor para HTML */}
              {watchedMediaType === 'html' && (
                <div className="space-y-2">
                  <Label htmlFor="htmlContent">Código HTML *</Label>
                  <Textarea
                    id="htmlContent"
                    {...register('htmlContent')}
                    placeholder="<div>Tu código HTML aquí...</div>"
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600">
                    Código HTML que se insertará en el espacio publicitario
                  </p>
                </div>
              )}

              {/* Gestión de carrusel */}
              {watchedMediaType === 'carousel' && (
                <div className="space-y-2">
                  <Label>Imágenes del Carrusel</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {carouselImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeCarouselImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programación y Frecuencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Frecuencia de Mostrado *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {frequencies.map(freq => {
                    const isSelected = watchedFrequency === freq.value;
                    
                    return (
                      <div
                        key={freq.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-[#00a587] bg-[#00a587]/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setValue('frequency', freq.value as any)}
                      >
                        <div className="font-medium">{freq.label}</div>
                        <div className="text-sm text-gray-600">{freq.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Inicio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Fecha de Fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {watchedFrequency === 'scheduled' && (
                <div className="space-y-4">
                  <div>
                    <Label>Días de la Semana</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {daysOfWeek.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day.value}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={day.value} className="text-sm">
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Horarios (24h)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {[...Array(24)].map((_, hour) => (
                        <div key={hour} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`hour-${hour}`}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`hour-${hour}`} className="text-sm">
                            {hour.toString().padStart(2, '0')}:00
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentación y Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Páginas Objetivo</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {pageTypes.map(page => (
                    <div key={page} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`page-${page}`}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`page-${page}`} className="text-sm">
                        {page}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Posiciones Objetivo</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {positions.map(position => (
                    <div key={position} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`position-${position}`}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`position-${position}`} className="text-sm">
                        {position}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]">
          {advertisement ? 'Actualizar' : 'Crear'} Anuncio
        </Button>
      </div>
    </form>
  );
};

export default AdvertisementForm;