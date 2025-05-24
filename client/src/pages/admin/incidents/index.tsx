import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  X, 
  Filter,
  ArrowUpDown,
  MapPin,
  User,
  Plus,
  Bookmark,
  Calendar,
  ClipboardList,
  BarChart
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Incident } from '@shared/schema';

// Asegúrate de que el tipo Window incluya las propiedades personalizadas
declare global {
  interface Window {
    selectedAssetId?: string;
  }
}

// Componente principal de incidencias
const IncidentsPage = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Detectar si se está accediendo desde el módulo de activos para abrir el formulario
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportType = params.get('reportType');
    const assetId = params.get('assetId');
    
    if (reportType === 'asset' && assetId) {
      // Guardamos el ID del activo para usarlo cuando se cargue el formulario
      window.selectedAssetId = assetId;
      setLocation('/admin/incidents/new');
    }
  }, []);

  // Consulta para obtener todas las incidencias
  const { 
    data: incidents = [], 
    isLoading,
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/incidents'],
    // El queryFn se maneja automáticamente por el cliente configurado
  });

  // Consulta para obtener todos los parques para el filtro
  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Consulta para obtener categorías de incidentes
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/incident-categories'],
    // Si falla, mostramos categorías ficticias
    onError: (err) => {
      console.error("Error al cargar categorías:", err);
    }
  });

  // Consulta para obtener usuarios para asignación
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    // Si falla, continuamos sin datos de usuarios
    onError: (err) => {
      console.error("Error al cargar usuarios:", err);
    }
  });

  // Función para filtrar incidencias
  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((incident: any) => {
      // Filtro por búsqueda
      const matchesSearch = searchQuery === '' || 
        incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.reporterName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por parque
      const matchesPark = filterPark === 'all' || 
        incident.parkId?.toString() === filterPark;

      // Filtro por estado
      const matchesStatus = filterStatus === 'all' || 
        incident.status === filterStatus;

      // Filtro por categoría
      const matchesCategory = filterCategory === 'all' || 
        incident.categoryId?.toString() === filterCategory ||
        incident.category === filterCategory;

      // Filtro por prioridad
      const matchesPriority = filterPriority === 'all' || 
        incident.priority === filterPriority ||
        incident.severity === filterPriority;

      // Filtro por asignado a
      const matchesAssignedTo = filterAssignedTo === 'all' || 
        incident.assignedToId?.toString() === filterAssignedTo;

      return matchesSearch && matchesPark && matchesStatus && 
        matchesCategory && matchesPriority && matchesAssignedTo;
    }).sort((a: any, b: any) => {
      // Ordenar por campo seleccionado
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    incidents, 
    searchQuery, 
    filterPark, 
    filterStatus,
    filterCategory,
    filterPriority,
    filterAssignedTo,
    sortField, 
    sortDirection
  ]);

  // Función para cambiar la dirección de ordenación
  const toggleSortDirection = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Renderizar íconos de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Obtener etiqueta de estado en español
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'in_progress': 'En proceso',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado'
    };
    return statusMap[status] || status;
  };

  // Obtener clases para la etiqueta de estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Obtener etiqueta de prioridad en español
  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return priorityMap[priority] || priority;
  };

  // Obtener clases para la etiqueta de prioridad
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Obtener etiqueta de categoría
  const getCategoryLabel = (categoryId: number | string) => {
    if (!categories || categories.length === 0) {
      // Categorías por defecto si no hay datos
      const defaultCategories: Record<string, string> = {
        'damage': 'Daño',
        'vandalism': 'Vandalismo',
        'maintenance': 'Mantenimiento',
        'safety': 'Seguridad',
        'accessibility': 'Accesibilidad',
        'asset_issue': 'Problema con Activo',
        'other': 'Otro'
      };
      return defaultCategories[categoryId as string] || categoryId;
    }
    
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

  // Redireccionar a la página de detalles de incidencia
  const handleViewIncident = (id: number) => {
    setLocation(`/admin/incidents/${id}`);
  };

  // Redireccionar a la página de nuevo incidente
  const handleNewIncident = () => {
    setLocation('/admin/incidents/new');
  };

  // Redireccionar a la página de categorías
  const handleManageCategories = () => {
    setLocation('/admin/incidents/categories');
  };

  // Redireccionar al dashboard de incidencias
  const handleViewDashboard = () => {
    setLocation('/admin/incidents/dashboard');
  };

  // Mostrar mensaje si no hay incidencias
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <ClipboardList className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay incidencias</h3>
      <p className="text-gray-500 mb-4">No se encontraron incidencias con los criterios de búsqueda.</p>
      <Button onClick={() => {
        setSearchQuery('');
        setFilterPark('all');
        setFilterStatus('all');
        setFilterCategory('all');
        setFilterPriority('all');
        setFilterAssignedTo('all');
      }}>
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Incidencias</h1>
          
          {/* Botones de acción principales */}
          <div className="flex flex-wrap gap-3">
            <a href="/admin/incidents/dashboard" className="no-underline">
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-5 py-2 h-auto"
              >
                <BarChart className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
            </a>
            
            <Button 
              variant="outline" 
              onClick={handleManageCategories}
              className="text-lg px-5 py-2 h-auto"
            >
              <Bookmark className="h-5 w-5 mr-2" />
              Categorías
            </Button>
            
            <Button 
              onClick={handleNewIncident}
              className="text-lg px-5 py-2 h-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Incidencia
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="in_progress">En Proceso</TabsTrigger>
            <TabsTrigger value="resolved">Resueltas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar incidencias..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="h-9"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros {showFilters ? '▲' : '▼'}
                  </Button>
                </div>
                
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    <div>
                      <Select
                        value={filterPark}
                        onValueChange={setFilterPark}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por parque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los parques</SelectItem>
                          {parks.map((park: any) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">En proceso</SelectItem>
                          <SelectItem value="resolved">Resuelto</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={filterCategory}
                        onValueChange={setFilterCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories && categories.length > 0 
                            ? categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            : (
                              <>
                                <SelectItem value="damage">Daño</SelectItem>
                                <SelectItem value="vandalism">Vandalismo</SelectItem>
                                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                <SelectItem value="safety">Seguridad</SelectItem>
                                <SelectItem value="accessibility">Accesibilidad</SelectItem>
                                <SelectItem value="asset_issue">Problema con Activo</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </>
                            )
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={filterPriority}
                        onValueChange={setFilterPriority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las prioridades</SelectItem>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={filterAssignedTo}
                        onValueChange={setFilterAssignedTo}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por asignado a" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los usuarios</SelectItem>
                          <SelectItem value="unassigned">Sin asignar</SelectItem>
                          {users && users.length > 0 && users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : isError ? (
                  <div className="text-center py-10">
                    <div className="text-red-500 mb-2">Error al cargar incidencias</div>
                    <Button onClick={() => refetch()}>Reintentar</Button>
                  </div>
                ) : filteredIncidents.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead>
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleSortDirection('title')}
                            >
                              Título
                              {sortField === 'title' && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Parque</TableHead>
                          <TableHead>
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleSortDirection('status')}
                            >
                              Estado
                              {sortField === 'status' && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleSortDirection('priority')}
                            >
                              Prioridad
                              {sortField === 'priority' && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>
                            <div 
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleSortDirection('createdAt')}
                            >
                              Fecha
                              {sortField === 'createdAt' && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Reportado por</TableHead>
                          <TableHead>Asignado a</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncidents.map((incident: any) => (
                          <TableRow 
                            key={incident.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleViewIncident(incident.id)}
                          >
                            <TableCell className="font-medium">{incident.id}</TableCell>
                            <TableCell className="max-w-xs truncate">{incident.title}</TableCell>
                            <TableCell>
                              {incident.categoryId ? 
                                getCategoryLabel(incident.categoryId) : 
                                getCategoryLabel(incident.category || 'other')}
                            </TableCell>
                            <TableCell>
                              {incident.park?.name || `Parque ${incident.parkId}`}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeClass(incident.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(incident.status)}
                                  <span className="ml-1">{getStatusLabel(incident.status)}</span>
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getPriorityBadgeClass(incident.priority || incident.severity)}`}>
                                {getPriorityLabel(incident.priority || incident.severity)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(incident.createdAt)}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{incident.reporterName}</TableCell>
                            <TableCell>
                              {incident.assignedToId ? (
                                users.find((u: any) => u.id === incident.assignedToId)?.fullName || 'Usuario'
                              ) : (
                                <span className="text-gray-500 text-sm">Sin asignar</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewIncident(incident.id);
                                }}
                              >
                                Ver detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending">
            <Card>
              <CardContent className="pt-6">
                {filteredIncidents
                  .filter((incident: any) => incident.status === 'pending')
                  .length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay incidencias pendientes</h3>
                    <p className="text-gray-500">Todas las incidencias han sido procesadas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIncidents
                      .filter((incident: any) => incident.status === 'pending')
                      .map((incident: any) => (
                        <Card 
                          key={incident.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleViewIncident(incident.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base mb-1">{incident.title}</CardTitle>
                                <div className="flex space-x-2">
                                  <Badge className={getStatusBadgeClass(incident.status)}>
                                    {getStatusLabel(incident.status)}
                                  </Badge>
                                  <Badge className={getPriorityBadgeClass(incident.priority || incident.severity)}>
                                    {getPriorityLabel(incident.priority || incident.severity)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                #{incident.id}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {incident.description}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-4">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(incident.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {incident.park?.name || `Parque ${incident.parkId}`}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="in_progress">
            <Card>
              <CardContent className="pt-6">
                {filteredIncidents
                  .filter((incident: any) => incident.status === 'in_progress')
                  .length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay incidencias en proceso</h3>
                    <p className="text-gray-500">No hay incidencias siendo atendidas actualmente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIncidents
                      .filter((incident: any) => incident.status === 'in_progress')
                      .map((incident: any) => (
                        <Card 
                          key={incident.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleViewIncident(incident.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base mb-1">{incident.title}</CardTitle>
                                <div className="flex space-x-2">
                                  <Badge className={getStatusBadgeClass(incident.status)}>
                                    {getStatusLabel(incident.status)}
                                  </Badge>
                                  <Badge className={getPriorityBadgeClass(incident.priority || incident.severity)}>
                                    {getPriorityLabel(incident.priority || incident.severity)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                #{incident.id}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {incident.description}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-4">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {incident.assignedToId ? (
                                  users.find((u: any) => u.id === incident.assignedToId)?.fullName || 'Usuario'
                                ) : (
                                  'Sin asignar'
                                )}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {incident.park?.name || `Parque ${incident.parkId}`}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved">
            <Card>
              <CardContent className="pt-6">
                {filteredIncidents
                  .filter((incident: any) => incident.status === 'resolved')
                  .length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay incidencias resueltas</h3>
                    <p className="text-gray-500">Aún no se ha resuelto ninguna incidencia.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIncidents
                      .filter((incident: any) => incident.status === 'resolved')
                      .map((incident: any) => (
                        <Card 
                          key={incident.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleViewIncident(incident.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base mb-1">{incident.title}</CardTitle>
                                <div className="flex space-x-2">
                                  <Badge className={getStatusBadgeClass(incident.status)}>
                                    {getStatusLabel(incident.status)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                #{incident.id}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {incident.resolutionNotes || "Sin notas de resolución"}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-4">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {incident.resolutionDate ? 
                                  formatDate(incident.resolutionDate) : 
                                  formatDate(incident.updatedAt)}
                              </div>
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {incident.assignedToId ? (
                                  users.find((u: any) => u.id === incident.assignedToId)?.fullName || 'Usuario'
                                ) : (
                                  'Sistema'
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default IncidentsPage;