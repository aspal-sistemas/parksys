import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MapPin, CalendarCheck, Star } from 'lucide-react';

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
  
  // Obtener datos de instructores de la ruta correcta para la página pública
  const { data: apiResponse = [], isLoading } = useQuery<any>({
    queryKey: ['/public-api/instructors/public'],
  });
  
  // Verificar qué estructura de datos tenemos
  let rawData: Instructor[] = [];
  
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
  
  // Procesar solamente entradas válidas
  rawData.forEach((instructor: any) => {
    if (instructor && instructor.id && !instructorsMap.has(instructor.id)) {
      instructorsMap.set(instructor.id, instructor);
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
                <CardFooter className="bg-gray-50 pt-3 pb-3 flex justify-between items-center">
                  {instructor.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{instructor.rating}/5</span>
                    </div>
                  )}
                  <Button variant="link" size="sm" className="text-primary px-0">
                    Ver perfil
                  </Button>
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
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Ver perfil
                      </Button>
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
    </div>
  );
};

export default InstructorsPage;