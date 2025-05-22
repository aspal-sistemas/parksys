import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'wouter';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Search,
  ChevronDown,
  Filter,
  Eye,
  MoreVertical,
  CalendarIcon,
  RefreshCw,
  AlertCircle,
  User,
  CheckCircle,
  AlertTriangle,
  FileEdit
} from 'lucide-react';

import AdminLayout from '@/components/AdminLayout';
import InstructorEvaluationDialog from '@/components/InstructorEvaluationDialog';

export default function InstructorEvaluationsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [showEvaluationDetails, setShowEvaluationDetails] = useState(false);

  // Obtener todas las evaluaciones
  const {
    data: evaluations = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/instructors-evaluations'],
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha desconocida';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Renderizar estrellas para el rating
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4 fill-half" />);
      } else {
        stars.push(<Star key={i} className="text-gray-300 h-4 w-4" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  // Filtrar y buscar evaluaciones
  const filteredEvaluations = React.useMemo(() => {
    if (!evaluations || !Array.isArray(evaluations) || evaluations.length === 0) {
      console.log('No hay evaluaciones disponibles o no es un array:', evaluations);
      return [];
    }
    
    console.log('Evaluaciones cargadas:', evaluations.length);
    
    return evaluations.filter((evaluation: any) => {
      // Filtro por búsqueda
      const matchesSearch =
        !searchTerm ||
        (evaluation.instructor_name && evaluation.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evaluation.activity_title && evaluation.activity_title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por período
      const matchesPeriod = filterPeriod === 'all' || (() => {
        if (!evaluation.evaluation_date) return false;
        const today = new Date();
        const evalDate = new Date(evaluation.evaluation_date);
        
        switch (filterPeriod) {
          case 'today':
            return evalDate.toDateString() === today.toDateString();
          case 'week':
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            return evalDate >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            return evalDate >= oneMonthAgo;
          case 'quarter':
            const oneQuarterAgo = new Date(today);
            oneQuarterAgo.setMonth(today.getMonth() - 3);
            return evalDate >= oneQuarterAgo;
          default:
            return true;
        }
      })();
      
      // Filtro por calificación
      const matchesRating = filterRating === 'all' || (() => {
        const rating = evaluation.overall_performance || 0;
        
        switch (filterRating) {
          case 'excellent':
            return rating >= 4.5;
          case 'good':
            return rating >= 4 && rating < 4.5;
          case 'average':
            return rating >= 3 && rating < 4;
          case 'below':
            return rating < 3;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesPeriod && matchesRating;
    });
  }, [evaluations, searchTerm, filterPeriod, filterRating]);

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  
  const paginatedEvaluations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvaluations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvaluations, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Mostrar detalles de evaluación
  const handleViewDetails = (evaluation: any) => {
    console.log("Mostrando evaluación:", evaluation);
    // Asegurar que la evaluación tiene todos los campos necesarios
    const evaluationWithDefaults = {
      ...evaluation,
      // Valores por defecto para evitar problemas de renderizado
      evaluation_date: evaluation.evaluation_date || evaluation.created_at || new Date().toISOString(),
      instructor_name: evaluation.instructor_name || 'Instructor',
      instructor_profile_image_url: evaluation.instructor_profile_image_url || '',
      activity_title: evaluation.activity_title || 'Actividad',
      professionalism: evaluation.professionalism || 0,
      teaching_clarity: evaluation.teaching_clarity || 0,
      active_participation: evaluation.active_participation || 0,
      communication: evaluation.communication || 0,
      group_management: evaluation.group_management || 0,
      knowledge: evaluation.knowledge || 0,
      methodology: evaluation.methodology || 0,
      overall_performance: evaluation.overall_performance || 0,
      comments: evaluation.comments || 'Sin comentarios',
      evaluator_type: evaluation.evaluator_type || 'supervisor',
      follow_up_required: evaluation.follow_up_required || false,
      follow_up_notes: evaluation.follow_up_notes || ''
    };
    
    setSelectedEvaluation(evaluationWithDefaults);
    setShowEvaluationDetails(true);
  };

  // Obtener clase de badge según calificación
  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (rating >= 4) return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    if (rating >= 3) return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    if (rating >= 2) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "bg-red-100 text-red-800 hover:bg-red-100";
  };

  // Obtener el texto del tipo de evaluador
  const getEvaluatorTypeName = (type: string) => {
    switch (type) {
      case 'participant': return 'Participante';
      case 'supervisor': return 'Supervisor';
      case 'self': return 'Autoevaluación';
      default: return 'Evaluador';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Evaluaciones de Instructores</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de Evaluaciones</CardTitle>
            <CardDescription>Administra las evaluaciones de los instructores y analiza su desempeño.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Búsqueda */}
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por instructor o actividad..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filtro por período */}
              <div className="w-full md:w-1/3">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filtrar por período" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="quarter">Último trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por calificación */}
              <div className="w-full md:w-1/3">
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Star className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filtrar por calificación" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las calificaciones</SelectItem>
                    <SelectItem value="excellent">Excelente (4.5-5)</SelectItem>
                    <SelectItem value="good">Bueno (4-4.4)</SelectItem>
                    <SelectItem value="average">Promedio (3-3.9)</SelectItem>
                    <SelectItem value="below">Por debajo (0-2.9)</SelectItem>
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
                <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
                <p className="mt-2 text-red-500">Error al cargar evaluaciones</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No se encontraron evaluaciones que coincidan con los criterios de búsqueda.</div>
              </div>
            ) : (
              <>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Evaluador</TableHead>
                        <TableHead>Calificación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEvaluations.map((evaluation: any) => (
                        <TableRow key={evaluation.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={evaluation.instructor_image || evaluation.instructor_profile_image_url} 
                                  alt={evaluation.instructor_name} 
                                />
                                <AvatarFallback>
                                  {evaluation.instructor_name ? evaluation.instructor_name.charAt(0) : 'I'}
                                </AvatarFallback>
                              </Avatar>
                              <div>{evaluation.instructor_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {evaluation.activity_title || 'Actividad sin título'}
                          </TableCell>
                          <TableCell>
                            {formatDate(evaluation.evaluation_date || evaluation.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {evaluation.evaluator_type ? 
                                getEvaluatorTypeName(evaluation.evaluator_type) : 
                                'Supervisor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getRatingBadgeClass(evaluation.overall_performance)}>
                                {evaluation.overall_performance.toFixed(1)}
                              </Badge>
                              {renderRating(evaluation.overall_performance)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(evaluation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewDetails(evaluation)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  {evaluation.follow_up_required && (
                                    <DropdownMenuItem>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Marcar seguimiento como completado
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }).map((_, index) => {
                          const page = index + 1;
                          // Mostrar siempre la primera, última y páginas alrededor de la actual
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === currentPage}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          
                          // Mostrar elipsis para páginas omitidas
                          if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return <PaginationItem key={page}>...</PaginationItem>;
                          }
                          
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de detalles de evaluación */}
      {selectedEvaluation && (
        <Dialog open={showEvaluationDetails} onOpenChange={setShowEvaluationDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles de Evaluación</DialogTitle>
              <DialogDescription>
                Evaluación realizada el {formatDate(selectedEvaluation.evaluation_date || selectedEvaluation.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Información de contexto */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={selectedEvaluation.instructor_image || selectedEvaluation.instructor_profile_image_url} 
                      alt={selectedEvaluation.instructor_name} 
                    />
                    <AvatarFallback>
                      {selectedEvaluation.instructor_name ? selectedEvaluation.instructor_name.charAt(0) : 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{selectedEvaluation.instructor_name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedEvaluation.activity_title || 'Actividad sin título'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {formatDate(selectedEvaluation.evaluation_date || selectedEvaluation.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {selectedEvaluation.evaluator_type ? 
                        getEvaluatorTypeName(selectedEvaluation.evaluator_type) : 
                        'Supervisor'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Criterios de evaluación */}
              <div>
                <h3 className="text-lg font-medium mb-3">Criterios Evaluados</h3>
                
                <div className="grid gap-4">
                  {selectedEvaluation.professionalism !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Profesionalismo</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.professionalism)}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvaluation.teaching_clarity !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Claridad didáctica</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.teaching_clarity)}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvaluation.active_participation !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Participación activa</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.active_participation)}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvaluation.communication !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Comunicación</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.communication)}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvaluation.group_management !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Manejo de grupo</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.group_management)}
                      </div>
                    </div>
                  )}
                  
                  {/* Compatibilidad con esquema anterior */}
                  {selectedEvaluation.knowledge !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Conocimiento</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.knowledge)}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvaluation.methodology !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Metodología</span>
                      <div className="flex">
                        {renderRating(selectedEvaluation.methodology)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Evaluación general */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Calificación General</h3>
                  <div className="flex items-center">
                    <Badge className={getRatingBadgeClass(selectedEvaluation.overall_performance)}>
                      {selectedEvaluation.overall_performance.toFixed(1)}
                    </Badge>
                    <div className="ml-2">
                      {renderRating(selectedEvaluation.overall_performance)}
                    </div>
                  </div>
                </div>
                
                {selectedEvaluation.comments && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Comentarios</h4>
                    <div className="bg-gray-50 p-3 rounded-md whitespace-pre-line">
                      {selectedEvaluation.comments}
                    </div>
                  </div>
                )}
                
                {selectedEvaluation.follow_up_required && (
                  <div className="mt-4 flex items-start gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <div className="shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800">Requiere seguimiento</h4>
                      {selectedEvaluation.follow_up_notes && (
                        <p className="text-sm text-yellow-700 mt-1">
                          {selectedEvaluation.follow_up_notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}