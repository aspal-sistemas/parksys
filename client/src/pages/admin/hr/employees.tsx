import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  Edit,
  Trash2,
  Eye,
  Building,
  GraduationCap,
  DollarSign
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'vacation';
  profileImage?: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  education: string;
  certifications: string[];
  skills: string[];
  workSchedule: string;
}

const EmployeesManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    hireDate: "",
    education: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener empleados de la base de datos
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => fetch('/api/employees').then(res => res.json())
  });

  // Mutación para crear empleado
  const createEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => 
      apiRequest('/api/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsNewEmployeeOpen(false);
      setNewEmployeeData({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        salary: "",
        hireDate: "",
        education: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: ""
      });
      toast({
        title: "Empleado creado",
        description: "El empleado ha sido registrado exitosamente",
      });
    },
    onError: (error) => {
      console.error('Error creando empleado:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el empleado",
        variant: "destructive",
      });
    },
  });

  const handleCreateEmployee = () => {
    console.log("Datos del formulario antes de validación:", newEmployeeData);
    
    if (!newEmployeeData.fullName || !newEmployeeData.email || !newEmployeeData.salary) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const employeePayload = {
      ...newEmployeeData,
      salary: parseFloat(newEmployeeData.salary) || 0,
      status: 'active',
      skills: [],
      certifications: [],
      workSchedule: "Lunes a Viernes 8:00-16:00"
    };

    console.log("Payload final a enviar:", employeePayload);
    createEmployeeMutation.mutate(employeePayload);
  };

  // Empleados de respaldo si no hay conexión a la BD
  const fallbackEmployees: Employee[] = [
    {
      id: 1,
      fullName: "María Elena González",
      email: "maria.gonzalez@parques.mx",
      phone: "+52 33 1234-5678",
      position: "Coordinadora de Eventos",
      department: "Eventos y Actividades",
      hireDate: "2023-01-15",
      salary: 35000,
      status: "active",
      address: "Col. Americana, Guadalajara, Jal.",
      emergencyContact: "Pedro González",
      emergencyPhone: "+52 33 8765-4321",
      education: "Lic. en Administración de Empresas",
      certifications: ["Organización de Eventos", "Primeros Auxilios"],
      skills: ["Liderazgo", "Comunicación", "Planificación"],
      workSchedule: "Lunes a Viernes 8:00-16:00"
    },
    {
      id: 2,
      fullName: "Carlos Alberto Martínez",
      email: "carlos.martinez@parques.mx", 
      phone: "+52 33 2345-6789",
      position: "Jefe de Mantenimiento",
      department: "Mantenimiento",
      hireDate: "2022-06-10",
      salary: 28000,
      status: "active",
      address: "Col. Tlaquepaque, Jal.",
      emergencyContact: "Ana Martínez",
      emergencyPhone: "+52 33 9876-5432",
      education: "Ing. en Mantenimiento Industrial",
      certifications: ["Soldadura", "Electricidad", "Seguridad Industrial"],
      skills: ["Mecánica", "Electricidad", "Gestión de Equipos"],
      workSchedule: "Lunes a Sábado 7:00-15:00"
    },
    {
      id: 3,
      fullName: "Ana Patricia Rodríguez",
      email: "ana.rodriguez@parques.mx",
      phone: "+52 33 3456-7890",
      position: "Especialista en Finanzas",
      department: "Administración",
      hireDate: "2023-03-20",
      salary: 32000,
      status: "vacation",
      address: "Col. Chapalita, Guadalajara, Jal.",
      emergencyContact: "Luis Rodríguez",
      emergencyPhone: "+52 33 7654-3210",
      education: "Lic. en Contaduría Pública",
      certifications: ["CPA", "Auditoría Interna"],
      skills: ["Análisis Financiero", "Excel Avanzado", "SAP"],
      workSchedule: "Lunes a Viernes 9:00-17:00"
    },
    {
      id: 4,
      fullName: "Roberto Jiménez Silva",
      email: "roberto.jimenez@parques.mx",
      phone: "+52 33 4567-8901",
      position: "Coordinador de Seguridad",
      department: "Seguridad",
      hireDate: "2021-11-05",
      salary: 26000,
      status: "active",
      address: "Col. Polanco, Guadalajara, Jal.",
      emergencyContact: "Carmen Silva",
      emergencyPhone: "+52 33 6543-2109",
      education: "Lic. en Criminología",
      certifications: ["Seguridad Privada", "Manejo de Crisis"],
      skills: ["Vigilancia", "Comunicación Radiofónica", "Protocolos de Emergencia"],
      workSchedule: "Turnos Rotativos 24/7"
    },
    {
      id: 5,
      fullName: "Sofía Mendoza López",
      email: "sofia.mendoza@parques.mx",
      phone: "+52 33 5678-9012",
      position: "Instructora de Actividades",
      department: "Eventos y Actividades",
      hireDate: "2023-08-12",
      salary: 22000,
      status: "active",
      address: "Col. Santa Tere, Guadalajara, Jal.",
      emergencyContact: "Miguel Mendoza",
      emergencyPhone: "+52 33 5432-1098",
      education: "Lic. en Educación Física",
      certifications: ["Yoga", "Aqua Aeróbicos", "Primeros Auxilios"],
      skills: ["Enseñanza", "Motivación", "Deportes Acuáticos"],
      workSchedule: "Lunes a Domingo Variable"
    }
  ];

  const departments = [
    "Eventos y Actividades",
    "Mantenimiento", 
    "Administración",
    "Seguridad",
    "Recursos Humanos",
    "Finanzas"
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'vacation': return 'Vacaciones';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewEmployeeOpen(true);
  };

  // Estadísticas generales
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onVacation: employees.filter(e => e.status === 'vacation').length,
    avgSalary: employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Personal
              </h1>
              <p className="text-gray-600">
                Administración integral de empleados y recursos humanos
              </p>
            </div>
          </div>

          <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete la información básica del nuevo empleado
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Ej: María Elena González"
                    value={newEmployeeData.fullName}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="maria@parques.mx"
                    value={newEmployeeData.email}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="+52 33 1234-5678"
                    value={newEmployeeData.phone}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Puesto</Label>
                  <Input 
                    id="position" 
                    placeholder="Coordinadora de Eventos"
                    value={newEmployeeData.position}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select 
                    value={newEmployeeData.department} 
                    onValueChange={(value) => setNewEmployeeData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario Mensual *</Label>
                  <Input 
                    id="salary" 
                    type="number" 
                    placeholder="25000"
                    value={newEmployeeData.salary}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, salary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Fecha de Contratación</Label>
                  <Input 
                    id="hireDate" 
                    type="date"
                    value={newEmployeeData.hireDate}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Educación</Label>
                  <Input 
                    id="education" 
                    placeholder="Lic. en Administración"
                    value={newEmployeeData.education}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, education: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input 
                    id="address" 
                    placeholder="Col. Americana, Guadalajara, Jal."
                    value={newEmployeeData.address}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input 
                    id="emergencyContact" 
                    placeholder="Pedro González"
                    value={newEmployeeData.emergencyContact}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input 
                    id="emergencyPhone" 
                    placeholder="+52 33 8765-4321"
                    value={newEmployeeData.emergencyPhone}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateEmployee}
                  disabled={createEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending ? "Registrando..." : "Registrar Empleado"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Total
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Empleados Totales</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Activos
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Empleados Activos</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.active}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  Vacaciones
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">En Vacaciones</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.onVacation}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  Promedio
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">Salario Promedio</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.avgSalary)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Empleados</TabsTrigger>
            <TabsTrigger value="directory">Directorio</TabsTrigger>
            <TabsTrigger value="organigram">Organigrama</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nombre, email o puesto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="vacation">Vacaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de empleados */}
            <Card>
              <CardHeader>
                <CardTitle>Empleados ({filteredEmployees.length})</CardTitle>
                <CardDescription>
                  Lista completa de empleados con información básica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{employee.fullName}</h3>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                          <p className="text-xs text-gray-500">{employee.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="text-sm font-medium">{formatCurrency(employee.salary)}</div>
                          <div className="text-xs text-gray-500">
                            Desde {new Date(employee.hireDate).toLocaleDateString('es-MX')}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={getStatusColor(employee.status)}>
                          {getStatusText(employee.status)}
                        </Badge>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewEmployee(employee)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <h3 className="font-medium text-gray-900">{employee.fullName}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <Badge variant="outline" className={`${getStatusColor(employee.status)} mt-2`}>
                        {getStatusText(employee.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{employee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{employee.education}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-1" />
                          Contactar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewEmployee(employee)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="organigram">
            <Card>
              <CardHeader>
                <CardTitle>Organigrama Institucional</CardTitle>
                <CardDescription>
                  Estructura jerárquica de la organización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  {/* Organigrama gráfico */}
                  <div className="min-w-[800px] p-6">
                    {/* Director General */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg min-w-[200px] text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold mx-auto mb-2">
                          DG
                        </div>
                        <h3 className="font-bold">Director General</h3>
                        <p className="text-sm opacity-90">Administración General</p>
                      </div>
                      
                      {/* Línea vertical */}
                      <div className="w-0.5 h-8 bg-gray-300"></div>
                    </div>

                    {/* Subdirectores */}
                    <div className="flex justify-center mb-8">
                      <div className="grid grid-cols-2 gap-12">
                        {/* Subdirector Operaciones */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg shadow-md min-w-[180px] text-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold mx-auto mb-2">
                              SO
                            </div>
                            <h4 className="font-semibold">Subdirector Operaciones</h4>
                            <p className="text-xs opacity-90">Coordinación Operativa</p>
                          </div>
                          
                          {/* Línea vertical */}
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                        </div>

                        {/* Subdirector Administrativo */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg shadow-md min-w-[180px] text-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold mx-auto mb-2">
                              SA
                            </div>
                            <h4 className="font-semibold">Subdirector Administrativo</h4>
                            <p className="text-xs opacity-90">Gestión Administrativa</p>
                          </div>
                          
                          {/* Línea vertical */}
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>

                    {/* Líneas horizontales conectoras */}
                    <div className="flex justify-center mb-6">
                      <div className="relative w-[300px]">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-300"></div>
                        <div className="h-0.5 bg-gray-300 w-full"></div>
                        <div className="absolute top-0 left-0 w-0.5 h-6 bg-gray-300"></div>
                        <div className="absolute top-0 right-0 w-0.5 h-6 bg-gray-300"></div>
                      </div>
                    </div>

                    {/* Jefes de Departamento */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Eventos y Actividades */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500 text-white p-3 rounded-lg shadow min-w-[160px] text-center mb-4">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mx-auto mb-2 text-sm">
                            MG
                          </div>
                          <h5 className="font-medium text-sm">María Elena González</h5>
                          <p className="text-xs opacity-90">Coord. Eventos</p>
                          <Badge variant="secondary" className="mt-1 text-xs">25 empleados</Badge>
                        </div>

                        {/* Empleados del departamento */}
                        <div className="space-y-2 w-full">
                          {employees.filter(e => e.department === "Eventos y Actividades").slice(1).map(employee => (
                            <div key={employee.id} className="bg-blue-50 p-2 rounded text-center">
                              <div className="text-xs font-medium text-blue-800">{employee.fullName}</div>
                              <div className="text-xs text-blue-600">{employee.position}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mantenimiento */}
                      <div className="flex flex-col items-center">
                        <div className="bg-green-500 text-white p-3 rounded-lg shadow min-w-[160px] text-center mb-4">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 font-bold mx-auto mb-2 text-sm">
                            CM
                          </div>
                          <h5 className="font-medium text-sm">Carlos Alberto Martínez</h5>
                          <p className="text-xs opacity-90">Jefe Mantenimiento</p>
                          <Badge variant="secondary" className="mt-1 text-xs">32 empleados</Badge>
                        </div>

                        {/* Empleados del departamento */}
                        <div className="space-y-2 w-full">
                          {employees.filter(e => e.department === "Mantenimiento").slice(1).map(employee => (
                            <div key={employee.id} className="bg-green-50 p-2 rounded text-center">
                              <div className="text-xs font-medium text-green-800">{employee.fullName}</div>
                              <div className="text-xs text-green-600">{employee.position}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Administración */}
                      <div className="flex flex-col items-center">
                        <div className="bg-purple-500 text-white p-3 rounded-lg shadow min-w-[160px] text-center mb-4">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold mx-auto mb-2 text-sm">
                            AR
                          </div>
                          <h5 className="font-medium text-sm">Ana Patricia Rodríguez</h5>
                          <p className="text-xs opacity-90">Esp. Finanzas</p>
                          <Badge variant="secondary" className="mt-1 text-xs">18 empleados</Badge>
                        </div>

                        {/* Empleados del departamento */}
                        <div className="space-y-2 w-full">
                          {employees.filter(e => e.department === "Administración").slice(1).map(employee => (
                            <div key={employee.id} className="bg-purple-50 p-2 rounded text-center">
                              <div className="text-xs font-medium text-purple-800">{employee.fullName}</div>
                              <div className="text-xs text-purple-600">{employee.position}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seguridad */}
                      <div className="flex flex-col items-center">
                        <div className="bg-red-500 text-white p-3 rounded-lg shadow min-w-[160px] text-center mb-4">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 font-bold mx-auto mb-2 text-sm">
                            RJ
                          </div>
                          <h5 className="font-medium text-sm">Roberto Jiménez Silva</h5>
                          <p className="text-xs opacity-90">Coord. Seguridad</p>
                          <Badge variant="secondary" className="mt-1 text-xs">22 empleados</Badge>
                        </div>

                        {/* Empleados del departamento */}
                        <div className="space-y-2 w-full">
                          {employees.filter(e => e.department === "Seguridad").slice(1).map(employee => (
                            <div key={employee.id} className="bg-red-50 p-2 rounded text-center">
                              <div className="text-xs font-medium text-red-800">{employee.fullName}</div>
                              <div className="text-xs text-red-600">{employee.position}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Leyenda */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Leyenda del Organigrama</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded"></div>
                          <span>Dirección General</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded"></div>
                          <span>Subdirección Operativa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                          <span>Subdirección Administrativa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span>Jefaturas de Departamento</span>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas organizacionales */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                        <div className="text-sm text-blue-800">Total Empleados</div>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{departments.length}</div>
                        <div className="text-sm text-green-800">Departamentos</div>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">5</div>
                        <div className="text-sm text-purple-800">Niveles Jerárquicos</div>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">1:7</div>
                        <div className="text-sm text-orange-800">Ratio Supervisión</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de visualización de empleado */}
        <Dialog open={isViewEmployeeOpen} onOpenChange={setIsViewEmployeeOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedEmployee && (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{selectedEmployee.fullName}</div>
                      <div className="text-sm text-gray-600 font-normal">{selectedEmployee.position}</div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedEmployee.status)}>
                      {getStatusText(selectedEmployee.status)}
                    </Badge>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedEmployee && (
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Correo Electrónico</div>
                          <div className="font-medium">{selectedEmployee.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Teléfono</div>
                          <div className="font-medium">{selectedEmployee.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Dirección</div>
                          <div className="font-medium">{selectedEmployee.address}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información Laboral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Departamento</div>
                          <div className="font-medium">{selectedEmployee.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Puesto</div>
                          <div className="font-medium">{selectedEmployee.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Fecha de Contratación</div>
                          <div className="font-medium">{new Date(selectedEmployee.hireDate).toLocaleDateString('es-MX')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Salario Mensual</div>
                          <div className="font-medium text-green-600">{formatCurrency(selectedEmployee.salary)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contacto de emergencia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Nombre</div>
                        <div className="font-medium">{selectedEmployee.emergencyContact}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Teléfono</div>
                        <div className="font-medium">{selectedEmployee.emergencyPhone}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Educación y competencias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Educación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                        <div className="font-medium">{selectedEmployee.education}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Horario de Trabajo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div className="font-medium">{selectedEmployee.workSchedule}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Certificaciones y habilidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Certificaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Habilidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
                  </Button>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EmployeesManagement;