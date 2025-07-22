import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  MessageSquare,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Filter,
  Search,
  Download,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface ParkFeedback {
  id: number;
  parkId: number;
  parkName: string;
  formType: 'share' | 'report_problem' | 'suggest_improvement' | 'propose_event';
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  category?: string;
  priority?: string;
  eventType?: string;
  suggestedDate?: string;
  expectedAttendance?: number;
  socialMedia?: string;
  status: 'pending' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
  tags: string[];
  adminNotes?: string;
  assignedTo?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_form_type: {
    share: number;
    report_problem: number;
    suggest_improvement: number;
    propose_event: number;
  };
}

function FeedbackManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<ParkFeedback | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [parkFilter, setParkFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [editForm, setEditForm] = useState({
    status: '',
    adminNotes: '',
    tags: [] as string[]
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, parkFilter, formTypeFilter, statusFilter]);

  // Fetch feedback data with pagination
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['/api/feedback', { 
      search: searchQuery, 
      park: parkFilter, 
      formType: formTypeFilter,
      status: statusFilter,
      page: currentPage
    }],
    suspense: false,
    retry: 1,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (parkFilter !== 'all') params.append('park', parkFilter);
      if (formTypeFilter !== 'all') params.append('formType', formTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      
      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar retroalimentación');
      return response.json();
    },
  });

  // Fetch parks for filter
  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
    suspense: false,
    retry: 1
  });
  
  const parks = Array.isArray(parksResponse) ? parksResponse : parksResponse?.data || [];

  // Fetch feedback stats
  const { data: stats } = useQuery({
    queryKey: ['/api/feedback/stats'],
    queryFn: async () => {
      const response = await fetch('/api/feedback/stats');
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      return response.json();
    },
  });

  // Update feedback mutation
  const updateFeedbackMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; adminNotes?: string; tags?: string[] }) => {
      const response = await fetch(`/api/feedback/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar retroalimentación');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/stats'] });
      setIsEditModalOpen(false);
      toast({
        title: "Actualizado",
        description: "La retroalimentación ha sido actualizada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la retroalimentación",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (feedback: ParkFeedback) => {
    setSelectedFeedback(feedback);
    setEditForm({
      status: feedback.status,
      adminNotes: feedback.adminNotes || '',
      tags: feedback.tags || []
    });
    setIsEditModalOpen(true);
  };

  const handleView = (feedback: ParkFeedback) => {
    setSelectedFeedback(feedback);
    setIsViewModalOpen(true);
  };

  const handleUpdateFeedback = () => {
    if (!selectedFeedback) return;
    
    updateFeedbackMutation.mutate({
      id: selectedFeedback.id,
      status: editForm.status,
      adminNotes: editForm.adminNotes,
      tags: editForm.tags
    });
  };

  const getFormTypeIcon = (formType: string) => {
    switch (formType) {
      case 'share':
        return <MessageSquare className="h-4 w-4" />;
      case 'report_problem':
        return <AlertTriangle className="h-4 w-4" />;
      case 'suggest_improvement':
        return <Lightbulb className="h-4 w-4" />;
      case 'propose_event':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'share':
        return 'Compartir Parque';
      case 'report_problem':
        return 'Reportar Problema';
      case 'suggest_improvement':
        return 'Sugerir Mejora';
      case 'propose_event':
        return 'Proponer Evento';
      default:
        return formType;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      reviewed: 'secondary',
      in_progress: 'outline',
      resolved: 'secondary',
      closed: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendiente',
      reviewed: 'Revisado',
      in_progress: 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      urgent: 'destructive'
    } as const;

    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'default'} className="ml-2">
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const feedback = feedbackData?.feedback || [];
  const pagination = feedbackData?.pagination || null;
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  // Helper functions for Spanish translations
  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'pending': 'Pendiente',
      'reviewed': 'Revisado',
      'in_progress': 'En Progreso',
      'resolved': 'Resuelto',
      'closed': 'Cerrado'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getPriorityLabel = (priority?: string) => {
    if (!priority) return '';
    const priorityLabels = {
      'low': 'Baja',
      'medium': 'Media', 
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityLabels[priority as keyof typeof priorityLabels] || priority;
  };

  // Export function for CSV with professional header format
  const exportToCSV = () => {
    if (feedback.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay retroalimentación para exportar",
        variant: "destructive",
      });
      return;
    }

    // Professional CSV header with system branding
    const csvHeader = [
      'SISTEMA DE GESTIÓN DE PARQUES URBANOS',
      'Reporte de Retroalimentación Ciudadana',
      `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
      `Total de registros: ${feedback.length}`,
      '', // Empty line separator
    ];

    // Summary statistics
    const statusStats = feedback.reduce((acc, item) => {
      const status = getStatusLabel(item.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeStats = feedback.reduce((acc, item) => {
      const type = getFormTypeLabel(item.formType);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summarySection = [
      'RESUMEN ESTADÍSTICO',
      '',
      'Distribución por Estado:',
      ...Object.entries(statusStats).map(([status, count]) => `${status}: ${count}`),
      '',
      'Distribución por Tipo de Formulario:',
      ...Object.entries(typeStats).map(([type, count]) => `${type}: ${count}`),
      '',
      'DATOS DETALLADOS',
      ''
    ];

    const dataHeaders = [
      'ID', 'Parque', 'Tipo de Formulario', 'Nombre Completo', 'Email', 'Teléfono',
      'Asunto', 'Mensaje', 'Estado', 'Prioridad', 'Categoría', 'Fecha de Creación'
    ];

    const csvData = feedback.map(item => [
      item.id,
      item.parkName,
      getFormTypeLabel(item.formType),
      item.fullName,
      item.email,
      item.phone || 'N/A',
      item.subject || 'N/A',
      item.message.length > 100 ? item.message.substring(0, 100) + '...' : item.message,
      getStatusLabel(item.status),
      getPriorityLabel(item.priority) || 'N/A',
      item.category || 'N/A',
      format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
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
      link.setAttribute('download', `retroalimentacion_parques_profesional_${format(new Date(), 'dd-MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "CSV Profesional Exportado",
      description: "Reporte completo generado con encabezado corporativo y resumen estadístico",
    });
  };

  // Export function for Excel with professional formatting
  const exportToExcel = () => {
    if (feedback.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay retroalimentación para exportar",
        variant: "destructive",
      });
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data with proper headers
    const headers = [
      'ID', 'Parque', 'Tipo de Formulario', 'Nombre Completo', 'Email', 'Teléfono',
      'Asunto', 'Mensaje', 'Estado', 'Prioridad', 'Categoría', 'Fecha de Creación'
    ];

    const data = feedback.map(item => [
      item.id,
      item.parkName,
      getFormTypeLabel(item.formType),
      item.fullName,
      item.email,
      item.phone || 'N/A',
      item.subject || 'N/A',
      item.message.length > 100 ? item.message.substring(0, 100) + '...' : item.message,
      getStatusLabel(item.status),
      getPriorityLabel(item.priority) || 'N/A',
      item.category || 'N/A',
      format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      // Title row
      ['SISTEMA DE GESTIÓN DE PARQUES URBANOS'],
      ['Reporte de Retroalimentación Ciudadana'],
      [`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
      [''],
      // Headers
      headers,
      // Data
      ...data
    ]);

    // Set column widths
    const wscols = [
      { wch: 6 },  // ID
      { wch: 25 }, // Parque
      { wch: 20 }, // Tipo
      { wch: 25 }, // Nombre
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Asunto
      { wch: 50 }, // Mensaje
      { wch: 15 }, // Estado
      { wch: 12 }, // Prioridad
      { wch: 15 }, // Categoría
      { wch: 18 }  // Fecha
    ];
    ws['!cols'] = wscols;

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // Subtitle
      { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }  // Date
    ];

    // Style the header cells (starting at row 4, 0-indexed)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "00a587" } }, // Corporate green color
      alignment: { horizontal: "center" }
    };

    const titleStyle = {
      font: { bold: true, size: 16, color: { rgb: "00a587" } },
      alignment: { horizontal: "center" }
    };

    const subtitleStyle = {
      font: { bold: true, size: 14, color: { rgb: "067f5f" } },
      alignment: { horizontal: "center" }
    };

    // Apply styles to title rows
    ws['A1'] = { ...ws['A1'], s: titleStyle };
    ws['A2'] = { ...ws['A2'], s: subtitleStyle };
    ws['A3'] = { ...ws['A3'], s: { alignment: { horizontal: "center" } } };

    // Apply header styles (row 5, 0-indexed as row 4)
    for (let col = 0; col < headers.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 4, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
      }
    }

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Retroalimentación');

    // Add summary sheet
    const summaryData = [
      ['RESUMEN EJECUTIVO'],
      [''],
      ['Estadísticas Generales'],
      ['Total de registros:', feedback.length],
      ['Fecha del reporte:', format(new Date(), 'dd/MM/yyyy', { locale: es })],
      [''],
      ['Distribución por Estado'],
      ...Object.entries(
        feedback.reduce((acc, item) => {
          const status = getStatusLabel(item.status);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([status, count]) => [status, count]),
      [''],
      ['Distribución por Tipo de Formulario'],
      ...Object.entries(
        feedback.reduce((acc, item) => {
          const type = getFormTypeLabel(item.formType);
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => [type, count])
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 15 }];
    
    // Style summary sheet
    summaryWs['A1'] = { ...summaryWs['A1'], s: titleStyle };
    summaryWs['A3'] = { ...summaryWs['A3'], s: { font: { bold: true } } };
    summaryWs['A7'] = { ...summaryWs['A7'], s: { font: { bold: true } } };
    summaryWs['A11'] = { ...summaryWs['A11'], s: { font: { bold: true } } };

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

    // Write file
    const fileName = `retroalimentacion_parques_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Excel Exportado",
      description: "Reporte profesional generado con formato Excel y diseño corporativo",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-8 h-8" />
          Retroalimentación de Parques
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona la retroalimentación de los visitantes sobre los parques
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.general?.total || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.general?.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Progreso</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.general?.in_progress || 0}</p>
                </div>
                <Edit className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resueltos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.general?.resolved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {totalItems} registros total
          </Badge>
          {pagination && (
            <Badge variant="outline">
              Página {pagination.page} de {totalPages}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Export buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={feedback.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={feedback.length === 0}
              className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="park-filter">Parque</Label>
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los parques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parks?.map((park: any) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="form-type-filter">Tipo de Formulario</Label>
              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="share">Compartir Parque</SelectItem>
                  <SelectItem value="report_problem">Reportar Problema</SelectItem>
                  <SelectItem value="suggest_improvement">Sugerir Mejora</SelectItem>
                  <SelectItem value="propose_event">Proponer Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setParkFilter('all');
                  setFormTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className={viewMode === 'cards' ? 'grid gap-4' : 'space-y-4'}>
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay retroalimentación disponible
              </h3>
              <p className="text-gray-600">
                No se encontró retroalimentación con los filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          /* Cards View */
          feedback.map((item: ParkFeedback) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getFormTypeIcon(item.formType)}
                        <span className="font-medium text-gray-900">
                          {getFormTypeLabel(item.formType)}
                        </span>
                      </div>
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {item.fullName}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {item.email}
                        </div>
                        {item.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {item.phone}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {item.parkName}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(item.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { 
                            locale: es 
                          })}
                        </div>
                        {item.category && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Tag className="h-4 w-4 mr-2" />
                            {item.category}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.subject && (
                      <h3 className="font-medium text-gray-900 mb-2">{item.subject}</h3>
                    )}

                    <p className="text-gray-700 mb-4 line-clamp-3">{item.message}</p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Parque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {feedback.map((item: ParkFeedback) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getFormTypeIcon(item.formType)}
                            <span className="text-sm font-medium">
                              {getFormTypeLabel(item.formType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {item.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {item.parkName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                          {getPriorityBadge(item.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalItems)} de {totalItems} registros
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedFeedback && getFormTypeIcon(selectedFeedback.formType)}
              <span>
                {selectedFeedback && getFormTypeLabel(selectedFeedback.formType)}
              </span>
            </DialogTitle>
            <DialogDescription>
              Detalles completos de la retroalimentación
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedFeedback.status)}
                    {getPriorityBadge(selectedFeedback.priority)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Parque</Label>
                  <p className="mt-1">{selectedFeedback.parkName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                  <p className="mt-1">{selectedFeedback.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="mt-1">{selectedFeedback.email}</p>
                </div>
              </div>

              {selectedFeedback.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                  <p className="mt-1">{selectedFeedback.phone}</p>
                </div>
              )}

              {selectedFeedback.subject && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Asunto</Label>
                  <p className="mt-1">{selectedFeedback.subject}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Mensaje</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>

              {selectedFeedback.category && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoría</Label>
                  <p className="mt-1">{selectedFeedback.category}</p>
                </div>
              )}

              {selectedFeedback.eventType && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo de Evento</Label>
                    <p className="mt-1">{selectedFeedback.eventType}</p>
                  </div>
                  {selectedFeedback.expectedAttendance && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Asistencia Esperada</Label>
                      <p className="mt-1">{selectedFeedback.expectedAttendance} personas</p>
                    </div>
                  )}
                </div>
              )}

              {selectedFeedback.suggestedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha Sugerida</Label>
                  <p className="mt-1">
                    {format(new Date(selectedFeedback.suggestedDate), "dd 'de' MMMM, yyyy", { 
                      locale: es 
                    })}
                  </p>
                </div>
              )}

              {selectedFeedback.socialMedia && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Redes Sociales</Label>
                  <p className="mt-1">{selectedFeedback.socialMedia}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                <p className="mt-1">
                  {format(new Date(selectedFeedback.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { 
                    locale: es 
                  })}
                </p>
              </div>

              {selectedFeedback.tags && selectedFeedback.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Etiquetas</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeedback.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeedback.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notas Administrativas</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedFeedback.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Retroalimentación</DialogTitle>
            <DialogDescription>
              Actualiza el estado y agrega notas administrativas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={editForm.status} onValueChange={(value) => 
                setEditForm(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="admin-notes">Notas Administrativas</Label>
              <Textarea
                id="admin-notes"
                placeholder="Agrega notas sobre esta retroalimentación..."
                value={editForm.adminNotes}
                onChange={(e) => 
                  setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateFeedback}
              disabled={updateFeedbackMutation.isPending}
            >
              {updateFeedbackMutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

export default FeedbackManagement;