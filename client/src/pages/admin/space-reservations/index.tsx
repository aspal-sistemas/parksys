import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarClock, MapPin, Users, DollarSign, Phone, Mail, Eye, Edit, Trash2, Calendar, Search, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';

interface SpaceReservation {
  id: number;
  space_id: number;
  space_name: string;
  park_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_cost: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string;
  deposit_paid: boolean;
  created_at: string;
  space_type: string;
  space_capacity: number;
  hourly_rate: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
};

const spaceTypeLabels = {
  playground: 'Área de Juegos',
  kiosk: 'Kiosco',
  picnic_area: 'Área de Picnic',
  open_area: 'Área Abierta',
  pavilion: 'Pabellón'
};

export default function SpaceReservationsPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<SpaceReservation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reservations = [], isLoading, error } = useQuery<SpaceReservation[]>({
    queryKey: ['/api/space-reservations'],
    queryFn: async () => {
      const response = await fetch('/api/space-reservations');
      if (!response.ok) {
        throw new Error('Error al cargar las reservas');
      }
      return response.json();
    }
  });

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/space-reservations/stats'],
    queryFn: async () => {
      const response = await fetch('/api/space-reservations/stats');
      if (!response.ok) {
        throw new Error('Error al cargar las estadísticas');
      }
      return response.json();
    }
  });

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      (reservation.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.space_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.park_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  const handleViewReservation = (reservation: SpaceReservation) => {
    setSelectedReservation(reservation);
  };

  const handleEditReservation = (reservation: SpaceReservation) => {
    setLocation(`/admin/space-reservations/edit/${reservation.id}`);
  };

  const handleNewReservation = () => {
    setLocation('/admin/space-reservations/new');
  };

  // Mutación para eliminar reservas
  const deleteReservationMutation = useMutation({
    mutationFn: async (reservationId: number) => {
      const response = await fetch(`/api/space-reservations/${reservationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar la reserva');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/space-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/space-reservations/stats'] });
      toast({
        title: 'Reserva eliminada',
        description: 'La reserva ha sido cancelada y eliminada correctamente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la reserva. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteReservation = (reservationId: number) => {
    deleteReservationMutation.mutate(reservationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar las reservas de espacios</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">
                Reservas de Espacios
              </h1>
            </div>
            <Button 
              onClick={handleNewReservation}
              className="bg-[#00a587] hover:bg-[#067f5f] text-white"
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Gestiona las reservas de espacios recreativos en los parques
          </p>
        </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_reservations || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-[#00a587]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00a587]">${stats.monthly_revenue || '0.00'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, espacio o parque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Activas</CardTitle>
          <CardDescription>
            Mostrando {paginatedReservations.length} de {filteredReservations.length} reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Espacio</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.customer_name}</div>
                        <div className="text-sm text-gray-500">{reservation.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.space_name}</div>
                        <div className="text-sm text-gray-500">
                          {spaceTypeLabels[reservation.space_type as keyof typeof spaceTypeLabels]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.park_name}</TableCell>
                    <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                    <TableCell>
                      {reservation.start_time} - {reservation.end_time}
                      <div className="text-sm text-gray-500">{reservation.total_hours}h</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[reservation.status]}>
                        {statusLabels[reservation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${reservation.total_cost}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReservation(reservation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReservation(reservation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar reserva activa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. La reserva de "{reservation.space_name}" para {reservation.customer_name} será cancelada y eliminada permanentemente.
                                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                                    <strong>⚠️ Advertencia:</strong> Esta reserva está <strong>{statusLabels[reservation.status]}</strong>. 
                                    Considera notificar al cliente antes de eliminarla.
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReservation(reservation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteReservationMutation.isPending}
                                >
                                  {deleteReservationMutation.isPending ? 'Eliminando...' : 'Eliminar Reserva'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReservations.length)} de {filteredReservations.length} reservas
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Reservation Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nombre:</span>
                      <span>{selectedReservation.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedReservation.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedReservation.customer_phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Espacio</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedReservation.space_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Parque:</span>
                      <span>{selectedReservation.park_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Capacidad: {selectedReservation.space_capacity} personas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipo:</span>
                      <span>{spaceTypeLabels[selectedReservation.space_type as keyof typeof spaceTypeLabels]}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Fecha:</span>
                      <span>{formatDate(selectedReservation.reservation_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Horario:</span>
                      <span>{selectedReservation.start_time} - {selectedReservation.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Duración:</span>
                      <span>{selectedReservation.total_hours} horas</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Costo por hora:</span>
                      <span>${selectedReservation.hourly_rate}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold text-[#00a587]">${selectedReservation.total_cost}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Depósito:</span>
                      <Badge className={selectedReservation.deposit_paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {selectedReservation.deposit_paid ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedReservation.special_requests && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Solicitudes Especiales</h4>
                  <p className="text-sm text-gray-600">{selectedReservation.special_requests}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Estado:</span>
                    <Badge className={`ml-2 ${statusColors[selectedReservation.status]}`}>
                      {statusLabels[selectedReservation.status]}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Creada: {formatDate(selectedReservation.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}