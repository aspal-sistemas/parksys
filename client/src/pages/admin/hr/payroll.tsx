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
  Trash2,
  TrendingUp,
  CreditCard,
  Settings,
  Play,
  Pause,
  RotateCcw,
  User,
  History,
  Filter
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

interface PayrollHistoryDetail {
  id: number;
  periodId: number;
  conceptId: number;
  amount: string;
  quantity: string;
  description: string;
  createdAt: string;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  conceptCode: string;
  conceptName: string;
  conceptType: 'income' | 'deduction';
  conceptCategory: string;
}

interface PayrollHistoryPeriod {
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  details: PayrollHistoryDetail[];
  totalIncome: number;
  totalDeductions: number;
  netPay: number;
}

interface PayrollSummaryStats {
  totalPeriods: number;
  totalIncome: number;
  totalDeductions: number;
  netEarnings: number;
  averageMonthlyPay: number;
}

interface PayrollSummary {
  employee: Employee;
  statistics: PayrollSummaryStats;
  monthlyEarnings: Array<{
    year: number;
    month: number;
    totalIncome: number;
    totalDeductions: number;
    netPay: number;
  }>;
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
  const [isDeleteConceptDialogOpen, setIsDeleteConceptDialogOpen] = useState(false);
  const [deletingConcept, setDeletingConcept] = useState<PayrollConcept | null>(null);
  const [isEmployeeHistoryDialogOpen, setIsEmployeeHistoryDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [historyFilterYear, setHistoryFilterYear] = useState<string>('');
  const [historyFilterMonth, setHistoryFilterMonth] = useState<string>('');
  const [historyFilterPeriod, setHistoryFilterPeriod] = useState<string>(''); // quincena: 1, 2, o todas
  const [isViewPeriodDialogOpen, setIsViewPeriodDialogOpen] = useState(false);
  const [viewingPeriod, setViewingPeriod] = useState<PayrollPeriod | null>(null);
  
  // Estados para paginación y filtros de empleados
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const recordsPerPage = 10;
  
  // Datos de empleados
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/hr/employees"],
    select: (data: Employee[]) => data.filter((emp: Employee) => emp.status === 'active')
  });

  // Datos de conceptos de nómina
  const { data: payrollConcepts = [], isLoading: conceptsLoading } = useQuery<PayrollConcept[]>({
    queryKey: ["/api/hr/payroll-concepts"]
  });

  // Historial de pagos del empleado seleccionado
  const { data: employeePayrollHistory = [], isLoading: isLoadingHistory } = useQuery<PayrollHistoryPeriod[]>({
    queryKey: ["/api/hr/employees", selectedEmployeeId, "payroll-history", historyFilterYear, historyFilterMonth, historyFilterPeriod],
    queryFn: async () => {
      if (!selectedEmployeeId) return [];
      const params = new URLSearchParams();
      if (historyFilterYear && historyFilterYear !== 'all') params.append('year', historyFilterYear);
      if (historyFilterMonth && historyFilterMonth !== 'all') params.append('month', historyFilterMonth);
      if (historyFilterPeriod && historyFilterPeriod !== 'all') params.append('period', historyFilterPeriod);
      const queryString = params.toString();
      const url = `/api/hr/employees/${selectedEmployeeId}/payroll-history${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      return response.json();
    },
    enabled: !!selectedEmployeeId
  });

  // Resumen de pagos del empleado seleccionado
  const { data: employeePayrollSummary, isLoading: isLoadingSummary } = useQuery<PayrollSummary>({
    queryKey: ["/api/hr/employees", selectedEmployeeId, "payroll-summary"],
    queryFn: async () => {
      if (!selectedEmployeeId) return null;
      const response = await fetch(`/api/hr/employees/${selectedEmployeeId}/payroll-summary`);
      return response.json();
    },
    enabled: !!selectedEmployeeId
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

  // Mutación para eliminar concepto
  const deleteConceptMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/hr/payroll-concepts/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-concepts"] });
      setIsDeleteConceptDialogOpen(false);
      setDeletingConcept(null);
      toast({
        title: "Concepto eliminado",
        description: "El concepto de nómina se ha eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el concepto de nómina",
        variant: "destructive",
      });
    }
  });

  // Obtener valores únicos para filtros
  const uniqueDepartments = Array.from(new Set(employees.map((emp: Employee) => emp.department)));
  const uniquePositions = Array.from(new Set(employees.map((emp: Employee) => emp.position)));

  // Filtrar empleados por búsqueda y filtros
  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesPosition = !positionFilter || employee.position === positionFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
  });

  // Calcular paginación
  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, positionFilter, statusFilter]);

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
    const periodType = formData.get('periodType') as string;
    const year = parseInt(formData.get('year') as string);
    const month = parseInt(formData.get('month') as string);
    const quincena = formData.get('quincena') as string;

    const periodsToCreate = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    if (periodType === 'quincenal') {
      if (quincena === 'both' || quincena === '1') {
        // Primera quincena (1-15)
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, 15);
        const payDate = new Date(year, month - 1, 15);
        
        periodsToCreate.push({
          name: `${monthNames[month - 1]} ${year} - 1ra Quincena`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          payDate: payDate.toISOString().split('T')[0],
          periodType: 'quincenal',
          status: 'draft'
        });
      }
      
      if (quincena === 'both' || quincena === '2') {
        // Segunda quincena (16-fin de mes)
        const startDate = new Date(year, month - 1, 16);
        const endDate = new Date(year, month, 0); // Último día del mes
        const payDate = new Date(year, month, 0);
        
        periodsToCreate.push({
          name: `${monthNames[month - 1]} ${year} - 2da Quincena`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          payDate: payDate.toISOString().split('T')[0],
          periodType: 'quincenal',
          status: 'draft'
        });
      }
    } else if (periodType === 'mensual') {
      // Período mensual completo
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const payDate = new Date(year, month, 0);
      
      periodsToCreate.push({
        name: `${monthNames[month - 1]} ${year} - Mensual`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        payDate: payDate.toISOString().split('T')[0],
        periodType: 'mensual',
        status: 'draft'
      });
    } else if (periodType === 'semanal') {
      // Para períodos semanales, crear las 4-5 semanas del mes
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      let weekStart = new Date(firstDay);
      let weekNum = 1;
      
      while (weekStart <= lastDay) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Ajustar si se pasa del mes
        if (weekEnd > lastDay) {
          weekEnd.setTime(lastDay.getTime());
        }
        
        periodsToCreate.push({
          name: `${monthNames[month - 1]} ${year} - Semana ${weekNum}`,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          payDate: weekEnd.toISOString().split('T')[0],
          periodType: 'semanal',
          status: 'draft'
        });
        
        weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() + 1);
        weekNum++;
      }
    }

    // Crear todos los períodos secuencialmente
    let createdCount = 0;
    
    const createPeriodRecursive = (index: number) => {
      if (index >= periodsToCreate.length) {
        toast({
          title: "Períodos creados exitosamente",
          description: `Se crearon ${createdCount} período(s) de nómina`,
        });
        setIsNewPeriodDialogOpen(false);
        return;
      }
      
      createPeriodMutation.mutate(periodsToCreate[index], {
        onSuccess: () => {
          createdCount++;
          createPeriodRecursive(index + 1);
        },
        onError: () => {
          toast({
            title: "Error",
            description: `Error al crear el período ${periodsToCreate[index].name}`,
            variant: "destructive",
          });
        }
      });
    };
    
    createPeriodRecursive(0);
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

  // Función para eliminar concepto
  const handleDeleteConcept = (concept: PayrollConcept) => {
    setDeletingConcept(concept);
    setIsDeleteConceptDialogOpen(true);
  };

  // Función para confirmar eliminación
  const handleConfirmDelete = () => {
    if (!deletingConcept) return;
    deleteConceptMutation.mutate(deletingConcept.id);
  };

  // Función para ver historial de empleado
  const handleViewEmployeeHistory = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setHistoryFilterYear('');
    setHistoryFilterMonth('');
    setIsEmployeeHistoryDialogOpen(true);
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
                {/* Controles de búsqueda y filtros */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar empleados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los departamentos</SelectItem>
                        {uniqueDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por posición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las posiciones</SelectItem>
                        {uniquePositions.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estados</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="suspended">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Información de resultados */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalRecords)} de {totalRecords} empleados
                    </div>
                    {(searchTerm || departmentFilter || positionFilter || statusFilter) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setDepartmentFilter("");
                          setPositionFilter("");
                          setStatusFilter("");
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    )}
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
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEmployees.map((employee: Employee) => (
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
                            <Badge 
                              className={
                                employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {employee.status === 'active' ? 'Activo' :
                               employee.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewEmployeeHistory(employee.id)}
                              className="flex items-center gap-2"
                            >
                              <History className="h-4 w-4" />
                              Ver Ficha
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Controles de paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        
                        {/* Números de página */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={currentPage === pageNum ? "bg-[#00a587] hover:bg-[#067f5f]" : ""}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
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
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditConcept(concept)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteConcept(concept)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
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
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditConcept(concept)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteConcept(concept)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Período de Nómina</DialogTitle>
              <DialogDescription>
                Genera automáticamente períodos de nómina quincenales o mensuales
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePeriod} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="periodType">Tipo de Período</Label>
                <Select name="periodType" defaultValue="quincenal" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quincenal">Quincenal (1ra y 2da quincena)</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Select name="year" defaultValue={new Date().getFullYear().toString()} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
                    <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                    <SelectItem value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Select name="month" defaultValue={(new Date().getMonth() + 1).toString().padStart(2, '0')} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Enero</SelectItem>
                    <SelectItem value="02">Febrero</SelectItem>
                    <SelectItem value="03">Marzo</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Mayo</SelectItem>
                    <SelectItem value="06">Junio</SelectItem>
                    <SelectItem value="07">Julio</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div id="quincenaOptions" className="space-y-2">
                <Label htmlFor="quincena">Quincena (solo para períodos quincenales)</Label>
                <Select name="quincena" defaultValue="both">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Ambas quincenas (1ra y 2da)</SelectItem>
                    <SelectItem value="1">Primera quincena (1-15)</SelectItem>
                    <SelectItem value="2">Segunda quincena (16-fin de mes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Períodos que se crearán:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• Los períodos se generan automáticamente con fechas correctas</div>
                  <div>• Quincenal: 1-15 y 16-último día del mes</div>
                  <div>• Mensual: Todo el mes completo</div>
                  <div>• Fechas de pago: Último día laboral del período</div>
                </div>
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
                  {createPeriodMutation.isPending ? "Creando..." : "Crear Período(s)"}
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

        {/* Dialog para Eliminar Concepto */}
        <Dialog open={isDeleteConceptDialogOpen} onOpenChange={setIsDeleteConceptDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Concepto de Nómina</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este concepto?
              </DialogDescription>
            </DialogHeader>
            {deletingConcept && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-l-red-500">
                  <h4 className="font-medium text-red-900">{deletingConcept.name}</h4>
                  <p className="text-sm text-red-800">Código: {deletingConcept.code}</p>
                  <p className="text-sm text-red-800">Tipo: {deletingConcept.type === 'income' ? 'Ingreso' : 'Deducción'}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta acción no se puede deshacer. El concepto será eliminado permanentemente.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteConceptDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={deleteConceptMutation.isPending}
                  >
                    {deleteConceptMutation.isPending ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </div>
            )}
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

        {/* Dialog para historial de empleado */}
        <Dialog open={isEmployeeHistoryDialogOpen} onOpenChange={setIsEmployeeHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                  <History className="h-6 w-6 text-white" />
                </div>
                Ficha de Empleado - Historial de Pagos
              </DialogTitle>
              <DialogDescription>
                Consulta información personal, estadísticas de nómina y historial detallado de pagos del empleado.
              </DialogDescription>
            </DialogHeader>
            
            {selectedEmployeeId && employeePayrollSummary && employeePayrollSummary.employee && (
              <div className="space-y-6">
                {/* Información del empleado */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                        <p className="text-lg font-semibold text-gray-900">{employeePayrollSummary.employee.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-gray-900">{employeePayrollSummary.employee.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departamento</p>
                        <p className="text-gray-900">{employeePayrollSummary.employee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Posición</p>
                        <p className="text-gray-900">{employeePayrollSummary.employee.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Salario Base</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${parseFloat(employeePayrollSummary.employee.salary).toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fecha de Contratación</p>
                        <p className="text-gray-900">
                          {new Date(employeePayrollSummary.employee.hireDate).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estadísticas de nómina */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-[#bcd256]/10 to-[#8498a5]/10 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Resumen Estadístico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Períodos Totales</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {employeePayrollSummary.statistics.totalPeriods}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-green-700">
                          ${employeePayrollSummary.statistics.totalIncome.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Deducciones Totales</p>
                        <p className="text-2xl font-bold text-red-700">
                          ${employeePayrollSummary.statistics.totalDeductions.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Pago Neto Promedio</p>
                        <p className="text-2xl font-bold text-purple-700">
                          ${employeePayrollSummary.statistics.averageMonthlyPay.toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filtros para historial */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtrar Historial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="filterYear">Año</Label>
                        <Select value={historyFilterYear} onValueChange={setHistoryFilterYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los años" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los años</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="filterMonth">Mes</Label>
                        <Select value={historyFilterMonth} onValueChange={setHistoryFilterMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los meses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los meses</SelectItem>
                            <SelectItem value="01">Enero</SelectItem>
                            <SelectItem value="02">Febrero</SelectItem>
                            <SelectItem value="03">Marzo</SelectItem>
                            <SelectItem value="04">Abril</SelectItem>
                            <SelectItem value="05">Mayo</SelectItem>
                            <SelectItem value="06">Junio</SelectItem>
                            <SelectItem value="07">Julio</SelectItem>
                            <SelectItem value="08">Agosto</SelectItem>
                            <SelectItem value="09">Septiembre</SelectItem>
                            <SelectItem value="10">Octubre</SelectItem>
                            <SelectItem value="11">Noviembre</SelectItem>
                            <SelectItem value="12">Diciembre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="filterPeriod">Quincena</Label>
                        <Select value={historyFilterPeriod} onValueChange={setHistoryFilterPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las quincenas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las quincenas</SelectItem>
                            <SelectItem value="1">Primera quincena (1-15)</SelectItem>
                            <SelectItem value="2">Segunda quincena (16-31)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historial de pagos */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-[#067f5f]/10 to-[#00a587]/10 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Historial de Pagos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isLoadingHistory ? (
                      <div className="text-center py-8">Cargando historial...</div>
                    ) : employeePayrollHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No hay registros de pagos para los filtros seleccionados
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {employeePayrollHistory.map((period) => (
                          <div key={period.period} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-gray-900">
                                Período: {period.period}
                              </h4>
                              <Badge variant="outline" className={
                                period.status === 'paid' ? 'bg-green-50 text-green-700' :
                                period.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                                'bg-yellow-50 text-yellow-700'
                              }>
                                {period.status === 'paid' ? 'Pagado' :
                                 period.status === 'approved' ? 'Aprobado' : 'Procesando'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center p-3 bg-green-50 rounded">
                                <p className="text-sm text-green-600">Ingresos</p>
                                <p className="font-semibold text-green-700">
                                  ${period.totalIncome.toLocaleString('es-MX')}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded">
                                <p className="text-sm text-red-600">Deducciones</p>
                                <p className="font-semibold text-red-700">
                                  ${period.totalDeductions.toLocaleString('es-MX')}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded">
                                <p className="text-sm text-blue-600">Neto</p>
                                <p className="font-semibold text-blue-700">
                                  ${period.netPay.toLocaleString('es-MX')}
                                </p>
                              </div>
                            </div>

                            {/* Detalles del período */}
                            <div className="border-t pt-3">
                              <h5 className="font-medium text-gray-800 mb-2">Detalles:</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {period.details.map((detail) => (
                                  <div key={detail.id} className="flex justify-between">
                                    <span className={detail.conceptType === 'income' ? 'text-green-600' : 'text-red-600'}>
                                      {detail.conceptName}
                                    </span>
                                    <span className={detail.conceptType === 'income' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                      ${parseFloat(detail.amount).toLocaleString('es-MX')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}