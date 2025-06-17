import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Settings
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

interface Department {
  name: string;
  hierarchy: number;
}

export default function EmployeesFixed() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  
  const [departmentsList, setDepartmentsList] = useState<Department[]>([
    { name: "Dirección General", hierarchy: 1 },
    { name: "Asistencia de Dirección", hierarchy: 2 },
    { name: "Secretaría Ejecutiva", hierarchy: 2 },
    { name: "Coordinación de Administración", hierarchy: 3 },
    { name: "Coordinación de Eventos y Actividades", hierarchy: 3 },
    { name: "Coordinación de Mantenimiento", hierarchy: 3 },
    { name: "Coordinación de Seguridad", hierarchy: 3 },
    { name: "Coordinación de Recursos Humanos", hierarchy: 3 },
    { name: "Coordinación de Finanzas", hierarchy: 3 },
    { name: "Área de Contabilidad", hierarchy: 4 },
    { name: "Área de Sistemas", hierarchy: 4 },
    { name: "Área de Compras", hierarchy: 4 },
    { name: "Personal Operativo", hierarchy: 5 }
  ]);
  
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentHierarchy, setNewDepartmentHierarchy] = useState(3);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Funciones para gestión de departamentos
  const handleAddDepartment = () => {
    if (newDepartmentName.trim() && !departmentsList.find(dept => dept.name === newDepartmentName.trim())) {
      setDepartmentsList([...departmentsList, { 
        name: newDepartmentName.trim(), 
        hierarchy: newDepartmentHierarchy 
      }]);
      setNewDepartmentName("");
      setNewDepartmentHierarchy(3);
      toast({
        title: "Departamento agregado",
        description: `${newDepartmentName} (Jerarquía ${newDepartmentHierarchy}) ha sido agregado exitosamente.`,
      });
    }
  };

  const handleEditDepartment = (oldDept: Department, newName: string, newHierarchy: number) => {
    if (newName.trim() && !departmentsList.find(dept => dept.name === newName.trim() && dept.name !== oldDept.name)) {
      setDepartmentsList(departmentsList.map(dept => 
        dept.name === oldDept.name ? { name: newName.trim(), hierarchy: newHierarchy } : dept
      ));
      setEditingDepartment(null);
      toast({
        title: "Departamento actualizado",
        description: `Departamento actualizado a ${newName} (Jerarquía ${newHierarchy}).`,
      });
    }
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentsList(departmentsList.filter(dept => dept.name !== department.name));
    toast({
      title: "Departamento eliminado",
      description: `${department.name} ha sido eliminado.`,
      variant: "destructive"
    });
  };

  // Empleados de muestra
  const employees: Employee[] = [
    {
      id: 1,
      fullName: "Ana María González",
      email: "ana.gonzalez@parques.mx",
      phone: "555-0101",
      position: "Director General",
      department: "Dirección General",
      hireDate: "2022-01-15",
      salary: 85000,
      status: "active",
      profileImage: "",
      address: "Av. Reforma 123, CDMX",
      emergencyContact: "Carlos González",
      emergencyPhone: "555-0102",
      education: "Maestría en Administración Pública",
      certifications: ["Gestión Pública", "Liderazgo"],
      skills: ["Liderazgo", "Planificación estratégica", "Gestión pública"],
      workSchedule: "Lunes a Viernes 8:00-17:00"
    },
    {
      id: 2,
      fullName: "Roberto Martínez Silva",
      email: "roberto.martinez@parques.mx",
      phone: "555-0103",
      position: "Coordinador de Mantenimiento",
      department: "Coordinación de Mantenimiento",
      hireDate: "2022-03-10",
      salary: 45000,
      status: "active",
      profileImage: "",
      address: "Calle Norte 456, CDMX",
      emergencyContact: "María Martínez",
      emergencyPhone: "555-0104",
      education: "Ingeniería Civil",
      certifications: ["Project Management", "Seguridad Industrial"],
      skills: ["Gestión de proyectos", "Supervisión", "Mantenimiento"],
      workSchedule: "Lunes a Sábado 7:00-15:00"
    },
    {
      id: 3,
      fullName: "Carmen López Hernández",
      email: "carmen.lopez@parques.mx",
      phone: "555-0105",
      position: "Especialista en Recursos Humanos",
      department: "Coordinación de Recursos Humanos",
      hireDate: "2022-06-20",
      salary: 38000,
      status: "active",
      profileImage: "",
      address: "Col. Centro 789, CDMX",
      emergencyContact: "Luis López",
      emergencyPhone: "555-0106",
      education: "Licenciatura en Psicología",
      certifications: ["Recursos Humanos", "Capacitación"],
      skills: ["Reclutamiento", "Capacitación", "Relaciones laborales"],
      workSchedule: "Lunes a Viernes 9:00-18:00"
    }
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewEmployeeOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsNewEmployeeOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    const confirmDelete = window.confirm(
      `⚠️ ADVERTENCIA: Esta acción no se puede deshacer.\n\n¿Estás seguro de que deseas eliminar permanentemente a ${employee.fullName}?\n\nEsta acción eliminará:\n- Todos los datos del empleado\n- Su historial laboral\n- Sus asignaciones actuales\n\nEscribe "ELIMINAR" para confirmar.`
    );
    
    if (confirmDelete) {
      const confirmation = window.prompt(
        `Para confirmar la eliminación de ${employee.fullName}, escribe exactamente: ELIMINAR`
      );
      
      if (confirmation === "ELIMINAR") {
        toast({
          title: "Empleado eliminado",
          description: `${employee.fullName} ha sido eliminado permanentemente del sistema.`,
          variant: "destructive"
        });
        console.log(`Empleado ${employee.id} - ${employee.fullName} eliminado`);
      } else if (confirmation !== null) {
        toast({
          title: "Eliminación cancelada",
          description: "La confirmación no coincide. El empleado no fue eliminado.",
          variant: "default"
        });
      }
    }
  };

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

  // Organizar empleados por jerarquía para el organigrama
  const organizeByHierarchy = () => {
    const organized: { [key: number]: Employee[] } = {};
    
    employees.forEach(employee => {
      const dept = departmentsList.find(d => d.name === employee.department);
      const hierarchy = dept?.hierarchy || 5;
      
      if (!organized[hierarchy]) {
        organized[hierarchy] = [];
      }
      organized[hierarchy].push(employee);
    });
    
    return organized;
  };

  const hierarchyData = organizeByHierarchy();

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
                Administración integral de empleados y recursos humanos con jerarquías organizacionales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Gestionar Departamentos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestión de Departamentos Jerárquicos</DialogTitle>
                  <DialogDescription>
                    Administra los departamentos con sus niveles de jerarquía organizacional (1-5)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label htmlFor="departmentName">Nombre del Departamento</Label>
                      <Input
                        id="departmentName"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        placeholder="Ej: Coordinación de Marketing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hierarchy">Nivel de Jerarquía</Label>
                      <Select value={newDepartmentHierarchy.toString()} onValueChange={(value) => setNewDepartmentHierarchy(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Nivel 1 - Dirección General</SelectItem>
                          <SelectItem value="2">Nivel 2 - Asistencias/Secretarías</SelectItem>
                          <SelectItem value="3">Nivel 3 - Coordinaciones</SelectItem>
                          <SelectItem value="4">Nivel 4 - Áreas/Departamentos</SelectItem>
                          <SelectItem value="5">Nivel 5 - Personal Operativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddDepartment} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Departamentos por Jerarquía</h3>
                    {[1, 2, 3, 4, 5].map(level => (
                      <div key={level} className="space-y-2">
                        <h4 className="font-medium text-gray-700 border-b pb-1">
                          Nivel {level} - {level === 1 ? "Dirección General" : level === 2 ? "Asistencias/Secretarías" : level === 3 ? "Coordinaciones" : level === 4 ? "Áreas/Departamentos" : "Personal Operativo"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {departmentsList
                            .filter(dept => dept.hierarchy === level)
                            .map((department) => (
                              <div key={department.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gray-500" />
                                  {editingDepartment?.name === department.name ? (
                                    <div className="flex gap-2">
                                      <Input
                                        value={newDepartmentName}
                                        onChange={(e) => setNewDepartmentName(e.target.value)}
                                        className="h-6 text-sm"
                                        autoFocus
                                      />
                                      <Select value={newDepartmentHierarchy.toString()} onValueChange={(value) => setNewDepartmentHierarchy(Number(value))}>
                                        <SelectTrigger className="h-6 text-sm w-20">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1</SelectItem>
                                          <SelectItem value="2">2</SelectItem>
                                          <SelectItem value="3">3</SelectItem>
                                          <SelectItem value="4">4</SelectItem>
                                          <SelectItem value="5">5</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button size="sm" onClick={() => handleEditDepartment(department, newDepartmentName, newDepartmentHierarchy)}>
                                        Guardar
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-sm font-medium">{department.name}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingDepartment(department);
                                      setNewDepartmentName(department.name);
                                      setNewDepartmentHierarchy(department.hierarchy);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDepartment(department)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="flex items-center gap-2" onClick={() => setIsNewEmployeeOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                  <div className="text-sm text-blue-800">Total Empleados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{departmentsList.length}</div>
                  <div className="text-sm text-green-800">Departamentos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-purple-800">Niveles Jerárquicos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length)}
                  </div>
                  <div className="text-sm text-orange-800">Salario Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Lista de Empleados</TabsTrigger>
            <TabsTrigger value="directory">Directorio</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="organigram">Organigrama</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Nombre, email o puesto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
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
                        {departmentsList.map((dept) => (
                          <SelectItem key={dept.name} value={dept.name}>
                            {dept.name} (Nivel {dept.hierarchy})
                          </SelectItem>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empleados ({filteredEmployees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {employee.fullName.split(' ').map((name: string) => name[0]).join('').substring(0, 2)}
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
                          <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {filteredEmployees.length > 0 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-700 font-medium">
                      Mostrando {((currentPage - 1) * recordsPerPage) + 1} a {Math.min(currentPage * recordsPerPage, filteredEmployees.length)} de {filteredEmployees.length} empleados
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page = i + 1;
                            if (totalPages > 5) {
                              if (currentPage > 3) {
                                page = currentPage - 2 + i;
                              }
                              if (currentPage > totalPages - 2) {
                                page = totalPages - 4 + i;
                              }
                            }
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                        {employee.fullName.split(' ').map((name: string) => name[0]).join('').substring(0, 2)}
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
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{formatCurrency(employee.salary)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Desde {new Date(employee.hireDate).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{employee.education}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => {
                          toast({
                            title: "Función en desarrollo",
                            description: `Funcionalidad de mensajería para ${employee.fullName} estará disponible pronto.`,
                            variant: "default"
                          });
                        }}>
                          <Mail className="h-4 w-4 mr-1" />
                          Contactar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewEmployee(employee)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Vista de Departamentos por Jerarquía
                </CardTitle>
                <CardDescription>
                  Visualización organizada de todos los departamentos según su nivel jerárquico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map(level => {
                    const levelDepartments = departmentsList.filter(dept => dept.hierarchy === level);
                    const levelName = level === 1 ? "Dirección General" : 
                                    level === 2 ? "Asistencias/Secretarías" : 
                                    level === 3 ? "Coordinaciones" : 
                                    level === 4 ? "Áreas/Departamentos" : 
                                    "Personal Operativo";
                    
                    if (levelDepartments.length === 0) return null;
                    
                    return (
                      <div key={level} className="space-y-3">
                        <div className="flex items-center gap-3 pb-2 border-b">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            level === 1 ? 'bg-purple-600' : 
                            level === 2 ? 'bg-blue-600' : 
                            level === 3 ? 'bg-green-600' : 
                            level === 4 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {level}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Nivel {level} - {levelName}
                          </h3>
                          <Badge variant="secondary" className="ml-auto">
                            {levelDepartments.length} departamento{levelDepartments.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {levelDepartments.map((department) => {
                            const employeeCount = employees.filter(emp => emp.department === department.name).length;
                            return (
                              <Card key={department.name} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                        level === 1 ? 'bg-purple-100' : 
                                        level === 2 ? 'bg-blue-100' : 
                                        level === 3 ? 'bg-green-100' : 
                                        level === 4 ? 'bg-orange-100' : 'bg-gray-100'
                                      }`}>
                                        <Building className={`h-6 w-6 ${
                                          level === 1 ? 'text-purple-600' : 
                                          level === 2 ? 'text-blue-600' : 
                                          level === 3 ? 'text-green-600' : 
                                          level === 4 ? 'text-orange-600' : 'text-gray-600'
                                        }`} />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">{department.name}</h4>
                                        <p className="text-sm text-gray-500">
                                          {employeeCount} empleado{employeeCount !== 1 ? 's' : ''}
                                        </p>
                                        <Badge variant="outline" size="sm" className="mt-1">
                                          Nivel {department.hierarchy}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {employeeCount > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                      <p className="text-xs text-gray-600 mb-2">Personal asignado:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {employees
                                          .filter(emp => emp.department === department.name)
                                          .slice(0, 3)
                                          .map((emp, idx) => (
                                            <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                              {emp.fullName.split(' ')[0]} {emp.fullName.split(' ')[1]?.[0]}.
                                            </div>
                                          ))}
                                        {employeeCount > 3 && (
                                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            +{employeeCount - 3} más
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organigram">
            <Card>
              <CardHeader>
                <CardTitle>Organigrama Institucional por Jerarquías</CardTitle>
                <CardDescription>
                  Estructura organizacional automática basada en niveles jerárquicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map(level => {
                    const levelEmployees = hierarchyData[level] || [];
                    const levelName = level === 1 ? "Dirección General" : 
                                    level === 2 ? "Asistencias/Secretarías" : 
                                    level === 3 ? "Coordinaciones" : 
                                    level === 4 ? "Áreas/Departamentos" : 
                                    "Personal Operativo";
                    
                    if (levelEmployees.length === 0) return null;
                    
                    return (
                      <div key={level} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            level === 1 ? 'bg-purple-600' : 
                            level === 2 ? 'bg-blue-600' : 
                            level === 3 ? 'bg-green-600' : 
                            level === 4 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {level}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Nivel {level} - {levelName}
                          </h3>
                        </div>
                        
                        <div className={`grid gap-4 ${level === 1 ? 'grid-cols-1 justify-center' : 
                                       level === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {levelEmployees.map((employee) => (
                            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 ${
                                    level === 1 ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 
                                    level === 2 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 
                                    level === 3 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 
                                    level === 4 ? 'bg-gradient-to-r from-orange-600 to-red-600' : 
                                    'bg-gradient-to-r from-gray-600 to-slate-600'
                                  }`}>
                                    {employee.fullName.split(' ').map((name: string) => name[0]).join('').substring(0, 2)}
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{employee.fullName}</h4>
                                  <p className="text-sm text-gray-600">{employee.position}</p>
                                  <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
                                  <Badge variant="outline" className={`${getStatusColor(employee.status)} mt-2`}>
                                    {getStatusText(employee.status)}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
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
      </div>
    </AdminLayout>
  );
}