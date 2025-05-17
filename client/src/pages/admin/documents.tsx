import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Document {
  id: number;
  parkId: number;
  title: string;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
  createdAt: string;
}

interface Park {
  id: number;
  name: string;
}

const AdminDocuments: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch all documents
  const { data: documents, isLoading: isLoadingDocuments, error: documentsError } = useQuery({
    queryKey: ['/api/documents/all'],
    queryFn: async () => {
      const response = await fetch('/api/documents/all');
      if (!response.ok) {
        throw new Error('Error al cargar documentos');
      }
      return response.json() as Promise<Document[]>;
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
  
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileText className="text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="text-indigo-500" />;
    } else {
      return <FileText className="text-gray-500" />;
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: 'Documento eliminado',
          description: 'El documento ha sido eliminado exitosamente',
        });
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/documents/all'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el documento',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al eliminar el documento',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
            <p className="text-gray-500">Gestiona los documentos de los parques</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo documento
          </Button>
        </div>
        
        {isLoadingDocuments ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : documentsError ? (
          <div className="text-center p-8 text-red-500">
            Error al cargar documentos. Por favor, intenta de nuevo.
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{getParkName(doc.parkId)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{doc.fileType?.split('/')[1]?.toUpperCase() || 'Documento'}</span>
                    <span>{doc.fileSize || 'Desconocido'}</span>
                  </div>
                </CardContent>
                <Separator />
                <div className="p-3 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay documentos</h3>
            <p className="text-gray-500 mb-4">Aún no se han agregado documentos al sistema.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Subir primer documento
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDocuments;