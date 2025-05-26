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
  Trophy, 
  Plus, 
  Search, 
  Building,
  Users,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Star,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Target,
  BarChart3,
  PieChart,
  Handshake,
  Gift
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface Sponsor {
  id: number;
  name: string;
  category: 'corporativo' | 'local' | 'institucional' | 'ong';
  logo: string;
  contact: {
    representative: string;
    email: string;
    phone: string;
    address: string;
  };
  status: 'activo' | 'potencial' | 'inactivo' | 'renovacion';
  level: 'bronce' | 'plata' | 'oro' | 'platino';
  contractValue: number;
  contractStart: string;
  contractEnd: string;
  eventsSponsored: number;
  renewalProbability: number;
  notes: string;
}

interface SponsorshipPackage {
  id: number;
  name: string;
  level: 'bronce' | 'plata' | 'oro' | 'platino';
  price: number;
  duration: number; // meses
  benefits: string[];
  eventsIncluded: number;
  exposureLevel: 'bajo' | 'medio' | 'alto' | 'premium';
  isActive: boolean;
}

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  sponsorsCount: number;
  revenue: number;
  status: 'planificacion' | 'activa' | 'completada' | 'cancelada';
  events: string[];
}

const SponsorsManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewSponsorOpen, setIsNewSponsorOpen] = useState(false);
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isViewSponsorOpen, setIsViewSponsorOpen] = useState(false);

  // Datos de patrocinadores
  const sponsors: Sponsor[] = [
    {
      id: 1,
      name: "Coca-Cola FEMSA",
      category: "corporativo",
      logo: "/api/placeholder/100/50",
      contact: {
        representative: "María García",
        email: "maria.garcia@cocacola.com",
        phone: "+52 33 1234-5678",
        address: "Av. López Mateos 2375, Guadalajara"
      },
      status: "activo",
      level: "platino",
      contractValue: 500000,
      contractStart: "2025-01-01",
      contractEnd: "2025-12-31",
      eventsSponsored: 12,
      renewalProbability: 95,
      notes: "Excelente relación, renovación casi segura"
    },
    {
      id: 2,
      name: "Banco Santander",
      category: "corporativo",
      logo: "/api/placeholder/100/50",
      contact: {
        representative: "Carlos Mendoza",
        email: "carlos.mendoza@santander.com.mx",
        phone: "+52 33 2345-6789",
        address: "Av. Vallarta 1020, Guadalajara"
      },
      status: "activo",
      level: "oro",
      contractValue: 300000,
      contractStart: "2025-01-01",
      contractEnd: "2025-12-31",
      eventsSponsored: 8,
      renewalProbability: 85,
      notes: "Interesados en aumentar presencia"
    },
    {
      id: 3,
      name: "Farmacias Guadalajara",
      category: "local",
      logo: "/api/placeholder/100/50",
      contact: {
        representative: "Ana López",
        email: "ana.lopez@farmaciasguadalajara.com",
        phone: "+52 33 3456-7890",
        address: "Av. México 2847, Guadalajara"
      },
      status: "activo",
      level: "plata",
      contractValue: 150000,
      contractStart: "2025-01-01",
      contractEnd: "2025-12-31",
      eventsSponsored: 6,
      renewalProbability: 78,
      notes: "Patrocinador local comprometido"
    },
    {
      id: 4,
      name: "Universidad de Guadalajara",
      category: "institucional",
      logo: "/api/placeholder/100/50",
      contact: {
        representative: "Dr. Roberto Silva",
        email: "roberto.silva@udg.mx",
        phone: "+52 33 4567-8901",
        address: "Av. Juárez 976, Guadalajara"
      },
      status: "renovacion",
      level: "oro",
      contractValue: 200000,
      contractStart: "2024-01-01",
      contractEnd: "2024-12-31",
      eventsSponsored: 10,
      renewalProbability: 70,
      notes: "En proceso de renovación para 2025"
    },
    {
      id: 5,
      name: "Telmex",
      category: "corporativo",
      logo: "/api/placeholder/100/50",
      contact: {
        representative: "Patricia Ruiz",
        email: "patricia.ruiz@telmex.com",
        phone: "+52 33 5678-9012",
        address: "Av. Americas 1500, Guadalajara"
      },
      status: "potencial",
      level: "plata",
      contractValue: 180000,
      contractStart: "2025-06-01",
      contractEnd: "2026-05-31",
      eventsSponsored: 0,
      renewalProbability: 60,
      notes: "Propuesta enviada, en evaluación"
    }
  ];

  // Paquetes de patrocinio
  const sponsorshipPackages: SponsorshipPackage[] = [
    {
      id: 1,
      name: "Paquete Platino",
      level: "platino",
      price: 500000,
      duration: 12,
      benefits: [
        "Logo principal en todos los eventos",
        "Stand exclusivo premium",
        "Menciones en redes sociales",
        "Activaciones especiales",
        "Reportes mensuales detallados",
        "Acceso VIP a eventos"
      ],
      eventsIncluded: 15,
      exposureLevel: "premium",
      isActive: true
    },
    {
      id: 2,
      name: "Paquete Oro",
      level: "oro",
      price: 300000,
      duration: 12,
      benefits: [
        "Logo destacado en eventos",
        "Stand premium",
        "Menciones en redes sociales",
        "Reportes trimestrales",
        "Activaciones comerciales"
      ],
      eventsIncluded: 10,
      exposureLevel: "alto",
      isActive: true
    },
    {
      id: 3,
      name: "Paquete Plata",
      level: "plata",
      price: 150000,
      duration: 12,
      benefits: [
        "Logo en materiales promocionales",
        "Stand estándar",
        "Menciones ocasionales",
        "Reportes semestrales"
      ],
      eventsIncluded: 6,
      exposureLevel: "medio",
      isActive: true
    },
    {
      id: 4,
      name: "Paquete Bronce",
      level: "bronce",
      price: 75000,
      duration: 12,
      benefits: [
        "Logo en materiales básicos",
        "Espacio de exhibición",
        "Reportes anuales"
      ],
      eventsIncluded: 3,
      exposureLevel: "bajo",
      isActive: true
    }
  ];

  // Campañas
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: "Temporada Primavera 2025",
      startDate: "2025-03-01",
      endDate: "2025-05-31",
      budget: 800000,
      sponsorsCount: 8,
      revenue: 950000,
      status: "activa",
      events: ["Festival de Primavera", "Día del Niño", "Concierto al Aire Libre"]
    },
    {
      id: 2,
      name: "Verano en los Parques",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      budget: 1200000,
      sponsorsCount: 12,
      revenue: 1350000,
      status: "planificacion",
      events: ["Cine bajo las Estrellas", "Clases de Yoga", "Festival de Música"]
    }
  ];

  // Datos para gráficas
  const revenueData = [
    { month: 'Ene', ingresos: 180000, meta: 200000 },
    { month: 'Feb', ingresos: 220000, meta: 250000 },
    { month: 'Mar', ingresos: 280000, meta: 300000 },
    { month: 'Abr', ingresos: 350000, meta: 350000 },
    { month: 'May', ingresos: 420000, meta: 400000 },
    { month: 'Jun', ingresos: 150000, meta: 450000 }
  ];

  const sponsorDistribution = [
    { name: 'Corporativo', value: 60, count: 3, color: '#22c55e' },
    { name: 'Local', value: 25, count: 1, color: '#3b82f6' },
    { name: 'Institucional', value: 10, count: 1, color: '#f59e0b' },
    { name: 'ONG', value: 5, count: 0, color: '#8b5cf6' }
  ];

  const levelDistribution = [
    { level: 'Platino', sponsors: 1, revenue: 500000 },
    { level: 'Oro', sponsors: 2, revenue: 500000 },
    { level: 'Plata', sponsors: 2, revenue: 330000 },
    { level: 'Bronce', sponsors: 0, revenue: 0 }
  ];

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.contact.representative.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sponsor.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || sponsor.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'potencial': return 'bg-blue-100 text-blue-800';
      case 'renovacion': return 'bg-yellow-100 text-yellow-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'potencial': return 'Potencial';
      case 'renovacion': return 'Renovación';
      case 'inactivo': return 'Inactivo';
      default: return 'Desconocido';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platino': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'oro': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'plata': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bronce': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platino': return '💎';
      case 'oro': return '🥇';
      case 'plata': return '🥈';
      case 'bronce': return '🥉';
      default: return '⭐';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsViewSponsorOpen(true);
  };

  // Estadísticas
  const stats = {
    totalSponsors: sponsors.length,
    activeSponsors: sponsors.filter(s => s.status === 'activo').length,
    totalRevenue: sponsors.reduce((sum, s) => sum + s.contractValue, 0),
    avgContractValue: sponsors.reduce((sum, s) => sum + s.contractValue, 0) / sponsors.length,
    renewalRate: Math.round(sponsors.reduce((sum, s) => sum + s.renewalProbability, 0) / sponsors.length),
    eventsSponsored: sponsors.reduce((sum, s) => sum + s.eventsSponsored, 0)
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Patrocinios
              </h1>
              <p className="text-gray-600">
                Administración integral de patrocinadores y alianzas estratégicas
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isNewPackageOpen} onOpenChange={setIsNewPackageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Nuevo Paquete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Paquete de Patrocinio</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="packageName">Nombre del Paquete</Label>
                    <Input id="packageName" placeholder="Ej: Paquete Oro Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronce">Bronce</SelectItem>
                        <SelectItem value="plata">Plata</SelectItem>
                        <SelectItem value="oro">Oro</SelectItem>
                        <SelectItem value="platino">Platino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input id="price" type="number" placeholder="150000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (meses)</Label>
                    <Input id="duration" type="number" placeholder="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventsIncluded">Eventos Incluidos</Label>
                    <Input id="eventsIncluded" type="number" placeholder="6" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewPackageOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewPackageOpen(false)}>
                    Crear Paquete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewSponsorOpen} onOpenChange={setIsNewSponsorOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Patrocinador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Patrocinador</DialogTitle>
                  <DialogDescription>
                    Complete la información del patrocinador
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="sponsorName">Nombre de la Empresa</Label>
                    <Input id="sponsorName" placeholder="Ej: Coca-Cola FEMSA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporativo">Corporativo</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="institucional">Institucional</SelectItem>
                        <SelectItem value="ong">ONG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel de Patrocinio</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronce">Bronce</SelectItem>
                        <SelectItem value="plata">Plata</SelectItem>
                        <SelectItem value="oro">Oro</SelectItem>
                        <SelectItem value="platino">Platino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="representative">Representante</Label>
                    <Input id="representative" placeholder="Nombre del contacto" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="contacto@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" placeholder="+52 33 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractValue">Valor del Contrato</Label>
                    <Input id="contractValue" type="number" placeholder="300000" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" placeholder="Dirección completa" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewSponsorOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewSponsorOpen(false)}>
                    Registrar Patrocinador
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
                <Building className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalSponsors}</div>
                  <div className="text-xs text-gray-600">Total Patrocinadores</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeSponsors}</div>
                  <div className="text-xs text-gray-600">Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-xs text-gray-600">Ingresos Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgContractValue)}</div>
                  <div className="text-xs text-gray-600">Valor Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.renewalRate}%</div>
                  <div className="text-xs text-gray-600">Tasa Renovación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.eventsSponsored}</div>
                  <div className="text-xs text-gray-600">Eventos Patrocinados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
            <TabsTrigger value="packages">Paquetes</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Patrocinios</CardTitle>
                  <CardDescription>Evolución mensual de ingresos vs metas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                      <Bar dataKey="meta" fill="#3b82f6" name="Meta" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categoría</CardTitle>
                  <CardDescription>Porcentaje de patrocinadores por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={sponsorDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sponsorDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Patrocinadores destacados */}
            <Card>
              <CardHeader>
                <CardTitle>Patrocinadores Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sponsors.filter(s => s.status === 'activo').slice(0, 3).map((sponsor) => (
                    <div key={sponsor.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{sponsor.name}</h3>
                        <Badge variant="outline" className={getLevelColor(sponsor.level)}>
                          {getLevelIcon(sponsor.level)} {sponsor.level.charAt(0).toUpperCase() + sponsor.level.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>Valor: {formatCurrency(sponsor.contractValue)}</div>
                        <div>Eventos: {sponsor.eventsSponsored}</div>
                        <div>Renovación: {sponsor.renewalProbability}%</div>
                      </div>
                      <Progress value={sponsor.renewalProbability} className="mt-3 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
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
                        placeholder="Nombre o representante..."
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
                        <SelectItem value="corporativo">Corporativo</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="institucional">Institucional</SelectItem>
                        <SelectItem value="ong">ONG</SelectItem>
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
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="potencial">Potencial</SelectItem>
                        <SelectItem value="renovacion">Renovación</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
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

            {/* Lista de patrocinadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{sponsor.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{sponsor.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(sponsor.status)}>
                        {getStatusText(sponsor.status)}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{sponsor.contact.representative}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{sponsor.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-green-600">{formatCurrency(sponsor.contractValue)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={getLevelColor(sponsor.level)}>
                        {getLevelIcon(sponsor.level)} {sponsor.level.charAt(0).toUpperCase() + sponsor.level.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">{sponsor.eventsSponsored} eventos</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Probabilidad de renovación</span>
                        <span className="font-medium">{sponsor.renewalProbability}%</span>
                      </div>
                      <Progress value={sponsor.renewalProbability} className="h-2" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewSponsor(sponsor)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sponsorshipPackages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{getLevelIcon(pkg.level)}</div>
                      <h3 className="font-bold text-lg">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      <p className="text-sm text-gray-600">{pkg.duration} meses</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Eventos incluidos:</span>
                        <span className="font-medium">{pkg.eventsIncluded}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nivel de exposición:</span>
                        <Badge variant="outline" className="text-xs">
                          {pkg.exposureLevel}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h4 className="font-medium text-sm">Beneficios incluidos:</h4>
                      <ul className="space-y-1">
                        {pkg.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                        {pkg.benefits.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{pkg.benefits.length - 3} beneficios más
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button className="w-full" size="sm">
                      <Handshake className="h-4 w-4 mr-2" />
                      Seleccionar Paquete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(campaign.startDate).toLocaleDateString('es-MX')} - {new Date(campaign.endDate).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(campaign.budget)}</div>
                        <div className="text-sm text-blue-800">Presupuesto</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(campaign.revenue)}</div>
                        <div className="text-sm text-green-800">Ingresos</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{campaign.sponsorsCount}</div>
                        <div className="text-sm text-purple-800">Patrocinadores</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{campaign.events.length}</div>
                        <div className="text-sm text-orange-800">Eventos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Eventos incluidos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {campaign.events.map((event, index) => (
                          <Badge key={index} variant="secondary">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Nivel de Patrocinio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={levelDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Ingresos']} />
                      <Bar dataKey="revenue" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Reporte de Renovaciones", description: "Análisis de renovaciones de contratos", icon: TrendingUp, color: "blue" },
                  { title: "ROI por Patrocinador", description: "Retorno de inversión detallado", icon: BarChart3, color: "green" },
                  { title: "Cumplimiento de Beneficios", description: "Seguimiento de contrapartidas", icon: CheckCircle, color: "purple" },
                  { title: "Análisis de Mercado", description: "Oportunidades y tendencias", icon: Target, color: "orange" },
                  { title: "Reporte Financiero", description: "Estado financiero de patrocinios", icon: DollarSign, color: "red" },
                  { title: "Métricas de Exposición", description: "Alcance y visibilidad obtenida", icon: Star, color: "yellow" }
                ].map((report, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 bg-${report.color}-100 rounded-lg`}>
                          <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generar Reporte
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de visualización de patrocinador */}
        <Dialog open={isViewSponsorOpen} onOpenChange={setIsViewSponsorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedSponsor && (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{selectedSponsor.name}</div>
                      <div className="text-sm text-gray-600 font-normal capitalize">{selectedSponsor.category}</div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedSponsor.status)}>
                      {getStatusText(selectedSponsor.status)}
                    </Badge>
                    <Badge variant="outline" className={getLevelColor(selectedSponsor.level)}>
                      {getLevelIcon(selectedSponsor.level)} {selectedSponsor.level.charAt(0).toUpperCase() + selectedSponsor.level.slice(1)}
                    </Badge>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedSponsor && (
              <div className="space-y-6">
                {/* Información del contrato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Contrato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Valor del Contrato</div>
                          <div className="font-medium text-green-600 text-lg">{formatCurrency(selectedSponsor.contractValue)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Vigencia</div>
                          <div className="font-medium">
                            {new Date(selectedSponsor.contractStart).toLocaleDateString('es-MX')} - {new Date(selectedSponsor.contractEnd).toLocaleDateString('es-MX')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Eventos Patrocinados</div>
                          <div className="font-medium">{selectedSponsor.eventsSponsored}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Representante</div>
                          <div className="font-medium">{selectedSponsor.contact.representative}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Correo Electrónico</div>
                          <div className="font-medium">{selectedSponsor.contact.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Teléfono</div>
                          <div className="font-medium">{selectedSponsor.contact.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Dirección</div>
                          <div className="font-medium">{selectedSponsor.contact.address}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Análisis de renovación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análisis de Renovación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Probabilidad de renovación</span>
                        <span className="font-bold text-lg">{selectedSponsor.renewalProbability}%</span>
                      </div>
                      <Progress value={selectedSponsor.renewalProbability} className="h-3" />
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Notas:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedSponsor.notes}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Propuesta
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
                  </Button>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar
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

export default SponsorsManagement;