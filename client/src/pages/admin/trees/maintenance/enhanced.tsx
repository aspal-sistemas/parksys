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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Leaf, 
  Wrench, 
  Search, 
  PlusCircle, 
  TreePine, 
  MapPin, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface TreeOption {
  id: number;
  code: string;
  speciesName: string;
  parkName: string;
  healthStatus: string;
  plantingDate: string;
}

export default function EnhancedTreeMaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParkId, setSelectedParkId] = useState<string>('all');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('all');
  const [selectedHealthStatus, setSelectedHealthStatus] = useState<string>('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeOption | null>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    maintenanceType: '',
    notes: '',
    performedBy: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar parques para filtros
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    select: (data) => data.data,
  });

  // Cargar especies para filtros
  const { data: species } = useQuery({
    queryKey: ['/api/tree-species'],
    select: (data) => data.data,
  });

  // Cargar inventario completo de árboles con filtros inteligentes
  const { data: allTrees, isLoading: loadingTrees } = useQuery({
    queryKey: ['/api/trees/inventory', selectedParkId, selectedSpeciesId, selectedHealthStatus, searchTerm],
    select: (data) => data.data || [],
  });

  // Filtrar árboles localmente para mejor performance
  const filteredTrees = useMemo(() => {
    if (!allTrees) return [];
    
    let filtered = [...allTrees];
    
    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tree => 
        tree.code?.toLowerCase().includes(term) ||
        tree.speciesName?.toLowerCase().includes(term) ||
        tree.parkName?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por parque
    if (selectedParkId !== 'all') {
      filtered = filtered.filter(tree => tree.parkId === parseInt(selectedParkId));
    }
    
    // Filtro por especie
    if (selectedSpeciesId !== 'all') {
      filtered = filtered.filter(tree => tree.speciesId === parseInt(selectedSpeciesId));
    }
    
    // Filtro por estado de salud
    if (selectedHealthStatus !== 'all') {
      filtered = filtered.filter(tree => tree.healthStatus === selectedHealthStatus);
    }
    
    return filtered.slice(0, 50); // Limitar a 50 resultados para mejor UX
  }, [allTrees, searchTerm, selectedParkId, selectedSpeciesId, selectedHealthStatus]);

  // Cargar mantenimientos con filtros
  const { data: maintenances, isLoading: loadingMaintenances } = useQuery({
    queryKey: ['/api/trees/maintenances'],
    select: (data: any) => data?.data || [],
  });

  // Filtrar mantenimientos
  const filteredMaintenances = useMemo(() => {
    if (!maintenances) return [];
    
    let filtered = [...maintenances];
    
    if (maintenanceFilter !== 'all') {
      filtered = filtered.filter(m => m.maintenanceType === maintenanceFilter);
    }
    
    return filtered;
  }, [maintenances, maintenanceFilter]);

  // Estadísticas básicas calculadas localmente
  const stats = useMemo(() => {
    if (!maintenances || !allTrees) return { total: 0, coverage: 0, recent: 0 };
    
    const total = maintenances.length;
    const uniqueTreesWithMaintenance = new Set(maintenances.map(m => m.treeId)).size;
    const coverage = allTrees.length > 0 ? Math.round((uniqueTreesWithMaintenance / allTrees.length) * 100) : 0;
    
    // Mantenimientos recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = maintenances.filter(m => 
      new Date(m.maintenanceDate) >= thirtyDaysAgo
    ).length;
    
    return { total, coverage, recent };
  }, [maintenances, allTrees]);

  // Mutación para agregar mantenimiento
  const addMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/trees/${selectedTreeId}/maintenances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        description: "El registro se ha guardado correctamente"
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSelectTree = (tree: TreeOption) => {
    setSelectedTreeId(tree.id);
    setSelectedTree(tree);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTreeId(null);
    setSelectedTree(null);
    setMaintenanceData({
      maintenanceType: '',
      notes: '',
      performedBy: '',
    });
  };

  const handleAddMaintenance = () => {
    if (!selectedTreeId || !maintenanceData.maintenanceType || !maintenanceData.performedBy) {
      toast({
        title: "Campos requeridos",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    addMaintenanceMutation.mutate({
      ...maintenanceData,
      maintenanceDate: new Date().toISOString().split('T')[0],
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedParkId('all');
    setSelectedSpeciesId('all');
    setSelectedHealthStatus('all');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mantenimiento de Árboles</h1>
            <p className="text-muted-foreground mt-2">
              Sistema escalable para gestión de mantenimiento con inventarios grandes
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mantenimientos Totales</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura de Árboles</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.coverage}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recientes (30 días)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.recent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda de Árboles
            </CardTitle>
            <CardDescription>
              Filtra y busca árboles específicos antes de registrar mantenimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Búsqueda por texto */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">Buscar árbol</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Código, especie o ubicación..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro por parque */}
              <div>
                <Label>Parque</Label>
                <Select value={selectedParkId} onValueChange={setSelectedParkId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    {parks?.map((park) => (
                      <SelectItem key={park.id} value={park.id.toString()}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por especie */}
              <div>
                <Label>Especie</Label>
                <Select value={selectedSpeciesId} onValueChange={setSelectedSpeciesId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especies</SelectItem>
                    {species?.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id.toString()}>
                        {sp.commonName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado de salud */}
              <div>
                <Label>Estado de Salud</Label>
                <Select value={selectedHealthStatus} onValueChange={setSelectedHealthStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Excelente">Excelente</SelectItem>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                    <SelectItem value="Crítico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              <div className="text-sm text-muted-foreground flex items-center">
                Mostrando {filteredTrees.length} árbol(es) {filteredTrees.length === 50 ? '(limitado a 50)' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados de Árboles */}
        <Card>
          <CardHeader>
            <CardTitle>Árboles Encontrados</CardTitle>
            <CardDescription>
              Selecciona un árbol para registrar mantenimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrees ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTrees.length === 0 ? (
              <div className="text-center py-8">
                <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No se encontraron árboles</h3>
                <p className="text-muted-foreground">
                  Ajusta los filtros para encontrar árboles específicos
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTrees.map((tree) => (
                  <div
                    key={tree.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelectTree(tree)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <TreePine className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">{tree.code}</div>
                          <div className="text-sm text-muted-foreground">
                            {tree.speciesName}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{tree.parkName}</span>
                      </div>
                      
                      <Badge variant={
                        tree.healthStatus === 'Excelente' ? 'default' :
                        tree.healthStatus === 'Bueno' ? 'secondary' :
                        tree.healthStatus === 'Regular' ? 'outline' : 'destructive'
                      }>
                        {tree.healthStatus}
                      </Badge>
                    </div>
                    
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Registrar Mantenimiento
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Mantenimientos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Historial de Mantenimientos</CardTitle>
              <CardDescription>
                {filteredMaintenances.length} registro(s) de mantenimiento
              </CardDescription>
            </div>
            <Select value={maintenanceFilter} onValueChange={setMaintenanceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Poda">Poda</SelectItem>
                <SelectItem value="Riego">Riego</SelectItem>
                <SelectItem value="Fertilización">Fertilización</SelectItem>
                <SelectItem value="Control de plagas">Control de plagas</SelectItem>
                <SelectItem value="Tratamiento de enfermedades">Tratamiento de enfermedades</SelectItem>
                <SelectItem value="Inspección">Inspección</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loadingMaintenances ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredMaintenances.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No hay registros</h3>
                <p className="text-muted-foreground">
                  No se encontraron mantenimientos con los filtros aplicados
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código Árbol</TableHead>
                      <TableHead>Parque</TableHead>
                      <TableHead>Especie</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Responsable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenances.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">{maintenance.treeCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {maintenance.parkName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Leaf className="h-3 w-3 text-green-600" />
                            {maintenance.speciesName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {maintenance.maintenanceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(maintenance.maintenanceDate), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{maintenance.performedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para registrar mantenimiento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Mantenimiento</DialogTitle>
            <DialogDescription>
              {selectedTree && (
                <div className="mt-2 p-3 bg-accent rounded-lg">
                  <div className="font-medium">{selectedTree.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTree.speciesName} - {selectedTree.parkName}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="maintenanceType">Tipo de Mantenimiento *</Label>
              <Select 
                onValueChange={(value) => setMaintenanceData({...maintenanceData, maintenanceType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Poda">Poda</SelectItem>
                  <SelectItem value="Riego">Riego</SelectItem>
                  <SelectItem value="Fertilización">Fertilización</SelectItem>
                  <SelectItem value="Control de plagas">Control de plagas</SelectItem>
                  <SelectItem value="Tratamiento de enfermedades">Tratamiento de enfermedades</SelectItem>
                  <SelectItem value="Inspección">Inspección</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="performedBy">Realizado por *</Label>
              <Input 
                id="performedBy" 
                placeholder="Nombre del responsable"
                value={maintenanceData.performedBy}
                onChange={(e) => setMaintenanceData({...maintenanceData, performedBy: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas del Mantenimiento</Label>
              <Textarea 
                id="notes" 
                placeholder="Detalles del mantenimiento realizado..."
                rows={3}
                value={maintenanceData.notes}
                onChange={(e) => setMaintenanceData({...maintenanceData, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddMaintenance}
              disabled={addMaintenanceMutation.isPending}
            >
              {addMaintenanceMutation.isPending ? 'Guardando...' : 'Guardar Mantenimiento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}