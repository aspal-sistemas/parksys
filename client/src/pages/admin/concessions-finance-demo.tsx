import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  FileText,
  MapPin
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConcessionPayment {
  id: number;
  contract_id: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: 'pending' | 'paid' | 'late';
  concessionaire_name: string;
  park_name: string;
  finance_income_id?: number;
}

interface IntegrationStats {
  total_payments: number;
  paid_payments: number;
  total_income: number;
  pending_payments: number;
  late_payments: number;
}

interface ParkIncome {
  park_name: string;
  total_income: number;
  payment_count: number;
}

interface TypeIncome {
  concession_type: string;
  total_income: number;
  payment_count: number;
}

interface SyncStatus {
  total_payments: number;
  synchronized_payments: number;
}

interface DashboardData {
  stats: IntegrationStats;
  parkIncome: ParkIncome[];
  typeIncome: TypeIncome[];
  syncStatus: SyncStatus;
}

export default function ConcessionsFinanceDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener dashboard de integración
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ['/api/concessions-finance-integration/dashboard'],
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });

  // Obtener pagos de concesiones
  const { data: payments, isLoading: paymentsLoading } = useQuery<ConcessionPayment[]>({
    queryKey: ['/api/concession-payments']
  });

  // Sincronización manual
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/concessions-finance-integration/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Error en sincronización');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Sincronización Completada",
        description: `${data.synchronized} pagos sincronizados, ${data.errors} errores`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/concessions-finance-integration/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/concession-payments'] });
    },
    onError: () => {
      toast({
        title: "❌ Error en Sincronización",
        description: "No se pudo completar la sincronización",
        variant: "destructive"
      });
    }
  });

  if (dashboardLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de integración...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const syncRate = stats && stats.paid_payments > 0 
    ? Math.round((dashboardData?.syncStatus.synchronized_payments / stats.paid_payments) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏢 Integración Concesiones → Finanzas
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema automático de sincronización de ingresos por concesiones
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="bg-[#00a587] hover:bg-[#067f5f]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar Manual'}
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_payments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pagos registrados este año
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.paid_payments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Listos para sincronización
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${stats?.total_income?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos por concesiones
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronización</CardTitle>
            <Sync className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{syncRate}%</div>
            <div className="mt-2">
              <Progress value={syncRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData?.syncStatus.synchronized_payments || 0} de {stats?.paid_payments || 0} sincronizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="parks">Por Parque</TabsTrigger>
          <TabsTrigger value="integration">Integración</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas de Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Integración Activa</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Operativo
                  </Badge>
                </div>
                
                {stats?.pending_payments ? (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Pagos Pendientes</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      {stats.pending_payments}
                    </Badge>
                  </div>
                ) : null}

                {stats?.late_payments ? (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Pagos Atrasados</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {stats.late_payments}
                    </Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Ingresos por Tipo de Concesión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Ingresos por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.typeIncome?.slice(0, 5).map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">{type.concession_type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">${type.total_income.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{type.payment_count} pagos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Pagos */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Pagos de concesiones con estado de sincronización financiera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments?.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{payment.concessionaire_name}</span>
                        <span className="text-sm text-muted-foreground">{payment.park_name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">${payment.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={payment.status === 'paid' ? 'default' : 'secondary'}
                          className={
                            payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }
                        >
                          {payment.status === 'paid' ? 'Pagado' : 
                           payment.status === 'pending' ? 'Pendiente' : 'Atrasado'}
                        </Badge>
                        
                        {payment.status === 'paid' && (
                          <Badge 
                            variant="secondary" 
                            className={
                              payment.finance_income_id 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {payment.finance_income_id ? '🔗 Sincronizado' : '⏳ Por Sincronizar'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Por Parque */}
        <TabsContent value="parks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Ingresos por Parque
              </CardTitle>
              <CardDescription>
                Distribución de ingresos de concesiones por ubicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.parkIncome?.map((park, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{park.park_name}</h3>
                      <Badge variant="secondary">{park.payment_count} pagos</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${park.total_income.toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((park.total_income / (dashboardData.parkIncome[0]?.total_income || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integración */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Flujo de Integración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <div className="font-medium">Registro de Pago</div>
                    <div className="text-sm text-muted-foreground">Concesionario realiza pago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <div className="font-medium">Confirmación</div>
                    <div className="text-sm text-muted-foreground">Status cambia a "Pagado"</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <div className="font-medium">Sincronización Automática</div>
                    <div className="text-sm text-muted-foreground">Se crea ingreso en Finanzas</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <div className="font-medium">Trazabilidad</div>
                    <div className="text-sm text-muted-foreground">Referencias cruzadas mantenidas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-500" />
                  Características del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Sincronización automática en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Categorización inteligente por tipo de concesión</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Trazabilidad completa de origen de datos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Sincronización manual de respaldo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Dashboard en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Manejo robusto de errores</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}