import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Grid, List, Star, Phone, Mail, Award, Clock, User, MessageSquare, Users, MapPin } from 'lucide-react';
import PublicInstructorEvaluationForm from '@/components/PublicInstructorEvaluationForm';
import heroImage from '@assets/cropped-shot-of-handsome-young-rugby-coach-standin-2025-04-06-09-42-40-utc_1751510249661.jpg';

// Tipo de datos para un instructor
interface Instructor {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  specialties?: string;
  experience_years: number;
  status: string;
  profile_image_url?: string;
  created_at?: string;
  rating?: number;
}

const InstructorsPage: React.FC = () => {
  // Helper function para procesar especialidades
  const getSpecialtiesArray = (specialties: string | string[] | undefined) => {
    if (!specialties) return [];
    
    // Si ya es un array, devolverlo
    if (Array.isArray(specialties)) return specialties;
    
    // Si es un string, procesar diferentes formatos
    if (typeof specialties === 'string') {
      // Formato PostgreSQL array: {"Yoga","Danzas Ocultas"}
      if (specialties.startsWith('{') && specialties.endsWith('}')) {
        // Remover llaves y dividir por comas, luego limpiar comillas
        const cleanedString = specialties.slice(1, -1); // Quitar { y }
        return cleanedString
          .split(',')
          .map(s => s.trim().replace(/^"/, '').replace(/"$/, '')) // Quitar comillas
          .filter(s => s.length > 0);
      }
      
      // Intentar parsear como JSON array estándar
      try {
        const parsed = JSON.parse(specialties);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Si falla el parsing JSON, usar split por comas
      }
      
      // Formato separado por comas: "Yoga,Meditación,Bienestar"
      return specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return [];
  };

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [evaluationInstructor, setEvaluationInstructor] = useState<Instructor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Obtener datos de instructores de la ruta correcta para la página pública
  const { data: apiResponse = [], isLoading } = useQuery<any>({
    queryKey: ['/public-api/instructors/public'],
  });
  
  // Verificar qué estructura de datos tenemos
  let rawData: any[] = [];
  
  if (Array.isArray(apiResponse)) {
    rawData = apiResponse;
  } else if (apiResponse && 'data' in apiResponse) {
    rawData = apiResponse.data || [];
  } else if (apiResponse && typeof apiResponse === 'object') {
    rawData = [apiResponse];
  }
  
  // Eliminar duplicados usando Map con ID como clave
  const instructorsMap = new Map<number, Instructor>();
  
  // Procesar solamente entradas válidas y adaptar formato de campos
  rawData.forEach((data: any) => {
    if (data && data.id && !instructorsMap.has(data.id)) {
      const instructor: Instructor = {
        id: data.id,
        full_name: data.fullName || data.full_name || '',
        email: data.email || '',
        phone: data.phoneNumber || data.phone || '',
        specialties: data.specialties || '',
        experience_years: data.experience || data.experience_years || 0,
        status: data.status || 'active',
        profile_image_url: data.profileImageUrl || data.profile_image_url || null,
        created_at: data.createdAt || data.created_at || '',
        rating: data.rating || null
      };
      
      instructorsMap.set(data.id, instructor);
    }
  });
  
  // Convertir el Map a array
  const instructors = Array.from(instructorsMap.values());
  
  // Extraer especialidades únicas para el filtro
  const allSpecialties = new Set<string>();
  instructors.forEach(instructor => {
    if (instructor.specialties) {
      const specialtiesArray = getSpecialtiesArray(instructor.specialties);
      
      specialtiesArray.forEach(specialty => {
        const trimmed = typeof specialty === 'string' ? specialty.trim() : '';
        if (trimmed) allSpecialties.add(trimmed);
      });
    }
  });
  
  // Filtrar instructores
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = searchTerm === '' || 
      instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === '' || specialtyFilter === 'all' || 
      (instructor.specialties && instructor.specialties.toLowerCase().includes(specialtyFilter.toLowerCase()));
    
    const matchesExperience = experienceFilter === '' || experienceFilter === 'all' || 
      (experienceFilter === '1-3' && instructor.experience_years >= 1 && instructor.experience_years <= 3) ||
      (experienceFilter === '4-7' && instructor.experience_years >= 4 && instructor.experience_years <= 7) ||
      (experienceFilter === '8+' && instructor.experience_years >= 8);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  // Paginación
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstructors = filteredInstructors.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, specialtyFilter, experienceFilter]);

  const openProfile = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setProfileDialogOpen(true);
  };

  const openEvaluation = (instructor: Instructor) => {
    setEvaluationInstructor(instructor);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando instructores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conoce a Nuestros <span className="text-yellow-300">Instructores</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Profesionales experimentados comprometidos con crear experiencias únicas en nuestros parques
            </p>
            <div className="mt-8 flex justify-center items-center space-x-8 text-emerald-100">
              <div className="text-center">
                <div className="text-3xl font-bold">{instructors.length}</div>
                <div className="text-sm">Instructores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{allSpecialties.size}</div>
                <div className="text-sm">Especialidades</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-sm">Calificación Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros y Controles */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar instructores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Array.from(allSpecialties).map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1-3">1-3 años</SelectItem>
                    <SelectItem value="4-7">4-7 años</SelectItem>
                    <SelectItem value="8+">8+ años</SelectItem>
                  </SelectContent>
                </Select>

                {/* Toggle de vista */}
                <div className="flex border rounded-lg bg-gray-50">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Botón de limpiar filtros */}
            {(searchTerm || specialtyFilter || experienceFilter) && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSpecialtyFilter('all');
                    setExperienceFilter('all');
                  }}
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredInstructors.length)} de {filteredInstructors.length} instructores
          </p>
        </div>

        {/* Vista Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentInstructors.map((instructor) => (
              <Card key={instructor.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
                <CardHeader className="text-center pb-2">
                  <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-primary/10">
                    <AvatarImage 
                      src={instructor.profile_image_url || undefined} 
                      alt={instructor.full_name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold text-lg">
                      {instructor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {instructor.full_name}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1 text-primary">
                    <Award className="h-4 w-4" />
                    {instructor.experience_years} años de experiencia
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Especialidades */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {getSpecialtiesArray(instructor.specialties).slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {specialty}
                        </Badge>
                      ))}
                      {getSpecialtiesArray(instructor.specialties).length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          +{getSpecialtiesArray(instructor.specialties).length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {renderStars(instructor.rating || 0)}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openProfile(instructor)}
                      className="flex-1 text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Ver Perfil
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => openEvaluation(instructor)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Evaluar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Evaluar a {instructor.full_name}</DialogTitle>
                          <DialogDescription>
                            Comparte tu experiencia con este instructor
                          </DialogDescription>
                        </DialogHeader>
                        <PublicInstructorEvaluationForm 
                          instructorId={instructor.id} 
                          instructorName={instructor.full_name}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <div className="space-y-4 mb-8">
            {currentInstructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 ring-4 ring-primary/10">
                        <AvatarImage 
                          src={instructor.profile_image_url || undefined} 
                          alt={instructor.full_name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                          {instructor.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{instructor.full_name}</h3>
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <Award className="h-4 w-4" />
                          <span>{instructor.experience_years} años de experiencia</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {getSpecialtiesArray(instructor.specialties).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        {renderStars(instructor.rating || 0)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openProfile(instructor)}
                        className="text-primary border-primary hover:bg-primary hover:text-white"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => openEvaluation(instructor)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Evaluar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Evaluar a {instructor.full_name}</DialogTitle>
                            <DialogDescription>
                              Comparte tu experiencia con este instructor
                            </DialogDescription>
                          </DialogHeader>
                          <PublicInstructorEvaluationForm 
                            instructorId={instructor.id} 
                            instructorName={instructor.full_name}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
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
                  className={currentPage === pageNum 
                    ? "bg-primary hover:bg-primary-600" 
                    : "text-primary border-primary hover:bg-primary hover:text-white"
                  }
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

        {/* Estado vacío */}
        {filteredInstructors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron instructores</h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros o buscar con otros términos
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSpecialtyFilter('all');
                setExperienceFilter('all');
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Dialog para ver perfil completo */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedInstructor && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={selectedInstructor.profile_image_url || undefined} 
                      alt={selectedInstructor.full_name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold text-lg">
                      {selectedInstructor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedInstructor.full_name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-primary">
                      <Award className="h-4 w-4" />
                      {selectedInstructor.experience_years} años de experiencia
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Especialidades */}
                <div>
                  <h4 className="font-semibold mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {getSpecialtiesArray(selectedInstructor.specialties).map((specialty, index) => (
                      <Badge key={index} className="bg-primary text-white">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Información de contacto */}
                <div>
                  <h4 className="font-semibold mb-2">Información de Contacto</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedInstructor.email}</span>
                    </div>
                    {selectedInstructor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedInstructor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {selectedInstructor.rating && (
                  <div>
                    <h4 className="font-semibold mb-2">Calificación</h4>
                    {renderStars(selectedInstructor.rating)}
                  </div>
                )}

                {/* Estado */}
                <div>
                  <h4 className="font-semibold mb-2">Estado</h4>
                  <Badge variant={selectedInstructor.status === 'active' ? 'default' : 'secondary'}>
                    {selectedInstructor.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-primary to-primary-600"
                  >
                    <a href={`/instructor/${selectedInstructor.id}`} target="_blank" rel="noopener noreferrer">
                      Ver Perfil Completo
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorsPage;