import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  UserPlus, Search, Filter, RefreshCw, Award, 
  FileEdit, Calendar, Bookmark, Medal
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Estructura de datos para reconocimiento (ajustado a la estructura real de la DB)
interface Recognition {
  id: number;
  volunteer_id: number;
  recognition_type: string;
  level: string | null;
  reason: string;
  hours_completed: number | null;
  certificate_url: string | null;
  issued_at: string;
  issued_by_id: number;
  additional_comments: string | null;
}

const VolunteerRecognitions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  // Fetch all recognitions
  const { data: recognitions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/volunteers/recognitions/all'],
  });
  
  // Mutation para cargar datos de muestra de reconocimientos
  const loadSampleData = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/seed/recognitions');
    },
    onSuccess: () => {
      toast({
        title: "Datos de muestra cargados",
        description: "Los reconocimientos de muestra se han cargado correctamente",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Error al cargar datos de muestra:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de muestra. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Fetch volunteers data to display names
  const { data: volunteers = [] } = useQuery({
    queryKey: ['/api/volunteers'],
  });

  // Filter recognitions based on search term and type
  const filteredRecognitions = recognitions.filter((recognition: Recognition) => {
    // Validate recognition object and required fields
    if (!recognition || !recognition.recognition_type || !recognition.reason) {
      return false;
    }
    
    const volunteer = volunteers.find((v: any) => v.id === recognition.volunteer_id);
    const volunteerName = volunteer ? volunteer.fullName : `Voluntario ID: ${recognition.volunteer_id}`;
    
    const matchesSearch = 
      searchTerm === '' || 
      volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recognition.recognition_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recognition.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' || 
      recognition.recognition_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const paginatedRecognitions = filteredRecognitions.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(filteredRecognitions.length / pageSize);

  // Get volunteer name by ID
  const getVolunteerName = (volunteerId: number) => {
    const volunteer = volunteers.find((v: any) => v.id === volunteerId);
    return volunteer ? volunteer.fullName : `Voluntario ID: ${volunteerId}`;
  };

  // Get issuer name by ID
  const getIssuerName = (issuerId: number) => {
    // Aquí podríamos tener una consulta adicional para obtener los datos de los usuarios
    // Por ahora retornamos un valor genérico
    return `Administrador ID: ${issuerId}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get appropriate icon for recognition type
  const getRecognitionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'diploma':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'medal':
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 'certificate':
        return <FileEdit className="h-5 w-5 text-green-500" />;
      case 'level-upgrade':
        return <Bookmark className="h-5 w-5 text-purple-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get badge color based on level
  const getLevelBadgeColor = (level: string | null) => {
    if (!level) return "bg-gray-200 text-gray-800";
    
    switch (level.toLowerCase()) {
      case 'bronze':
        return "bg-amber-700 text-white";
      case 'silver':
        return "bg-gray-400 text-white";
      case 'gold':
        return "bg-yellow-500 text-white";
      case 'platinum':
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          Error al cargar los reconocimientos. Por favor, intente nuevamente.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Reconocimientos de Voluntarios</h1>
              </div>
              <p className="text-gray-600 mt-2">
                Gestión de reconocimientos otorgados a voluntarios
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => loadSampleData.mutate()}
                variant="outline"
                disabled={loadSampleData.isPending}
              >
                {loadSampleData.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-0 border-r-0 border-gray-400 rounded-full"></div>
                    Cargando...
                  </div>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Cargar datos de muestra
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Nuevo Reconocimiento
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar reconocimiento..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="diploma">Diplomas</SelectItem>
                    <SelectItem value="medal">Medallas</SelectItem>
                    <SelectItem value="certificate">Certificados</SelectItem>
                    <SelectItem value="level-upgrade">Ascensos de nivel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={() => refetch()} variant="outline" className="w-full md:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Data table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Voluntario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecognitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron reconocimientos
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecognitions.map((recognition: Recognition) => (
                      <TableRow key={recognition.id}>
                        <TableCell className="font-medium">{recognition.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{getVolunteerName(recognition.volunteer_id)}</div>
                          <div className="text-sm text-gray-500">ID: {recognition.volunteer_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRecognitionIcon(recognition.recognition_type)}
                            <span>{recognition.recognition_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {recognition.level ? (
                            <Badge className={getLevelBadgeColor(recognition.level)}>
                              {recognition.level}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={recognition.reason}>
                            {recognition.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(recognition.issued_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Por: {getIssuerName(recognition.issued_by_id)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VolunteerRecognitions;