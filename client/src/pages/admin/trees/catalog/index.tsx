import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/AdminLayout';
import { Leaf, Search, Plus, TreePine, Filter, CircleCheck, CircleAlert, Eye, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('common_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

  // Mutación para importar CSV
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return apiRequest('/api/tree-species/import/csv', {
        method: 'POST',
        body: JSON.stringify({ data }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Importación completada",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
      setIsImportDialogOpen(false);
      setCsvPreview([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error en la importación",
        description: error.message || "Error al importar especies",
        variant: "destructive",
      });
    },
  });

  // Manejar exportación CSV
  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/tree-species/export/csv');
      if (!response.ok) {
        throw new Error('Error al exportar CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'especies-arboreas.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportación exitosa",
        description: "El archivo CSV se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el archivo CSV",
        variant: "destructive",
      });
    }
  };

  // Manejar selección de archivo CSV
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Archivo vacío",
          description: "El archivo CSV no contiene datos",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV data
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        // Map CSV headers to expected fields
        headers.forEach((header, i) => {
          const value = values[i] || '';
          switch (header.toLowerCase()) {
            case 'nombre común':
            case 'common_name':
              row.commonName = value;
              break;
            case 'nombre científico':
            case 'scientific_name':
              row.scientificName = value;
              break;
            case 'familia':
            case 'family':
              row.family = value;
              break;
            case 'origen':
            case 'origin':
              row.origin = value;
              break;
            case 'ritmo de crecimiento':
            case 'growth_rate':
              row.growthRate = value;
              break;
            case 'amenazada':
            case 'is_endangered':
              row.isEndangered = value.toLowerCase() === 'sí' || value.toLowerCase() === 'true';
              break;
            case 'descripción':
            case 'description':
              row.description = value;
              break;
            case 'instrucciones de cuidado':
            case 'care_instructions':
              row.careInstructions = value;
              break;
            case 'beneficios':
            case 'benefits':
              row.benefits = value;
              break;
            case 'url de imagen':
            case 'image_url':
              row.imageUrl = value;
              break;
          }
        });
        
        return row;
      });

      setCsvPreview(data.slice(0, 5)); // Show first 5 rows for preview
      setIsImportDialogOpen(true);
    };

    reader.readAsText(file);
  };

  // Confirmar importación
  const handleConfirmImport = () => {
    if (csvPreview.length === 0) return;
    
    // Read the full file again for import
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          switch (header.toLowerCase()) {
            case 'nombre común':
            case 'common_name':
              row.commonName = value;
              break;
            case 'nombre científico':
            case 'scientific_name':
              row.scientificName = value;
              break;
            case 'familia':
            case 'family':
              row.family = value;
              break;
            case 'origen':
            case 'origin':
              row.origin = value;
              break;
            case 'ritmo de crecimiento':
            case 'growth_rate':
              row.growthRate = value;
              break;
            case 'amenazada':
            case 'is_endangered':
              row.isEndangered = value.toLowerCase() === 'sí' || value.toLowerCase() === 'true';
              break;
            case 'descripción':
            case 'description':
              row.description = value;
              break;
            case 'instrucciones de cuidado':
            case 'care_instructions':
              row.careInstructions = value;
              break;
            case 'beneficios':
            case 'benefits':
              row.benefits = value;
              break;
            case 'url de imagen':
            case 'image_url':
              row.imageUrl = value;
              break;
          }
        });
        
        return row;
      });

      importMutation.mutate(data);
    };

    reader.readAsText(file);
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
          <div className="flex gap-2">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Especies desde CSV</DialogTitle>
                  <DialogDescription>
                    Vista previa de los primeros 5 registros. Confirma para importar todos los datos.
                  </DialogDescription>
                </DialogHeader>
                
                {csvPreview.length > 0 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre Común</TableHead>
                            <TableHead>Nombre Científico</TableHead>
                            <TableHead>Familia</TableHead>
                            <TableHead>Origen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.commonName || 'N/A'}</TableCell>
                              <TableCell className="italic">{row.scientificName || 'N/A'}</TableCell>
                              <TableCell>{row.family || 'N/A'}</TableCell>
                              <TableCell>{row.origin || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsImportDialogOpen(false);
                          setCsvPreview([]);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmImport}
                        disabled={importMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {importMutation.isPending ? 'Importando...' : 'Confirmar Importación'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Nueva Especie
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} especies
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                </div>
                
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
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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