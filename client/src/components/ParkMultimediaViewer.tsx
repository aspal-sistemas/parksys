/**
 * VISUALIZADOR DE MULTIMEDIA PARA PARQUES (SOLO LECTURA)
 * =====================================================
 * 
 * Componente para mostrar imágenes del parque en modo de solo lectura
 * Sin funciones de edición - solo visualización
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
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

interface ParkMultimediaViewerProps {
  parkId: number;
}

export default function ParkMultimediaViewer({ parkId }: ParkMultimediaViewerProps) {
  // Consulta para obtener imágenes (solo lectura)
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

  return (
    <div className="space-y-6">
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
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No hay imágenes</p>
          <p className="text-sm">Este parque aún no tiene imágenes cargadas.</p>
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
    </div>
  );
}