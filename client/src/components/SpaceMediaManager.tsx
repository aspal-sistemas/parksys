import { useState, useEffect } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Image, FileText, Star } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface SpaceImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  createdAt: string;
}

interface SpaceDocument {
  id: number;
  documentUrl: string;
  title: string;
  description?: string;
  fileSize?: number;
  createdAt: string;
}

interface SpaceMediaManagerProps {
  spaceId?: number;
  isEditMode?: boolean;
}

export function SpaceMediaManager({ spaceId, isEditMode = false }: SpaceMediaManagerProps) {
  const [images, setImages] = useState<SpaceImage[]>([]);
  const [documents, setDocuments] = useState<SpaceDocument[]>([]);
  const [newImageCaption, setNewImageCaption] = useState("");
  const [newImageIsPrimary, setNewImageIsPrimary] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentDescription, setNewDocumentDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Función para procesar URLs de imágenes
  const processImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Si es una URL de Object Storage que empieza con /objects/uploads/
    if (url.startsWith('/objects/uploads/')) {
      // Convertir a ruta servible
      const objectId = url.replace('/objects/uploads/', '');
      return `/uploads/object-storage/${objectId}`;
    }
    
    // Si ya es una ruta válida, devolverla tal como está
    return url;
  };

  useEffect(() => {
    if (spaceId && isEditMode) {
      loadImages();
      loadDocuments();
    }
  }, [spaceId, isEditMode]);

  const loadImages = async () => {
    if (!spaceId) return;
    try {
      const response = await fetch(`/api/spaces/${spaceId}/images`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  const loadDocuments = async () => {
    if (!spaceId) return;
    try {
      const response = await fetch(`/api/spaces/${spaceId}/documents`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch("/api/spaces/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  };

  const handleImageUploadComplete = async (result: any) => {
    if (!spaceId || !result.successful?.[0]?.uploadURL) {
      toast({
        title: "Error",
        description: "Error en la subida del archivo",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const uploadedUrl = result.successful[0].uploadURL;
      
      const response = await fetch(`/api/spaces/${spaceId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          caption: newImageCaption,
          isPrimary: newImageIsPrimary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorData}`);
      }

      await loadImages();
      setNewImageCaption("");
      setNewImageIsPrimary(false);
      toast({
        title: "Imagen agregada",
        description: "La imagen se ha agregado exitosamente al espacio.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: `Error al agregar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploadComplete = async (result: any) => {
    if (!spaceId || !result.successful?.[0]?.uploadURL) return;
    
    setLoading(true);
    try {
      const uploadedUrl = result.successful[0].uploadURL;
      
      const response = await fetch(`/api/spaces/${spaceId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentUrl: uploadedUrl,
          title: newDocumentTitle,
          description: newDocumentDescription,
          fileSize: result.successful[0].size,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      await loadDocuments();
      setNewDocumentTitle("");
      setNewDocumentDescription("");
      toast({
        title: "Documento agregado",
        description: "El documento se ha agregado exitosamente al espacio.",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Error al agregar el documento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/spaces/images/${imageId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      await loadImages();
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la imagen.",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentId: number) => {
    try {
      const response = await fetch(`/api/spaces/documents/${documentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      await loadDocuments();
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el documento.",
        variant: "destructive",
      });
    }
  };

  if (!spaceId && isEditMode) {
    return (
      <div className="text-center p-8 text-gray-500">
        Primero crea el espacio para poder agregar multimedia
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sección de imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Imágenes del Espacio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de imágenes existentes */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={processImageUrl(image.imageUrl)}
                    alt={image.caption || "Imagen del espacio"}
                    className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                  />
                  {image.isPrimary && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {image.caption && (
                    <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Formulario para nueva imagen */}
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageCaption">Descripción de la imagen</Label>
                <Input
                  id="imageCaption"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Ej: Vista principal del espacio"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={newImageIsPrimary}
                  onCheckedChange={(checked) => setNewImageIsPrimary(checked as boolean)}
                />
                <Label htmlFor="isPrimary">Imagen principal</Label>
              </div>
            </div>
            
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10 * 1024 * 1024}
              onGetUploadParameters={getUploadParameters}
              onComplete={handleImageUploadComplete}
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Subir Imagen
              </div>
            </ObjectUploader>
          </div>
        </CardContent>
      </Card>

      {/* Sección de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos del Espacio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de documentos existentes */}
          {documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{document.title}</h4>
                    {document.description && (
                      <p className="text-sm text-gray-600">{document.description}</p>
                    )}
                    {document.fileSize && (
                      <p className="text-xs text-gray-400">
                        {Math.round(document.fileSize / 1024)} KB
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteDocument(document.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para nuevo documento */}
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentTitle">Título del documento *</Label>
                <Input
                  id="documentTitle"
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  placeholder="Ej: Reglamento del espacio"
                  required
                />
              </div>
              <div>
                <Label htmlFor="documentDescription">Descripción</Label>
                <Textarea
                  id="documentDescription"
                  value={newDocumentDescription}
                  onChange={(e) => setNewDocumentDescription(e.target.value)}
                  placeholder="Descripción opcional del documento"
                  rows={1}
                />
              </div>
            </div>
            
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={20 * 1024 * 1024}
              onGetUploadParameters={getUploadParameters}
              onComplete={handleDocumentUploadComplete}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Subir Documento PDF
              </div>
            </ObjectUploader>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}