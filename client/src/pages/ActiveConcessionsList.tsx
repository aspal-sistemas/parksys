import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Phone, Mail, Building, Clock, ChevronLeft, ChevronRight, Plus, Search, Filter, Eye, Edit, Trash2, Images, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';

interface ActiveConcession {
  id: number;
  name: string;
  description: string;
  concessionTypeName: string;
  concessionTypeDescription: string;
  impactLevel: string;
  concessionaireName: string;
  concessionaireEmail: string;
  concessionairePhone: string;
  parkName: string;
  parkLocation: string;
  specificLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  imageCount: number;
  primaryImage?: string;
  operatingHours?: string;
  operatingDays?: string;
  monthlyPayment?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}

function ActiveConcessionsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConcession, setSelectedConcession] = useState<ActiveConcession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Obtener concesiones activas
  const { data: concessionsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/active-concessions'],
    queryFn: async () => {
      const response = await fetch('/api/active-concessions');
      return response.json();
    },
    refetchOnWindowFocus: true,
    staleTime: 30000 // Cache por 30 segundos para permitir actualizaciones más frecuentes
  });

  // Obtener parques para filtro
  const { data: parksData } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      return response.json();
    }
  });

  // Mutación para eliminar concesión
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/active-concessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/active-concessions'] });
    }
  });

  const concessions: ActiveConcession[] = concessionsData?.data || [];
  
  // Image URLs have been fixed in database

  const parks = parksData?.data || [];

  // Filtrar concesiones
  const filteredConcessions = concessions.filter(concession => {
    // Asegurar que los campos existen antes de usarlos
    const name = concession.name || '';
    const typeName = concession.concessionTypeName || '';
    const parkName = concession.parkName || '';
    const status = concession.status || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parkName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesPark = parkFilter === 'all' || parkName === parkFilter;
    
    return matchesSearch && matchesStatus && matchesPark;
  });

  // Paginación
  const totalPages = Math.ceil(filteredConcessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConcessions = filteredConcessions.slice(startIndex, startIndex + itemsPerPage);

  // Resetear página cuando cambian filtros
  const handleFiltersChange = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'activa': { color: 'bg-green-100 text-green-800', label: 'Activa' },
      'suspendida': { color: 'bg-red-100 text-red-800', label: 'Suspendida' },
      'vencida': { color: 'bg-gray-100 text-gray-800', label: 'Vencida' },
      'renovacion': { color: 'bg-yellow-100 text-yellow-800', label: 'En Renovación' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['activa'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'alta': { color: 'bg-red-100 text-red-800', label: 'Alta' },
      'normal': { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      'baja': { color: 'bg-gray-100 text-gray-800', label: 'Baja' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['normal'];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const handleDelete = (concession: ActiveConcession) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la concesión "${concession.name}"?`)) {
      deleteMutation.mutate(concession.id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/active-concessions'] });
    refetch();
  };

  const handleViewDetail = (concession: ActiveConcession) => {
    setSelectedConcession(concession);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Concesiones Activas" subtitle="Gestión integral de concesiones operativas">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Concesiones Activas" subtitle="Gestión integral de concesiones operativas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Link href="/admin/concessions/active/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Concesión Activa
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar concesiones..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFiltersChange();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              handleFiltersChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="suspended">Suspendida</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
                <SelectItem value="renewal">En Renovación</SelectItem>
              </SelectContent>
            </Select>

            <Select value={parkFilter} onValueChange={(value) => {
              setParkFilter(value);
              handleFiltersChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Parque" />
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

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredConcessions.length} concesión(es) encontrada(s)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Concesiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paginatedConcessions.map((concession) => (
          <Card key={concession.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Imagen Principal */}
            <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative">
              {(concession as any).primaryImage ? (
                <img 
                  src={`${(concession as any).primaryImage}${(concession as any).primaryImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                  alt={concession.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`fallback-icon flex items-center justify-center h-full ${(concession as any).primaryImage ? 'hidden' : ''}`}>
                <Building className="h-16 w-16 text-green-600 opacity-50" />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {getStatusBadge(concession.status)}
              </div>
              <div className="absolute top-4 left-4">
                {getPriorityBadge(concession.priority)}
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {concession.name}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {concession.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Tipo de Concesión */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {concession.concessionTypeName}
                </Badge>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{concession.parkName}</p>
                  <p className="text-gray-600">{(concession as any).specific_location}</p>
                </div>
              </div>

              {/* Concesionario */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="truncate">{concession.concessionaireName}</span>
              </div>

              {/* Vigencia */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date((concession as any).start_date).toLocaleDateString()} - {new Date((concession as any).end_date).toLocaleDateString()}
                </span>
              </div>

              {/* Horarios */}
              {(concession as any).operating_hours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{(concession as any).operating_hours}</span>
                </div>
              )}

              {/* Pago mensual */}
              {(concession as any).monthly_payment && (
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {formatCurrency((concession as any).monthly_payment)}/mes
                  </span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewDetail(concession)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Link href={`/admin/concessions/active/${concession.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/concessions/active/${concession.id}/images`}>
                  <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700">
                    <Images className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(concession)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNumber > totalPages) return null;
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={currentPage === pageNumber ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modal de Detalle */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedConcession?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConcession && (
            <div className="space-y-6">
              {/* Estado y Prioridad */}
              <div className="flex gap-4">
                {getStatusBadge(selectedConcession.status)}
                {getPriorityBadge(selectedConcession.priority)}
              </div>

              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tipo:</span> {selectedConcession.concessionTypeName}</p>
                    <p><span className="font-medium">Descripción:</span> {selectedConcession.description}</p>
                    <p><span className="font-medium">Ubicación:</span> {selectedConcession.parkName} - {selectedConcession.specificLocation}</p>
                    {selectedConcession.operatingHours && (
                      <p><span className="font-medium">Horarios:</span> {selectedConcession.operatingHours}</p>
                    )}
                    {selectedConcession.operatingDays && (
                      <p><span className="font-medium">Días:</span> {selectedConcession.operatingDays}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Concesionario</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nombre:</span> {selectedConcession.concessionaireName}</p>
                    {selectedConcession.concessionaireEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedConcession.concessionaireEmail}</span>
                      </div>
                    )}
                    {selectedConcession.concessionairePhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedConcession.concessionairePhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vigencia y Pagos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Vigencia</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(selectedConcession.startDate).toLocaleDateString()} - {new Date(selectedConcession.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedConcession.monthlyPayment && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Información Financiera</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Pago mensual:</span> {formatCurrency(selectedConcession.monthlyPayment)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contacto de Emergencia */}
              {(selectedConcession.emergencyContact || selectedConcession.emergencyPhone) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contacto de Emergencia</h3>
                  <div className="space-y-2 text-sm">
                    {selectedConcession.emergencyContact && (
                      <p><span className="font-medium">Nombre:</span> {selectedConcession.emergencyContact}</p>
                    )}
                    {selectedConcession.emergencyPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedConcession.emergencyPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-4 pt-4 border-t">
                <Link href={`/admin/concessions/active/${selectedConcession.id}/edit`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Concesión
                  </Button>
                </Link>
                <Link href={`/admin/concessions/active/${selectedConcession.id}/images`}>
                  <Button variant="outline">
                    Gestionar Imágenes ({selectedConcession.imageCount})
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

export default ActiveConcessionsList;