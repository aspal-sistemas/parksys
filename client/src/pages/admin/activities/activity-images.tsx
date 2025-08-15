import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import ActivityImageManager from '@/components/ActivityImageManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image } from 'lucide-react';

// Tipo para la actividad con información completa
interface ActivityWithDetails {
  id: number;
  parkId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  category?: string;
  categoryId?: number;
  location?: string;
  capacity?: number;
  price?: string;
  isFree: boolean;
  instructorId?: number;
  createdAt: string;
  parkName?: string;
  categoryName?: string;
  instructorName?: string;
}

const ActivityImagesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const activityId = parseInt(id || '0');

  // Obtener información de la actividad
  const { data: activity, isLoading } = useQuery<ActivityWithDetails>({
    queryKey: ['/api/activities', activityId],
    enabled: !!activityId,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587] mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando actividad...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!activity) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Actividad no encontrada</p>
            <Button onClick={() => setLocation('/admin/activities')}>
              Volver a Actividades
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/admin/activities')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Imágenes</h1>
              <p className="text-gray-500">Actividad: {activity.title}</p>
            </div>
          </div>
          
          <Button
            onClick={() => setLocation(`/admin/organizador/catalogo/editar/${activityId}`)}
            variant="outline"
          >
            Editar Actividad
          </Button>
        </div>

        {/* Información de la actividad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              {activity.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Parque:</span>
                <p className="text-gray-600">{activity.parkName || 'No especificado'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Categoría:</span>
                <p className="text-gray-600">{activity.categoryName || activity.category || 'No especificada'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha de inicio:</span>
                <p className="text-gray-600">
                  {activity.startDate ? new Date(activity.startDate).toLocaleDateString('es-ES') : 'No especificada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestor de imágenes */}
        <ActivityImageManager activityId={activityId} />
      </div>
    </AdminLayout>
  );
};

export default ActivityImagesPage;