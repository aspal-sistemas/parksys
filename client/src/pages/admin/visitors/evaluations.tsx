import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Star, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ))}
    <span className="text-sm text-gray-600 ml-1">({rating})</span>
  </div>
);

const EvaluationCard = ({ 
  evaluation, 
  onDelete, 
  isSelected, 
  onSelectToggle 
}: { 
  evaluation: ParkEvaluation;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
}) => (
  <Card className={`mb-4 ${isSelected ? 'border-2 border-blue-500 bg-blue-50' : ''}`}>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectToggle(evaluation.id)}
          />
          <div>
            <CardTitle className="text-lg">{evaluation.park_name}</CardTitle>
            <p className="text-sm text-gray-600">
              Por {evaluation.evaluator_name} • {new Date(evaluation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={evaluation.overall_rating} />
          <EvaluationStatus status={evaluation.status} />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{evaluation.comments}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(evaluation.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function EvaluationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ['/api/park-evaluations'],
    queryFn: async () => {
      const response = await fetch('/api/park-evaluations?page=1&limit=50');
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      return response.json();
    },
    suspense: false,
    retry: 1
  });

  const deleteEvaluation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/park-evaluations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Evaluación eliminada correctamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/park-evaluations'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteBulkEvaluations = useMutation({
    mutationFn: (ids: number[]) => apiRequest('/api/park-evaluations/bulk-delete', { 
      method: 'DELETE', 
      data: { ids } 
    }),
    onSuccess: () => {
      toast({ title: "Evaluaciones eliminadas correctamente" });
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['/api/park-evaluations'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSelectAll = () => {
    if (selectedItems.length === evaluations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(evaluations.map(e => e.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      deleteBulkEvaluations.mutate(selectedItems);
    }
  };

  const handleSelectToggle = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const evaluations = evaluationsData?.evaluations || [];
  const totalEvaluations = evaluationsData?.pagination?.total || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card className="p-4 bg-gray-50 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
            </div>
          </Card>
          <div className="text-center py-8">Cargando evaluaciones...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <Card className="p-4 bg-gray-50 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
            </div>
          </Card>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {totalEvaluations} registros total
              </div>
              <div className="flex items-center gap-4">
                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="text-red-600 hover:bg-red-50"
                      disabled={deleteBulkEvaluations.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar ({selectedItems.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      Limpiar selección
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === evaluations.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {evaluations.map((evaluation: ParkEvaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onDelete={(id) => deleteEvaluation.mutate(id)}
                isSelected={selectedItems.includes(evaluation.id)}
                onSelectToggle={handleSelectToggle}
              />
            ))}
          </div>

          {evaluations.length === 0 && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay evaluaciones disponibles</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
