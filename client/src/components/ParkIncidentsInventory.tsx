import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, AlertTriangle, Calendar, User, Filter, Plus, Eye, Loader } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Incident {
  id: number;
  title: string;
  description: string;
  status: string;
  severity: string;
  category: string;
  location: string;
  reporterName: string;
  reporterEmail: string;
  parkId: number;
  parkName: string;
  assetId?: number;
  assetName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParkIncidentsInventoryProps {
  parkId: number;
}

const ParkIncidentsInventory: React.FC<ParkIncidentsInventoryProps> = ({ parkId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  // Cargar incidencias específicas del parque
  const { data: incidents = [], isLoading, error } = useQuery({
    queryKey: ['incidents', parkId],
    queryFn: async () => {
      const response = await fetch(`/api/incidents?parkId=${parkId}`);
      if (!response.ok) {
        throw new Error('Error al cargar incidencias');
      }
      return response.json();
    },
    enabled: !!parkId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Función para filtrar y ordenar incidencias
  const getFilteredAndSortedIncidents = () => {
    let filtered = [...incidents];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filtrar por severidad
    if (severityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.severity?.toLowerCase() === severityFilter.toLowerCase());
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(incident => incident.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'severity':
          aValue = a.severity?.toLowerCase() || '';
          bValue = b.severity?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'reporterName':
          aValue = a.reporterName?.toLowerCase() || '';
          bValue = b.reporterName?.toLowerCase() || '';
          break;
        case 'updatedAt':
          aValue = a.updatedAt || '';
          bValue = b.updatedAt || '';
          break;
        default:
          aValue = a.createdAt || '';
          bValue = b.createdAt || '';
      }
      
      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return filtered;
  };

  const filteredIncidents = getFilteredAndSortedIncidents();
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncidents = filteredIncidents.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, severityFilter, categoryFilter, sortBy, sortOrder]);

  // Crear mapas de valores únicos normalizados
  const createUniqueValueMap = (values: (string | undefined)[]) => {
    const uniqueMap = new Map<string, string>();
    values.filter(Boolean).forEach(value => {
      if (value) {
        const lowerKey = value.toLowerCase();
        if (!uniqueMap.has(lowerKey)) {
          uniqueMap.set(lowerKey, value);
        }
      }
    });
    return Array.from(uniqueMap.keys());
  };

  const uniqueStatuses = createUniqueValueMap(incidents.map(incident => incident.status));
  const uniqueSeverities = createUniqueValueMap(incidents.map(incident => incident.severity));
  const uniqueCategories = createUniqueValueMap(incidents.map(incident => incident.category));

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setCategoryFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "destructive",
      assigned: "secondary",
      in_progress: "secondary",
      review: "outline",
      resolved: "default",
      closed: "default",
      rejected: "destructive"
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "destructive",
      normal: "secondary",
      low: "outline"
    };
    return variants[severity?.toLowerCase()] || "secondary";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Cargando incidencias...</span>
      </div>
    );
  }

  // Mostrar error si lo hay
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
        <p className="text-lg font-medium mb-2">Error al cargar incidencias</p>
        <p className="text-sm">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      {incidents.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">Filtros y Ordenamiento</span>
            <span className="ml-auto text-sm text-gray-500">
              ({filteredIncidents.length} de {incidents.length} incidencias)
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar incidencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'abierto' ? 'Abierto' : 
                       status === 'en_proceso' ? 'En Proceso' :
                       status === 'resuelto' ? 'Resuelto' :
                       status === 'completado' ? 'Completado' :
                       status === 'cerrado' ? 'Cerrado' :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Filtro por severidad */}
            <div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  {uniqueSeverities.map(severity => (
                    <SelectItem key={severity} value={severity}>
                      {severity === 'urgent' ? 'Urgente' : 
                       severity === 'high' ? 'Alta' :
                       severity === 'normal' ? 'Normal' :
                       severity === 'low' ? 'Baja' :
                       severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por categoría */}
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Fecha de Creación</SelectItem>
                  <SelectItem value="updatedAt">Fecha de Actualización</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                  <SelectItem value="severity">Severidad</SelectItem>
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="reporterName">Reportado por</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón limpiar filtros */}
            <div>
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de incidencias */}
      {filteredIncidents.length === 0 && incidents.length > 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No se encontraron incidencias</p>
          <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No hay incidencias registradas</p>
          <p className="text-sm">Este parque aún no tiene incidencias reportadas.</p>
          <Link href={`/admin/incidents/new?parkId=${parkId}`}>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Reportar primera incidencia
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentIncidents.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{incident.title}</h4>
                    <Badge variant={getStatusBadge(incident.status)}>
                      {incident.status === 'pending' ? 'Pendiente' :
                       incident.status === 'assigned' ? 'Asignada' :
                       incident.status === 'in_progress' ? 'En Progreso' :
                       incident.status === 'review' ? 'En Revisión' :
                       incident.status === 'resolved' ? 'Resuelta' :
                       incident.status === 'closed' ? 'Cerrada' :
                       incident.status === 'rejected' ? 'Rechazada' :
                       incident.status}
                    </Badge>
                    <Badge variant={getSeverityBadge(incident.severity)}>
                      {incident.severity === 'urgent' ? 'Urgente' :
                       incident.severity === 'high' ? 'Alta' :
                       incident.severity === 'normal' ? 'Normal' :
                       incident.severity === 'low' ? 'Baja' :
                       incident.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Categoría:</span>
                        <span className="text-gray-600">{incident.category || 'Sin especificar'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <span className="text-gray-600">{incident.location || 'No especificada'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Reportado por:</span>
                        <span className="text-gray-600">{incident.reporterName}</span>
                      </div>
                      
                      {incident.assetName && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Activo:</span>
                          <span className="text-gray-600">{incident.assetName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Creado:</span>
                        <span className="text-gray-600">{formatDate(incident.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Actualizado:</span>
                        <span className="text-gray-600">{formatDate(incident.updatedAt)}</span>
                      </div>
                      
                      {incident.reporterEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="text-gray-600">{incident.reporterEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Link href={`/admin/incidents/${incident.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  <Link href={`/admin/incidents/${incident.id}`}>
                    <Button size="sm" variant="outline">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredIncidents.length)} de {filteredIncidents.length} incidencias
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkIncidentsInventory;