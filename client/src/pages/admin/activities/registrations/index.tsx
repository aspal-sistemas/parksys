import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  UserCheck, Search, Filter, Download, Users, 
  Calendar, MapPin, Clock, CheckCircle, XCircle, 
  AlertCircle, Eye, Mail, Phone 
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
  const itemsPerPage = 12;

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
    queryKey: ['/api/activities', 'registration-enabled'],
    queryFn: async () => {
      const response = await fetch('/api/activities?registrationEnabled=true');
      if (!response.ok) throw new Error('Error al cargar actividades');
      return response.json();
    }
  });

  const registrations = registrationsData?.registrations || [];
  const totalPages = registrationsData?.pagination?.totalPages || 1;
  const activities = activitiesData?.data || [];

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

  const filteredRegistrations = registrations.filter((registration: ActivityRegistration) => {
    const matchesSearch = searchTerm === '' || 
      registration.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.activity?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    const matchesActivity = activityFilter === 'all' || registration.activityId.toString() === activityFilter;
    
    return matchesSearch && matchesStatus && matchesActivity;
  });

  const handleStatusChange = (id: number, status: 'approved' | 'rejected', reason?: string) => {
    statusMutation.mutate({ id, status, reason });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Actividad', 'Participante', 'Email', 'Teléfono', 'Estado', 'Fecha de Inscripción'],
      ...filteredRegistrations.map((reg: ActivityRegistration) => [
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
            <CardTitle>Inscripciones de Actividades</CardTitle>
            <CardDescription>
              Gestiona las solicitudes de inscripción de los ciudadanos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones</h3>
                <p className="text-gray-600">No se encontraron inscripciones con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegistrations.map((registration: ActivityRegistration) => (
                  <div key={registration.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{registration.participantName}</h3>
                          {getStatusBadge(registration.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{registration.activity?.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{registration.participantEmail}</span>
                          </div>
                          {registration.participantPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{registration.participantPhone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Inscrito el {format(new Date(registration.registrationDate), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                          {registration.activity?.park && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{registration.activity.park.name}</span>
                            </div>
                          )}
                          {registration.activity?.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(registration.activity.startDate), 'dd/MM/yyyy', { locale: es })} 
                                {registration.activity.startTime && ` a las ${registration.activity.startTime}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {registration.medicalConditions && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Condiciones médicas:</strong> {registration.medicalConditions}
                          </div>
                        )}

                        {registration.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                            <strong>Motivo de rechazo:</strong> {registration.rejectionReason}
                          </div>
                        )}
                      </div>

                      {registration.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(registration.id, 'approved')}
                            disabled={statusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Motivo del rechazo (opcional):');
                              handleStatusChange(registration.id, 'rejected', reason || undefined);
                            }}
                            disabled={statusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityRegistrationsPage;