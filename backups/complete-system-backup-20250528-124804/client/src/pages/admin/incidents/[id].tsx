import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock6,
  Send,
  UserPlus,
  PenTool,
  Eye
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Componente para la página de detalles de incidencia
const IncidentDetail = () => {
  const [, params] = useRoute('/admin/incidents/:id');
  const [location, setLocation] = useLocation();
  const incidentId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados locales
  const [newComment, setNewComment] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // Consultas para obtener datos
  const { 
    data: incident, 
    isLoading: isLoadingIncident,
    isError: isErrorIncident,
    refetch: refetchIncident
  } = useQuery({
    queryKey: [`/api/incidents/${incidentId}`],
    enabled: !!incidentId
  });
  
  // Obtener comentarios de la incidencia
  const { 
    data: comments = [], 
    isLoading: isLoadingComments
  } = useQuery({
    queryKey: [`/api/incidents/${incidentId}/comments`],
    enabled: !!incidentId,
    onError: (err) => {
      console.error("Error al cargar comentarios:", err);
    }
  });
  
  // Obtener historial de la incidencia
  const { 
    data: history = [], 
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: [`/api/incidents/${incidentId}/history`],
    enabled: !!incidentId,
    onError: (err) => {
      console.error("Error al cargar historial:", err);
    }
  });
  
  // Obtener datos de parques
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });
  
  // Obtener usuarios para asignación
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    onError: (err) => {
      console.error("Error al cargar usuarios:", err);
    }
  });

  // Mutación para actualizar el estado de la incidencia
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/history`] });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la incidencia ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al actualizar el estado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la incidencia",
        variant: "destructive"
      });
    }
  });
  
  // Mutación para agregar un comentario
  const addCommentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await fetch(`/api/incidents/${incidentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ content, userId: 1 })
      });
      
      if (!response.ok) {
        throw new Error('Error al agregar el comentario');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/history`] });
      
      setNewComment('');
      toast({
        title: "Comentario agregado",
        description: "Su comentario ha sido agregado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al agregar comentario:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive"
      });
    }
  });
  
  // Mutación para asignar la incidencia a un usuario
  const assignIncidentMutation = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const response = await fetch(`/api/incidents/${incidentId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Error al asignar la incidencia');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/history`] });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      setShowAssignDialog(false);
      toast({
        title: "Incidencia asignada",
        description: "La incidencia ha sido asignada correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al asignar incidencia:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la incidencia",
        variant: "destructive"
      });
    }
  });
  
  // Mutación para resolver la incidencia
  const resolveIncidentMutation = useMutation({
    mutationFn: async ({ notes }: { notes: string }) => {
      const response = await fetch(`/api/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ resolutionNotes: notes })
      });
      
      if (!response.ok) {
        throw new Error('Error al resolver la incidencia');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/history`] });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      setShowResolveDialog(false);
      toast({
        title: "Incidencia resuelta",
        description: "La incidencia ha sido marcada como resuelta correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al resolver incidencia:", error);
      toast({
        title: "Error",
        description: "No se pudo resolver la incidencia",
        variant: "destructive"
      });
    }
  });
  
  // Manejar envío del formulario para agregar comentario
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío",
        variant: "destructive"
      });
      return;
    }
    
    addCommentMutation.mutate({ content: newComment });
  };
  
  // Manejar asignación de incidencia
  const handleAssignIncident = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un usuario para asignar la incidencia",
        variant: "destructive"
      });
      return;
    }
    
    assignIncidentMutation.mutate({ userId: parseInt(selectedUserId) });
  };
  
  // Manejar resolución de incidencia
  const handleResolveIncident = () => {
    if (!resolutionNotes.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar notas de resolución",
        variant: "destructive"
      });
      return;
    }
    
    resolveIncidentMutation.mutate({ notes: resolutionNotes });
  };
  
  // Formatear fecha
  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  };
  
  // Obtener etiqueta de estado en español
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'in_progress': 'En proceso',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado'
    };
    return statusMap[status] || status;
  };
  
  // Obtener clases para la etiqueta de estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Obtener ícono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Obtener etiqueta de prioridad en español
  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return priorityMap[priority] || priority;
  };
  
  // Obtener clases para la etiqueta de prioridad
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Obtener etiqueta para la acción del historial
  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      'created': 'Creado',
      'updated': 'Actualizado',
      'status_changed': 'Cambio de estado',
      'assigned': 'Asignado',
      'commented': 'Comentario añadido',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado',
      'attachment_added': 'Archivo adjunto'
    };
    return actionMap[action] || action;
  };
  
  // Obtener icono para la acción del historial
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <PenTool className="h-4 w-4" />;
      case 'updated':
        return <PenTool className="h-4 w-4" />;
      case 'status_changed':
        return <Clock className="h-4 w-4" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'attachment_added':
        return <Paperclip className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  // Renderizar carga o error
  if (isLoadingIncident) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isErrorIncident || !incident) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar la incidencia</h2>
            <p className="mb-4">No se pudo cargar la información de la incidencia.</p>
            <div className="space-x-2">
              <Button onClick={() => refetchIncident()}>
                Reintentar
              </Button>
              <Button variant="outline" onClick={() => setLocation('/admin/incidents')}>
                Volver al listado
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setLocation('/admin/incidents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a incidencias
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{incident.title}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>Incidencia #{incident.id}</span>
                <span className="mx-2">•</span>
                <span>Reportada el {formatDate(incident.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <Badge className={getStatusBadgeClass(incident.status)}>
                <span className="flex items-center">
                  {getStatusIcon(incident.status)}
                  <span className="ml-1">{getStatusLabel(incident.status)}</span>
                </span>
              </Badge>
              
              {incident.priority && (
                <Badge className={getPriorityBadgeClass(incident.priority)}>
                  {getPriorityLabel(incident.priority)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">{incident.description}</p>
                </div>
                
                {incident.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ubicación</h3>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{incident.location}</span>
                    </div>
                  </div>
                )}
                
                {incident.resolutionNotes && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Notas de resolución</h3>
                    <p className="text-green-800 whitespace-pre-wrap">{incident.resolutionNotes}</p>
                    {incident.resolutionDate && (
                      <div className="text-xs text-green-700 mt-2">
                        Resuelto el {formatDate(incident.resolutionDate)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="comments">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comentarios
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock6 className="h-4 w-4 mr-2" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Adjuntos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Comentarios</CardTitle>
                    <CardDescription>
                      Discusión sobre esta incidencia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      {isLoadingComments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cargando comentarios...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No hay comentarios aún. Sé el primero en comentar.
                        </div>
                      ) : (
                        comments.map((comment: any) => (
                          <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.user?.profileImageUrl} />
                              <AvatarFallback>{comment.user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="font-medium">
                                  {comment.user?.fullName || comment.user?.username || 'Usuario'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </div>
                              </div>
                              <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Formulario para añadir comentario */}
                    {incident.status !== 'resolved' && incident.status !== 'rejected' && (
                      <form onSubmit={handleAddComment} className="mt-4">
                        <div className="flex flex-col space-y-2">
                          <Textarea
                            placeholder="Escribir un comentario..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={addCommentMutation.isPending || !newComment.trim()}
                            >
                              {addCommentMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar comentario
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Historial de actividad</CardTitle>
                    <CardDescription>
                      Registro cronológico de acciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingHistory ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Cargando historial...</p>
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No hay registros de actividad disponibles.
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-5 w-0.5 bg-gray-200"></div>
                          <div className="space-y-6">
                            {history.map((entry: any) => (
                              <div key={entry.id} className="relative">
                                <div className="flex items-start">
                                  <div className="absolute left-0 bg-white p-1 rounded-full border border-gray-200">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                      {getActionIcon(entry.action)}
                                    </div>
                                  </div>
                                  <div className="ml-14">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                      <div className="font-medium">
                                        {getActionLabel(entry.action)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatDate(entry.createdAt)}
                                      </div>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-600">
                                      {entry.details && typeof entry.details === 'object' && (
                                        <div className="space-y-1">
                                          {entry.action === 'status_changed' && (
                                            <div>
                                              Estado cambiado a <Badge className={getStatusBadgeClass(entry.details.status)}>{getStatusLabel(entry.details.status)}</Badge>
                                            </div>
                                          )}
                                          {entry.action === 'assigned' && (
                                            <div>
                                              Asignado a {users.find((u: any) => u.id === entry.details.assignedTo)?.fullName || 'Usuario'} 
                                            </div>
                                          )}
                                          {entry.action === 'commented' && (
                                            <div>
                                              Se agregó un nuevo comentario
                                            </div>
                                          )}
                                          {entry.action === 'resolved' && (
                                            <div>
                                              Incidencia marcada como resuelta
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {!entry.details && (
                                        <div>
                                          {entry.action === 'created' && 'Se creó la incidencia'}
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                      Por: {users.find((u: any) => u.id === entry.userId)?.fullName || 'Usuario'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Archivos adjuntos</CardTitle>
                    <CardDescription>
                      Documentos e imágenes relacionados con la incidencia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-gray-500">
                      <Paperclip className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No hay archivos adjuntos disponibles.</p>
                      <p className="text-sm mt-1">Próximamente podrás subir documentos e imágenes.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Barra lateral con información adicional y acciones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.status === 'pending' && (
                  <Button 
                    className="w-full"
                    onClick={() => updateStatusMutation.mutate({ status: 'in_progress' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Iniciar proceso
                  </Button>
                )}
                
                {(incident.status === 'pending' || incident.status === 'in_progress') && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Asignar responsable
                  </Button>
                )}
                
                {(incident.status === 'pending' || incident.status === 'in_progress') && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowResolveDialog(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como resuelto
                  </Button>
                )}
                
                {incident.status !== 'rejected' && (
                  <Button 
                    className="w-full"
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ status: 'rejected' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Parque</h3>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    {incident.park?.name || `Parque ${incident.parkId}`}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Reportado por</h3>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{incident.reporterName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{incident.reporterName}</div>
                      {incident.reporterEmail && (
                        <div className="text-xs text-gray-500">{incident.reporterEmail}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Responsable</h3>
                  {incident.assignedToId ? (
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src={users.find((u: any) => u.id === incident.assignedToId)?.profileImageUrl} 
                          alt="Avatar" 
                        />
                        <AvatarFallback>
                          {users.find((u: any) => u.id === incident.assignedToId)?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{users.find((u: any) => u.id === incident.assignedToId)?.fullName || 'Usuario'}</div>
                        <div className="text-xs text-gray-500">Asignado</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Sin asignar</div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Fechas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Creada:</span>
                      <span>{formatDate(incident.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Actualizada:</span>
                      <span>{formatDate(incident.updatedAt)}</span>
                    </div>
                    {incident.resolutionDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resuelta:</span>
                        <span>{formatDate(incident.resolutionDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {incident.assetId && (
                  <>
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Activo relacionado</h3>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setLocation(`/admin/assets/${incident.assetId}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver activo
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Diálogo para asignar la incidencia */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar incidencia</DialogTitle>
            <DialogDescription>
              Selecciona un usuario para asignar esta incidencia
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign-user">Usuario</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignIncident}
              disabled={assignIncidentMutation.isPending || !selectedUserId}
            >
              {assignIncidentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Asignando...
                </>
              ) : (
                'Asignar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para resolver la incidencia */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver incidencia</DialogTitle>
            <DialogDescription>
              Proporciona detalles sobre cómo se resolvió la incidencia
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution-notes">Notas de resolución</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Describe cómo se resolvió la incidencia..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleResolveIncident}
              disabled={resolveIncidentMutation.isPending || !resolutionNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {resolveIncidentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resolviendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como resuelto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default IncidentDetail;