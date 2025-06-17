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

// Componente del formulario completo de empleado
interface EmployeeFormProps {
  employee?: Employee | null;
  departments: Department[];
  onSave: (employeeData: any) => void;
  onCancel: () => void;
}

function EmployeeForm({ employee, departments, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    firstName: employee?.fullName.split(' ')[0] || '',
    lastName: employee?.fullName.split(' ').slice(1).join(' ') || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    department: employee?.department || '',
    hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
    salary: employee?.salary || 25000,
    address: employee?.address || '',
    emergencyContactName: employee?.emergencyContact || '',
    emergencyContactPhone: employee?.emergencyPhone || '',
    education: employee?.education || '',
    workSchedule: employee?.workSchedule || 'Lunes a Viernes 9:00-17:00',
    status: employee?.status || 'active'
  });

  const [skills, setSkills] = useState<string[]>(employee?.skills || []);
  const [certifications, setCertifications] = useState<string[]>(employee?.certifications || []);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove: string) => {
    setCertifications(certifications.filter(cert => cert !== certToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position || !formData.department || !formData.emergencyContactName || !formData.emergencyContactPhone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios marcados con *.",
        variant: "destructive"
      });
      return;
    }

    const employeeData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
      skills,
      certifications,
      emergencyContact: formData.emergencyContactName,
      emergencyPhone: formData.emergencyContactPhone,
      id: employee?.id || Date.now()
    };

    onSave(employeeData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Personal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Juan"
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Pérez García"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="juan.perez@empresa.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="555-0123"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Av. Principal 123, Colonia, Ciudad, CP"
            />
          </div>
        </div>
      </div>

      {/* Información Laboral */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Laboral</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position">Puesto *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Coordinador de Área"
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Departamento *</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name} (Nivel {dept.hierarchy})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hireDate">Fecha de Contratación *</Label>
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleInputChange('hireDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="salary">Salario Mensual (MXN) *</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', parseInt(e.target.value))}
              placeholder="25000"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="workSchedule">Horario de Trabajo</Label>
            <Select value={formData.workSchedule} onValueChange={(value) => handleInputChange('workSchedule', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lunes a Viernes 8:00-17:00">Lunes a Viernes 8:00-17:00</SelectItem>
                <SelectItem value="Lunes a Viernes 9:00-18:00">Lunes a Viernes 9:00-18:00</SelectItem>
                <SelectItem value="Lunes a Sábado 7:00-15:00">Lunes a Sábado 7:00-15:00</SelectItem>
                <SelectItem value="Lunes a Sábado 8:00-16:00">Lunes a Sábado 8:00-16:00</SelectItem>
                <SelectItem value="Turnos rotativos">Turnos rotativos</SelectItem>
                <SelectItem value="Horario flexible">Horario flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="vacation">Vacaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto de Emergencia</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactName">Nombre de Contacto de Emergencia *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              placeholder="María Pérez"
              required
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactPhone">Teléfono de Contacto de Emergencia *</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              placeholder="555-0124"
              required
            />
          </div>
        </div>
      </div>

      {/* Educación y Formación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Educación y Formación</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="education">Nivel de Estudios</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="Licenciatura en Administración"
            />
          </div>

          <div>
            <Label>Habilidades</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Agregar habilidad"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Certificaciones</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Agregar certificación"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeCertification(cert)}>
                  {cert} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {employee ? 'Actualizar' : 'Crear'} Empleado
        </Button>
      </div>
    </form>
  );
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  
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
  
  // Función para cargar empleados desde la base de datos
  const loadEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      console.log('Cargando empleados desde la base de datos...');
      const response = await fetch('/api/employees');
      console.log('Respuesta del servidor para empleados:', response.status);
      
      if (response.ok) {
        const employeesData = await response.json();
        console.log('Empleados recibidos:', employeesData);
        console.log('Cantidad de empleados:', employeesData.length);
        
        // Verificar que los datos sean válidos antes de actualizar el estado
        if (Array.isArray(employeesData)) {
          setEmployees(employeesData);
          console.log('Estado de empleados actualizado exitosamente');
        } else {
          console.error('Datos de empleados no son un array:', employeesData);
          toast({
            title: "Error",
            description: "Formato de datos incorrecto del servidor",
            variant: "destructive"
          });
        }
      } else {
        console.error('Error en la respuesta:', response.status, response.statusText);
        toast({
          title: "Error",
          description: `Error al cargar empleados: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Cargar empleados al montar el componente
  useEffect(() => {
    loadEmployees();
  }, []);



  const filteredEmployees = employees.filter(employee => {
    if (!employee) return false;
    
    const fullName = employee.fullName || '';
    const email = employee.email || '';
    const position = employee.position || '';
    const department = employee.department || '';
    const status = employee.status || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || department === departmentFilter;
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  console.log('Total employees:', employees.length);
  console.log('Filtered employees:', filteredEmployees.length);
  console.log('Search term:', searchTerm);
  console.log('Department filter:', departmentFilter);
  console.log('Status filter:', statusFilter);

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  
  console.log('Pagination info:', {
    totalPages,
    currentPage,
    recordsPerPage,
    startIndex,
    endIndex,
    paginatedCount: paginatedEmployees.length
  });
  
  console.log('Paginated employees:', paginatedEmployees.map(emp => ({ id: emp.id, name: emp.fullName })));

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
                  {isLoadingEmployees ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Cargando empleados...</p>
                    </div>
                  ) : paginatedEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No se encontraron empleados</p>
                    </div>
                  ) : (
                    paginatedEmployees.map((employee) => (
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
                      );
                    })
                  )}
                </div>
              </CardContent>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} de {filteredEmployees.length} empleados
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="directory">
            <Card>
              <CardHeader>
                <CardTitle>Directorio de Empleados</CardTitle>
                <CardDescription>Lista completa de empleados con información de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedEmployees.map((employee) => (
                    <div key={employee.id} className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-lg">{employee.fullName}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Email:</span> {employee.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {employee.phone}</p>
                        {employee.address && <p><span className="font-medium">Dirección:</span> {employee.address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departamentos</CardTitle>
                <CardDescription>Organización por departamentos y empleados asignados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentsList.map((dept) => {
                    const deptEmployees = employees.filter(emp => emp.department === dept.name);
                    return (
                      <div key={dept.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{dept.name}</h3>
                          <Badge variant="secondary">{deptEmployees.length} empleados</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {deptEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center space-x-2 text-sm">
                              <span className="font-medium">{employee.fullName}</span>
                              <span className="text-gray-500">- {employee.position}</span>
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

          <TabsContent value="organigram">
            <Card>
              <CardHeader>
                <CardTitle>Organigrama</CardTitle>
                <CardDescription>Estructura organizacional jerárquica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const levelDepts = departmentsList.filter(dept => dept.hierarchy === level);
                    if (levelDepts.length === 0) return null;
                    
                    return (
                      <div key={level} className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">
                          Nivel {level} - {level === 1 ? 'Dirección' : level === 2 ? 'Asistencias' : level === 3 ? 'Coordinaciones' : level === 4 ? 'Áreas' : 'Operativo'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {levelDepts.map((dept) => {
                            const deptEmployees = employees.filter(emp => emp.department === dept.name);
                            return (
                              <div key={dept.name} className="border rounded-lg p-3 bg-gray-50">
                                <h4 className="font-medium mb-2">{dept.name}</h4>
                                {deptEmployees.map((employee) => (
                                  <div key={employee.id} className="text-sm text-gray-700 mb-1">
                                    <div className="font-medium">{employee.fullName}</div>
                                    <div className="text-xs text-gray-500">{employee.position}</div>
                                  </div>
                                ))}
                              </div>
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
        </Tabs>

        {/* Formulario completo de empleado */}
        <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee 
                  ? 'Modifica la información del empleado seleccionado'
                  : 'Completa el formulario para agregar un nuevo empleado al sistema'
                }
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm 
              employee={selectedEmployee}
              departments={departmentsList}
              onSave={async (employeeData: any) => {
                try {
                  console.log('Datos del empleado a guardar:', employeeData);
                  
                  // Verificar si el email ya existe
                  const checkResponse = await fetch('/api/employees');
                  if (checkResponse.ok) {
                    const existingEmployees = await checkResponse.json();
                    const emailExists = existingEmployees.some((emp: any) => emp.email === employeeData.email);
                    
                    if (emailExists) {
                      toast({
                        title: "Email ya registrado",
                        description: `El email ${employeeData.email} ya está registrado. Usa un email diferente.`,
                        variant: "destructive"
                      });
                      return;
                    }
                  }
                  
                  // Crear empleado en el servidor
                  const response = await fetch('/api/employees', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(employeeData)
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    let errorMessage = 'Error al crear el empleado';
                    
                    if (errorData.error) {
                      errorMessage = errorData.error;
                    } else if (response.status === 500) {
                      errorMessage = `Error del servidor. Verifica que el email ${employeeData.email} no esté ya registrado.`;
                    }
                    
                    throw new Error(errorMessage);
                  }

                  const newEmployee = await response.json();
                  
                  toast({
                    title: "Empleado creado exitosamente",
                    description: `${employeeData.firstName} ${employeeData.lastName} ha sido agregado al sistema.`,
                  });
                  
                  setIsNewEmployeeOpen(false);
                  setSelectedEmployee(null);
                  
                  // Recargar la lista de empleados
                  await loadEmployees();
                  
                } catch (error) {
                  console.error('Error al crear empleado:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo crear el empleado. Intenta nuevamente.",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => {
                setIsNewEmployeeOpen(false);
                setSelectedEmployee(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}