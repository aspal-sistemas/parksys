import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { safeApiRequest } from '@/lib/queryClient';
import { AdminLayout } from '@/components/AdminLayout';

// Tipos para el sistema de contratos
interface Contract {
  id: number;
  sponsor_id: number;
  package_id: number;
  campaign_id: number;
  contract_number: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  payment_schedule: string;
  status: string;
  signed_date?: string;
  terms_conditions?: string;
  deliverables?: string;
  performance_metrics?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  sponsor_name?: string;
  sponsor_logo?: string;
  package_name?: string;
  package_tier?: string;
  campaign_name?: string;
}

interface Payment {
  id: number;
  contract_id: number;
  payment_number: number;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  notes?: string;
}

interface ContractEvent {
  id: number;
  contract_id: number;
  event_title: string;
  event_date: string;
  event_type: string;
  park_id?: number;
  park_name?: string;
  description?: string;
  expected_attendance?: number;
  status: string;
}

interface ContractFormData {
  sponsorId: number;
  packageId: number;
  campaignId: number;
  contractNumber: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentSchedule: string;
  status: string;
  termsConditions: string;
  deliverables: string;
  performanceMetrics: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

const ContractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>({
    sponsorId: 0,
    packageId: 0,
    campaignId: 0,
    contractNumber: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    paymentSchedule: 'monthly',
    status: 'draft',
    termsConditions: '',
    deliverables: '',
    performanceMetrics: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener contratos
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['sponsorship-contracts'],
    queryFn: () => safeApiRequest('/api/sponsorship-contracts'),
  });

  // Obtener patrocinadores para el formulario
  const { data: sponsors } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors'),
  });

  // Obtener paquetes para el formulario
  const { data: packages } = useQuery({
    queryKey: ['sponsorship-packages'],
    queryFn: () => safeApiRequest('/api/sponsorship-packages'),
  });

  // Obtener campañas para el formulario
  const { data: campaigns } = useQuery({
    queryKey: ['sponsorship-campaigns'],
    queryFn: () => safeApiRequest('/api/sponsorship-campaigns'),
  });

  // Obtener pagos del contrato seleccionado
  const { data: payments } = useQuery({
    queryKey: ['contract-payments', selectedContract?.id],
    queryFn: () => safeApiRequest(`/api/sponsorship-contracts/${selectedContract?.id}/payments`),
    enabled: !!selectedContract?.id,
  });

  // Obtener eventos del contrato seleccionado
  const { data: events } = useQuery({
    queryKey: ['contract-events', selectedContract?.id],
    queryFn: () => safeApiRequest(`/api/sponsorship-contracts/${selectedContract?.id}/events`),
    enabled: !!selectedContract?.id,
  });

  // Mutación para crear contrato
  const createContractMutation = useMutation({
    mutationFn: (data: ContractFormData) => 
      safeApiRequest('/api/sponsorship-contracts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship-contracts'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Contrato creado",
        description: "El contrato ha sido creado exitosamente.",
      });
      // Resetear formulario
      setFormData({
        sponsorId: 0,
        packageId: 0,
        campaignId: 0,
        contractNumber: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        totalAmount: 0,
        paymentSchedule: 'monthly',
        status: 'draft',
        termsConditions: '',
        deliverables: '',
        performanceMetrics: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el contrato. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Filtrar contratos
  const filteredContracts = contracts?.filter((contract: Contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.sponsor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Función para obtener color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el ícono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para ver detalles del contrato
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  // Función para crear contrato
  const handleCreateContract = () => {
    // Generar número de contrato automático
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const dataToSend = {
      ...formData,
      contractNumber
    };
    createContractMutation.mutate(dataToSend);
  };

  // Función para actualizar campo del formulario
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a587] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando contratos...</p>
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
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-8 h-8 text-gray-900" />
                  <h1 className="text-3xl font-bold text-gray-900">Contratos de Patrocinio</h1>
                </div>
                <p className="text-gray-600 mt-2">Gestión de contratos, pagos y compromisos</p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#00a587] hover:bg-[#067f5f] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Contrato
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título, patrocinador o número de contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contratos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredContracts?.filter((c: Contract) => c.status === 'active').length || 0}
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
                  <p className="text-sm text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredContracts?.filter((c: Contract) => c.status === 'draft').length || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(filteredContracts?.reduce((sum: number, c: Contract) => sum + c.total_amount, 0) || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Próximos a Vencer</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredContracts?.filter((c: Contract) => {
                      const endDate = new Date(c.end_date);
                      const today = new Date();
                      const diffTime = endDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 30 && diffDays > 0;
                    }).length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de contratos */}
        <div className="grid gap-4">
          {filteredContracts?.map((contract: Contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                      <Badge className={getStatusColor(contract.status)}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1 capitalize">{contract.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{contract.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>#{contract.contract_number}</span>
                      <span>🏢 {contract.sponsor_name}</span>
                      <span>📦 {contract.package_name}</span>
                      <span>🎯 {contract.campaign_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#00a587]">{formatCurrency(contract.total_amount)}</p>
                    <p className="text-sm text-gray-500 capitalize">{contract.payment_schedule}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {formatDate(contract.start_date)} - {formatDate(contract.end_date)}</span>
                    {contract.signed_date && (
                      <span>✅ Firmado: {formatDate(contract.signed_date)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewContract(contract)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal para crear contrato */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Contrato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patrocinador</Label>
                  <Select value={String(formData.sponsorId)} onValueChange={(value) => updateFormField('sponsorId', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar patrocinador" />
                    </SelectTrigger>
                    <SelectContent>
                      {sponsors?.map((sponsor: any) => (
                        <SelectItem key={sponsor.id} value={String(sponsor.id)}>{sponsor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Paquete</Label>
                  <Select value={String(formData.packageId)} onValueChange={(value) => updateFormField('packageId', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paquete" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((pkg: any) => (
                        <SelectItem key={pkg.id} value={String(pkg.id)}>{pkg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Campaña</Label>
                <Select value={String(formData.campaignId)} onValueChange={(value) => updateFormField('campaignId', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns?.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={String(campaign.id)}>{campaign.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Título del Contrato</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  placeholder="Título del contrato"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Descripción del contrato"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormField('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fecha de Fin</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateFormField('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto Total</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => updateFormField('totalAmount', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Frecuencia de Pago</Label>
                  <Select value={formData.paymentSchedule} onValueChange={(value) => updateFormField('paymentSchedule', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="biannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Términos y Condiciones</Label>
                <Textarea
                  value={formData.termsConditions}
                  onChange={(e) => updateFormField('termsConditions', e.target.value)}
                  placeholder="Términos y condiciones del contrato"
                  rows={3}
                />
              </div>

              <div>
                <Label>Entregables</Label>
                <Textarea
                  value={formData.deliverables}
                  onChange={(e) => updateFormField('deliverables', e.target.value)}
                  placeholder="Descripción de los entregables"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateContract}
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={createContractMutation.isPending}
                >
                  {createContractMutation.isPending ? 'Creando...' : 'Crear Contrato'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de detalles del contrato */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Contrato</DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="payments">Pagos</TabsTrigger>
                  <TabsTrigger value="events">Eventos</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Número de Contrato</Label>
                      <p className="text-sm text-gray-600">{selectedContract.contract_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estado</Label>
                      <Badge className={getStatusColor(selectedContract.status)}>
                        {getStatusIcon(selectedContract.status)}
                        <span className="ml-1 capitalize">{selectedContract.status}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Patrocinador</Label>
                      <p className="text-sm text-gray-600">{selectedContract.sponsor_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Paquete</Label>
                      <p className="text-sm text-gray-600">{selectedContract.package_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Campaña</Label>
                      <p className="text-sm text-gray-600">{selectedContract.campaign_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valor Total</Label>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedContract.total_amount)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de Inicio</Label>
                      <p className="text-sm text-gray-600">{formatDate(selectedContract.start_date)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de Fin</Label>
                      <p className="text-sm text-gray-600">{formatDate(selectedContract.end_date)}</p>
                    </div>
                  </div>
                  {selectedContract.terms_conditions && (
                    <div>
                      <Label className="text-sm font-medium">Términos y Condiciones</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedContract.terms_conditions}</p>
                    </div>
                  )}
                  {selectedContract.deliverables && (
                    <div>
                      <Label className="text-sm font-medium">Entregables</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedContract.deliverables}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="payments" className="space-y-4">
                  <div className="space-y-3">
                    {payments?.map((payment: Payment) => (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Pago #{payment.payment_number}</p>
                              <p className="text-sm text-gray-600">
                                Vencimiento: {formatDate(payment.due_date)}
                                {payment.payment_date && (
                                  <span className="ml-2 text-green-600">
                                    (Pagado: {formatDate(payment.payment_date)})
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(payment.amount)}</p>
                              <Badge className={
                                payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="events" className="space-y-4">
                  <div className="space-y-3">
                    {events?.map((event: ContractEvent) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{event.event_title}</p>
                              <p className="text-sm text-gray-600">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 {formatDate(event.event_date)}</span>
                                <span>🏛️ {event.park_name}</span>
                                <span>👥 {event.expected_attendance} personas</span>
                              </div>
                            </div>
                            <Badge className={
                              event.status === 'completed' ? 'bg-green-100 text-green-800' :
                              event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {event.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Funcionalidad de documentos en desarrollo</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ContractsPage;