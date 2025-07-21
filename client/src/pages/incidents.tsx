import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Incident, Park } from "@shared/schema";
import { IncidentCard } from "@/components/IncidentCard";
import { IncidentReportForm } from "@/components/IncidentReportForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

// Componente principal para la página de incidentes
const Incidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Obtener todos los parques para el selector
  const { data: parks = [], isLoading: isLoadingParks } = useQuery<Park[]>({
    queryKey: ["/api/parks"],
  });

  // Obtener todos los incidentes
  const { data: allIncidents = [], isLoading: isLoadingIncidents } = useQuery<
    (Incident & { parkName?: string })[]
  >({
    queryKey: ["/api/incidents"],
    select: (data) => {
      // Enriquecer los datos de incidentes con nombres de parques
      return data.map((incident) => {
        const park = parks.find((p) => p.id === incident.parkId);
        return {
          ...incident,
          parkName: park?.name,
        };
      });
    },
    enabled: !isLoadingParks && parks.length > 0,
  });

  // Filtrar incidentes
  const filteredIncidents = allIncidents.filter((incident) => {
    // Filtro por parque
    const matchesPark = selectedParkId 
      ? incident.parkId === selectedParkId 
      : true;
    
    // Filtro por estado
    const matchesStatus = statusFilter !== "all" 
      ? incident.status === statusFilter 
      : true;
    
    // Filtro por texto
    const matchesSearch = searchTerm
      ? incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesPark && matchesStatus && matchesSearch;
  });

  // Manejar la apertura del diálogo de reporte seleccionando un parque
  const handleOpenReportDialog = (parkId?: number) => {
    if (parkId) {
      setSelectedParkId(parkId);
    } else if (parks.length > 0 && !selectedParkId) {
      setSelectedParkId(parks[0].id);
    }
    setIsReportDialogOpen(true);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reportes de Incidentes
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y visualiza los problemas reportados en los parques
          </p>
        </div>

        <Button
          className="mt-4 md:mt-0"
          onClick={() => handleOpenReportDialog()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Reportar Incidente
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar incidentes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por estado" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="in_progress">En progreso</SelectItem>
            <SelectItem value="resolved">Resueltos</SelectItem>
            <SelectItem value="urgent">Urgentes</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedParkId?.toString() || "all"}
          onValueChange={(value) => setSelectedParkId(value === "all" ? null : Number(value))}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por parque" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los parques</SelectItem>
            {parks.map((park) => (
              <SelectItem key={park.id} value={park.id.toString()}>
                {park.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado de carga */}
      {isLoadingIncidents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg h-40 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              parkName={incident.parkName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trash2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No hay incidentes
          </h3>
          <p className="text-gray-600 mt-1">
            {searchTerm || statusFilter !== "all" || selectedParkId
              ? "No se encontraron incidentes con los filtros seleccionados"
              : "Actualmente no hay incidentes reportados"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSelectedParkId(null);
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Diálogo para reportar incidente */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" aria-describedby="incident-report-description">
          <DialogHeader>
            <DialogTitle>Reportar Incidente</DialogTitle>
            <DialogDescription>
              Informe sobre problemas encontrados en el parque para que puedan ser atendidos.
            </DialogDescription>
          </DialogHeader>
          <div id="incident-report-description" className="sr-only">
            Formulario para reportar incidentes en parques con detalles y ubicación
          </div>

          {!isLoadingParks && selectedParkId ? (
            <div className="py-4">
              <IncidentReportForm
                parkId={selectedParkId}
                parkName={parks.find(p => p.id === selectedParkId)?.name || ""}
                onSuccess={() => setIsReportDialogOpen(false)}
                onCancel={() => setIsReportDialogOpen(false)}
              />
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              {isLoadingParks ? (
                "Cargando parques..."
              ) : (
                "Por favor seleccione un parque para reportar un incidente."
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Incidents;