import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  UserCheck, Search, Filter, Download, Users, 
  Calendar, MapPin, Clock, CheckCircle, XCircle, 
  AlertCircle, Eye, Mail, Phone, Grid3X3, List,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityRegistration {
  id: number;
  activityId: number;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  age?: number;
  emergencyContactName?: string;
  emergencyPhone?: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  acceptsTerms: boolean;
  createdAt: string;
  updatedAt: string;
  activity?: {
    id: number;
    title: string;
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    location?: string;
    maxRegistrations?: number;
    currentRegistrations: number;
    park?: {
      name: string;
    };
  };
}

const ActivityRegistrationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedRegistration, setSelectedRegistration] = useState<ActivityRegistration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Obtener inscripciones
  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['/api/activity-registrations', currentPage, searchTerm, statusFilter, activityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(activityFilter !== 'all' && { activity: activityFilter })
      });
      
      const response = await fetch(`/api/activity-registrations?${params}`);
      if (!response.ok) throw new Error('Error al cargar inscripciones');
      return response.json();
    }
  });

  // Obtener actividades para filtro
  const { data: activitiesData } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Error al cargar actividades');
      return response.json();
    }
  });

  const registrations = registrationsData?.registrations || [];
  const totalPages = registrationsData?.pagination?.totalPages || 1;
  const activities = activitiesData || [];

  // Mutación para aprobar/rechazar inscripciones
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: 'approved' | 'rejected'; reason?: string }) => {
      const response = await fetch(`/api/activity-registrations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      if (!response.ok) throw new Error('Error al actualizar estado');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la inscripción ha sido actualizado exitosamente."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-registrations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el estado de la inscripción.",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazada</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
  };

  // Los filtros se manejan desde el backend, no necesitamos filtrar aquí
  const displayedRegistrations = registrations;

  const handleStatusChange = (id: number, status: 'approved' | 'rejected', reason?: string) => {
    statusMutation.mutate({ id, status, reason });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Actividad', 'Participante', 'Email', 'Teléfono', 'Estado', 'Fecha de Inscripción'],
      ...displayedRegistrations.map((reg: ActivityRegistration) => [
        reg.activity?.title || '',
        reg.participantName,
        reg.participantEmail,
        reg.participantPhone || '',
        reg.status,
        format(new Date(reg.registrationDate), 'dd/MM/yyyy', { locale: es })
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscripciones_actividades_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  const viewRegistrationDetail = (registration: ActivityRegistration) => {
    setSelectedRegistration(registration);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inscripciones...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Inscripciones</h1>
            </div>
            <p className="text-gray-600 mt-2">Administra las inscripciones ciudadanas a actividades públicas</p>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                  <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {registrations.filter((r: ActivityRegistration) => r.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {registrations.filter((r: ActivityRegistration) => r.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {registrations.filter((r: ActivityRegistration) => r.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y controles */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, email o actividad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las actividades</SelectItem>
                    {activities.map((activity: any) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                {/* Toggle de vista */}
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'cards' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex items-center gap-1"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de inscripciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inscripciones de Actividades</CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de inscripción de los ciudadanos ({registrations.length} total)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {displayedRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones</h3>
                <p className="text-gray-600">No se encontraron inscripciones con los filtros aplicados.</p>
              </div>
            ) : (
              <>
                {/* Vista Grid */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedRegistrations.map((registration: ActivityRegistration) => (
                      <Card key={registration.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{registration.participantName}</h3>
                              <p className="text-sm text-gray-600">{registration.participantEmail}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewRegistrationDetail(registration)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium truncate">{registration.activity?.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(registration.registrationDate), 'dd/MM/yyyy', { locale: es })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {getStatusBadge(registration.status)}
                            
                            {registration.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusChange(registration.id, 'approved')}
                                  disabled={statusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    const reason = prompt('Motivo del rechazo (opcional):');
                                    handleStatusChange(registration.id, 'rejected', reason || undefined);
                                  }}
                                  disabled={statusMutation.isPending}
                                  className="h-8 px-2"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Vista Tabla */}
                {viewMode === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Participante</th>
                          <th className="text-left p-3 font-medium">Actividad</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Estado</th>
                          <th className="text-left p-3 font-medium">Fecha</th>
                          <th className="text-center p-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRegistrations.map((registration: ActivityRegistration) => (
                          <tr key={registration.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <div className="font-semibold">{registration.participantName}</div>
                                {registration.participantPhone && (
                                  <div className="text-sm text-gray-600">{registration.participantPhone}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{registration.activity?.title}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">{registration.participantEmail}</div>
                            </td>
                            <td className="p-3">
                              {getStatusBadge(registration.status)}
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                {format(new Date(registration.registrationDate), 'dd/MM/yyyy', { locale: es })}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => viewRegistrationDetail(registration)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {registration.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleStatusChange(registration.id, 'approved')}
                                      disabled={statusMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => {
                                        const reason = prompt('Motivo del rechazo (opcional):');
                                        handleStatusChange(registration.id, 'rejected', reason || undefined);
                                      }}
                                      disabled={statusMutation.isPending}
                                      className="h-8 px-2"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Paginación mejorada */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} • Mostrando {displayedRegistrations.length} de {registrations.length} inscripciones
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - 2);
                        pageNumber = start + i;
                      }
                      
                      if (pageNumber > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={currentPage === pageNumber ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de detalles */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la Inscripción</DialogTitle>
              <DialogDescription>
                Ver información completa del participante y la actividad
              </DialogDescription>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6">
                {/* Información del participante */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Participante</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre completo</label>
                      <p className="text-lg font-semibold">{selectedRegistration.participantName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm">{selectedRegistration.participantEmail}</p>
                    </div>
                    {selectedRegistration.participantPhone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <p className="text-sm">{selectedRegistration.participantPhone}</p>
                      </div>
                    )}
                    {selectedRegistration.age && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Edad</label>
                        <p className="text-sm">{selectedRegistration.age} años</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la actividad */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información de la Actividad</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Actividad</label>
                      <p className="text-lg font-semibold">{selectedRegistration.activity?.title}</p>
                    </div>
                    {selectedRegistration.activity?.startDate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Fecha de inicio</label>
                          <p className="text-sm">
                            {format(new Date(selectedRegistration.activity.startDate), 'dd/MM/yyyy', { locale: es })}
                            {selectedRegistration.activity.startTime && ` a las ${selectedRegistration.activity.startTime}`}
                          </p>
                        </div>
                        {selectedRegistration.activity.endDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Fecha de fin</label>
                            <p className="text-sm">
                              {format(new Date(selectedRegistration.activity.endDate), 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contacto de emergencia */}
                {(selectedRegistration.emergencyContactName || selectedRegistration.emergencyPhone) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRegistration.emergencyContactName && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nombre</label>
                          <p className="text-sm">{selectedRegistration.emergencyContactName}</p>
                        </div>
                      )}
                      {selectedRegistration.emergencyPhone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Teléfono</label>
                          <p className="text-sm">{selectedRegistration.emergencyPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información médica */}
                {(selectedRegistration.medicalConditions || selectedRegistration.dietaryRestrictions) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Información Médica</h3>
                    {selectedRegistration.medicalConditions && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <label className="text-sm font-medium text-yellow-800">Condiciones médicas</label>
                        <p className="text-sm text-yellow-700 mt-1">{selectedRegistration.medicalConditions}</p>
                      </div>
                    )}
                    {selectedRegistration.dietaryRestrictions && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <label className="text-sm font-medium text-blue-800">Restricciones alimentarias</label>
                        <p className="text-sm text-blue-700 mt-1">{selectedRegistration.dietaryRestrictions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Estado e información administrativa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Estado de la Inscripción</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-600">Estado actual:</label>
                      {getStatusBadge(selectedRegistration.status)}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de inscripción</label>
                      <p className="text-sm">
                        {format(new Date(selectedRegistration.registrationDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    {selectedRegistration.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <label className="text-sm font-medium text-red-800">Motivo de rechazo</label>
                        <p className="text-sm text-red-700 mt-1">{selectedRegistration.rejectionReason}</p>
                      </div>
                    )}
                    {selectedRegistration.notes && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <label className="text-sm font-medium text-gray-800">Notas adicionales</label>
                        <p className="text-sm text-gray-700 mt-1">{selectedRegistration.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones del modal */}
                  {selectedRegistration.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          handleStatusChange(selectedRegistration.id, 'approved');
                          setIsDetailModalOpen(false);
                        }}
                        disabled={statusMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar Inscripción
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Motivo del rechazo (opcional):');
                          handleStatusChange(selectedRegistration.id, 'rejected', reason || undefined);
                          setIsDetailModalOpen(false);
                        }}
                        disabled={statusMutation.isPending}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar Inscripción
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ActivityRegistrationsPage;