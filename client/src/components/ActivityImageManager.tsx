import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  StarOff, 
  Camera,
  AlertCircle,
  Check 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActivityImage } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface ActivityImageManagerProps {
  activityId: number;
  onImageUploaded?: (image: ActivityImage) => void;
  className?: string;
}

const ActivityImageManager: React.FC<ActivityImageManagerProps> = ({ 
  activityId, 
  onImageUploaded,
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener las imágenes de la actividad
  const { data: images = [], isLoading, refetch } = useQuery<ActivityImage[]>({
    queryKey: [`/api/activities/${activityId}/images`],
    enabled: !!activityId
  });

  // Mutación para subir imagen
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; caption: string; isPrimary: boolean }) => {
      const formData = new FormData();
      formData.append('image', data.file);
      formData.append('caption', data.caption);
      formData.append('isPrimary', data.isPrimary.toString());

      const response = await fetch(`/api/activities/${activityId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir imagen');
      }

      return response.json();
    },
    onSuccess: (newImage) => {
      toast({
        title: "Imagen subida exitosamente",
        description: "La imagen se ha agregado a la actividad.",
      });
      
      // Limpiar formulario
      setSelectedFile(null);
      setCaption('');
      setIsPrimary(false);
      setPreviewUrl(null);
      setUploadDialogOpen(false);
      
      // Refrescar query
      refetch();
      
      // Callback opcional
      if (onImageUploaded) {
        onImageUploaded(newImage);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar imagen
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/activities/${activityId}/images/${imageId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado exitosamente.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar imagen (caption, isPrimary)
  const updateMutation = useMutation({
    mutationFn: async ({ imageId, data }: { imageId: number; data: { caption?: string; isPrimary?: boolean } }) => {
      return apiRequest(`/activities/${activityId}/images/${imageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Imagen actualizada",
        description: "Los cambios se han guardado exitosamente.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: "Solo se permiten archivos de imagen.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleUpload = () => {
    if (!selectedFile) return;
    
    uploadMutation.mutate({
      file: selectedFile,
      caption,
      isPrimary
    });
  };

  const handleSetPrimary = (imageId: number) => {
    updateMutation.mutate({
      imageId,
      data: { isPrimary: true }
    });
  };

  const handleDelete = (imageId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      deleteMutation.mutate(imageId);
    }
  };

  const primaryImage = images.find(img => img.isPrimary);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Imágenes de la Actividad</h3>
            <p className="text-sm text-gray-500">
              {images.length} imagen{images.length !== 1 ? 'es' : ''} subida{images.length !== 1 ? 's' : ''}
              {primaryImage && <span className="ml-2 text-blue-600">• 1 principal</span>}
            </p>
          </div>
        </div>

        {/* Botón para subir nueva imagen */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Camera className="h-4 w-4 mr-2" />
              Subir Imagen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Nueva Imagen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Selector de archivo */}
              <div>
                <Label htmlFor="image-file">Archivo de imagen</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Vista previa</Label>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <Label htmlFor="caption">Descripción (opcional)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Descripción de la imagen..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* Imagen principal */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is-primary" className="text-sm">
                  Establecer como imagen principal
                </Label>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? 'Subiendo...' : 'Subir Imagen'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de imágenes */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={image.caption || 'Imagen de actividad'}
                  className="w-full h-full object-cover"
                />
                
                {/* Badge de imagen principal */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Principal
                  </div>
                )}

                {/* Botones de acción */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(image.id)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      title="Establecer como principal"
                    >
                      <StarOff className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    className="h-8 w-8 p-0"
                    disabled={deleteMutation.isPending}
                    title="Eliminar imagen"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                {image.caption && (
                  <p className="text-sm text-gray-600 mb-2">{image.caption}</p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  <span>{(image.fileSize / 1024).toFixed(1)} KB</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay imágenes</h3>
            <p className="text-gray-500 text-center mb-6">
              Agrega imágenes para hacer más atractiva tu actividad
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Primera Imagen
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ActivityImageManager;