import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  User, 
  Mail, 
  Phone,
  Award,
  Calendar,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties: string[];
  experience: string;
  experienceYears: number;
  bio?: string;
  profileImageUrl?: string;
  hourlyRate?: number;
  availability?: string;
  qualifications?: string;
  preferredParkId?: number;
  preferredParkName?: string;
  createdAt: string;
  userId?: number;
  rating?: number;
  activitiesCount?: number;
}

export default function InstructorsManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);
  
  // Estados para filtros
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener lista de instructores
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ['/api/instructors'],
  });

  // Mutación para eliminar instructor
  const deleteInstructorMutation = useMutation({
    mutationFn: async (instructorId: number) => {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar instructor');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Instructor eliminado',
        description: 'El instructor ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      queryClient.invalidateQueries({ queryKey: ['/public-api/instructors/public'] });
      setShowDeleteDialog(false);
      setInstructorToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar instructor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Obtener especialidades únicas para el filtro
  const uniqueSpecialties = Array.from(
    new Set(
      (instructors as Instructor[]).flatMap(instructor => 
        Array.isArray(instructor.specialties) ? instructor.specialties : []
      )
    )
  ).sort();

  // Aplicar todos los filtros
  let filteredInstructors = (instructors as Instructor[]).filter((instructor: Instructor) => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery === '' || 
      `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(instructor.specialties) ? instructor.specialties : []).some(specialty => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Filtro por especialidad
    const matchesSpecialty = specialtyFilter === 'all' || specialtyFilter === '' || 
      (Array.isArray(instructor.specialties) ? instructor.specialties : []).includes(specialtyFilter);

    // Filtro por calificación
    const matchesRating = ratingFilter === 'all' || ratingFilter === '' || 
      (instructor.rating && instructor.rating >= parseFloat(ratingFilter));

    // Filtro por experiencia
    const matchesExperience = experienceFilter === 'all' || experienceFilter === '' || 
      (experienceFilter === '0-2' && instructor.experienceYears <= 2) ||
      (experienceFilter === '3-5' && instructor.experienceYears >= 3 && instructor.experienceYears <= 5) ||
      (experienceFilter === '6-10' && instructor.experienceYears >= 6 && instructor.experienceYears <= 10) ||
      (experienceFilter === '10+' && instructor.experienceYears > 10);

    return matchesSearch && matchesSpecialty && matchesRating && matchesExperience;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstructors = filteredInstructors.slice(startIndex, endIndex);

  // Reset página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, specialtyFilter, ratingFilter, experienceFilter]);

  const handleDeleteInstructor = (instructor: Instructor) => {
    setInstructorToDelete(instructor);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (instructorToDelete) {
      deleteInstructorMutation.mutate(instructorToDelete.id);
    }
  };

  const formatSpecialties = (specialties: string[] | null | undefined) => {
    if (!specialties || !Array.isArray(specialties)) {
      return <Badge variant="outline" className="text-gray-500">Sin especialidades</Badge>;
    }
    return specialties.slice(0, 3).map((specialty, index) => (
      <Badge key={index} variant="secondary" className="bg-[#00a587]/10 text-[#00a587] mr-1 mb-1">
        {specialty}
      </Badge>
    ));
  };

  const renderStars = (rating: number) => {
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

  return (
    <AdminLayout title="Gestión de Instructores">
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Instructores</p>
                  <p className="text-2xl font-bold text-[#00a587]">{instructors.length}</p>
                </div>
                <User className="h-8 w-8 text-[#00a587]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Especialidades</p>
                  <p className="text-2xl font-bold text-[#067f5f]">
                    {new Set(instructors.flatMap((i: Instructor) => i.specialties)).size}
                  </p>
                </div>
                <Award className="h-8 w-8 text-[#067f5f]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio Experiencia</p>
                  <p className="text-2xl font-bold text-[#8498a5]">
                    {instructors.length > 0 
                      ? Math.round(instructors.reduce((acc: number, i: Instructor) => acc + i.experienceYears, 0) / instructors.length)
                      : 0} años
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#8498a5]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-[#bcd256]">
                    {instructors.length > 0 
                      ? (instructors.reduce((acc: number, i: Instructor) => acc + (i.rating || 0), 0) / instructors.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-[#bcd256]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar instructores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/admin/activities/instructors/new">
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Instructor
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por especialidad */}
              <div>
                <label className="text-sm font-medium mb-2 block">Especialidad</label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {uniqueSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por calificación */}
              <div>
                <label className="text-sm font-medium mb-2 block">Calificación mínima</label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las calificaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las calificaciones</SelectItem>
                    <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                    <SelectItem value="4.0">4.0+ estrellas</SelectItem>
                    <SelectItem value="3.5">3.5+ estrellas</SelectItem>
                    <SelectItem value="3.0">3.0+ estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por experiencia */}
              <div>
                <label className="text-sm font-medium mb-2 block">Años de experiencia</label>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toda la experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toda la experiencia</SelectItem>
                    <SelectItem value="0-2">0-2 años</SelectItem>
                    <SelectItem value="3-5">3-5 años</SelectItem>
                    <SelectItem value="6-10">6-10 años</SelectItem>
                    <SelectItem value="10+">Más de 10 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botón limpiar filtros */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSpecialtyFilter('all');
                    setRatingFilter('all');
                    setExperienceFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de instructores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Instructores</CardTitle>
            <CardDescription>
              Gestiona los instructores que imparten actividades en los parques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
              </div>
            ) : paginatedInstructors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || (specialtyFilter !== 'all' && specialtyFilter !== '') || (ratingFilter !== 'all' && ratingFilter !== '') || (experienceFilter !== 'all' && experienceFilter !== '') 
                  ? 'No se encontraron instructores que coincidan con los filtros aplicados' 
                  : 'No hay instructores registrados'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Experiencia</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Parque Preferido</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstructors.map((instructor: Instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={instructor.profileImageUrl} />
                          <AvatarFallback>
                            {instructor.firstName?.[0] || 'I'}{instructor.lastName?.[0] || 'N'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {instructor.firstName || 'Sin nombre'} {instructor.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {instructor.activitiesCount || 0} actividades
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {instructor.email}
                          </div>
                          {instructor.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="mr-1 h-3 w-3" />
                              {instructor.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap">
                          {formatSpecialties(instructor.specialties)}
                          {instructor.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{instructor.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instructor.experienceYears} años</div>
                          {instructor.hourlyRate && (
                            <div className="text-sm text-gray-600">
                              ${instructor.hourlyRate}/hr
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {instructor.rating ? renderStars(instructor.rating) : (
                          <span className="text-gray-400 text-sm">Sin calificar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {instructor.preferredParkName ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            {instructor.preferredParkName}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No especificado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInstructor(instructor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/activities/instructors/${instructor.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInstructor(instructor)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {filteredInstructors.length > itemsPerPage && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(endIndex, filteredInstructors.length)} de {filteredInstructors.length} instructores
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Botón Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </Button>

                  {/* Números de página */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === pageNumber 
                              ? 'bg-[#00a587] hover:bg-[#067f5f] text-white' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de visualización de instructor */}
      {selectedInstructor && (
        <Dialog open={true} onOpenChange={() => setSelectedInstructor(null)}>
          <DialogContent className="max-w-2xl" aria-describedby="instructor-assignment-description">
            <DialogHeader>
              <div id="instructor-assignment-description" className="sr-only">
                Perfil completo del instructor con información de contacto y especialidades
              </div>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedInstructor.profileImageUrl} />
                  <AvatarFallback>
                    {selectedInstructor.firstName[0]}{selectedInstructor.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-bold">
                    {selectedInstructor.firstName} {selectedInstructor.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Instructor - {selectedInstructor.experienceYears} años de experiencia
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{selectedInstructor.email}</span>
                    </div>
                    {selectedInstructor.phone && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{selectedInstructor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedInstructor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-[#00a587]/10 text-[#00a587]">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedInstructor.preferredParkName && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Parque Preferido</h4>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{selectedInstructor.preferredParkName}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información Profesional</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Experiencia:</span> {selectedInstructor.experienceYears} años
                    </div>
                    {selectedInstructor.hourlyRate && (
                      <div>
                        <span className="font-medium">Tarifa:</span> ${selectedInstructor.hourlyRate}/hora
                      </div>
                    )}
                    {selectedInstructor.availability && (
                      <div>
                        <span className="font-medium">Disponibilidad:</span> {selectedInstructor.availability}
                      </div>
                    )}
                    {selectedInstructor.rating && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Calificación:</span>
                        {renderStars(selectedInstructor.rating)}
                      </div>
                    )}
                  </div>
                </div>

                {selectedInstructor.activitiesCount !== undefined && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                    <div className="text-sm">
                      <span className="font-medium">Actividades impartidas:</span> {selectedInstructor.activitiesCount}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedInstructor.bio && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Biografía</h4>
                <p className="text-sm text-gray-700">{selectedInstructor.bio}</p>
              </div>
            )}

            {selectedInstructor.experience && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Experiencia y Certificaciones</h4>
                <p className="text-sm text-gray-700">{selectedInstructor.experience}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar instructor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el instructor "{instructorToDelete?.firstName} {instructorToDelete?.lastName}" 
              y su usuario asociado del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteInstructorMutation.isPending}
            >
              {deleteInstructorMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}