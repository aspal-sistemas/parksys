/**
 * VISUALIZADOR DE MULTIMEDIA PARA PARQUES (SOLO LECTURA)
 * =====================================================
 * 
 * Componente para mostrar imágenes y documentos en modo de solo lectura
 * Sin funciones de edición - solo visualización
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  FileText, 
  Star, 
  Download,
  Eye
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

interface ParkMultimediaViewerProps {
  parkId: number;
}

export default function ParkMultimediaViewer({ parkId }: ParkMultimediaViewerProps) {
  // Consultas para obtener datos (solo lectura)
  const { data: images = [], isLoading: imagesLoading } = useQuery<ParkImage[]>({
    queryKey: [`/api/parks/${parkId}/images`],
    queryFn: async () => {
      const response = await fetch(`/api/parks/${parkId}/images`, {
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
      if (!response.ok) throw new Error('Error cargando imágenes');
      return response.json();
    },
    staleTime: 300000 // 5 minutos
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<ParkDocument[]>({
    queryKey: [`/api/parks/${parkId}/documents`],
    queryFn: async () => {
      const response = await fetch(`/api/parks/${parkId}/documents`, {
        headers: {
          'Authorization': 'Bearer direct-token-1750522117022',
          'X-User-Id': '1',
          'X-User-Role': 'super_admin'
        }
      });
      if (!response.ok) throw new Error('Error cargando documentos');
      return response.json();
    },
    staleTime: 300000 // 5 minutos
  });

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

        {/* PESTAÑA DE IMÁGENES - SOLO LECTURA */}
        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
            <Badge variant="secondary" className="text-xs">
              Solo visualización
            </Badge>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver completa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PESTAÑA DE DOCUMENTOS - SOLO LECTURA */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documentos del Parque</h3>
            <Badge variant="secondary" className="text-xs">
              Solo visualización
            </Badge>
          </div>

          {documentsLoading ? (
            <div className="text-center py-8">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay documentos para este parque
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{document.title}</h4>
                          <p className="text-xs text-gray-500 capitalize">{document.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{formatFileSize(document.fileSize)}</Badge>
                    </div>
                    
                    {document.description && (
                      <p className="text-sm text-gray-600 mb-3">{document.description}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
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