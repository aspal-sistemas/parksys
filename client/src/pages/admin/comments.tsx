import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Comment {
  id: number;
  parkId: number;
  name: string;
  email: string | null;
  content: string;
  rating: number | null;
  isApproved: boolean | null;
  createdAt: string;
}

interface Park {
  id: number;
  name: string;
}

const AdminComments: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch all comments
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['/api/comments/all'],
    queryFn: async () => {
      const response = await fetch('/api/comments/all');
      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }
      return response.json() as Promise<Comment[]>;
    }
  });
  
  // Fetch all parks for reference
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar parques');
      }
      return response.json() as Promise<Park[]>;
    }
  });
  
  const getParkName = (parkId: number) => {
    const park = parks?.find(p => p.id === parkId);
    return park ? park.name : 'Parque desconocido';
  };
  
  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/comments/${id}/approve`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        toast({
          title: 'Comentario aprobado',
          description: 'El comentario ha sido aprobado exitosamente',
        });
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/comments/all'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo aprobar el comentario',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al aprobar el comentario',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: 'Comentario eliminado',
          description: 'El comentario ha sido eliminado exitosamente',
        });
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/comments/all'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el comentario',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al eliminar el comentario',
        variant: 'destructive',
      });
    }
  };
  
  // Render stars for rating
  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comentarios</h1>
            <p className="text-gray-500">Gestiona comentarios de usuarios sobre los parques</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            Error al cargar comentarios. Por favor, intenta de nuevo.
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comments.map((comment) => (
              <Card key={comment.id} className={`overflow-hidden ${comment.isApproved === null ? 'border-yellow-200' : (comment.isApproved ? 'border-green-200' : 'border-red-200')}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{comment.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        {comment.email && <p>{comment.email}</p>}
                        <p>{format(new Date(comment.createdAt), 'PPP', { locale: es })}</p>
                      </div>
                    </div>
                    <Badge className={
                      comment.isApproved === null 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : (comment.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800')
                    }>
                      {comment.isApproved === null 
                        ? 'Pendiente' 
                        : (comment.isApproved 
                          ? 'Aprobado' 
                          : 'Rechazado')
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  {comment.rating !== null && (
                    <div className="text-amber-500 font-medium">
                      {renderStars(comment.rating)}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Parque:</strong> {getParkName(comment.parkId)}
                  </p>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between py-3">
                  {comment.isApproved === null && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(comment.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(comment.id)}
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
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay comentarios</h3>
            <p className="text-gray-500 mb-4">Aún no hay comentarios de visitantes al sitio.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComments;