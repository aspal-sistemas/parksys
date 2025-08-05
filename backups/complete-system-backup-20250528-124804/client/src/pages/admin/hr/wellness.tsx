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
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Star,
  Activity,
  Brain,
  Smile,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Target,
  Award,
  Coffee,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface WellnessProgram {
  id: number;
  name: string;
  type: 'physical' | 'mental' | 'social' | 'professional';
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  status: 'active' | 'upcoming' | 'completed';
  coordinator: string;
  cost: number;
  rating: number;
}

interface Survey {
  id: number;
  title: string;
  type: 'climate' | 'satisfaction' | 'wellbeing' | 'feedback';
  status: 'draft' | 'active' | 'completed';
  responses: number;
  targetResponses: number;
  createdDate: string;
  deadline: string;
  avgScore: number;
}

interface ClimateMetric {
  department: string;
  satisfaction: number;
  engagement: number;
  stress: number;
  workLifeBalance: number;
  communication: number;
  leadership: number;
}

const WellnessClimate = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewProgramOpen, setIsNewProgramOpen] = useState(false);
  const [isNewSurveyOpen, setIsNewSurveyOpen] = useState(false);

  // Datos de programas de bienestar
  const wellnessPrograms: WellnessProgram[] = [
    {
      id: 1,
      name: "Programa de Actividad Física",
      type: "physical",
      description: "Clases de yoga, zumba y ejercicios grupales en horario laboral",
      startDate: "2025-01-15",
      endDate: "2025-12-15",
      participants: 45,
      maxParticipants: 60,
      status: "active",
      coordinator: "Lic. Patricia Wellness",
      cost: 25000,
      rating: 4.7
    },
    {
      id: 2,
      name: "Mindfulness y Reducción de Estrés",
      type: "mental",
      description: "Sesiones de meditación y técnicas de manejo del estrés",
      startDate: "2025-02-01",
      endDate: "2025-11-30",
      participants: 32,
      maxParticipants: 40,
      status: "active",
      coordinator: "Psic. Roberto Zen",
      cost: 18000,
      rating: 4.9
    },
    {
      id: 3,
      name: "Eventos de Integración",
      type: "social",
      description: "Actividades recreativas y de convivencia entre equipos",
      startDate: "2025-03-01",
      endDate: "2025-12-31",
      participants: 85,
      maxParticipants: 100,
      status: "active",
      coordinator: "Lic. María Social",
      cost: 35000,
      rating: 4.5
    },
    {
      id: 4,
      name: "Desarrollo de Liderazgo Personal",
      type: "professional",
      description: "Talleres de crecimiento profesional y habilidades blandas",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      participants: 0,
      maxParticipants: 25,
      status: "upcoming",
      coordinator: "Coach Ana Lider",
      cost: 40000,
      rating: 0
    },
    {
      id: 5,
      name: "Club de Lectura Corporativo",
      type: "mental",
      description: "Grupo de lectura enfocado en desarrollo personal y profesional",
      startDate: "2025-01-01",
      endDate: "2025-04-30",
      participants: 22,
      maxParticipants: 30,
      status: "completed",
      coordinator: "Lic. Carmen Libros",
      cost: 8000,
      rating: 4.3
    }
  ];

  // Datos de encuestas
  const surveys: Survey[] = [
    {
      id: 1,
      title: "Encuesta de Clima Laboral 2025",
      type: "climate",
      status: "active",
      responses: 78,
      targetResponses: 105,
      createdDate: "2025-05-01",
      deadline: "2025-06-01",
      avgScore: 4.2
    },
    {
      id: 2,
      title: "Satisfacción con Beneficios",
      type: "satisfaction",
      status: "completed",
      responses: 92,
      targetResponses: 90,
      createdDate: "2025-04-01",
      deadline: "2025-04-30",
      avgScore: 4.5
    },
    {
      id: 3,
      title: "Evaluación de Bienestar Mental",
      type: "wellbeing",
      status: "active",
      responses: 45,
      targetResponses: 105,
      createdDate: "2025-05-15",
      deadline: "2025-06-15",
      avgScore: 3.8
    },
    {
      id: 4,
      title: "Feedback de Capacitaciones",
      type: "feedback",
      status: "draft",
      responses: 0,
      targetResponses: 60,
      createdDate: "2025-05-26",
      deadline: "2025-07-01",
      avgScore: 0
    }
  ];

  // Métricas de clima por departamento
  const climateMetrics: ClimateMetric[] = [
    {
      department: "Eventos y Actividades",
      satisfaction: 85,
      engagement: 88,
      stress: 25,
      workLifeBalance: 82,
      communication: 79,
      leadership: 86
    },
    {
      department: "Mantenimiento",
      satisfaction: 92,
      engagement: 90,
      stress: 20,
      workLifeBalance: 88,
      communication: 85,
      leadership: 91
    },
    {
      department: "Administración",
      satisfaction: 78,
      engagement: 75,
      stress: 35,
      workLifeBalance: 70,
      communication: 72,
      leadership: 80
    },
    {
      department: "Seguridad",
      satisfaction: 88,
      engagement: 85,
      stress: 30,
      workLifeBalance: 85,
      communication: 88,
      leadership: 87
    },
    {
      department: "Recursos Humanos",
      satisfaction: 83,
      engagement: 87,
      stress: 28,
      workLifeBalance: 80,
      communication: 90,
      leadership: 85
    }
  ];

  // Datos para tendencias
  const wellnessTrends = [
    { month: 'Ene', satisfaccion: 78, engagement: 82, estres: 32 },
    { month: 'Feb', satisfaccion: 80, engagement: 84, estres: 30 },
    { month: 'Mar', satisfaccion: 82, engagement: 85, estres: 28 },
    { month: 'Abr', satisfaccion: 85, engagement: 87, estres: 25 },
    { month: 'May', satisfaccion: 87, engagement: 89, estres: 23 },
    { month: 'Jun', satisfaccion: 85, engagement: 88, estres: 25 }
  ];

  const programParticipation = [
    { programa: 'Actividad Física', participantes: 45 },
    { programa: 'Mindfulness', participantes: 32 },
    { programa: 'Integración', participantes: 85 },
    { programa: 'Lectura', participantes: 22 }
  ];

  const filteredPrograms = wellnessPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.coordinator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || program.type === typeFilter;
    const matchesStatus = statusFilter === "all" || program.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'upcoming': return 'Próximo';
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return <Activity className="h-4 w-4" />;
      case 'mental': return <Brain className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'professional': return <Award className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'physical': return 'text-green-600';
      case 'mental': return 'text-purple-600';
      case 'social': return 'text-blue-600';
      case 'professional': return 'text-orange-600';
      default: return 'text-gray-600';
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
    activePrograms: wellnessPrograms.filter(p => p.status === 'active').length,
    totalParticipants: wellnessPrograms.reduce((sum, p) => sum + p.participants, 0),
    avgSatisfaction: climateMetrics.reduce((sum, m) => sum + m.satisfaction, 0) / climateMetrics.length,
    avgEngagement: climateMetrics.reduce((sum, m) => sum + m.engagement, 0) / climateMetrics.length,
    avgStress: climateMetrics.reduce((sum, m) => sum + m.stress, 0) / climateMetrics.length,
    activeSurveys: surveys.filter(s => s.status === 'active').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienestar y Clima Laboral
              </h1>
              <p className="text-gray-600">
                Monitoreo y mejora del ambiente y bienestar organizacional
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isNewSurveyOpen} onOpenChange={setIsNewSurveyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Nueva Encuesta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Encuesta</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="surveyTitle">Título de la Encuesta</Label>
                    <Input id="surveyTitle" placeholder="Ej: Encuesta de Clima Laboral" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surveyType">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="climate">Clima Laboral</SelectItem>
                        <SelectItem value="satisfaction">Satisfacción</SelectItem>
                        <SelectItem value="wellbeing">Bienestar</SelectItem>
                        <SelectItem value="feedback">Retroalimentación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Fecha Límite</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewSurveyOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewSurveyOpen(false)}>
                    Crear Encuesta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewProgramOpen} onOpenChange={setIsNewProgramOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Programa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Programa de Bienestar</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="programName">Nombre del Programa</Label>
                    <Input id="programName" placeholder="Ej: Programa de Actividad Física" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="programType">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Físico</SelectItem>
                        <SelectItem value="mental">Mental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="professional">Profesional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordinator">Coordinador</Label>
                    <Input id="coordinator" placeholder="Nombre del coordinador" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Cupo Máximo</Label>
                    <Input id="maxParticipants" type="number" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Presupuesto</Label>
                    <Input id="cost" type="number" placeholder="25000" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewProgramOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewProgramOpen(false)}>
                    Crear Programa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.avgSatisfaction)}%</div>
                  <div className="text-xs text-gray-600">Satisfacción</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.avgEngagement)}%</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.avgStress)}%</div>
                  <div className="text-xs text-gray-600">Nivel de Estrés</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.activePrograms}</div>
                  <div className="text-xs text-gray-600">Programas Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                  <div className="text-xs text-gray-600">Participantes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeSurveys}</div>
                  <div className="text-xs text-gray-600">Encuestas Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="programs">Programas</TabsTrigger>
            <TabsTrigger value="surveys">Encuestas</TabsTrigger>
            <TabsTrigger value="climate">Clima</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencias de Bienestar</CardTitle>
                  <CardDescription>Evolución mensual de indicadores clave</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={wellnessTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="satisfaccion" stroke="#22c55e" name="Satisfacción %" />
                      <Line type="monotone" dataKey="engagement" stroke="#3b82f6" name="Engagement %" />
                      <Line type="monotone" dataKey="estres" stroke="#ef4444" name="Estrés %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Participación en Programas</CardTitle>
                  <CardDescription>Número de participantes por programa activo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={programParticipation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="programa" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="participantes" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Resumen de encuestas activas */}
            <Card>
              <CardHeader>
                <CardTitle>Encuestas en Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveys.filter(s => s.status === 'active').map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{survey.title}</h3>
                        <p className="text-sm text-gray-600">
                          {survey.responses}/{survey.targetResponses} respuestas
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round((survey.responses / survey.targetResponses) * 100)}% completado
                          </div>
                          <Progress value={(survey.responses / survey.targetResponses) * 100} className="w-24 h-2" />
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Activa
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
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
                        placeholder="Programa o coordinador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="physical">Físico</SelectItem>
                        <SelectItem value="mental">Mental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="professional">Profesional</SelectItem>
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
                        <SelectItem value="upcoming">Próximo</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
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

            {/* Lista de programas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={getTypeColor(program.type)}>
                          {getTypeIcon(program.type)}
                        </div>
                        <Badge variant="outline" className={getStatusColor(program.status)}>
                          {getStatusText(program.status)}
                        </Badge>
                      </div>
                      {program.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{program.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{program.coordinator}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(program.startDate).toLocaleDateString('es-MX')} - {new Date(program.endDate).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span>{program.participants}/{program.maxParticipants} participantes</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ocupación</span>
                        <span>{Math.round((program.participants / program.maxParticipants) * 100)}%</span>
                      </div>
                      <Progress value={(program.participants / program.maxParticipants) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(program.cost)}
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="surveys">
            <div className="space-y-6">
              {surveys.map((survey) => (
                <Card key={survey.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{survey.title}</h3>
                        <p className="text-sm text-gray-600">
                          Creada: {new Date(survey.createdDate).toLocaleDateString('es-MX')} • 
                          Cierra: {new Date(survey.deadline).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {survey.avgScore > 0 && (
                          <div className="text-right">
                            <div className="text-lg font-bold">{survey.avgScore.toFixed(1)}/5</div>
                            <div className="text-xs text-gray-500">Puntuación</div>
                          </div>
                        )}
                        <Badge variant="outline" className={getStatusColor(survey.status)}>
                          {getStatusText(survey.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{survey.responses}</div>
                        <div className="text-sm text-gray-600">Respuestas recibidas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{survey.targetResponses}</div>
                        <div className="text-sm text-gray-600">Meta de respuestas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round((survey.responses / survey.targetResponses) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Progreso</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Progress value={(survey.responses / survey.targetResponses) * 100} className="h-3" />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        Ver Resultados
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="climate">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Clima por Departamento</CardTitle>
                <CardDescription>
                  Evaluación detallada del ambiente laboral por área
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {climateMetrics.map((metric) => (
                    <div key={metric.department} className="p-6 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-4">{metric.department}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Satisfacción</div>
                          <div className="text-2xl font-bold text-green-600">{metric.satisfaction}%</div>
                          <Progress value={metric.satisfaction} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Engagement</div>
                          <div className="text-2xl font-bold text-blue-600">{metric.engagement}%</div>
                          <Progress value={metric.engagement} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Estrés</div>
                          <div className="text-2xl font-bold text-red-600">{metric.stress}%</div>
                          <Progress value={metric.stress} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Balance</div>
                          <div className="text-2xl font-bold text-purple-600">{metric.workLifeBalance}%</div>
                          <Progress value={metric.workLifeBalance} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Comunicación</div>
                          <div className="text-2xl font-bold text-orange-600">{metric.communication}%</div>
                          <Progress value={metric.communication} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Liderazgo</div>
                          <div className="text-2xl font-bold text-pink-600">{metric.leadership}%</div>
                          <Progress value={metric.leadership} className="h-2 mt-1" />
                        </div>
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
                  <CardTitle>Satisfacción por Departamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={climateMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="satisfaction" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Radar de Clima Organizacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={climateMetrics}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="department" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Satisfacción" dataKey="satisfaction" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Radar name="Engagement" dataKey="engagement" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default WellnessClimate;