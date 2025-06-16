import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Wallet,
  UserCheck,
  Target,
  PieChart
} from "lucide-react";

interface PayrollProjection {
  month: number;
  conceptName: string;
  conceptType: string;
  conceptCategory: string;
  projectedAmount: string;
  actualAmount: string;
  variance: string;
}

interface HRFinanceKPIs {
  totalEmployees: number;
  averageSalary: number;
  annualPayrollProjection: number;
  actualPayrollExpenses: number;
  variance: number;
  variancePercentage: number;
  payrollBudgetUtilization: number;
}

const HRFinanceDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Obtener presupuestos disponibles
  const { data: budgets = [] } = useQuery({
    queryKey: ['/api/budgets'],
  });

  // Obtener KPIs integrados
  const { data: hrFinanceKPIs, isLoading: kpisLoading } = useQuery<HRFinanceKPIs>({
    queryKey: ['/api/hr-finance-kpis', { year: selectedYear, budgetId: selectedBudgetId }],
    enabled: !!selectedBudgetId,
  });

  // Obtener proyecciones de nómina
  const { data: payrollProjections = [], isLoading: projectionsLoading } = useQuery<PayrollProjection[]>({
    queryKey: ['/api/payroll-projections', selectedBudgetId],
    enabled: !!selectedBudgetId,
  });

  // Obtener empleados
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Obtener períodos de nómina
  const { data: payrollPeriods = [] } = useQuery({
    queryKey: ['/api/payroll-periods', { year: selectedYear }],
  });

  // Generar proyecciones de nómina
  const generateProjectionsMutation = useMutation({
    mutationFn: async ({ budgetId, year }: { budgetId: number; year: number }) => {
      const response = await fetch(`/api/payroll-projections/generate/${budgetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar proyecciones');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Proyecciones generadas",
        description: "Las proyecciones de nómina han sido generadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-projections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr-finance-kpis'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron generar las proyecciones",
        variant: "destructive",
      });
    },
  });

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  // Calcular resumen por mes de proyecciones
  const monthlyProjections = payrollProjections.reduce((acc, proj) => {
    const month = proj.month;
    if (!acc[month]) {
      acc[month] = { income: 0, deductions: 0, net: 0 };
    }
    
    const amount = parseFloat(proj.projectedAmount);
    if (proj.conceptType === 'income') {
      acc[month].income += amount;
    } else if (proj.conceptType === 'deduction') {
      acc[month].deductions += amount;
    }
    
    acc[month].net = acc[month].income - acc[month].deductions;
    return acc;
  }, {} as Record<number, { income: number; deductions: number; net: number }>);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <AdminLayout title="Dashboard HR-Finanzas" subtitle="Integración de Recursos Humanos y Finanzas">
      <div className="space-y-6">
        
        {/* Selector de presupuesto y año */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Presupuesto</Label>
                <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar presupuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget: any) => (
                      <SelectItem key={budget.id} value={budget.id.toString()}>
                        {budget.name} ({budget.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Año</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => generateProjectionsMutation.mutate({ 
                    budgetId: parseInt(selectedBudgetId), 
                    year: parseInt(selectedYear) 
                  })}
                  disabled={!selectedBudgetId || generateProjectionsMutation.isPending}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {generateProjectionsMutation.isPending ? 'Generando...' : 'Generar Proyecciones'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principales */}
        {hrFinanceKPIs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrFinanceKPIs.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Personal en nómina</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salario Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(hrFinanceKPIs.averageSalary)}</div>
                <p className="text-xs text-muted-foreground">Mensual por empleado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyección Anual</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(hrFinanceKPIs.annualPayrollProjection)}</div>
                <p className="text-xs text-muted-foreground">Nómina presupuestada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilización Presupuesto</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrFinanceKPIs.payrollBudgetUtilization.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {hrFinanceKPIs.variancePercentage >= 0 ? 'Dentro del presupuesto' : 'Sobre presupuesto'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="projections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projections">Proyecciones Mensuales</TabsTrigger>
            <TabsTrigger value="employees">Gestión de Empleados</TabsTrigger>
            <TabsTrigger value="analysis">Análisis Comparativo</TabsTrigger>
          </TabsList>

          {/* Proyecciones Mensuales */}
          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Proyecciones de Nómina {selectedYear}
                </CardTitle>
                <CardDescription>
                  Distribución mensual de costos de personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(monthlyProjections).length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mes</TableHead>
                          <TableHead className="text-right">Ingresos</TableHead>
                          <TableHead className="text-right">Deducciones</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                          <TableHead className="text-right">% del Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(monthlyProjections).map(([month, data]) => {
                          const totalAnual = hrFinanceKPIs?.annualPayrollProjection || 1;
                          const percentage = (data.net / totalAnual) * 100;
                          
                          return (
                            <TableRow key={month}>
                              <TableCell className="font-medium">
                                {monthNames[parseInt(month) - 1]}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(data.income)}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {formatCurrency(data.deductions)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(data.net)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={percentage > 10 ? "destructive" : "secondary"}>
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay proyecciones disponibles</p>
                    <p className="text-sm">Selecciona un presupuesto y genera las proyecciones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Empleados */}
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Resumen de Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{employees.filter((e: any) => e.status === 'active').length}</div>
                    <div className="text-sm text-green-800">Empleados Activos</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{employees.filter((e: any) => e.status === 'vacation').length}</div>
                    <div className="text-sm text-blue-800">En Vacaciones</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{employees.filter((e: any) => e.status === 'inactive').length}</div>
                    <div className="text-sm text-gray-800">Inactivos</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Puesto</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="text-right">Salario Base</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.slice(0, 10).map((employee: any) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.fullName}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell className="text-right">{formatCurrency(parseFloat(employee.baseSalary))}</TableCell>
                          <TableCell>
                            <Badge variant={
                              employee.status === 'active' ? 'default' :
                              employee.status === 'vacation' ? 'secondary' : 'destructive'
                            }>
                              {employee.status === 'active' ? 'Activo' :
                               employee.status === 'vacation' ? 'Vacaciones' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análisis Comparativo */}
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análisis de Varianza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hrFinanceKPIs ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Presupuestado:</span>
                        <span className="font-semibold">{formatCurrency(hrFinanceKPIs.annualPayrollProjection)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Ejecutado:</span>
                        <span className="font-semibold">{formatCurrency(hrFinanceKPIs.actualPayrollExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Varianza:</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          hrFinanceKPIs.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {hrFinanceKPIs.variance >= 0 ? 
                            <ArrowDownCircle className="h-4 w-4" /> : 
                            <ArrowUpCircle className="h-4 w-4" />
                          }
                          {formatCurrency(Math.abs(hrFinanceKPIs.variance))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Porcentaje:</span>
                        <Badge variant={hrFinanceKPIs.variancePercentage >= 0 ? "default" : "destructive"}>
                          {hrFinanceKPIs.variancePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Selecciona un presupuesto para ver el análisis</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Períodos de Nómina {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payrollPeriods.slice(0, 6).map((period: any) => (
                      <div key={period.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{period.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(parseFloat(period.totalNet || '0'))}</div>
                          <Badge variant={
                            period.status === 'paid' ? 'default' :
                            period.status === 'calculated' ? 'secondary' : 'outline'
                          }>
                            {period.status === 'paid' ? 'Pagado' :
                             period.status === 'calculated' ? 'Calculado' : 'Borrador'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default HRFinanceDashboard;