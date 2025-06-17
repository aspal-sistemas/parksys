import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  Plus, 
  Search, 
  Download,
  Upload,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Heart,
  PiggyBank,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  TrendingUp,
  Archive
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  netPay: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  payDate: string;
}

interface Benefit {
  id: number;
  name: string;
  type: 'health' | 'insurance' | 'vacation' | 'retirement' | 'other';
  description: string;
  coverage: string;
  cost: number;
  employeesEnrolled: number;
  provider: string;
  effectiveDate: string;
  status: 'active' | 'inactive';
}

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  baseSalary: number;
  hireDate: string;
  benefits: string[];
  status: 'active' | 'inactive';
}

const PayrollBenefits = () => {
  const [activeTab, setActiveTab] = useState("payroll");
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("current");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isNewPayrollOpen, setIsNewPayrollOpen] = useState(false);
  const [isNewBenefitOpen, setIsNewBenefitOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("2025-06");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener empleados para nómina
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => fetch('/api/employees').then(res => res.json())
  });

  // Obtener periodos de nómina
  const { data: payrollPeriods = [] } = useQuery({
    queryKey: ['/api/payroll-periods'],
    queryFn: () => fetch('/api/payroll-periods').then(res => res.json())
  });

  // Mutación para procesar nómina
  const processPayrollMutation = useMutation({
    mutationFn: (payrollData: any) => 
      apiRequest('/api/payroll-periods/process', {
        method: 'POST',
        body: JSON.stringify(payrollData)
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-periods'] });
      setIsNewPayrollOpen(false);
      toast({
        title: "Nómina procesada exitosamente",
        description: `Se procesaron ${result.employeesProcessed} empleados y se integraron automáticamente ${result.financialRecords} registros financieros`,
      });
    },
    onError: (error) => {
      console.error('Error procesando nómina:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la nómina",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayroll = () => {
    if (!selectedPeriod) {
      toast({
        title: "Período requerido",
        description: "Por favor seleccione un período para procesar",
        variant: "destructive",
      });
      return;
    }

    const payrollData = {
      period: selectedPeriod,
      employees: employees.filter(emp => emp.status === 'active').map(emp => ({
        employeeId: emp.id,
        employeeName: emp.fullName,
        baseSalary: emp.salary,
        department: emp.department,
        position: emp.position
      }))
    };

    processPayrollMutation.mutate(payrollData);
  };

  // Datos de nómina
  const payrollRecords: PayrollRecord[] = [
    {
      id: 1,
      employeeId: 1,
      employeeName: "María Elena González",
      department: "Eventos y Actividades",
      period: "2025-05",
      baseSalary: 35000,
      overtime: 2800,
      bonuses: 3500,
      deductions: 1200,
      taxes: 7200,
      netPay: 32900,
      status: "paid",
      payDate: "2025-05-30"
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "Carlos Alberto Martínez",
      department: "Mantenimiento",
      period: "2025-05",
      baseSalary: 28000,
      overtime: 4200,
      bonuses: 2000,
      deductions: 800,
      taxes: 5800,
      netPay: 27600,
      status: "paid",
      payDate: "2025-05-30"
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: "Ana Patricia Rodríguez",
      department: "Administración",
      period: "2025-05",
      baseSalary: 32000,
      overtime: 0,
      bonuses: 1600,
      deductions: 1000,
      taxes: 6200,
      netPay: 26400,
      status: "approved",
      payDate: "2025-05-30"
    },
    {
      id: 4,
      employeeId: 4,
      employeeName: "Roberto Jiménez Silva",
      department: "Seguridad",
      period: "2025-05",
      baseSalary: 26000,
      overtime: 3900,
      bonuses: 1300,
      deductions: 650,
      taxes: 5400,
      netPay: 25150,
      status: "calculated",
      payDate: "2025-05-30"
    },
    {
      id: 5,
      employeeId: 5,
      employeeName: "Sofía Mendoza López",
      department: "Eventos y Actividades",
      period: "2025-05",
      baseSalary: 22000,
      overtime: 1100,
      bonuses: 1100,
      deductions: 550,
      taxes: 4200,
      netPay: 19450,
      status: "draft",
      payDate: "2025-05-30"
    }
  ];

  // Datos de beneficios
  const benefits: Benefit[] = [
    {
      id: 1,
      name: "Seguro de Gastos Médicos Mayores",
      type: "health",
      description: "Cobertura médica integral para empleados y familiares",
      coverage: "Nacional e Internacional",
      cost: 2500,
      employeesEnrolled: 85,
      provider: "GNP Seguros",
      effectiveDate: "2025-01-01",
      status: "active"
    },
    {
      id: 2,
      name: "Seguro de Vida",
      type: "insurance",
      description: "Póliza de vida con cobertura de 5x el salario anual",
      coverage: "5x Salario Anual",
      cost: 800,
      employeesEnrolled: 92,
      provider: "Seguros Monterrey",
      effectiveDate: "2025-01-01",
      status: "active"
    },
    {
      id: 3,
      name: "Fondo de Ahorro",
      type: "retirement",
      description: "Plan de ahorro con aportación patronal del 50%",
      coverage: "Hasta 10% del salario",
      cost: 1500,
      employeesEnrolled: 78,
      provider: "Banco Santander",
      effectiveDate: "2025-01-01",
      status: "active"
    },
    {
      id: 4,
      name: "Vacaciones Adicionales",
      type: "vacation",
      description: "Días de vacaciones adicionales por antigüedad",
      coverage: "5-15 días extra",
      cost: 0,
      employeesEnrolled: 100,
      provider: "Interno",
      effectiveDate: "2025-01-01",
      status: "active"
    },
    {
      id: 5,
      name: "Capacitación Especializada",
      type: "other",
      description: "Programa de desarrollo profesional continuo",
      coverage: "Hasta $10,000 anuales",
      cost: 3000,
      employeesEnrolled: 65,
      provider: "Universidad TecMilenio",
      effectiveDate: "2025-01-01",
      status: "active"
    }
  ];

  const departments = ["Eventos y Actividades", "Mantenimiento", "Administración", "Seguridad", "Recursos Humanos"];

  // Datos para gráficas
  const payrollTrends = [
    { month: 'Ene', total: 1250000, employees: 95 },
    { month: 'Feb', total: 1280000, employees: 96 },
    { month: 'Mar', total: 1320000, employees: 98 },
    { month: 'Abr', total: 1350000, employees: 100 },
    { month: 'May', total: 1390000, employees: 102 },
    { month: 'Jun', total: 1420000, employees: 105 }
  ];

  const benefitDistribution = [
    { name: 'Salud', value: 45, color: '#22c55e' },
    { name: 'Seguros', value: 25, color: '#3b82f6' },
    { name: 'Ahorro', value: 20, color: '#f59e0b' },
    { name: 'Otros', value: 10, color: '#8b5cf6' }
  ];

  const departmentCosts = [
    { department: 'Eventos', nomina: 420000, beneficios: 48000 },
    { department: 'Mantenimiento', nomina: 380000, beneficios: 42000 },
    { department: 'Administración', nomina: 350000, beneficios: 38000 },
    { department: 'Seguridad', nomina: 310000, beneficios: 35000 },
    { department: 'RH', nomina: 280000, beneficios: 32000 }
  ];

  const filteredPayroll = payrollRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter;
    const matchesPeriod = periodFilter === "all" || record.period === periodFilter;
    
    return matchesSearch && matchesDepartment && matchesPeriod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'calculated': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'calculated': return 'Calculado';
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      default: return 'Desconocido';
    }
  };

  const getBenefitTypeIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'retirement': return <PiggyBank className="h-4 w-4" />;
      case 'vacation': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Estadísticas
  const stats = {
    totalPayroll: payrollRecords.reduce((sum, record) => sum + record.netPay, 0),
    avgSalary: payrollRecords.reduce((sum, record) => sum + record.netPay, 0) / payrollRecords.length,
    totalEmployees: payrollRecords.length,
    totalBenefitsCost: benefits.reduce((sum, benefit) => sum + (benefit.cost * benefit.employeesEnrolled), 0),
    pendingPayments: payrollRecords.filter(r => r.status !== 'paid').length,
    benefitsEnrollment: benefits.reduce((sum, benefit) => sum + benefit.employeesEnrolled, 0) / (benefits.length * 100) * 100
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nómina y Beneficios
              </h1>
              <p className="text-gray-600">
                Gestión integral de nómina, compensaciones y beneficios
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Procesar Nómina
            </Button>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
                  <div className="text-xs text-gray-600">Nómina Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                  <div className="text-xs text-gray-600">Empleados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgSalary)}</div>
                  <div className="text-xs text-gray-600">Salario Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalBenefitsCost)}</div>
                  <div className="text-xs text-gray-600">Costo Beneficios</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                  <div className="text-xs text-gray-600">Pagos Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.benefitsEnrollment)}%</div>
                  <div className="text-xs text-gray-600">Inscripción Beneficios</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payroll">Nómina</TabsTrigger>
            <TabsTrigger value="benefits">Beneficios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            {/* Filtros de nómina */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros de Nómina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Empleado o departamento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Período</Label>
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Período Actual</SelectItem>
                        <SelectItem value="2025-05">Mayo 2025</SelectItem>
                        <SelectItem value="2025-04">Abril 2025</SelectItem>
                        <SelectItem value="2025-03">Marzo 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los departamentos</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de nómina */}
            <Card>
              <CardHeader>
                <CardTitle>Registros de Nómina ({filteredPayroll.length})</CardTitle>
                <CardDescription>
                  Detalle de cálculos de nómina por empleado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayroll.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{record.employeeName}</h3>
                          <p className="text-sm text-gray-600">{record.department} • {record.period}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{formatCurrency(record.netPay)}</div>
                            <div className="text-xs text-gray-500">Pago Neto</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Salario Base</div>
                          <div className="font-medium">{formatCurrency(record.baseSalary)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Horas Extra</div>
                          <div className="font-medium text-blue-600">{formatCurrency(record.overtime)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Bonos</div>
                          <div className="font-medium text-green-600">{formatCurrency(record.bonuses)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Deducciones</div>
                          <div className="font-medium text-red-600">-{formatCurrency(record.deductions)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Impuestos</div>
                          <div className="font-medium text-red-600">-{formatCurrency(record.taxes)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Fecha de Pago</div>
                          <div className="font-medium">{new Date(record.payDate).toLocaleDateString('es-MX')}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Catálogo de Beneficios
                    <Dialog open={isNewBenefitOpen} onOpenChange={setIsNewBenefitOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Beneficio
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Beneficio</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="benefitName">Nombre del Beneficio</Label>
                            <Input id="benefitName" placeholder="Ej: Seguro de Gastos Médicos" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="benefitType">Tipo</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="health">Salud</SelectItem>
                                <SelectItem value="insurance">Seguros</SelectItem>
                                <SelectItem value="retirement">Retiro</SelectItem>
                                <SelectItem value="vacation">Vacaciones</SelectItem>
                                <SelectItem value="other">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="provider">Proveedor</Label>
                            <Input id="provider" placeholder="Nombre del proveedor" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cost">Costo Mensual</Label>
                            <Input id="cost" type="number" placeholder="2500" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="effectiveDate">Fecha Efectiva</Label>
                            <Input id="effectiveDate" type="date" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNewBenefitOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => setIsNewBenefitOpen(false)}>
                            Crear Beneficio
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benefits.map((benefit) => (
                      <Card key={benefit.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getBenefitTypeIcon(benefit.type)}
                              <Badge variant="outline" className={benefit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {benefit.status === 'active' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{formatCurrency(benefit.cost)}</div>
                              <div className="text-xs text-gray-500">por empleado</div>
                            </div>
                          </div>
                          
                          <h3 className="font-semibold mb-2">{benefit.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Cobertura:</span>
                              <span className="ml-2 font-medium">{benefit.coverage}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Proveedor:</span>
                              <span className="ml-2 font-medium">{benefit.provider}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Inscritos:</span>
                              <span className="ml-2 font-medium">{benefit.employeesEnrolled} empleados</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Adopción</span>
                              <span>{Math.round((benefit.employeesEnrolled / 100) * 100)}%</span>
                            </div>
                            <Progress value={(benefit.employeesEnrolled / 100) * 100} className="h-2" />
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Nómina</CardTitle>
                  <CardDescription>Evolución mensual del gasto en nómina</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={payrollTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Nómina Total']} />
                      <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Beneficios</CardTitle>
                  <CardDescription>Porcentaje de gasto por tipo de beneficio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={benefitDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {benefitDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Costos por Departamento</CardTitle>
                  <CardDescription>Comparación de nómina y beneficios por departamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentCosts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="nomina" fill="#3b82f6" name="Nómina" />
                      <Bar dataKey="beneficios" fill="#22c55e" name="Beneficios" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Resumen Quincenal", description: "Reporte detallado de nómina quincenal", icon: Calendar, color: "blue" },
                { title: "Comprobantes Fiscales", description: "Recibos de nómina y constancias", icon: FileText, color: "green" },
                { title: "Análisis de Costos", description: "Desglose de costos laborales", icon: TrendingUp, color: "purple" },
                { title: "Reporte de Beneficios", description: "Utilización y costos de beneficios", icon: Heart, color: "red" },
                { title: "Cumplimiento Fiscal", description: "Obligaciones y retenciones", icon: Shield, color: "yellow" },
                { title: "Archivo Histórico", description: "Nóminas de períodos anteriores", icon: Archive, color: "gray" }
              ].map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 bg-${report.color}-100 rounded-lg`}>
                        <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PayrollBenefits;