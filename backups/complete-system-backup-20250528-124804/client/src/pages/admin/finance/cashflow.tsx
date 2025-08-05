import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Download,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const CashFlowPage = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ["/api/cash-flow/3", selectedYear],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Flujo de Efectivo
              </h1>
              <p className="text-gray-600">
                Análisis mensual de ingresos vs egresos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Resumen anual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Anuales
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(cashFlowData?.totalYearIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Proyección: {formatCurrency((cashFlowData?.totalYearIncome || 0) * 1.12)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Egresos Anuales
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(cashFlowData?.totalYearExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Presupuesto: {formatCurrency((cashFlowData?.totalYearExpenses || 0) * 1.08)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flujo Neto
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (cashFlowData?.totalYearIncome || 0) - (cashFlowData?.totalYearExpenses || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency((cashFlowData?.totalYearIncome || 0) - (cashFlowData?.totalYearExpenses || 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                {((cashFlowData?.totalYearIncome || 0) - (cashFlowData?.totalYearExpenses || 0)) >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flujo mensual detallado */}
        <Card>
          <CardHeader>
            <CardTitle>Flujo Mensual {selectedYear}</CardTitle>
            <CardDescription>
              Comparación mensual de ingresos y egresos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando flujo de efectivo...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthNames.map((month, index) => {
                  const monthData = cashFlowData?.monthlyData?.[index + 1] || { income: 0, expenses: 0 };
                  const netFlow = monthData.income - monthData.expenses;
                  const isCurrentMonth = index + 1 === new Date().getMonth() + 1;
                  
                  return (
                    <div
                      key={month}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isCurrentMonth ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16">
                          <span className={`text-sm font-medium ${isCurrentMonth ? 'text-blue-700' : 'text-gray-700'}`}>
                            {month}
                          </span>
                          {isCurrentMonth && (
                            <Badge variant="default" className="ml-2 text-xs bg-blue-100 text-blue-800">
                              Actual
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Ingresos</div>
                            <div className="font-medium text-green-600">
                              {formatCurrency(monthData.income)}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Egresos</div>
                            <div className="font-medium text-red-600">
                              {formatCurrency(monthData.expenses)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Flujo Neto</div>
                        <div className={`text-lg font-bold ${
                          netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Indicadores clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Indicadores Financieros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margen Operativo</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {(((cashFlowData?.totalYearIncome || 0) - (cashFlowData?.totalYearExpenses || 0)) / (cashFlowData?.totalYearIncome || 1) * 100).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Crecimiento vs Año Anterior</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    +8.5%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eficiencia de Gastos</span>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    87%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variación Presupuestal</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    -3.2%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proyecciones</CardTitle>
              <CardDescription>
                Estimaciones para los próximos meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Próximo Trimestre</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency((cashFlowData?.totalYearIncome || 0) * 0.25)}
                  </div>
                  <div className="text-xs text-blue-700">Ingresos estimados</div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Meta Anual</div>
                  <div className="text-lg font-bold text-green-900">
                    {formatCurrency((cashFlowData?.totalYearIncome || 0) * 1.15)}
                  </div>
                  <div className="text-xs text-green-700">Objetivo de ingresos</div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">Ahorro Potencial</div>
                  <div className="text-lg font-bold text-yellow-900">
                    {formatCurrency((cashFlowData?.totalYearExpenses || 0) * 0.05)}
                  </div>
                  <div className="text-xs text-yellow-700">Optimización de gastos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CashFlowPage;