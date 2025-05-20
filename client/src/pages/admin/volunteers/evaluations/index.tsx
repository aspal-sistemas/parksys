import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
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
  Search, Filter, RefreshCw, FileEdit, Star, StarHalf, AlertTriangle,
  Clock, User
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

// Tipo para la evaluación de voluntarios
type Evaluation = {
  id: number;
  participationId: number;
  volunteerId: number;
  evaluatorId: number;
  punctuality: number;
  attitude: number; 
  responsibility: number;
  overallPerformance: number;
  comments: string | null;
  followUpRequired: boolean;
  createdAt: string;
};

const VolunteerEvaluations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch all evaluations
  const { data: evaluations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/volunteers/evaluations/all'],
  });

  // Fetch volunteers data to display names
  const { data: volunteers = [] } = useQuery({
    queryKey: ['/api/volunteers'],
  });

  // Get volunteer name by ID
  const getVolunteerName = (volunteerId: number) => {
    const volunteer = volunteers.find((v: any) => v.id === volunteerId);
    return volunteer ? volunteer.fullName : `Voluntario ID: ${volunteerId}`;
  };

  // Filter evaluations based on search term and performance filter
  const filteredEvaluations = evaluations.filter((evaluation: Evaluation) => {
    const volunteerName = getVolunteerName(evaluation.volunteerId).toLowerCase();
    
    const matchesSearch = 
      searchTerm === '' || 
      volunteerName.includes(searchTerm.toLowerCase()) ||
      (evaluation.comments && evaluation.comments.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPerformance = 
      performanceFilter === 'all' || 
      (performanceFilter === 'excellent' && evaluation.overallPerformance >= 4.5) ||
      (performanceFilter === 'good' && evaluation.overallPerformance >= 3.5 && evaluation.overallPerformance < 4.5) ||
      (performanceFilter === 'average' && evaluation.overallPerformance >= 2.5 && evaluation.overallPerformance < 3.5) ||
      (performanceFilter === 'poor' && evaluation.overallPerformance < 2.5) ||
      (performanceFilter === 'followup' && evaluation.followUpRequired);
    
    return matchesSearch && matchesPerformance;
  });

  // Paginate evaluations
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredEvaluations.length / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get rating stars based on score
  const getRatingStars = (score: number) => {
    if (score >= 4.5) return (
      <Badge className="bg-green-500">
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 fill-current" />
        <span className="ml-1">{score.toFixed(1)}</span>
      </Badge>
    );
    if (score >= 3.5) return (
      <Badge className="bg-green-400">
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <StarHalf className="h-3 w-3 fill-current" />
        <span className="ml-1">{score.toFixed(1)}</span>
      </Badge>
    );
    if (score >= 2.5) return (
      <Badge className="bg-amber-400 text-amber-800">
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <span className="ml-1">{score.toFixed(1)}</span>
      </Badge>
    );
    return (
      <Badge variant="destructive">
        <Star className="h-3 w-3 mr-1 fill-current" />
        <Star className="h-3 w-3 mr-1 fill-current" />
        <span className="ml-1">{score.toFixed(1)}</span>
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Evaluaciones de Voluntarios</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evaluaciones</CardTitle>
            <CardDescription>Listado de evaluaciones de desempeño de los voluntarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-2 w-1/2">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre de voluntario o comentarios..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por desempeño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los desempeños</SelectItem>
                    <SelectItem value="excellent">Excelente (4.5+)</SelectItem>
                    <SelectItem value="good">Bueno (3.5-4.4)</SelectItem>
                    <SelectItem value="average">Regular (2.5-3.4)</SelectItem>
                    <SelectItem value="poor">Deficiente (≤2.4)</SelectItem>
                    <SelectItem value="followup">Requiere seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Cargando evaluaciones...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
                <p className="mt-2 text-red-500">Error al cargar las evaluaciones</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : paginatedEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No se encontraron evaluaciones que coincidan con los criterios de búsqueda.</div>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntario</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Puntualidad</TableHead>
                      <TableHead>Actitud</TableHead>
                      <TableHead>Responsabilidad</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Desempeño General
                        </div>
                      </TableHead>
                      <TableHead>Seguimiento</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvaluations.map((evaluation: Evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {getVolunteerName(evaluation.volunteerId)}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {evaluation.volunteerId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{formatDate(evaluation.createdAt)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Part. ID: {evaluation.participationId}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRatingStars(evaluation.punctuality)}
                        </TableCell>
                        <TableCell>
                          {getRatingStars(evaluation.attitude)}
                        </TableCell>
                        <TableCell>
                          {getRatingStars(evaluation.responsibility)}
                        </TableCell>
                        <TableCell>
                          {getRatingStars(evaluation.overallPerformance)}
                        </TableCell>
                        <TableCell>
                          {evaluation.followUpRequired ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Requiere seguimiento
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">No necesario</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/admin/volunteers/evaluations/${evaluation.id}`}>
                              <Button variant="outline" size="sm">
                                <FileEdit className="h-3 w-3 mr-1" />
                                Ver / Editar
                              </Button>
                            </Link>
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
      </div>
    </AdminLayout>
  );
};

export default VolunteerEvaluations;