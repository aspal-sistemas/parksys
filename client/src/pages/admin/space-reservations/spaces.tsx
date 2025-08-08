import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Users, DollarSign, Clock, CheckCircle, XCircle, Eye, Edit, Calendar, Search, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';

interface ReservableSpace {
  id: number;
  park_id: number;
  park_name: string;
  municipality_id: number;
  name: string;
  description: string;
  space_type: string;
  capacity: number;
  hourly_rate: string;
  minimum_hours: number;
  maximum_hours: number;
  amenities: string;
  rules: string;
  is_active: boolean;
  requires_approval: boolean;
  advance_booking_days: number;
  images: string | null;
  coordinates: string;
  created_at: string;
  updated_at: string;
}

const spaceTypeLabels = {
  playground: 'Área de Juegos',
  kiosk: 'Kiosco',
  picnic_area: 'Área de Picnic',
  open_area: 'Área Abierta',
  pavilion: 'Pabellón'
};

const spaceTypeColors = {
  playground: 'bg-green-100 text-green-800',
  kiosk: 'bg-blue-100 text-blue-800',
  picnic_area: 'bg-yellow-100 text-yellow-800',
  open_area: 'bg-purple-100 text-purple-800',
  pavilion: 'bg-red-100 text-red-800'
};

export default function ReservableSpacesPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [parkFilter, setParkFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState<ReservableSpace | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: spaces = [], isLoading, error } = useQuery<ReservableSpace[]>({
    queryKey: ['/api/reservable-spaces'],
    queryFn: async () => {
      const response = await fetch('/api/reservable-spaces');
      if (!response.ok) {
        throw new Error('Error al cargar los espacios reservables');
      }
      return response.json();
    }
  });

  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks?simple=true'],
    queryFn: async () => {
      const response = await fetch('/api/parks?simple=true');
      if (!response.ok) {
        throw new Error('Error al cargar los parques');
      }
      return response.json();
    }
  });

  // Handle different response formats
  const parks = Array.isArray(parksResponse) ? parksResponse : (parksResponse?.data || []);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.park_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPark = parkFilter === 'all' || space.park_id.toString() === parkFilter;
    const matchesType = typeFilter === 'all' || space.space_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && space.is_active) ||
      (statusFilter === 'inactive' && !space.is_active);
    
    return matchesSearch && matchesPark && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSpaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpaces = filteredSpaces.slice(startIndex, startIndex + itemsPerPage);

  const handleViewSpace = (space: ReservableSpace) => {
    setSelectedSpace(space);
  };

  const handleEditSpace = (space: ReservableSpace) => {
    setLocation(`/admin/space-reservations/spaces/edit/${space.id}`);
  };

  const handleNewSpace = () => {
    setLocation('/admin/space-reservations/spaces/new');
  };

  const handleReserveSpace = (space: ReservableSpace) => {
    setLocation(`/admin/space-reservations/new?space_id=${space.id}`);
  };

  // Mutación para eliminar espacios
  const deleteSpaceMutation = useMutation({
    mutationFn: async (spaceId: number) => {
      const response = await fetch(`/api/reservable-spaces/${spaceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Error al eliminar el espacio');
        (error as any).hasActiveReservations = errorData.hasActiveReservations;
        throw error;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reservable-spaces'] });
      toast({
        title: 'Espacio eliminado',
        description: 'El espacio reservable ha sido eliminado correctamente.',
      });
    },
    onError: (error: any) => {
      const isActiveReservationsError = error.hasActiveReservations;
      toast({
        title: 'No se puede eliminar',
        description: isActiveReservationsError 
          ? 'El espacio tiene reservas activas. Cancela las reservas primero para poder eliminarlo.'
          : 'No se pudo eliminar el espacio. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteSpace = (spaceId: number) => {
    deleteSpaceMutation.mutate(spaceId);
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

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-600">Error al cargar los espacios reservables</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header con patrón Card estandarizado */}
      <Card className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Espacios Disponibles</h1>
          </div>
          <Button 
            onClick={handleNewSpace}
            className="bg-[#00a587] hover:bg-[#067f5f] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Espacio
          </Button>
        </div>
        <p className="text-gray-600 mt-2">Gestiona los espacios reservables en los parques</p>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Espacios</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spaces.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {spaces.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Aprobación</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {spaces.filter(s => s.requires_approval).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
            <Users className="h-4 w-4 text-[#00a587]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00a587]">
              {spaces.reduce((sum, space) => sum + space.capacity, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, descripción o parque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={parkFilter} onValueChange={setParkFilter}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Filtrar por parque" />
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="playground">Área de Juegos</SelectItem>
            <SelectItem value="kiosk">Kiosco</SelectItem>
            <SelectItem value="picnic_area">Área de Picnic</SelectItem>
            <SelectItem value="open_area">Área Abierta</SelectItem>
            <SelectItem value="pavilion">Pabellón</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedSpaces.map((space) => (
          <Card key={space.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{space.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {space.park_name}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={spaceTypeColors[space.space_type as keyof typeof spaceTypeColors]}>
                    {spaceTypeLabels[space.space_type as keyof typeof spaceTypeLabels]}
                  </Badge>
                  {space.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{space.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Capacidad:
                  </span>
                  <span className="font-medium">{space.capacity} personas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Precio/hora:
                  </span>
                  <span className="font-medium">${space.hourly_rate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duración:
                  </span>
                  <span className="font-medium">{space.minimum_hours}-{space.maximum_hours}h</span>
                </div>
                {space.requires_approval && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">Requiere aprobación</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSpace(space)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSpace(space)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReserveSpace(space)}
                  className="bg-[#00a587] hover:bg-[#067f5f] text-white flex-1"
                  disabled={!space.is_active}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Reservar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar espacio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El espacio "{space.name}" será eliminado permanentemente del sistema.
                        {space.is_active && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                            ⚠️ Este espacio está activo. Asegúrate de que no tenga reservas pendientes.
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSpace(space.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteSpaceMutation.isPending}
                      >
                        {deleteSpaceMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredSpaces.length)} de {filteredSpaces.length} espacios
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

      {/* View Space Dialog */}
      <Dialog open={!!selectedSpace} onOpenChange={(open) => !open && setSelectedSpace(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Espacio</DialogTitle>
          </DialogHeader>
          {selectedSpace && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nombre:</span> {selectedSpace.name}</div>
                    <div><span className="font-medium">Parque:</span> {selectedSpace.park_name}</div>
                    <div><span className="font-medium">Tipo:</span> {spaceTypeLabels[selectedSpace.space_type as keyof typeof spaceTypeLabels]}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <Badge className={`ml-2 ${selectedSpace.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedSpace.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capacidad y Precios</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Capacidad:</span> {selectedSpace.capacity} personas</div>
                    <div><span className="font-medium">Precio por hora:</span> ${selectedSpace.hourly_rate}</div>
                    <div><span className="font-medium">Duración mínima:</span> {selectedSpace.minimum_hours} horas</div>
                    <div><span className="font-medium">Duración máxima:</span> {selectedSpace.maximum_hours} horas</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-sm text-gray-600">{selectedSpace.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Amenidades</h4>
                <p className="text-sm text-gray-600">{selectedSpace.amenities}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reglas y Condiciones</h4>
                <p className="text-sm text-gray-600">{selectedSpace.rules}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Requiere aprobación:</span> 
                  <span className="ml-2">{selectedSpace.requires_approval ? 'Sí' : 'No'}</span>
                </div>
                <div>
                  <span className="font-medium">Reserva anticipada:</span> 
                  <span className="ml-2">{selectedSpace.advance_booking_days} días</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleEditSpace(selectedSpace)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => handleReserveSpace(selectedSpace)}
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={!selectedSpace.is_active}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reservar Espacio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}