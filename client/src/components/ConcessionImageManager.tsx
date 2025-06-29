import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, Star, Image as ImageIcon } from 'lucide-react';

interface ConcessionImage {
  id: number;
  concession_id: number;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
  created_at: string;
}

interface ConcessionImageManagerProps {
  concessionId: number;
}

const ConcessionImageManager: React.FC<ConcessionImageManagerProps> = ({ concessionId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener imágenes de la concesión
  const { data: images = [], isLoading } = useQuery({
    queryKey: [`/api/active-concessions/${concessionId}/images`],
    queryFn: async () => {
      const response = await fetch(`/api/active-concessions/${concessionId}/images`);
      if (!response.ok) throw new Error('Error al cargar imágenes');
      return response.json();
    }
  });

  // Subir nueva imagen
  const uploadMutation = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption: string }) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);

      const response = await fetch(`/api/active-concessions/${concessionId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/active-concessions/${concessionId}/images`] });
      setSelectedFile(null);
      setCaption('');
      setIsUploading(false);
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Error al subir imagen",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  });

  // Eliminar imagen
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/concession-images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar imagen');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/active-concessions/${concessionId}/images`] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  });

  // Establecer imagen principal
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/concession-images/${imageId}/set-primary`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Error al establecer imagen principal');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/active-concessions/${concessionId}/images`] });
      toast({
        title: "Imagen principal actualizada",
        description: "La imagen principal se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar imagen principal",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, caption });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nueva Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageFile">Seleccionar imagen (máx. 5MB)</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
          
          {selectedFile && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
              
              <div>
                <Label htmlFor="caption">Descripción (opcional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Descripción de la imagen..."
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Imagen
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galería de Imágenes ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No hay imágenes subidas</p>
              <p className="text-sm">Sube la primera imagen para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image: ConcessionImage) => (
                <div
                  key={image.id}
                  className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || 'Imagen de concesión'}
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                  
                  {image.is_primary && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  
                  <div className="p-3">
                    {image.caption && (
                      <p className="text-sm text-gray-600 mb-2">{image.caption}</p>
                    )}
                    
                    <div className="flex gap-2">
                      {!image.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryMutation.mutate(image.id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Hacer principal
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(image.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConcessionImageManager;