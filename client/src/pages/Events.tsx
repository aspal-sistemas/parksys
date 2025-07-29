import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Users, Search, Filter, Grid, List, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdSpace from '@/components/AdSpace';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
  price?: number;
  organizer: string;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Simular datos de eventos por ahora
  const mockEvents: Event[] = [
    {
      id: 1,
      title: 'Festival de Primavera',
      description: 'Celebración anual con música, arte y actividades familiares en el corazón del parque.',
      date: '2025-03-15',
      time: '10:00',
      location: 'Bosque Los Colomos',
      capacity: 500,
      registeredCount: 245,
      category: 'Festival',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 0,
      organizer: 'Bosques Urbanos de Guadalajara'
    },
    {
      id: 2,
      title: 'Concierto de Jazz al Aire Libre',
      description: 'Noche de jazz bajo las estrellas con artistas locales e internacionales.',
      date: '2025-02-20',
      time: '19:00',
      location: 'Parque Agua Azul',
      capacity: 300,
      registeredCount: 180,
      category: 'Música',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 150,
      organizer: 'Asociación Jazz Guadalajara'
    },
    {
      id: 3,
      title: 'Mercado de Productores Locales',
      description: 'Mercado semanal con productos orgánicos, artesanías y comida local.',
      date: '2025-02-08',
      time: '08:00',
      location: 'Bosque Urbano Tlaquepaque',
      capacity: 200,
      registeredCount: 120,
      category: 'Mercado',
      status: 'ongoing',
      imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 0,
      organizer: 'Cooperativa Local'
    },
    {
      id: 4,
      title: 'Torneo de Ajedrez Familiar',
      description: 'Competencia de ajedrez para todas las edades con premios y reconocimientos.',
      date: '2025-01-25',
      time: '15:00',
      location: 'Parque González Gallo',
      capacity: 100,
      registeredCount: 85,
      category: 'Deportes',
      status: 'completed',
      imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 50,
      organizer: 'Club de Ajedrez Metropolitano'
    },
    {
      id: 5,
      title: 'Taller de Fotografía de Naturaleza',
      description: 'Aprende técnicas de fotografía de flora y fauna en un entorno natural.',
      date: '2025-02-15',
      time: '09:00',
      location: 'Bosque Los Colomos',
      capacity: 25,
      registeredCount: 22,
      category: 'Taller',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 200,
      organizer: 'Escuela de Fotografía Verde'
    },
    {
      id: 6,
      title: 'Carrera Ecológica 5K',
      description: 'Carrera por senderos naturales promoviendo el cuidado del medio ambiente.',
      date: '2025-03-01',
      time: '07:00',
      location: 'Parque Metropolitano',
      capacity: 400,
      registeredCount: 320,
      category: 'Deportes',
      status: 'upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      price: 100,
      organizer: 'RunGreen Guadalajara'
    }
  ];

  const { data: events = mockEvents, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: false // Usar datos mock por ahora
  });

  const categories = ['Festival', 'Música', 'Mercado', 'Deportes', 'Taller'];
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
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
    return price === 0 ? 'Gratuito' : `$${price.toLocaleString()} MXN`;
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Eventos y Actividades
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                  <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {events.filter((e: Event) => e.status === 'upcoming').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Curso</p>
                  <p className="text-3xl font-bold text-green-600">
                    {events.filter((e: Event) => e.status === 'ongoing').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participantes</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {events.reduce((sum: number, e: Event) => sum + e.registeredCount, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o buscar con otros términos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                {viewMode === 'grid' ? (
                  <>
                    {event.imageUrl && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className={`absolute top-3 right-3 ${statusColors[event.status]}`}>
                          {statusLabels[event.status]}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{event.category}</Badge>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(event.price)}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {event.time} hrs
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.registeredCount}/{event.capacity} inscritos
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Organiza: {event.organizer}</p>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {event.imageUrl && (
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.category}</Badge>
                            <Badge className={statusColors[event.status]}>
                              {statusLabels[event.status]}
                            </Badge>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(event.price)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {event.time} hrs
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {event.registeredCount}/{event.capacity} inscritos
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">Organiza: {event.organizer}</p>
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

      {/* Footer institucional */}
      <footer className="bg-gradient-to-b from-[#067f5f] to-[#00a587] text-white">
        {/* Logo y descripción principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <img 
              src="/uploads/logos/logo-parques-mexico.png" 
              alt="Agencia Metropolitana de Bosques Urbanos" 
              className="h-16 w-auto mx-auto mb-6 filter brightness-0 invert"
            />
            <h2 className="text-2xl font-bold mb-4">Agencia Metropolitana de Bosques Urbanos</h2>
            <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
              Fortalecemos el tejido social a través de espacios verdes que conectan comunidades, 
              promueven la sostenibilidad y mejoran la calidad de vida en nuestra área metropolitana.
            </p>
          </div>

          {/* Enlaces organizados en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Columna 1 */}
            <div className="space-y-3">
              <a href="/" className="block text-white hover:text-[#bcd256] transition-colors">
                Inicio
              </a>
              <a href="/about" className="block text-white hover:text-[#bcd256] transition-colors">
                Nosotros
              </a>
              <a href="/activities" className="block text-white hover:text-[#bcd256] transition-colors">
                Eventos
              </a>
            </div>

            {/* Columna 2 */}
            <div className="space-y-3">
              <a href="/parks" className="block text-white hover:text-[#bcd256] transition-colors">
                Bosques Urbanos
              </a>
              <a href="/education" className="block text-white hover:text-[#bcd256] transition-colors">
                Educación Ambiental
              </a>
              <a href="/wildlife-rescue" className="block text-white hover:text-[#bcd256] transition-colors">
                Rescate de Fauna
              </a>
            </div>

            {/* Columna 3 */}
            <div className="space-y-3">
              <a href="/transparency" className="block text-white hover:text-[#bcd256] transition-colors">
                Transparencia
              </a>
              <a href="/bids" className="block text-white hover:text-[#bcd256] transition-colors">
                Licitaciones
              </a>
              <a href="/blog" className="block text-white hover:text-[#bcd256] transition-colors">
                Blog
              </a>
            </div>

            {/* Columna 4 */}
            <div className="space-y-3">
              <a href="/faq" className="block text-white hover:text-[#bcd256] transition-colors">
                Preguntas Frecuentes
              </a>
              <a href="/help" className="block text-white hover:text-[#bcd256] transition-colors">
                Quiero Ayudar
              </a>
              <a href="/contact" className="block text-white hover:text-[#bcd256] transition-colors">
                Contacto
              </a>
            </div>

            {/* Columna 5 - Servicios */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#bcd256] mb-2">Servicios</h4>
              <a href="/instructors" className="block text-white hover:text-[#bcd256] transition-colors">
                Instructores
              </a>
              <a href="/concessions" className="block text-white hover:text-[#bcd256] transition-colors">
                Concesiones
              </a>
              <a href="/tree-species" className="block text-white hover:text-[#bcd256] transition-colors">
                Especies Arbóreas
              </a>
            </div>

            {/* Columna 6 - Participación */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#bcd256] mb-2">Participa</h4>
              <a href="/volunteers" className="block text-white hover:text-[#bcd256] transition-colors">
                Voluntariado
              </a>
              <a href="/reports" className="block text-white hover:text-[#bcd256] transition-colors">
                Reportar Incidentes
              </a>
              <a href="/suggestions" className="block text-white hover:text-[#bcd256] transition-colors">
                Sugerencias
              </a>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="border-t border-emerald-500/30 pt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Dirección</h4>
                <p className="text-emerald-100 text-sm">
                  Av. Alcalde 1351, Miraflores<br/>
                  44270 Guadalajara, Jalisco
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Contacto</h4>
                <p className="text-emerald-100 text-sm">
                  Tel: (33) 3837-4400<br/>
                  bosques@guadalajara.gob.mx
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Horarios</h4>
                <p className="text-emerald-100 text-sm">
                  Lunes a Viernes: 8:00 - 15:00<br/>
                  Fines de semana: Espacios abiertos
                </p>
              </div>
            </div>
            
            <div className="text-sm text-emerald-200">
              © {new Date().getFullYear()} Agencia Metropolitana de Bosques Urbanos de Guadalajara. 
              Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Events;