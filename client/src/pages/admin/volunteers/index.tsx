import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  UserPlus, Search, Filter, RefreshCw, Download, ArrowUpDown,
  Check, X, Clock, AlertCircle, Award, FileEdit, BarChart3, Trash2,
  Eye, MapPin, Mail, Phone, Calendar, FileText, User, Info, FileCheck,
  Users, HelpingHand, BookMarked
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { Volunteer } from '@/types';
import { apiRequest } from '@/lib/queryClient';

const VolunteersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const pageSize = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all volunteers
  const { data: volunteers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/volunteers'],
  });
  
  // Delete volunteer mutation
  const deleteVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: number) => {
      return await apiRequest(`/api/volunteers/${volunteerId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Voluntario eliminado",
        description: "El voluntario ha sido eliminado correctamente",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      setDeleteDialogOpen(false);
      setVolunteerToDelete(null);
    },
    onError: (error) => {
      console.error("Error al eliminar voluntario:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el voluntario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    },
  });
  
  // Delete all volunteers mutation
  const deleteAllVolunteersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/volunteers/batch/all`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Voluntarios eliminados",
        description: `${data.count} voluntarios han sido inactivados correctamente`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      setDeleteAllDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al eliminar todos los voluntarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los voluntarios. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setDeleteAllDialogOpen(false);
    },
  });
  
  // Handle delete button click
  const handleDeleteClick = (volunteer: Volunteer) => {
    setVolunteerToDelete(volunteer);
    setDeleteDialogOpen(true);
  };
  
  const handleViewProfile = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setProfileDialogOpen(true);
  };
  
  // Handle delete all button click
  const handleDeleteAllClick = () => {
    setDeleteAllDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (volunteerToDelete && volunteerToDelete.id) {
      deleteVolunteerMutation.mutate(volunteerToDelete.id);
    }
  };
  
  // Handle confirm delete all
  const handleConfirmDeleteAll = () => {
    deleteAllVolunteersMutation.mutate();
  };

  // Filter volunteers based on search term and status
  const filteredVolunteers = volunteers.filter((volunteer: Volunteer) => {
    const matchesSearch = 
      searchTerm === '' || 
      volunteer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      volunteer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate volunteers
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><X className="h-3 w-3 mr-1" /> Inactivo</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pendiente</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredVolunteers.length / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export volunteers data as CSV
  const exportCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Horas Acumuladas', 'Fecha Registro'];
    const csvRows = [
      headers.join(','),
      ...filteredVolunteers.map((volunteer: Volunteer) => [
        volunteer.id,
        volunteer.full_name,
        volunteer.email || 'N/A',
        volunteer.phone || 'N/A',
        volunteer.status,
        volunteer.totalHours || 0,
        volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString() : 'N/A'
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'voluntarios.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Voluntarios</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voluntarios</CardTitle>
            <CardDescription>Listado de personas que colaboran como voluntarios en los parques.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-2 w-1/2">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="suspended">Suspendidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Cargando voluntarios...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
                <p className="mt-2 text-red-500">Error al cargar los voluntarios</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : paginatedVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No se encontraron voluntarios que coincidan con los criterios de búsqueda.</div>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Estado
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Horas
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Reconocimientos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVolunteers.map((volunteer: Volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {volunteer.profile_image_url ? (
                                <img 
                                  src={volunteer.profile_image_url} 
                                  alt={volunteer.full_name || 'Voluntario'} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold">
                                  {(volunteer.full_name || '?').charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {volunteer.full_name || 'Sin nombre'} 
                                {volunteer.source === 'user' && (
                                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                    Usuario Sistema
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {volunteer.source === 'user' 
                                  ? `Usuario ID: ${volunteer.user_id || '?'}`
                                  : volunteer.created_at 
                                    ? new Date(volunteer.created_at).toLocaleDateString() 
                                    : 'Fecha desconocida'
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{volunteer.email || 'Sin email'}</div>
                            <div>{volunteer.phone || 'Sin teléfono'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(volunteer.status)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {volunteer.totalHours || 0} horas
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {volunteer.recognitions?.length ? (
                              <>
                                <Award className="h-4 w-4 text-amber-500" />
                                <span>{volunteer.recognitions.length}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin reconocimientos</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleViewProfile(volunteer);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Perfil
                            </Button>
                            
                            {volunteer.source === 'user' ? (
                              <>
                                <Link href={`/admin/users?edit=${volunteer.user_id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileEdit className="h-3 w-3 mr-1" />
                                    Editar Usuario
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link href={`/admin/volunteers/${volunteer.id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileEdit className="h-3 w-3 mr-1" />
                                    Editar
                                  </Button>
                                </Link>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteClick(volunteer);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
        
        {/* Diálogo de confirmación para eliminar voluntario */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se inactivará al voluntario
                <strong>{volunteerToDelete ? ` ${volunteerToDelete.full_name}` : ''}</strong> y 
                ya no aparecerá en la lista principal de voluntarios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                disabled={deleteVolunteerMutation.isPending}
              >
                {deleteVolunteerMutation.isPending ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Eliminando...</>
                ) : (
                  'Eliminar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogo de confirmación para eliminar TODOS los voluntarios */}
        <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">¡ADVERTENCIA! Acción irreversible</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2">
                  <p>Estás a punto de inactivar <strong>TODOS los voluntarios</strong> del sistema.</p>
                  <p>Esta acción:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cambiará el estado de todos los voluntarios activos a "inactivo"</li>
                    <li>Hará que desaparezcan de la lista principal</li>
                    <li>No eliminará permanentemente sus datos, pero dejará de ser accesibles</li>
                  </ul>
                  <p className="font-bold">¿Estás absolutamente seguro de que deseas continuar?</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDeleteAll}
                disabled={deleteAllVolunteersMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteAllVolunteersMutation.isPending ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Eliminando todos...</>
                ) : (
                  'Sí, eliminar TODOS los voluntarios'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Visor de perfil de voluntario */}
      <VolunteerProfile 
        volunteer={selectedVolunteer} 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)} 
      />
    </AdminLayout>
  );
};

// Componente para mostrar el perfil completo del voluntario
const VolunteerProfile: React.FC<{ volunteer: Volunteer | null; open: boolean; onClose: () => void }> = ({ 
  volunteer, 
  open, 
  onClose 
}) => {
  if (!volunteer) return null;
  
  // Función para generar la etiqueta de estado
  const getStatusBadge = (status?: string) => {
    if (!status) return 'Estado desconocido';
    
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactivo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
    }
  };

  // Función auxiliar para formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Mapeo de disponibilidad a texto en español
  const availabilityMap: Record<string, string> = {
    'weekdays': 'Días de semana',
    'weekends': 'Fines de semana',
    'evenings': 'Tardes',
    'mornings': 'Mañanas',
    'flexible': 'Horario flexible'
  };

  // Mapeo de género a texto en español
  const genderMap: Record<string, string> = {
    'masculino': 'Masculino',
    'femenino': 'Femenino',
    'no_especificar': 'No especificado'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Perfil de Voluntario: {volunteer.full_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Tabs defaultValue="personal">
            <TabsList className="w-full border-b mb-4">
              <TabsTrigger value="personal">Información Personal</TabsTrigger>
              <TabsTrigger value="volunteer">Perfil de Voluntario</TabsTrigger>
              <TabsTrigger value="interests">Áreas de Interés</TabsTrigger>
              <TabsTrigger value="documents">Documentación y Legal</TabsTrigger>
            </TabsList>
            
            {/* Pestaña de información personal */}
            <TabsContent value="personal" className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {volunteer.profile_image_url ? (
                    <img 
                      src={volunteer.profile_image_url} 
                      alt={volunteer.full_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Disponible';
                      }}
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{volunteer.full_name}</h3>
                    <p className="text-gray-500">{getStatusBadge(volunteer.status)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Correo electrónico
                      </p>
                      <p>{volunteer.email || 'No disponible'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Teléfono
                      </p>
                      <p>{volunteer.phone || 'No disponible'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha de registro
                      </p>
                      <p>{formatDate(volunteer.created_at)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" /> Género
                      </p>
                      <p>{volunteer.gender ? genderMap[volunteer.gender] || volunteer.gender : 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Dirección
                  </p>
                  <p>{volunteer.address || 'No disponible'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Parque preferido
                  </p>
                  <p>{volunteer.preferred_park_name || 'No especificado'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Contacto de emergencia
                  </p>
                  <p>
                    {volunteer.emergency_contact_name ? (
                      <>
                        {volunteer.emergency_contact_name} - {volunteer.emergency_contact_phone || 'Sin teléfono'}
                      </>
                    ) : (
                      'No disponible'
                    )}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Pestaña de perfil de voluntario */}
            <TabsContent value="volunteer" className="space-y-6">
              <div className="space-y-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Experiencia y Habilidades
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Experiencia previa</p>
                      <p className="text-base">{volunteer.volunteer_experience || volunteer.previous_experience || 'No hay información de experiencia previa'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Habilidades</p>
                      <p className="text-base">{volunteer.skills || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Disponibilidad</p>
                      <p className="text-base">
                        {volunteer.availability ? availabilityMap[volunteer.availability] || volunteer.availability : 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Horas Contribuidas
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-2xl font-bold text-blue-600">{volunteer.totalHours || 0}</p>
                      <p className="text-sm text-blue-600">Horas totales</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Reconocimientos: {volunteer.recognitions?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Pestaña de áreas de interés */}
            <TabsContent value="interests" className="space-y-6">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-green-500" />
                  Áreas de Interés
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_nature ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_nature ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Naturaleza y Conservación</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_events ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_events ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Eventos Especiales</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_education ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_education ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Educación y Talleres</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_maintenance ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_maintenance ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Mantenimiento y Limpieza</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_sports ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_sports ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Actividades Deportivas</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${volunteer.interest_cultural ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {volunteer.interest_cultural ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>Actividades Culturales</span>
                  </div>
                </div>
                
                {volunteer.interest_areas && volunteer.interest_areas.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Otras áreas de interés:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {volunteer.interest_areas.map((area, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Pestaña de documentación y legal */}
            <TabsContent value="documents" className="space-y-6">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-500" />
                  Documentación
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border rounded-md">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${volunteer.has_id_document ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {volunteer.has_id_document ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Identificación Oficial</p>
                      <p className="text-sm text-gray-500">{volunteer.has_id_document ? 'Documento verificado' : 'Documento pendiente'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 border rounded-md">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${volunteer.has_address_document ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {volunteer.has_address_document ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Comprobante de Domicilio</p>
                      <p className="text-sm text-gray-500">{volunteer.has_address_document ? 'Documento verificado' : 'Documento pendiente'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Acuerdos Legales
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border rounded-md">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${volunteer.legal_consent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {volunteer.legal_consent ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Consentimiento de Términos y Condiciones</p>
                      <p className="text-sm text-gray-500">{volunteer.legal_consent ? 'Aceptado' : 'Pendiente'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 border rounded-md">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${volunteer.age_consent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {volunteer.age_consent ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Declaración de Mayoría de Edad</p>
                      <p className="text-sm text-gray-500">{volunteer.age_consent ? 'Aceptado' : 'Pendiente'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 border rounded-md">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${volunteer.conduct_consent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {volunteer.conduct_consent ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Código de Conducta</p>
                      <p className="text-sm text-gray-500">{volunteer.conduct_consent ? 'Aceptado' : 'Pendiente'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteersList;