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
import { Star, Eye, CheckCircle, XCircle, Clock, Filter, Users, BarChart3, MessageSquare, MessageCircle, TrendingUp, Calendar, Award, Grid, List, Download, Upload, ChevronLeft, ChevronRight, MapPin, Shield, Wrench, Leaf, Sparkles, Accessibility, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
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

const EvaluationCard = ({ evaluation, onModerate, onViewDetails }: { evaluation: ParkEvaluation, onModerate: (id: number, status: string, notes?: string) => void, onViewDetails: (evaluation: ParkEvaluation) => void }) => {
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
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Comentarios:</p>
            <p className="text-sm text-gray-600 italic">"{evaluation.comments}"</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📍 {evaluation.evaluator_city}</span>
            <span>👤 {evaluation.evaluator_age} años</span>
            {evaluation.would_recommend && <span className="text-green-600">✓ Recomendado</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(evaluation)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver detalles
            </Button>
            
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

const EvaluationDetailModal = ({ evaluation, onClose }: { evaluation: ParkEvaluation; onClose: () => void }) => {
  const criteriaConfig = [
    { key: 'cleanliness', label: 'Limpieza', icon: Sparkles, color: 'text-blue-600' },
    { key: 'safety', label: 'Seguridad', icon: Shield, color: 'text-green-600' },
    { key: 'maintenance', label: 'Mantenimiento', icon: Wrench, color: 'text-orange-600' },
    { key: 'accessibility', label: 'Accesibilidad', icon: Accessibility, color: 'text-purple-600' },
    { key: 'amenities', label: 'Amenidades', icon: MapPin, color: 'text-red-600' },
    { key: 'activities', label: 'Actividades', icon: Calendar, color: 'text-indigo-600' },
    { key: 'staff', label: 'Personal', icon: Users, color: 'text-teal-600' },
    { key: 'natural_beauty', label: 'Belleza Natural', icon: Leaf, color: 'text-green-500' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalle de Evaluación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información del evaluador */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg mb-2">Información del Evaluador</h3>
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {evaluation.evaluator_name}</p>
                <p><strong>Email:</strong> {evaluation.evaluator_email}</p>
                <p><strong>Ciudad:</strong> {evaluation.evaluator_city}</p>
                <p><strong>Edad:</strong> {evaluation.evaluator_age} años</p>
                <p><strong>Visitante frecuente:</strong> {evaluation.is_frequent_visitor ? 'Sí' : 'No'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Información de la Visita</h3>
              <div className="space-y-2">
                <p><strong>Parque:</strong> {evaluation.park_name}</p>
                <p><strong>Fecha:</strong> {new Date(evaluation.visit_date).toLocaleDateString()}</p>
                <p><strong>Propósito:</strong> {evaluation.visit_purpose}</p>
                <p><strong>Duración:</strong> {evaluation.visit_duration} minutos</p>
                <p><strong>Recomendaría:</strong> {evaluation.would_recommend ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Criterios de evaluación */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Criterios de Evaluación</h3>
            <div className="grid grid-cols-2 gap-4">
              {criteriaConfig.map((criteria) => {
                const IconComponent = criteria.icon;
                const value = evaluation[criteria.key as keyof ParkEvaluation] as number;
                
                return (
                  <div key={criteria.key} className="flex items-center gap-3 p-3 border rounded-lg">
                    <IconComponent className={`h-5 w-5 ${criteria.color}`} />
                    <div className="flex-1">
                      <div className="font-medium">{criteria.label}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={value} />
                        <span className="text-sm text-gray-600">{value}/5</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calificación general */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Calificación General
            </h3>
            <div className="flex items-center gap-3">
              <StarRating rating={evaluation.overall_rating} />
              <span className="text-xl font-bold">{evaluation.overall_rating}/5</span>
            </div>
          </div>

          {/* Comentarios y sugerencias */}
          <div className="space-y-4">
            {evaluation.comments && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Comentarios</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">"{evaluation.comments}"</p>
              </div>
            )}
            
            {evaluation.suggestions && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Sugerencias</h3>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{evaluation.suggestions}</p>
              </div>
            )}
          </div>

          {/* Estado de moderación */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Estado de Moderación</h3>
            <div className="flex items-center gap-2">
              <EvaluationStatus status={evaluation.status} />
              <span className="text-sm text-gray-600">
                Evaluado el {new Date(evaluation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function EvaluationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPark, setSelectedPark] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluationsViewMode, setEvaluationsViewMode] = useState<'grid' | 'list'>('grid');
  const [summaryViewMode, setSummaryViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCurrentPage, setSummaryCurrentPage] = useState(1);
  const [selectedEvaluation, setSelectedEvaluation] = useState<ParkEvaluation | null>(null);
  const pageSize = 10;

  // Inicializar tabla si es necesario
  useEffect(() => {
    apiRequest('/api/park-evaluations/init', { method: 'POST' }).catch(() => {});
  }, []);

  // Obtener evaluaciones usando fetch directo
  const { data: evaluationsData, isLoading, error: evaluationsError } = useQuery({
    queryKey: ['/api/park-evaluations', selectedStatus, selectedPark, searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });
      
      // Solo agregar filtros si no son 'all'
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (selectedPark && selectedPark !== 'all') {
        params.append('parkId', selectedPark);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      const response = await fetch(`/api/park-evaluations?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }
      const data = await response.json();
      return data;
    },
    suspense: false,
    retry: 1
  });

  // Obtener resumen de parques usando fetch directo
  const { data: summaryData, error: summaryError } = useQuery({
    queryKey: ['/api/park-evaluations/summary'],
    queryFn: async () => {
      const response = await fetch('/api/park-evaluations/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      const data = await response.json();
      return data;
    },
  });

  // Obtener lista de parques para filtros usando fetch directo
  const { data: parksData, error: parksError } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Failed to fetch parks');
      }
      const data = await response.json();
      return data;
    },
    suspense: false,
    retry: 1
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

  const handleModerate = (id: number, status: string, notes?: string) => {
    moderateEvaluation.mutate({ id, status, notes });
  };

  const evaluations = evaluationsData?.evaluations || [];
  const parkSummary = summaryData?.parks || [];
  // Manejar diferentes formatos de respuesta de parques
  const parks = parksData?.data || parksData?.parks || parksData || [];
  
  // Usar datos de paginación del servidor
  const totalEvaluations = evaluationsData?.pagination?.total || 0;
  const totalPages = evaluationsData?.pagination?.pages || 1;
  const currentServerPage = evaluationsData?.pagination?.page || 1;

  // Helper functions for status and rating labels
  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pendiente',
      approved: 'Aprobada', 
      rejected: 'Rechazada'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getVisitPurposeLabel = (purpose: string) => {
    const purposeLabels = {
      recreation: 'Recreación',
      exercise: 'Ejercicio',
      family: 'Familiar',
      nature: 'Contacto con Naturaleza',
      social: 'Social',
      other: 'Otro'
    };
    return purposeLabels[purpose as keyof typeof purposeLabels] || purpose;
  };

  // Export function for CSV with professional header format
  const exportToCSV = async () => {
    try {
      // Fetch filtered evaluations for export
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '10000', // Large number to get all filtered results
        search: searchTerm,
        status: selectedStatus,
        park: selectedPark
      });
      
      const response = await fetch(`/api/park-evaluations?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered evaluations');
      }
      const data = await response.json();
      const allEvaluations = data.evaluations;
      
      if (allEvaluations.length === 0) {
        toast({
          title: "No hay datos",
          description: "No hay evaluaciones para exportar",
          variant: "destructive",
        });
        return;
      }

      // Professional CSV header with system branding
      const csvHeader = [
        'SISTEMA DE GESTIÓN DE PARQUES URBANOS',
        'Reporte de Evaluaciones Ciudadanas',
        `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
        `Total de registros: ${allEvaluations.length}`,
        '', // Empty line separator
      ];

      // Summary statistics
      const statusStats = allEvaluations.reduce((acc, item) => {
        const status = getStatusLabel(item.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgRating = allEvaluations.reduce((sum, item) => sum + item.overall_rating, 0) / allEvaluations.length;

      const summarySection = [
        'RESUMEN ESTADÍSTICO',
        '',
        'Distribución por Estado:',
        ...Object.entries(statusStats).map(([status, count]) => `${status}: ${count}`),
        '',
        `Calificación Promedio General: ${avgRating.toFixed(1)}/5`,
        `Total de Parques Evaluados: ${new Set(allEvaluations.map(e => e.park_id)).size}`,
        '',
        'DATOS DETALLADOS',
        ''
      ];

      const dataHeaders = [
        'ID', 'Parque', 'Evaluador', 'Email', 'Ciudad', 'Edad', 
        'Limpieza', 'Seguridad', 'Mantenimiento', 'Accesibilidad', 
        'Amenidades', 'Actividades', 'Personal', 'Belleza Natural', 
        'Calificación General', 'Comentarios', 'Recomendaría', 
        'Propósito Visita', 'Duración (min)', 'Estado', 'Fecha Creación'
      ];

      const csvData = allEvaluations.map(item => [
      item.id,
      item.park_name,
      item.evaluator_name,
      item.evaluator_email,
      item.evaluator_city || 'N/A',
      item.evaluator_age || 'N/A',
      item.cleanliness,
      item.safety,
      item.maintenance,
      item.accessibility,
      item.amenities,
      item.activities,
      item.staff,
      item.natural_beauty,
      item.overall_rating,
      item.comments && item.comments.length > 100 ? item.comments.substring(0, 100) + '...' : (item.comments || 'Sin comentarios'),
      item.would_recommend ? 'Sí' : 'No',
      getVisitPurposeLabel(item.visit_purpose),
      item.visit_duration || 'N/A',
      getStatusLabel(item.status),
      format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
    ]);

      // Combine all sections
      const allRows = [
        ...csvHeader.map(line => [line]), // Single column for header
        ...summarySection.map(line => [line]), // Single column for summary
        dataHeaders, // Multi-column for data headers
        ...csvData // Multi-column for data
      ];

      // Create CSV content with BOM for proper UTF-8 encoding
      const BOM = '\uFEFF';
      const csvContent = BOM + allRows
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `evaluaciones_parques_profesional_${format(new Date(), 'dd-MM-yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "CSV Exportado",
        description: `Reporte con ${allEvaluations.length} evaluaciones filtradas generado`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo CSV",
        variant: "destructive",
      });
    }
  };

  // Export function for Excel with corporate styling
  const exportToExcel = async () => {
    try {
      // Fetch filtered evaluations for export
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '10000', // Large number to get all filtered results
        search: searchTerm,
        status: selectedStatus,
        park: selectedPark
      });
      
      const response = await fetch(`/api/park-evaluations?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered evaluations');
      }
      const data = await response.json();
      const allEvaluations = data.evaluations;
      
      if (allEvaluations.length === 0) {
        toast({
          title: "No hay datos",
          description: "No hay evaluaciones para exportar",
          variant: "destructive",
        });
        return;
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare main data
      const dataHeaders = [
        'ID', 'Parque', 'Evaluador', 'Email', 'Ciudad', 'Edad', 
        'Limpieza', 'Seguridad', 'Mantenimiento', 'Accesibilidad', 
        'Amenidades', 'Actividades', 'Personal', 'Belleza Natural', 
        'Calificación General', 'Comentarios', 'Recomendaría', 
        'Propósito Visita', 'Duración (min)', 'Estado', 'Fecha Creación'
      ];

      const excelData = allEvaluations.map(item => [
      item.id,
      item.park_name,
      item.evaluator_name,
      item.evaluator_email,
      item.evaluator_city || 'N/A',
      item.evaluator_age || 'N/A',
      item.cleanliness,
      item.safety,
      item.maintenance,
      item.accessibility,
      item.amenities,
      item.activities,
      item.staff,
      item.natural_beauty,
      item.overall_rating,
      item.comments && item.comments.length > 100 ? item.comments.substring(0, 100) + '...' : (item.comments || 'Sin comentarios'),
      item.would_recommend ? 'Sí' : 'No',
      getVisitPurposeLabel(item.visit_purpose),
      item.visit_duration || 'N/A',
      getStatusLabel(item.status),
      format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
    ]);

      // Create main data sheet
      const mainSheet = XLSX.utils.aoa_to_sheet([
        ['SISTEMA DE GESTIÓN DE PARQUES URBANOS'],
        ['Reporte de Evaluaciones Ciudadanas'],
        [`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
        [`Total de registros: ${allEvaluations.length}`],
      [], // Empty row
      dataHeaders,
      ...excelData
    ]);

      // Statistics summary
      const statusStats = allEvaluations.reduce((acc, item) => {
        const status = getStatusLabel(item.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgRating = allEvaluations.reduce((sum, item) => sum + item.overall_rating, 0) / allEvaluations.length;
      const avgCriteria = {
        cleanliness: allEvaluations.reduce((sum, item) => sum + item.cleanliness, 0) / allEvaluations.length,
        safety: allEvaluations.reduce((sum, item) => sum + item.safety, 0) / allEvaluations.length,
        maintenance: allEvaluations.reduce((sum, item) => sum + item.maintenance, 0) / allEvaluations.length,
        accessibility: allEvaluations.reduce((sum, item) => sum + item.accessibility, 0) / allEvaluations.length,
        amenities: allEvaluations.reduce((sum, item) => sum + item.amenities, 0) / allEvaluations.length,
      };

      const summaryData = [
        ['SISTEMA DE GESTIÓN DE PARQUES URBANOS'],
        ['RESUMEN EJECUTIVO DE EVALUACIONES'],
        [`Fecha: ${format(new Date(), 'dd/MM/yyyy', { locale: es })}`],
        [],
        ['MÉTRICAS GENERALES'],
        ['Total de Evaluaciones', allEvaluations.length],
        ['Calificación Promedio General', `${avgRating.toFixed(1)}/5`],
        ['Total de Parques Evaluados', new Set(allEvaluations.map(e => e.park_id)).size],
        ['Tasa de Recomendación', `${(allEvaluations.filter(e => e.would_recommend).length / allEvaluations.length * 100).toFixed(1)}%`],
      [],
      ['DISTRIBUCIÓN POR ESTADO'],
      ...Object.entries(statusStats).map(([status, count]) => [status, count]),
      [],
      ['PROMEDIOS POR CRITERIO'],
      ['Limpieza', avgCriteria.cleanliness.toFixed(1)],
      ['Seguridad', avgCriteria.safety.toFixed(1)],
      ['Mantenimiento', avgCriteria.maintenance.toFixed(1)],
      ['Accesibilidad', avgCriteria.accessibility.toFixed(1)],
      ['Amenidades', avgCriteria.amenities.toFixed(1)],
    ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, mainSheet, 'Datos Completos');
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen Ejecutivo');

      // Auto-size columns for both sheets
      const maxWidth = 50;
      [mainSheet, summarySheet].forEach(sheet => {
        const cols = [];
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        for (let col = range.s.c; col <= range.e.c; col++) {
          let maxLen = 10;
          for (let row = range.s.r; row <= range.e.r; row++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
            if (cell && cell.v) {
              const len = String(cell.v).length;
              maxLen = Math.max(maxLen, Math.min(len, maxWidth));
            }
          }
          cols.push({ width: maxLen });
        }
        sheet['!cols'] = cols;
      });

      // Export file
      XLSX.writeFile(wb, `evaluaciones_parques_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

      toast({
        title: "Excel Exportado",
        description: `Reporte con ${allEvaluations.length} evaluaciones filtradas en 2 hojas`,
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  };


  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPark, searchTerm]);

  useEffect(() => {
    setSummaryCurrentPage(1);
  }, [searchTerm]);

  // Para el resumen, mantener filtrado local
  const filteredParkSummary = parkSummary.filter((park: ParkSummary) => {
    const matchesSearch = searchTerm === '' || 
      park.park_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación del resumen (local)
  const totalSummaryItems = filteredParkSummary.length;
  const totalSummaryPages = Math.ceil(totalSummaryItems / pageSize);
  const summaryStartIndex = (summaryCurrentPage - 1) * pageSize;
  const paginatedSummary = filteredParkSummary.slice(summaryStartIndex, summaryStartIndex + pageSize);
  
  // Para evaluaciones, usar directamente los datos del servidor (ya paginados)
  const paginatedEvaluations = evaluations;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Evaluaciones de Parques</h1>
              <p className="text-gray-600 mt-2">Gestiona las evaluaciones ciudadanas de los parques</p>
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

            <TabsContent value="evaluations" className="space-y-6">
              {/* Filters and Controls */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {totalEvaluations} registros total
                    </div>
                    <div className="flex items-center gap-4">
                      {/* View mode toggles */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={evaluationsViewMode === 'grid' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEvaluationsViewMode('grid')}
                          className={evaluationsViewMode === 'grid' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={evaluationsViewMode === 'list' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEvaluationsViewMode('list')}
                          className={evaluationsViewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Export buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToCSV}
                          disabled={evaluations.length === 0}
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>CSV</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToExcel}
                          disabled={evaluations.length === 0}
                          className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Excel</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Buscar</Label>
                      <Input
                        id="search"
                        placeholder="Buscar evaluador, parque o ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="approved">Aprobadas</SelectItem>
                          <SelectItem value="rejected">Rechazadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="park-filter">Parque</Label>
                      <Select value={selectedPark} onValueChange={setSelectedPark}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos los parques" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los parques</SelectItem>
                          {parks && Array.isArray(parks) && parks.map((park: any) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                          setSelectedPark('all');
                          setCurrentPage(1);
                        }}
                        className="w-full"
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando evaluaciones...</p>
                  </div>
                ) : paginatedEvaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay evaluaciones disponibles</p>
                    <p className="text-gray-500 mt-2">
                      {searchTerm || selectedStatus !== 'all' || selectedPark !== 'all'
                        ? 'Intenta ajustar los filtros para ver más resultados.'
                        : 'Las evaluaciones ciudadanas aparecerán aquí cuando se registren.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {evaluationsViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {paginatedEvaluations.map((evaluation: ParkEvaluation) => (
                          <EvaluationCard
                            key={evaluation.id}
                            evaluation={evaluation}
                            onModerate={handleModerate}
                            onViewDetails={setSelectedEvaluation}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paginatedEvaluations.map((evaluation: ParkEvaluation) => (
                          <Card key={evaluation.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="font-medium">{evaluation.evaluator_name}</div>
                                  <div className="text-sm text-gray-600">{evaluation.park_name}</div>
                                </div>
                                <StarRating rating={evaluation.overall_rating} />
                                <EvaluationStatus status={evaluation.status} />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(evaluation.created_at).toLocaleDateString()}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedEvaluation(evaluation)}
                                  className="text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {evaluation.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-green-50 hover:bg-green-100 text-green-700"
                                      onClick={() => handleModerate(evaluation.id, 'approved')}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-red-50 hover:bg-red-100 text-red-700"
                                      onClick={() => handleModerate(evaluation.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500">
                          Página {currentPage} de {totalPages} - Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalEvaluations)} de {totalEvaluations} evaluaciones
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
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                              .map((page, index, array) => (
                                <div key={`page-${page}`} className="flex items-center gap-1">
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="text-gray-500">...</span>
                                  )}
                                  <Button
                                    variant={page === currentPage ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={page === currentPage ? 'bg-green-600 hover:bg-green-700' : ''}
                                  >
                                    {page}
                                  </Button>
                                </div>
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
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Resumen por Parque</h2>
                {parkSummary.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay datos de resumen disponibles</p>
                    <p className="text-gray-500 mt-2">Los resúmenes aparecerán cuando haya evaluaciones registradas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parkSummary.map((park: ParkSummary) => (
                      <ParkSummaryCard key={park.park_id} park={park} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Estadísticas Generales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{evaluations.length}</div>
                        <div className="text-sm text-gray-600">Total Evaluaciones</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {evaluations.filter(e => e.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-600">Aprobadas</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {evaluations.filter(e => e.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pendientes</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de detalles */}
      {selectedEvaluation && (
        <EvaluationDetailModal
          evaluation={selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
        />
      )}
    </AdminLayout>
  );
}