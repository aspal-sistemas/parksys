import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Activity {
  id: number;
  parkId: number;
  title: string;
  description: string | null;
  category: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  createdAt: string;
}

const AdminActivities: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch all activities
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activities/all'],
    queryFn: async () => {
      const response = await fetch('/api/activities/all');
      if (!response.ok) {
        throw new Error('Error al cargar actividades');
      }
      return response.json() as Promise<Activity[]>;
    }
  });
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: 'Actividad eliminada',
          description: 'La actividad ha sido eliminada exitosamente',
        });
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/activities/all'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la actividad',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al eliminar la actividad',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
            <p className="text-gray-500">Gestiona las actividades de los parques</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva actividad
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            Error al cargar actividades. Por favor, intenta de nuevo.
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{activity.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    {format(new Date(activity.startDate), 'PPP', { locale: es })}
                    {activity.endDate && ` - ${format(new Date(activity.endDate), 'PPP', { locale: es })}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.category && (
                    <Badge variant="outline" className="mb-3">
                      {activity.category}
                    </Badge>
                  )}
                  <p className="text-gray-600 line-clamp-2">{activity.description}</p>
                  {activity.location && (
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Ubicación:</strong> {activity.location}
                    </p>
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between py-3">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(activity.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay actividades</h3>
            <p className="text-gray-500 mb-4">Aún no se han agregado actividades al sistema.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear primera actividad
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivities;