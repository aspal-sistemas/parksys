import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Eye, 
  TreeDeciduous, 
  CircleCheck, 
  CircleAlert, 
  Info 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los árboles del inventario
interface TreeInventory {
  id: number;
  code: string;
  speciesId: number;
  speciesName: string;
  scientificName: string;
  parkId: number;
  parkName: string;
  latitude: string;
  longitude: string;
  plantingDate: string | null;
  developmentStage: string | null;
  ageEstimate: number | null;
  height: number | null;
  diameter: number | null;
  canopyCoverage: number | null;
  healthStatus: string;
  imageUrl: string | null;
  lastInspectionDate: string | null;
}

function TreeInventoryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [parkFilter, setParkFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Consultar los parques para el filtro
  const { data: parks, isLoading: isLoadingParks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar los parques');
      }
      return response.json();
    },
  });

  // Consultar las especies para el filtro
  const { data: species, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['/api/tree-species'],
    queryFn: async () => {
      const response = await fetch('/api/tree-species');
      if (!response.ok) {
        throw new Error('Error al cargar las especies arbóreas');
      }
      return response.json();
    },
  });

  // Consultar el inventario de árboles
  const {
    data: treeInventory,
    isLoading: isLoadingTrees,
    error,
  } = useQuery({
    queryKey: ['/api/trees', page, searchTerm, parkFilter, healthFilter, speciesFilter],
    queryFn: async () => {
      let url = `/api/trees?page=${page}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (parkFilter !== 'all') {
        url += `&parkId=${parkFilter}`;
      }
      
      if (healthFilter !== 'all') {
        url += `&healthStatus=${healthFilter}`;
      }
      
      if (speciesFilter !== 'all') {
        url += `&speciesId=${speciesFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar el inventario de árboles');
      }
      
      return response.json();
    },
  });

  // Usamos useEffect para evitar re-renders infinitos al mostrar el toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario de árboles. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleAddTree = () => {
    setLocation('/admin/trees/inventory/new');
  };
  
  // Función para cargar árboles de muestra
  const handleSeedTrees = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch('/api/trees/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId || '',
          'X-User-Role': userRole || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar árboles de muestra');
      }
      
      const data = await response.json();
      
      toast({
        title: "Éxito",
        description: data.message,
        variant: "default",
      });
      
      // Recargar los datos después de agregar los árboles
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los árboles de muestra. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (id: number) => {
    setLocation(`/admin/trees/inventory/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // La búsqueda se activará automáticamente por el cambio en searchTerm
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'bueno':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
            <CircleCheck className="h-3 w-3 mr-1" /> Bueno
          </Badge>
        );
      case 'regular':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
            <Info className="h-3 w-3 mr-1" /> Regular
          </Badge>
        );
      case 'malo':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
            <CircleAlert className="h-3 w-3 mr-1" /> Malo
          </Badge>
        );
      case 'crítico':
        return (
          <Badge variant="destructive">
            <CircleAlert className="h-3 w-3 mr-1" /> Crítico
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Formatear la fecha para mostrarla en español
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No disponible';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Determinar si hay datos para mostrar
  const hasData = treeInventory && treeInventory.data && treeInventory.data.length > 0;
  const totalPages = treeInventory ? Math.ceil(treeInventory.total / treeInventory.perPage) : 1;

  return (
    <AdminLayout>
      <Helmet>
        <title>Inventario de Árboles | ParquesMX</title>
        <meta name="description" content="Gestión del inventario de árboles en los parques municipales" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <TreeDeciduous className="mr-2 h-8 w-8" />
              Inventario de Árboles
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión y seguimiento de árboles individuales en los parques
            </p>
          </div>
          <Button 
            onClick={handleAddTree}
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar Árbol
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>
              Utiliza los filtros para encontrar árboles específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <form onSubmit={handleSearch} className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por código o descripción..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
              
              <div>
                <Select
                  value={parkFilter}
                  onValueChange={setParkFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por parque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {!isLoadingParks && parks?.map((park: any) => (
                      <SelectItem key={park.id} value={park.id.toString()}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={speciesFilter}
                  onValueChange={setSpeciesFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especies</SelectItem>
                    {!isLoadingSpecies && species?.data?.map((species: any) => (
                      <SelectItem key={species.id} value={species.id.toString()}>
                        {species.commonName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={healthFilter}
                  onValueChange={setHealthFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                    <SelectItem value="Crítico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Listado de Árboles</CardTitle>
              {treeInventory && (
                <div className="text-sm text-gray-500">
                  Total: {treeInventory.total} árboles
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTrees ? (
              // Estado de carga
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : hasData ? (
              // Tabla con datos
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Código</TableHead>
                        <TableHead>Especie</TableHead>
                        <TableHead>Parque</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Altura (m)</TableHead>
                        <TableHead>DAP (cm)</TableHead>
                        <TableHead>Última Inspección</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {treeInventory.data.map((tree: TreeInventory) => (
                        <TableRow key={tree.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(tree.id)}>
                          <TableCell className="font-medium">{tree.code}</TableCell>
                          <TableCell>
                            <div className="font-medium">{tree.speciesName}</div>
                            <div className="text-sm text-gray-500 italic">{tree.scientificName}</div>
                          </TableCell>
                          <TableCell>{tree.parkName}</TableCell>
                          <TableCell>{getHealthStatusBadge(tree.healthStatus)}</TableCell>
                          <TableCell>{tree.height ? `${tree.height} m` : '-'}</TableCell>
                          <TableCell>{tree.diameter ? `${tree.diameter} cm` : '-'}</TableCell>
                          <TableCell>{formatDate(tree.lastInspectionDate)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(tree.id);
                                }}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <Eye className="h-4 w-4 mr-1" /> Ver
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Abrir mapa
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${tree.latitude},${tree.longitude}`, '_blank');
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <MapPin className="h-4 w-4 mr-1" /> Mapa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                          />
                        </PaginationItem>
                        
                        {/* Primera página */}
                        {page > 2 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Elipsis si hay muchas páginas */}
                        {page > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        {/* Página anterior si no es la primera */}
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(page - 1)}>
                              {page - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Página actual */}
                        <PaginationItem>
                          <PaginationLink isActive onClick={() => handlePageChange(page)}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                        
                        {/* Página siguiente si no es la última */}
                        {page < totalPages && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(page + 1)}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {/* Elipsis si hay muchas páginas */}
                        {page < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        {/* Última página */}
                        {page < totalPages - 1 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(totalPages)}>
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              // No hay datos
              <div className="text-center py-12">
                <TreeDeciduous className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron árboles</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  No hay árboles registrados que coincidan con los criterios de búsqueda. Prueba a cambiar los filtros o agrega un nuevo árbol al inventario.
                </p>
                <Button 
                  onClick={handleAddTree}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar Árbol
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default TreeInventoryPage;