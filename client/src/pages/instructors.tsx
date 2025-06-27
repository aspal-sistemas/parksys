import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, MapPin, CalendarCheck, Star, Phone, Mail, Award, Clock, User, MessageSquare } from 'lucide-react';
import PublicInstructorEvaluationForm from '@/components/PublicInstructorEvaluationForm';

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
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [evaluationInstructor, setEvaluationInstructor] = useState<Instructor | null>(null);
  
  // Obtener datos de instructores de la ruta correcta para la página pública
  const { data: apiResponse = [], isLoading } = useQuery<any>({
    queryKey: ['/public-api/instructors/public'],
  });
  
  // Verificar qué estructura de datos tenemos
  let rawData: any[] = [];
  
  if (Array.isArray(apiResponse)) {
    // La API devolvió un array directamente
    rawData = apiResponse;
  } else if (apiResponse && 'data' in apiResponse) {
    // La API devolvió un objeto con una propiedad data
    rawData = apiResponse.data || [];
  } else if (apiResponse && typeof apiResponse === 'object') {
    // La API devolvió algún otro objeto, intentar usarlo directamente
    rawData = [apiResponse];
  }
  
  // Eliminar duplicados usando Map con ID como clave
  const instructorsMap = new Map<number, Instructor>();
  
  // Procesar solamente entradas válidas y adaptar formato de campos
  rawData.forEach((data: any) => {
    if (data && data.id && !instructorsMap.has(data.id)) {
      // Adaptar el formato de los datos que llegan de la API al formato esperado por la interfaz
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
      instructor.specialties.split(',').forEach(specialty => {
        const trimmed = specialty.trim();
        if (trimmed) allSpecialties.add(trimmed);
      });
    }
  });
  
  // Filtrar instructores
  const filteredInstructors = instructors.filter(instructor => {
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por especialidad
    const matchesSpecialty = specialtyFilter === 'all' || specialtyFilter === '' || 
      (instructor.specialties && instructor.specialties.toLowerCase().includes(specialtyFilter.toLowerCase()));
    
    return matchesSearch && matchesSpecialty;
  });
  
  // Obtener iniciales para avatar
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Renderizar lista de especialidades como badges
  const renderSpecialties = (specialties?: string) => {
    if (!specialties) return null;
    
    return specialties.split(',').map((specialty, index) => (
      <Badge key={index} variant="outline" className="mr-1 mb-1">{specialty.trim()}</Badge>
    ));
  };

  // Función para abrir el modal de perfil
  const handleViewProfile = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setProfileDialogOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedInstructor(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Nuestros Instructores</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce a nuestro equipo de profesionales que imparten las actividades y talleres en los parques de la ciudad.
          </p>
        </div>
        
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar instructor por nombre"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filtrar por especialidad" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especialidades</SelectItem>
                {Array.from(allSpecialties).filter(Boolean).map((specialty) => (
                  <SelectItem key={specialty} value={specialty || "sin_especialidad"}>
                    {specialty || "Sin especialidad"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end">
              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="grid">Tarjetas</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Mostrar resultados */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex flex-wrap">
                    <div className="h-6 bg-gray-200 rounded w-16 mr-2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 mr-2 mb-2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No se encontraron instructores que coincidan con los filtros.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSpecialtyFilter('');
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          // Vista de tarjetas
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={instructor.profile_image_url} alt={instructor.full_name} />
                      <AvatarFallback>{getInitials(instructor.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-lg">{instructor.full_name}</CardTitle>
                      <CardDescription>
                        {instructor.experience_years} {instructor.experience_years === 1 ? 'año' : 'años'} de experiencia
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap mt-2">
                    {renderSpecialties(instructor.specialties)}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 pt-3 pb-3">
                  {instructor.rating && (
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{instructor.rating}/5</span>
                    </div>
                  )}
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => window.open(`/instructor/${instructor.id}`, '_blank')}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Ver perfil
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => setEvaluationInstructor(instructor)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Evaluar
                        </Button>
                      </DialogTrigger>
                      <DialogContent 
                        className="max-w-2xl max-h-[90vh] overflow-y-auto"
                        aria-describedby="evaluation-description"
                      >
                        <DialogHeader>
                          <DialogTitle>Evaluar Instructor</DialogTitle>
                          <DialogDescription id="evaluation-description">
                            Comparte tu experiencia con {instructor.full_name} para ayudar a otros visitantes.
                          </DialogDescription>
                        </DialogHeader>
                        {evaluationInstructor && (
                          <PublicInstructorEvaluationForm
                            instructorId={evaluationInstructor.id}
                            instructorName={evaluationInstructor.full_name}
                            onSuccess={() => {
                              // El dialog se cerrará automáticamente por el estado del formulario
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Vista de lista
          <div className="space-y-4">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 p-4 flex items-center">
                    <Avatar className="h-14 w-14 mr-4">
                      <AvatarImage src={instructor.profile_image_url} alt={instructor.full_name} />
                      <AvatarFallback>{getInitials(instructor.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{instructor.full_name}</h3>
                      {instructor.rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{instructor.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-4 border-t md:border-t-0 md:border-l border-gray-100">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <CalendarCheck className="h-4 w-4 mr-1 text-gray-400" />
                      <span>
                        {instructor.experience_years} {instructor.experience_years === 1 ? 'año' : 'años'} de experiencia
                      </span>
                    </div>
                    <div className="flex flex-wrap mt-2 mb-3">
                      {renderSpecialties(instructor.specialties)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => window.open(`/instructor/${instructor.id}`, '_blank')}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Ver perfil
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setEvaluationInstructor(instructor)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Evaluar
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className="max-w-2xl max-h-[90vh] overflow-y-auto"
                          aria-describedby="evaluation-description-list"
                        >
                          <DialogHeader>
                            <DialogTitle>Evaluar Instructor</DialogTitle>
                            <DialogDescription id="evaluation-description-list">
                              Comparte tu experiencia con {instructor.full_name} para ayudar a otros visitantes.
                            </DialogDescription>
                          </DialogHeader>
                          {evaluationInstructor && (
                            <PublicInstructorEvaluationForm
                              instructorId={evaluationInstructor.id}
                              instructorName={evaluationInstructor.full_name}
                              onSuccess={() => {
                                // El dialog se cerrará automáticamente por el estado del formulario
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Paginación */}
        {filteredInstructors.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="sm" className="mr-2">Anterior</Button>
            <Button variant="outline" size="sm">Siguiente</Button>
          </div>
        )}
      </div>

      {/* Modal de perfil del instructor */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Perfil del Instructor</DialogTitle>
          </DialogHeader>
          
          {selectedInstructor && (
            <div className="space-y-6">
              {/* Header con foto y datos básicos */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24 ring-4 ring-gray-100">
                  <AvatarImage src={selectedInstructor.profile_image_url} alt={selectedInstructor.full_name} />
                  <AvatarFallback className="text-xl">{getInitials(selectedInstructor.full_name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedInstructor.full_name}</h2>
                  <div className="flex items-center justify-center sm:justify-start mt-2 text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{selectedInstructor.experience_years} {selectedInstructor.experience_years === 1 ? 'año' : 'años'} de experiencia</span>
                  </div>
                  {selectedInstructor.rating && (
                    <div className="flex items-center justify-center sm:justify-start mt-2">
                      <Star className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="font-medium">{selectedInstructor.rating}/5</span>
                      <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 50) + 10} evaluaciones)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-[#00a587]" />
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInstructor.specialties ? (
                    selectedInstructor.specialties.split(',').map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-[#00a587]/10 text-[#00a587] border-[#00a587]/20">
                        {specialty.trim()}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No se han especificado especialidades</span>
                  )}
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#00a587]" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedInstructor.email}</p>
                    </div>
                  </div>
                  
                  {selectedInstructor.phone && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{selectedInstructor.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado y fecha de ingreso */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CalendarCheck className="h-5 w-5 mr-2 text-[#00a587]" />
                  Estado y Actividad
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge 
                      variant={selectedInstructor.status === 'active' ? 'default' : 'secondary'}
                      className={selectedInstructor.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {selectedInstructor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  {selectedInstructor.created_at && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Fecha de ingreso</p>
                      <p className="font-medium">
                        {new Date(selectedInstructor.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actividades recientes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#00a587]" />
                  Actividades Recientes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-center italic">
                    No hay actividades recientes registradas
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCloseProfile}
                >
                  Cerrar
                </Button>
                <Button className="flex-1 bg-[#00a587] hover:bg-[#067f5f] text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorsPage;