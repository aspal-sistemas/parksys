import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ParkEvaluation {
  id: number;
  parkId: number;
  parkName: string;
  evaluatorName: string;
  evaluatorEmail?: string;
  evaluatorPhone?: string;
  evaluatorCity?: string;
  evaluatorAge?: number;
  isFrequentVisitor: boolean;
  
  // Criterios de evaluación individuales
  cleanliness: number;
  safety: number;
  maintenance: number;
  accessibility: number;
  amenities: number;
  activities: number;
  staff: number;
  naturalBeauty: number;
  
  overallRating: number;
  comments?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  
  visitDate?: string;
  visitPurpose?: string;
  visitDuration?: number;
  
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: number;
  moderatedAt?: string;
  moderationNotes?: string;
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
  updatedAt: string;
}

const EvaluacionesParques = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEvaluation, setViewingEvaluation] = useState<ParkEvaluation | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<ParkEvaluation | null>(null);
  const recordsPerPage = 9;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener evaluaciones de parques
  const { data: evaluations = [], isLoading } = useQuery<ParkEvaluation[]>({
    queryKey: ['/api/evaluations/parks'],
  });

  // Mutación para eliminar evaluación
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/evaluations/parks/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/parks'] });
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación se ha eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la evaluación",
        variant: "destructive",
      });
    },
  });

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch = 
      evaluation.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluatorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === 'excellent' && evaluation.overallRating && evaluation.overallRating >= 4.5) ||
      (ratingFilter === 'good' && evaluation.overallRating && evaluation.overallRating >= 3.5 && evaluation.overallRating < 4.5) ||
      (ratingFilter === 'average' && evaluation.overallRating && evaluation.overallRating >= 2.5 && evaluation.overallRating < 3.5) ||
      (ratingFilter === 'poor' && evaluation.overallRating && evaluation.overallRating < 2.5);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Paginación
  const totalPages = Math.ceil(filteredEvaluations.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedEvaluations = filteredEvaluations.slice(startIndex, startIndex + recordsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-gray-500';
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Estadísticas
  const stats = {
    total: evaluations.length,
    pending: evaluations.filter(e => e.status === 'pending').length,
    approved: evaluations.filter(e => e.status === 'approved').length,
    rejected: evaluations.filter(e => e.status === 'rejected').length,
    averageRating: evaluations.length > 0 
      ? evaluations.reduce((sum, e) => sum + (e.overallRating || 0), 0) / evaluations.length 
      : 0
  };

  // Componente de evaluación individual en formato grid
  const EvaluationCard = ({ evaluation }: { evaluation: ParkEvaluation }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{evaluation.parkName}</h3>
              <p className="text-sm text-gray-600">Por: {evaluation.evaluatorName}</p>
              <p className="text-xs text-gray-500">
                {new Date(evaluation.createdAt).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getRatingColor(evaluation.overallRating)}`}>
              {evaluation.overallRating ? evaluation.overallRating.toFixed(1) : 'N/A'} ⭐
            </div>
            <Badge className={getStatusColor(evaluation.status)}>
              {getStatusLabel(evaluation.status)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewingEvaluation(evaluation)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditingEvaluation(evaluation)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La evaluación será eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(evaluation.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de evaluación en formato lista
  const EvaluationRow = ({ evaluation }: { evaluation: ParkEvaluation }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{evaluation.parkName}</div>
            <div className="text-sm text-gray-500">{evaluation.evaluatorName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`text-lg font-bold ${getRatingColor(evaluation.overallRating)}`}>
          {evaluation.overallRating ? evaluation.overallRating.toFixed(1) : 'N/A'} ⭐
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge className={getStatusColor(evaluation.status)}>
          {getStatusLabel(evaluation.status)}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(evaluation.createdAt).toLocaleDateString('es-MX')}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setViewingEvaluation(evaluation)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setEditingEvaluation(evaluation)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. La evaluación será eliminada permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate(evaluation.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Parques" subtitle="Cargando evaluaciones de parques...">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Parques" subtitle="Gestión y seguimiento de evaluaciones de parques urbanos">
      <div className="p-6 space-y-6">
        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio</p>
                  <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'} ⭐
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles y filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por parque o evaluador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros Avanzados
                </Button>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calificación
                    </label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las calificaciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las calificaciones</SelectItem>
                        <SelectItem value="excellent">Excelente (4.5+)</SelectItem>
                        <SelectItem value="good">Buena (3.5-4.4)</SelectItem>
                        <SelectItem value="average">Regular (2.5-3.4)</SelectItem>
                        <SelectItem value="poor">Mala (0-2.4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vista de evaluaciones */}
        {filteredEvaluations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron evaluaciones de parques</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Las evaluaciones aparecerán aquí una vez que se registren'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedEvaluations.map((evaluation) => (
                  <EvaluationCard key={evaluation.id} evaluation={evaluation} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parque
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calificación
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedEvaluations.map((evaluation) => (
                          <EvaluationRow key={evaluation.id} evaluation={evaluation} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + recordsPerPage, filteredEvaluations.length)} de {filteredEvaluations.length} evaluaciones
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Dialog de detalles */}
        <Dialog open={!!viewingEvaluation} onOpenChange={() => setViewingEvaluation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Evaluación</DialogTitle>
            </DialogHeader>
            {viewingEvaluation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Parque</label>
                    <p className="text-lg font-semibold">{viewingEvaluation.parkName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Evaluador</label>
                    <p className="text-lg">{viewingEvaluation.evaluatorName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Calificación General</label>
                    <p className={`text-2xl font-bold ${getRatingColor(viewingEvaluation.overallRating)}`}>
                      {viewingEvaluation.overallRating ? viewingEvaluation.overallRating.toFixed(1) : 'N/A'} ⭐
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <Badge className={getStatusColor(viewingEvaluation.status)}>
                      {getStatusLabel(viewingEvaluation.status)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Criterios de Evaluación</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex justify-between">
                      <span>Limpieza:</span>
                      <span className="font-semibold">{viewingEvaluation.cleanliness || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seguridad:</span>
                      <span className="font-semibold">{viewingEvaluation.safety || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mantenimiento:</span>
                      <span className="font-semibold">{viewingEvaluation.maintenance || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accesibilidad:</span>
                      <span className="font-semibold">{viewingEvaluation.accessibility || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amenidades:</span>
                      <span className="font-semibold">{viewingEvaluation.amenities || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actividades:</span>
                      <span className="font-semibold">{viewingEvaluation.activities || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Personal:</span>
                      <span className="font-semibold">{viewingEvaluation.staff || 'N/A'}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Belleza Natural:</span>
                      <span className="font-semibold">{viewingEvaluation.naturalBeauty || 'N/A'}/5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Comentarios</label>
                  <p className="mt-1 text-gray-700">{viewingEvaluation.comments || 'Sin comentarios'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Evaluación</label>
                  <p className="mt-1">{new Date(viewingEvaluation.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de edición */}
        <Dialog open={!!editingEvaluation} onOpenChange={() => setEditingEvaluation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Evaluación</DialogTitle>
            </DialogHeader>
            {editingEvaluation && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Funcionalidad de edición en desarrollo. Evaluación ID: {editingEvaluation.id}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingEvaluation(null)}>
                    Cancelar
                  </Button>
                  <Button>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EvaluacionesParques;