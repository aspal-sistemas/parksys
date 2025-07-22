import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  PlusCircle, 
  Download,
  Upload,
  FileSpreadsheet,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TreeMaintenance {
  id: number;
  treeId: number;
  treeCode: string;
  speciesName: string;
  parkName: string;
  maintenanceType: string;
  maintenanceDate: string;
  performedBy: string;
  description: string;
  notes: string;
  nextMaintenanceDate: string;
  createdAt: string;
}

export default function TreeMaintenancePage() {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPark, setFilterPark] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Estados para modal de nuevo mantenimiento
  const [open, setOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    maintenanceType: '',
    description: '',
    notes: '',
    performedBy: '',
    nextMaintenanceDate: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar datos con paginación del servidor
  const { data: maintenancesResponse, isLoading: loadingMaintenances } = useQuery<any>({
    queryKey: ['/api/trees/maintenances', { 
      page: currentPage, 
      limit: recordsPerPage,
      search: searchTerm,
      type: filterType,
      park: filterPark
    }],
    retry: 1,
  });

  const maintenances = maintenancesResponse?.data || [];
  const pagination = maintenancesResponse?.pagination || {
    total: 0,
    totalPages: 0,
    page: currentPage,
    limit: recordsPerPage
  };

  // Cargar parques para filtros
  const { data: parksResponse } = useQuery<any>({
    queryKey: ['/api/parks'],
    retry: 1,
  });
  const parks = parksResponse?.data || [];

  // Cargar árboles para formulario
  const { data: treesResponse } = useQuery<any>({
    queryKey: ['/api/trees'],
    retry: 1,
  });
  const trees = treesResponse?.data || [];

  // Mutación para agregar nuevo mantenimiento
  const addMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/trees/${selectedTreeId}/maintenances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar mantenimiento');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trees/maintenances'] });
      
      toast({
        title: "Mantenimiento registrado",
        description: "El registro de mantenimiento se ha guardado correctamente"
      });
      
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al registrar el mantenimiento",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar mantenimiento
  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/trees/maintenances/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar mantenimiento');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trees/maintenances'] });
      toast({
        title: "Mantenimiento eliminado",
        description: "El registro ha sido eliminado correctamente"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar el mantenimiento",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setMaintenanceData({
      maintenanceType: '',
      description: '',
      notes: '',
      performedBy: '',
      nextMaintenanceDate: '',
      maintenanceDate: new Date().toISOString().split('T')[0],
    });
    setSelectedTreeId(null);
  };

  const handleSubmit = () => {
    if (!selectedTreeId || !maintenanceData.maintenanceType) {
      toast({
        title: "Error",
        description: "Debes seleccionar un árbol y un tipo de mantenimiento",
        variant: "destructive",
      });
      return;
    }

    const newMaintenance = {
      ...maintenanceData,
      treeId: selectedTreeId,
      maintenanceDate: maintenanceData.maintenanceDate || new Date().toISOString().split('T')[0],
    };

    addMaintenanceMutation.mutate(newMaintenance);
  };

  // Función para exportar a CSV
  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/trees/maintenances/export-csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `mantenimientos_arboles_${format(new Date(), 'dd-MM-yyyy')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${pagination.total} registros de mantenimiento`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      });
    }
  };

  // Función para manejar importación de CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/trees/maintenances/import-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ['/api/trees/maintenances'] });
          toast({
            title: "Importación exitosa",
            description: `Se importaron ${data.imported || 0} registros de mantenimiento`
          });
        } else {
          throw new Error(data.message || 'Error en la importación');
        }
      })
      .catch(error => {
        toast({
          title: "Error en importación",
          description: error.message || "No se pudieron importar los datos",
          variant: "destructive",
        });
      });

    // Limpiar el input
    event.target.value = '';
  };

  // Función para obtener badge de urgencia
  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[urgency as keyof typeof colors] || colors.normal}>
        {urgency === 'low' ? 'Baja' :
         urgency === 'normal' ? 'Normal' :
         urgency === 'high' ? 'Alta' : 'Urgente'}
      </Badge>
    );
  };

  // Filtrar datos cuando cambian los filtros, resetear página
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterPark]);

  // Calcular páginas para paginación
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(pagination.totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Mantenimiento de Árboles
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y registra las actividades de mantenimiento realizadas en árboles
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Mantenimiento
            </Button>
          </div>
        </div>

        {/* Filtros y controles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros y Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por árbol, parque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Filtro por tipo */}
              <div className="space-y-2">
                <Label>Tipo de Mantenimiento</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Poda">Poda</SelectItem>
                    <SelectItem value="Riego">Riego</SelectItem>
                    <SelectItem value="Fertilización">Fertilización</SelectItem>
                    <SelectItem value="Fumigación">Fumigación</SelectItem>
                    <SelectItem value="Revisión">Revisión</SelectItem>
                    <SelectItem value="Correctivo">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por parque */}
              <div className="space-y-2">
                <Label>Parque</Label>
                <Select value={filterPark} onValueChange={setFilterPark}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los parques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parks.map((park: any) => (
                      <SelectItem key={park.id} value={park.name}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle vista */}
              <div className="space-y-2">
                <Label>Vista</Label>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex-1"
                  >
                    <List className="h-4 w-4 mr-1" />
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex-1"
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Fichas
                  </Button>
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                <Label>Acciones</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('csv-import')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Importar
                  </Button>
                  <input
                    id="csv-import"
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * recordsPerPage) + 1} a {Math.min(currentPage * recordsPerPage, pagination.total)} de {pagination.total} registros
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista de lista */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>Registros de Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMaintenances ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : maintenances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron registros de mantenimiento</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Árbol</TableHead>
                      <TableHead>Parque</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Realizado por</TableHead>
                      <TableHead>Urgencia</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenances.map((maintenance: any) => (
                      <TableRow key={maintenance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{maintenance.treeCode || `Árbol #${maintenance.treeId}`}</div>
                            <div className="text-sm text-muted-foreground">{maintenance.speciesName}</div>
                          </div>
                        </TableCell>
                        <TableCell>{maintenance.parkName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{maintenance.maintenanceType}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(maintenance.maintenanceDate), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{maintenance.performedBy}</TableCell>
                        <TableCell>
                          {getUrgencyBadge(maintenance.urgency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMaintenanceMutation.mutate(maintenance.id)}
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
        )}

        {/* Vista de fichas */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMaintenances ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : maintenances.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No se encontraron registros de mantenimiento</p>
              </div>
            ) : (
              maintenances.map((maintenance: any) => (
                <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {maintenance.treeCode || `Árbol #${maintenance.treeId}`}
                        </CardTitle>
                        <CardDescription>{maintenance.speciesName}</CardDescription>
                      </div>
                      {getUrgencyBadge(maintenance.urgency)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{maintenance.maintenanceType}</Badge>
                        <span className="text-sm text-muted-foreground">{maintenance.parkName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(maintenance.maintenanceDate), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      
                      {maintenance.performedBy && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Realizado por:</span> {maintenance.performedBy}
                        </div>
                      )}
                      
                      {maintenance.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notas:</span> 
                          <p className="mt-1 text-xs">{maintenance.notes.substring(0, 100)}...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMaintenanceMutation.mutate(maintenance.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {pageNumbers.map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Modal para nuevo mantenimiento */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Mantenimiento</DialogTitle>
              <DialogDescription>
                Completa la información del mantenimiento realizado al árbol
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Selección de árbol */}
              <div className="space-y-2">
                <Label>Árbol</Label>
                <Select
                  value={selectedTreeId?.toString() || ''}
                  onValueChange={(value) => setSelectedTreeId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un árbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {trees.map((tree: any) => (
                      <SelectItem key={tree.id} value={tree.id.toString()}>
                        {tree.code || `Árbol #${tree.id}`} - {tree.speciesName} ({tree.parkName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de mantenimiento */}
                <div className="space-y-2">
                  <Label>Tipo de Mantenimiento *</Label>
                  <Select
                    value={maintenanceData.maintenanceType}
                    onValueChange={(value) => setMaintenanceData(prev => ({ ...prev, maintenanceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poda">Poda</SelectItem>
                      <SelectItem value="Riego">Riego</SelectItem>
                      <SelectItem value="Fertilización">Fertilización</SelectItem>
                      <SelectItem value="Fumigación">Fumigación</SelectItem>
                      <SelectItem value="Revisión">Revisión</SelectItem>
                      <SelectItem value="Correctivo">Correctivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgencia */}
                <div className="space-y-2">
                  <Label>Urgencia</Label>
                  <Select
                    value={maintenanceData.urgency}
                    onValueChange={(value) => setMaintenanceData(prev => ({ ...prev, urgency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha */}
                <div className="space-y-2">
                  <Label>Fecha de Mantenimiento</Label>
                  <Input
                    type="date"
                    value={maintenanceData.maintenanceDate}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                  />
                </div>

                {/* Realizado por */}
                <div className="space-y-2">
                  <Label>Realizado por</Label>
                  <Input
                    value={maintenanceData.performedBy}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, performedBy: e.target.value }))}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={maintenanceData.notes}
                  onChange={(e) => setMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe el mantenimiento realizado..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={addMaintenanceMutation.isPending}
              >
                {addMaintenanceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Mantenimiento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}