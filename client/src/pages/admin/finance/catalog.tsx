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
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  DollarSign, 
  Edit, 
  Tag,
  AlertCircle
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";

export default function CatalogPage() {
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados del formulario de nueva categoría
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "ingreso"
  });

  // Obtener categorías de ingresos
  const { data: incomeCategories, isLoading: incomeCategoriesLoading } = useQuery({
    queryKey: ['/api/income-categories'],
  });

  // Obtener categorías de egresos
  const { data: expenseCategories, isLoading: expenseCategoriesLoading } = useQuery({
    queryKey: ['/api/expense-categories'],
  });

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

  // Mutación para editar categoría de ingresos usando SQL directo
  const editIncomeCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: { name: string; description: string } }) => {
      console.log("Editando categoría de ingresos:", { id, categoryData });
      
      // Usar el endpoint SQL directo que funciona sin interferencia de Vite
      return await apiRequest(`/sql-update/income-category/${id}`, {
        method: 'POST',
        data: categoryData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
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

  // Mutación para editar categoría de egresos usando una ruta directa
  const editExpenseCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: { name: string; description: string } }) => {
      console.log("Editando categoría de egresos:", { id, categoryData });
      
      // Usar el endpoint SQL directo que funciona sin interferencia de Vite
      return await apiRequest(`/sql-update/expense-category/${id}`, {
        method: 'POST',
        data: categoryData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingresos">Categorías de Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Categorías de Egresos</TabsTrigger>
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
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Activa
                            </Badge>
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
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Activa
                            </Badge>
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