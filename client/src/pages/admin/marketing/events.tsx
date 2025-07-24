import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Users, Trophy, Search, Filter, Eye, Edit, Trash2, MapPin, DollarSign, Clock, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { safeApiRequest, apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

// Schema de validación para eventos patrocinados
const eventSchema = z.object({
  sponsorId: z.number().min(1, 'Debe seleccionar un patrocinador'),
  contractId: z.number().min(1, 'Debe seleccionar un contrato'),
  eventName: z.string().min(1, 'El nombre del evento es obligatorio'),
  eventDate: z.string().min(1, 'La fecha del evento es obligatoria'),
  eventLocation: z.string().optional(),
  sponsorshipLevel: z.enum(['principal', 'secundario', 'colaborador']),
  logoPlacement: z.string().optional(),
  exposureMinutes: z.number().min(0).optional(),
  standSize: z.string().optional(),
  activationBudget: z.number().min(0).optional(),
  specialRequirements: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending')
});

type EventFormData = z.infer<typeof eventSchema>;

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      sponsorId: 0,
      contractId: 0,
      eventName: '',
      eventDate: '',
      eventLocation: '',
      sponsorshipLevel: 'colaborador',
      logoPlacement: '',
      exposureMinutes: 0,
      standSize: '',
      activationBudget: 0,
      specialRequirements: '',
      status: 'pending'
    }
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/sponsor-events'],
    queryFn: () => safeApiRequest('/api/sponsor-events', {})
  });

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/sponsorship-contracts'],
    queryFn: () => safeApiRequest('/api/sponsorship-contracts', {})
  });

  // Mutación para crear evento
  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => 
      apiRequest('/api/sponsor-events', {
        method: 'POST',
        data: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsor-events'] });
      setShowNewEventDialog(false);
      form.reset();
      toast({
        title: 'Evento creado',
        description: 'El evento patrocinado se ha creado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el evento patrocinado',
        variant: 'destructive',
      });
    }
  });

  // Mutación para actualizar evento
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventFormData }) => 
      apiRequest(`/api/sponsor-events/${id}`, {
        method: 'PUT',
        data: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsor-events'] });
      setShowEditDialog(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: 'Evento actualizado',
        description: 'El evento patrocinado se ha actualizado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el evento patrocinado',
        variant: 'destructive',
      });
    }
  });

  // Mutación para eliminar evento
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/sponsor-events/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsor-events'] });
      setShowDeleteDialog(false);
      setEventToDelete(null);
      toast({
        title: 'Evento eliminado',
        description: 'El evento patrocinado se ha eliminado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el evento patrocinado',
        variant: 'destructive',
      });
    }
  });

  // Funciones de manejo de eventos
  const handleCreateEvent = (data: EventFormData) => {
    createMutation.mutate(data);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    form.reset({
      sponsorId: event.sponsorId,
      contractId: event.contractId,
      eventName: event.eventName,
      eventDate: event.eventDate?.split('T')[0] || '',
      eventLocation: event.eventLocation || '',
      sponsorshipLevel: event.sponsorshipLevel,
      logoPlacement: event.logoPlacement || '',
      exposureMinutes: event.exposureMinutes || 0,
      standSize: event.standSize || '',
      activationBudget: parseFloat(event.activationBudget) || 0,
      specialRequirements: event.specialRequirements || '',
      status: event.status
    });
    setShowEditDialog(true);
  };

  const handleUpdateEvent = (data: EventFormData) => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    }
  };

  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  };

  const getSponsorshipLevelColor = (level: string) => {
    switch (level) {
      case 'principal': return 'bg-gold-100 text-gold-800';
      case 'secundario': return 'bg-silver-100 text-silver-800';
      case 'colaborador': return 'bg-bronze-100 text-bronze-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = 
      event.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.specialRequirements?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalBudget = events?.reduce((sum: number, event: any) => 
    sum + parseFloat(event.activationBudget || '0'), 0) || 0;

  const confirmedEvents = events?.filter((e: any) => e.status === 'confirmed').length || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-gray-900" />
                  <h1 className="text-3xl font-bold text-gray-900">Eventos Patrocinados</h1>
                </div>
                <p className="text-gray-600 mt-2">Gestiona todos los eventos con patrocinio</p>
              </div>
              <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00a587] hover:bg-[#067f5f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento Patrocinado</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateEvent)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sponsorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patrocinador</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar patrocinador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sponsors?.map((sponsor: any) => (
                              <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                                {sponsor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contrato</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar contrato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contracts?.map((contract: any) => (
                              <SelectItem key={contract.id} value={contract.id.toString()}>
                                {contract.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del evento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha del Evento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="eventLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación del Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ubicación del evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sponsorshipLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel de Patrocinio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nivel de patrocinio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="principal">Principal</SelectItem>
                            <SelectItem value="secundario">Secundario</SelectItem>
                            <SelectItem value="colaborador">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Estado del evento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logoPlacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación del Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ubicación del logo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="standSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamaño del Stand</FormLabel>
                        <FormControl>
                          <Input placeholder="Tamaño del stand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="exposureMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minutos de Exposición</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Minutos de exposición"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activationBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto de Activación</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="Presupuesto de activación"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="specialRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requerimientos Especiales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Requerimientos especiales del evento"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewEventDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Evento'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
            </div>
          </CardContent>
        </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eventos Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{confirmedEvents}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalBudget.toLocaleString('es-MX')}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patrocinadores Únicos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(events?.map((e: any) => e.sponsorId)).size || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: any) => (
          <Card key={event.id} className="border-l-4 border-l-[#00a587]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-800 mb-1">
                    {event.eventName}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Building className="w-4 h-4" />
                    {event.sponsorName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {event.eventDate ? 
                      format(new Date(event.eventDate), 'dd/MM/yyyy', { locale: es }) : 
                      'Sin fecha'
                    }
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getSponsorshipLevelColor(event.sponsorshipLevel)}>
                    {event.sponsorshipLevel}
                  </Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {event.eventLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#00a587]" />
                    <span className="text-gray-700">{event.eventLocation}</span>
                  </div>
                )}
                {event.logoPlacement && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-[#00a587]" />
                    <span className="text-gray-700">Logo: {event.logoPlacement}</span>
                  </div>
                )}
                {event.exposureMinutes > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#00a587]" />
                    <span className="text-gray-700">
                      Exposición: {event.exposureMinutes} minutos
                    </span>
                  </div>
                )}
                {event.standSize && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-[#00a587]" />
                    <span className="text-gray-700">Stand: {event.standSize}</span>
                  </div>
                )}
                {event.specialRequirements && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong className="text-gray-700">Requerimientos:</strong>
                    <p className="text-gray-600 mt-1">{event.specialRequirements}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <strong>Presupuesto:</strong> ${parseFloat(event.activationBudget || '0').toLocaleString('es-MX')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteEvent(event)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron eventos patrocinados
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer evento patrocinado'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => setShowNewEventDialog(true)}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Evento
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento Patrocinado</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateEvent)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sponsorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patrocinador</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar patrocinador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sponsors?.map((sponsor: any) => (
                            <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                              {sponsor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrato</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar contrato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts?.map((contract: any) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha del Evento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="eventLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación del Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ubicación del evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sponsorshipLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Patrocinio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nivel de patrocinio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="secundario">Secundario</SelectItem>
                          <SelectItem value="colaborador">Colaborador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado del evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logoPlacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación del Logo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ubicación del logo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="standSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño del Stand</FormLabel>
                      <FormControl>
                        <Input placeholder="Tamaño del stand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exposureMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minutos de Exposición</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Minutos de exposición"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activationBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto de Activación</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="Presupuesto de activación"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requerimientos Especiales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Requerimientos especiales del evento"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Evento'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el evento "{eventToDelete?.eventName}"?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EventsPage;