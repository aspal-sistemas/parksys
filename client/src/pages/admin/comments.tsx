import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Check, 
  Trash, 
  Search, 
  X, 
  Loader,
  ArrowUpDown,
  User
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Comment, Park } from '@shared/schema';

const AdminComments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch all comments
  const { 
    data: comments = [], 
    isLoading: isLoadingComments,
    isError: isErrorComments,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['/api/comments'],
  });

  // Fetch parks for filter
  const { 
    data: parks = [], 
    isLoading: isLoadingParks 
  } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
  };

  // Approve comment mutation
  const approveMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/comments/${commentId}/approve`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Error al aprobar el comentario');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      
      // Show success toast
      toast({
        title: "Comentario aprobado",
        description: "El comentario ha sido aprobado exitosamente.",
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo aprobar el comentario. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Filter and sort comments
  const filteredComments = React.useMemo(() => {
    return [...comments].filter(comment => {
      // Apply search filter
      if (searchQuery && 
          !comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !comment.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply park filter
      if (filterPark && comment.parkId.toString() !== filterPark) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus === 'approved' && !comment.isApproved) {
        return false;
      } else if (filterStatus === 'pending' && comment.isApproved) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortField === 'authorName') {
        return sortDirection === 'asc' 
          ? (a.name || '').localeCompare(b.name || '') 
          : (b.name || '').localeCompare(a.name || '');
      }
      
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default sort by date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [comments, searchQuery, filterPark, filterStatus, sortField, sortDirection]);

  // Get park name by ID
  const getParkName = (parkId: number) => {
    const park = parks.find(p => p.id === parkId);
    return park ? park.name : 'Desconocido';
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    try {
      await fetch(`/api/comments/${commentToDelete.id}`, {
        method: 'DELETE',
      });
      
      // Refetch comments
      refetchComments();
      
      // Show success toast
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado exitosamente.",
      });
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle opening delete dialog
  const handleDeleteClick = (comment: Comment) => {
    setCommentToDelete(comment);
    setShowDeleteDialog(true);
  };

  // Handle approve comment
  const handleApproveClick = (commentId: number) => {
    approveMutation.mutate(commentId);
  };

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('');
    setFilterStatus('');
  };

  return (
    <AdminLayout title="Administración de Comentarios">
      <div className="space-y-6">
        {/* Header with info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Comentarios</h2>
            <p className="text-gray-500 text-sm mt-1">
              Gestione los comentarios de usuarios sobre los parques
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-gray-100">
              Total: {comments.length}
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Aprobados: {comments.filter(c => c.approved).length}
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
              Pendientes: {comments.filter(c => !c.approved).length}
            </Badge>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar comentarios..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterPark} onValueChange={setFilterPark}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {parks.map(park => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchQuery || filterPark || filterStatus) && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Comments table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingComments ? (
            <div className="py-32 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-gray-500">Cargando comentarios...</p>
              </div>
            </div>
          ) : isErrorComments ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar los comentarios</p>
                <Button variant="outline" onClick={() => refetchComments()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No se encontraron comentarios</p>
                {(searchQuery || filterPark || filterStatus) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('authorName')}
                    >
                      Autor
                      {sortField === 'authorName' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-[300px]">Comentario</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('createdAt')}
                    >
                      Fecha
                      {sortField === 'createdAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map(comment => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">{comment.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comment.name}</p>
                          {comment.email && (
                            <p className="text-xs text-gray-500">{comment.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm line-clamp-2">{comment.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(comment.createdAt)}</TableCell>
                    <TableCell>{getParkName(comment.parkId)}</TableCell>
                    <TableCell>
                      {comment.isApproved ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {!comment.isApproved && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleApproveClick(comment.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(comment)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar el comentario de <span className="font-semibold">{commentToDelete?.authorName}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminComments;