import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  FileText, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  statusPago: string;
  createdAt: string;
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

export default function EventosAmbuIndex() {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    impactoTipo: "",
    categoria: "",
    status: "",
    fechaDesde: "",
    fechaHasta: ""
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [tabActiva, setTabActiva] = useState("todos");

  // Obtener eventos
  const { data: eventosData, isLoading, error, refetch } = useQuery({
    queryKey: [
      "/api/eventos-ambu", 
      filtros, 
      paginaActual,
      tabActiva !== "todos" ? tabActiva : ""
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        limit: "10",
        ...(filtros.impactoTipo && { impacto_tipo: filtros.impactoTipo }),
        ...(filtros.categoria && { categoria: filtros.categoria }),
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.fechaDesde && { fecha_desde: filtros.fechaDesde }),
        ...(filtros.fechaHasta && { fecha_hasta: filtros.fechaHasta }),
        ...(tabActiva !== "todos" && { impacto_tipo: tabActiva })
      });

      const response = await fetch(`/api/eventos-ambu?${params}`);
      if (!response.ok) throw new Error("Error al cargar eventos");
      return response.json();
    }
  });

  // Obtener estadísticas dashboard
  const { data: dashboard } = useQuery({
    queryKey: ["/api/eventos-ambu/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/eventos-ambu/dashboard");
      if (!response.ok) throw new Error("Error al cargar dashboard");
      return response.json();
    }
  });

  const eventos = eventosData?.eventos || [];
  const pagination = eventosData?.pagination || {};

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      impactoTipo: "",
      categoria: "",
      status: "",
      fechaDesde: "",
      fechaHasta: ""
    });
    setPaginaActual(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprobado":
        return <CheckCircle className="h-4 w-4" />;
      case "rechazado":
        return <XCircle className="h-4 w-4" />;
      case "en_revision":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar eventos</p>
        <Button onClick={() => refetch()} className="mt-2">
          Reintentar
        </Button>
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
            Sistema de gestión para eventos de bajo y alto impacto según normativas F-DIC-22 y F-DIC-23
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/eventos-ambu/solicitud-bajo-impacto">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Evento Bajo Impacto
            </Button>
          </Link>
          <Link href="/admin/eventos-ambu/solicitud-alto-impacto">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Evento Alto Impacto
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Eventos</p>
                  <p className="text-2xl font-bold">{dashboard.totalEventos}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Revisión</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboard.eventosPorEstado?.find((e: any) => e.status === "en_revision")?.count || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard.eventosPorEstado?.find((e: any) => e.status === "aprobado")?.count || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Próximos 30 días</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboard.eventosProximos?.length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Tipo de Impacto</Label>
              <Select 
                value={filtros.impactoTipo} 
                onValueChange={(value) => handleFiltroChange("impactoTipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="bajo_impacto">Bajo Impacto</SelectItem>
                  <SelectItem value="alto_impacto">Alto Impacto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select 
                value={filtros.status} 
                onValueChange={(value) => handleFiltroChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="solicitado">Solicitado</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha desde</Label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
              />
            </div>

            <div>
              <Label>Fecha hasta</Label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={limpiarFiltros}
                className="w-full"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por tipo de impacto */}
      <Tabs value={tabActiva} onValueChange={setTabActiva} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">Todos los Eventos</TabsTrigger>
          <TabsTrigger value="bajo_impacto">Bajo Impacto</TabsTrigger>
          <TabsTrigger value="alto_impacto">Alto Impacto</TabsTrigger>
        </TabsList>

        <TabsContent value={tabActiva}>
          {/* Lista de eventos */}
          <div className="space-y-4">
            {eventos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron eventos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No hay eventos que coincidan con los filtros seleccionados.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Link href="/admin/eventos-ambu/solicitud-bajo-impacto">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Evento Bajo Impacto
                      </Button>
                    </Link>
                    <Link href="/admin/eventos-ambu/solicitud-alto-impacto">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Evento Alto Impacto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              eventos.map((evento: EventoAmbu) => (
                <Card key={evento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {evento.titulo}
                          </h3>
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

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {evento.descripcion}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{new Date(evento.fechaEvento).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{evento.horaInicio} - {evento.horaFin}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{evento.numeroAsistentes} asistentes</span>
                          </div>
                          {evento.costoTotal > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span>${evento.costoTotal.toFixed(2)} MXN</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <Badge variant="outline">
                            {formatearCategoria(evento.categoria)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link href={`/admin/eventos-ambu/${evento.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/eventos-ambu/${evento.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPaginaActual(pagination.page - 1)}
              >
                Anterior
              </Button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaginaActual(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPaginaActual(pagination.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}