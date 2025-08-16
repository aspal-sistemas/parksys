import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Target, 
  Building, 
  Star,
  BarChart3,
  Settings,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface EvaluationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

interface EntityStats {
  parks: EvaluationStats;
  instructors: EvaluationStats;
  volunteers: EvaluationStats;
  activities: EvaluationStats;
  concessionaires: EvaluationStats;
  events: EvaluationStats;
}

const EvaluationsDashboard = () => {
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');

  // Consulta para obtener estadísticas de todas las entidades
  const { data: stats, isLoading } = useQuery<EntityStats>({
    queryKey: ['/api/evaluations/stats'],
  });

  // Consulta para obtener evaluaciones recientes
  const { data: recentEvaluations, isLoading: loadingRecent } = useQuery({
    queryKey: ['/api/evaluations/recent', selectedEntityType],
  });

  const entityTypes = [
    { key: 'all', label: 'Todas', icon: BarChart3, color: 'bg-gray-500' },
    { key: 'park', label: 'Parques', icon: MapPin, color: 'bg-green-500' },
    { key: 'instructor', label: 'Instructores', icon: UserCheck, color: 'bg-blue-500' },
    { key: 'volunteer', label: 'Voluntarios', icon: Users, color: 'bg-purple-500' },
    { key: 'activity', label: 'Actividades', icon: Calendar, color: 'bg-orange-500' },
    { key: 'concessionaire', label: 'Concesionarios', icon: Building, color: 'bg-teal-500' },
    { key: 'event', label: 'Eventos', icon: Target, color: 'bg-red-500' },
  ];

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

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Evaluaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestión centralizada de evaluaciones para parques, instructores, voluntarios, actividades, concesionarios y eventos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar Criterios
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* Estadísticas por Tipo de Entidad */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {entityTypes.slice(1).map((type) => {
          const entityStats = stats?.[type.key as keyof EntityStats];
          const Icon = type.icon;
          
          return (
            <Card key={type.key} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEntityType(type.key)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${type.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                    <Icon className={`h-5 w-5 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="secondary">{entityStats?.total || 0}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {entityStats?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="flex-1 text-center">
                    <div className="text-xs font-medium text-green-600">{entityStats?.approved || 0}</div>
                    <div className="text-xs text-gray-500">Aprobadas</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs font-medium text-yellow-600">{entityStats?.pending || 0}</div>
                    <div className="text-xs text-gray-500">Pendientes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(stats || {}).reduce((acc, curr) => acc + (curr?.total || 0), 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes de Revisión</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Object.values(stats || {}).reduce((acc, curr) => acc + (curr?.pending || 0), 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(stats || {}).reduce((acc, curr) => acc + (curr?.approved || 0), 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {(Object.values(stats || {}).reduce((acc, curr) => acc + (curr?.averageRating || 0), 0) / 
                      Object.keys(stats || {}).length).toFixed(1) || '0.0'}
                  </p>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs por Tipo de Entidad */}
      <Tabs value={selectedEntityType} onValueChange={setSelectedEntityType}>
        <TabsList className="grid w-full grid-cols-7">
          {entityTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.key} value={type.key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {type.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {entityTypes.map((type) => (
          <TabsContent key={type.key} value={type.key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evaluaciones Recientes - {type.label}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todas
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecent ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(recentEvaluations as any[])?.length ? (
                      (recentEvaluations as any[]).slice(0, 5).map((evaluation: any) => (
                        <div key={evaluation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(evaluation.status)}
                            <div>
                              <p className="font-medium text-gray-900">{evaluation.entityName}</p>
                              <p className="text-sm text-gray-600">
                                Por {evaluation.evaluatorName} • {evaluation.overallRating}/5 ⭐
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(evaluation.status)}>
                              {evaluation.status === 'pending' ? 'Pendiente' :
                               evaluation.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(evaluation.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No hay evaluaciones recientes para {type.label.toLowerCase()}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EvaluationsDashboard;