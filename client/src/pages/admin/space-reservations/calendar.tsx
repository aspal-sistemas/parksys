import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, DollarSign, Clock, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';

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
  space_type: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300'
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

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function SpaceReservationsCalendarPage() {
  const [location, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<SpaceReservation | null>(null);
  const [parkFilter, setParkFilter] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: reservations = [], isLoading } = useQuery<SpaceReservation[]>({
    queryKey: ['/api/space-reservations', year, month + 1],
    queryFn: async () => {
      const response = await fetch(`/api/space-reservations?month=${month + 1}&year=${year}`);
      if (!response.ok) {
        throw new Error('Error al cargar las reservas');
      }
      return response.json();
    }
  });

  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar los parques');
      }
      return response.json();
    }
  });

  const parks = parksResponse?.data || parksResponse || [];

  const filteredReservations = reservations.filter(reservation => {
    if (parkFilter === 'all') return true;
    return reservation.space_name.toLowerCase().includes(parkFilter.toLowerCase()) ||
           reservation.park_name.toLowerCase().includes(parkFilter.toLowerCase());
  });

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleNewReservation = () => {
    setLocation('/admin/space-reservations/new');
  };

  // Get days in month and starting day
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get reservations for a specific day
  const getReservationsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return filteredReservations.filter(reservation => 
      reservation.reservation_date.startsWith(dateStr)
    );
  };

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const handleReservationClick = (reservation: SpaceReservation) => {
    setSelectedReservation(reservation);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Reservas</h1>
          <p className="text-gray-600">Visualiza las reservas de espacios en formato calendario</p>
        </div>
        <Button 
          onClick={handleNewReservation}
          className="bg-[#00a587] hover:bg-[#067f5f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-semibold">
                {monthNames[month]} {year}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Hoy
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por parque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {parks.map((park: any) => (
                    <SelectItem key={park.id} value={park.name}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReservations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredReservations.filter(r => r.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredReservations.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-[#00a587]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00a587]">
              ${filteredReservations.reduce((sum, r) => sum + parseFloat(r.total_cost || '0'), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center font-medium text-gray-700 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isToday(day || 0) ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    
                    <div className="space-y-1">
                      {getReservationsForDay(day).slice(0, 3).map((reservation) => (
                        <div
                          key={reservation.id}
                          onClick={() => handleReservationClick(reservation)}
                          className={`text-xs p-1 rounded cursor-pointer border ${statusColors[reservation.status]} hover:opacity-80`}
                        >
                          <div className="font-medium truncate">
                            {reservation.start_time} - {reservation.space_name}
                          </div>
                          <div className="truncate text-gray-600">
                            {reservation.customer_name}
                          </div>
                        </div>
                      ))}
                      
                      {getReservationsForDay(day).length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{getReservationsForDay(day).length - 3} más...
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leyenda de Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color}`}></div>
                <span className="text-sm">{statusLabels[status as keyof typeof statusLabels]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
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
                    <div><span className="font-medium">Nombre:</span> {selectedReservation.customer_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedReservation.customer_email}</div>
                    <div><span className="font-medium">Teléfono:</span> {selectedReservation.customer_phone}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Espacio</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedReservation.space_name}</span>
                    </div>
                    <div><span className="font-medium">Parque:</span> {selectedReservation.park_name}</div>
                    <div><span className="font-medium">Tipo:</span> {spaceTypeLabels[selectedReservation.space_type as keyof typeof spaceTypeLabels]}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Fecha:</span>
                      <span>{new Date(selectedReservation.reservation_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">Horario:</span>
                      <span>{selectedReservation.start_time} - {selectedReservation.end_time}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Duración:</span>
                      <span>{selectedReservation.total_hours} horas</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold text-[#00a587]">${selectedReservation.total_cost}</span>
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
                  <div>
                    <span className="font-medium">Depósito:</span>
                    <Badge className={`ml-2 ${selectedReservation.deposit_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedReservation.deposit_paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
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