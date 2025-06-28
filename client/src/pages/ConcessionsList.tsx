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

  const { data: concessionsResponse = { data: [] }, isLoading } = useQuery({
    queryKey: ['/api/all-concessions'],
  });

  const concessions = concessionsResponse.data || [];

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
          {paginatedConcessions.map((concession: Concession) => (
            <Card key={concession.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(concession.concessionType)}
                    <Badge variant="outline" className="text-xs">
                      {concession.concessionType}
                    </Badge>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(concession.status)}`}>
                    {concession.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-900 line-clamp-2">
                  {concession.businessName}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Por: {concession.vendorName}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Ubicación */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{concession.location}</span>
                  </div>

                  {/* Parque */}
                  {concession.parkName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span className="line-clamp-1">{concession.parkName}</span>
                    </div>
                  )}

                  {/* Vigencia */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      {new Date(concession.startDate).toLocaleDateString()} - {new Date(concession.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Contacto */}
                  <div className="space-y-1">
                    {concession.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{concession.contactPhone}</span>
                      </div>
                    )}
                    {concession.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{concession.contactEmail}</span>
                      </div>
                    )}
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