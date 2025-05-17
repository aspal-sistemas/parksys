import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle, Clock, AlertTriangle, X, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Incident {
  id: number;
  parkId: number;
  description: string;
  status: string;
  reporterName: string;
  reporterEmail: string | null;
  reporterPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Park {
  id: number;
  name: string;
}

const AdminIncidents: React.FC = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Fetch all incidents
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: ['/api/incidents'],
    queryFn: async () => {
      const response = await fetch('/api/incidents');
      if (!response.ok) {
        throw new Error('Error al cargar incidentes');
      }
      return response.json() as Promise<Incident[]>;
    }
  });
  
  // Fetch all parks for reference
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar parques');
      }
      return response.json() as Promise<Park[]>;
    }
  });
  
  const getParkName = (parkId: number) => {
    const park = parks?.find(p => p.id === parkId);
    return park ? park.name : 'Parque desconocido';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'en progreso':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'resuelto':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelado':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en progreso':
        return 'bg-blue-100 text-blue-800';
      case 'resuelto':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const updateIncidentStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        toast({
          title: 'Estado actualizado',
          description: `El incidente ha sido marcado como ${status}`,
        });
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado del incidente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar el estado del incidente',
        variant: 'destructive',
      });
    }
  };
  
  const filteredIncidents = incidents?.filter(incident => 
    !statusFilter || incident.status.toLowerCase() === statusFilter.toLowerCase()
  );
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
            <p className="text-gray-500">Gestiona y responde a los incidentes reportados por los ciudadanos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtro por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en progreso">En progreso</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            Error al cargar incidentes. Por favor, intenta de nuevo.
          </div>
        ) : filteredIncidents && filteredIncidents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Incidente #{incident.id}
                    </CardTitle>
                    <Badge className={getStatusBadgeClass(incident.status)}>
                      <span className="mr-1">{getStatusIcon(incident.status)}</span>
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Reportado el {format(new Date(incident.createdAt), 'PPP', { locale: es })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{incident.description}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Parque:</strong> {getParkName(incident.parkId)}</p>
                    <p><strong>Reportado por:</strong> {incident.reporterName}</p>
                    {incident.reporterEmail && <p><strong>Email:</strong> {incident.reporterEmail}</p>}
                    {incident.reporterPhone && <p><strong>Teléfono:</strong> {incident.reporterPhone}</p>}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between py-3">
                  {incident.status.toLowerCase() !== 'resuelto' && (
                    <Select
                      onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En progreso">En progreso</SelectItem>
                        <SelectItem value="Resuelto">Resuelto</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay incidentes</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter 
                ? `No hay incidentes con estado "${statusFilter}"`
                : "Aún no se han reportado incidentes"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminIncidents;