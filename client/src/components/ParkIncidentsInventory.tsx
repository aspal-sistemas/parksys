import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, AlertTriangle, Calendar, User, Filter, Plus } from 'lucide-react';
import { Link } from 'wouter';

interface Incident {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  location: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
}

interface ParkIncidentsInventoryProps {
  parkId: number;
  incidents: Incident[];
}

const ParkIncidentsInventory: React.FC<ParkIncidentsInventoryProps> = ({ parkId, incidents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  // Función para filtrar y ordenar incidencias
  const getFilteredAndSortedIncidents = () => {
    let filtered = [...incidents];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filtrar por prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.priority?.toLowerCase() === priorityFilter.toLowerCase());
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.type?.toLowerCase() === typeFilter.toLowerCase());
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
        case 'priority':
          aValue = a.priority?.toLowerCase() || '';
          bValue = b.priority?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case 'reportedBy':
          aValue = a.reportedBy?.toLowerCase() || '';
          bValue = b.reportedBy?.toLowerCase() || '';
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
  }, [searchTerm, statusFilter, priorityFilter, typeFilter, sortBy, sortOrder]);

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
  const uniquePriorities = createUniqueValueMap(incidents.map(incident => incident.priority));
  const uniqueTypes = createUniqueValueMap(incidents.map(incident => incident.type));

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      abierto: "destructive",
      abierta: "destructive",
      "en proceso": "secondary",
      "en_proceso": "secondary",
      procesando: "secondary",
      resuelto: "outline",
      resuelta: "outline",
      completado: "default",
      completada: "default",
      cerrado: "default",
      cerrada: "default"
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      alta: "destructive",
      high: "destructive",
      media: "secondary",
      medium: "secondary",
      baja: "outline",
      low: "outline"
    };
    return variants[priority?.toLowerCase()] || "secondary";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            {/* Filtro por prioridad */}
            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  {uniquePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority === 'alta' ? 'Alta' : 
                       priority === 'media' ? 'Media' :
                       priority === 'baja' ? 'Baja' :
                       priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tipo */}
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  <SelectItem value="priority">Prioridad</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
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
                      {incident.status}
                    </Badge>
                    <Badge variant={getPriorityBadge(incident.priority)}>
                      {incident.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <span className="text-gray-600">{incident.type || 'Sin especificar'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <span className="text-gray-600">{incident.location || 'No especificada'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Reportado por:</span>
                        <span className="text-gray-600">{incident.reportedBy}</span>
                      </div>
                      
                      {incident.assignedTo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Asignado a:</span>
                          <span className="text-gray-600">{incident.assignedTo}</span>
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
                      
                      {incident.resolvedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Resuelto:</span>
                          <span className="text-gray-600">{formatDate(incident.resolvedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {incident.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Notas:</span> {incident.notes}
                      </p>
                    </div>
                  )}
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