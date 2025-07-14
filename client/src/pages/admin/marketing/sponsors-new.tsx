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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { SponsorshipPackage, Sponsor, SponsorshipCampaign } from '@/../../shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Esquemas para formularios
const packageSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  level: z.string().min(1, "El nivel es requerido"),
  price: z.string().min(1, "El precio es requerido"),
  duration: z.number().min(1, "La duración es requerida"),
  benefits: z.array(z.string()).min(1, "Al menos un beneficio es requerido"),
  eventsIncluded: z.number().min(0, "Los eventos incluidos no pueden ser negativos"),
  exposureLevel: z.string().min(1, "El nivel de exposición es requerido"),
  isActive: z.boolean().default(true)
});

const sponsorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  logo: z.string().optional(),
  representative: z.string().min(1, "El representante es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  status: z.string().min(1, "El estado es requerido"),
  level: z.string().min(1, "El nivel es requerido"),
  contractValue: z.string().min(1, "El valor del contrato es requerido"),
  contractStart: z.string().min(1, "La fecha de inicio es requerida"),
  contractEnd: z.string().min(1, "La fecha de fin es requerida"),
  eventsSponsored: z.number().min(0, "Los eventos patrocinados no pueden ser negativos"),
  renewalProbability: z.number().min(0).max(100, "La probabilidad debe estar entre 0 y 100"),
  notes: z.string().optional()
});

type PackageFormData = z.infer<typeof packageSchema>;
type SponsorFormData = z.infer<typeof sponsorSchema>;

const SponsorsManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewSponsorOpen, setIsNewSponsorOpen] = useState(false);
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isViewSponsorOpen, setIsViewSponsorOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultas para obtener datos del backend
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/sponsorship-packages'],
    queryFn: () => apiRequest<SponsorshipPackage[]>('/api/sponsorship-packages')
  });

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => apiRequest<Sponsor[]>('/api/sponsors')
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/sponsorship-campaigns'],
    queryFn: () => apiRequest<SponsorshipCampaign[]>('/api/sponsorship-campaigns')
  });

  // Estados de carga
  const isLoading = packagesLoading || sponsorsLoading || campaignsLoading;

  // Mutaciones para crear/actualizar datos
  const createPackageMutation = useMutation({
    mutationFn: (data: PackageFormData) => apiRequest('/api/sponsorship-packages', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsorship-packages'] });
      toast({ title: "Éxito", description: "Paquete creado exitosamente" });
      setIsNewPackageOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Error al crear paquete", variant: "destructive" });
    }
  });

  const createSponsorMutation = useMutation({
    mutationFn: (data: SponsorFormData) => apiRequest('/api/sponsors', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      toast({ title: "Éxito", description: "Patrocinador creado exitosamente" });
      setIsNewSponsorOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Error al crear patrocinador", variant: "destructive" });
    }
  });

  // Formularios
  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      level: '',
      price: '',
      duration: 12,
      benefits: [],
      eventsIncluded: 0,
      exposureLevel: '',
      isActive: true
    }
  });

  const sponsorForm = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: '',
      category: '',
      logo: '',
      representative: '',
      email: '',
      phone: '',
      address: '',
      status: '',
      level: '',
      contractValue: '',
      contractStart: '',
      contractEnd: '',
      eventsSponsored: 0,
      renewalProbability: 0,
      notes: ''
    }
  });

  const onSubmitPackage = (data: PackageFormData) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price).toString(),
      benefits: data.benefits.filter(benefit => benefit.trim() !== '')
    };
    createPackageMutation.mutate(formattedData);
  };

  const onSubmitSponsor = (data: SponsorFormData) => {
    const formattedData = {
      ...data,
      contractValue: parseFloat(data.contractValue).toString()
    };
    createSponsorMutation.mutate(formattedData);
  };

  // Filtros
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.representative.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sponsor.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || sponsor.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Función para obtener el color del badge por nivel
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'platino': return 'bg-gray-700 text-white';
      case 'oro': return 'bg-yellow-500 text-white';
      case 'plata': return 'bg-gray-300 text-gray-800';
      case 'bronce': return 'bg-orange-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color del badge por estado
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'activo': return 'bg-green-500 text-white';
      case 'potencial': return 'bg-blue-500 text-white';
      case 'inactivo': return 'bg-gray-400 text-white';
      case 'renovacion': return 'bg-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Cálculos del dashboard
  const totalRevenue = sponsors.reduce((sum, sponsor) => sum + parseFloat(sponsor.contractValue), 0);
  const activeSponsors = sponsors.filter(s => s.status === 'activo').length;
  const averageRenewal = sponsors.reduce((sum, sponsor) => sum + sponsor.renewalProbability, 0) / sponsors.length || 0;
  const totalEvents = sponsors.reduce((sum, sponsor) => sum + sponsor.eventsSponsored, 0);

  // Colores para las gráficas
  const COLORS = ['#00a587', '#067f5f', '#bcd256', '#8498a5', '#d4ad2a'];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00a587] mx-auto"></div>
            <p className="mt-4 text-lg">Cargando datos de patrocinios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Patrocinios</h1>
            <p className="text-gray-600">Administra patrocinadores, paquetes y campañas</p>
          </div>
          <div className="flex space-x-4">
            <Dialog open={isNewPackageOpen} onOpenChange={setIsNewPackageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00a587] hover:bg-[#067f5f] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Paquete
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Paquete</DialogTitle>
                  <DialogDescription>
                    Configure un nuevo paquete de patrocinio
                  </DialogDescription>
                </DialogHeader>
                <Form {...packageForm}>
                  <form onSubmit={packageForm.handleSubmit(onSubmitPackage)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={packageForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Paquete</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Paquete Premium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bronce">Bronce</SelectItem>
                                <SelectItem value="plata">Plata</SelectItem>
                                <SelectItem value="oro">Oro</SelectItem>
                                <SelectItem value="platino">Platino</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={packageForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (meses)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="12" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={packageForm.control}
                        name="eventsIncluded"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eventos Incluidos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={packageForm.control}
                        name="exposureLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel de Exposición</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bajo">Bajo</SelectItem>
                                <SelectItem value="medio">Medio</SelectItem>
                                <SelectItem value="alto">Alto</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={packageForm.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beneficios (separados por comas)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Logo en eventos, Stand exclusivo, Menciones en redes sociales"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.split(',').map(b => b.trim()))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsNewPackageOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]">
                        Crear Paquete
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog open={isNewSponsorOpen} onOpenChange={setIsNewSponsorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#067f5f] hover:bg-[#00a587] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Patrocinador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Patrocinador</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo patrocinador en el sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...sponsorForm}>
                  <form onSubmit={sponsorForm.handleSubmit(onSubmitSponsor)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Coca-Cola FEMSA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="corporativo">Corporativo</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                                <SelectItem value="institucional">Institucional</SelectItem>
                                <SelectItem value="ong">ONG</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="representative"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Representante</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del representante" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="representante@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+52 33 1234-5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input placeholder="Dirección completa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="potencial">Potencial</SelectItem>
                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                <SelectItem value="renovacion">Renovación</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bronce">Bronce</SelectItem>
                                <SelectItem value="plata">Plata</SelectItem>
                                <SelectItem value="oro">Oro</SelectItem>
                                <SelectItem value="platino">Platino</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="contractValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor del Contrato</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="500000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="renewalProbability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probabilidad de Renovación (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="85" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sponsorForm.control}
                        name="contractStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sponsorForm.control}
                        name="contractEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Fin</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={sponsorForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas adicionales sobre el patrocinador"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsNewSponsorOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#00a587] hover:bg-[#067f5f]">
                        Crear Patrocinador
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
            <TabsTrigger value="packages">Paquetes</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Contratos activos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patrocinadores Activos</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSponsors}</div>
                  <p className="text-xs text-muted-foreground">De {sponsors.length} totales</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Probabilidad de Renovación</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRenewal.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Promedio general</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Patrocinados</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEvents}</div>
                  <p className="text-xs text-muted-foreground">Total en 2025</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Corporativo', value: sponsors.filter(s => s.category === 'corporativo').length },
                          { name: 'Local', value: sponsors.filter(s => s.category === 'local').length },
                          { name: 'Institucional', value: sponsors.filter(s => s.category === 'institucional').length },
                          { name: 'ONG', value: sponsors.filter(s => s.category === 'ong').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sponsors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { level: 'Platino', ingresos: sponsors.filter(s => s.level === 'platino').reduce((sum, s) => sum + parseFloat(s.contractValue), 0) },
                      { level: 'Oro', ingresos: sponsors.filter(s => s.level === 'oro').reduce((sum, s) => sum + parseFloat(s.contractValue), 0) },
                      { level: 'Plata', ingresos: sponsors.filter(s => s.level === 'plata').reduce((sum, s) => sum + parseFloat(s.contractValue), 0) },
                      { level: 'Bronce', ingresos: sponsors.filter(s => s.level === 'bronce').reduce((sum, s) => sum + parseFloat(s.contractValue), 0) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#00a587" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar patrocinador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="corporativo">Corporativo</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="ong">ONG</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="potencial">Potencial</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="renovacion">Renovación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de patrocinadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {sponsor.representative}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={getLevelColor(sponsor.level)}>
                          {sponsor.level.charAt(0).toUpperCase() + sponsor.level.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(sponsor.status)}>
                          {sponsor.status.charAt(0).toUpperCase() + sponsor.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {sponsor.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {sponsor.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ${parseFloat(sponsor.contractValue).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {sponsor.eventsSponsored} eventos
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                          <span>Probabilidad de renovación</span>
                          <span>{sponsor.renewalProbability}%</span>
                        </div>
                        <Progress value={sponsor.renewalProbability} className="h-2" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSponsor(sponsor);
                          setIsViewSponsorOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSponsors.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron patrocinadores con los filtros aplicados</p>
              </div>
            )}
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <CardDescription>
                          <Badge className={getLevelColor(pkg.level)}>
                            {pkg.level.charAt(0).toUpperCase() + pkg.level.slice(1)}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#00a587]">
                          ${parseFloat(pkg.price).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{pkg.duration} meses</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {pkg.eventsIncluded} eventos incluidos
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        Exposición {pkg.exposureLevel}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Beneficios:</p>
                        <div className="space-y-1">
                          {pkg.benefits?.slice(0, 3).map((benefit, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                              {benefit}
                            </div>
                          ))}
                          {pkg.benefits?.length > 3 && (
                            <p className="text-sm text-gray-500">+{pkg.benefits.length - 3} más...</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {packages.length === 0 && (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay paquetes de patrocinio disponibles</p>
              </div>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>
                          {campaign.startDate} - {campaign.endDate}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Presupuesto: ${parseFloat(campaign.budget).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        {campaign.sponsorsCount} patrocinadores
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Ingresos: ${parseFloat(campaign.revenue).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {campaign.events?.length || 0} eventos
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay campañas de patrocinio disponibles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal para ver detalles del patrocinador */}
        <Dialog open={isViewSponsorOpen} onOpenChange={setIsViewSponsorOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Patrocinador</DialogTitle>
            </DialogHeader>
            {selectedSponsor && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSponsor.name}</h3>
                    <p className="text-gray-600">{selectedSponsor.category}</p>
                    <div className="flex space-x-2 mt-2">
                      <Badge className={getLevelColor(selectedSponsor.level)}>
                        {selectedSponsor.level}
                      </Badge>
                      <Badge className={getStatusColor(selectedSponsor.status)}>
                        {selectedSponsor.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#00a587]">
                      ${parseFloat(selectedSponsor.contractValue).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedSponsor.contractStart} - {selectedSponsor.contractEnd}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información de Contacto</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        {selectedSponsor.representative}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedSponsor.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedSponsor.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedSponsor.address}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Estadísticas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Eventos patrocinados:</span>
                        <span className="text-sm font-medium">{selectedSponsor.eventsSponsored}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Prob. renovación:</span>
                        <span className="text-sm font-medium">{selectedSponsor.renewalProbability}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={selectedSponsor.renewalProbability} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedSponsor.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notas</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedSponsor.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default SponsorsManagement;