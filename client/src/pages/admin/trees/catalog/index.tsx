import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import AdminLayout from '@/components/AdminLayout';
import { Leaf, Search, Plus, TreePine, Filter, CircleCheck, CircleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface TreeSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  growthRate: string;
  imageUrl: string;
  isEndangered: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function TreeSpeciesCatalog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('common_name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/tree-species', searchTerm, originFilter, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (originFilter !== 'all') params.append('origin', originFilter);
      params.append('page', currentPage.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/tree-species?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar especies arbóreas');
      }
      return response.json();
    }
  });

  const species: TreeSpecies[] = data?.data || [];
  const pagination: PaginationInfo = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCreateNew = () => {
    setLocation('/admin/trees/catalog/new');
  };

  const handleViewDetails = (id: number) => {
    setLocation(`/admin/trees/catalog/${id}`);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={pagination.page === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              aria-disabled={pagination.page <= 1}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pages}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              aria-disabled={pagination.page >= pagination.totalPages}
              className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (error) {
    toast({
      title: "Error",
      description: "No se pudieron cargar las especies arbóreas. Por favor, intenta nuevamente.",
      variant: "destructive",
    });
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo de Especies Arbóreas | ParquesMX</title>
        <meta name="description" content="Gestión y consulta del catálogo de especies arbóreas para parques y espacios públicos" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <TreePine className="mr-2 h-8 w-8" />
              Catálogo de Especies Arbóreas
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el catálogo de especies arbóreas para los parques y espacios públicos
            </p>
          </div>
          <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Nueva Especie
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre común, científico o familia..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={originFilter}
                  onValueChange={setOriginFilter}
                >
                  <SelectTrigger className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los orígenes</SelectItem>
                    <SelectItem value="Nativo">Nativo</SelectItem>
                    <SelectItem value="Introducido">Introducido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common_name">Nombre Común</SelectItem>
                    <SelectItem value="scientific_name">Nombre Científico</SelectItem>
                    <SelectItem value="origin">Origen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={sortOrder}
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascendente</SelectItem>
                    <SelectItem value="desc">Descendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : species.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No se encontraron especies arbóreas</h3>
                <p className="mt-1 text-gray-500">
                  Prueba con otros términos de búsqueda o agrega nuevas especies al catálogo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Nombre Común</TableHead>
                      <TableHead>Nombre Científico</TableHead>
                      <TableHead>Familia</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Crecimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {species.map((species) => (
                      <TableRow key={species.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(species.id)}>
                        <TableCell>
                          {species.imageUrl ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={species.imageUrl}
                                alt={species.commonName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Leaf className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{species.commonName}</TableCell>
                        <TableCell className="italic">{species.scientificName}</TableCell>
                        <TableCell>{species.family}</TableCell>
                        <TableCell>
                          <Badge variant={species.origin === 'Nativo' ? 'default' : 'outline'}>
                            {species.origin}
                          </Badge>
                        </TableCell>
                        <TableCell>{species.growthRate}</TableCell>
                        <TableCell>
                          {species.isEndangered ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <CircleAlert className="h-3 w-3" /> Amenazada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 text-green-600 bg-green-50">
                              <CircleCheck className="h-3 w-3" /> Normal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(species.id);
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {renderPagination()}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default TreeSpeciesCatalog;