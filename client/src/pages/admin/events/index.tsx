import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import AdminLayout from "@/components/AdminLayout";
import { 
  Calendar, 
  ChevronRight, 
  Filter, 
  PlusCircle, 
  Search,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Definimos los tipos que necesitamos para los eventos
interface Event {
  id: number;
  title: string;
  description: string | null;
  eventType: string;
  targetAudience: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  capacity: number | null;
  registrationType: string;
  organizerName: string | null;
  parks?: { id: number; name: string }[];
}

const EventsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Obtenemos los eventos desde el servidor
  const { data, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Si hay un error en la carga de datos
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Eventos"
          description="Gestiona los eventos de los parques"
          actions={
            <Button asChild>
              <Link href="/admin/events/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Evento
              </Link>
            </Button>
          }
        />
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar los eventos</CardTitle>
            <CardDescription>
              Hubo un problema al obtener los datos. Intenta recargar la página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filtrar eventos por búsqueda, estado y tipo
  const filteredEvents = data
    ? data.filter((event) => {
        const matchesSearch =
          !searchQuery ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.description &&
            event.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          statusFilter === "all" || event.status === statusFilter;

        const matchesType = typeFilter === "all" || event.eventType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  // Obtener los tipos de eventos únicos para los filtros
  const eventTypes = data
    ? Array.from(new Set(data.map((event) => event.eventType)))
    : [];

  // Generar un mapa de colores para los diferentes tipos de eventos
  const typeColorMap: Record<string, string> = {
    cultural: "bg-indigo-100 text-indigo-800 border-indigo-300",
    sports: "bg-green-100 text-green-800 border-green-300",
    environmental: "bg-emerald-100 text-emerald-800 border-emerald-300",
    social: "bg-orange-100 text-orange-800 border-orange-300",
    educational: "bg-blue-100 text-blue-800 border-blue-300",
    default: "bg-gray-100 text-gray-800 border-gray-300",
  };

  // Obtener los estados de eventos únicos para los filtros
  const eventStatuses = data
    ? Array.from(new Set(data.map((event) => event.status)))
    : [];

  // Generar un mapa de colores para los diferentes estados
  const statusColorMap: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    postponed: "bg-amber-100 text-amber-800",
    completed: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  // Traducir tipos de eventos a español
  const eventTypeTranslations: Record<string, string> = {
    cultural: "Cultural",
    sports: "Deportivo",
    environmental: "Ambiental",
    social: "Social",
    educational: "Educativo",
  };

  // Traducir estados a español
  const statusTranslations: Record<string, string> = {
    draft: "Borrador",
    published: "Publicado",
    canceled: "Cancelado",
    postponed: "Pospuesto",
    completed: "Completado",
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <PageHeader
          title="Eventos"
          description="Gestiona los eventos de los parques"
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/events/calendar">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Calendario
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/events/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Evento
                </Link>
              </Button>
            </>
          }
        />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar eventos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {eventStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusTranslations[status] || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {eventTypeTranslations[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredEvents.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={<Calendar className="h-10 w-10" />}
              title="No hay eventos"
              description={
                searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No se encontraron eventos con los filtros aplicados."
                  : "Aún no se han creado eventos. Crea tu primer evento para comenzar."
              }
              actions={
                <Button asChild>
                  <Link href="/admin/events/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Evento
                  </Link>
                </Button>
              }
            />
          </CardContent>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const formattedDate = event.startDate
                    ? format(new Date(event.startDate), "dd MMM yyyy", { locale: es })
                    : "Sin fecha";
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {event.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            typeColorMap[event.eventType] || typeColorMap.default
                          }
                        >
                          {eventTypeTranslations[event.eventType] || event.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            statusColorMap[event.status] || statusColorMap.default
                          }
                        >
                          {statusTranslations[event.status] || event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {event.location || "Sin ubicación"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                        >
                          <span className="sr-only">Ver detalles</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventsPage;