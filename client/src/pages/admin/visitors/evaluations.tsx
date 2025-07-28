import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Star, CheckCircle, XCircle, Clock, Trash2, Grid3X3, List, Eye, Download, Upload, ChevronLeft, ChevronRight, Shield, Wrench, MapPin, Calendar, Users, Leaf } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  onViewDetails,
  isSelected, 
  onSelectToggle 
}: { 
  evaluation: ParkEvaluation;
  onDelete: (id: number) => void;
  onViewDetails: (evaluation: ParkEvaluation) => void;
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(evaluation.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EvaluationTableRow = ({ 
  evaluation, 
  onDelete, 
  onViewDetails,
  isSelected, 
  onSelectToggle 
}: { 
  evaluation: ParkEvaluation;
  onDelete: (id: number) => void;
  onViewDetails: (evaluation: ParkEvaluation) => void;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
}) => (
  <tr className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
    <td className="p-3">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelectToggle(evaluation.id)}
      />
    </td>
    <td className="p-3">
      <div className="font-medium">{evaluation.park_name}</div>
      <div className="text-sm text-gray-600">{evaluation.evaluator_name}</div>
    </td>
    <td className="p-3">
      <StarRating rating={evaluation.overall_rating} />
    </td>
    <td className="p-3">
      <EvaluationStatus status={evaluation.status} />
    </td>
    <td className="p-3 text-sm text-gray-600">
      {new Date(evaluation.created_at).toLocaleDateString()}
    </td>
    <td className="p-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(evaluation)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(evaluation.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </td>
  </tr>
);

export default function EvaluationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPark, setSelectedPark] = useState('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<ParkEvaluation | null>(null);
  const pageSize = 10;

  // Fetch evaluations with pagination and filters
  const { data: evaluationsData, isLoading } = useQuery({
    queryKey: ['/api/park-evaluations', currentPage, searchTerm, selectedStatus, selectedPark],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });
      
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedPark !== 'all') params.append('parkId', selectedPark);
      
      const response = await fetch(`/api/park-evaluations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      return response.json();
    },
    suspense: false,
    retry: 1
  });

  // Fetch parks for filter
  const { data: parksData } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) throw new Error('Failed to fetch parks');
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
    mutationFn: (ids: number[]) => apiRequest('/api/park-evaluations/bulk/delete', { 
      method: 'DELETE', 
      data: { evaluationIds: ids } 
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

  // Export functions
  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/park-evaluations/export-all');
      if (!response.ok) throw new Error('Failed to export');
      
      const data = await response.json();
      const csv = generateCSV(data.evaluations);
      downloadFile(csv, `evaluaciones_parques_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      
      toast({ title: "CSV exportado correctamente", description: `${data.evaluations.length} evaluaciones exportadas` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const generateCSV = (data: ParkEvaluation[]) => {
    const headers = ['ID', 'Parque', 'Evaluador', 'Email', 'Ciudad', 'Edad', 'Calificación General', 'Limpieza', 'Seguridad', 'Mantenimiento', 'Accesibilidad', 'Amenidades', 'Actividades', 'Personal', 'Belleza Natural', 'Comentarios', 'Recomendaría', 'Estado', 'Fecha'];
    const csvContent = [
      '\uFEFF' + headers.join(','),
      ...data.map(row => [
        row.id,
        `"${row.park_name}"`,
        `"${row.evaluator_name}"`,
        `"${row.evaluator_email}"`,
        `"${row.evaluator_city}"`,
        row.evaluator_age,
        row.overall_rating,
        row.cleanliness,
        row.safety,
        row.maintenance,
        row.accessibility,
        row.amenities,
        row.activities,
        row.staff,
        row.natural_beauty,
        `"${row.comments?.replace(/"/g, '""') || ''}"`,
        row.would_recommend ? 'Sí' : 'No',
        row.status === 'pending' ? 'Pendiente' : row.status === 'approved' ? 'Aprobada' : 'Rechazada',
        new Date(row.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/park-evaluations/import-csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error importing CSV file');
      }

      const result = await response.json();
      toast({ 
        title: "CSV importado correctamente", 
        description: `${result.imported} evaluaciones importadas, ${result.skipped || 0} omitidas` 
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/park-evaluations'] });
      
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === evaluations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(evaluations.map(e => e.id));
    }
  };

  const handleSelectToggle = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (evaluation: ParkEvaluation) => {
    setSelectedEvaluation(evaluation);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPark]);

  const evaluations = evaluationsData?.evaluations || [];
  const totalEvaluations = evaluationsData?.pagination?.total || 0;
  const totalPages = evaluationsData?.pagination?.totalPages || 1;
  const parks = parksData?.data || parksData || [];

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

          {/* Filters and Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Buscar evaluaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPark} onValueChange={setSelectedPark}>
                <SelectTrigger>
                  <SelectValue placeholder="Parque" />
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                  id="csv-import"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('csv-import')?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Importar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalEvaluations)} de {totalEvaluations} registros
              </div>
              <div className="flex items-center gap-4">
                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBulkEvaluations.mutate(selectedItems)}
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
                      Limpiar
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

          {/* Content */}
          {viewMode === 'grid' ? (
            <div className="space-y-4">
              {evaluations.map((evaluation: ParkEvaluation) => (
                <EvaluationCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  onDelete={(id) => deleteEvaluation.mutate(id)}
                  onViewDetails={handleViewDetails}
                  isSelected={selectedItems.includes(evaluation.id)}
                  onSelectToggle={handleSelectToggle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <Checkbox
                        checked={selectedItems.length === evaluations.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Parque / Evaluador</th>
                    <th className="p-3 text-left">Calificación</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation: ParkEvaluation) => (
                    <EvaluationTableRow
                      key={evaluation.id}
                      evaluation={evaluation}
                      onDelete={(id) => deleteEvaluation.mutate(id)}
                      onViewDetails={handleViewDetails}
                      isSelected={selectedItems.includes(evaluation.id)}
                      onSelectToggle={handleSelectToggle}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {evaluations.length === 0 && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay evaluaciones disponibles</p>
            </div>
          )}

          {/* Detail Modal */}
          {selectedEvaluation && (
            <EvaluationDetailModal
              evaluation={selectedEvaluation}
              onClose={() => setSelectedEvaluation(null)}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const EvaluationDetailModal = ({ 
  evaluation, 
  onClose 
}: { 
  evaluation: ParkEvaluation;
  onClose: () => void;
}) => (
  <Dialog open={true} onOpenChange={() => onClose()}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Detalles de Evaluación - {evaluation.park_name}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Evaluator Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Información del Evaluador
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {evaluation.evaluator_name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {evaluation.evaluator_email}
            </div>
            <div>
              <span className="font-medium">Ciudad:</span> {evaluation.evaluator_city}
            </div>
            <div>
              <span className="font-medium">Edad:</span> {evaluation.evaluator_age} años
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Calificación General
          </h3>
          <div className="flex items-center gap-2">
            <StarRating rating={evaluation.overall_rating} />
            <span className="text-lg font-bold text-blue-600">
              {evaluation.overall_rating}/5
            </span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Calificaciones Detalladas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Limpieza:
              </span>
              <StarRating rating={evaluation.cleanliness} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Seguridad:
              </span>
              <StarRating rating={evaluation.safety} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-600" />
                Mantenimiento:
              </span>
              <StarRating rating={evaluation.maintenance} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                Accesibilidad:
              </span>
              <StarRating rating={evaluation.accessibility} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" />
                Amenidades:
              </span>
              <StarRating rating={evaluation.amenities} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Actividades:
              </span>
              <StarRating rating={evaluation.activities} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                Personal:
              </span>
              <StarRating rating={evaluation.staff} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-700" />
                Belleza Natural:
              </span>
              <StarRating rating={evaluation.natural_beauty} />
            </div>
          </div>
        </div>

        {/* Comments */}
        {evaluation.comments && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Comentarios</h3>
            <p className="text-gray-700 italic">"{evaluation.comments}"</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Información Adicional</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Recomendaría:</span>
              <Badge variant={evaluation.would_recommend ? "default" : "secondary"}>
                {evaluation.would_recommend ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <EvaluationStatus status={evaluation.status} />
            </div>
            <div>
              <span className="font-medium">Fecha:</span> {new Date(evaluation.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Hora:</span> {new Date(evaluation.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
