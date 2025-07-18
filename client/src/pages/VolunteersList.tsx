import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import volunteerHeroImage from '@assets/happy-volunteer-couple-planting-trees-together-by-2025-01-16-13-28-02-utc_1752871919358.jpg';

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
}

export default function VolunteersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Consulta para obtener todos los voluntarios
  const { data: volunteers = [], isLoading, error } = useQuery<Volunteer[]>({
    queryKey: ['/api/volunteers'],
    queryFn: async () => {
      const response = await fetch('/api/volunteers');
      if (!response.ok) throw new Error('Error cargando voluntarios');
      return response.json();
    }
  });

  // Filtrar voluntarios
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = searchTerm === '' || 
      volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.interestAreas?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = skillFilter === 'all' || volunteer.skills?.toLowerCase().includes(skillFilter.toLowerCase());
    const matchesGender = genderFilter === 'all' || volunteer.gender === genderFilter;
    
    return matchesSearch && matchesSkill && matchesGender && volunteer.status === 'active';
  });

  // Paginación
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, skillFilter, genderFilter]);

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
      <div className="min-h-screen bg-gray-50">
      {/* Header Hero con imagen de fondo */}
      <div 
        className="relative py-24 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${volunteerHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">Nuestros Voluntarios</h1>
            <p className="text-xl max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Conoce a las personas comprometidas que dedican su tiempo y esfuerzo para hacer de nuestros parques lugares mejores para todos.
            </p>
            <div className="mt-8">
              <Button 
                className="bg-[#00a587] hover:bg-[#067f5f] text-white px-8 py-3 text-lg font-semibold shadow-lg"
                size="lg"
              >
                Únete como Voluntario
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{filteredVolunteers.length}</div>
              <div className="text-gray-600">Voluntarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(filteredVolunteers.map(v => v.skills).filter(Boolean)).size}
              </div>
              <div className="text-gray-600">Habilidades Diferentes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {filteredVolunteers.filter(v => v.gender === 'female').length}
              </div>
              <div className="text-gray-600">Mujeres</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {filteredVolunteers.filter(v => v.gender === 'male').length}
              </div>
              <div className="text-gray-600">Hombres</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, habilidades o intereses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los géneros</SelectItem>
                  <SelectItem value="male">Hombres</SelectItem>
                  <SelectItem value="female">Mujeres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Tarjetas
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner publicitario de ancho completo */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8">
        <AdSpace 
          spaceId={37}
          pageType="volunteers"
          position="banner"
        />
      </div>

      {/* Lista de voluntarios con sidebar */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Contenido principal */}
            <div className="flex-1">
              {/* Información de paginación */}
              <div className="mb-6 text-sm text-gray-600 text-center">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVolunteers.length)} de {filteredVolunteers.length} voluntarios
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentVolunteers.map((volunteer) => (
                <Card key={volunteer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
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
                      <div className="flex-1">
                        <CardTitle className="text-lg">{volunteer.fullName}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {volunteer.age && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{volunteer.age} años</span>
                            </div>
                          )}
                          {volunteer.gender && (
                            <Badge variant="outline" className="text-xs">
                              {volunteer.gender === 'male' ? 'Hombre' : 'Mujer'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{volunteer.email}</span>
                      </div>
                      
                      {volunteer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{volunteer.phone}</span>
                        </div>
                      )}
                      
                      {volunteer.skills && (
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-600">{volunteer.skills}</span>
                        </div>
                      )}
                      
                      {volunteer.availableDays && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-600">{volunteer.availableDays}</span>
                        </div>
                      )}
                      
                      {volunteer.interestAreas && (
                        <div className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-600">{volunteer.interestAreas}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Voluntario desde {formatDate(volunteer.createdAt)}</span>
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
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        {volunteer.profileImageUrl ? (
                          <img 
                            src={volunteer.profileImageUrl} 
                            alt={volunteer.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-green-600 font-semibold">
                            {getInitials(volunteer.fullName)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{volunteer.fullName}</h3>
                          <p className="text-sm text-gray-600">{volunteer.email}</p>
                          {volunteer.phone && (
                            <p className="text-sm text-gray-600">{volunteer.phone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Habilidades:</p>
                          <p className="text-sm text-gray-600">{volunteer.skills || 'No especificadas'}</p>
                          <p className="text-sm font-medium text-gray-700 mt-2">Disponibilidad:</p>
                          <p className="text-sm text-gray-600">{volunteer.availableDays || 'No especificada'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Intereses:</p>
                          <p className="text-sm text-gray-600">{volunteer.interestAreas || 'No especificados'}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Voluntario desde {formatDate(volunteer.createdAt)}
                          </p>
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

            {/* Sidebar Publicitario */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-4 space-y-4">
                {/* Espacio 1 - Programas de Voluntariado */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <AdSpace spaceId="20" position="sidebar" pageType="volunteers" />
                </div>

                {/* Espacio 2 - Capacitación */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <AdSpace spaceId="21" position="sidebar" pageType="volunteers" />
                </div>

                {/* Espacio 3 - Eventos Comunitarios */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                  <AdSpace spaceId="22" position="sidebar" pageType="volunteers" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Quieres ser voluntario?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestro equipo de voluntarios y ayuda a hacer la diferencia en tu comunidad.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
            Registrarse como Voluntario
          </Button>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}