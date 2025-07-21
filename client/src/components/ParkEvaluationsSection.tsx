import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { safeApiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, MessageCircle, ThumbsUp, Users, BarChart3, Calendar, ArrowRight } from 'lucide-react';

interface ParkEvaluationsProps {
  parkId: number;
  parkSlug: string;
}

interface EvaluationStats {
  total_evaluations: number;
  average_rating: number;
  recommendation_rate: number;
  avg_cleanliness: number;
  avg_safety: number;
  avg_maintenance: number;
  avg_accessibility: number;
  avg_amenities: number;
  avg_activities: number;
  avg_staff: number;
  avg_natural_beauty: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

interface Evaluation {
  id: number;
  evaluator_name: string;
  evaluator_city: string;
  overall_rating: number;
  cleanliness: number;
  safety: number;
  maintenance: number;
  accessibility: number;
  amenities: number;
  activities: number;
  staff: number;
  natural_beauty: number;
  comments: string;
  suggestions: string;
  would_recommend: boolean;
  visit_date: string;
  visit_purpose: string;
  created_at: string;
}

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
    </div>
  );
};

const RatingBar = ({ label, value, maxValue = 5 }: { label: string; value: number; maxValue?: number }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-[80px] text-sm text-gray-600">{label}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="min-w-[30px] text-sm font-medium">{value.toFixed(1)}</div>
    </div>
  );
};

const EvaluationCard = ({ evaluation }: { evaluation: Evaluation }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{evaluation.evaluator_name}</h4>
              {evaluation.evaluator_city && (
                <Badge variant="secondary" className="text-xs">
                  {evaluation.evaluator_city}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={evaluation.overall_rating} />
              <span className="text-sm text-gray-600">
                {new Date(evaluation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {evaluation.would_recommend && (
            <Badge className="bg-green-100 text-green-800">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Recomendado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Criterios detallados */}
        <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
          <div className="text-center">
            <div className="text-gray-600">Limpieza</div>
            <StarRating rating={evaluation.cleanliness} />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Seguridad</div>
            <StarRating rating={evaluation.safety} />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Mantenimiento</div>
            <StarRating rating={evaluation.maintenance} />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Accesibilidad</div>
            <StarRating rating={evaluation.accessibility} />
          </div>
        </div>

        {/* Comentarios */}
        {evaluation.comments && (
          <div className="mb-3">
            <p className="text-sm text-gray-700 italic">"{evaluation.comments}"</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {evaluation.visit_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(evaluation.visit_date).toLocaleDateString()}
            </span>
          )}
          {evaluation.visit_purpose && (
            <span>Propósito: {evaluation.visit_purpose}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ParkEvaluationsSection({ parkId, parkSlug }: ParkEvaluationsProps) {
  const [showAllEvaluations, setShowAllEvaluations] = useState(false);

  // Obtener estadísticas de evaluaciones
  const { data: stats } = useQuery<EvaluationStats>({
    queryKey: ['/api/parks', parkId, 'evaluation-stats'],
    queryFn: () => safeApiRequest(`/api/parks/${parkId}/evaluation-stats`),
  });

  // Obtener evaluaciones recientes
  const { data: evaluationsData } = useQuery({
    queryKey: ['/api/parks', parkId, 'evaluations'],
    queryFn: () => safeApiRequest(`/api/parks/${parkId}/evaluations?limit=3`),
  });

  // Obtener todas las evaluaciones para el modal
  const { data: allEvaluationsData } = useQuery({
    queryKey: ['/api/parks', parkId, 'all-evaluations'],
    queryFn: () => safeApiRequest(`/api/parks/${parkId}/evaluations?limit=50`),
    enabled: showAllEvaluations,
  });

  if (!stats || !stats.average_rating || Number(stats.total_evaluations) === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Evaluaciones Ciudadanas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Sé el primero en evaluar este parque y ayuda a otros visitantes con tu experiencia.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open(`/parque/${parkSlug}/evaluar`, '_blank')}
            >
              <Star className="h-4 w-4 mr-2" />
              Evalúa este parque
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const evaluations = evaluationsData?.evaluations || [];
  const allEvaluations = allEvaluationsData?.evaluations || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Evaluaciones Ciudadanas
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Conoce la opinión de otros visitantes sobre este parque
        </p>
      </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estadísticas principales */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Calificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600">
                    {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex justify-center mb-2">
                    <StarRating rating={Math.round(stats.average_rating || 0)} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Basado en {Number(stats.total_evaluations) || 0} evaluaciones
                  </div>
                </div>

                <div className="space-y-3">
                  <RatingBar label="Limpieza" value={stats.avg_cleanliness || 0} />
                  <RatingBar label="Seguridad" value={stats.avg_safety || 0} />
                  <RatingBar label="Mantenimiento" value={stats.avg_maintenance || 0} />
                  <RatingBar label="Accesibilidad" value={stats.avg_accessibility || 0} />
                  <RatingBar label="Amenidades" value={stats.avg_amenities || 0} />
                  <RatingBar label="Actividades" value={stats.avg_activities || 0} />
                  <RatingBar label="Personal" value={stats.avg_staff || 0} />
                  <RatingBar label="Belleza Natural" value={stats.avg_natural_beauty || 0} />
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recomendación</span>
                    <span className="text-lg font-semibold text-green-600">
                      {stats.recommendation_rate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluaciones recientes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Evaluaciones Recientes</h3>
              <div className="flex gap-2">
                <Dialog open={showAllEvaluations} onOpenChange={setShowAllEvaluations}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Ver todas ({Number(stats.total_evaluations) || 0})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]" aria-describedby="evaluation-description">
                    <DialogHeader>
                      <DialogTitle>Todas las Evaluaciones</DialogTitle>
                    </DialogHeader>
                    <div id="evaluation-description" className="sr-only">
                      Lista completa de todas las evaluaciones recibidas para este parque
                    </div>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-4">
                        {allEvaluations.map((evaluation: Evaluation) => (
                          <EvaluationCard key={evaluation.id} evaluation={evaluation} />
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(`/parque/${parkSlug}/evaluar`, '_blank')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Evaluar parque
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {evaluations.map((evaluation: Evaluation) => (
                <EvaluationCard key={evaluation.id} evaluation={evaluation} />
              ))}
            </div>

            {evaluations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No hay evaluaciones públicas disponibles aún.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}