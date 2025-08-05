import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Calendar,
  Award,
  Clock,
  Users,
  Star,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Target,
  Briefcase
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface Training {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: number; // horas
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  cost: number;
  location: string;
  requirements: string[];
  objectives: string[];
  rating?: number;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  trainingsCompleted: number;
  certificationsEarned: number;
  skillLevel: number; // 1-100
  lastTraining: string;
}

const TrainingDevelopment = () => {
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false);

  // Datos de capacitaciones
  const trainings: Training[] = [
    {
      id: 1,
      title: "Primeros Auxilios y Seguridad",
      category: "Seguridad",
      instructor: "Dr. Miguel Santos",
      duration: 16,
      capacity: 20,
      enrolled: 18,
      startDate: "2025-06-01",
      endDate: "2025-06-02",
      status: "scheduled",
      description: "Curso básico de primeros auxilios y protocolos de seguridad en espacios públicos",
      cost: 3500,
      location: "Aula de Capacitación",
      requirements: ["Ninguno"],
      objectives: ["Manejar emergencias básicas", "Aplicar protocolos de seguridad", "Usar equipo de primeros auxilios"],
      rating: 4.8
    },
    {
      id: 2,
      title: "Gestión de Eventos Masivos",
      category: "Eventos",
      instructor: "Lic. Carmen Ruiz",
      duration: 24,
      capacity: 15,
      enrolled: 12,
      startDate: "2025-05-20",
      endDate: "2025-05-22",
      status: "in-progress",
      description: "Planificación, organización y ejecución de eventos en espacios públicos",
      cost: 5000,
      location: "Salón de Eventos",
      requirements: ["Experiencia en eventos"],
      objectives: ["Planificar eventos complejos", "Gestionar recursos", "Coordinar equipos multidisciplinarios"],
      rating: 4.6
    },
    {
      id: 3,
      title: "Excel Avanzado para Administración",
      category: "Tecnología",
      instructor: "Ing. Roberto López",
      duration: 20,
      capacity: 25,
      enrolled: 25,
      startDate: "2025-04-15",
      endDate: "2025-04-19",
      status: "completed",
      description: "Herramientas avanzadas de Excel para análisis financiero y administrativo",
      cost: 2800,
      location: "Laboratorio de Cómputo",
      requirements: ["Conocimientos básicos de Excel"],
      objectives: ["Dominar funciones avanzadas", "Crear dashboards", "Automatizar reportes"],
      rating: 4.9
    },
    {
      id: 4,
      title: "Liderazgo y Comunicación Efectiva",
      category: "Liderazgo",
      instructor: "Psic. Ana Mendoza",
      duration: 12,
      capacity: 18,
      enrolled: 16,
      startDate: "2025-06-10",
      endDate: "2025-06-11",
      status: "scheduled",
      description: "Desarrollo de habilidades de liderazgo y comunicación para mandos medios",
      cost: 4200,
      location: "Sala de Juntas",
      requirements: ["Personal con responsabilidades de supervisión"],
      objectives: ["Mejorar comunicación interpersonal", "Desarrollar liderazgo", "Manejar equipos"],
      rating: 4.7
    },
    {
      id: 5,
      title: "Mantenimiento de Áreas Verdes",
      category: "Técnico",
      instructor: "Ing. Agr. Luis Flores",
      duration: 32,
      capacity: 12,
      enrolled: 10,
      startDate: "2025-05-15",
      endDate: "2025-05-19",
      status: "in-progress",
      description: "Técnicas especializadas para el cuidado y mantenimiento de espacios verdes urbanos",
      cost: 6000,
      location: "Vivero Municipal",
      requirements: ["Experiencia en jardinería"],
      objectives: ["Dominar técnicas de poda", "Conocer especies locales", "Aplicar sistemas de riego"],
      rating: 4.5
    }
  ];

  // Datos de empleados y su desarrollo
  const employees: Employee[] = [
    {
      id: 1,
      name: "María Elena González",
      department: "Eventos y Actividades",
      position: "Coordinadora",
      trainingsCompleted: 8,
      certificationsEarned: 3,
      skillLevel: 85,
      lastTraining: "2025-04-19"
    },
    {
      id: 2,
      name: "Carlos Alberto Martínez",
      department: "Mantenimiento",
      position: "Jefe de Mantenimiento",
      trainingsCompleted: 12,
      certificationsEarned: 5,
      skillLevel: 92,
      lastTraining: "2025-05-19"
    },
    {
      id: 3,
      name: "Ana Patricia Rodríguez",
      department: "Administración",
      position: "Especialista en Finanzas",
      trainingsCompleted: 6,
      certificationsEarned: 2,
      skillLevel: 78,
      lastTraining: "2025-04-19"
    },
    {
      id: 4,
      name: "Roberto Jiménez Silva",
      department: "Seguridad",
      position: "Coordinador",
      trainingsCompleted: 10,
      certificationsEarned: 4,
      skillLevel: 88,
      lastTraining: "2025-03-15"
    },
    {
      id: 5,
      name: "Sofía Mendoza López",
      department: "Eventos y Actividades",
      position: "Instructora",
      trainingsCompleted: 4,
      certificationsEarned: 2,
      skillLevel: 72,
      lastTraining: "2025-05-10"
    }
  ];

  const categories = ["Seguridad", "Eventos", "Tecnología", "Liderazgo", "Técnico", "Administración"];

  // Datos para gráficas
  const trainingProgress = [
    { month: 'Ene', completadas: 8, programadas: 12 },
    { month: 'Feb', completadas: 6, programadas: 10 },
    { month: 'Mar', completadas: 10, programadas: 14 },
    { month: 'Abr', completadas: 12, programadas: 15 },
    { month: 'May', completadas: 9, programadas: 13 },
    { month: 'Jun', completadas: 0, programadas: 8 }
  ];

  const skillsByDepartment = [
    { department: 'Eventos', promedio: 82 },
    { department: 'Mantenimiento', promedio: 89 },
    { department: 'Administración', promedio: 75 },
    { department: 'Seguridad', promedio: 86 },
    { department: 'RH', promedio: 80 }
  ];

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || training.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || training.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'in-progress': return 'En Curso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
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
    totalTrainings: trainings.length,
    activeTrainings: trainings.filter(t => t.status === 'in-progress').length,
    completedTrainings: trainings.filter(t => t.status === 'completed').length,
    totalInvestment: trainings.reduce((sum, t) => sum + t.cost, 0),
    avgRating: trainings.filter(t => t.rating).reduce((sum, t) => sum + (t.rating || 0), 0) / trainings.filter(t => t.rating).length,
    employeesInTraining: trainings.filter(t => t.status === 'in-progress').reduce((sum, t) => sum + t.enrolled, 0)
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Capacitación y Desarrollo
              </h1>
              <p className="text-gray-600">
                Gestión integral de formación y desarrollo profesional
              </p>
            </div>
          </div>

          <Dialog open={isNewTrainingOpen} onOpenChange={setIsNewTrainingOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Capacitación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Programar Nueva Capacitación</DialogTitle>
                <DialogDescription>
                  Configure los detalles de la nueva capacitación
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Título de la Capacitación</Label>
                  <Input id="title" placeholder="Ej: Primeros Auxilios Básicos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input id="instructor" placeholder="Nombre del instructor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (horas)</Label>
                  <Input id="duration" type="number" placeholder="16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input id="capacity" type="number" placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input id="endDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo por Participante</Label>
                  <Input id="cost" type="number" placeholder="3500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" placeholder="Aula de Capacitación" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" placeholder="Descripción breve del curso" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTrainingOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewTrainingOpen(false)}>
                  Programar Capacitación
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTrainings}</div>
                  <div className="text-xs text-gray-600">Total Capacitaciones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeTrainings}</div>
                  <div className="text-xs text-gray-600">En Curso</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.completedTrainings}</div>
                  <div className="text-xs text-gray-600">Completadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.employeesInTraining}</div>
                  <div className="text-xs text-gray-600">En Capacitación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Rating Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
                  <div className="text-xs text-gray-600">Inversión Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="employees">Desarrollo Personal</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
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
                        placeholder="Título o instructor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                        <SelectItem value="scheduled">Programado</SelectItem>
                        <SelectItem value="in-progress">En Curso</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
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

            {/* Lista de capacitaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainings.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className={getStatusColor(training.status)}>
                        {getStatusText(training.status)}
                      </Badge>
                      {training.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{training.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{training.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{training.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span>{training.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(training.startDate).toLocaleDateString('es-MX')} - {new Date(training.endDate).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{training.duration} horas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{training.enrolled}/{training.capacity} inscritos</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ocupación</span>
                        <span>{Math.round((training.enrolled / training.capacity) * 100)}%</span>
                      </div>
                      <Progress value={(training.enrolled / training.capacity) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(training.cost)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Desarrollo del Personal</CardTitle>
                <CardDescription>
                  Seguimiento individual de capacitación y desarrollo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-lg">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.position} - {employee.department}</p>
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          Nivel: {employee.skillLevel}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{employee.trainingsCompleted}</div>
                          <div className="text-xs text-blue-800">Capacitaciones</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{employee.certificationsEarned}</div>
                          <div className="text-xs text-green-800">Certificaciones</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{employee.skillLevel}%</div>
                          <div className="text-xs text-purple-800">Nivel de Habilidades</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-sm font-bold text-orange-600">
                            {new Date(employee.lastTraining).toLocaleDateString('es-MX')}
                          </div>
                          <div className="text-xs text-orange-800">Última Capacitación</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso de Desarrollo</span>
                          <span>{employee.skillLevel}%</span>
                        </div>
                        <Progress value={employee.skillLevel} className="h-2" />
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button size="sm" variant="outline">
                          Ver Plan de Desarrollo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso de Capacitaciones</CardTitle>
                  <CardDescription>Capacitaciones completadas vs programadas por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trainingProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completadas" fill="#22c55e" name="Completadas" />
                      <Bar dataKey="programadas" fill="#3b82f6" name="Programadas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nivel de Habilidades por Departamento</CardTitle>
                  <CardDescription>Promedio de competencias por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={skillsByDepartment} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="department" type="category" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Nivel Promedio']} />
                      <Bar dataKey="promedio" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle>Certificaciones Disponibles</CardTitle>
                <CardDescription>
                  Programas de certificación institucional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Seguridad en Espacios Públicos", level: "Básico", duration: "40 horas", participants: 25 },
                    { name: "Gestión de Eventos", level: "Intermedio", duration: "60 horas", participants: 15 },
                    { name: "Liderazgo Municipal", level: "Avanzado", duration: "80 horas", participants: 8 },
                    { name: "Mantenimiento Especializado", level: "Técnico", duration: "120 horas", participants: 12 },
                    { name: "Atención Ciudadana", level: "Básico", duration: "24 horas", participants: 30 },
                    { name: "Administración Pública", level: "Intermedio", duration: "100 horas", participants: 18 }
                  ].map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <Award className="h-8 w-8 text-yellow-500" />
                        <Badge variant="outline">{cert.level}</Badge>
                      </div>
                      <h3 className="font-medium mb-2">{cert.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Duración: {cert.duration}</div>
                        <div>Participantes: {cert.participants}</div>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Ver Programa
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TrainingDevelopment;