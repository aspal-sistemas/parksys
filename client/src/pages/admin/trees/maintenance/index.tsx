import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  TableCaption,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Wrench, Search, PlusCircle, TreePine, MapPin, Calendar } from 'lucide-react';

export default function TreeMaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPark, setFilterPark] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    maintenanceType: '',
    notes: '',
    performedBy: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar datos de árboles para el selector
  const { data: trees, isLoading: loadingTrees } = useQuery({
    queryKey: ['/api/trees'],
    select: (data) => data.data,
  });

  // Estado para parques
  const [parks, setParks] = React.useState([]);
  const [loadingParks, setLoadingParks] = React.useState(true);

  // Cargar parques directamente con fetch
  React.useEffect(() => {
    const loadParks = async () => {
      try {
        setLoadingParks(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/parks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('Parks data received:', data);
        
        // Manejar tanto array directo como objeto con data
        const parksArray = Array.isArray(data) ? data : (data?.data || []);
        console.log('Parks array:', parksArray);
        setParks(parksArray);
      } catch (error) {
        console.error('Error loading parks:', error);
        setParks([]);
      } finally {
        setLoadingParks(false);
      }
    };

    loadParks();
  }, []);

  // Cargar todos los mantenimientos
  const { data: maintenances, isLoading: loadingMaintenances } = useQuery({
    queryKey: ['/api/trees/maintenances'],
    select: (data: any) => data.data,
  });

  // Cargar estadísticas de mantenimiento
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/trees/maintenances/stats'],
    select: (data: any) => data || { total: 0, recent: 0, byType: [], byMonth: [] },
  });

  // Filtrar mantenimientos según búsqueda, tipo y parque
  const filteredMaintenances = React.useMemo(() => {
    if (!maintenances) return [];
    
    let allMaintenances = [...maintenances];
    
    console.log('Filtros aplicados:', { searchTerm, filterType, filterPark });
    console.log('Mantenimientos originales:', allMaintenances);
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allMaintenances = allMaintenances.filter(maint => 
        maint.treeCode?.toLowerCase().includes(term) ||
        maint.parkName?.toLowerCase().includes(term) ||
        maint.speciesName?.toLowerCase().includes(term) ||
        maint.performedBy?.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por tipo de mantenimiento
    if (filterType !== 'all') {
      allMaintenances = allMaintenances.filter(maint => 
        maint.maintenanceType === filterType
      );
    }
    
    // Filtrar por parque
    if (filterPark !== 'all') {
      allMaintenances = allMaintenances.filter(maint => 
        maint.parkName === filterPark
      );
    }
    
    console.log('Mantenimientos filtrados:', allMaintenances);
    return allMaintenances;
  }, [maintenances, searchTerm, filterType, filterPark]);

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
      queryClient.invalidateQueries({ queryKey: ['/api/trees/maintenances/stats'] });
      queryClient.invalidateQueries({ queryKey: [`/api/trees/${selectedTreeId}/maintenances`] });
      
      toast({
        title: "Mantenimiento registrado",
        description: "El registro de mantenimiento se ha guardado correctamente"
      });
      
      setOpen(false);
      setMaintenanceData({
        maintenanceType: '',
        notes: '',
        performedBy: '',
      });
      setSelectedTreeId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al registrar el mantenimiento",
        variant: "destructive",
      });
    }
  });

  const handleAddMaintenance = () => {
    if (!selectedTreeId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un árbol",
        variant: "destructive",
      });
      return;
    }

    if (!maintenanceData.maintenanceType) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tipo de mantenimiento",
        variant: "destructive",
      });
      return;
    }

    const newMaintenance = {
      ...maintenanceData,
      maintenanceDate: new Date().toISOString(),
    };

    addMaintenanceMutation.mutate(newMaintenance);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mantenimiento de Árboles</h1>
            <p className="text-muted-foreground">
              Gestiona y registra las actividades de mantenimiento realizadas en árboles
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Mantenimiento
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mantenimientos Recientes</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold">{stats?.recent || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tipo Más Común</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                <div>
                  {stats?.byType && stats.byType.length > 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                      {stats.byType[0].type}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin datos</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <CardDescription>Árboles mantenidos</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats || loadingTrees ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {trees && stats ? Math.round((stats.total / trees.length) * 100) : 0}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, parque o especie..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={filterPark}
            onValueChange={(value) => {
              console.log('Cambiando filtro de parque a:', value);
              setFilterPark(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {loadingParks ? (
                <SelectItem value="loading" disabled>Cargando parques...</SelectItem>
              ) : !parks || parks.length === 0 ? (
                <SelectItem value="none" disabled>No hay parques disponibles</SelectItem>
              ) : (
                parks.map((park) => (
                  <SelectItem key={park.id} value={park.name}>
                    {park.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tipo de mantenimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
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



        {/* Tabla de mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Mantenimiento</CardTitle>
            <CardDescription>
              {filteredMaintenances?.length} {filteredMaintenances?.length === 1 ? 'registro' : 'registros'} de mantenimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMaintenances ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredMaintenances?.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No hay registros de mantenimiento</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' || filterPark !== 'all'
                    ? 'No se encontraron registros con los filtros aplicados'
                    : 'Registra el primer mantenimiento haciendo clic en "Registrar Mantenimiento"'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Parque</TableHead>
                      <TableHead>Especie</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Realizado por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenances?.map((maintenance) => (
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
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(maintenance.maintenanceDate), 'dd MMM yyyy', { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell>{maintenance.performedByName || 'Usuario ' + maintenance.performedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Agregar Mantenimiento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Mantenimiento</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del mantenimiento realizado en un árbol
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tree">Árbol</Label>
              <Select 
                onValueChange={(value) => setSelectedTreeId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un árbol" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTrees ? (
                    <SelectItem value="loading" disabled>Cargando árboles...</SelectItem>
                  ) : trees?.length === 0 ? (
                    <SelectItem value="none" disabled>No hay árboles registrados</SelectItem>
                  ) : (
                    trees?.map((tree) => (
                      <SelectItem key={tree.id} value={tree.id.toString()}>
                        {`${tree.code} - ${tree.speciesName || 'Especie desconocida'}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="maintenanceType">Tipo de Mantenimiento</Label>
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
              <Label htmlFor="performedBy">Realizado por</Label>
              <Input 
                id="performedBy" 
                placeholder="Nombre del responsable"
                value={maintenanceData.performedBy}
                onChange={(e) => setMaintenanceData({...maintenanceData, performedBy: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleAddMaintenance}
              disabled={addMaintenanceMutation.isPending}
            >
              {addMaintenanceMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}