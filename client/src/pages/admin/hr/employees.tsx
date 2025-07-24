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
  User,
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
  const recordsPerPage = 50;
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
  
  // Estados adicionales para directorio con filtros avanzados
  const [sortBy, setSortBy] = useState("name"); // name, department, alphabetical, seniority, hierarchy
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [hierarchyFilter, setHierarchyFilter] = useState("all");
  
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

  // Estados para gestión de departamentos
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    hierarchy: 1
  });
  
  // Funciones para gestión de departamentos
  const handleCreateDepartment = () => {
    setDepartmentForm({ name: '', hierarchy: 1 });
    setEditingDepartment(null);
    setIsCreatingDepartment(true);
  };

  const handleEditDepartment = (department: Department) => {
    setDepartmentForm({ name: department.name, hierarchy: department.hierarchy });
    setEditingDepartment(department);
    setIsCreatingDepartment(true);
  };

  const handleSaveDepartment = () => {
    if (!departmentForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del departamento es requerido",
        variant: "destructive"
      });
      return;
    }

    if (editingDepartment) {
      // Editar departamento existente
      setDepartmentsList(prev => prev.map(dept => 
        dept.name === editingDepartment.name 
          ? { name: departmentForm.name, hierarchy: departmentForm.hierarchy }
          : dept
      ));
      toast({
        title: "Departamento actualizado",
        description: `Se actualizó el departamento "${departmentForm.name}"`
      });
    } else {
      // Crear nuevo departamento
      const newDepartment = { name: departmentForm.name, hierarchy: departmentForm.hierarchy };
      setDepartmentsList(prev => [...prev, newDepartment]);
      toast({
        title: "Departamento creado",
        description: `Se creó el departamento "${departmentForm.name}"`
      });
    }

    setIsCreatingDepartment(false);
    setEditingDepartment(null);
    setDepartmentForm({ name: '', hierarchy: 1 });
  };

  const handleDeleteDepartment = (department: Department) => {
    const employeesInDept = employees.filter(emp => emp.department === department.name);
    
    if (employeesInDept.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `El departamento "${department.name}" tiene ${employeesInDept.length} empleados asignados`,
        variant: "destructive"
      });
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el departamento "${department.name}"?`
    );

    if (confirmDelete) {
      setDepartmentsList(prev => prev.filter(dept => dept.name !== department.name));
      toast({
        title: "Departamento eliminado",
        description: `Se eliminó el departamento "${department.name}"`
      });
    }
  };

  // Función para cargar empleados desde la base de datos
  const loadEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      console.log('Cargando empleados desde la base de datos...');
      const response = await fetch('/api/hr/employees');
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



  // Función mejorada de filtrado y ordenamiento para el directorio
  const getFilteredAndSortedEmployees = () => {
    console.log('=== DEBUG FILTRADO ===');
    console.log('Total empleados recibidos:', employees.length);
    console.log('Filtros activos:', { searchTerm, departmentFilter, statusFilter, hierarchyFilter });
    
    let filtered = employees.filter(employee => {
      if (!employee) return false;
      
      const fullName = employee.fullName || '';
      const email = employee.email || '';
      const position = employee.position || '';
      const department = employee.department || '';
      const status = employee.status || '';
      
      const matchesSearch = searchTerm === '' || fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === "all" || department === departmentFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      // Filtro por jerarquía
      const matchesHierarchy = hierarchyFilter === "all" || (() => {
        const deptInfo = departmentsList.find(d => d.name === department);
        return deptInfo ? deptInfo.hierarchy.toString() === hierarchyFilter : false;
      })();
      
      const passes = matchesSearch && matchesDepartment && matchesStatus && matchesHierarchy;
      
      if (!passes) {
        console.log(`Empleado ${fullName} filtrado por:`, {
          matchesSearch, matchesDepartment, matchesStatus, matchesHierarchy,
          department, status
        });
      }
      
      return passes;
    });
    
    console.log('Empleados después de filtrado:', filtered.length);
    
    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
        case "alphabetical":
          compareValue = (a.fullName || '').localeCompare(b.fullName || '');
          break;
        case "department":
          compareValue = (a.department || '').localeCompare(b.department || '');
          break;
        case "seniority":
          // Ordenar por fecha de contratación (más antiguo = mayor antigüedad)
          const dateA = new Date(a.hireDate || '');
          const dateB = new Date(b.hireDate || '');
          compareValue = dateA.getTime() - dateB.getTime();
          break;
        case "hierarchy":
          // Ordenar por jerarquía de departamento
          const hierA = departmentsList.find(d => d.name === a.department)?.hierarchy || 999;
          const hierB = departmentsList.find(d => d.name === b.department)?.hierarchy || 999;
          compareValue = hierA - hierB;
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return filtered;
  };

  const filteredEmployees = getFilteredAndSortedEmployees();

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

  const handleDeleteEmployee = async (employee: Employee) => {
    const confirmDelete = window.confirm(
      `⚠️ ADVERTENCIA: Esta acción no se puede deshacer.\n\n¿Estás seguro de que deseas eliminar permanentemente a ${employee.fullName}?\n\nEsta acción eliminará:\n- Todos los datos del empleado\n- Su historial laboral\n- Sus asignaciones actuales\n\nEscribe "ELIMINAR" para confirmar.`
    );
    
    if (confirmDelete) {
      const confirmation = window.prompt(
        `Para confirmar la eliminación de ${employee.fullName}, escribe exactamente: ELIMINAR`
      );
      
      if (confirmation === "ELIMINAR") {
        try {
          const response = await fetch(`/api/hr/employees/${employee.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            toast({
              title: "Empleado eliminado",
              description: `${employee.fullName} ha sido eliminado permanentemente del sistema.`,
              variant: "destructive"
            });
            console.log(`Empleado ${employee.id} - ${employee.fullName} eliminado`);
            
            // Recargar la lista de empleados
            loadEmployees();
          } else {
            const errorData = await response.json();
            toast({
              title: "Error al eliminar empleado",
              description: errorData.error || "No se pudo eliminar el empleado",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error eliminando empleado:", error);
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar con el servidor",
            variant: "destructive"
          });
        }
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
        {/* Header con patrón Card estandarizado */}
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
          </CardContent>
        </Card>

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

        {/* Botones de Importar/Exportar debajo de los indicadores */}
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
                  <DialogTitle>Gestión de Departamentos</DialogTitle>
                  <DialogDescription>
                    Administra los departamentos y sus niveles jerárquicos organizacionales
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Botón para crear nuevo departamento */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total: {departmentsList.length} departamentos
                    </div>
                    <Button onClick={handleCreateDepartment} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nuevo Departamento
                    </Button>
                  </div>

                  {/* Lista de departamentos con acciones */}
                  <div className="grid grid-cols-1 gap-4">
                    {departmentsList.map((dept, index) => {
                      const employeeCount = employees.filter(emp => emp.department === dept.name).length;
                      const hierarchyColors = {
                        1: "from-[#8498a5] to-[#6b8394] text-white",
                        2: "from-[#5ba8c4] to-[#4a96b2] text-white", 
                        3: "from-[#00a587] to-[#067f5f] text-white",
                        4: "from-[#22c55e] to-[#16a34a] text-white",
                        5: "from-[#bcd256] to-[#a6c548] text-white"
                      };
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${hierarchyColors[dept.hierarchy as keyof typeof hierarchyColors]}`}>
                              Nivel {dept.hierarchy}
                            </div>
                            <div>
                              <div className="font-medium text-lg">{dept.name}</div>
                              <div className="text-sm text-gray-600">
                                {dept.hierarchy === 1 ? 'Dirección' : 
                                 dept.hierarchy === 2 ? 'Asistencias' :
                                 dept.hierarchy === 3 ? 'Coordinaciones' :
                                 dept.hierarchy === 4 ? 'Áreas' : 'Operativo'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="px-3 py-1">
                              {employeeCount} empleados
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDepartment(dept)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDepartment(dept)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                disabled={employeeCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Información sobre niveles jerárquicos */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Estructura Jerárquica Organizacional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                      <div className="p-2 bg-[#8498a5]/10 rounded border-l-4 border-[#8498a5]">
                        <div className="font-medium text-[#8498a5]">Nivel 1</div>
                        <div className="text-[#6b8394]">Dirección</div>
                      </div>
                      <div className="p-2 bg-[#5ba8c4]/10 rounded border-l-4 border-[#5ba8c4]">
                        <div className="font-medium text-[#5ba8c4]">Nivel 2</div>
                        <div className="text-[#4a96b2]">Asistencias</div>
                      </div>
                      <div className="p-2 bg-[#00a587]/10 rounded border-l-4 border-[#00a587]">
                        <div className="font-medium text-[#00a587]">Nivel 3</div>
                        <div className="text-[#067f5f]">Coordinaciones</div>
                      </div>
                      <div className="p-2 bg-[#22c55e]/10 rounded border-l-4 border-[#22c55e]">
                        <div className="font-medium text-[#22c55e]">Nivel 4</div>
                        <div className="text-[#16a34a]">Áreas</div>
                      </div>
                      <div className="p-2 bg-[#bcd256]/10 rounded border-l-4 border-[#bcd256]">
                        <div className="font-medium text-[#bcd256]">Nivel 5</div>
                        <div className="text-[#a6c548]">Operativo</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dialog para crear/editar departamento */}
                <Dialog open={isCreatingDepartment} onOpenChange={setIsCreatingDepartment}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingDepartment ? 'Modifica la información del departamento' : 'Crea un nuevo departamento organizacional'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deptName">Nombre del Departamento *</Label>
                        <Input
                          id="deptName"
                          value={departmentForm.name}
                          onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Coordinación de Marketing"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="deptHierarchy">Nivel Jerárquico *</Label>
                        <Select
                          value={departmentForm.hierarchy.toString()}
                          onValueChange={(value) => setDepartmentForm(prev => ({ ...prev, hierarchy: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Nivel 1 - Dirección</SelectItem>
                            <SelectItem value="2">Nivel 2 - Asistencias</SelectItem>
                            <SelectItem value="3">Nivel 3 - Coordinaciones</SelectItem>
                            <SelectItem value="4">Nivel 4 - Áreas</SelectItem>
                            <SelectItem value="5">Nivel 5 - Operativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreatingDepartment(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveDepartment}>
                        {editingDepartment ? 'Actualizar' : 'Crear'} Departamento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DialogContent>
            </Dialog>

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
                  ) : 
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
                    ))
                  }
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
                <CardTitle>Directorio de Empleados ({filteredEmployees.length})</CardTitle>
                <CardDescription>Directorio completo con filtros avanzados y gestión de perfiles</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Panel de Filtros Avanzados */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Búsqueda por nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="directory-search">Buscar por nombre</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="directory-search"
                          placeholder="Nombre del empleado..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Filtro por departamento */}
                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los departamentos</SelectItem>
                          {departmentsList.map((dept) => (
                            <SelectItem key={dept.name} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por jerarquía */}
                    <div className="space-y-2">
                      <Label>Nivel jerárquico</Label>
                      <Select value={hierarchyFilter} onValueChange={setHierarchyFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los niveles</SelectItem>
                          <SelectItem value="1">Nivel 1 - Dirección</SelectItem>
                          <SelectItem value="2">Nivel 2 - Asistencias</SelectItem>
                          <SelectItem value="3">Nivel 3 - Coordinaciones</SelectItem>
                          <SelectItem value="4">Nivel 4 - Áreas</SelectItem>
                          <SelectItem value="5">Nivel 5 - Operativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordenamiento */}
                    <div className="space-y-2">
                      <Label>Ordenar por</Label>
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Nombre</SelectItem>
                            <SelectItem value="alphabetical">Alfabético</SelectItem>
                            <SelectItem value="department">Departamento</SelectItem>
                            <SelectItem value="seniority">Antigüedad</SelectItem>
                            <SelectItem value="hierarchy">Jerarquía</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="px-3"
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de Empleados */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoadingEmployees ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">Cargando directorio...</p>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No se encontraron empleados con los filtros aplicados</p>
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const deptInfo = departmentsList.find(d => d.name === employee.department);
                      const hierarchyLevel = deptInfo?.hierarchy || 5;
                      const hireDate = new Date(employee.hireDate);
                      const yearsOfService = new Date().getFullYear() - hireDate.getFullYear();

                      return (
                        <Card key={employee.id} className="hover:shadow-lg transition-shadow duration-200">
                          <CardContent className="p-6">
                            {/* Header con avatar y estado */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900">{employee.fullName}</h3>
                                  <p className="text-sm font-medium text-gray-600">{employee.position}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={getStatusColor(employee.status)}>
                                {getStatusText(employee.status)}
                              </Badge>
                            </div>

                            {/* Información del departamento y jerarquía */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{employee.department}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Nivel {hierarchyLevel}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {yearsOfService} {yearsOfService === 1 ? 'año' : 'años'} de antigüedad
                                </span>
                              </div>
                            </div>

                            {/* Información de contacto */}
                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700 truncate">{employee.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{employee.phone}</span>
                              </div>
                            </div>

                            {/* Habilidades y certificaciones destacadas */}
                            {(employee.skills?.length > 0 || employee.certifications?.length > 0) && (
                              <div className="mb-4">
                                {employee.skills?.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-xs font-medium text-gray-600 mb-1">Habilidades principales:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {employee.skills.slice(0, 2).map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {employee.skills.length > 2 && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                          +{employee.skills.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {employee.certifications?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">Certificaciones:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {employee.certifications.slice(0, 2).map((cert, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          {cert}
                                        </Badge>
                                      ))}
                                      {employee.certifications.length > 2 && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                          +{employee.certifications.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewEmployee(employee)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEmployee(employee)}
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* Paginación para directorio */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
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
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  Departamentos Organizacionales
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Estructura departamental con distribución de personal y jerarquías
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {departmentsList.map((dept, index) => {
                    const deptEmployees = employees.filter(emp => emp.department === dept.name);
                    
                    // Color palette based on hierarchy level using Parques de México brand colors
                    const getHierarchyColors = (level: number) => {
                      const colorSchemes = {
                        1: { bg: 'bg-gradient-to-br from-[#8498a5]/20 to-[#8498a5]/30', border: 'border-[#8498a5]', badge: 'bg-[#8498a5] text-white', icon: 'text-[#8498a5]' },
                        2: { bg: 'bg-gradient-to-br from-[#5ba8c4]/20 to-[#5ba8c4]/30', border: 'border-[#5ba8c4]', badge: 'bg-[#5ba8c4] text-white', icon: 'text-[#5ba8c4]' },
                        3: { bg: 'bg-gradient-to-br from-[#00a587]/20 to-[#00a587]/30', border: 'border-[#00a587]', badge: 'bg-[#00a587] text-white', icon: 'text-[#00a587]' },
                        4: { bg: 'bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/30', border: 'border-[#22c55e]', badge: 'bg-[#22c55e] text-white', icon: 'text-[#22c55e]' },
                        5: { bg: 'bg-gradient-to-br from-[#bcd256]/20 to-[#bcd256]/30', border: 'border-[#bcd256]', badge: 'bg-[#bcd256] text-white', icon: 'text-[#bcd256]' }
                      };
                      return colorSchemes[level as keyof typeof colorSchemes] || colorSchemes[5];
                    };

                    const colors = getHierarchyColors(dept.hierarchy);
                    
                    return (
                      <Card key={dept.name} className={`${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                                <Building className={`h-5 w-5 ${colors.icon}`} />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
                                <p className="text-sm text-gray-600">Nivel {dept.hierarchy} - Jerarquía organizacional</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${colors.badge} px-3 py-1 text-sm font-semibold`}>
                                {deptEmployees.length} {deptEmployees.length === 1 ? 'empleado' : 'empleados'}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-gray-600 border-gray-400">
                                {dept.hierarchy === 1 ? 'Dirección' : 
                                 dept.hierarchy === 2 ? 'Asistencias' :
                                 dept.hierarchy === 3 ? 'Coordinaciones' :
                                 dept.hierarchy === 4 ? 'Áreas' : 'Operativo'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {deptEmployees.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm italic">Sin empleados asignados</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Personal asignado:
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {deptEmployees.map((employee, empIndex) => (
                                  <div key={employee.id} className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 hover:bg-white/90 transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900 text-sm">{employee.fullName}</p>
                                          <p className="text-xs text-gray-600">{employee.position}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => handleViewEmployee(employee)} className="h-7 w-7 p-0">
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleEditEmployee(employee)} className="h-7 w-7 p-0">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Resumen estadístico */}
                <div className="mt-8 bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-lg p-6 border border-[#00a587]/30">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#00a587]" />
                    Resumen Organizacional
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(level => {
                      const levelDepts = departmentsList.filter(d => d.hierarchy === level);
                      const levelEmployees = employees.filter(emp => {
                        const dept = departmentsList.find(d => d.name === emp.department);
                        return dept?.hierarchy === level;
                      });
                      
                      const levelColors = {
                        1: 'bg-[#8498a5]/20 border-[#8498a5] text-[#8498a5]',
                        2: 'bg-[#5ba8c4]/20 border-[#5ba8c4] text-[#5ba8c4]',
                        3: 'bg-[#00a587]/20 border-[#00a587] text-[#00a587]',
                        4: 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]',
                        5: 'bg-[#bcd256]/20 border-[#bcd256] text-[#bcd256]'
                      };
                      
                      const levelName = level === 1 ? 'Dirección' : level === 2 ? 'Asistencias' : level === 3 ? 'Coordinaciones' : level === 4 ? 'Áreas' : 'Operativo';
                      
                      return (
                        <div key={level} className={`${levelColors[level as keyof typeof levelColors]} rounded-lg p-3 border-2 text-center`}>
                          <div className="text-lg font-bold">{levelEmployees.length}</div>
                          <div className="text-xs font-medium">empleados</div>
                          <div className="text-xs mt-1">{levelName}</div>
                          <div className="text-xs opacity-75">{levelDepts.length} dept.</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organigram">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  Organigrama Institucional
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Estructura jerárquica completa con distribución de personal por niveles organizacionales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Indicadores de jerarquía */}
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(level => {
                      const levelName = level === 1 ? 'Dirección' : level === 2 ? 'Asistencias' : level === 3 ? 'Coordinaciones' : level === 4 ? 'Áreas' : 'Operativo';
                      const levelDepts = departmentsList.filter(d => d.hierarchy === level);
                      const levelEmployees = employees.filter(emp => {
                        const dept = departmentsList.find(d => d.name === emp.department);
                        return dept?.hierarchy === level;
                      });
                      
                      const levelIcons = {
                        1: '🏛️', 2: '🎯', 3: '⚡', 4: '🔧', 5: '👥'
                      };
                      
                      const levelColors = {
                        1: 'from-[#8498a5] to-[#6b8394] border-[#8498a5]',
                        2: 'from-[#5ba8c4] to-[#4a96b2] border-[#5ba8c4]',
                        3: 'from-[#00a587] to-[#008f75] border-[#00a587]', 
                        4: 'from-[#22c55e] to-[#16a34a] border-[#22c55e]',
                        5: 'from-[#bcd256] to-[#a6c548] border-[#bcd256]'
                      };
                      
                      return (
                        <div key={level} className={`bg-gradient-to-br ${levelColors[level as keyof typeof levelColors]} text-white rounded-xl p-4 border-2 text-center shadow-lg transform hover:scale-105 transition-all duration-300`}>
                          <div className="text-2xl mb-2">{levelIcons[level as keyof typeof levelIcons]}</div>
                          <div className="text-lg font-bold">{levelEmployees.length}</div>
                          <div className="text-xs font-medium opacity-90">empleados</div>
                          <div className="text-sm font-semibold mt-2 border-t border-white/30 pt-2">{levelName}</div>
                          <div className="text-xs opacity-75">{levelDepts.length} departamentos</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estructura jerárquica */}
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const levelDepts = departmentsList.filter(dept => dept.hierarchy === level);
                    if (levelDepts.length === 0) return null;
                    
                    const levelConfig = {
                      1: { 
                        bg: 'bg-gradient-to-br from-[#8498a5]/20 via-[#8498a5]/10 to-white',
                        border: 'border-[#8498a5]/30',
                        title: 'bg-gradient-to-r from-[#8498a5] to-[#6b8394]',
                        icon: '🏛️',
                        name: 'Dirección General',
                        description: 'Máximo nivel ejecutivo y toma de decisiones estratégicas'
                      },
                      2: { 
                        bg: 'bg-gradient-to-br from-[#5ba8c4]/20 via-[#5ba8c4]/10 to-white',
                        border: 'border-[#5ba8c4]/30',
                        title: 'bg-gradient-to-r from-[#5ba8c4] to-[#4a96b2]',
                        icon: '🎯',
                        name: 'Asistencias de Dirección',
                        description: 'Soporte directo y coordinación ejecutiva'
                      },
                      3: { 
                        bg: 'bg-gradient-to-br from-[#00a587]/20 via-[#00a587]/10 to-white',
                        border: 'border-[#00a587]/30',
                        title: 'bg-gradient-to-r from-[#00a587] to-[#067f5f]',
                        icon: '⚡',
                        name: 'Coordinaciones Operativas',
                        description: 'Gestión y coordinación de operaciones principales'
                      },
                      4: { 
                        bg: 'bg-gradient-to-br from-[#22c55e]/20 via-[#22c55e]/10 to-white',
                        border: 'border-[#22c55e]/30',
                        title: 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]',
                        icon: '🔧',
                        name: 'Áreas Especializadas',
                        description: 'Departamentos técnicos y especializados'
                      },
                      5: { 
                        bg: 'bg-gradient-to-br from-[#bcd256]/20 via-[#bcd256]/10 to-white',
                        border: 'border-[#bcd256]/30',
                        title: 'bg-gradient-to-r from-[#bcd256] to-[#a6c548]',
                        icon: '👥',
                        name: 'Personal Operativo',
                        description: 'Ejecución directa y operaciones de campo'
                      }
                    };

                    const config = levelConfig[level as keyof typeof levelConfig];
                    
                    return (
                      <div key={level} className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 shadow-lg`}>
                        {/* Header del nivel */}
                        <div className={`${config.title} text-white rounded-xl p-4 mb-6 shadow-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{config.icon}</div>
                              <div>
                                <h3 className="text-xl font-bold">Nivel {level} - {config.name}</h3>
                                <p className="text-sm opacity-90">{config.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{levelDepts.length}</div>
                              <div className="text-xs opacity-90">departamentos</div>
                            </div>
                          </div>
                        </div>

                        {/* Departamentos del nivel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {levelDepts.map((dept) => {
                            const deptEmployees = employees.filter(emp => emp.department === dept.name);
                            return (
                              <Card key={dept.name} className="bg-white/80 backdrop-blur-sm border-2 border-white/50 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg">
                                        <Building className="h-4 w-4 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900">{dept.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className="text-xs bg-blue-600 text-white">
                                            {deptEmployees.length} empleados
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                  {deptEmployees.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                      <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                      <p className="text-xs italic">Sin personal asignado</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {deptEmployees.map((employee) => (
                                        <div key={employee.id} className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                              {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm text-gray-900 truncate">{employee.fullName}</p>
                                              <p className="text-xs text-gray-600 truncate">{employee.position}</p>
                                            </div>
                                            <div className="flex gap-1">
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleViewEmployee(employee)} 
                                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                              >
                                                <Eye className="h-3 w-3 text-blue-600" />
                                              </Button>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleEditEmployee(employee)} 
                                                className="h-6 w-6 p-0 hover:bg-green-100"
                                              >
                                                <Edit className="h-3 w-3 text-green-600" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        
                        {/* Empleados sin departamento definido (solo en nivel 5) */}
                        {level === 5 && (
                          <div className="mt-6">
                            {(() => {
                              const unassignedEmployees = employees.filter(emp => !departmentsList.some(dept => dept.name === emp.department));
                              if (unassignedEmployees.length === 0) return null;
                              
                              return (
                                <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-xl p-4">
                                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                                    <div className="p-1 bg-red-600 rounded">
                                      <AlertCircle className="h-4 w-4 text-white" />
                                    </div>
                                    Empleados sin departamento definido ({unassignedEmployees.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {unassignedEmployees.map((employee) => (
                                      <div key={employee.id} className="bg-white/80 border border-red-200 rounded-lg p-3 hover:bg-white transition-colors duration-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                              {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div>
                                              <p className="font-medium text-sm text-gray-900">{employee.fullName}</p>
                                              <p className="text-xs text-gray-600">{employee.position}</p>
                                              <p className="text-xs text-red-600 font-medium">Dept: {employee.department}</p>
                                            </div>
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleEditEmployee(employee)}
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
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
                  
                  const isEditing = selectedEmployee && selectedEmployee.id;
                  
                  let response;
                  if (isEditing) {
                    // Actualizar empleado existente
                    response = await fetch(`/api/hr/employees/${selectedEmployee.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(employeeData)
                    });
                  } else {
                    // Verificar si el email ya existe para nuevos empleados
                    const checkResponse = await fetch('/api/hr/employees');
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
                    
                    // Crear nuevo empleado
                    response = await fetch('/api/hr/employees', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(employeeData)
                    });
                  }

                  if (!response.ok) {
                    let errorMessage = isEditing ? 'Error al actualizar el empleado' : 'Error al crear el empleado';
                    
                    try {
                      const errorData = await response.json();
                      if (errorData.error) {
                        errorMessage = errorData.error;
                      }
                    } catch (parseError) {
                      // Si no se puede parsear como JSON, es probablemente HTML de error
                      const responseText = await response.text();
                      console.error('Error response (not JSON):', responseText);
                      
                      if (response.status === 500) {
                        errorMessage = `Error del servidor. Verifica que los datos sean válidos.`;
                      } else if (response.status === 400) {
                        errorMessage = `Datos inválidos. Verifica que el email no esté duplicado.`;
                      }
                    }
                    
                    throw new Error(errorMessage);
                  }

                  const savedEmployee = await response.json();
                  
                  toast({
                    title: isEditing ? "Empleado actualizado exitosamente" : "Empleado creado exitosamente",
                    description: `${employeeData.firstName} ${employeeData.lastName} ha sido ${isEditing ? 'actualizado' : 'agregado'} en el sistema.`,
                  });
                  
                  setIsNewEmployeeOpen(false);
                  setSelectedEmployee(null);
                  
                  // Recargar la lista de empleados
                  await loadEmployees();
                  
                } catch (error: any) {
                  console.error('Error al procesar empleado:', error);
                  toast({
                    title: "Error",
                    description: error.message || "No se pudo procesar el empleado. Intenta nuevamente.",
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
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEmployee.education}</span>
                      </div>
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
                        <span className="text-sm">{formatCurrency(typeof selectedEmployee.salary === 'string' ? parseFloat(selectedEmployee.salary) : selectedEmployee.salary)}</span>
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

                {/* Contacto de emergencia */}
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

                {/* Habilidades y Certificaciones */}
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

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setIsViewEmployeeOpen(false);
                    setSelectedEmployee(selectedEmployee);
                    setIsNewEmployeeOpen(true);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
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