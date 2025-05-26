import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Datos de empleados de muestra
  const employees: Employee[] = [
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete la información básica del nuevo empleado
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" placeholder="Ej: María Elena González" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="maria@parques.mx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="+52 33 1234-5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Puesto</Label>
                  <Input id="position" placeholder="Coordinadora de Eventos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select>
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
                  <Label htmlFor="salary">Salario Mensual</Label>
                  <Input id="salary" type="number" placeholder="25000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Fecha de Contratación</Label>
                  <Input id="hireDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Educación</Label>
                  <Input id="education" placeholder="Lic. en Administración" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewEmployeeOpen(false)}>
                  Registrar Empleado
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
                <CardTitle>Organigrama Departamental</CardTitle>
                <CardDescription>
                  Estructura organizacional por departamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departments.map(department => {
                    const deptEmployees = employees.filter(e => e.department === department);
                    if (deptEmployees.length === 0) return null;
                    
                    return (
                      <div key={department} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">{department}</h3>
                          <Badge variant="outline">{deptEmployees.length} empleados</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {deptEmployees.map(employee => (
                            <div key={employee.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{employee.fullName}</h4>
                                <p className="text-xs text-gray-600">{employee.position}</p>
                              </div>
                              <Badge variant="outline" className={getStatusColor(employee.status)}>
                                {getStatusText(employee.status)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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