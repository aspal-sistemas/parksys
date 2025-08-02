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
  spaceId?: number; // undefined para creación
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

  // Cargar imágenes y documentos existentes
  useEffect(() => {
    if (spaceId && isEditMode) {
      loadImages();
      loadDocuments();
    }
  }, [spaceId, isEditMode]);

  const loadImages = async () => {
    if (!spaceId) return;
    try {
      const response = await apiRequest("GET", `/api/spaces/${spaceId}/images`);
      setImages(await response.json());
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  const loadDocuments = async () => {
    if (!spaceId) return;
    try {
      const response = await apiRequest("GET", `/api/spaces/${spaceId}/documents`);
      setDocuments(await response.json());
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    }
  };

  const getUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/spaces/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleImageUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!spaceId) {
      toast({
        title: "Error",
        description: "Primero guarda el espacio antes de subir imágenes",
        variant: "destructive",
      });
      return;
    }

    const uploadedFile = result.successful[0];
    if (!uploadedFile?.uploadURL) return;

    setLoading(true);
    try {
      const response = await apiRequest("POST", `/api/spaces/${spaceId}/images`, {
        imageUrl: uploadedFile.uploadURL,
        caption: newImageCaption || null,
        isPrimary: newImageIsPrimary,
      });

      const data = await response.json();
      if (data.success) {
        await loadImages();
        setNewImageCaption("");
        setNewImageIsPrimary(false);
        toast({
          title: "Éxito",
          description: "Imagen subida exitosamente",
        });
      }
    } catch (error) {
      console.error("Error al guardar imagen:", error);
      toast({
        title: "Error",
        description: "Error al guardar la imagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!spaceId) {
      toast({
        title: "Error",
        description: "Primero guarda el espacio antes de subir documentos",
        variant: "destructive",
      });
      return;
    }

    const uploadedFile = result.successful[0];
    if (!uploadedFile?.uploadURL) return;

    if (!newDocumentTitle.trim()) {
      toast({
        title: "Error",
        description: "El título del documento es requerido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", `/api/spaces/${spaceId}/documents`, {
        documentUrl: uploadedFile.uploadURL,
        title: newDocumentTitle,
        description: newDocumentDescription || null,
        fileSize: uploadedFile.size || null,
      });

      const data = await response.json();
      if (data.success) {
        await loadDocuments();
        setNewDocumentTitle("");
        setNewDocumentDescription("");
        toast({
          title: "Éxito",
          description: "Documento subido exitosamente",
        });
      }
    } catch (error) {
      console.error("Error al guardar documento:", error);
      toast({
        title: "Error",
        description: "Error al guardar el documento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/spaces/images/${imageId}`);
      const data = await response.json();
      if (data.success) {
        await loadImages();
        toast({
          title: "Éxito",
          description: "Imagen eliminada exitosamente",
        });
      }
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la imagen",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/spaces/documents/${documentId}`);
      const data = await response.json();
      if (data.success) {
        await loadDocuments();
        toast({
          title: "Éxito",
          description: "Documento eliminado exitosamente",
        });
      }
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el documento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Gestión de Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Imágenes del Espacio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode && spaceId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageCaption">Descripción de la imagen (opcional)</Label>
                  <Input
                    id="imageCaption"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="Ej: Vista principal del espacio"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
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
                maxFileSize={10485760} // 10MB
                onGetUploadParameters={getUploadParameters}
                onComplete={handleImageUploadComplete}
                buttonClassName="w-full"
              >
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>Subir Imagen</span>
                </div>
              </ObjectUploader>
            </>
          )}

          {/* Lista de imágenes existentes */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative border rounded-lg p-3">
                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.caption || "Imagen del espacio"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {image.isPrimary && (
                    <Badge variant="secondary" className="absolute top-1 right-1">
                      <Star className="w-3 h-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  {image.caption && (
                    <p className="text-sm text-gray-600 mb-2">{image.caption}</p>
                  )}
                  {isEditMode && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteImage(image.id)}
                      className="w-full"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestión de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos del Espacio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode && spaceId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentTitle">Título del documento *</Label>
                  <Input
                    id="documentTitle"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    placeholder="Ej: Reglamento de uso"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="documentDescription">Descripción (opcional)</Label>
                  <Textarea
                    id="documentDescription"
                    value={newDocumentDescription}
                    onChange={(e) => setNewDocumentDescription(e.target.value)}
                    placeholder="Descripción del documento"
                    rows={3}
                  />
                </div>
              </div>

              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760} // 10MB
                onGetUploadParameters={getUploadParameters}
                onComplete={handleDocumentUploadComplete}
                buttonClassName="w-full"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Subir Documento (PDF)</span>
                </div>
              </ObjectUploader>
            </>
          )}

          {/* Lista de documentos existentes */}
          {documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{document.title}</h4>
                    {document.description && (
                      <p className="text-sm text-gray-600">{document.description}</p>
                    )}
                    {document.fileSize && (
                      <p className="text-xs text-gray-500">
                        Tamaño: {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.documentUrl, "_blank")}
                    >
                      Ver
                    </Button>
                    {isEditMode && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isEditMode && (
        <p className="text-sm text-gray-500 text-center">
          Las imágenes y documentos se pueden agregar después de crear el espacio
        </p>
      )}
    </div>
  );
}