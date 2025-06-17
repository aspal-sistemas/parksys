import { useState, useEffect } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  Plus, 
  Search, 
  Download,
  DollarSign,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  TrendingUp,
  CreditCard,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

// Interfaces para el módulo de nómina
interface Employee {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  hireDate: string;
  status: string;
  education: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  skills: string[];
  certifications: string[];
  workSchedule: string;
  createdAt: string;
  updatedAt: string;
}

interface PayrollConcept {
  id: number;
  code: string;
  name: string;
  type: 'income' | 'deduction' | 'benefit';
  category: 'salary' | 'overtime' | 'bonus' | 'tax' | 'insurance';
  isFixed: boolean;
  formula: string;
  isActive: boolean;
  expenseCategoryId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PayrollPeriod {
  id: number;
  period: string; // YYYY-MM format
  startDate: string;
  endDate: string;
  status: 'draft' | 'processing' | 'calculated' | 'approved' | 'paid';
  processedAt: string;
  totalAmount: string;
  employeesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PayrollDetail {
  id: number;
  periodId: number;
  employeeId: number;
  conceptId: number;
  amount: string;
  quantity: string;
  description: string;
  createdAt: string;
}

interface ProcessedEmployee {
  employeeId: number;
  employeeName: string;
  baseSalary: number;
  deductions: number;
  netPay: number;
}

export default function Payroll() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("periods");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isNewPeriodDialogOpen, setIsNewPeriodDialogOpen] = useState(false);
  const [isProcessPayrollDialogOpen, setIsProcessPayrollDialogOpen] = useState(false);
  const [isNewConceptDialogOpen, setIsNewConceptDialogOpen] = useState(false);
  const [isEditConceptDialogOpen, setIsEditConceptDialogOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<PayrollConcept | null>(null);
  const [isViewPeriodDialogOpen, setIsViewPeriodDialogOpen] = useState(false);
  const [viewingPeriod, setViewingPeriod] = useState<PayrollPeriod | null>(null);
  
  // Datos de empleados
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/hr/employees"],
    select: (data: Employee[]) => data.filter((emp: Employee) => emp.status === 'active')
  });

  // Datos de conceptos de nómina
  const { data: payrollConcepts = [], isLoading: conceptsLoading } = useQuery<PayrollConcept[]>({
    queryKey: ["/api/hr/payroll-concepts"]
  });

  // Datos de períodos de nómina
  const { data: payrollPeriods = [], isLoading: periodsLoading } = useQuery<PayrollPeriod[]>({
    queryKey: ["/api/hr/payroll-periods"]
  });

  // Datos de detalles de nómina para el período seleccionado
  const { data: payrollDetails = [], isLoading: detailsLoading } = useQuery<PayrollDetail[]>({
    queryKey: ["/api/hr/payroll-details", viewingPeriod?.id],
    enabled: !!viewingPeriod?.id
  });

  // Mutación para crear período
  const createPeriodMutation = useMutation({
    mutationFn: async (periodData: any) => {
      return apiRequest("/api/hr/payroll-periods", {
        method: "POST",
        data: periodData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-periods"] });
      setIsNewPeriodDialogOpen(false);
      toast({
        title: "Período creado",
        description: "El período de nómina se ha creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo crear el período de nómina",
        variant: "destructive",
      });
    }
  });

  // Mutación para procesar nómina
  const processPayrollMutation = useMutation({
    mutationFn: async (processData: any) => {
      return apiRequest("/api/hr/payroll-periods/process", {
        method: "POST",
        data: processData
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-periods"] });
      setIsProcessPayrollDialogOpen(false);
      toast({
        title: "Nómina procesada",
        description: `Se procesaron ${data?.processedEmployees?.length || 0} empleados exitosamente`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo procesar la nómina",
        variant: "destructive",
      });
    }
  });

  // Mutación para crear concepto
  const createConceptMutation = useMutation({
    mutationFn: async (conceptData: any) => {
      return apiRequest("/api/hr/payroll-concepts", {
        method: "POST",
        data: conceptData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-concepts"] });
      setIsNewConceptDialogOpen(false);
      toast({
        title: "Concepto creado",
        description: "El concepto de nómina se ha creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo crear el concepto de nómina",
        variant: "destructive",
      });
    }
  });

  // Mutación para editar concepto
  const editConceptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/hr/payroll-concepts/${id}`, {
        method: "PUT",
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-concepts"] });
      setIsEditConceptDialogOpen(false);
      setEditingConcept(null);
      toast({
        title: "Concepto actualizado",
        description: "El concepto de nómina se ha actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el concepto de nómina",
        variant: "destructive",
      });
    }
  });

  // Filtrar empleados por búsqueda
  const filteredEmployees = employees.filter((emp: Employee) =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Colores para gráficos
  const CHART_COLORS = ['#00a587', '#067f5f', '#bcd256', '#8498a5', '#22c55e'];

  // Datos para dashboard
  const totalActiveEmployees = employees.length;
  const currentMonthPeriod = payrollPeriods.find((period: PayrollPeriod) => {
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return period.period === currentPeriod;
  });

  const totalMonthlyPayroll = currentMonthPeriod ? parseFloat(currentMonthPeriod.totalAmount || '0') : 0;

  // Función para obtener el estado visual del período
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Borrador' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Procesando' },
      calculated: { color: 'bg-yellow-100 text-yellow-800', label: 'Calculado' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprobado' },
      paid: { color: 'bg-[#00a587]/20 text-[#00a587]', label: 'Pagado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Función para crear nuevo período
  const handleCreatePeriod = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const period = formData.get('period') as string;
    
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    createPeriodMutation.mutate({
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'draft'
    });
  };

  // Función para procesar nómina
  const handleProcessPayroll = (period: PayrollPeriod) => {
    const selectedEmployees = employees.map((emp: Employee) => ({
      id: emp.id,
      fullName: emp.fullName,
      salary: parseFloat(emp.salary),
      department: emp.department
    }));

    processPayrollMutation.mutate({
      period: period.period,
      employees: selectedEmployees
    });
  };

  // Función para crear nuevo concepto
  const handleCreateConcept = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const conceptData = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      category: formData.get('category') as string,
      isFixed: formData.get('isFixed') === 'true',
      formula: formData.get('formula') as string || null,
      isActive: true,
      expenseCategoryId: 22, // ID de la categoría Personal
      sortOrder: payrollConcepts.length + 1
    };

    createConceptMutation.mutate(conceptData);
  };

  // Función para ver detalles del período
  const handleViewPeriod = (period: PayrollPeriod) => {
    setViewingPeriod(period);
    setIsViewPeriodDialogOpen(true);
  };

  // Función para editar concepto
  const handleEditConcept = (concept: PayrollConcept) => {
    setEditingConcept(concept);
    setIsEditConceptDialogOpen(true);
  };

  // Función para actualizar concepto
  const handleUpdateConcept = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingConcept) return;
    
    const formData = new FormData(e.currentTarget);
    
    const conceptData = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      category: formData.get('category') as string,
      isFixed: formData.get('isFixed') === 'true',
      formula: formData.get('formula') as string || null,
      isActive: true,
      expenseCategoryId: editingConcept.expenseCategoryId,
      sortOrder: editingConcept.sortOrder
    };

    editConceptMutation.mutate({ id: editingConcept.id, data: conceptData });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Nómina</h1>
            <p className="text-gray-600 mt-1">Sistema integral de nómina con integración automática a finanzas</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsNewPeriodDialogOpen(true)}
              className="bg-[#00a587] hover:bg-[#067f5f] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Período
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
              <Users className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00a587]">{totalActiveEmployees}</div>
              <p className="text-xs text-gray-600">Personal en nómina</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
              <DollarSign className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00a587]">
                ${totalMonthlyPayroll.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-gray-600">Total mes actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Períodos</CardTitle>
              <Calendar className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00a587]">{payrollPeriods.length}</div>
              <p className="text-xs text-gray-600">Períodos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conceptos</CardTitle>
              <FileText className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00a587]">{payrollConcepts.length}</div>
              <p className="text-xs text-gray-600">Conceptos configurados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="periods">Períodos</TabsTrigger>
            <TabsTrigger value="employees">Empleados</TabsTrigger>
            <TabsTrigger value="concepts">Conceptos</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Períodos de Nómina */}
          <TabsContent value="periods">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Períodos de Nómina
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Gestión de períodos de pago y procesamiento de nómina
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {periodsLoading ? (
                  <div className="text-center py-8">Cargando períodos...</div>
                ) : (
                  <div className="space-y-4">
                    {payrollPeriods.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium">No hay períodos registrados</h3>
                        <p className="text-sm">Crea tu primer período de nómina para comenzar</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Empleados</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payrollPeriods.map((period: PayrollPeriod) => (
                            <TableRow key={period.id}>
                              <TableCell className="font-medium">{period.period}</TableCell>
                              <TableCell>
                                {new Date(period.startDate).toLocaleDateString('es-MX')} - {new Date(period.endDate).toLocaleDateString('es-MX')}
                              </TableCell>
                              <TableCell>{getStatusBadge(period.status)}</TableCell>
                              <TableCell>{period.employeesCount || 0}</TableCell>
                              <TableCell>${parseFloat(period.totalAmount || '0').toLocaleString('es-MX')}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {period.status === 'draft' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setIsProcessPayrollDialogOpen(true);
                                      }}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Procesar
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewPeriod(period)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Empleados en Nómina */}
          <TabsContent value="employees">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Empleados en Nómina
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Personal activo incluido en el procesamiento de nómina
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar empleados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                {employeesLoading ? (
                  <div className="text-center py-8">Cargando empleados...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>Salario Base</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee: Employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.fullName}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>${parseFloat(employee.salary).toLocaleString('es-MX')}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Activo</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conceptos de Nómina */}
          <TabsContent value="concepts">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      Conceptos de Nómina
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Configuración de salarios, deducciones y prestaciones
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsNewConceptDialogOpen(true)}
                    className="bg-[#00a587] hover:bg-[#067f5f] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Concepto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {conceptsLoading ? (
                  <div className="text-center py-8">Cargando conceptos...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Conceptos de Ingresos */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-[#00a587]">Conceptos de Ingresos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {payrollConcepts
                          .filter((concept: PayrollConcept) => concept.type === 'income')
                          .map((concept: PayrollConcept) => (
                            <Card key={concept.id} className="border-l-4 border-l-green-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-green-100 text-green-800">{concept.code}</Badge>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{concept.category}</Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditConcept(concept)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <h4 className="font-medium">{concept.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {concept.isFixed ? 'Monto fijo' : 'Calculado'}
                                </p>
                                {concept.formula && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Fórmula: {concept.formula}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>

                    {/* Conceptos de Deducciones */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">Conceptos de Deducciones</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {payrollConcepts
                          .filter((concept: PayrollConcept) => concept.type === 'deduction')
                          .map((concept: PayrollConcept) => (
                            <Card key={concept.id} className="border-l-4 border-l-red-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-red-100 text-red-800">{concept.code}</Badge>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{concept.category}</Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditConcept(concept)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <h4 className="font-medium">{concept.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {concept.isFixed ? 'Monto fijo' : 'Calculado'}
                                </p>
                                {concept.formula && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Fórmula: {concept.formula}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes */}
          <TabsContent value="reports">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Reportes y Análisis
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Análisis de costos de nómina y tendencias de personal
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribución por Departamento */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribución de Nómina por Departamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                employees.reduce((acc: any, emp: Employee) => {
                                  acc[emp.department] = (acc[emp.department] || 0) + parseFloat(emp.salary);
                                  return acc;
                                }, {})
                              ).map(([dept, total]) => ({ name: dept, value: total }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(
                                employees.reduce((acc: any, emp: Employee) => {
                                  acc[emp.department] = (acc[emp.department] || 0) + parseFloat(emp.salary);
                                  return acc;
                                }, {})
                              ).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-MX')}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumen de Empleados */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen de Personal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Empleados</span>
                          <span className="text-lg font-bold text-[#00a587]">{totalActiveEmployees}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Nómina Total</span>
                          <span className="text-lg font-bold text-[#00a587]">
                            ${employees.reduce((sum: number, emp: Employee) => sum + parseFloat(emp.salary), 0).toLocaleString('es-MX')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Promedio Salarial</span>
                          <span className="text-lg font-bold text-[#00a587]">
                            ${totalActiveEmployees > 0 ? Math.round(employees.reduce((sum: number, emp: Employee) => sum + parseFloat(emp.salary), 0) / totalActiveEmployees).toLocaleString('es-MX') : 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para Nuevo Período */}
        <Dialog open={isNewPeriodDialogOpen} onOpenChange={setIsNewPeriodDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Período de Nómina</DialogTitle>
              <DialogDescription>
                Configura un nuevo período de pago para procesar la nómina
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período (YYYY-MM)</Label>
                <Input
                  id="period"
                  name="period"
                  type="month"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsNewPeriodDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={createPeriodMutation.isPending}
                >
                  {createPeriodMutation.isPending ? "Creando..." : "Crear Período"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Procesar Nómina */}
        <Dialog open={isProcessPayrollDialogOpen} onOpenChange={setIsProcessPayrollDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Procesar Nómina</DialogTitle>
              <DialogDescription>
                {selectedPeriod && `Se procesará la nómina para el período ${selectedPeriod.period} con ${totalActiveEmployees} empleados activos`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resumen del Procesamiento</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Se calcularán automáticamente los salarios base</li>
                  <li>• Se aplicarán las deducciones de IMSS (2.375%) e ISR</li>
                  <li>• Se generará automáticamente el registro en Finanzas</li>
                  <li>• El proceso no se puede deshacer una vez iniciado</li>
                </ul>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProcessPayrollDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => selectedPeriod && handleProcessPayroll(selectedPeriod)}
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={processPayrollMutation.isPending}
                >
                  {processPayrollMutation.isPending ? "Procesando..." : "Procesar Nómina"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Editar Concepto */}
        <Dialog open={isEditConceptDialogOpen} onOpenChange={setIsEditConceptDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Concepto de Nómina</DialogTitle>
              <DialogDescription>
                Modifica la configuración del concepto de nómina
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateConcept} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Código *</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingConcept?.code || ''}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingConcept?.name || ''}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Tipo *</Label>
                  <Select name="type" defaultValue={editingConcept?.type || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="deduction">Deducción</SelectItem>
                      <SelectItem value="benefit">Prestación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría *</Label>
                  <Select name="category" defaultValue={editingConcept?.category || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salario</SelectItem>
                      <SelectItem value="overtime">Tiempo Extra</SelectItem>
                      <SelectItem value="bonus">Bonificación</SelectItem>
                      <SelectItem value="tax">Impuesto</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isFixed">Tipo de Cálculo</Label>
                <Select name="isFixed" defaultValue={editingConcept?.isFixed ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Monto Fijo</SelectItem>
                    <SelectItem value="false">Calculado por Fórmula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-formula">Fórmula (opcional)</Label>
                <Input
                  id="edit-formula"
                  name="formula"
                  defaultValue={editingConcept?.formula || ''}
                  placeholder="Ej: salary * 0.15 o 500"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Para conceptos calculados. Puedes usar: salary, hours, días_trabajados
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditConceptDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={editConceptMutation.isPending}
                >
                  {editConceptMutation.isPending ? "Actualizando..." : "Actualizar Concepto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Nuevo Concepto */}
        <Dialog open={isNewConceptDialogOpen} onOpenChange={setIsNewConceptDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Concepto de Nómina</DialogTitle>
              <DialogDescription>
                Configura un nuevo concepto para usar en el procesamiento de nómina
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateConcept} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="Ej: PRIMA_VAC"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Código único para identificar el concepto</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Prima Vacacional"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="deduction">Deducción</SelectItem>
                      <SelectItem value="benefit">Prestación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salario</SelectItem>
                      <SelectItem value="overtime">Tiempo Extra</SelectItem>
                      <SelectItem value="bonus">Bonificación</SelectItem>
                      <SelectItem value="tax">Impuesto</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isFixed">Tipo de Cálculo</Label>
                <Select name="isFixed" defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Monto Fijo</SelectItem>
                    <SelectItem value="false">Calculado por Fórmula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formula">Fórmula (opcional)</Label>
                <Input
                  id="formula"
                  name="formula"
                  placeholder="Ej: salary * 0.15 o 500"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Para conceptos calculados. Puedes usar: salary, hours, días_trabajados
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Ejemplos de Conceptos</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>Aguinaldo:</strong> Tipo: Ingreso, Categoría: Bonificación, Fórmula: salary * 0.5</p>
                  <p><strong>Prima Vacacional:</strong> Tipo: Ingreso, Categoría: Bonificación, Fórmula: salary * 0.25</p>
                  <p><strong>Vales de Despensa:</strong> Tipo: Prestación, Monto Fijo: 1000</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsNewConceptDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00a587] hover:bg-[#067f5f]"
                  disabled={createConceptMutation.isPending}
                >
                  {createConceptMutation.isPending ? "Creando..." : "Crear Concepto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Ver Detalles del Período */}
        <Dialog open={isViewPeriodDialogOpen} onOpenChange={setIsViewPeriodDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles del Período de Nómina</DialogTitle>
              <DialogDescription>
                {viewingPeriod && `Información detallada del período ${viewingPeriod.period}`}
              </DialogDescription>
            </DialogHeader>
            {viewingPeriod && (
              <div className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Período</h4>
                    <p className="text-2xl font-bold text-blue-600">{viewingPeriod.period}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Estado</h4>
                    <Badge className={
                      viewingPeriod.status === 'paid' ? 'bg-green-100 text-green-800' :
                      viewingPeriod.status === 'calculated' ? 'bg-blue-100 text-blue-800' :
                      viewingPeriod.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {viewingPeriod.status === 'paid' ? 'Pagado' :
                       viewingPeriod.status === 'calculated' ? 'Calculado' :
                       viewingPeriod.status === 'draft' ? 'Borrador' :
                       viewingPeriod.status}
                    </Badge>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900">Empleados</h4>
                    <p className="text-2xl font-bold text-purple-600">{viewingPeriod.employeesCount || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900">Total</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      ${viewingPeriod.totalAmount ? parseFloat(viewingPeriod.totalAmount).toLocaleString('es-MX') : '0'}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <p className="text-sm font-medium">
                      {viewingPeriod.startDate ? new Date(viewingPeriod.startDate).toLocaleDateString('es-MX') : 'No definida'}
                    </p>
                  </div>
                  <div>
                    <Label>Fecha de Fin</Label>
                    <p className="text-sm font-medium">
                      {viewingPeriod.endDate ? new Date(viewingPeriod.endDate).toLocaleDateString('es-MX') : 'No definida'}
                    </p>
                  </div>
                  <div>
                    <Label>Procesado el</Label>
                    <p className="text-sm font-medium">
                      {viewingPeriod.processedAt ? new Date(viewingPeriod.processedAt).toLocaleDateString('es-MX') : 'No procesado'}
                    </p>
                  </div>
                </div>

                {/* Resumen de Conceptos */}
                <div>
                  <h4 className="font-semibold mb-3">Conceptos Aplicados</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Ingresos</h5>
                        <div className="space-y-1 text-sm">
                          {payrollConcepts
                            .filter((concept: PayrollConcept) => concept.type === 'income')
                            .map((concept: PayrollConcept) => (
                              <div key={concept.id} className="flex justify-between">
                                <span>{concept.name}</span>
                                <span className="font-medium">{concept.code}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">Deducciones</h5>
                        <div className="space-y-1 text-sm">
                          {payrollConcepts
                            .filter((concept: PayrollConcept) => concept.type === 'deduction')
                            .map((concept: PayrollConcept) => (
                              <div key={concept.id} className="flex justify-between">
                                <span>{concept.name}</span>
                                <span className="font-medium">{concept.code}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewPeriodDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  {viewingPeriod.status === 'draft' && (
                    <Button 
                      onClick={() => {
                        setSelectedPeriod(viewingPeriod);
                        setIsViewPeriodDialogOpen(false);
                        setIsProcessPayrollDialogOpen(true);
                      }}
                      className="bg-[#00a587] hover:bg-[#067f5f]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Procesar Nómina
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}