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
  Check, X, Clock, AlertCircle, Award, FileEdit, BarChart3, Trash2
} from 'lucide-react';
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
  
  // Handle delete button click
  const handleDeleteClick = (volunteer: Volunteer) => {
    setVolunteerToDelete(volunteer);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (volunteerToDelete && volunteerToDelete.id) {
      deleteVolunteerMutation.mutate(volunteerToDelete.id);
    }
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
            <Link href="/admin/volunteers/new">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Voluntario
              </Button>
            </Link>
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
                            {volunteer.source === 'user' ? (
                              <>
                                <Link href={`/admin/users?edit=${volunteer.user_id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileEdit className="h-3 w-3 mr-1" />
                                    Editar Usuario
                                  </Button>
                                </Link>
                                <Link href={`/admin/volunteers/convert/${volunteer.user_id}`}>
                                  <Button variant="secondary" size="sm">
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Crear Perfil Completo
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link href={`/admin/volunteers/${volunteer.id}`}>
                                  <Button variant="outline" size="sm">
                                    <FileEdit className="h-3 w-3 mr-1" />
                                    Ver / Editar
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
      </div>
    </AdminLayout>
  );
};

export default VolunteersList;