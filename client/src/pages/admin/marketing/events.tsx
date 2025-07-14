import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Users, Trophy, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorEvent } from '@/shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/sponsor-events'],
    queryFn: () => safeApiRequest('/api/sponsor-events', {})
  });

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

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

  const filteredEvents = events?.filter((event: SponsorEvent) => {
    const sponsor = sponsors?.find((s: any) => s.id === event.sponsorId);
    const matchesSearch = sponsor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.specialRequirements?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalBudget = events?.reduce((sum: number, event: SponsorEvent) => 
    sum + parseFloat(event.activationBudget || '0'), 0) || 0;

  const confirmedEvents = events?.filter((e: SponsorEvent) => e.status === 'confirmed').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos Patrocinados</h1>
          <p className="text-gray-600">Gestiona todos los eventos con patrocinio</p>
        </div>
        <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento Patrocinado</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 mx-auto text-[#00a587] mb-4" />
              <p className="text-gray-600">
                Funcionalidad de creación de eventos patrocinados en desarrollo
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  {new Set(events?.map((e: SponsorEvent) => e.sponsorId)).size || 0}
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
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.map((event: SponsorEvent) => {
          const sponsor = sponsors?.find((s: any) => s.id === event.sponsorId);
          
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {sponsor?.name || 'Patrocinador Desconocido'}
                      </h3>
                      <Badge className={getSponsorshipLevelColor(event.sponsorshipLevel)}>
                        {event.sponsorshipLevel}
                      </Badge>
                      <Badge className={getStatusColor(event.status || 'pending')}>
                        {getStatusText(event.status || 'pending')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Nivel de Patrocinio</p>
                        <p className="font-medium capitalize">{event.sponsorshipLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ubicación de Logo</p>
                        <p className="font-medium">{event.logoPlacement || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Minutos de Exposición</p>
                        <p className="font-medium">{event.exposureMinutes || 0} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tamaño de Stand</p>
                        <p className="font-medium">{event.standSize || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Presupuesto de Activación</p>
                        <p className="font-medium text-green-600">
                          ${parseFloat(event.activationBudget || '0').toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contrato ID</p>
                        <p className="font-medium">{event.contractId || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {event.specialRequirements && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Requerimientos Especiales</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{event.specialRequirements}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" title="Ver detalles">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Eliminar" className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    </div>
  );
};

export default EventsPage;