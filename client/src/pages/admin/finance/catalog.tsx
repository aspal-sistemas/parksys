import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  DollarSign, 
  Edit, 
  Tag,
  AlertCircle,
  Building2,
  Receipt,
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";

export default function CatalogPage() {
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any>(null);
  const [isNewProviderOpen, setIsNewProviderOpen] = useState(false);
  const [isNewIncomeRecordOpen, setIsNewIncomeRecordOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados del formulario de nueva categoría
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "ingreso"
  });

  // Estados del formulario de nuevo proveedor
  const [newProvider, setNewProvider] = useState({
    name: "",
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    providerType: "",
    notes: ""
  });

  // Estados del formulario de nuevo registro de ingreso
  const [newIncomeRecord, setNewIncomeRecord] = useState({
    categoryId: "",
    description: "",
    source: "",
    amount: "",
    incomeDate: "",
    paymentMethod: "",
    notes: "",
    parkId: ""
  });

  // Estados para tipos de proveedores
  const [isNewProviderTypeOpen, setIsNewProviderTypeOpen] = useState(false);
  const [isEditProviderTypeOpen, setIsEditProviderTypeOpen] = useState(false);
  const [selectedProviderTypeToEdit, setSelectedProviderTypeToEdit] = useState(null);
  const [newProviderType, setNewProviderType] = useState({
    name: "",
    description: "",
    code: "",
    isActive: true
  });

  // Obtener categorías de ingresos
  const { data: incomeCategories, isLoading: incomeCategoriesLoading } = useQuery({
    queryKey: ['/api/income-categories'],
  });

  // Obtener categorías de egresos
  const { data: expenseCategories, isLoading: expenseCategoriesLoading } = useQuery({
    queryKey: ['/api/expense-categories'],
  });

  // Obtener proveedores
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/providers'],
  });

  // Obtener registros de ingresos
  const { data: incomeRecords, isLoading: incomeRecordsLoading } = useQuery({
    queryKey: ['/api/income-records'],
  });

  // Obtener parques
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Obtener tipos de proveedores
  const providerTypesQuery = useQuery({
    queryKey: ['/api/provider-types'],
  });
  const { data: providerTypes } = providerTypesQuery;

  // Mutación para crear categoría de ingresos
  const createIncomeCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string }) => {
      return apiRequest('/api/income-categories', {
        method: 'POST',
        data: categoryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
      toast({
        title: "Categoría creada",
        description: "La categoría de ingresos se ha creado exitosamente.",
      });
      setIsNewCategoryOpen(false);
      setNewCategory({ name: "", description: "", type: "ingreso" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error creando categoría:", error);
    },
  });

  // Mutación para crear categoría de egresos
  const createExpenseCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string }) => {
      return apiRequest('/api/expense-categories', {
        method: 'POST',
        data: categoryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
      toast({
        title: "Categoría creada",
        description: "La categoría de egresos se ha creado exitosamente.",
      });
      setIsNewCategoryOpen(false);
      setNewCategory({ name: "", description: "", type: "ingreso" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error creando categoría:", error);
    },
  });

  // Mutación para editar categoría de ingresos
  const editIncomeCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: { name: string; description: string } }) => {
      console.log("Editando categoría de ingresos:", { id, categoryData });
      
      return await apiRequest(`/api/income-categories/${id}`, {
        method: 'PUT',
        data: categoryData
      });
    },
    onSuccess: () => {
      // Invalidar y refrescar las queries para asegurar la actualización
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
      queryClient.refetchQueries({ queryKey: ['/api/income-categories'] });
      
      toast({
        title: "Categoría actualizada",
        description: "La categoría de ingresos se ha actualizado exitosamente.",
      });
      setIsEditCategoryOpen(false);
      setSelectedCategoryToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error actualizando categoría:", error);
    },
  });

  // Mutación para editar categoría de egresos
  const editExpenseCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: { name: string; description: string } }) => {
      console.log("Editando categoría de egresos:", { id, categoryData });
      
      return await apiRequest(`/api/expense-categories/${id}`, {
        method: 'PUT',
        data: categoryData
      });
    },
    onSuccess: () => {
      // Invalidar y refrescar las queries para asegurar la actualización
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
      queryClient.refetchQueries({ queryKey: ['/api/expense-categories'] });
      
      toast({
        title: "Categoría actualizada",
        description: "La categoría de egresos se ha actualizado exitosamente.",
      });
      setIsEditCategoryOpen(false);
      setSelectedCategoryToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error actualizando categoría:", error);
    },
  });

  // Mutación para cambiar estado activo de categoría de ingresos
  const toggleIncomeCategoryStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/income-categories/${id}/status`, {
        method: 'PUT',
        data: { isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la categoría se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la categoría.",
        variant: "destructive",
      });
    },
  });

  // Mutación para cambiar estado activo de categoría de egresos
  const toggleExpenseCategoryStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/expense-categories/${id}/status`, {
        method: 'PUT',
        data: { isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la categoría se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la categoría.",
        variant: "destructive",
      });
    },
  });

  // Mutación para crear proveedor
  const createProviderMutation = useMutation({
    mutationFn: async (providerData: any) => {
      return await apiRequest('/api/providers', {
        method: 'POST',
        data: providerData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "Proveedor creado",
        description: "El proveedor se ha creado exitosamente.",
      });
      setIsNewProviderOpen(false);
      setNewProvider({
        name: "",
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        providerType: "",
        notes: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el proveedor. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para crear registro de ingreso
  const createIncomeRecordMutation = useMutation({
    mutationFn: async (incomeData: any) => {
      return await apiRequest('/api/income-records', {
        method: 'POST',
        data: incomeData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-records'] });
      toast({
        title: "Registro de ingreso creado",
        description: "El registro de ingreso se ha creado exitosamente.",
      });
      setIsNewIncomeRecordOpen(false);
      setNewIncomeRecord({
        categoryId: "",
        description: "",
        source: "",
        amount: "",
        incomeDate: "",
        paymentMethod: "",
        notes: "",
        parkId: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el registro de ingreso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para crear tipo de proveedor
  const createProviderTypeMutation = useMutation({
    mutationFn: async (providerTypeData: any) => {
      return await apiRequest('/api/provider-types', {
        method: 'POST',
        data: providerTypeData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider-types'] });
      toast({
        title: "Tipo de proveedor creado",
        description: "El tipo de proveedor se ha creado exitosamente.",
      });
      setIsNewProviderTypeOpen(false);
      setNewProviderType({
        name: "",
        description: "",
        code: "",
        isActive: true
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el tipo de proveedor. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
    };

    if (newCategory.type === "ingreso") {
      createIncomeCategoryMutation.mutate(categoryData);
    } else {
      createExpenseCategoryMutation.mutate(categoryData);
    }
  };

  const handleEditCategory = () => {
    if (!selectedCategoryToEdit?.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: selectedCategoryToEdit.name.trim(),
      description: selectedCategoryToEdit.description?.trim() || '',
    };

    // Determinar si es categoría de ingreso o egreso basado en el código
    const isIncomeCategory = selectedCategoryToEdit.code?.startsWith('ING');
    
    if (isIncomeCategory) {
      editIncomeCategoryMutation.mutate({ 
        id: selectedCategoryToEdit.id, 
        categoryData 
      });
    } else {
      editExpenseCategoryMutation.mutate({ 
        id: selectedCategoryToEdit.id, 
        categoryData 
      });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo Financiero - Sistema de Gestión de Parques</title>
        <meta name="description" content="Gestión de categorías financieras para ingresos y egresos del sistema de parques." />
      </Helmet>

      <div className="space-y-6">
        <div className="text-center py-8">
          <Tag className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Catálogo Financiero</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Administra las categorías para organizar los ingresos y egresos del sistema. 
            Para crear nuevos registros, utiliza los módulos específicos.
          </p>
        </div>

        {/* Información y enlaces rápidos */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Gestión de Ingresos</h3>
                  <p className="text-sm text-green-600">Crear y administrar registros de ingresos</p>
                </div>
              </div>
              <Link href="/admin/finance/incomes">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Ir a Módulo de Ingresos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Gestión de Egresos</h3>
                  <p className="text-sm text-red-600">Crear y administrar registros de egresos</p>
                </div>
              </div>
              <Link href="/admin/finance/expenses">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Ir a Módulo de Egresos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ingresos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ingresos">Categorías de Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Categorías de Egresos</TabsTrigger>
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="tipos-proveedores">Tipos de Proveedores</TabsTrigger>
            <TabsTrigger value="tipos-ingresos">Tipos de Ingresos</TabsTrigger>
          </TabsList>

          <TabsContent value="ingresos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Categorías de Ingresos</CardTitle>
                <Dialog open={isNewCategoryOpen && newCategory.type === "ingreso"} onOpenChange={(open) => {
                  setIsNewCategoryOpen(open);
                  if (open) setNewCategory({...newCategory, type: "ingreso"});
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setNewCategory({...newCategory, type: "ingreso"})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Nueva Categoría de Ingresos</DialogTitle>
                      <DialogDescription>
                        Crear una nueva categoría para organizar los conceptos de ingresos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryName" className="text-right">
                          Nombre
                        </Label>
                        <Input
                          id="categoryName"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          className="col-span-3"
                          placeholder="Nombre de la categoría"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryDescription" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="categoryDescription"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          className="col-span-3"
                          placeholder="Descripción de la categoría"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Crear Categoría
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {incomeCategoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando categorías...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(incomeCategories) && incomeCategories.length > 0 ? (
                      incomeCategories.map((category: any) => (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                              {category.code && (
                                <p className="text-xs text-blue-600 font-mono">{category.code}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={category.isActive ? "default" : "secondary"} 
                              className={category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                            >
                              {category.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleIncomeCategoryStatusMutation.mutate({ 
                                id: category.id, 
                                isActive: !category.isActive 
                              })}
                              title={category.isActive ? "Desactivar categoría" : "Activar categoría"}
                            >
                              {category.isActive ? "🔴" : "🟢"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryToEdit(category);
                                setIsEditCategoryOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay categorías de ingresos disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">Crea una nueva categoría para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="egresos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Categorías de Egresos</CardTitle>
                <Dialog open={isNewCategoryOpen && newCategory.type === "egreso"} onOpenChange={(open) => {
                  setIsNewCategoryOpen(open);
                  if (open) setNewCategory({...newCategory, type: "egreso"});
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setNewCategory({...newCategory, type: "egreso"})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Nueva Categoría de Egresos</DialogTitle>
                      <DialogDescription>
                        Crear una nueva categoría para organizar los conceptos de egresos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryNameEgreso" className="text-right">
                          Nombre
                        </Label>
                        <Input
                          id="categoryNameEgreso"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          className="col-span-3"
                          placeholder="Nombre de la categoría"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryDescriptionEgreso" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="categoryDescriptionEgreso"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          className="col-span-3"
                          placeholder="Descripción de la categoría"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Crear Categoría
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {expenseCategoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando categorías...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(expenseCategories) && expenseCategories.length > 0 ? (
                      expenseCategories.map((category: any) => (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                              {category.code && (
                                <p className="text-xs text-blue-600 font-mono">{category.code}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={category.isActive ? "default" : "secondary"} 
                              className={category.isActive ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}
                            >
                              {category.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleExpenseCategoryStatusMutation.mutate({ 
                                id: category.id, 
                                isActive: !category.isActive 
                              })}
                              title={category.isActive ? "Desactivar categoría" : "Activar categoría"}
                            >
                              {category.isActive ? "🔴" : "🟢"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryToEdit(category);
                                setIsEditCategoryOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay categorías de egresos disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">Crea una nueva categoría para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Proveedores */}
          <TabsContent value="proveedores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Catálogo de Proveedores
                </CardTitle>
                <Dialog open={isNewProviderOpen} onOpenChange={setIsNewProviderOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Proveedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                      <DialogDescription>
                        Ingresa los datos del nuevo proveedor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="providerName">Nombre *</Label>
                          <Input
                            id="providerName"
                            value={newProvider.name}
                            onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                            placeholder="Nombre del proveedor"
                          />
                        </div>
                        <div>
                          <Label htmlFor="businessName">Razón Social</Label>
                          <Input
                            id="businessName"
                            value={newProvider.businessName}
                            onChange={(e) => setNewProvider({...newProvider, businessName: e.target.value})}
                            placeholder="Razón social"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactPerson">Persona de Contacto</Label>
                          <Input
                            id="contactPerson"
                            value={newProvider.contactPerson}
                            onChange={(e) => setNewProvider({...newProvider, contactPerson: e.target.value})}
                            placeholder="Nombre del contacto"
                          />
                        </div>
                        <div>
                          <Label htmlFor="providerType">Tipo de Proveedor</Label>
                          <Select 
                            value={newProvider.providerType} 
                            onValueChange={(value) => setNewProvider({...newProvider, providerType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="servicios">Servicios</SelectItem>
                              <SelectItem value="productos">Productos</SelectItem>
                              <SelectItem value="construccion">Construcción</SelectItem>
                              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                              <SelectItem value="consultoria">Consultoría</SelectItem>
                              <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newProvider.email}
                            onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                            placeholder="email@ejemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={newProvider.phone}
                            onChange={(e) => setNewProvider({...newProvider, phone: e.target.value})}
                            placeholder="Número de teléfono"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                          id="address"
                          value={newProvider.address}
                          onChange={(e) => setNewProvider({...newProvider, address: e.target.value})}
                          placeholder="Dirección completa"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Ciudad</Label>
                          <Input
                            id="city"
                            value={newProvider.city}
                            onChange={(e) => setNewProvider({...newProvider, city: e.target.value})}
                            placeholder="Ciudad"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={newProvider.state}
                            onChange={(e) => setNewProvider({...newProvider, state: e.target.value})}
                            placeholder="Estado"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                          id="notes"
                          value={newProvider.notes}
                          onChange={(e) => setNewProvider({...newProvider, notes: e.target.value})}
                          placeholder="Notas adicionales"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewProviderOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => createProviderMutation.mutate(newProvider)}>
                        Crear Proveedor
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <div className="text-center py-8">
                    <p>Cargando proveedores...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {providers && providers.length > 0 ? (
                      providers.map((provider: any) => (
                        <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-blue-600" />
                              <div>
                                <h3 className="font-semibold">{provider.name}</h3>
                                <p className="text-sm text-gray-600">{provider.code}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  {provider.providerType && (
                                    <Badge variant="secondary">{provider.providerType}</Badge>
                                  )}
                                  {provider.email && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Mail className="h-3 w-3" />
                                      {provider.email}
                                    </div>
                                  )}
                                  {provider.phone && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Phone className="h-3 w-3" />
                                      {provider.phone}
                                    </div>
                                  )}
                                </div>
                                {provider.city && provider.state && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {provider.city}, {provider.state}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {provider.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm">{provider.rating}</span>
                              </div>
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay proveedores registrados</p>
                        <p className="text-sm text-gray-400 mt-1">Crea un nuevo proveedor para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Tipos de Proveedores */}
          <TabsContent value="tipos-proveedores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Tipos de Proveedores
                </CardTitle>
                <Dialog open={isNewProviderTypeOpen} onOpenChange={setIsNewProviderTypeOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Tipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Tipo de Proveedor</DialogTitle>
                      <DialogDescription>
                        Define un nuevo tipo de proveedor para categorizar mejor los servicios.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="providerTypeName">Nombre del Tipo *</Label>
                        <Input
                          id="providerTypeName"
                          value={newProviderType.name}
                          onChange={(e) => setNewProviderType({...newProviderType, name: e.target.value})}
                          placeholder="Ej: Servicios de Jardinería, Equipos Deportivos, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerTypeDescription">Descripción</Label>
                        <Textarea
                          id="providerTypeDescription"
                          value={newProviderType.description}
                          onChange={(e) => setNewProviderType({...newProviderType, description: e.target.value})}
                          placeholder="Describe qué tipo de servicios o productos incluye esta categoría"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="providerTypeCode">Código</Label>
                          <Input
                            id="providerTypeCode"
                            value={newProviderType.code}
                            onChange={(e) => setNewProviderType({...newProviderType, code: e.target.value})}
                            placeholder="TP001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="providerTypeStatus">Estado</Label>
                          <Select 
                            value={newProviderType.isActive ? "active" : "inactive"} 
                            onValueChange={(value) => setNewProviderType({...newProviderType, isActive: value === "active"})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewProviderTypeOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => createProviderTypeMutation.mutate(newProviderType)}>
                        Crear Tipo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {providerTypesQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {providerTypes && providerTypes.length > 0 ? (
                      providerTypes.map((type: any) => (
                        <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${type.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <div>
                                <h3 className="font-semibold">{type.name}</h3>
                                {type.code && <span className="text-sm text-gray-500">Código: {type.code}</span>}
                              </div>
                            </div>
                            {type.description && (
                              <p className="text-sm text-gray-600 mt-2">{type.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedProviderTypeToEdit(type);
                                setIsEditProviderTypeOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay tipos de proveedores disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">Crea un nuevo tipo para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Tipos de Ingresos */}
          <TabsContent value="tipos-ingresos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Receipt className="h-6 w-6" />
                  Tipos de Ingresos
                </CardTitle>
                <Dialog open={isNewIncomeRecordOpen} onOpenChange={setIsNewIncomeRecordOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Tipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Tipo de Ingreso</DialogTitle>
                      <DialogDescription>
                        Define un nuevo tipo de ingreso para categorizar los ingresos del sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="categorySelect">Categoría *</Label>
                        <Select 
                          value={newIncomeRecord.categoryId} 
                          onValueChange={(value) => setNewIncomeRecord({...newIncomeRecord, categoryId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {incomeCategories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                          id="description"
                          value={newIncomeRecord.description}
                          onChange={(e) => setNewIncomeRecord({...newIncomeRecord, description: e.target.value})}
                          placeholder="Descripción del ingreso"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Monto *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={newIncomeRecord.amount}
                            onChange={(e) => setNewIncomeRecord({...newIncomeRecord, amount: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="incomeDate">Fecha *</Label>
                          <Input
                            id="incomeDate"
                            type="date"
                            value={newIncomeRecord.incomeDate}
                            onChange={(e) => setNewIncomeRecord({...newIncomeRecord, incomeDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="source">Fuente</Label>
                          <Input
                            id="source"
                            value={newIncomeRecord.source}
                            onChange={(e) => setNewIncomeRecord({...newIncomeRecord, source: e.target.value})}
                            placeholder="Fuente del ingreso"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paymentMethod">Método de Pago</Label>
                          <Select 
                            value={newIncomeRecord.paymentMethod} 
                            onValueChange={(value) => setNewIncomeRecord({...newIncomeRecord, paymentMethod: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="transferencia">Transferencia</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="tarjeta">Tarjeta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {parks && (
                        <div>
                          <Label htmlFor="parkSelect">Parque (Opcional)</Label>
                          <Select 
                            value={newIncomeRecord.parkId} 
                            onValueChange={(value) => setNewIncomeRecord({...newIncomeRecord, parkId: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar parque" />
                            </SelectTrigger>
                            <SelectContent>
                              {parks.map((park: any) => (
                                <SelectItem key={park.id} value={park.id.toString()}>
                                  {park.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="recordNotes">Notas</Label>
                        <Textarea
                          id="recordNotes"
                          value={newIncomeRecord.notes}
                          onChange={(e) => setNewIncomeRecord({...newIncomeRecord, notes: e.target.value})}
                          placeholder="Notas adicionales"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewIncomeRecordOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => createIncomeRecordMutation.mutate(newIncomeRecord)}>
                        Crear Registro
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {incomeRecordsLoading ? (
                  <div className="text-center py-8">
                    <p>Cargando registros de ingresos...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomeRecords && incomeRecords.length > 0 ? (
                      incomeRecords.map((record: any) => (
                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Receipt className="h-5 w-5 text-green-600" />
                              <div>
                                <h3 className="font-semibold">{record.description}</h3>
                                <p className="text-sm text-gray-600">{record.code}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <Badge variant="outline" className="text-green-600">
                                    ${parseFloat(record.amount || 0).toLocaleString()} {record.currency || 'MXN'}
                                  </Badge>
                                  {record.categoryName && (
                                    <Badge variant="secondary">{record.categoryName}</Badge>
                                  )}
                                  {record.incomeDate && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(record.incomeDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  {record.source && (
                                    <span className="text-sm text-gray-500">Fuente: {record.source}</span>
                                  )}
                                  {record.parkName && (
                                    <span className="text-sm text-gray-500">Parque: {record.parkName}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={record.status === 'registrado' ? 'default' : 'secondary'}
                            >
                              {record.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay registros de ingresos</p>
                        <p className="text-sm text-gray-400 mt-1">Crea un nuevo registro para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo para editar categoría */}
        <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                Editar Categoría {selectedCategoryToEdit?.code?.startsWith('ING') ? 'de Ingresos' : 'de Egresos'}
              </DialogTitle>
              <DialogDescription>
                Modifica los datos de la categoría seleccionada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editCategoryName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="editCategoryName"
                  value={selectedCategoryToEdit?.name || ''}
                  onChange={(e) => setSelectedCategoryToEdit({
                    ...selectedCategoryToEdit,
                    name: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editCategoryDescription" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="editCategoryDescription"
                  value={selectedCategoryToEdit?.description || ''}
                  onChange={(e) => setSelectedCategoryToEdit({
                    ...selectedCategoryToEdit,
                    description: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="Descripción de la categoría"
                />
              </div>
              {selectedCategoryToEdit?.code && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-sm text-muted-foreground">
                    Código
                  </Label>
                  <div className="col-span-3">
                    <Badge variant="outline" className="font-mono">
                      {selectedCategoryToEdit.code}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditCategoryOpen(false);
                setSelectedCategoryToEdit(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleEditCategory}>
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}