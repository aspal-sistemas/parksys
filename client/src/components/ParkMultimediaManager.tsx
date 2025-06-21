/**
 * GESTOR COMPLETO DE MULTIMEDIA PARA PARQUES
 * ========================================
 * 
 * Componente integral para gestión de imágenes y documentos
 * con soporte para subida de archivos y URLs externas
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Star, 
  StarOff, 
  Download,
  Eye,
  Plus
} from 'lucide-react';

interface ParkImage {
  id: number;
  parkId: number;
  imageUrl: string;
  filePath?: string;
  caption: string;
  isPrimary: boolean;
  createdAt: string;
}

interface ParkDocument {
  id: number;
  parkId: number;
  title: string;
  filePath?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description: string;
  category: string;
  createdAt: string;
}

interface ParkMultimediaManagerProps {
  parkId: number;
}

export function ParkMultimediaManager({ parkId }: ParkMultimediaManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para formularios
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ParkImage | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ParkDocument | null>(null);

  // Estados para nuevos elementos
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isPrimaryImage, setIsPrimaryImage] = useState(false);

  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentDescription, setNewDocumentDescription] = useState('');
  const [newDocumentCategory, setNewDocumentCategory] = useState('general');
  const [newDocumentUrl, setNewDocumentUrl] = useState('');
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);

  // Consultas
  const { data: images = [], isLoading: imagesLoading } = useQuery<ParkImage[]>({
    queryKey: [`/api/parks/${parkId}/images`],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<ParkDocument[]>({
    queryKey: [`/api/parks/${parkId}/documents`],
  });

  // Mutaciones para imágenes
  const uploadImageMutation = useMutation({
    mutationFn: async (data: FormData | { imageUrl: string; caption: string; isPrimary: boolean }) => {
      if (data instanceof FormData) {
        const response = await fetch(`/api/parks/${parkId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer direct-token-1750522117022',
            'X-User-Id': '1',
            'X-User-Role': 'super_admin'
          },
          body: data
        });
        if (!response.ok) throw new Error('Error subiendo imagen');
        return response.json();
      } else {
        const response = await apiRequest(`/api/parks/${parkId}/images`, {
          method: 'POST',
          data
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Imagen subida",
        description: "La imagen se ha agregado exitosamente al parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
      resetImageForm();
      setIsImageDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest(`/api/park-images/${imageId}/set-primary`, {
        method: 'POST',
        data: {}
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagen principal actualizada",
        description: "Se ha establecido la nueva imagen principal del parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo establecer la imagen principal.",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest(`/api/park-images/${imageId}`, {
        method: 'DELETE'
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/images`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}`] });
      setSelectedImage(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive",
      });
    },
  });

  // Mutaciones para documentos
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: FormData | { title: string; description: string; category: string; fileUrl: string }) => {
      if (data instanceof FormData) {
        const response = await fetch(`/api/parks/${parkId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer direct-token-1750522117022',
            'X-User-Id': '1',
            'X-User-Role': 'super_admin'
          },
          body: data
        });
        if (!response.ok) throw new Error('Error subiendo documento');
        return response.json();
      } else {
        const response = await apiRequest(`/api/parks/${parkId}/documents`, {
          method: 'POST',
          data
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha agregado exitosamente al parque.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/documents`] });
      resetDocumentForm();
      setIsDocumentDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest(`/api/park-documents/${documentId}`, {
        method: 'DELETE'
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/documents`] });
      setSelectedDocument(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento.",
        variant: "destructive",
      });
    },
  });

  // Funciones auxiliares
  const resetImageForm = () => {
    setNewImageUrl('');
    setNewImageCaption('');
    setNewImageFile(null);
    setIsPrimaryImage(false);
  };

  const resetDocumentForm = () => {
    setNewDocumentTitle('');
    setNewDocumentDescription('');
    setNewDocumentCategory('general');
    setNewDocumentUrl('');
    setNewDocumentFile(null);
  };

  const handleImageSubmit = async () => {
    if (newImageFile) {
      // Subir archivo
      const formData = new FormData();
      formData.append('image', newImageFile);
      formData.append('caption', newImageCaption);
      formData.append('isPrimary', isPrimaryImage.toString());
      uploadImageMutation.mutate(formData);
    } else if (newImageUrl) {
      // Usar URL externa
      uploadImageMutation.mutate({
        imageUrl: newImageUrl,
        caption: newImageCaption,
        isPrimary: isPrimaryImage
      });
    }
  };

  const handleDocumentSubmit = async () => {
    if (newDocumentFile) {
      // Subir archivo
      const formData = new FormData();
      formData.append('document', newDocumentFile);
      formData.append('title', newDocumentTitle);
      formData.append('description', newDocumentDescription);
      formData.append('category', newDocumentCategory);
      uploadDocumentMutation.mutate(formData);
    } else if (newDocumentUrl) {
      // Usar URL externa
      uploadDocumentMutation.mutate({
        title: newDocumentTitle,
        description: newDocumentDescription,
        category: newDocumentCategory,
        fileUrl: newDocumentUrl
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Imágenes ({images.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos ({documents.length})
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA DE IMÁGENES */}
        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Imagen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Imagen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subir archivo</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewImageFile(file);
                          setNewImageUrl(''); // Limpiar URL si se selecciona archivo
                        }
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">- O -</div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL de imagen</label>
                    <Input
                      value={newImageUrl}
                      onChange={(e) => {
                        setNewImageUrl(e.target.value);
                        if (e.target.value) setNewImageFile(null); // Limpiar archivo si se ingresa URL
                      }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción</label>
                    <Textarea
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      placeholder="Descripción de la imagen..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimaryImage}
                      onChange={(e) => setIsPrimaryImage(e.target.checked)}
                    />
                    <label htmlFor="isPrimary" className="text-sm">Establecer como imagen principal</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleImageSubmit}
                    disabled={(!newImageFile && !newImageUrl) || uploadImageMutation.isPending}
                  >
                    {uploadImageMutation.isPending ? 'Subiendo...' : 'Agregar Imagen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {imagesLoading ? (
            <div className="text-center py-8">Cargando imágenes...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay imágenes para este parque
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.caption}
                      className="w-full h-48 object-cover"
                    />
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{image.caption}</p>
                    <div className="flex gap-2">
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryImageMutation.mutate(image.id)}
                          disabled={setPrimaryImageMutation.isPending}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImageMutation.mutate(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PESTAÑA DE DOCUMENTOS */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documentos del Parque</h3>
            <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título</label>
                    <Input
                      value={newDocumentTitle}
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                      placeholder="Título del documento"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subir archivo</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewDocumentFile(file);
                          setNewDocumentUrl(''); // Limpiar URL si se selecciona archivo
                        }
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">- O -</div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL del documento</label>
                    <Input
                      value={newDocumentUrl}
                      onChange={(e) => {
                        setNewDocumentUrl(e.target.value);
                        if (e.target.value) setNewDocumentFile(null); // Limpiar archivo si se ingresa URL
                      }}
                      placeholder="https://ejemplo.com/documento.pdf"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <select
                      value={newDocumentCategory}
                      onChange={(e) => setNewDocumentCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="general">General</option>
                      <option value="reglamento">Reglamento</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="eventos">Eventos</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción</label>
                    <Textarea
                      value={newDocumentDescription}
                      onChange={(e) => setNewDocumentDescription(e.target.value)}
                      placeholder="Descripción del documento..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleDocumentSubmit}
                    disabled={(!newDocumentFile && !newDocumentUrl) || !newDocumentTitle || uploadDocumentMutation.isPending}
                  >
                    {uploadDocumentMutation.isPending ? 'Subiendo...' : 'Agregar Documento'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {documentsLoading ? (
            <div className="text-center py-8">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay documentos para este parque
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">{document.title}</h4>
                            <p className="text-sm text-gray-600">{document.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{document.category}</Badge>
                              {document.fileSize > 0 && (
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(document.fileSize)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.fileUrl, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDocumentMutation.mutate(document.id)}
                          disabled={deleteDocumentMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}