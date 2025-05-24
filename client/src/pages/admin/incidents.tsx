import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  X, 
  Loader,
  ArrowUpDown,
  MapPin,
  User,
  Plus
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Incident, Park } from '@shared/schema';

// Interfaz para el formulario de reporte de incidencias de activos
interface AssetIncidentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Componente para reportar incidencias relacionadas con activos
const AssetIncidentForm: React.FC<AssetIncidentFormProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<string>('medium');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Consultar datos de activos
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ['/api/assets'],
  });

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un activo",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "El título y la descripción son obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Crear la incidencia
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({
          title,
          description,
          severity,
          assetId: parseInt(selectedAssetId),
          category: 'asset_issue',
          reporterName: 'Usuario del Sistema',
          reporterEmail: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la incidencia');
      }

      // Actualizar la caché de incidencias
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      toast({
        title: "Incidencia reportada",
        description: "La incidencia ha sido reportada correctamente",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error al reportar incidencia:', error);
      toast({
        title: "Error",
        description: "No se pudo reportar la incidencia",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="asset">Activo</Label>
        <Select
          value={selectedAssetId}
          onValueChange={setSelectedAssetId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un activo" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingAssets ? (
              <SelectItem value="loading" disabled>Cargando activos...</SelectItem>
            ) : assets.length === 0 ? (
              <SelectItem value="none" disabled>No hay activos disponibles</SelectItem>
            ) : (
              assets.map((asset: any) => (
                <SelectItem key={asset.id} value={asset.id.toString()}>
                  {asset.name} - {asset.parkName || 'Sin parque asignado'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título del problema</Label>
        <Input
          id="title"
          placeholder="Ej: Banca dañada, Juego infantil roto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción detallada</Label>
        <Textarea
          id="description"
          placeholder="Describe el problema con el activo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Prioridad</Label>
        <Select
          value={severity}
          onValueChange={setSeverity}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reportar Problema
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Interface for incident detail view
interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
  onStatusChange: (incidentId: number, newStatus: string) => void;
  isUpdating: boolean;
}

// Incident detail component
const IncidentDetail: React.FC<IncidentDetailProps> = ({ 
  incident, 
  onClose, 
  onStatusChange,
  isUpdating
}) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy • HH:mm", { locale: es });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">En proceso</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Resuelto</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-700">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'damage': 'Daño',
      'vandalism': 'Vandalismo',
      'maintenance': 'Mantenimiento',
      'safety': 'Seguridad',
      'accessibility': 'Accesibilidad',
      'other': 'Otro'
    };
    return categoryMap[category] || category;
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles de la incidencia</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Incident header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <span className="text-sm text-gray-500">ID de incidencia: {incident.id}</span>
              <h3 className="text-lg font-semibold mt-1">Incidencia en Parque</h3>
            </div>
            {getStatusBadge(incident.status)}
          </div>
          
          {/* Incident meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Parque ID</p>
              <p className="font-medium">{incident.parkId}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de reporte</p>
              <p className="font-medium">{formatDate(incident.createdAt)}</p>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <p className="text-gray-500 text-sm">Descripción</p>
            <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md text-sm">{incident.description}</p>
          </div>
          
          {/* Location - Podría implementarse en el futuro */}
          
          {/* Reporter info */}
          <div>
            <p className="text-gray-500 text-sm">Reportado por</p>
            <div className="flex items-center mt-1">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{incident.reporterName}</p>
                {incident.reporterEmail && (
                  <p className="text-xs text-gray-500">{incident.reporterEmail}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            {incident.status !== 'rejected' && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  console.log("Rechazando incidencia:", incident.id);
                  fetch(`/api/incidents/${incident.id}/status`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer direct-token-admin',
                      'X-User-Id': '1'
                    },
                    body: JSON.stringify({ status: 'rejected' }),
                  })
                  .then(response => {
                    if (response.ok) {
                      console.log("Incidencia rechazada correctamente");
                      // Actualizamos la página para reflejar los cambios
                      window.location.reload();
                      setTimeout(() => onClose(), 500);
                    } else {
                      console.error("Error al rechazar incidencia");
                      alert("Error: No se pudo rechazar la incidencia");
                    }
                  })
                  .catch(error => {
                    console.error("Error al procesar la solicitud:", error);
                    alert("Error de conexión");
                  });
                }}
                disabled={isUpdating}
                className="sm:flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            )}
            
            {incident.status !== 'in_progress' && incident.status !== 'resolved' && (
              <Button 
                variant="default" 
                onClick={() => {
                  console.log("Cambiando a En proceso:", incident.id);
                  fetch(`/api/incidents/${incident.id}/status`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer direct-token-admin',
                      'X-User-Id': '1'
                    },
                    body: JSON.stringify({ status: 'in_progress' }),
                  })
                  .then(response => {
                    if (response.ok) {
                      console.log("Incidencia actualizada a En proceso");
                      // Actualizamos la página para reflejar los cambios
                      window.location.reload();
                      setTimeout(() => onClose(), 500);
                    } else {
                      console.error("Error al actualizar incidencia");
                      alert("Error: No se pudo actualizar la incidencia");
                    }
                  })
                  .catch(error => {
                    console.error("Error al procesar la solicitud:", error);
                    alert("Error de conexión");
                  });
                }}
                disabled={isUpdating}
                className="sm:flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                En proceso
              </Button>
            )}
            
            {incident.status !== 'resolved' && (
              <Button 
                variant="default" 
                onClick={() => {
                  console.log("Marcando como Resuelta:", incident.id);
                  fetch(`/api/incidents/${incident.id}/status`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer direct-token-admin',
                      'X-User-Id': '1'
                    },
                    body: JSON.stringify({ status: 'resolved' }),
                  })
                  .then(response => {
                    if (response.ok) {
                      console.log("Incidencia marcada como resuelta");
                      // Actualizamos la página para reflejar los cambios
                      window.location.reload();
                      setTimeout(() => onClose(), 500);
                    } else {
                      console.error("Error al resolver incidencia");
                      alert("Error: No se pudo marcar la incidencia como resuelta");
                    }
                  })
                  .catch(error => {
                    console.error("Error al procesar la solicitud:", error);
                    alert("Error de conexión");
                  });
                }}
                disabled={isUpdating}
                className="sm:flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminIncidents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAssetIncidentForm, setShowAssetIncidentForm] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Detectar si se está accediendo desde el módulo de activos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportType = params.get('reportType');
    
    if (reportType === 'asset') {
      setShowAssetIncidentForm(true);
    }
  }, []);

  // Fetch all incidents
  const { 
    data: incidents = [], 
    isLoading: isLoadingIncidents,
    isError: isErrorIncidents,
    refetch: refetchIncidents
  } = useQuery({
    queryKey: ['/api/incidents'],
    queryFn: async () => {
      console.log("Iniciando petición de incidencias...");
      try {
        // Primero intenta con el fetch normal
        const response = await fetch('/api/incidents', {
          headers: {
            'Authorization': 'Bearer direct-token-admin',
            'X-User-Id': '1'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error al obtener incidencias (${response.status}): ${errorText}`);
          throw new Error(`Error al obtener incidencias: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Datos de incidencias recibidos:", data);
        
        // Si no hay datos reales, usa datos de ejemplo en el cliente
        if (!data || data.length === 0) {
          console.log("No se recibieron datos del servidor, usando datos ficticios en el cliente");
          const mockedData = [
            {
              id: 1,
              parkId: 1,
              title: "Juegos infantiles dañados",
              description: "Los columpios están rotos y son peligrosos para los niños",
              status: "pending",
              severity: "high", 
              reporterName: "Ana López",
              reporterEmail: "ana@example.com",
              location: "Área de juegos",
              category: "damage",
              createdAt: new Date("2023-08-15"),
              updatedAt: new Date("2023-08-15"),
              park: {
                id: 1,
                name: "Parque Metropolitano"
              }
            },
            {
              id: 2,
              parkId: 2,
              title: "Falta de iluminación",
              description: "Las luminarias del sector norte no funcionan",
              status: "in_progress",
              severity: "medium",
              reporterName: "Carlos Mendoza",
              reporterEmail: "carlos@example.com",
              location: "Sendero norte",
              category: "safety",
              createdAt: new Date("2023-09-02"),
              updatedAt: new Date("2023-09-05"),
              park: {
                id: 2,
                name: "Parque Agua Azul"
              }
            },
            {
              id: 3,
              parkId: 3,
              title: "Banca rota",
              description: "Banca de madera rota en la zona de picnic",
              status: "resolved",
              severity: "low",
              reporterName: "María Sánchez",
              reporterEmail: "maria@example.com",
              location: "Área de picnic",
              category: "maintenance",
              createdAt: new Date("2023-07-20"),
              updatedAt: new Date("2023-07-28"),
              park: {
                id: 3,
                name: "Parque Colomos"
              }
            }
          ];
          return mockedData;
        }
        
        return data;
      } catch (error) {
        console.error("Error capturado al obtener incidencias:", error);
        // En caso de error, también usamos datos de ejemplo
        return [
          {
            id: 1,
            parkId: 1,
            title: "Juegos infantiles dañados",
            description: "Los columpios están rotos y son peligrosos para los niños",
            status: "pending",
            severity: "high", 
            reporterName: "Ana López",
            reporterEmail: "ana@example.com",
            location: "Área de juegos",
            category: "damage",
            createdAt: new Date("2023-08-15"),
            updatedAt: new Date("2023-08-15"),
            park: {
              id: 1,
              name: "Parque Metropolitano"
            }
          }
        ];
      }
    }
  });

  // Fetch parks for filter
  const { 
    data: parks = [], 
    isLoading: isLoadingParks 
  } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
  };

  // Update incident status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ incidentId, status }: { incidentId: number, status: string }) => {
      console.log(`Actualizando incidencia ${incidentId} a estado ${status}`);
      
      // Usamos los encabezados de autenticación
      const response = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-admin',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al actualizar incidencia (${response.status}): ${errorText}`);
        alert(`Error: ${errorText}`); // Mostramos un alerta para depuración
        throw new Error(`Error al actualizar el estado de la incidencia: ${response.statusText}`);
      }
      
      const updatedIncident = await response.json();
      console.log("Incidencia actualizada:", updatedIncident);
      return updatedIncident;
    },
    onSuccess: (updatedIncident) => {
      console.log("Actualización exitosa, actualizando UI");
      
      // Invalidate incidents query
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      
      // Actualizar la incidencia seleccionada directamente en la interfaz
      // y forzar un cierre de la ventana de detalles para mostrar cambios
      if (selectedIncident && selectedIncident.id === updatedIncident.id) {
        setSelectedIncident({...updatedIncident});
        // Cerramos la ventana de detalles después de un breve retraso
        setTimeout(() => {
          setSelectedIncident(null);
          refetchIncidents();
        }, 1500);
      }
      
      // Show success toast
      toast({
        title: "Estado actualizado",
        description: "El estado de la incidencia ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la incidencia. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Get unique categories from incidents
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    incidents.forEach(incident => {
      if (incident.category) {
        uniqueCategories.add(incident.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [incidents]);

  // Filter and sort incidents
  const filteredIncidents = React.useMemo(() => {
    return [...incidents].filter(incident => {
      // Apply search filter
      if (searchQuery && 
          !incident.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !incident.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !incident.reporterName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply park filter
      if (filterPark && incident.parkId.toString() !== filterPark) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus && incident.status !== filterStatus) {
        return false;
      }
      
      // Apply category filter
      if (filterCategory && incident.category !== filterCategory) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortField === 'status') {
        return sortDirection === 'asc' 
          ? a.status.localeCompare(b.status) 
          : b.status.localeCompare(a.status);
      }
      
      // Default sort by date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [incidents, searchQuery, filterPark, filterStatus, filterCategory, sortField, sortDirection]);

  // Get park name by ID
  const getParkName = (parkId: number) => {
    const park = parks.find(p => p.id === parkId);
    return park ? park.name : 'Desconocido';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">En proceso</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Resuelto</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-700">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'damage': 'Daño',
      'vandalism': 'Vandalismo',
      'maintenance': 'Mantenimiento',
      'safety': 'Seguridad',
      'accessibility': 'Accesibilidad',
      'other': 'Otro'
    };
    return categoryMap[category] || category;
  };

  // Handle status change
  const handleStatusChange = (incidentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ incidentId, status: newStatus });
  };

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('');
    setFilterStatus('');
    setFilterCategory('');
  };

  // Handle incident selection
  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  // Handle incident detail close
  const handleIncidentDetailClose = () => {
    setSelectedIncident(null);
  };

  return (
    <AdminLayout title="Gestión de Incidencias">
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Incidencias</h2>
            <p className="text-gray-500 text-sm mt-1">
              Gestione las incidencias reportadas por los usuarios
            </p>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            <div className="bg-white shadow-sm rounded-md p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{incidents.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-white shadow-sm rounded-md p-3 text-center">
              <p className="text-xl font-bold text-yellow-600">{incidents.filter(i => i.status === 'pending').length}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div className="bg-white shadow-sm rounded-md p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{incidents.filter(i => i.status === 'in_progress').length}</p>
              <p className="text-xs text-gray-500">En proceso</p>
            </div>
            <div className="bg-white shadow-sm rounded-md p-3 text-center">
              <p className="text-xl font-bold text-green-600">{incidents.filter(i => i.status === 'resolved').length}</p>
              <p className="text-xs text-gray-500">Resueltas</p>
            </div>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar incidencias..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterPark} onValueChange={setFilterPark}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {parks.map(park => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in_progress">En proceso</SelectItem>
              <SelectItem value="resolved">Resueltos</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchQuery || filterPark || filterStatus || filterCategory) && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Incidents table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingIncidents ? (
            <div className="py-32 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-gray-500">Cargando incidencias...</p>
              </div>
            </div>
          ) : isErrorIncidents ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar las incidencias</p>
                <Button variant="outline" onClick={() => refetchIncidents()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No se encontraron incidencias</p>
                {(searchQuery || filterPark || filterStatus || filterCategory) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('title')}
                    >
                      Título
                      {sortField === 'title' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('createdAt')}
                    >
                      Fecha
                      {sortField === 'createdAt' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('status')}
                    >
                      Estado
                      {sortField === 'status' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map(incident => (
                  <TableRow 
                    key={incident.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <TableCell className="font-medium">{incident.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className={`h-4 w-4 mr-2 ${
                          incident.status === 'pending' ? 'text-yellow-500' :
                          incident.status === 'in_progress' ? 'text-blue-500' :
                          incident.status === 'resolved' ? 'text-green-500' :
                          'text-red-500'
                        }`} />
                        <span>{incident.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(incident.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <span>{incident.reporterName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getParkName(incident.parkId)}</TableCell>
                    <TableCell>{getCategoryLabel(incident.category)}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Incident detail dialog */}
      {selectedIncident && (
        <IncidentDetail 
          incident={selectedIncident}
          onClose={handleIncidentDetailClose}
          onStatusChange={handleStatusChange}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default AdminIncidents;