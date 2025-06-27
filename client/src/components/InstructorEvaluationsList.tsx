import { useQuery } from '@tanstack/react-query';
import { Star, MessageCircle, Clock, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InstructorEvaluation {
  id: number;
  overallRating: number;
  knowledgeRating: number;
  patienceRating: number;
  clarityRating: number;
  punctualityRating: number;
  wouldRecommend: boolean;
  comments?: string;
  attendedActivity?: string;
  evaluatorName: string;
  evaluatorCity?: string;
  createdAt: string;
}

interface EvaluationStats {
  totalEvaluations: number;
  averageRating: number;
  averageKnowledge: number;
  averagePatience: number;
  averageClarity: number;
  averagePunctuality: number;
  recommendationRate: number;
  recommendCount: number;
  notRecommendCount: number;
}

interface InstructorEvaluationsListProps {
  instructorId: number;
}

// Componente para mostrar estrellas
const StarRating = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Componente para mostrar una evaluación individual
const EvaluationCard = ({ evaluation }: { evaluation: InstructorEvaluation }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{evaluation.evaluatorName}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {evaluation.evaluatorCity && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{evaluation.evaluatorCity}</span>
                  </>
                )}
                <Clock className="w-3 h-3 ml-2" />
                <span>{formatDate(evaluation.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={evaluation.overallRating} />
            <span className="text-sm font-medium text-gray-700">
              {evaluation.overallRating}/5
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {evaluation.attendedActivity && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {evaluation.attendedActivity}
            </Badge>
          </div>
        )}
        
        {/* Calificaciones detalladas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Conocimiento</div>
            <StarRating rating={evaluation.knowledgeRating} size="w-3 h-3" />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Paciencia</div>
            <StarRating rating={evaluation.patienceRating} size="w-3 h-3" />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Claridad</div>
            <StarRating rating={evaluation.clarityRating} size="w-3 h-3" />
          </div>
          <div className="text-center">
            <div className="text-gray-600">Puntualidad</div>
            <StarRating rating={evaluation.punctualityRating} size="w-3 h-3" />
          </div>
        </div>

        {evaluation.comments && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                "{evaluation.comments}"
              </p>
            </div>
          </div>
        )}

        {evaluation.wouldRecommend !== undefined && (
          <div className="flex items-center justify-end">
            <Badge 
              variant={evaluation.wouldRecommend ? "default" : "secondary"}
              className={evaluation.wouldRecommend ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
            >
              {evaluation.wouldRecommend ? "✓ Recomendado" : "✗ No recomendado"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para mostrar estadísticas resumidas
const EvaluationStatsCard = ({ stats }: { stats: EvaluationStats }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Resumen de Evaluaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalEvaluations}</div>
            <div className="text-sm text-gray-600">Evaluaciones</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
            <div className="text-sm text-gray-600">Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.recommendationRate}%</div>
            <div className="text-sm text-gray-600">Recomendación</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.recommendCount}</div>
            <div className="text-sm text-gray-600">Recomiendan</div>
          </div>
        </div>

        {/* Desglose de calificaciones */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Promedio por categoría</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Conocimiento</span>
              <span className="font-medium">{stats.averageKnowledge.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Paciencia</span>
              <span className="font-medium">{stats.averagePatience.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Claridad</span>
              <span className="font-medium">{stats.averageClarity.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Puntualidad</span>
              <span className="font-medium">{stats.averagePunctuality.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InstructorEvaluationsList({ instructorId }: InstructorEvaluationsListProps) {
  const [showAll, setShowAll] = useState(false);

  // Obtener estadísticas de evaluaciones
  const { data: stats } = useQuery<EvaluationStats>({
    queryKey: [`/api/public/instructors/${instructorId}/evaluation-stats`],
  });

  // Obtener evaluaciones públicas
  const { data: evaluations, isLoading } = useQuery<InstructorEvaluation[]>({
    queryKey: [`/api/public/instructors/${instructorId}/evaluations`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sin evaluaciones públicas
        </h3>
        <p className="text-gray-600">
          Este instructor aún no tiene evaluaciones aprobadas de ciudadanos.
        </p>
      </div>
    );
  }

  const displayedEvaluations = showAll ? evaluations : evaluations.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Mostrar estadísticas si están disponibles */}
      {stats && <EvaluationStatsCard stats={stats} />}

      {/* Lista de evaluaciones */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Evaluaciones de Ciudadanos ({evaluations.length})
        </h3>
        
        <div className="space-y-4">
          {displayedEvaluations.map((evaluation) => (
            <EvaluationCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>

        {/* Botón para mostrar más evaluaciones */}
        {evaluations.length > 3 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              {showAll 
                ? 'Mostrar menos evaluaciones'
                : `Ver todas las evaluaciones (${evaluations.length})`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}