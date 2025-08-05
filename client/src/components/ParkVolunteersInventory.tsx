import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Users, Calendar, Mail, Phone, Filter, Plus, User } from 'lucide-react';
import { Link } from 'wouter';

interface Volunteer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  availability?: string;
  skills?: string;
  experience?: string;
  age?: number;
  gender?: string;
  createdAt: string;
  isActive?: boolean;
  preferredPark?: string;
  hoursLogged?: number;
  lastActivity?: string;
  notes?: string;
}

interface ParkVolunteersInventoryProps {
  parkId: number;
  volunteers: Volunteer[];
}

const ParkVolunteersInventory: React.FC<ParkVolunteersInventoryProps> = ({ parkId, volunteers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 10;

  // Función para filtrar y ordenar voluntarios
  const getFilteredAndSortedVolunteers = () => {
    let filtered = [...volunteers];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.experience?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filtrar por disponibilidad
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.availability?.toLowerCase() === availabilityFilter.toLowerCase());
    }

    // Filtrar por género
    if (genderFilter !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.gender?.toLowerCase() === genderFilter.toLowerCase());
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortBy) {
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'availability':
          aValue = a.availability?.toLowerCase() || '';
          bValue = b.availability?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = a.createdAt || '';
          bValue = b.createdAt || '';
          break;
        case 'lastActivity':
          aValue = a.lastActivity || '';
          bValue = b.lastActivity || '';
          break;
        case 'hoursLogged':
          aValue = (a.hoursLogged || 0).toString();
          bValue = (b.hoursLogged || 0).toString();
          break;
        default:
          aValue = a.fullName?.toLowerCase() || '';
          bValue = b.fullName?.toLowerCase() || '';
      }
      
      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return filtered;
  };

  const filteredVolunteers = getFilteredAndSortedVolunteers();
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, availabilityFilter, genderFilter, sortBy, sortOrder]);

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

  const uniqueStatuses = createUniqueValueMap(volunteers.map(volunteer => volunteer.status));
  const uniqueAvailabilities = createUniqueValueMap(volunteers.map(volunteer => volunteer.availability));
  const uniqueGenders = createUniqueValueMap(volunteers.map(volunteer => volunteer.gender));

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAvailabilityFilter('all');
    setGenderFilter('all');
    setSortBy('fullName');
    setSortOrder('asc');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      active: "default",
      inactivo: "secondary",
      inactive: "secondary",
      pendiente: "outline",
      pending: "outline",
      suspendido: "destructive",
      suspended: "destructive"
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "tiempo completo": "default",
      "tiempo_completo": "default",
      "medio tiempo": "secondary",
      "medio_tiempo": "secondary",
      "fines de semana": "outline",
      "fines_de_semana": "outline",
      "por horas": "outline",
      "por_horas": "outline",
      flexible: "default"
    };
    return variants[availability?.toLowerCase()] || "secondary";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      {volunteers.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">Filtros y Ordenamiento</span>
            <span className="ml-auto text-sm text-gray-500">
              ({filteredVolunteers.length} de {volunteers.length} voluntarios)
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar voluntarios..."
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
                      {status === 'activo' ? 'Activo' : 
                       status === 'inactivo' ? 'Inactivo' :
                       status === 'pendiente' ? 'Pendiente' :
                       status === 'suspendido' ? 'Suspendido' :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Filtro por disponibilidad */}
            <div>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las disponibilidades</SelectItem>
                  {uniqueAvailabilities.map(availability => (
                    <SelectItem key={availability} value={availability}>
                      {availability === 'tiempo_completo' ? 'Tiempo Completo' : 
                       availability === 'medio_tiempo' ? 'Medio Tiempo' :
                       availability === 'fines_de_semana' ? 'Fines de Semana' :
                       availability === 'por_horas' ? 'Por Horas' :
                       availability === 'flexible' ? 'Flexible' :
                       availability.charAt(0).toUpperCase() + availability.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por género */}
            <div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los géneros</SelectItem>
                  {uniqueGenders.map(gender => (
                    <SelectItem key={gender} value={gender}>
                      {gender === 'masculino' ? 'Masculino' : 
                       gender === 'femenino' ? 'Femenino' :
                       gender === 'no_especificar' ? 'No Especificar' :
                       gender.charAt(0).toUpperCase() + gender.slice(1)}
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
                  <SelectItem value="fullName">Nombre</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                  <SelectItem value="availability">Disponibilidad</SelectItem>
                  <SelectItem value="createdAt">Fecha de Registro</SelectItem>
                  <SelectItem value="lastActivity">Última Actividad</SelectItem>
                  <SelectItem value="hoursLogged">Horas Registradas</SelectItem>
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

      {/* Lista de voluntarios */}
      {filteredVolunteers.length === 0 && volunteers.length > 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No se encontraron voluntarios</p>
          <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      ) : volunteers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No hay voluntarios asignados</p>
          <p className="text-sm">Este parque aún no tiene voluntarios registrados.</p>
          <Link href={`/admin/volunteers/register`}>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Registrar primer voluntario
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{volunteer.fullName}</h4>
                    <Badge variant={getStatusBadge(volunteer.status)}>
                      {volunteer.status === 'activo' ? 'Activo' : 
                       volunteer.status === 'inactivo' ? 'Inactivo' :
                       volunteer.status}
                    </Badge>
                    {volunteer.availability && (
                      <Badge variant={getAvailabilityBadge(volunteer.availability)}>
                        {volunteer.availability === 'tiempo_completo' ? 'Tiempo Completo' : 
                         volunteer.availability === 'medio_tiempo' ? 'Medio Tiempo' :
                         volunteer.availability === 'fines_de_semana' ? 'Fines de Semana' :
                         volunteer.availability === 'por_horas' ? 'Por Horas' :
                         volunteer.availability}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-600">{volunteer.email}</span>
                      </div>
                      
                      {volunteer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Teléfono:</span>
                          <span className="text-gray-600">{volunteer.phone}</span>
                        </div>
                      )}
                      
                      {volunteer.skills && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Habilidades:</span>
                          <span className="text-gray-600">{volunteer.skills}</span>
                        </div>
                      )}
                      
                      {volunteer.age && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Edad:</span>
                          <span className="text-gray-600">{volunteer.age} años</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Registrado:</span>
                        <span className="text-gray-600">{formatDate(volunteer.createdAt)}</span>
                      </div>
                      
                      {volunteer.lastActivity && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Última Actividad:</span>
                          <span className="text-gray-600">{formatDate(volunteer.lastActivity)}</span>
                        </div>
                      )}
                      
                      {volunteer.hoursLogged && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Horas Registradas:</span>
                          <span className="text-gray-600">{volunteer.hoursLogged} horas</span>
                        </div>
                      )}
                      
                      {volunteer.experience && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Experiencia:</span>
                          <span className="text-gray-600">{volunteer.experience}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {volunteer.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Notas:</span> {volunteer.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  <Link href={`/admin/volunteers/${volunteer.id}`}>
                    <Button size="sm" variant="outline">
                      Ver perfil
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
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVolunteers.length)} de {filteredVolunteers.length} voluntarios
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

export default ParkVolunteersInventory;