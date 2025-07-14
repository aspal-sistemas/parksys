import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Star, TrendingUp, MessageCircle, ThumbsUp, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorshipEvaluation } from '@/shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/AdminLayout';

const EvaluationsPage = () => {
  const [selectedSponsor, setSelectedSponsor] = useState('all');
  const [showNewEvaluationDialog, setShowNewEvaluationDialog] = useState(false);

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

  const { data: allEvaluations, isLoading } = useQuery({
    queryKey: ['/api/sponsorship-evaluations'],
    queryFn: async () => {
      if (!sponsors) return [];
      const evaluationsPromises = sponsors.map((sponsor: any) => 
        safeApiRequest(`/api/sponsors/${sponsor.id}/evaluations`, {})
      );
      const results = await Promise.all(evaluationsPromises);
      return results.flat();
    },
    enabled: !!sponsors
  });

  const filteredEvaluations = allEvaluations?.filter((evaluation: SponsorshipEvaluation) => {
    if (selectedSponsor === 'all') return true;
    return evaluation.sponsorId === parseInt(selectedSponsor);
  }) || [];

  const calculateAverageRating = (evaluations: SponsorshipEvaluation[]) => {
    if (evaluations.length === 0) return 0;
    const totalRating = evaluations.reduce((sum, eval) => sum + (eval.overallSatisfaction || 0), 0);
    return totalRating / evaluations.length;
  };

  const calculateRenewalRate = (evaluations: SponsorshipEvaluation[]) => {
    if (evaluations.length === 0) return 0;
    const willRenew = evaluations.filter(eval => eval.wouldRenew).length;
    return (willRenew / evaluations.length) * 100;
  };

  const averageRating = calculateAverageRating(filteredEvaluations);
  const renewalRate = calculateRenewalRate(filteredEvaluations);
  const totalEvaluations = filteredEvaluations.length;
  const avgNPS = filteredEvaluations.length > 0 
    ? filteredEvaluations.reduce((sum, eval) => sum + (eval.recommendationScore || 0), 0) / filteredEvaluations.length 
    : 0;

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluaciones de Patrocinio</h1>
          <p className="text-gray-600">Analiza la satisfacción de los patrocinadores</p>
        </div>
        <Dialog open={showNewEvaluationDialog} onOpenChange={setShowNewEvaluationDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Evaluación</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Star className="w-16 h-16 mx-auto text-[#00a587] mb-4" />
              <p className="text-gray-600">
                Funcionalidad de evaluaciones en desarrollo
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filtrar por patrocinador:</label>
        <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los patrocinadores</SelectItem>
            {sponsors?.map((sponsor: any) => (
              <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                {sponsor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Evaluaciones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvaluations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calificación Promedio</p>
                <p className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                  {averageRating.toFixed(1)}/10
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Renovación</p>
                <p className="text-2xl font-bold text-green-600">{renewalRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPS Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{avgNPS.toFixed(1)}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Evaluaciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredEvaluations.map((evaluation: SponsorshipEvaluation) => {
              const sponsor = sponsors?.find((s: any) => s.id === evaluation.sponsorId);
              
              return (
                <div key={evaluation.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg text-gray-900">
                        {sponsor?.name || 'Patrocinador Desconocido'}
                      </h4>
                      <Badge variant="outline">
                        {format(new Date(evaluation.evaluationDate), 'dd/MM/yyyy', { locale: es })}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getRatingStars(evaluation.overallSatisfaction || 0)}
                      </div>
                      <span className={`font-bold ${getRatingColor(evaluation.overallSatisfaction || 0)}`}>
                        {evaluation.overallSatisfaction}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Valor por dinero</p>
                      <p className="font-bold text-lg">{evaluation.valueForMoney}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Organización</p>
                      <p className="font-bold text-lg">{evaluation.organizationQuality}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Audiencia</p>
                      <p className="font-bold text-lg">{evaluation.audienceQuality}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Comunicación</p>
                      <p className="font-bold text-lg">{evaluation.communicationRating}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Logística</p>
                      <p className="font-bold text-lg">{evaluation.logisticsRating}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">NPS</p>
                      <p className="font-bold text-lg">{evaluation.recommendationScore}/10</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Comentarios</p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                        {evaluation.feedback || 'Sin comentarios'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Sugerencias de mejora</p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                        {evaluation.improvements || 'Sin sugerencias'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className={`w-4 h-4 ${evaluation.wouldRenew ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${evaluation.wouldRenew ? 'text-green-600' : 'text-gray-600'}`}>
                        {evaluation.wouldRenew ? 'Renovaría el patrocinio' : 'No renovaría'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Evaluado el {format(new Date(evaluation.evaluationDate), 'dd MMMM yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredEvaluations.length === 0 && (
            <div className="text-center py-8">
              <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay evaluaciones disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedSponsor !== 'all' 
                  ? 'Este patrocinador no tiene evaluaciones registradas'
                  : 'Crea la primera evaluación de patrocinio'
                }
              </p>
              <Button 
                onClick={() => setShowNewEvaluationDialog(true)}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Evaluación
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default EvaluationsPage;