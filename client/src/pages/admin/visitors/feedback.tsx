import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  Search
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
  const [editForm, setEditForm] = useState({
    status: '',
    adminNotes: '',
    tags: [] as string[]
  });

  // Fetch feedback data
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['/api/feedback', { 
      search: searchQuery, 
      park: parkFilter, 
      formType: formTypeFilter,
      status: statusFilter 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (parkFilter !== 'all') params.append('park', parkFilter);
      if (formTypeFilter !== 'all') params.append('formType', formTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar retroalimentación');
      return response.json();
    },
  });

  // Fetch parks for filter
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) throw new Error('Error al cargar parques');
      const result = await response.json();
      return result.data || result;
    },
  });

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

  const feedback = feedbackData?.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Retroalimentación de Parques</h1>
        <p className="text-gray-600 mt-1">
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
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
      <div className="grid gap-4">
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
        ) : (
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
        )}
      </div>

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
  );
}

export default FeedbackManagement;