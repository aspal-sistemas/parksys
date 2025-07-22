import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Upload, 
  ImageIcon, 
  Star, 
  StarOff, 
  Edit, 
  Trash2, 
  X,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AssetImage {
  id: number;
  assetId: number;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption: string | null;
  isPrimary: boolean;
  uploadedById: number;
  createdAt: string;
  updatedAt: string;
}

interface AssetImageManagerProps {
  assetId: number;
  assetName: string;
}

const AssetImageManager: React.FC<AssetImageManagerProps> = ({ assetId, assetName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isPrimaryUpload, setIsPrimaryUpload] = useState(false);
  const [editingImage, setEditingImage] = useState<AssetImage | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editIsPrimary, setEditIsPrimary] = useState(false);

  // Consultar imágenes del activo
  const { data: images, isLoading, isError } = useQuery<AssetImage[]>({
    queryKey: [`/api/assets/${assetId}/images`],
  });

  // Mutación para subir imagen
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/assets/${assetId}/images`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir imagen');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}`] });
      setUploadCaption('');
      setIsPrimaryUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutación para actualizar imagen
  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, data }: { imageId: number; data: { caption: string; isPrimary: boolean } }) => {
      return apiRequest(`/api/asset-images/${imageId}`, {
        method: 'PUT',
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}`] });
      setEditingImage(null);
      toast({
        title: "Imagen actualizada",
        description: "Los datos de la imagen se han actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar imagen
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/asset-images/${imageId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}`] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutación para establecer imagen principal
  const setPrimaryImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/asset-images/${imageId}/set-primary`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}`] });
      toast({
        title: "Imagen principal establecida",
        description: "La imagen se ha marcado como principal.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al establecer imagen principal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen no puede superar los 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Subir archivo
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', uploadCaption);
    formData.append('isPrimary', isPrimaryUpload.toString());

    uploadImageMutation.mutate(formData);
  };

  // Manejar edición de imagen
  const handleEditImage = (image: AssetImage) => {
    setEditingImage(image);
    setEditCaption(image.caption || '');
    setEditIsPrimary(image.isPrimary);
  };

  // Guardar cambios de edición
  const handleSaveEdit = () => {
    if (!editingImage) return;

    updateImageMutation.mutate({
      imageId: editingImage.id,
      data: {
        caption: editCaption,
        isPrimary: editIsPrimary
      }
    });
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error al cargar las imágenes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Gestión de Imágenes - {assetName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sección de subida de imagen */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Subir Nueva Imagen</h3>
              <p className="text-sm text-gray-500">
                Selecciona una imagen para el activo (máximo 5MB)
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="caption">Descripción (opcional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Descripción de la imagen..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimaryUpload}
                  onChange={(e) => setIsPrimaryUpload(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPrimary" className="text-sm">
                  Marcar como imagen principal
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Lista de imágenes */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            Imágenes del Activo ({images?.length || 0})
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="relative">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.caption || image.fileName}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1">
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => setPrimaryImageMutation.mutate(image.id)}
                          title="Marcar como principal"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Dialog open={editingImage?.id === image.id} onOpenChange={(open) => {
                        if (!open) setEditingImage(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditImage(image)}
                            title="Editar imagen"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Imagen</DialogTitle>
                            <DialogDescription>
                              Modifica la información de la imagen
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-caption">Descripción</Label>
                              <Textarea
                                id="edit-caption"
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                placeholder="Descripción de la imagen..."
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="edit-isPrimary"
                                checked={editIsPrimary}
                                onChange={(e) => setEditIsPrimary(e.target.checked)}
                                className="rounded"
                              />
                              <Label htmlFor="edit-isPrimary">
                                Marcar como imagen principal
                              </Label>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingImage(null)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleSaveEdit}
                              disabled={updateImageMutation.isPending}
                            >
                              {updateImageMutation.isPending ? 'Guardando...' : 'Guardar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La imagen se eliminará permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {image.caption && (
                        <p className="text-sm text-gray-600">{image.caption}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatFileSize(image.fileSize)}</span>
                        <span>{formatDate(image.createdAt)}</span>
                      </div>
                      
                      <p className="text-xs text-gray-400 truncate">
                        {image.fileName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay imágenes para este activo</p>
              <p className="text-sm">Sube la primera imagen usando el formulario de arriba</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetImageManager;