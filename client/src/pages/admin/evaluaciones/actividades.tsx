import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Star, 
  Clock, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Award,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivityEvaluation {
  id: number;
  activityId: number;
  activityName: string;
  evaluatorName: string;
  overallRating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  criteria: {
    organization: number;
    content: number;
    participation: number;
    resources: number;
    satisfaction: number;
  };
  comments: string;
  attendees: number;
  instructorName: string;
  parkName: string;
}

const EvaluacionesActividades = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener evaluaciones de actividades
  const { data: evaluations = [], isLoading } = useQuery<ActivityEvaluation[]>({
    queryKey: ['/api/evaluations/activities'],
  });

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch = 
      evaluation.activityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.parkName?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      : 0,
    totalAttendees: evaluations.reduce((sum, e) => sum + (e.attendees || 0), 0)
  };

  if (isLoading) {
    return (
      <AdminLayout title="Evaluaciones de Actividades" subtitle="Cargando evaluaciones de actividades...">
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
    <AdminLayout title="Evaluaciones de Actividades" subtitle="Gestión y seguimiento de evaluaciones de actividades">
      <div className="p-6 space-y-6">
        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio</p>
                  <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                    {stats.averageRating.toFixed(1)} ⭐
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
                  <p className="text-sm text-gray-600">Asistentes</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalAttendees}</p>
                </div>
                <Play className="h-8 w-8 text-indigo-500" />
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
                placeholder="Buscar por actividad, instructor o parque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron evaluaciones de actividades</p>
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
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {evaluation.activityName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Parque: {evaluation.parkName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Instructor: {evaluation.instructorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Evaluado por: {evaluation.evaluatorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Asistentes: {evaluation.attendees || 0} participantes
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
                          {evaluation.overallRating.toFixed(1)} ⭐
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Organización</p>
                      <p className={`font-semibold ${getRatingColor(evaluation.criteria.organization)}`}>
                        {evaluation.criteria.organization}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Contenido</p>
                      <p className={`font-semibold ${getRatingColor(evaluation.criteria.content)}`}>
                        {evaluation.criteria.content}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Participación</p>
                      <p className={`font-semibold ${getRatingColor(evaluation.criteria.participation)}`}>
                        {evaluation.criteria.participation}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Recursos</p>
                      <p className={`font-semibold ${getRatingColor(evaluation.criteria.resources)}`}>
                        {evaluation.criteria.resources}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Satisfacción</p>
                      <p className={`font-semibold ${getRatingColor(evaluation.criteria.satisfaction)}`}>
                        {evaluation.criteria.satisfaction}/5
                      </p>
                    </div>
                  </div>

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

export default EvaluacionesActividades;