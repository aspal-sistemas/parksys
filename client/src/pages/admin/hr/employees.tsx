import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Eye,
  Building,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hireDate?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'vacation';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  education?: string;
  certifications?: string[];
  skills?: string[];
  workSchedule?: string;
  employeeCode?: string;
}

interface Department {
  name: string;
  hierarchy: number;
}

export default function Employees() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;
  
  const [departmentsList] = useState<Department[]>([
    { name: "Dirección General", hierarchy: 1 },
    { name: "Coordinación de Administración", hierarchy: 3 },
    { name: "Coordinación de Recursos Humanos", hierarchy: 3 },
    { name: "Coordinación de Mantenimiento", hierarchy: 3 },
    { name: "Coordinación de Seguridad", hierarchy: 3 }
  ]);

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const response = await fetch('/api/hr/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los empleados",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        toast({
          title: "Error",
          description: "Error al conectar con el servidor",
          variant: "destructive"
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [toast]);

  // Filter employees
  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + recordsPerPage);

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

  // Nuevo empleado
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isDeleteEmployeeOpen, setIsDeleteEmployeeOpen] = useState(false);
  
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    workSchedule: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    education: '',
    status: 'active'
  });

  const handleCreateEmployee = async () => {
    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployeeForm)
      });

      if (response.ok) {
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido registrado exitosamente"
        });
        setIsCreateEmployeeOpen(false);
        setNewEmployeeForm({
          fullName: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          salary: '',
          hireDate: '',
          workSchedule: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
          education: '',
          status: 'active'
        });
        // Recargar empleados
        const loadResponse = await fetch('/api/hr/employees');
        if (loadResponse.ok) {
          const data = await loadResponse.json();
          setEmployees(data);
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el empleado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployeeForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary?.toString() || '',
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      workSchedule: employee.workSchedule || '',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      education: employee.education || '',
      status: employee.status
    });
    setIsEditEmployeeOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployeeForm)
      });

      if (response.ok) {
        toast({
          title: "Empleado actualizado",
          description: "Los datos del empleado han sido actualizados"
        });
        setIsEditEmployeeOpen(false);
        // Recargar empleados
        const loadResponse = await fetch('/api/hr/employees');
        if (loadResponse.ok) {
          const data = await loadResponse.json();
          setEmployees(data);
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el empleado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === 'deactivated') {
          const reasonText = data.reason || "tener registros relacionados";
          const details = data.relationDetails ? data.relationDetails.join(', ') : '';
          
          toast({
            title: "Empleado desactivado",
            description: `El empleado ha sido desactivado por ${reasonText}${details ? `. Tiene: ${details}` : ''}`
          });
        } else {
          toast({
            title: "Empleado eliminado",
            description: "El empleado ha sido eliminado del sistema"
          });
        }
        setIsDeleteEmployeeOpen(false);
        // Recargar empleados
        const loadResponse = await fetch('/api/hr/employees');
        if (loadResponse.ok) {
          const employeesData = await loadResponse.json();
          setEmployees(employeesData);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar el empleado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-black" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Personal
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button onClick={() => {
                  // Limpiar formulario antes de abrir modal nuevo
                  setNewEmployeeForm({
                    fullName: '',
                    email: '',
                    phone: '',
                    position: '',
                    department: '',
                    salary: '',
                    hireDate: '',
                    workSchedule: '',
                    address: '',
                    emergencyContact: '',
                    emergencyPhone: '',
                    education: '',
                    status: 'active'
                  });
                  setIsCreateEmployeeOpen(true);
                }} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nuevo Empleado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
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
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {employees.filter(emp => emp.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-800">Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {employees.filter(emp => emp.status === 'vacation').length}
                  </div>
                  <div className="text-sm text-yellow-800">Vacaciones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {employees.filter(emp => emp.status === 'inactive').length}
                  </div>
                  <div className="text-sm text-red-800">Inactivos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar empleados por nombre, email, departamento o puesto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Empleados</TabsTrigger>
            <TabsTrigger value="directory">Directorio</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Empleados ({filteredEmployees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingEmployees ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Cargando empleados...</div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedEmployees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold">
                              {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{employee.fullName}</p>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                              <p className="text-sm text-gray-500">{employee.department}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(employee.salary)}</p>
                              <Badge variant={employee.status === 'active' ? 'default' : employee.status === 'vacation' ? 'secondary' : 'destructive'}>
                                {employee.status === 'active' ? 'Activo' : employee.status === 'vacation' ? 'Vacaciones' : 'Inactivo'}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleViewEmployee(employee)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsDeleteEmployeeOpen(true);
                                }}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                          Mostrando {startIndex + 1} a {Math.min(startIndex + recordsPerPage, filteredEmployees.length)} de {filteredEmployees.length} empleados
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                            if (pageNum > totalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                size="sm"
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Directorio por Departamentos</CardTitle>
                <CardDescription>
                  Vista organizada por departamentos y jerarquías
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departmentsList.map((dept) => {
                    const deptEmployees = employees.filter(emp => emp.department === dept.name);
                    return (
                      <Card key={dept.name} className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5" />
                              {dept.name}
                            </div>
                            <Badge variant="outline">
                              Nivel {dept.hierarchy} • {deptEmployees.length} empleados
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deptEmployees.map((employee) => (
                              <div key={employee.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{employee.fullName}</p>
                                    <p className="text-sm text-gray-600">{employee.position}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    <span className="text-xs">{employee.email}</span>
                                  </div>
                                  {employee.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      <span className="text-xs">{employee.phone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                  <Badge variant={employee.status === 'active' ? 'default' : employee.status === 'vacation' ? 'secondary' : 'destructive'} className="text-xs">
                                    {employee.status === 'active' ? 'Activo' : employee.status === 'vacation' ? 'Vacaciones' : 'Inactivo'}
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleViewEmployee(employee)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Employee Dialog */}
        <Dialog open={isViewEmployeeOpen} onOpenChange={setIsViewEmployeeOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Información del Empleado
              </DialogTitle>
              <DialogDescription>
                Detalles completos del empleado seleccionado
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold">{selectedEmployee.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.email}</span>
                      </div>
                      {selectedEmployee.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedEmployee.phone}</span>
                        </div>
                      )}
                      {selectedEmployee.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedEmployee.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información Laboral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.department}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.position}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatCurrency(selectedEmployee.salary)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Desde {new Date(selectedEmployee.hireDate).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.workSchedule}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedEmployee.emergencyContact}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedEmployee.emergencyPhone}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills and Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Certificaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.certifications?.map((cert, index) => (
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
                        {selectedEmployee.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setIsViewEmployeeOpen(false);
                    handleEditEmployee(selectedEmployee!);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Employee Dialog */}
        <Dialog open={isCreateEmployeeOpen} onOpenChange={setIsCreateEmployeeOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Registra un nuevo empleado en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    value={newEmployeeForm.fullName}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, fullName: e.target.value})}
                    placeholder="Nombre completo del empleado"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, email: e.target.value})}
                    placeholder="correo@parques.guadalajara.gob.mx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, phone: e.target.value})}
                    placeholder="+52 33 1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Puesto *</Label>
                  <Input
                    id="position"
                    value={newEmployeeForm.position}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, position: e.target.value})}
                    placeholder="Director, Coordinador, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Departamento *</Label>
                  <Select value={newEmployeeForm.department} onValueChange={(value) => setNewEmployeeForm({...newEmployeeForm, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dirección General">Dirección General</SelectItem>
                      <SelectItem value="Coordinación de Administración">Coordinación de Administración</SelectItem>
                      <SelectItem value="Coordinación de Recursos Humanos">Coordinación de Recursos Humanos</SelectItem>
                      <SelectItem value="Coordinación de Mantenimiento">Coordinación de Mantenimiento</SelectItem>
                      <SelectItem value="Coordinación de Seguridad">Coordinación de Seguridad</SelectItem>
                      <SelectItem value="Coordinación de Finanzas">Coordinación de Finanzas</SelectItem>
                      <SelectItem value="Coordinación de Eventos y Actividades">Coordinación de Eventos y Actividades</SelectItem>
                      <SelectItem value="Personal Operativo">Personal Operativo</SelectItem>
                      <SelectItem value="Asistencia de Dirección">Asistencia de Dirección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary">Salario Mensual</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployeeForm.salary}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, salary: e.target.value})}
                    placeholder="25000.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hireDate">Fecha de Contratación</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newEmployeeForm.hireDate}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, hireDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={newEmployeeForm.status} onValueChange={(value) => setNewEmployeeForm({...newEmployeeForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="workSchedule">Horario de Trabajo</Label>
                <Input
                  id="workSchedule"
                  value={newEmployeeForm.workSchedule}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, workSchedule: e.target.value})}
                  placeholder="Lunes a Viernes 8:00-16:00"
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newEmployeeForm.address}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, address: e.target.value})}
                  placeholder="Dirección del empleado"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={newEmployeeForm.emergencyContact}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, emergencyContact: e.target.value})}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    value={newEmployeeForm.emergencyPhone}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, emergencyPhone: e.target.value})}
                    placeholder="+52 33 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="education">Educación</Label>
                <Input
                  id="education"
                  value={newEmployeeForm.education}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, education: e.target.value})}
                  placeholder="Licenciatura en..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateEmployeeOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateEmployee}>
                  Crear Empleado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Empleado</DialogTitle>
              <DialogDescription>
                Modifica los datos del empleado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFullName">Nombre Completo *</Label>
                  <Input
                    id="editFullName"
                    value={newEmployeeForm.fullName}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, fullName: e.target.value})}
                    placeholder="Nombre completo del empleado"
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Correo Electrónico *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, email: e.target.value})}
                    placeholder="correo@parques.guadalajara.gob.mx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPhone">Teléfono</Label>
                  <Input
                    id="editPhone"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, phone: e.target.value})}
                    placeholder="+52 33 1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="editPosition">Puesto *</Label>
                  <Input
                    id="editPosition"
                    value={newEmployeeForm.position}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, position: e.target.value})}
                    placeholder="Director, Coordinador, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDepartment">Departamento *</Label>
                  <Select value={newEmployeeForm.department} onValueChange={(value) => setNewEmployeeForm({...newEmployeeForm, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dirección General">Dirección General</SelectItem>
                      <SelectItem value="Coordinación de Administración">Coordinación de Administración</SelectItem>
                      <SelectItem value="Coordinación de Recursos Humanos">Coordinación de Recursos Humanos</SelectItem>
                      <SelectItem value="Coordinación de Mantenimiento">Coordinación de Mantenimiento</SelectItem>
                      <SelectItem value="Coordinación de Seguridad">Coordinación de Seguridad</SelectItem>
                      <SelectItem value="Coordinación de Finanzas">Coordinación de Finanzas</SelectItem>
                      <SelectItem value="Coordinación de Eventos y Actividades">Coordinación de Eventos y Actividades</SelectItem>
                      <SelectItem value="Personal Operativo">Personal Operativo</SelectItem>
                      <SelectItem value="Asistencia de Dirección">Asistencia de Dirección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSalary">Salario Mensual</Label>
                  <Input
                    id="editSalary"
                    type="number"
                    value={newEmployeeForm.salary}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, salary: e.target.value})}
                    placeholder="25000.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editHireDate">Fecha de Contratación</Label>
                  <Input
                    id="editHireDate"
                    type="date"
                    value={newEmployeeForm.hireDate}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, hireDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Estado</Label>
                  <Select value={newEmployeeForm.status} onValueChange={(value) => setNewEmployeeForm({...newEmployeeForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editWorkSchedule">Horario de Trabajo</Label>
                <Input
                  id="editWorkSchedule"
                  value={newEmployeeForm.workSchedule}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, workSchedule: e.target.value})}
                  placeholder="Lunes a Viernes 8:00-16:00"
                />
              </div>

              <div>
                <Label htmlFor="editAddress">Dirección</Label>
                <Input
                  id="editAddress"
                  value={newEmployeeForm.address}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, address: e.target.value})}
                  placeholder="Dirección del empleado"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEmergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="editEmergencyContact"
                    value={newEmployeeForm.emergencyContact}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, emergencyContact: e.target.value})}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <Label htmlFor="editEmergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="editEmergencyPhone"
                    value={newEmployeeForm.emergencyPhone}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, emergencyPhone: e.target.value})}
                    placeholder="+52 33 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editEducation">Educación</Label>
                <Input
                  id="editEducation"
                  value={newEmployeeForm.education}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, education: e.target.value})}
                  placeholder="Licenciatura en..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditEmployeeOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEmployee}>
                  Actualizar Empleado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Employee Dialog */}
        <Dialog open={isDeleteEmployeeOpen} onOpenChange={setIsDeleteEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este empleado del sistema?
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedEmployee.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                  <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">⚠️ Importante</p>
                  <p className="text-yellow-700 text-sm">
                    Si el empleado tiene registros relacionados (nómina, vacaciones, tiempo), será <strong>desactivado</strong> en lugar de eliminado para preservar la integridad de los datos.
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Solo los empleados sin registros relacionados pueden ser eliminados permanentemente.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteEmployeeOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteEmployee}
                  >
                    Eliminar Empleado
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}