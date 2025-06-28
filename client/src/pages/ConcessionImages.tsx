import React from 'react';
import { useParams } from 'wouter';
import { AdminLayout } from '@/components/AdminLayout';
import ConcessionImageManager from '@/components/ConcessionImageManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

const ConcessionImages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const concessionId = parseInt(id || '0');

  // Obtener información básica de la concesión
  const { data: concession, isLoading } = useQuery({
    queryKey: [`/api/active-concessions/${concessionId}`],
    queryFn: async () => {
      const response = await fetch(`/api/active-concessions/${concessionId}`);
      if (!response.ok) throw new Error('Error al cargar concesión');
      return response.json();
    },
    enabled: !!concessionId
  });

  if (isLoading) {
    return (
      <AdminLayout title="Gestión de Imágenes - Concesión">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!concession) {
    return (
      <AdminLayout title="Concesión no encontrada">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">La concesión solicitada no existe</p>
            <Link href="/admin/concessions/active">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Concesiones Activas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Imágenes - Concesión">
      <div className="space-y-6">
        {/* Header con información de la concesión */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-2xl">Gestión de Imágenes</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {concession.data?.name || concession.name} - {concession.data?.description || concession.description}
                  </p>
                </div>
              </div>
              <Link href="/admin/concessions/active">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al listado
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Componente de gestión de imágenes */}
        <ConcessionImageManager concessionId={concessionId} />

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p>Las imágenes subidas aquí aparecerán automáticamente en las landing pages de parques y en las páginas públicas de concesiones.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p>La primera imagen subida se establecerá automáticamente como imagen principal.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p>Puedes cambiar la imagen principal en cualquier momento haciendo clic en "Hacer principal".</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p>Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 5MB por imagen.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ConcessionImages;