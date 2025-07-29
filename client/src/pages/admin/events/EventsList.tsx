import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, MapPin, Users, Clock, Edit, Trash2, Eye, Grid, List, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  parkName?: string;
  capacity: number;
  registeredCount: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
  price?: number;
  organizer: string;
  createdAt: string;
  updatedAt: string;
}

const EventsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener eventos desde el backend
  const { data: eventsData = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    suspense: false,
    retry: 1
  });

  // Obtener lista de parques para el filtro
  const { data: parksData = [] } = useQuery({
    queryKey: ['/api/parks'],
    suspense: false,
    retry: 1
  });

  // Obtener categorías de eventos
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['/api/events/categories'],
    suspense: false,
    retry: 1
  });

  // Mutación para eliminar evento
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: number) => apiRequest(`/api/events/${eventId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento.",
        variant: "destructive",
      });
    }
  });

  const events = Array.isArray(eventsData?.data) ? eventsData.data : Array.isArray(eventsData) ? eventsData : [];
  const parks = Array.isArray(parksData?.data) ? parksData.data : Array.isArray(parksData) ? parksData : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : Array.isArray(categoriesData) ? categoriesData : [];

  const statusLabels = {
    upcoming: 'Próximo',
    ongoing: 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesPark = parkFilter === 'all' || event.location === parkFilter || event.parkName === parkFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPark;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuito' : `$${price?.toLocaleString()} MXN`;
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header con patrón Card */}
        <Card className="bg-gray-50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Listado de Eventos</h1>
            </div>
          </CardContent>
        </Card>

        {/* Filtros y controles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="upcoming">Próximos</SelectItem>
                    <SelectItem value="ongoing">En curso</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={parkFilter} onValueChange={setParkFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Parque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parks.map((park: any) => (
                      <SelectItem key={park.id} value={park.name}>{park.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="bg-[#00a587] hover:bg-[#067f5f] text-white"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="bg-[#00a587] hover:bg-[#067f5f] text-white"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600">
                {events.length === 0 
                  ? "No hay eventos creados aún. Crea tu primer evento desde 'Nuevo Evento'."
                  : "Intenta ajustar los filtros o buscar con otros términos."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredEvents.map((event: Event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  <>
                    {event.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {event.title}
                        </h3>
                        <Badge className={`ml-2 ${statusColors[event.status]}`}>
                          {statusLabels[event.status]}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date)} a las {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.registeredCount || 0} / {event.capacity} participantes
                        </div>
                        {event.price !== undefined && (
                          <div className="flex items-center">
                            <span className="font-medium text-green-600">
                              {formatPrice(event.price)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <Badge className={statusColors[event.status]}>
                            {statusLabels[event.status]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {event.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(event.date)} - {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.registeredCount || 0}/{event.capacity}
                          </div>
                          {event.price !== undefined && (
                            <span className="font-medium text-green-600">
                              {formatPrice(event.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* Estadísticas resumidas */}
        {events.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                  <div className="text-sm text-gray-500">Total de eventos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {events.filter((e: Event) => e.status === 'upcoming').length}
                  </div>
                  <div className="text-sm text-gray-500">Próximos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {events.filter((e: Event) => e.status === 'ongoing').length}
                  </div>
                  <div className="text-sm text-gray-500">En curso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {events.filter((e: Event) => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-500">Completados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default EventsList;