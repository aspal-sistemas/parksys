import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, RefreshCw, Plus, AlertCircle, Download, Users, 
  Briefcase, GraduationCap, ChevronDown, Database, 
  UserCheck, Filter, X
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InstructorCard from '@/components/InstructorCard';

// Tipo para los instructores
interface Instructor {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  specialties?: string;
  experience_years: number;
  status: string;
  profile_image_url?: string;
  created_at: string;
  rating?: number;
}

export default function InstructorsCardsView() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');

  // Obtener datos de instructores
  const { data: instructors, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/instructors'],
    retry: 1,
    enabled: true,
  });

  // Filtrar instructores según criterios de búsqueda
  const filteredInstructors = React.useMemo(() => {
    if (!instructors) return [];
    
    return instructors.filter((instructor: Instructor) => {
      // Filtro por término de búsqueda (nombre o email)
      const matchesSearch = searchTerm === '' || 
        instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estado
      const matchesStatus = filterStatus === 'all' || instructor.status === filterStatus;
      
      // Filtro por especialidad
      const matchesSpecialty = filterSpecialty === 'all' || 
        (instructor.specialties && instructor.specialties.toLowerCase().includes(filterSpecialty.toLowerCase()));
      
      // Filtro por años de experiencia
      let matchesExperience = true;
      if (filterExperience !== 'all') {
        const years = instructor.experience_years || 0;
        if (filterExperience === 'novice' && years > 2) matchesExperience = false;
        if (filterExperience === 'intermediate' && (years < 3 || years > 5)) matchesExperience = false;
        if (filterExperience === 'expert' && years < 6) matchesExperience = false;
      }
      
      return matchesSearch && matchesStatus && matchesSpecialty && matchesExperience;
    });
  }, [instructors, searchTerm, filterStatus, filterSpecialty, filterExperience]);

  // Lista de especialidades únicas para el filtro
  const specialties = React.useMemo(() => {
    if (!instructors) return [];
    
    const allSpecialties = new Set<string>();
    instructors.forEach((instructor: Instructor) => {
      if (instructor.specialties) {
        const specialtiesList = instructor.specialties.split(',');
        specialtiesList.forEach(specialty => {
          allSpecialties.add(specialty.trim());
        });
      }
    });
    
    return Array.from(allSpecialties);
  }, [instructors]);

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterSpecialty('all');
    setFilterExperience('all');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instructores</h1>
            <p className="text-muted-foreground">
              Explora todos los instructores disponibles para las actividades.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setLocation('/admin/instructors')}
            >
              <Users className="mr-2 h-4 w-4" />
              Ver como lista
            </Button>
            <Button onClick={() => setLocation('/admin/users')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Instructor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">
                  {instructors ? instructors.length : 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">
                  {instructors ? instructors.filter((i: Instructor) => i.status === 'active').length : 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Experiencia promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-2xl font-bold">
                  {instructors && instructors.length > 0 
                    ? Math.round(instructors.reduce((sum: number, i: Instructor) => sum + (i.experience_years || 0), 0) / instructors.length) 
                    : 0} años
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold">
                  {specialties.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-medium">Filtros</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto" 
              onClick={resetFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((specialty, index) => (
                    <SelectItem key={index} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterExperience} onValueChange={setFilterExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Experiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier nivel</SelectItem>
                  <SelectItem value="novice">Principiante (0-2 años)</SelectItem>
                  <SelectItem value="intermediate">Intermedio (3-5 años)</SelectItem>
                  <SelectItem value="expert">Experto (6+ años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Botones para cargar datos */}
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={() => refetch()}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar datos
          </Button>
          
          <Button 
            onClick={() => {
              fetch('/api/admin/seed/instructors', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(response => response.json())
              .then(() => {
                refetch();
                alert("Datos de muestra de instructores cargados correctamente");
              })
              .catch(error => {
                console.error("Error al cargar datos de muestra:", error);
                alert("Error al cargar datos de muestra: " + error.message);
              });
            }}
            variant="secondary"
          >
            <Database className="mr-2 h-4 w-4" />
            Cargar datos de muestra
          </Button>
        </div>

        {/* Tarjetas de instructores */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Cargando instructores...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border p-6">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className="mt-2 text-red-500">Error al cargar los instructores</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : filteredInstructors?.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border p-6">
            <UserCheck className="h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">
              {instructors ? "No se encontraron instructores que coincidan con los criterios de búsqueda." : "Haz clic en 'Actualizar datos' para ver los instructores."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInstructors.map((instructor: Instructor) => (
              <InstructorCard 
                key={instructor.id} 
                instructor={instructor} 
                showActions={true}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}