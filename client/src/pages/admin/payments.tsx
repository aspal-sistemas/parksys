import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Calendar,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStripePayment } from '@/hooks/use-stripe-payment';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: number;
  stripe_payment_intent_id: string;
  service_type: string;
  service_id: number;
  service_name: string;
  customer_name: string;
  customer_email: string;
  amount: string;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded';
  payment_method?: string;
  paid_at?: string;
  created_at: string;
}

interface PaymentDetails extends Payment {
  service_description?: string;
  customer_phone?: string;
  receipt_email?: string;
  metadata?: any;
  notes?: string;
  error_message?: string;
  failed_at?: string;
  canceled_at?: string;
  refunded_at?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-blue-100 text-blue-800',
  partially_refunded: 'bg-purple-100 text-purple-800'
};

const statusIcons = {
  pending: Clock,
  succeeded: CheckCircle,
  failed: XCircle,
  canceled: XCircle,
  refunded: RotateCcw,
  partially_refunded: RotateCcw
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const { getPayments, getPaymentDetails, createRefund, isLoading } = useStripePayment();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    serviceType: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    succeeded: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });

  const loadPayments = async () => {
    const result = await getPayments(filters);
    if (result.success) {
      setPayments(result.data || []);
      setPagination(result.pagination || pagination);
      
      // Calcular estadísticas
      const total = result.data?.length || 0;
      const succeeded = result.data?.filter((p: Payment) => p.status === 'succeeded').length || 0;
      const pending = result.data?.filter((p: Payment) => p.status === 'pending').length || 0;
      const failed = result.data?.filter((p: Payment) => p.status === 'failed').length || 0;
      const totalAmount = result.data?.reduce((sum: number, p: Payment) => {
        return p.status === 'succeeded' ? sum + parseFloat(p.amount) : sum;
      }, 0) || 0;
      
      setStats({ total, succeeded, pending, failed, totalAmount });
    }
  };

  const loadPaymentDetails = async (paymentId: number) => {
    setIsDetailsLoading(true);
    const result = await getPaymentDetails(paymentId);
    if (result.success) {
      setSelectedPayment(result.data);
    }
    setIsDetailsLoading(false);
  };

  const handleRefund = async (paymentId: number, amount?: number) => {
    const result = await createRefund(paymentId, amount, 'Reembolso solicitado por administrador');
    if (result.success) {
      await loadPayments();
      setSelectedPayment(null);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const filteredPayments = payments.filter(payment => {
    return (
      payment.service_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.customer_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.customer_email.toLowerCase().includes(filters.search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-gray-600">Administra todos los pagos procesados con Stripe</p>
        </div>
        <Button onClick={loadPayments} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exitosos</p>
                <p className="text-2xl font-bold text-green-600">{stats.succeeded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar pagos..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.serviceType}
              onValueChange={(value) => setFilters({ ...filters, serviceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                <SelectItem value="activity">Actividades</SelectItem>
                <SelectItem value="event">Eventos</SelectItem>
                <SelectItem value="space_reservation">Reservas de Espacios</SelectItem>
                <SelectItem value="concession_fee">Concesiones</SelectItem>
                <SelectItem value="sponsorship">Patrocinios</SelectItem>
                <SelectItem value="permit">Permisos</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado del pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="succeeded">Exitoso</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.limit.toString()}
              onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elementos por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>
            {filteredPayments.length} pagos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const StatusIcon = statusIcons[payment.status];
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.service_name}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {payment.service_type.replace('_', ' ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.customer_name}</p>
                          <p className="text-sm text-gray-500">{payment.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          ${parseFloat(payment.amount).toLocaleString()} {payment.currency.toUpperCase()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[payment.status]} flex items-center w-fit`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {payment.status === 'succeeded' && 'Exitoso'}
                          {payment.status === 'pending' && 'Pendiente'}
                          {payment.status === 'failed' && 'Fallido'}
                          {payment.status === 'canceled' && 'Cancelado'}
                          {payment.status === 'refunded' && 'Reembolsado'}
                          {payment.status === 'partially_refunded' && 'Reembolso Parcial'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.payment_method ? (
                          <span className="capitalize">{payment.payment_method}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadPaymentDetails(payment.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Pago</DialogTitle>
                              <DialogDescription>
                                Información completa del pago #{payment.id}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {isDetailsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                              </div>
                            ) : selectedPayment ? (
                              <div className="space-y-4">
                                {/* Información del servicio */}
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Información del Servicio</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium">Servicio:</span>
                                      <p>{selectedPayment.service_name}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Tipo:</span>
                                      <p className="capitalize">{selectedPayment.service_type.replace('_', ' ')}</p>
                                    </div>
                                    {selectedPayment.service_description && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Descripción:</span>
                                        <p>{selectedPayment.service_description}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Información del cliente */}
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Información del Cliente</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium">Nombre:</span>
                                      <p>{selectedPayment.customer_name}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Email:</span>
                                      <p>{selectedPayment.customer_email}</p>
                                    </div>
                                    {selectedPayment.customer_phone && (
                                      <div>
                                        <span className="font-medium">Teléfono:</span>
                                        <p>{selectedPayment.customer_phone}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Información del pago */}
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Información del Pago</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium">Monto:</span>
                                      <p className="text-lg font-bold">
                                        ${parseFloat(selectedPayment.amount).toLocaleString()} {selectedPayment.currency.toUpperCase()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Estado:</span>
                                      <Badge className={`${statusColors[selectedPayment.status]} w-fit`}>
                                        {selectedPayment.status === 'succeeded' && 'Exitoso'}
                                        {selectedPayment.status === 'pending' && 'Pendiente'}
                                        {selectedPayment.status === 'failed' && 'Fallido'}
                                        {selectedPayment.status === 'canceled' && 'Cancelado'}
                                        {selectedPayment.status === 'refunded' && 'Reembolsado'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium">ID Stripe:</span>
                                      <p className="font-mono text-xs">{selectedPayment.stripe_payment_intent_id}</p>
                                    </div>
                                    {selectedPayment.payment_method && (
                                      <div>
                                        <span className="font-medium">Método:</span>
                                        <p className="capitalize">{selectedPayment.payment_method}</p>
                                      </div>
                                    )}
                                    {selectedPayment.paid_at && (
                                      <div>
                                        <span className="font-medium">Fecha de pago:</span>
                                        <p>{new Date(selectedPayment.paid_at).toLocaleString()}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Acciones */}
                                {selectedPayment.status === 'succeeded' && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleRefund(selectedPayment.id)}
                                      className="flex-1"
                                    >
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Reembolso Completo
                                    </Button>
                                  </div>
                                )}

                                {selectedPayment.error_message && (
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {selectedPayment.error_message}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            ) : null}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron pagos</p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page + 1) })}
                  disabled={filters.page >= pagination.totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}