import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, MapPin, Building, Phone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PublicLayout from '@/components/PublicLayout';
import AdSpace from '@/components/AdSpace';
import heroImage from '@assets/barista-making-tasty-coffee-on-a-professional-mach-2025-01-07-23-28-05-utc_1751509914385.jpg';

interface Concession {
  id: number;
  name: string;
  description: string;
  concession_type_id: number;
  concessionaire_id: number;
  park_id: number;
  specific_location: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  monthly_payment: string;
  operating_hours: string;
  operating_days: string;
  emergency_contact: string;
  emergency_phone: string;
  concessionTypeName: string;
  concessionTypeDescription: string;
  impactLevel: string;
  concessionaireName: string;
  concessionaireEmail: string;
  concessionairePhone?: string;
  parkName: string;
  parkLocation: string;
  imageCount: number;
  primaryImage?: string;
}

export default function ConcessionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parkFilter, setParkFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: concessionsResponse, isLoading } = useQuery({
    queryKey: ['/api/active-concessions'],
  });

  const { data: parksResponse } = useQuery({
    queryKey: ['/api/parks'],
  });

  const concessions = (concessionsResponse as any)?.data || [];
  const parks = (parksResponse as any)?.data || [];

  // Filtrar concesiones
  const filteredConcessions = concessions.filter((concession: Concession) => {
    const matchesSearch = (concession.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (concession.concessionTypeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (concession.specific_location || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || (concession.concessionTypeName || "").includes(typeFilter);
    const matchesStatus = statusFilter === "all" || concession.status === statusFilter;
    const matchesPark = parkFilter === "all" || concession.park_id?.toString() === parkFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPark;
  });

  // Paginación
  const totalPages = Math.ceil(filteredConcessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentConcessions = filteredConcessions.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setParkFilter("all");
    setCurrentPage(1);
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
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative text-white py-24"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Filtros - Movidos pegados al hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <SelectItem value="Venta de alimentos">Venta de alimentos</SelectItem>
                <SelectItem value="Renta de bicicletas">Renta de bicicletas</SelectItem>
                <SelectItem value="Kiosco de información">Kiosco de información</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="expiring">Por vencer</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por parque */}
            <Select value={parkFilter} onValueChange={setParkFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Parque" />
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

            {/* Limpiar filtros */}
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Banner Publicitario de Ancho Completo */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-3">
        <AdSpace spaceId="35" position="banner" pageType="concessions" />
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredConcessions.length} concesiones encontradas
          </h2>
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredConcessions.length)} de {filteredConcessions.length}
          </div>
        </div>

        {/* Layout con Sidebar Publicitario */}
        <div className="flex gap-6">
          {/* Contenido Principal */}
          <div className="flex-1 min-w-0">
            {/* Grid de concesiones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentConcessions.map((concession: Concession) => (
            <div key={concession.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image Section */}
              <div className="aspect-video w-full bg-gradient-to-br from-[#00a587] via-[#067f5f] to-[#8498a5] relative overflow-hidden">
                {concession.primaryImage ? (
                  <img
                    src={concession.primaryImage}
                    alt={concession.name}
                    className="w-full h-full object-contain bg-gradient-to-br from-[#00a587] via-[#067f5f] to-[#8498a5]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Building className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium opacity-90">{concession.concessionTypeName}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    concession.status === 'activa' || concession.status === 'active'
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
                  {concession.name}
                </h3>
                
                <p className="text-sm text-[#00a587] font-medium mb-3">{concession.concessionTypeName}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.specific_location}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.parkName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{concession.emergency_phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(concession.start_date).toLocaleDateString('es-ES')} - {new Date(concession.end_date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/concession/${concession.id}`}>
                    <Button className="w-full bg-[#00a587] text-white hover:bg-[#067f5f]">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
              ))}
            </div>
          </div>

          {/* Sidebar Publicitario */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Espacio 1 - Servicios */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <AdSpace spaceId="9" position="sidebar" pageType="concessions" />
              </div>

              {/* Espacio 2 - Oportunidades */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <AdSpace spaceId="19" position="sidebar" pageType="concessions" />
              </div>

              {/* Espacio 3 - Inversión */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <AdSpace spaceId="23" position="sidebar" pageType="concessions" />
              </div>

              {/* Espacio 4 - Eventos */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <AdSpace spaceId="24" position="sidebar" pageType="concessions" />
              </div>

              {/* Espacio 5 - Recursos */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                <AdSpace spaceId="25" position="sidebar" pageType="concessions" />
              </div>
            </div>
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
              if (pageNumber > totalPages) return null;
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={currentPage === pageNumber ? "bg-[#00a587] text-white" : ""}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
      </div>
    </PublicLayout>
  );
}