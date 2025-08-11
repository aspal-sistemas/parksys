import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Users, Search, Filter, Grid, List, Star, Eye, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdSpace from '@/components/AdSpace';
import PublicLayout from '@/components/PublicLayout';
import heroImage from '@assets/ImageTransformer_1754921197180.webp';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  capacity: number;
  registeredCount?: number;
  eventType: string;
  status: 'draft' | 'published' | 'cancelled';
  featuredImageUrl?: string;
  organizerName: string;
  organizerEmail: string;
  parks?: Array<{ id: number; name: string; address: string }>;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Obtener eventos desde el backend
  const { data: eventsData = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    retry: 1
  });

  // Obtener lista de parques para el filtro
  const { data: parksData = [] } = useQuery({
    queryKey: ['/api/parks'],
    retry: 1
  });

  // Procesar datos del backend
  const events = Array.isArray(eventsData?.data) ? eventsData.data : Array.isArray(eventsData) ? eventsData : [];
  const parks = Array.isArray(parksData?.data) ? parksData.data : Array.isArray(parksData) ? parksData : [];
  
  // Obtener categorías únicas de los eventos
  const categories = [...new Set(events.map((event: Event) => event.eventType))];

  const filteredEvents = events.filter((event: Event) => {
    const parkName = event.parks && event.parks.length > 0 ? event.parks[0].name : event.location;
    
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parkName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.eventType === categoryFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesPark = parkFilter === 'all' || parkName === parkFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPark;
  });

  const statusLabels = {
    draft: 'Borrador',
    published: 'Publicado',
    cancelled: 'Cancelado'
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const eventTypeLabels = {
    cultural: 'Cultural',
    sports: 'Deportes',
    environmental: 'Ambiental',
    educational: 'Educativo',
    social: 'Social'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Todo el día';
    return timeString;
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative text-white overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Eye className="h-8 w-8 md:h-10 md:w-10 text-white drop-shadow-lg" />
                <h2 className="text-4xl md:text-5xl font-guttery font-light drop-shadow-lg">
                  Conoce
                </h2>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                Eventos y Actividades
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
                Descubre los eventos más emocionantes en los parques urbanos de Guadalajara. 
                Cultura, deporte, naturaleza y diversión para toda la familia.
              </p>
            </div>
          </div>
        </div>

      {/* Banner publicitario */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <AdSpace spaceId="35" pageType="activities" position="banner" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtros y controles */}
        <div className="rounded-lg shadow-sm p-6 mb-8" style={{ backgroundColor: '#19633c' }}>
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
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {eventTypeLabels[category as keyof typeof eventTypeLabels] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
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
        </div>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? "No hay eventos disponibles en este momento. ¡Vuelve pronto para descubrir nuevas actividades!"
                : "Intenta ajustar los filtros o buscar con otros términos."
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredEvents.map((event: Event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  <>
                    {event.featuredImageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.featuredImageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                          {event.title}
                        </h3>
                        <Badge className={statusColors[event.status]}>
                          {statusLabels[event.status]}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || event.eventType}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.startDate)} {event.startTime && `a las ${formatTime(event.startTime)}`}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.parks && event.parks.length > 0 ? event.parks[0].name : event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.registeredCount || 0} / {event.capacity} participantes
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Organiza: {event.organizerName}
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
                          <Badge variant="outline" className="text-xs">
                            {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || event.eventType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(event.startDate)} {event.startTime && `- ${formatTime(event.startTime)}`}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.parks && event.parks.length > 0 ? event.parks[0].name : event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.registeredCount || 0}/{event.capacity}
                          </div>
                          <div className="text-xs text-gray-400">
                            Organiza: {event.organizerName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sección de información de contacto */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Necesitas más información?</h2>
            <p className="text-lg text-gray-600">Nuestro equipo está aquí para ayudarte con cualquier evento</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600 mb-2">(33) 1234-5678</p>
              <p className="text-sm text-gray-500">Lun-Vie 8:00-16:00</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Correo</h3>
              <p className="text-gray-600 mb-2">eventos@parques.gdl.gob.mx</p>
              <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#51a19f'}}>
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-gray-600 mb-2">Av. Hidalgo 400, Centro</p>
              <p className="text-sm text-gray-500">Guadalajara, Jalisco</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
              <Mail className="h-5 w-5 mr-2" />
              Enviar mensaje
            </Button>
          </div>
        </div>
      </section>

      </div>
    </PublicLayout>
  );
};

export default Events;