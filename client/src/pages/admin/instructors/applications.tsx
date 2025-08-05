import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, Clock, CheckCircle, XCircle, Eye, 
  FileText, Calendar, Mail, Phone, Award, MapPin 
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingApplication {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  experienceYears: number;
  specialties?: string[];
  bio?: string;
  applicationDate: string;
  campaignTitle?: string;
}

export default function InstructorApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<PendingApplication | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [evaluationDecision, setEvaluationDecision] = useState<'approved' | 'rejected'>('approved');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener aplicaciones pendientes
  const { data: pendingApplications = [], isLoading } = useQuery({
    queryKey: ['/api/instructor-applications/pending'],
    queryFn: () => apiRequest('/api/instructor-applications/pending').then(res => res.json())
  });

  // Mutation para evaluar aplicaciones
  const evaluateApplicationMutation = useMutation({
    mutationFn: async ({ id, decision, notes }: { 
      id: number; 
      decision: 'approved' | 'rejected'; 
      notes: string 
    }) => {
      const response = await apiRequest(`/api/instructor-applications/${id}/evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Evaluación completada",
        description: `Aplicación ${data.newStatus === 'active' ? 'aprobada' : 'rechazada'} exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instructor-applications/pending'] });
      setShowEvaluationDialog(false);
      setSelectedApplication(null);
      setEvaluationNotes('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo evaluar la aplicación.",
        variant: "destructive",
      });
    },
  });

  const handleEvaluate = (application: PendingApplication, decision: 'approved' | 'rejected') => {
    setSelectedApplication(application);
    setEvaluationDecision(decision);
    setShowEvaluationDialog(true);
  };

  const handleSubmitEvaluation = () => {
    if (!selectedApplication) return;
    
    evaluateApplicationMutation.mutate({
      id: selectedApplication.id,
      decision: evaluationDecision,
      notes: evaluationNotes
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-2">Cargando aplicaciones...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aplicaciones de Instructores</h1>
          <p className="text-gray-600 mt-2">
            Evalúa y gestiona las postulaciones para ser instructor
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aplicaciones Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingApplications.length}</div>
              <p className="text-xs text-muted-foreground">
                Esperando evaluación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio de Experiencia</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pendingApplications.length > 0 
                  ? Math.round(pendingApplications.reduce((acc, app) => acc + app.experienceYears, 0) / pendingApplications.length)
                  : 0
                } años
              </div>
              <p className="text-xs text-muted-foreground">
                Entre todos los candidatos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Especialidades Únicas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Set(
                  pendingApplications
                    .flatMap(app => app.specialties || [])
                ).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Diferentes especialidades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicaciones Pendientes</CardTitle>
            <CardDescription>
              Revisa y evalúa las postulaciones de nuevos instructores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aplicaciones pendientes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cuando lleguen nuevas postulaciones aparecerán aquí
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Experiencia</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Fecha de Aplicación</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.fullName}</div>
                          <div className="text-sm text-gray-500">ID: {application.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {application.experienceYears} años
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {application.specialties?.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {(application.specialties?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(application.specialties?.length || 0) - 2} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(application.applicationDate), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.campaignTitle && (
                          <Badge variant="outline" className="text-xs">
                            {application.campaignTitle}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              // TODO: Implementar modal de vista detallada
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleEvaluate(application, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rechazar Aplicación</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres rechazar la aplicación de {application.fullName}?
                                  Esta acción enviará una notificación por email al candidato.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleEvaluate(application, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rechazar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Evaluation Dialog */}
        <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {evaluationDecision === 'approved' ? 'Aprobar' : 'Rechazar'} Aplicación
              </DialogTitle>
              <DialogDescription>
                {selectedApplication && (
                  <>
                    Candidato: <strong>{selectedApplication.fullName}</strong>
                    <br />
                    {evaluationDecision === 'approved' 
                      ? 'Esta aplicación será aprobada y el candidato será notificado por email.'
                      : 'Esta aplicación será rechazada y el candidato será notificado por email.'
                    }
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="evaluation-notes" className="text-sm font-medium">
                  Comentarios {evaluationDecision === 'rejected' ? '(requerido)' : '(opcional)'}
                </label>
                <Textarea
                  id="evaluation-notes"
                  placeholder={
                    evaluationDecision === 'approved' 
                      ? 'Felicitaciones por tu excelente aplicación...'
                      : 'Gracias por tu interés. En esta ocasión...'
                  }
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEvaluationDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitEvaluation}
                disabled={evaluateApplicationMutation.isPending}
                className={evaluationDecision === 'approved' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }
              >
                {evaluateApplicationMutation.isPending ? 'Procesando...' : 
                  (evaluationDecision === 'approved' ? 'Aprobar' : 'Rechazar')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}