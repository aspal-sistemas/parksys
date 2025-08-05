import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, AlertTriangle } from 'lucide-react';

export default function FinanzasDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Finanzas" 
      subtitle="Panel de control del módulo financiero y presupuestos"
    >
      <div className="space-y-6">
        {/* Métricas financieras principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$847,520</div>
              <p className="text-xs text-muted-foreground">+15.2% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">$623,840</div>
              <p className="text-xs text-muted-foreground">+8.1% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$223,680</div>
              <p className="text-xs text-muted-foreground">26.4% margen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <p className="text-xs text-muted-foreground">ejecutado del total</p>
            </CardContent>
          </Card>
        </div>

        {/* Desglose de ingresos y gastos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Fuentes de Ingresos
              </CardTitle>
              <CardDescription>
                Distribución de ingresos por categoría este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Concesiones</div>
                      <div className="text-xs text-gray-500">Restaurantes y comercios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$425,120</div>
                    <div className="text-xs text-gray-500">50.2%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Eventos</div>
                      <div className="text-xs text-gray-500">Alquiler de espacios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$234,650</div>
                    <div className="text-xs text-gray-500">27.7%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Patrocinios</div>
                      <div className="text-xs text-gray-500">Empresas privadas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$123,450</div>
                    <div className="text-xs text-gray-500">14.6%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Actividades</div>
                      <div className="text-xs text-gray-500">Talleres y cursos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$64,300</div>
                    <div className="text-xs text-gray-500">7.6%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Categorías de Gastos
              </CardTitle>
              <CardDescription>
                Distribución de gastos por categoría este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Personal</div>
                      <div className="text-xs text-gray-500">Salarios y beneficios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$287,450</div>
                    <div className="text-xs text-gray-500">46.1%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Mantenimiento</div>
                      <div className="text-xs text-gray-500">Jardines y equipos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$156,220</div>
                    <div className="text-xs text-gray-500">25.0%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w4 h-4 bg-gray-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Servicios</div>
                      <div className="text-xs text-gray-500">Agua, luz, internet</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$98,760</div>
                    <div className="text-xs text-gray-500">15.8%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-teal-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Materiales</div>
                      <div className="text-xs text-gray-500">Suministros varios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$81,410</div>
                    <div className="text-xs text-gray-500">13.1%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del presupuesto y alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Estado del Presupuesto
              </CardTitle>
              <CardDescription>
                Ejecución presupuestal por departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mantenimiento</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eventos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">72%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Marketing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">68%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Infraestructura</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">92%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas Financieras
              </CardTitle>
              <CardDescription>
                Notificaciones importantes sobre el estado financiero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-700">Presupuesto Excedido</div>
                    <div className="text-xs text-red-600">Infraestructura: 92% ejecutado</div>
                  </div>
                  <Badge className="bg-red-100 text-red-700">Crítico</Badge>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-yellow-700">Pago Pendiente</div>
                    <div className="text-xs text-yellow-600">Proveedor ABC - $45,200</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Advertencia</Badge>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-700">Meta Alcanzada</div>
                    <div className="text-xs text-green-600">Ingresos por concesiones +15%</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Éxito</Badge>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-700">Nuevo Patrocinio</div>
                    <div className="text-xs text-blue-600">Empresa XYZ - $75,000</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Información</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DynamicAdminLayout>
  );
}