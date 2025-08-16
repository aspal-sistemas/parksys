import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkEvaluation {
  id: number;
  parkId: number;
  parkName: string;
  evaluatorName: string;
  overallRating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  criteria: {
    cleanliness: number;
    safety: number;
    accessibility: number;
    maintenance: number;
    facilities: number;
  };
  comments: string;
}

const EvaluacionesParques = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('evaluations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener evaluaciones de parques
  const { data: evaluations = [], isLoading } = useQuery<ParkEvaluation[]>({
    queryKey: ['/api/evaluations/parks'],
  });

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch = 
      evaluation.parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluatorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getRatingColor = (rating: number) => {
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
      ? evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length 
      : 0
  };

  if (isLoading) {
    return (
      <AdminLayout title="Evaluaciones de Parques" subtitle="Cargando evaluaciones de parques...">
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
    <AdminLayout title="Evaluaciones de Parques" subtitle="Gestión y seguimiento de evaluaciones de parques urbanos">
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
                    {(stats.averageRating || 0).toFixed(1)} ⭐
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
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avanzados
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Evaluación
            </Button>
          </div>
        </div>

        {/* Lista de evaluaciones */}
        <div className="grid gap-4">
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
            filteredEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {evaluation.parkName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Evaluado por: {evaluation.evaluatorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(evaluation.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(evaluation.overallRating)}`}>
                          {(evaluation.overallRating || 0).toFixed(1)} ⭐
                        </div>
                        <Badge className={getStatusColor(evaluation.status)}>
                          {evaluation.status === 'pending' ? 'Pendiente' :
                           evaluation.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                        </Badge>
                      </div>
                      {getStatusIcon(evaluation.status)}
                    </div>
                  </div>

                  {/* Criterios de evaluación */}
                  {evaluation.criteria && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Limpieza</p>
                        <p className={`font-semibold ${getRatingColor(evaluation.criteria.cleanliness || 0)}`}>
                          {evaluation.criteria.cleanliness || 0}/5
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Seguridad</p>
                        <p className={`font-semibold ${getRatingColor(evaluation.criteria.safety || 0)}`}>
                          {evaluation.criteria.safety || 0}/5
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Accesibilidad</p>
                        <p className={`font-semibold ${getRatingColor(evaluation.criteria.accessibility || 0)}`}>
                          {evaluation.criteria.accessibility || 0}/5
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Mantenimiento</p>
                        <p className={`font-semibold ${getRatingColor(evaluation.criteria.maintenance || 0)}`}>
                          {evaluation.criteria.maintenance || 0}/5
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Instalaciones</p>
                        <p className={`font-semibold ${getRatingColor(evaluation.criteria.facilities || 0)}`}>
                          {evaluation.criteria.facilities || 0}/5
                        </p>
                      </div>
                    </div>
                  )}

                  {evaluation.comments && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Comentarios:</span> {evaluation.comments}
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    {evaluation.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button variant="destructive" size="sm" className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EvaluacionesParques;