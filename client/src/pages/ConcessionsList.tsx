import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, Search, Building2, Store, Coffee, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Concession {
  id: number;
  vendorName: string;
  businessName: string;
  concessionType: string;
  location: string;
  contactPhone?: string;
  contactEmail?: string;
  startDate: string;
  endDate: string;
  parkId: number;
  parkName?: string;
  status: string;
}

export default function ConcessionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: concessionsResponse, isLoading } = useQuery({
    queryKey: ['/api/concessions-list'],
  });

  const concessions = (concessionsResponse as any)?.data || [];

  // Filtrar concesiones
  const filteredConcessions = concessions.filter((concession: Concession) => {
    const searchableText = `${concession.vendorName || ''} ${concession.location || ''} ${concession.concessionType || ''}`;
    const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || concession.concessionType === typeFilter;
    const matchesStatus = statusFilter === "all" || concession.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredConcessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConcessions = filteredConcessions.slice(startIndex, startIndex + itemsPerPage);

  // Reset página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alimentario':
        return <Coffee className="h-4 w-4" />;
      case 'comercial':
        return <Store className="h-4 w-4" />;
      case 'servicios':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'por vencer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Concesiones y Servicios
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Descubre todos los servicios comerciales disponibles en nuestros parques urbanos
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar concesiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de concesión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Alimentario">Alimentario</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Recreativo">Recreativo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Por vencer">Por vencer</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>

            {/* Limpiar filtros */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredConcessions.length} concesiones encontradas
          </h2>
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredConcessions.length)} de {filteredConcessions.length}
          </div>
        </div>

        {/* Grid de concesiones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentConcessions.map((concession: any) => (
            <div key={concession.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image Section */}
              <div className="aspect-video w-full bg-gradient-to-br from-[#00a587] via-[#067f5f] to-[#8498a5] relative overflow-hidden">
                {concession.primaryImage ? (
                  <img
                    src={concession.primaryImage}
                    alt={concession.vendorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Building className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium opacity-90">{concession.concessionType}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    concession.status === 'activa' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {concession.status}
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {concession.vendorName}
                </h3>
                
                <p className="text-sm text-[#00a587] font-medium mb-3">{concession.concessionType}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.parkName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.vendorPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(concession.startDate).toLocaleDateString('es-ES')} - {new Date(concession.endDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/concession/${concession.id}`)}
                    className="w-full bg-[#00a587] text-white px-4 py-2 rounded-md hover:bg-[#067f5f] transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
                  </div>

                  {/* Botón Ver detalles */}
                  <Link href={`/concession/${concession.id}`}>
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Anterior
            </Button>
            
            {/* Números de página */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Sin resultados */}
        {filteredConcessions.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron concesiones
            </h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}