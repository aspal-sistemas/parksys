import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ShoppingCart,
  Settings,
  BarChart3
} from "lucide-react";

/**
 * Página de demostración de la integración Activos → Finanzas
 * Muestra cómo los activos y mantenimientos generan automáticamente registros financieros
 */
export default function AssetsFinanceDemo() {
  const [assetsData, setAssetsData] = useState({
    totalAssets: 45,
    activeAssets: 38,
    maintenanceNeeded: 7,
    totalValue: 850000
  });

  const [financeStats, setFinanceStats] = useState({
    totalExpenses: 125000,
    purchaseExpenses: 85000,
    maintenanceExpenses: 40000,
    monthlyAverage: 10416
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      type: 'purchase',
      asset: 'Podadora Industrial XL',
      amount: 15000,
      date: '2025-06-15',
      status: 'completed',
      badge: 'Compra Automatizada'
    },
    {
      id: 2,
      type: 'maintenance',
      asset: 'Sistema de Riego Zona A',
      amount: 3500,
      date: '2025-06-14',
      status: 'completed',
      badge: 'Mantenimiento Automatizado'
    },
    {
      id: 3,
      type: 'purchase',
      asset: 'Banco de Concreto Moderno',
      amount: 8500,
      date: '2025-06-13',
      status: 'pending',
      badge: 'Compra Automatizada'
    },
    {
      id: 4,
      type: 'maintenance',
      asset: 'Luminarias LED Sendero',
      amount: 2200,
      date: '2025-06-12',
      status: 'completed',
      badge: 'Mantenimiento Automatizado'
    }
  ]);

  const [integrationStatus, setIntegrationStatus] = useState({
    active: true,
    automated: true,
    syncRate: 98.5,
    lastSync: '2025-06-16 11:45:00'
  });

  // Simular actualización de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrationStatus(prev => ({
        ...prev,
        lastSync: new Date().toLocaleString('es-MX')
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const simulateAssetPurchase = () => {
    const newAsset = {
      id: Date.now(),
      type: 'purchase',
      asset: 'Nuevo Equipo de Seguridad',
      amount: Math.floor(Math.random() * 20000) + 5000,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      badge: 'Compra Automatizada'
    };

    setRecentTransactions(prev => [newAsset, ...prev.slice(0, 4)]);
    setFinanceStats(prev => ({
      ...prev,
      totalExpenses: prev.totalExpenses + newAsset.amount,
      purchaseExpenses: prev.purchaseExpenses + newAsset.amount
    }));
    setAssetsData(prev => ({
      ...prev,
      totalAssets: prev.totalAssets + 1,
      activeAssets: prev.activeAssets + 1,
      totalValue: prev.totalValue + newAsset.amount
    }));
  };

  const simulateMaintenance = () => {
    const maintenance = {
      id: Date.now(),
      type: 'maintenance',
      asset: 'Mantenimiento Programado',
      amount: Math.floor(Math.random() * 5000) + 1000,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      badge: 'Mantenimiento Automatizado'
    };

    setRecentTransactions(prev => [maintenance, ...prev.slice(0, 4)]);
    setFinanceStats(prev => ({
      ...prev,
      totalExpenses: prev.totalExpenses + maintenance.amount,
      maintenanceExpenses: prev.maintenanceExpenses + maintenance.amount
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Demostración: Integración Activos → Finanzas
        </h1>
        <p className="text-blue-100">
          Sistema automático de flujo de gastos desde gestión de activos al módulo financiero
        </p>
      </div>

      {/* Estado de Integración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Estado de la Integración
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold text-green-600">Activa</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Sincronización</p>
              <p className="font-semibold">{integrationStatus.syncRate}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Última Sincronización</p>
              <p className="font-semibold text-sm">{integrationStatus.lastSync}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Modo</p>
              <p className="font-semibold text-purple-600">Automático</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="demo">Demostración Live</TabsTrigger>
          <TabsTrigger value="integration">Detalles Integración</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assetsData.totalAssets}</div>
                <p className="text-xs text-muted-foreground">
                  {assetsData.activeAssets} activos activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${assetsData.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor de inventario
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financeStats.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gastos integrados automáticamente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mantenimientos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {assetsData.maintenanceNeeded}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de distribución de gastos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Gastos por Tipo</CardTitle>
              <CardDescription>
                Gastos generados automáticamente desde el módulo de activos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compras de Activos</span>
                  <span className="text-sm font-semibold">
                    ${financeStats.purchaseExpenses.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(financeStats.purchaseExpenses / financeStats.totalExpenses) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mantenimientos</span>
                  <span className="text-sm font-semibold">
                    ${financeStats.maintenanceExpenses.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(financeStats.maintenanceExpenses / financeStats.totalExpenses) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Transacciones */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Financieras Automáticas</CardTitle>
              <CardDescription>
                Registros generados automáticamente desde el módulo de activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {transaction.type === 'purchase' ? (
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Wrench className="h-5 w-5 text-orange-500" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.asset}</p>
                        <p className="text-sm text-gray-600">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${transaction.amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.badge}
                        </Badge>
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Demostración Live */}
        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demostración en Tiempo Real</CardTitle>
              <CardDescription>
                Simula la creación de activos y mantenimientos para ver la integración automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={simulateAssetPurchase}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Simular Compra de Activo</span>
                </Button>
                <Button 
                  onClick={simulateMaintenance}
                  variant="outline"
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <Wrench className="h-5 w-5" />
                  <span>Simular Mantenimiento</span>
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li>• Al registrar una compra de activo, se crea automáticamente un gasto en Finanzas</li>
                  <li>• Al completar un mantenimiento, se genera el gasto correspondiente</li>
                  <li>• Los registros mantienen trazabilidad completa entre módulos</li>
                  <li>• Los gastos integrados no pueden modificarse desde Finanzas (solo lectura)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Detalles de Integración */}
        <TabsContent value="integration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Arquitectura de Integración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Integración automática en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Trazabilidad completa de transacciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Restricciones de solo lectura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Categorización automática</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Integración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded">
                  <h5 className="font-medium text-blue-800">Compras de Activos</h5>
                  <p className="text-sm text-blue-600">
                    Genera gastos automáticamente al registrar nuevos activos con precio
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <h5 className="font-medium text-orange-800">Mantenimientos</h5>
                  <p className="text-sm text-orange-600">
                    Crea gastos al completar mantenimientos con costo asociado
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <h5 className="font-medium text-purple-800">Reparaciones</h5>
                  <p className="text-sm text-purple-600">
                    Integra costos de reparaciones y reemplazos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campos de Integración</CardTitle>
              <CardDescription>
                Campos especiales que mantienen la trazabilidad entre módulos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Campos de Control</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• isAssetsGenerated</li>
                    <li>• assetId</li>
                    <li>• assetMaintenanceId</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Información Financiera</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• amount (automático)</li>
                    <li>• concept (generado)</li>
                    <li>• categoryId (automático)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Metadatos</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• referenceNumber</li>
                    <li>• invoiceNumber</li>
                    <li>• paymentDate</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}