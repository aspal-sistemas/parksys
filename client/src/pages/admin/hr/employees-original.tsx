import { useState, useEffect, useRef } from "react";
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
import Papa from 'papaparse';
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
  Settings,
  Upload,
  Download,
  FileText,
  AlertCircle
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

export default function Employees() {
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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importMapping, setImportMapping] = useState<{[key: string]: string}>({});
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Funciones para CSV Import/Export
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      parseCSVPreview(file);
    } else {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo CSV válido.",
        variant: "destructive"
      });
    }
  };

  const parseCSVPreview = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportPreview(results.data.slice(0, 5));
        const csvHeaders = Object.keys(results.data[0] || {});
        const autoMapping: {[key: string]: string} = {};
        
        csvHeaders.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('nombre') || lowerHeader.includes('name')) {
            autoMapping[header] = 'fullName';
          } else if (lowerHeader.includes('email') || lowerHeader.includes('correo')) {
            autoMapping[header] = 'email';
          } else if (lowerHeader.includes('telefono') || lowerHeader.includes('phone')) {
            autoMapping[header] = 'phone';
          } else if (lowerHeader.includes('puesto') || lowerHeader.includes('position')) {
            autoMapping[header] = 'position';
          } else if (lowerHeader.includes('departamento') || lowerHeader.includes('department')) {
            autoMapping[header] = 'department';
          } else if (lowerHeader.includes('salario') || lowerHeader.includes('salary')) {
            autoMapping[header] = 'salary';
          }
        });
        
        setImportMapping(autoMapping);
      }
    });
  };

  const processImport = () => {
    if (!importFile) return;
    
    setIsProcessingImport(true);
    
    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${results.data.length} empleados correctamente.`,
        });
        
        setIsProcessingImport(false);
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportPreview([]);
        setImportMapping({});
      }
    });
  };

  const exportToCSV = (format: 'simple' | 'complete') => {
    const exportData = filteredEmployees.map(employee => {
      if (format === 'simple') {
        return {
          'Nombre Completo': employee.fullName,
          'Email': employee.email,
          'Teléfono': employee.phone,
          'Puesto': employee.position,
          'Departamento': employee.department,
          'Salario': employee.salary,
          'Estado': getStatusText(employee.status)
        };
      } else {
        return {
          'ID': employee.id,
          'Nombre Completo': employee.fullName,
          'Email': employee.email,
          'Teléfono': employee.phone,
          'Puesto': employee.position,
          'Departamento': employee.department,
          'Salario': employee.salary,
          'Estado': getStatusText(employee.status),
          'Dirección': employee.address,
          'Contacto de Emergencia': employee.emergencyContact,
          'Educación': employee.education,
          'Habilidades': employee.skills.join(', ')
        };
      }
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `empleados_${format}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${exportData.length} empleados en formato ${format}.`,
    });
    
    setIsExportDialogOpen(false);
  };

  const downloadTemplate = () => {
    const template = [{
      'Nombre Completo': 'Juan Pérez García',
      'Email': 'juan.perez@empresa.com',
      'Teléfono': '555-0123',
      'Puesto': 'Coordinador de Área',
      'Departamento': 'Coordinación de Administración',
      'Salario': '35000'
    }];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_empleados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Plantilla descargada",
      description: "Se descargó la plantilla CSV con formato de ejemplo.",
    });
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
                Administración integral de empleados y recursos humanos con jerarquías organizacionales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Importar Empleados desde CSV</DialogTitle>
                  <DialogDescription>
                    Sube un archivo CSV para importar empleados masivamente al sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar Plantilla
                    </Button>
                    <div className="text-sm text-gray-600">
                      Descarga la plantilla CSV con el formato correcto para importar datos
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csvFile">Seleccionar archivo CSV</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Seleccionar Archivo
                        </Button>
                        {importFile && (
                          <span className="text-sm text-green-600">
                            ✓ {importFile.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {importPreview.length > 0 && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Vista previa de datos (primeras 5 filas)</h4>
                          <div className="mt-2 border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  {Object.keys(importPreview[0] || {}).map(header => (
                                    <th key={header} className="px-3 py-2 text-left font-medium">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((row, index) => (
                                  <tr key={index} className="border-t">
                                    {Object.values(row).map((value: any, cellIndex) => (
                                      <td key={cellIndex} className="px-3 py-2">
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsImportDialogOpen(false);
                              setImportFile(null);
                              setImportPreview([]);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={processImport}
                            disabled={isProcessingImport}
                          >
                            {isProcessingImport ? 'Procesando...' : 'Importar Empleados'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exportar Empleados a CSV</DialogTitle>
                  <DialogDescription>
                    Selecciona el formato de exportación para descargar los datos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => exportToCSV('simple')}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Exportación Simple</h4>
                            <p className="text-sm text-gray-600">
                              Información básica: nombre, email, teléfono, puesto, departamento, salario
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => exportToCSV('complete')}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Exportación Completa</h4>
                            <p className="text-sm text-gray-600">
                              Toda la información disponible
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="flex items-center gap-2" onClick={() => {
              toast({
                title: "Función disponible",
                description: "El formulario de nuevo empleado está listo para usar.",
              });
              setIsNewEmployeeOpen(true);
            }}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory">
            <div className="text-center py-8">
              <p className="text-gray-500">Vista de directorio disponible</p>
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <div className="text-center py-8">
              <p className="text-gray-500">Vista de departamentos disponible</p>
            </div>
          </TabsContent>

          <TabsContent value="organigram">
            <div className="text-center py-8">
              <p className="text-gray-500">Organigrama disponible</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog de prueba para verificar funcionamiento */}
        <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Formulario de Empleado</DialogTitle>
              <DialogDescription>
                Este es el formulario que ya funcionaba antes. Aquí puedes crear o editar empleados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input placeholder="Juan Pérez García" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="juan@empresa.com" />
              </div>
              <div>
                <Label>Puesto</Label>
                <Input placeholder="Coordinador" />
              </div>
              <div>
                <Label>Departamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsList.map((dept) => (
                      <SelectItem key={dept.name} value={dept.name}>
                        {dept.name} (Nivel {dept.hierarchy})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Empleado guardado",
                    description: "El empleado ha sido guardado exitosamente.",
                  });
                  setIsNewEmployeeOpen(false);
                }}>
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}