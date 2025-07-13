import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Star, Eye, CheckCircle, XCircle, Clock, Filter, Users, BarChart3, MessageSquare, MessageCircle, TrendingUp, Calendar, Award } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface ParkEvaluation {
  id: number;
  park_id: number;
  park_name: string;
  evaluator_name: string;
  evaluator_email: string;
  evaluator_city: string;
  evaluator_age: number;
  is_frequent_visitor: boolean;
  
  // Criterios de evaluación
  cleanliness: number;
  safety: number;
  maintenance: number;
  accessibility: number;
  amenities: number;
  activities: number;
  staff: number;
  natural_beauty: number;
  overall_rating: number;
  
  comments: string;
  suggestions: string;
  would_recommend: boolean;
  visit_date: string;
  visit_purpose: string;
  visit_duration: number;
  
  status: 'pending' | 'approved' | 'rejected';
  moderated_by: number;
  moderated_at: string;
  moderation_notes: string;
  
  created_at: string;
  updated_at: string;
}

interface ParkSummary {
  park_id: number;
  park_name: string;
  total_evaluations: number;
  average_rating: number;
  recommendations: number;
  recommendation_rate: number;
  pending_evaluations: number;
}

const EvaluationStatus = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Aprobada' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rechazada' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  const IconComponent = config.icon;
  
  return (
    <Badge className={config.color}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating})</span>
    </div>
  );
};

const EvaluationCard = ({ evaluation, onModerate }: { evaluation: ParkEvaluation, onModerate: (id: number, status: string, notes?: string) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');

  const handleModerate = (status: string) => {
    onModerate(evaluation.id, status, moderationNotes);
    setIsModalOpen(false);
    setModerationNotes('');
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{evaluation.park_name}</CardTitle>
            <p className="text-sm text-gray-600">
              Por {evaluation.evaluator_name} • {new Date(evaluation.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={evaluation.overall_rating} />
            <EvaluationStatus status={evaluation.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Limpieza</div>
            <StarRating rating={evaluation.cleanliness} />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Seguridad</div>
            <StarRating rating={evaluation.safety} />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Mantenimiento</div>
            <StarRating rating={evaluation.maintenance} />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Accesibilidad</div>
            <StarRating rating={evaluation.accessibility} />
          </div>
        </div>
        
        {evaluation.comments && (
          <div className="mb-3">
            <Label className="text-sm font-medium">Comentarios:</Label>
            <p className="text-sm text-gray-700 mt-1">{evaluation.comments}</p>
          </div>
        )}
        
        {evaluation.suggestions && (
          <div className="mb-3">
            <Label className="text-sm font-medium">Sugerencias:</Label>
            <p className="text-sm text-gray-700 mt-1">{evaluation.suggestions}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>🏠 {evaluation.evaluator_city}</span>
            <span>📅 {evaluation.visit_date ? new Date(evaluation.visit_date).toLocaleDateString() : 'N/A'}</span>
            <span>⏱️ {evaluation.visit_duration ? `${evaluation.visit_duration} min` : 'N/A'}</span>
          </div>
          
          {evaluation.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-700"
                onClick={() => handleModerate('approved')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aprobar
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700">
                    <XCircle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rechazar Evaluación</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notas de moderación (opcional):</Label>
                      <Textarea
                        id="notes"
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        placeholder="Explique por qué se rechaza esta evaluación..."
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleModerate('rejected')}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ParkSummaryCard = ({ park }: { park: ParkSummary }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{park.park_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {park.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Calificación promedio</div>
            <StarRating rating={Math.round(park.average_rating)} />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {park.total_evaluations}
            </div>
            <div className="text-sm text-gray-600">Total evaluaciones</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Recomendaciones:</span>
            <div className="font-semibold">{park.recommendation_rate}%</div>
          </div>
          <div>
            <span className="text-gray-600">Pendientes:</span>
            <div className="font-semibold text-yellow-600">{park.pending_evaluations}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EvaluationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPark, setSelectedPark] = useState('all');

  // Obtener evaluaciones
  const { data: evaluationsData, isLoading, error: evaluationsError } = useQuery({
    queryKey: ['/api/park-evaluations', selectedStatus, selectedPark],
    queryFn: async () => {
      const response = await apiRequest(`/api/park-evaluations?status=${selectedStatus}&parkId=${selectedPark}`);
      return response.json();
    },
  });

  // Obtener resumen de parques
  const { data: summaryData, error: summaryError } = useQuery({
    queryKey: ['/api/park-evaluations/summary'],
    queryFn: async () => {
      const response = await apiRequest('/api/park-evaluations/summary');
      return response.json();
    },
  });

  // Obtener lista de parques para filtros
  const { data: parksData, error: parksError } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await apiRequest('/api/parks');
      return response.json();
    },
  });

  // Debug logging
  console.log('🔍 Evaluations data:', evaluationsData);
  console.log('🔍 Summary data:', summaryData);
  console.log('🔍 Parks data:', parksData);
  console.log('🔍 Errors:', { evaluationsError, summaryError, parksError });

  // Mutación para moderar evaluación
  const moderateEvaluation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      apiRequest(`/api/park-evaluations/${id}/moderate`, {
        method: 'PATCH',
        body: { status, moderationNotes: notes }
      }),
    onSuccess: () => {
      toast({
        title: "Evaluación moderada",
        description: "La evaluación ha sido moderada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/park-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/park-evaluations/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo moderar la evaluación.",
        variant: "destructive",
      });
    }
  });

  // Inicializar tabla si es necesario
  useEffect(() => {
    apiRequest('/api/park-evaluations/init', { method: 'POST' }).catch(() => {});
  }, []);

  const handleModerate = (id: number, status: string, notes?: string) => {
    moderateEvaluation.mutate({ id, status, notes });
  };

  const evaluations = evaluationsData?.evaluations || [];
  const parkSummary = summaryData?.parks || [];
  const parks = parksData?.parks || [];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluaciones de Parques</h1>
            <p className="text-gray-600 mt-1">Gestiona las evaluaciones ciudadanas de los parques</p>
          </div>
        </div>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen por Parque
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Estado</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="approved">Aprobadas</SelectItem>
                      <SelectItem value="rejected">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label>Parque</Label>
                  <Select value={selectedPark} onValueChange={setSelectedPark}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los parques</SelectItem>
                      {parks.map((park: any) => (
                        <SelectItem key={park.id} value={park.id.toString()}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de evaluaciones */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando evaluaciones...</p>
              </div>
            ) : evaluations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay evaluaciones con los filtros seleccionados</p>
                </CardContent>
              </Card>
            ) : (
              evaluations.map((evaluation: ParkEvaluation) => (
                <EvaluationCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  onModerate={handleModerate}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parkSummary.map((park: ParkSummary) => (
              <ParkSummaryCard key={park.park_id} park={park} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parkSummary.reduce((sum, park) => sum + park.total_evaluations, 0)}</div>
                <p className="text-xs text-gray-600">Todas las evaluaciones</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parkSummary.length > 0 
                    ? (parkSummary.reduce((sum, park) => sum + park.average_rating, 0) / parkSummary.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <p className="text-xs text-gray-600">Calificación promedio</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={parkSummary.length > 0 ? Math.round(parkSummary.reduce((sum, park) => sum + park.average_rating, 0) / parkSummary.length) : 0} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {parkSummary.reduce((sum, park) => sum + park.pending_evaluations, 0)}
                </div>
                <p className="text-xs text-gray-600">Evaluaciones pendientes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Parques Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parkSummary.filter(park => park.total_evaluations > 0).length}</div>
                <p className="text-xs text-gray-600">Con evaluaciones</p>
              </CardContent>
            </Card>
          </div>

          {/* Análisis de satisfacción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tasa de Recomendación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parkSummary.length > 0 ? (
                    <>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">
                          {Math.round(parkSummary.reduce((sum, park) => sum + park.recommendation_rate, 0) / parkSummary.length)}%
                        </div>
                        <p className="text-sm text-gray-600">Promedio de recomendaciones</p>
                      </div>
                      <div className="space-y-2">
                        {parkSummary.filter(park => park.total_evaluations > 0).map((park) => (
                          <div key={park.park_id} className="flex justify-between items-center">
                            <span className="text-sm">{park.park_name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${park.recommendation_rate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{park.recommendation_rate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay datos de recomendaciones disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ranking de Parques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parkSummary
                    .filter(park => park.total_evaluations > 0)
                    .sort((a, b) => b.average_rating - a.average_rating)
                    .slice(0, 5)
                    .map((park, index) => (
                      <div key={park.park_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' : 
                            index === 1 ? 'bg-gray-400 text-white' : 
                            index === 2 ? 'bg-orange-500 text-white' : 
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{park.park_name}</div>
                            <div className="text-sm text-gray-600">{park.total_evaluations} evaluaciones</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{park.average_rating.toFixed(1)}</div>
                          <StarRating rating={Math.round(park.average_rating)} />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas temporales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {evaluations.filter(e => {
                      const today = new Date();
                      const evalDate = new Date(e.created_at);
                      return evalDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Evaluaciones hoy</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {evaluations.filter(e => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const evalDate = new Date(e.created_at);
                      return evalDate >= weekAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Últimos 7 días</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {evaluations.filter(e => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      const evalDate = new Date(e.created_at);
                      return evalDate >= monthAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Último mes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de criterios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Análisis por Criterios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'cleanliness', label: 'Limpieza', color: 'bg-blue-500' },
                      { key: 'safety', label: 'Seguridad', color: 'bg-green-500' },
                      { key: 'maintenance', label: 'Mantenimiento', color: 'bg-yellow-500' },
                      { key: 'accessibility', label: 'Accesibilidad', color: 'bg-purple-500' },
                      { key: 'amenities', label: 'Amenidades', color: 'bg-pink-500' },
                      { key: 'activities', label: 'Actividades', color: 'bg-indigo-500' },
                      { key: 'staff', label: 'Personal', color: 'bg-orange-500' },
                      { key: 'natural_beauty', label: 'Belleza Natural', color: 'bg-teal-500' }
                    ].map(criterion => {
                      // Calcular promedio del criterio basado en las evaluaciones
                      const averageScore = evaluations.reduce((sum, evaluation) => sum + (evaluation[criterion.key as keyof ParkEvaluation] as number || 0), 0) / evaluations.length;
                      
                      return (
                        <div key={criterion.key} className="text-center p-4 border rounded-lg">
                          <div className="text-lg font-bold">{averageScore.toFixed(1)}</div>
                          <div className="text-sm text-gray-600 mb-2">{criterion.label}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${criterion.color} h-2 rounded-full`} 
                              style={{ width: `${(averageScore / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-8 w-8 mx-auto mb-2" />
                    <p>No hay datos de criterios disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información demográfica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Perfil de Visitantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluations.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {evaluations.filter(e => e.is_frequent_visitor).length}
                          </div>
                          <div className="text-sm text-gray-600">Visitantes frecuentes</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {evaluations.filter(e => !e.is_frequent_visitor).length}
                          </div>
                          <div className="text-sm text-gray-600">Visitantes ocasionales</div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Ciudades de origen</h4>
                        <div className="space-y-2">
                          {(() => {
                            const cities = evaluations.reduce((acc, e) => {
                              if (e.evaluator_city) {
                                acc[e.evaluator_city] = (acc[e.evaluator_city] || 0) + 1;
                              }
                              return acc;
                            }, {} as Record<string, number>);
                            
                            return Object.entries(cities)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5)
                              .map(([city, count]) => (
                                <div key={city} className="flex justify-between items-center">
                                  <span className="text-sm">{city}</span>
                                  <Badge variant="secondary">{count}</Badge>
                                </div>
                              ));
                          })()}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay datos demográficos disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Participación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluations.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {evaluations.filter(e => e.comments).length}
                          </div>
                          <div className="text-sm text-gray-600">Con comentarios</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-xl font-bold text-orange-600">
                            {evaluations.filter(e => e.suggestions).length}
                          </div>
                          <div className="text-sm text-gray-600">Con sugerencias</div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Distribución por calificación</h4>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = evaluations.filter(e => e.overall_rating === rating).length;
                            const percentage = evaluations.length > 0 ? (count / evaluations.length) * 100 : 0;
                            
                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-8">{rating}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay datos de participación disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}