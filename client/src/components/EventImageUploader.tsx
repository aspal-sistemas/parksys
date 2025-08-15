import React, { useState } from 'react';
import { Upload, Image, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface EventImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  onRemoveImage?: () => void;
}

export default function EventImageUploader({ 
  onImageUpload, 
  currentImage, 
  onRemoveImage 
}: EventImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen válido',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/events/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer direct-token-${Date.now()}-admin`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const result = await response.json();
      onImageUpload(result.imageUrl);

      toast({
        title: 'Éxito',
        description: 'Imagen subida correctamente'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Error al subir la imagen. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (currentImage) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="relative">
            <img
              src={currentImage}
              alt="Imagen del evento"
              className="w-full h-48 object-cover rounded-md"
            />
            {onRemoveImage && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={onRemoveImage}
                title="Borrar imagen"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-600 flex items-center">
              <Camera className="h-4 w-4 mr-1" />
              Imagen del evento cargada
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => document.getElementById('file-input')?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar imagen
              </Button>
              {onRemoveImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemoveImage}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Borrar
                </Button>
              )}
            </div>
          </div>
          
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Image className="h-full w-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arrastra una imagen aquí, o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imagen
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}