import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User,
  Heart,
  Clock,
  Award,
  Filter
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import AdSpace from '@/components/AdSpace';
const volunteerHeroImage = "/images/volunteer-hero.jpg";

interface Volunteer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  skills?: string;
  status: string;
  age?: number;
  gender?: string;
  availability?: string;
  experience?: string;
  interestAreas?: string;
  availableDays?: string;
  createdAt: string;
  profileImageUrl?: string;
  preferredParkId?: number;
  parkName?: string;
  volunteerActivities?: string[];
}

export default function VolunteersList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [parkFilter, setParkFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Consulta para obtener todos los voluntarios con información del parque
  const { data: volunteersResponse, isLoading, error } = useQuery({
    queryKey: ['/api/volunteers/public'],
    retry: 1,
    queryFn: async () => {
      const response = await fetch('/api/volunteers/public');
      if (!response.ok) throw new Error('Error cargando voluntarios');
      return response.json();
    }
  });

  // Manejar formato de respuesta variable (array directo o {data: array})
  const volunteers = Array.isArray(volunteersResponse) 
    ? volunteersResponse 
    : (volunteersResponse?.data || []);

  // Consulta para obtener lista de parques para el filtro
  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
    retry: 1,
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) throw new Error('Error cargando parques');
      return response.json();
    }
  });

  // Manejar formato de respuesta variable (array directo o {data: array})  
  const parks = Array.isArray(parksResponse) 
    ? parksResponse 
    : (parksResponse?.data || []);

  // Filtrar voluntarios
  const filteredVolunteers = volunteers.filter(volunteer => {
    const interestAreasString = Array.isArray(volunteer.interestAreas) 
      ? volunteer.interestAreas.join(' ')
      : volunteer.interestAreas || '';
    
    const matchesSearch = searchTerm === '' || 
      volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interestAreasString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.parkName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPark = parkFilter === 'all' || volunteer.preferredParkId?.toString() === parkFilter;
    
    return matchesSearch && matchesPark && volunteer.status === 'active';
  });

  // Paginación
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, parkFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando voluntarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Error cargando voluntarios</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* 1. Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={volunteerHeroImage} 
          alt="Voluntarios en parques de Guadalajara" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Users className="h-10 w-10" />
                <h1 className="font-guttery text-4xl md:text-5xl font-normal">
                  Conoce a
                </h1>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Nuestros Voluntarios
              </h2>
            </div>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Personas comprometidas que dedican su tiempo y esfuerzo para hacer de nuestros parques lugares mejores para todos
            </p>
          </div>
        </div>
      </div>

      {/* 2. Galería de Voluntarios en Acción */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                {/* Imagen 1 - Grande vertical - Educación ambiental con niños */}
                <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 row-span-2">
                  <img 
                    src="/volunteer-1.png"
                    alt="Voluntarios educando niños sobre medio ambiente en parque"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Imagen 2 - Mediano - Actividades deportivas */}
                <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <img 
                    src="/volunteer-2.png"
                    alt="Voluntarios organizando actividades deportivas para niños"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Imagen 3 - Grande horizontal - Gran grupo de voluntarios */}
                <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 col-span-2">
                  <img 
                    src="/volunteer-3.webp"
                    alt="Gran grupo de voluntarios celebrando en parque natural"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Imagen 4 - Grande cuadrado - Jardín japonés con voluntarios */}
                <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 col-span-2 row-span-2">
                  <img 
                    src="/volunteer-4.jpg"
                    alt="Voluntarios cuidando jardín japonés en parque de Guadalajara"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Motivacional con Estadísticas y CTA */}
      <section className="py-20 bg-gradient-to-br from-[#51a19f] to-[#00a587]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¡Sé Parte del Cambio!
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Únete a nuestra comunidad de voluntarios y ayuda a transformar los parques de Guadalajara. 
              Tu tiempo y dedicación marcan la diferencia en el cuidado de nuestros espacios verdes.
            </p>
          </div>

          {/* Estadísticas grandes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{filteredVolunteers.length}+</div>
              <div className="text-lg text-green-100 font-medium">Voluntarios Activos</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{parks.length}</div>
              <div className="text-lg text-green-100 font-medium">Parques Atendidos</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-lg text-green-100 font-medium">Horas Mensuales</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">25+</div>
              <div className="text-lg text-green-100 font-medium">Proyectos Completados</div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              className="bg-white text-[#00a587] hover:bg-gray-100 px-12 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
              size="lg"
              onClick={() => navigate('/volunteers/register')}
            >
              <Heart className="mr-3 h-6 w-6" />
              Únete como Voluntario
            </Button>
            <p className="text-green-100 mt-4 text-lg">
              Tu pasión por el medio ambiente puede transformar nuestra ciudad
            </p>
          </div>
        </div>
      </section>

      {/* 4. Sección de panel de filtros y búsqueda */}
      <section className="py-6" style={{backgroundColor: '#19633c'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, actividades o parque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                
                <Select value={parkFilter} onValueChange={setParkFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
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
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-white text-green-800 hover:bg-gray-100' : 'border-white text-white hover:bg-white hover:text-green-800'}
                >
                  Tarjetas
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-white text-green-800 hover:bg-gray-100' : 'border-white text-white hover:bg-white hover:text-green-800'}
                >
                  Lista
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-green-100">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVolunteers.length)} de {filteredVolunteers.length} voluntarios
            </p>
          </div>
        </div>
      </section>

      {/* 5. Sección de contenido */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentVolunteers.map((volunteer) => (
                    <Card key={volunteer.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          {/* Fotografía del voluntario */}
                          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                            {volunteer.profileImageUrl ? (
                              <img 
                                src={volunteer.profileImageUrl} 
                                alt={volunteer.fullName}
                                className="w-24 h-24 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-green-600 font-semibold text-xl">
                                {getInitials(volunteer.fullName)}
                              </span>
                            )}
                          </div>
                          
                          {/* Nombre completo */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {volunteer.fullName}
                            </h3>
                          </div>
                          
                          {/* Parque asignado */}
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-600">
                              {volunteer.parkName || 'Sin parque asignado'}
                            </span>
                          </div>
                          
                          {/* Actividades de voluntariado */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <Heart className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">Actividades:</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1">
                              {volunteer.interestAreas && Array.isArray(volunteer.interestAreas) ? (
                                volunteer.interestAreas.map((activity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {activity}
                                  </Badge>
                                ))
                              ) : volunteer.interestAreas && typeof volunteer.interestAreas === 'string' ? (
                                volunteer.interestAreas.split(',').map((activity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {activity.trim()}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">No especificadas</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
          ) : (
            <div className="space-y-4">
              {currentVolunteers.map((volunteer) => (
                <Card key={volunteer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Fotografía del voluntario */}
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                        {volunteer.profileImageUrl ? (
                          <img 
                            src={volunteer.profileImageUrl} 
                            alt={volunteer.fullName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-green-600 font-semibold text-lg">
                            {getInitials(volunteer.fullName)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Nombre completo */}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{volunteer.fullName}</h3>
                        </div>
                        
                        {/* Parque asignado */}
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Parque:</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {volunteer.parkName || 'Sin parque asignado'}
                          </p>
                        </div>
                        
                        {/* Actividades de voluntariado */}
                        <div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Actividades:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {volunteer.interestAreas && Array.isArray(volunteer.interestAreas) ? (
                              volunteer.interestAreas.map((activity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {activity}
                                </Badge>
                              ))
                            ) : volunteer.interestAreas && typeof volunteer.interestAreas === 'string' ? (
                              volunteer.interestAreas.split(',').map((activity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {activity.trim()}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No especificadas</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
              {filteredVolunteers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron voluntarios</h3>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-primary text-white" : "text-primary border-primary hover:bg-primary hover:text-white"}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
        </div>
      </section>

      {/* 5. Banner publicitario */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <AdSpace 
            spaceId="37"
            pageType="volunteers"
            position="banner"
          />
        </div>
      </section>

      {/* 6. Sección de Contacto - Necesitas más información */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Necesitas más información?</h2>
            <p className="text-lg text-gray-600">Nuestro equipo está aquí para ayudarte con el programa de voluntarios</p>
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
              <p className="text-gray-600 mb-2">voluntarios@parques.gdl.gob.mx</p>
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
}