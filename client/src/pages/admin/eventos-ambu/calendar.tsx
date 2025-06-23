import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function CalendarioEventosAmbu() {
  const [fechaActual, setFechaActual] = useState(new Date());
  
  const mesActual = fechaActual.getMonth();
  const añoActual = fechaActual.getFullYear();
  
  // Obtener eventos del mes actual
  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["/api/eventos-ambu", mesActual, añoActual],
    queryFn: async () => {
      const primerDia = new Date(añoActual, mesActual, 1).toISOString().split('T')[0];
      const ultimoDia = new Date(añoActual, mesActual + 1, 0).toISOString().split('T')[0];
      
      const params = new URLSearchParams({
        fecha_desde: primerDia,
        fecha_hasta: ultimoDia,
        limit: "100"
      });

      const response = await fetch(`/api/eventos-ambu?${params}`);
      if (!response.ok) throw new Error("Error al cargar eventos");
      const data = await response.json();
      return data.eventos || [];
    }
  });

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(fechaActual);
    if (direccion === 'anterior') {
      nuevaFecha.setMonth(mesActual - 1);
    } else {
      nuevaFecha.setMonth(mesActual + 1);
    }
    setFechaActual(nuevaFecha);
  };

  const obtenerEventosDelDia = (dia: number) => {
    const fechaDia = new Date(añoActual, mesActual, dia).toISOString().split('T')[0];
    return eventos.filter((evento: EventoAmbu) => evento.fechaEvento === fechaDia);
  };

  const obtenerDiasDelMes = () => {
    const primerDia = new Date(añoActual, mesActual, 1);
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);
    const primerDiaSemana = primerDia.getDay();
    const diasEnMes = ultimoDia.getDate();
    
    const dias = [];
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    
    // Agregar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando calendario...</p>
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
            Calendario de Eventos AMBU
          </h1>
          <p className="text-gray-600 mt-1">
            Vista mensual de eventos de bajo y alto impacto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {nombresMeses[mesActual]} {añoActual}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navegarMes('anterior')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFechaActual(new Date())}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navegarMes('siguiente')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {nombresDias.map((dia) => (
                  <div key={dia} className="p-2 text-center font-medium text-gray-500 text-sm">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {obtenerDiasDelMes().map((dia, index) => {
                  if (dia === null) {
                    return <div key={index} className="h-24"></div>;
                  }
                  
                  const eventosDelDia = obtenerEventosDelDia(dia);
                  const esHoy = new Date().toDateString() === new Date(añoActual, mesActual, dia).toDateString();
                  
                  return (
                    <div
                      key={dia}
                      className={`h-24 p-1 border border-gray-200 ${
                        esHoy ? 'bg-blue-50 border-blue-300' : 'bg-white'
                      }`}
                    >
                      <div className={`text-sm font-medium ${esHoy ? 'text-blue-700' : 'text-gray-900'}`}>
                        {dia}
                      </div>
                      <div className="space-y-1 mt-1">
                        {eventosDelDia.slice(0, 2).map((evento: EventoAmbu) => (
                          <div
                            key={evento.id}
                            className={`text-xs p-1 rounded truncate ${
                              evento.impactoTipo === "bajo_impacto" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-orange-100 text-orange-800"
                            }`}
                            title={evento.titulo}
                          >
                            {evento.titulo}
                          </div>
                        ))}
                        {eventosDelDia.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{eventosDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos
                  .filter((evento: EventoAmbu) => new Date(evento.fechaEvento) >= new Date())
                  .sort((a: EventoAmbu, b: EventoAmbu) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime())
                  .slice(0, 5)
                  .map((evento: EventoAmbu) => (
                    <div key={evento.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm line-clamp-2">{evento.titulo}</h4>
                        <Badge className={impactoColors[evento.impactoTipo]} variant="secondary">
                          {evento.impactoTipo === "bajo_impacto" ? "Bajo" : "Alto"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(evento.fechaEvento).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          {evento.horaInicio} - {evento.horaFin}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          {evento.numeroAsistentes} asistentes
                        </div>
                        {evento.costoTotal > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            ${evento.costoTotal.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <Badge className={statusColors[evento.status as keyof typeof statusColors]} variant="outline" size="sm">
                        {evento.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                
                {eventos.filter((evento: EventoAmbu) => new Date(evento.fechaEvento) >= new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay eventos próximos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Tipo de Impacto</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span className="text-sm">Bajo Impacto (≤10 días)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-sm">Alto Impacto (2 meses)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Estados</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Solicitado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>En Revisión</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Aprobado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Rechazado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Realizado</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}