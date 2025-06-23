import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Eye, 
  Edit, 
  Filter, 
  Search, 
  Users, 
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventoAmbu {
  id: number;
  titulo: string;
  descripcion: string;
  impactoTipo: "bajo_impacto" | "alto_impacto";
  categoria: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentes: number;
  status: string;
  costoTotal: number;
  createdAt: string;
  solicitante: {
    nombreSolicitante: string;
    nombreInstitucion?: string;
  };
}

const statusColors = {
  borrador: "bg-gray-100 text-gray-800",
  solicitado: "bg-blue-100 text-blue-800",
  en_revision: "bg-yellow-100 text-yellow-800",
  aprobado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-800",
  realizado: "bg-purple-100 text-purple-800"
};

const impactoColors = {
  bajo_impacto: "bg-emerald-100 text-emerald-800",
  alto_impacto: "bg-orange-100 text-orange-800"
};

export default function EventosAmbuIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [impactoFilter, setImpactoFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener eventos con filtros
  const { data: eventosData = { eventos: [], total: 0 }, isLoading } = useQuery({
    queryKey: ["/api/eventos-ambu", searchTerm, statusFilter, impactoFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "todos" && { status: statusFilter }),
        ...(impactoFilter !== "todos" && { impacto_tipo: impactoFilter })
      });

      const response = await fetch(`/api/eventos-ambu?${params}`);
      if (!response.ok) throw new Error("Error al cargar eventos");
      return response.json();
    }
  });

  // Obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ["/api/eventos-ambu/stats"],
    queryFn: async () => {
      const response = await fetch("/api/eventos-ambu/stats");
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      return response.json();
    }
  });

  const formatearCategoria = (categoria: string) => {
    const categorias: Record<string, string> = {
      evento_familiar: "Evento Familiar",
      sesion_fotografia: "Sesión Fotográfica",
      convivencia_escolar: "Convivencia Escolar",
      sendero_interpretativo: "Sendero Interpretativo",
      recorrido_educativo: "Recorrido Educativo",
      evento_masivo: "Evento Masivo",
      evento_comercial: "Evento Comercial",
      evento_cooperativo: "Evento Cooperativo",
      carrera_deportiva: "Carrera Deportiva",
      actividad_fisica_grupal: "Actividad Física Grupal",
      evento_corporativo: "Evento Corporativo"
    };
    return categorias[categoria] || categoria;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprobado":
        return <CheckCircle className="h-4 w-4" />;
      case "rechazado":
        return <X className="h-4 w-4" />;
      case "en_revision":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setImpactoFilter("todos");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(eventosData.total / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando eventos AMBU...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Eventos AMBU
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de solicitudes para eventos de bajo y alto impacto en bosques urbanos
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/admin/eventos-ambu/calendar">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
          </Link>
          <Link href="/admin/eventos-ambu/tabulador">
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Tabulador
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Eventos</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bajo Impacto</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.bajoImpacto}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alto Impacto</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.altoImpacto}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Revisión</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.enRevision}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="solicitado">Solicitado</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Impacto</label>
              <Select value={impactoFilter} onValueChange={setImpactoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="bajo_impacto">Bajo Impacto</SelectItem>
                  <SelectItem value="alto_impacto">Alto Impacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Solicitud */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/admin/eventos-ambu/solicitud-bajo-impacto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">Solicitar Evento de Bajo Impacto</h3>
                  <p className="text-sm text-emerald-700">
                    Eventos familiares, sesiones fotográficas, convivencias escolares
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Anticipación: 10 días hábiles | Formulario F-DIC-22
                  </p>
                </div>
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/eventos-ambu/solicitud-alto-impacto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Solicitar Evento de Alto Impacto</h3>
                  <p className="text-sm text-orange-700">
                    Eventos masivos, comerciales, deportivos, corporativos
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Anticipación: 2 meses | Formulario F-DIC-23 + 50% anticipo
                  </p>
                </div>
                <Plus className="h-5 w-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Registrados</CardTitle>
          <p className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, eventosData.total)} de {eventosData.total} eventos
          </p>
        </CardHeader>
        <CardContent>
          {eventosData.eventos.length > 0 ? (
            <div className="space-y-4">
              {eventosData.eventos.map((evento: EventoAmbu) => (
                <div key={evento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{evento.titulo}</h3>
                        <Badge className={impactoColors[evento.impactoTipo]}>
                          {evento.impactoTipo === "bajo_impacto" ? "Bajo Impacto" : "Alto Impacto"}
                        </Badge>
                        <Badge className={statusColors[evento.status as keyof typeof statusColors]}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(evento.status)}
                            {evento.status.replace("_", " ").toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{evento.descripcion}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(evento.fechaEvento).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{evento.horaInicio} - {evento.horaFin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{evento.numeroAsistentes} asistentes</span>
                        </div>
                        {evento.costoTotal > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>${evento.costoTotal.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <p><strong>Categoría:</strong> {formatearCategoria(evento.categoria)}</p>
                        <p><strong>Solicitante:</strong> {evento.solicitante?.nombreSolicitante}</p>
                        {evento.solicitante?.nombreInstitucion && (
                          <p><strong>Institución:</strong> {evento.solicitante.nombreInstitucion}</p>
                        )}
                        <p><strong>Creado:</strong> {new Date(evento.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/admin/eventos-ambu/${evento.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/admin/eventos-ambu/${evento.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron eventos que coincidan con los filtros</p>
              <Button className="mt-4" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            
            {/* Números de página */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : 
                  currentPage >= totalPages - 2 ? totalPages - 4 + i :
                  currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={pageNum === currentPage ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}