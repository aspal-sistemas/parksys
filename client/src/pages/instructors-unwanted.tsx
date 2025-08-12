import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Award,
  Clock,
  Star,
  Grid,
  List,
  Eye
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import yogaHeroImage from "@assets/yoga 1_1754962456652.jpg";

interface Instructor {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  specialties: string;
  experience_years: number;
  certifications: string | null;
  availability: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  profile_image_url?: string | null;
  rating?: number;
}

export default function InstructorsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Consulta para obtener instructores
  const { data: instructorsResponse, isLoading } = useQuery({
    queryKey: ['/api/instructors/public'],
    retry: 1,
    queryFn: async () => {
      const response = await fetch('/api/instructors/public');
      if (!response.ok) throw new Error('Error cargando instructores');
      return response.json();
    }
  });

  const instructors = Array.isArray(instructorsResponse) 
    ? instructorsResponse.filter((i: Instructor) => i.status === 'active')
    : [];

  // Obtener todas las especialidades únicas
  const allSpecialties = useMemo(() => {
    const specialtiesSet = new Set<string>();
    instructors.forEach((instructor: Instructor) => {
      if (instructor.specialties) {
        instructor.specialties.split(',').forEach((specialty: string) => {
          specialtiesSet.add(specialty.trim());
        });
      }
    });
    return Array.from(specialtiesSet);
  }, [instructors]);

  // Función para obtener especialidades como array
  const getSpecialtiesArray = (specialties: string): string[] => {
    if (!specialties) return [];
    return specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  // Filtrar instructores
  const filteredInstructors = useMemo(() => {
    return instructors.filter((instructor: Instructor) => {
      const matchesSearch = !searchTerm || 
        instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (instructor.specialties && instructor.specialties.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = specialtyFilter === 'all' || 
        (instructor.specialties && instructor.specialties.includes(specialtyFilter));
      
      const matchesExperience = experienceFilter === 'all' || 
        (experienceFilter === '1-3' && instructor.experience_years >= 1 && instructor.experience_years <= 3) ||
        (experienceFilter === '4-7' && instructor.experience_years >= 4 && instructor.experience_years <= 7) ||
        (experienceFilter === '8+' && instructor.experience_years >= 8);

      return matchesSearch && matchesSpecialty && matchesExperience;
    });
  }, [instructors, searchTerm, specialtyFilter, experienceFilter]);

  // Paginación
  const currentInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Función para renderizar estrellas
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const handleViewProfile = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setProfileDialogOpen(true);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando instructores...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* 1. Sección Hero */}
      <section 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 165, 135, 0.9), rgba(25, 99, 60, 0.8)), url(${yogaHeroImage})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00a587]/90 to-[#19633c]/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Nuestros <span className="text-yellow-300">Instructores</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              Profesionales certificados comprometidos con el bienestar de nuestra comunidad
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sección de estadísticas */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#51a19f'}}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{instructors.length}+</h3>
              <p className="text-gray-600">Instructores activos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#51a19f'}}>
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{allSpecialties.length}+</h3>
              <p className="text-gray-600">Especialidades diferentes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#51a19f'}}>
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">30+</h3>
              <p className="text-gray-600">Sesiones mensuales</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección de panel de filtros y búsqueda */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Conoce a los instructores registrados
            </h3>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, especialidades o experiencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder="Filtrar por especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {allSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder="Filtrar por experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="1-3">1-3 años</SelectItem>
                    <SelectItem value="4-7">4-7 años</SelectItem>
                    <SelectItem value="8+">8+ años</SelectItem>
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
            
            <p className="text-sm text-black">
              Mostrando {Math.min(currentPage * itemsPerPage, filteredInstructors.length)} de {filteredInstructors.length} instructores
            </p>
          </div>
        </div>
      </section>

      {/* 4. Sección de contenido */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentInstructors.map((instructor) => (
                <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage 
                          src={instructor.profile_image_url || undefined} 
                          alt={instructor.full_name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold text-lg">
                          {instructor.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{instructor.full_name}</h3>
                        <p className="text-primary flex items-center justify-center gap-1">
                          <Award className="h-4 w-4" />
                          {instructor.experience_years} años de experiencia
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getSpecialtiesArray(instructor.specialties).slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {getSpecialtiesArray(instructor.specialties).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{getSpecialtiesArray(instructor.specialties).length - 2} más
                            </Badge>
                          )}
                        </div>
                        
                        {instructor.rating && renderStars(instructor.rating)}
                      </div>
                      
                      <div className="flex gap-2 justify-center pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewProfile(instructor)}
                          className="bg-[#00a587] hover:bg-[#19633c]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentInstructors.map((instructor) => (
                <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={instructor.profile_image_url || undefined} 
                          alt={instructor.full_name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                          {instructor.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{instructor.full_name}</h3>
                        <p className="text-primary flex items-center gap-1 mb-2">
                          <Award className="h-4 w-4" />
                          {instructor.experience_years} años de experiencia
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {getSpecialtiesArray(instructor.specialties).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        {instructor.rating && (
                          <div className="mt-2">{renderStars(instructor.rating)}</div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleViewProfile(instructor)}
                        className="bg-[#00a587] hover:bg-[#19633c]"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                className="bg-[#00a587] hover:bg-[#19633c]"
              >
                Limpiar Filtros
              </Button>
            </div>
          )}

          {/* Paginación */}
          {filteredInstructors.length > itemsPerPage && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-700">
                Página {currentPage} de {Math.ceil(filteredInstructors.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInstructors.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(filteredInstructors.length / itemsPerPage)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </section>

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

                {/* Certificaciones */}
                {selectedInstructor.certifications && (
                  <div>
                    <h4 className="font-semibold mb-2">Certificaciones</h4>
                    <p className="text-gray-700">{selectedInstructor.certifications}</p>
                  </div>
                )}

                {/* Disponibilidad */}
                {selectedInstructor.availability && (
                  <div>
                    <h4 className="font-semibold mb-2">Disponibilidad</h4>
                    <p className="text-gray-700">{selectedInstructor.availability}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}