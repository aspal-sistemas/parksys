import { useState, useEffect } from "react";
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
  Gift,
  Upload,
  Image,
  X
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorshipPackage, Sponsor, SponsorshipCampaign } from '@/../../shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

// Esquemas para formularios actualizados con la nueva estructura
const packageSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  price: z.string().min(1, "El precio es requerido"),
  duration: z.number().min(1, "La duración es requerida"),
  benefits: z.array(z.string()).min(1, "Al menos un beneficio es requerido"),
  isActive: z.boolean().default(true)
});

const sponsorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  logo: z.string().optional(),
  representative: z.string().min(1, "El representante es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  status: z.string().min(1, "El estado es requerido"),
  packageCategory: z.string().min(1, "La categoría del paquete es requerida"),
  contractStart: z.string().min(1, "La fecha de inicio es requerida"),
  renewalProbability: z.number().min(0).max(100, "La probabilidad debe estar entre 0 y 100"),
  websiteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  notes: z.string().optional(),
  // Campos calculados automáticamente
  contractValue: z.number().optional(),
  contractEnd: z.string().optional(),
  eventsSponsored: z.number().optional()
});

type PackageFormData = z.infer<typeof packageSchema>;
type SponsorFormData = z.infer<typeof sponsorSchema>;

const SponsorsManagement = () => {
  const [activeTab, setActiveTab] = useState("sponsors");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewSponsorOpen, setIsNewSponsorOpen] = useState(false);
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isViewSponsorOpen, setIsViewSponsorOpen] = useState(false);
  const [isEditSponsorOpen, setIsEditSponsorOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage | null>(null);
  const [isViewPackageOpen, setIsViewPackageOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  // Estados separados para cada modal
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultas para obtener datos del backend
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/sponsorship-packages'],
    queryFn: () => safeApiRequest('/api/sponsorship-packages')
  });

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors')
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/sponsorship-campaigns'],
    queryFn: () => safeApiRequest('/api/sponsorship-campaigns')
  });

  // Mutaciones para crear/actualizar datos
  const createPackageMutation = useMutation({
    mutationFn: (data: PackageFormData) => safeApiRequest('/api/sponsorship-packages', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsorship-packages'] });
      toast({ title: "Éxito", description: "Paquete creado exitosamente" });
      setIsNewPackageOpen(false);
      packageForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Error al crear paquete", variant: "destructive" });
    }
  });

  const createSponsorMutation = useMutation({
    mutationFn: (data: SponsorFormData) => safeApiRequest('/api/sponsors', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      toast({ title: "Éxito", description: "Patrocinador creado exitosamente" });
      setIsNewSponsorOpen(false);
      sponsorForm.reset();
      setLogoFile(null);
      setLogoPreview("");
    },
    onError: () => {
      toast({ title: "Error", description: "Error al crear patrocinador", variant: "destructive" });
    }
  });

  const updateSponsorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: SponsorFormData }) => 
      safeApiRequest(`/api/sponsors/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsors'] });
      toast({ title: "Éxito", description: "Patrocinador actualizado exitosamente" });
      setIsEditSponsorOpen(false);
      editSponsorForm.reset();
      setEditLogoFile(null);
      setEditLogoPreview("");
    },
    onError: () => {
      toast({ title: "Error", description: "Error al actualizar patrocinador", variant: "destructive" });
    }
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: PackageFormData }) => 
      safeApiRequest(`/api/sponsorship-packages/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsorship-packages'] });
      toast({ title: "Éxito", description: "Paquete actualizado exitosamente" });
      setIsEditPackageOpen(false);
      editPackageForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Error al actualizar paquete", variant: "destructive" });
    }
  });

  // Formularios
  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      category: '',
      price: '',
      duration: 12,
      benefits: [],
      isActive: true
    }
  });

  const sponsorForm = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: '',
      type: '',
      logo: '',
      representative: '',
      email: '',
      phone: '',
      address: '',
      status: '',
      packageCategory: '',
      contractStart: '',
      renewalProbability: 0,
      websiteUrl: '',
      notes: '',
      contractValue: 0,
      contractEnd: '',
      eventsSponsored: 0
    }
  });

  const editSponsorForm = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: '',
      type: '',
      logo: '',
      representative: '',
      email: '',
      phone: '',
      address: '',
      status: '',
      packageCategory: '',
      contractStart: '',
      renewalProbability: 0,
      websiteUrl: '',
      notes: '',
      contractValue: 0,
      contractEnd: '',
      eventsSponsored: 0
    }
  });

  const editPackageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      category: '',
      price: '',
      duration: 12,
      benefits: [],
      isActive: true
    }
  });

  // Watch para calcular automáticamente campos dependientes de la categoría del paquete
  const watchedPackageCategory = sponsorForm.watch('packageCategory');
  const watchedContractStart = sponsorForm.watch('contractStart');
  
  useEffect(() => {
    if (watchedPackageCategory && packages.length > 0) {
      const selectedPackage = packages.find(pkg => pkg.category === watchedPackageCategory);
      
      if (selectedPackage) {
        sponsorForm.setValue('contractValue', parseFloat(selectedPackage.price));
      }
    }
  }, [watchedPackageCategory, packages]);
  
  useEffect(() => {
    if (watchedContractStart) {
      const startDate = new Date(watchedContractStart);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      sponsorForm.setValue('contractEnd', endDate.toISOString().split('T')[0]);
    }
  }, [watchedContractStart]);

  // Watch para el formulario de edición
  const watchedEditPackageCategory = editSponsorForm.watch('packageCategory');
  const watchedEditContractStart = editSponsorForm.watch('contractStart');
  
  useEffect(() => {
    if (watchedEditPackageCategory && packages.length > 0) {
      const selectedPackage = packages.find(pkg => pkg.category === watchedEditPackageCategory);
      
      if (selectedPackage) {
        editSponsorForm.setValue('contractValue', parseFloat(selectedPackage.price));
      }
    }
  }, [watchedEditPackageCategory, packages]);
  
  useEffect(() => {
    if (watchedEditContractStart) {
      const startDate = new Date(watchedEditContractStart);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      editSponsorForm.setValue('contractEnd', endDate.toISOString().split('T')[0]);
    }
  }, [watchedEditContractStart]);

  // Función para subir logo
  const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('logo', file);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userId = "1";
    let userRole = "super_admin";
    
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        userId = userObj.id.toString();
        userRole = userObj.role || "admin";
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    const headers: Record<string, string> = {
      "Authorization": storedToken ? `Bearer ${storedToken}` : "Bearer direct-token-1750522117022",
      "X-User-Id": userId,
      "X-User-Role": userRole
    };

    const response = await fetch('/api/upload/sponsor-logo', {
      method: 'POST',
      headers,
      body: formData,
      credentials: "include"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al subir el logo' }));
      throw new Error(errorData.message || 'Error al subir el logo');
    }

    const data = await response.json();
    return data.filePath;
  };

  // Funciones para manejar archivos de logo
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const removeEditLogoPreview = () => {
    setEditLogoFile(null);
    setEditLogoPreview("");
  };

  const onSubmitSponsor = async (data: SponsorFormData) => {
    try {
      setIsUploadingLogo(true);
      let logoUrl = '';

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      if (!data.packageCategory) {
        toast({
          title: "Error",
          description: "Debes seleccionar una categoría de paquete",
          variant: "destructive"
        });
        return;
      }

      if (!data.contractValue || data.contractValue === 0) {
        toast({
          title: "Error",
          description: "El valor del contrato no se calculó correctamente.",
          variant: "destructive"
        });
        return;
      }

      const formattedData = {
        ...data,
        category: data.type, // Map 'type' to 'category' for backend compatibility
        logo: logoUrl,
        contractValue: data.contractValue.toString(),
        eventsSponsored: data.eventsSponsored || 0
      };
      
      createSponsorMutation.mutate(formattedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el logo",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const openEditSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    
    editSponsorForm.reset({
      name: sponsor.name,
      type: sponsor.category, // Map 'category' from backend to 'type' in form
      logo: sponsor.logo || '',
      representative: sponsor.representative,
      email: sponsor.email,
      phone: sponsor.phone,
      address: sponsor.address,
      status: sponsor.status,
      packageCategory: sponsor.packageCategory,
      contractStart: sponsor.contractStart,
      renewalProbability: sponsor.renewalProbability,
      websiteUrl: sponsor.websiteUrl || '',
      notes: sponsor.notes || '',
      contractValue: parseFloat(sponsor.contractValue),
      contractEnd: sponsor.contractEnd,
      eventsSponsored: sponsor.eventsSponsored
    });
    
    if (sponsor.logo) {
      setEditLogoPreview(sponsor.logo);
    } else {
      setEditLogoPreview('');
    }
    setEditLogoFile(null);
    
    setIsEditSponsorOpen(true);
  };

  const openViewPackage = (pkg: SponsorshipPackage) => {
    setSelectedPackage(pkg);
    setIsViewPackageOpen(true);
  };

  const openEditPackage = (pkg: SponsorshipPackage) => {
    setSelectedPackage(pkg);
    
    editPackageForm.reset({
      name: pkg.name,
      category: pkg.category,
      price: pkg.price.toString(),
      duration: pkg.duration,
      benefits: pkg.benefits,
      isActive: pkg.isActive
    });
    
    setIsEditPackageOpen(true);
  };

  const onSubmitEditPackage = async (data: PackageFormData) => {
    if (!selectedPackage) return;
    
    try {
      const formattedData = {
        ...data,
        price: parseFloat(data.price).toString()
      };
      
      updatePackageMutation.mutate({ id: selectedPackage.id, data: formattedData });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el paquete",
        variant: "destructive"
      });
    }
  };

  const onSubmitEditSponsor = async (data: SponsorFormData) => {
    if (!selectedSponsor) return;
    
    try {
      setIsUploadingLogo(true);
      let logoUrl = data.logo || '';

      if (editLogoFile) {
        logoUrl = await uploadLogo(editLogoFile);
      }

      if (!data.packageCategory) {
        toast({
          title: "Error",
          description: "Debes seleccionar una categoría de paquete",
          variant: "destructive"
        });
        return;
      }

      if (!data.contractValue || data.contractValue === 0) {
        toast({
          title: "Error",
          description: "El valor del contrato no se calculó correctamente.",
          variant: "destructive"
        });
        return;
      }

      const formattedData = {
        ...data,
        category: data.type, // Map 'type' to 'category' for backend compatibility
        logo: logoUrl,
        contractValue: data.contractValue.toString(),
        eventsSponsored: data.eventsSponsored || 0
      };
      
      updateSponsorMutation.mutate({ id: selectedSponsor.id, data: formattedData });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el logo",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Funciones de filtrado
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.representative.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sponsor.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || sponsor.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sistema de categorías inspirado en gemas y metales preciosos (10 niveles)
  const sponsorTiers = {
    amatista: { 
      name: "Amatista", 
      color: "bg-purple-100 text-purple-800", 
      price: 25000,
      level: 1,
      description: "Colaborador básico"
    },
    esmeralda: { 
      name: "Esmeralda", 
      color: "bg-emerald-100 text-emerald-800", 
      price: 50000,
      level: 2,
      description: "Contribuidor activo"
    },
    zafiro: { 
      name: "Zafiro", 
      color: "bg-blue-100 text-blue-800", 
      price: 75000,
      level: 3,
      description: "Aliado valioso"
    },
    onix: { 
      name: "Ónix", 
      color: "bg-gray-100 text-gray-800", 
      price: 125000,
      level: 4,
      description: "Socio estratégico"
    },
    cobre: { 
      name: "Cobre", 
      color: "bg-orange-100 text-orange-800", 
      price: 200000,
      level: 5,
      description: "Patrocinador comprometido"
    },
    bronce: { 
      name: "Bronce", 
      color: "bg-amber-100 text-amber-800", 
      price: 300000,
      level: 6,
      description: "Benefactor destacado"
    },
    plata: { 
      name: "Plata", 
      color: "bg-slate-100 text-slate-800", 
      price: 450000,
      level: 7,
      description: "Patrocinador premium"
    },
    oro: { 
      name: "Oro", 
      color: "bg-yellow-100 text-yellow-800", 
      price: 650000,
      level: 8,
      description: "Patrocinador de élite"
    },
    platino: { 
      name: "Platino", 
      color: "bg-gray-200 text-gray-900", 
      price: 900000,
      level: 9,
      description: "Patrocinador exclusivo"
    },
    diamante: { 
      name: "Diamante", 
      color: "bg-cyan-100 text-cyan-800", 
      price: 1200000,
      level: 10,
      description: "Patrocinador supremo"
    }
  };

  // Funciones de utilidad para estilos
  const getCategoryColor = (category: string) => {
    return sponsorTiers[category as keyof typeof sponsorTiers]?.color || "bg-gray-100 text-gray-800";
  };

  const getTierInfo = (category: string) => {
    return sponsorTiers[category as keyof typeof sponsorTiers] || {
      name: category,
      color: "bg-gray-100 text-gray-800",
      price: 0,
      level: 0,
      description: "Categoría no definida"
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      activo: "bg-green-100 text-green-800",
      potencial: "bg-blue-100 text-blue-800",
      inactivo: "bg-red-100 text-red-800",
      renovacion: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (packagesLoading || sponsorsLoading || campaignsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a587]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Patrocinios</h1>
            <p className="text-gray-600">Administra patrocinadores, paquetes y campañas</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
            <TabsTrigger value="packages">Paquetes</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          </TabsList>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar patrocinadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
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
              <Dialog open={isNewSponsorOpen} onOpenChange={setIsNewSponsorOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00a587] hover:bg-[#008f75]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Patrocinador
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Patrocinador</DialogTitle>
                    <DialogDescription>
                      Completa la información del nuevo patrocinador
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
                              <FormLabel>Nombre del Patrocinador</FormLabel>
                              <FormControl>
                                <Input placeholder="Empresa ABC" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={sponsorForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tipo" />
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

                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>Logo del Patrocinador</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#00a587] transition-colors bg-green-50 hover:bg-green-100">
                                <div className="text-center">
                                  <Upload className="mx-auto h-8 w-8 text-[#00a587] mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Haz clic para subir logo
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                                </div>
                              </div>
                            </label>
                          </div>
                          {logoPreview && (
                            <div className="relative">
                              <img 
                                src={logoPreview} 
                                alt="Preview" 
                                className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={removeLogoPreview}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={sponsorForm.control}
                          name="representative"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Representante</FormLabel>
                              <FormControl>
                                <Input placeholder="Juan Pérez" {...field} />
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
                                <Input type="email" placeholder="contacto@empresa.com" {...field} />
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
                                <Input placeholder="+52 33 1234 5678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={sponsorForm.control}
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sitio Web (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://empresa.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={sponsorForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Dirección completa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                          name="packageCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoría del Paquete</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona categoría" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(sponsorTiers).map(([key, tier]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center space-x-2">
                                        <span>{tier.icon}</span>
                                        <span>{tier.name}</span>
                                        <span className="text-xs text-gray-500">
                                          (${tier.price.toLocaleString()})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
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
                          name="renewalProbability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Probabilidad de Renovación (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="85" 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                />
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
                            <FormLabel>Notas (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Notas adicionales..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsNewSponsorOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#00a587] hover:bg-[#008f75]"
                          disabled={createSponsorMutation.isPending || isUploadingLogo}
                        >
                          {createSponsorMutation.isPending || isUploadingLogo ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {isUploadingLogo ? "Subiendo logo..." : "Creando..."}
                            </>
                          ) : (
                            "Crear Patrocinador"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de patrocinadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {sponsor.logo ? (
                          <img 
                            src={sponsor.logo} 
                            alt={`Logo de ${sponsor.name}`}
                            className="w-12 h-12 object-contain border border-gray-200 rounded-lg p-1 bg-white shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {sponsor.logo && (
                          <div className="hidden w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div>
                          <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {sponsor.representative}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={getCategoryColor(sponsor.packageCategory)}>
                          {getTierInfo(sponsor.packageCategory).icon} {getTierInfo(sponsor.packageCategory).name}
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditSponsor(sponsor)}
                      >
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Paquetes de Patrocinio</h2>
              <Dialog open={isNewPackageOpen} onOpenChange={setIsNewPackageOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00a587] hover:bg-[#008f75]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Paquete
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Paquete</DialogTitle>
                    <DialogDescription>
                      Define un nuevo paquete de patrocinio
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...packageForm}>
                    <form onSubmit={packageForm.handleSubmit((data) => createPackageMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={packageForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Paquete</FormLabel>
                              <FormControl>
                                <Input placeholder="Paquete Oro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={packageForm.control}
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
                                  {Object.entries(sponsorTiers).map(([key, tier]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center space-x-2">
                                        <span>{tier.icon}</span>
                                        <span>{tier.name}</span>
                                        <span className="text-xs text-gray-500">
                                          (${tier.price.toLocaleString()})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
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
                                <Input 
                                  type="number" 
                                  placeholder="50000" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
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
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
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
                                value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                                onChange={(e) => {
                                  const benefitsArray = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                                  field.onChange(benefitsArray);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={packageForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Paquete Activo</FormLabel>
                              <FormDescription>
                                El paquete estará disponible para los patrocinadores
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsNewPackageOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#00a587] hover:bg-[#008f75]"
                          disabled={createPackageMutation.isPending}
                        >
                          {createPackageMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creando...
                            </>
                          ) : (
                            "Crear Paquete"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <CardDescription>
                          <Badge className={getCategoryColor(pkg.category)}>
                            {getTierInfo(pkg.category).name}
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
                          <Button size="sm" variant="outline" onClick={() => openViewPackage(pkg)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditPackage(pkg)}>
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
                {/* Sección superior con logo, información básica y contrato */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSponsor.name}</h3>
                    <p className="text-gray-600">{selectedSponsor.type}</p>
                    <div className="flex space-x-2 mt-2">
                      <Badge className={getCategoryColor(selectedSponsor.packageCategory)}>
                        {getTierInfo(selectedSponsor.packageCategory).name}
                      </Badge>
                      <Badge className={getStatusColor(selectedSponsor.status)}>
                        {selectedSponsor.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Logo del patrocinador */}
                  <div className="flex justify-center items-start">
                    {selectedSponsor.logo ? (
                      <div className="text-center">
                        <img 
                          src={selectedSponsor.logo} 
                          alt={`Logo de ${selectedSponsor.name}`}
                          className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2 bg-white shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-center p-4">
                          <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Logo no disponible</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Sin logo</p>
                      </div>
                    )}
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

        {/* Modal para editar patrocinador */}
        <Dialog open={isEditSponsorOpen} onOpenChange={setIsEditSponsorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Patrocinador</DialogTitle>
              <DialogDescription>
                Actualiza la información del patrocinador
              </DialogDescription>
            </DialogHeader>
            <Form {...editSponsorForm}>
              <form onSubmit={editSponsorForm.handleSubmit(onSubmitEditSponsor)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editSponsorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Patrocinador</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa ABC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editSponsorForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
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

                {/* Logo Upload para edición */}
                <div className="space-y-2">
                  <Label>Logo del Patrocinador</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditLogoChange}
                        className="hidden"
                        id="edit-logo-upload"
                      />
                      <label htmlFor="edit-logo-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#00a587] transition-colors bg-green-50 hover:bg-green-100">
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-[#00a587] mb-2" />
                            <p className="text-sm text-gray-600">
                              Haz clic para cambiar logo
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    {editLogoPreview && (
                      <div className="relative">
                        <img 
                          src={editLogoPreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeEditLogoPreview}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editSponsorForm.control}
                    name="representative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Representante</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editSponsorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contacto@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editSponsorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 33 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editSponsorForm.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editSponsorForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editSponsorForm.control}
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
                    control={editSponsorForm.control}
                    name="packageCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría del Paquete</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(sponsorTiers).map(([key, tier]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{tier.name}</span>
                                  <span className="text-xs text-gray-500">
                                    (${tier.price.toLocaleString()})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editSponsorForm.control}
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
                    control={editSponsorForm.control}
                    name="renewalProbability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilidad de Renovación (%)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="85" 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editSponsorForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas adicionales..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditSponsorOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00a587] hover:bg-[#008f75]"
                    disabled={updateSponsorMutation.isPending || isUploadingLogo}
                  >
                    {updateSponsorMutation.isPending || isUploadingLogo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploadingLogo ? "Subiendo logo..." : "Actualizando..."}
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal para ver detalles del paquete */}
        <Dialog open={isViewPackageOpen} onOpenChange={setIsViewPackageOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Paquete</DialogTitle>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-6">
                {/* Información principal del paquete */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPackage.name}</h3>
                    <div className="flex space-x-2 mt-2">
                      <Badge className={getCategoryColor(selectedPackage.category)}>
                        {getTierInfo(selectedPackage.category).name}
                      </Badge>
                      <Badge variant={selectedPackage.isActive ? "default" : "secondary"}>
                        {selectedPackage.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#00a587]">
                      ${parseFloat(selectedPackage.price).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">
                      Duración: {selectedPackage.duration} meses
                    </p>
                  </div>
                </div>

                {/* Lista completa de beneficios */}
                <div>
                  <h4 className="font-semibold mb-3">Beneficios Incluidos</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedPackage.benefits?.map((benefit, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estadísticas del paquete */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Patrocinadores activos:</span>
                      <div className="text-lg font-semibold">
                        {sponsors.filter(s => s.packageCategory === selectedPackage.category).length}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ingresos generados:</span>
                      <div className="text-lg font-semibold text-[#00a587]">
                        ${(sponsors.filter(s => s.packageCategory === selectedPackage.category)
                           .reduce((sum, s) => sum + parseFloat(s.contractValue), 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal para editar paquete */}
        <Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paquete</DialogTitle>
              <DialogDescription>
                Actualiza la información del paquete de patrocinio
              </DialogDescription>
            </DialogHeader>
            <Form {...editPackageForm}>
              <form onSubmit={editPackageForm.handleSubmit(onSubmitEditPackage)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editPackageForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Paquete</FormLabel>
                        <FormControl>
                          <Input placeholder="Paquete Premium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPackageForm.control}
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
                            {Object.entries(sponsorTiers).map(([key, tier]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{tier.name}</span>
                                  <span className="text-xs text-gray-500">
                                    (${tier.price.toLocaleString()})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editPackageForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio ($)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="25000" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPackageForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (meses)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="12" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editPackageForm.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficios (separados por comas)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Logo en eventos, Stand exclusivo, Menciones en redes sociales"
                          value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                          onChange={(e) => {
                            const benefitsArray = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                            field.onChange(benefitsArray);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editPackageForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Paquete Activo</FormLabel>
                        <FormDescription>
                          El paquete estará disponible para los patrocinadores
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditPackageOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00a587] hover:bg-[#008f75]"
                    disabled={updatePackageMutation.isPending}
                  >
                    {updatePackageMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default SponsorsManagement;