import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Target, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  TrendingUp,
  PlayCircle,
  PauseCircle,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Tipos
interface Campaign {
  id: number;
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// Esquema de validación
const campaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  client: z.string().min(1, 'El cliente es requerido'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  budget: z.number().min(0, 'El presupuesto debe ser mayor a 0'),
  priority: z.enum(['low', 'medium', 'high']),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

// Componente de ficha de campaña
interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}

function CampaignCard({ campaign, onEdit, onDelete, onToggleStatus }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isActive = campaign.status === 'active';
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {campaign.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Cliente: {campaign.client}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status === 'active' && 'Activa'}
              {campaign.status === 'paused' && 'Pausada'}
              {campaign.status === 'completed' && 'Completada'}
              {campaign.status === 'draft' && 'Borrador'}
            </Badge>
            <Badge className={getPriorityColor(campaign.priority)}>
              {campaign.priority === 'high' && 'Alta'}
              {campaign.priority === 'medium' && 'Media'}
              {campaign.priority === 'low' && 'Baja'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {campaign.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {campaign.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span>${campaign.budget.toLocaleString()}</span>
            </div>
          </div>

          {campaign.status === 'active' && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className={daysRemaining > 7 ? 'text-gray-600' : 'text-orange-600'}>
                {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Campaña vencida'}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(campaign)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(campaign.id, isActive ? 'paused' : 'active')}
            >
              {isActive ? (
                <>
                  <PauseCircle className="w-4 h-4 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Activar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(campaign.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de formulario
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}

function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign?.name || '',
      client: campaign?.client || '',
      description: campaign?.description || '',
      startDate: campaign?.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign?.endDate ? campaign.endDate.split('T')[0] : '',
      budget: campaign?.budget || 0,
      priority: campaign?.priority || 'medium',
    },
  });

  const handleSubmit = (data: CampaignFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Campaña</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Campaña Verde 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Eco Solutions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe los objetivos y características de la campaña..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presupuesto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {campaign ? 'Actualizar Campaña' : 'Crear Campaña'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Componente principal
export default function CampaignsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta para obtener campañas
  const { data: campaignResponse, isLoading } = useQuery({
    queryKey: ['/api/advertising-management/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/advertising-management/campaigns');
      if (!response.ok) throw new Error('Error al cargar campañas');
      return response.json();
    },
  });

  // Extraer campaigns del response
  const campaigns = campaignResponse?.data || [];

  // Mutación para crear campaña
  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      return apiRequest('/api/advertising-management/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Campaña creada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/campaigns'] });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña.",
        variant: "destructive",
      });
      console.error('Error creating campaign:', error);
    },
  });

  // Mutación para actualizar campaña
  const updateMutation = useMutation({
    mutationFn: async (data: CampaignFormData & { id: number }) => {
      return apiRequest(`/api/advertising-management/campaigns/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Campaña actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/campaigns'] });
      setShowForm(false);
      setEditingCampaign(undefined);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la campaña.",
        variant: "destructive",
      });
      console.error('Error updating campaign:', error);
    },
  });

  // Mutación para eliminar campaña
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/advertising-management/campaigns/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Campaña eliminada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la campaña.",
        variant: "destructive",
      });
      console.error('Error deleting campaign:', error);
    },
  });

  // Mutación para cambiar estado
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/advertising-management/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Estado de la campaña actualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertising-management/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la campaña.",
        variant: "destructive",
      });
      console.error('Error toggling status:', error);
    },
  });

  const handleSubmit = (data: CampaignFormData) => {
    if (editingCampaign) {
      updateMutation.mutate({ ...data, id: editingCampaign.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, status: string) => {
    toggleStatusMutation.mutate({ id, status });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCampaign(undefined);
  };

  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || campaign.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) : [];

  // Estadísticas
  const totalCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
  const activeCampaigns = Array.isArray(campaigns) ? campaigns.filter(c => c.status === 'active').length : 0;
  const totalBudget = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + c.budget, 0) : 0;
  const completedCampaigns = Array.isArray(campaigns) ? campaigns.filter(c => c.status === 'completed').length : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Campañas Publicitarias</h1>
            <p className="text-gray-600">Gestiona campañas publicitarias y su rendimiento</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
                </DialogTitle>
              </DialogHeader>
              <CampaignForm
                campaign={editingCampaign}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{completedCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Campañas */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando campañas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {filteredCampaigns.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay campañas</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No se encontraron campañas con los filtros aplicados.'
                : 'Aún no tienes campañas publicitarias. Crea la primera para comenzar.'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}