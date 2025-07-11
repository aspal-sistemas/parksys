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
import { Star, Eye, CheckCircle, XCircle, Clock, Filter, Users, BarChart3, MessageSquare, TrendingUp, Calendar, Award } from 'lucide-react';

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
  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ['/api/park-evaluations', selectedStatus, selectedPark],
    queryFn: () => apiRequest(`/api/park-evaluations?status=${selectedStatus}&parkId=${selectedPark}`),
  });

  // Obtener resumen de parques
  const { data: summaryData } = useQuery({
    queryKey: ['/api/park-evaluations/summary'],
    queryFn: () => apiRequest('/api/park-evaluations/summary'),
  });

  // Obtener lista de parques para filtros
  const { data: parksData } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: () => apiRequest('/api/parks'),
  });

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

        <TabsContent value="stats" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}