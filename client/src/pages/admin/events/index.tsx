import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Edit, Eye, Trash2, Filter, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Layout y componentes propios
import AdminLayout from '@/components/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';

const EventStatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'postponed':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'published':
        return 'Publicado';
      case 'canceled':
        return 'Cancelado';
      case 'postponed':
        return 'Pospuesto';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusStyles(status)} variant="outline">
      {getStatusLabel(status)}
    </Badge>
  );
};

const EventsList = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Obtener la lista de eventos
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/events'],
    retry: false,
  });

  // Obtener datos de referencia para eventos (tipos, audiencias, estados)
  const { data: refData } = useQuery({
    queryKey: ['/api/events-reference-data'],
    retry: false,
  });

  // Función para manejar la eliminación de un evento
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': localStorage.getItem('userId') || '',
            'X-User-Role': localStorage.getItem('userRole') || '',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          toast({
            title: 'Evento eliminado',
            description: 'El evento ha sido eliminado correctamente.',
            variant: 'default',
          });
          refetch();
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Error al eliminar el evento');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error al eliminar el evento',
          variant: 'destructive',
        });
      }
    }
  };

  // Filtrar los eventos según los criterios de búsqueda y filtros
  const filteredEvents = events && Array.isArray(events) ? events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || event.eventType === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) : [];

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <Skeleton className="h-8 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-red-500" />}
        title="Error al cargar los eventos"
        description="No se pudieron cargar los eventos. Por favor, intenta recargar la página."
        actions={
          <Button onClick={() => refetch()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
        title="No hay eventos"
        description="No se encontraron eventos. Crea uno nuevo para comenzar."
        actions={
          <Button onClick={() => setLocation('/admin/events/new')}>
            Crear evento
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar eventos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {refData?.eventTypes?.map((type: string) => (
              <SelectItem key={type} value={type}>
                {type === 'cultural' ? 'Cultural' : 
                 type === 'sports' ? 'Deportivo' : 
                 type === 'environmental' ? 'Ambiental' : 
                 type === 'social' ? 'Social' : 
                 type === 'other' ? 'Otro' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {refData?.eventStatuses?.map((status: string) => (
              <SelectItem key={status} value={status}>
                {status === 'draft' ? 'Borrador' : 
                 status === 'published' ? 'Publicado' : 
                 status === 'canceled' ? 'Cancelado' : 
                 status === 'postponed' ? 'Pospuesto' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setLocation('/admin/events/new')} className="md:w-auto w-full">
          Crear evento
        </Button>
      </div>

      {/* Tabla de eventos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {event.eventType === 'cultural' ? 'Cultural' : 
                     event.eventType === 'sports' ? 'Deportivo' : 
                     event.eventType === 'environmental' ? 'Ambiental' : 
                     event.eventType === 'social' ? 'Social' : 
                     event.eventType === 'other' ? 'Otro' : event.eventType}
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.startDate), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/admin/events/${event.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/admin/events/${event.id}/edit`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const EventsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Eventos"
          description="Gestiona los eventos y actividades programadas en los parques."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/admin/events/calendar'}>
                <Calendar className="mr-2 h-4 w-4" />
                Ver calendario
              </Button>
              <Button onClick={() => window.location.href = '/admin/events/new'}>
                Crear evento
              </Button>
            </div>
          }
        />
        <Separator />
        <EventsList />
      </div>
    </AdminLayout>
  );
};

export default EventsPage;