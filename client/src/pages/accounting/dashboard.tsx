import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calculator, BookOpen, Receipt, PieChart } from 'lucide-react';

const mockData = [
  { month: 'Ene', ingresos: 135000, egresos: 90000, balance: 45000 },
  { month: 'Feb', ingresos: 100000, egresos: 65000, balance: 35000 },
  { month: 'Mar', ingresos: 18000, egresos: 50000, balance: -32000 },
  { month: 'Abr', ingresos: 40000, egresos: 50000, balance: -10000 },
  { month: 'May', ingresos: 100000, egresos: 50000, balance: 50000 },
  { month: 'Jun', ingresos: 0, egresos: 0, balance: 0 },
];

export default function AccountingDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/accounting/dashboard'],
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Contable</h1>
          <p className="text-gray-600 mt-1">
            Sistema de contabilidad con categorías jerárquicas y registros automáticos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button size="sm" className="bg-[#00a587] hover:bg-[#067f5f]">
            <Receipt className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$393,000</div>
            <p className="text-xs text-gray-500 mt-1">+15% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Egresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$305,000</div>
            <p className="text-xs text-gray-500 mt-1">-8% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
              Balance Neto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$88,000</div>
            <p className="text-xs text-gray-500 mt-1">22% margen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">247</div>
            <p className="text-xs text-gray-500 mt-1">+12 esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Flujo de Efectivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Flujo de Efectivo Mensual
          </CardTitle>
          <CardDescription>
            Comparación de ingresos, egresos y balance neto por mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="ingresos" fill="#00a587" name="Ingresos" />
                <Bar dataKey="egresos" fill="#dc2626" name="Egresos" />
                <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Estado del Sistema Contable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categorías Configuradas</span>
              <Badge variant="secondary">A→B→C→D→E</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Integración SAT</span>
              <Badge className="bg-green-100 text-green-800">Activa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Asientos Automáticos</span>
              <Badge className="bg-blue-100 text-blue-800">Habilitado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Balanza de Comprobación</span>
              <Badge className="bg-yellow-100 text-yellow-800">Cuadrada</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Concesiones</span>
                <div className="flex items-center space-x-2">
                  <Progress value={34} className="w-20" />
                  <span className="text-sm font-medium">34%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nómina</span>
                <div className="flex items-center space-x-2">
                  <Progress value={63} className="w-20" />
                  <span className="text-sm font-medium">63%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mantenimiento</span>
                <div className="flex items-center space-x-2">
                  <Progress value={8} className="w-20" />
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servicios</span>
                <div className="flex items-center space-x-2">
                  <Progress value={12} className="w-20" />
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}