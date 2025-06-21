import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParkImage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Image as ImageIcon, 
  Upload, 
  Star, 
  Trash2, 
  X, 
  Check,
  AlertCircle
} from "lucide-react";

interface ParkImageManagerProps {
  parkId: number;
}

export function ParkImageManager({ parkId }: ParkImageManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ParkImage | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");

  // Fetch park images
  const { data: images = [], isLoading, error } = useQuery<ParkImage[]>({
    queryKey: [`/api/parks/${parkId}/images`],
  });

  // Upload new image mutation
  const uploadMutation = useMutation({
    mutationFn: async (imageData: { imageUrl: string; caption?: string; isPrimary: boolean }) => {
      const response = await apiRequest(`/api/parks/${parkId}/images`, {
        method: "POST",
        data: imageData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagen subida",
        description: "La imagen se ha agregado correctamente al parque.",
      });
      setIsUploadDialogOpen(false);
      setNewImageUrl("");
      setNewImageCaption("");
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Set primary image mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest(`/api/park-images/${imageId}/set-primary`, {
        method: "POST",
        data: {}
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagen principal actualizada",
        description: "Se ha establecido la imagen principal del parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
    },
    onError: (error) => {
      console.error("Error setting primary image:", error);
      toast({
        title: "Error",
        description: "No se pudo establecer la imagen principal. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest(`/api/park-images/${imageId}`, {
        method: "DELETE"
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente del parque.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Handler for upload form submission
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    // Check if this is the first image, set isPrimary to true if so
    const isPrimary = images.length === 0;

    uploadMutation.mutate({
      imageUrl: newImageUrl.trim(),
      caption: newImageCaption.trim() || undefined,
      isPrimary,
    });
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (image: ParkImage) => {
    setSelectedImage(image);
    setIsDeleteDialogOpen(true);
  };

  // Handler for setting an image as primary
  const handleSetPrimary = (image: ParkImage) => {
    if (!image.isPrimary) {
      setPrimaryMutation.mutate(image.id);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500">Cargando imágenes...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-gray-700">No se pudieron cargar las imágenes del parque.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] })}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Imágenes del parque</h3>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Agregar imagen
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No hay imágenes disponibles para este parque.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Agregar primera imagen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className={image.isPrimary ? 'border-primary' : ''}>
              <CardHeader className="p-0 aspect-video relative overflow-hidden">
                <img 
                  src={image.imageUrl} 
                  alt={image.caption || 'Imagen del parque'}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Principal
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm truncate">
                  {image.caption || 'Sin descripción'}
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between gap-2">
                {!image.isPrimary && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSetPrimary(image)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Principal
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex-1 ${image.isPrimary ? 'text-red-500 hover:text-red-600' : ''}`}
                  onClick={() => openDeleteDialog(image)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar nueva imagen</DialogTitle>
            <DialogDescription>
              Proporcione una URL de imagen y una descripción opcional para agregarla al parque.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image-url">URL de la imagen *</Label>
                <Input
                  id="image-url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Debe ser una URL directa a una imagen (jpg, png, etc.)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-caption">Descripción (opcional)</Label>
                <Input
                  id="image-caption"
                  placeholder="Vista panorámica del parque"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending || !newImageUrl.trim()}
              >
                {uploadMutation.isPending ? "Subiendo..." : "Subir imagen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta imagen? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedImage && (
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {selectedImage.caption || 'Sin descripción'}
                  </p>
                  {selectedImage.isPrimary && (
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Esta es la imagen principal del parque
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedImage && deleteMutation.mutate(selectedImage.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>Eliminando...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}