import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, TrendingDown } from "lucide-react";

export default function CatalogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para formularios
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "ingreso" as "ingreso" | "egreso"
  });

  // Obtener categorías de ingresos
  const { data: incomeCategories, isLoading: incomeCategoriesLoading } = useQuery({
    queryKey: ['/api/finance/income-categories'],
  });

  // Obtener categorías de egresos
  const { data: expenseCategories, isLoading: expenseCategoriesLoading } = useQuery({
    queryKey: ['/api/finance/expense-categories'],
  });

  // Mutación para crear categoría de ingresos
  const createIncomeCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string }) => {
      return apiRequest('/api/finance/income-categories', {
        method: 'POST',
        data: categoryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/income-categories'] });
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
      return apiRequest('/api/finance/expense-categories', {
        method: 'POST',
        data: categoryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
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
      return await apiRequest(`/api/finance/income-categories/${id}`, {
        method: 'PUT',
        data: categoryData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/income-categories'] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
    },
  });

  // Mutación para editar categoría de egresos
  const editExpenseCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: number; categoryData: { name: string; description: string } }) => {
      return await apiRequest(`/api/finance/expense-categories/${id}`, {
        method: 'PUT',
        data: categoryData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
    },
  });

  // Mutación para eliminar categoría de ingresos
  const deleteIncomeCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/income-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/income-categories'] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría de ingresos se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "No se pudo eliminar la categoría. Puede estar siendo usada en registros.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar categoría de egresos
  const deleteExpenseCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/expense-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/expense-categories'] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría de egresos se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "No se pudo eliminar la categoría. Puede estar siendo usada en registros.",
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

    if (newCategory.type === "ingreso") {
      createIncomeCategoryMutation.mutate({
        name: newCategory.name,
        description: newCategory.description,
      });
    } else {
      createExpenseCategoryMutation.mutate({
        name: newCategory.name,
        description: newCategory.description,
      });
    }
  };

  const handleEditCategory = (category: any, type: "ingreso" | "egreso") => {
    setEditingCategory({ ...category, type });
    setIsEditCategoryOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory?.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: editingCategory.name,
      description: editingCategory.description || "",
    };

    if (editingCategory.type === "ingreso") {
      editIncomeCategoryMutation.mutate({
        id: editingCategory.id,
        categoryData,
      });
    } else {
      editExpenseCategoryMutation.mutate({
        id: editingCategory.id,
        categoryData,
      });
    }
  };

  const handleDeleteCategory = (categoryId: number, type: "ingreso" | "egreso") => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.`)) {
      if (type === "ingreso") {
        deleteIncomeCategoryMutation.mutate(categoryId);
      } else {
        deleteExpenseCategoryMutation.mutate(categoryId);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo Financiero</h1>
            <p className="text-muted-foreground">
              Gestiona las categorías de ingresos y egresos del sistema
            </p>
          </div>
        </div>

      <Tabs defaultValue="income-categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income-categories">Categorías de Ingresos</TabsTrigger>
          <TabsTrigger value="expense-categories">Categorías de Egresos</TabsTrigger>
        </TabsList>

        {/* Categorías de Ingresos */}
        <TabsContent value="income-categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Categorías de Ingresos
                  </CardTitle>
                  <CardDescription>
                    Administra las categorías para clasificar los diferentes tipos de ingresos
                  </CardDescription>
                </div>
                <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewCategory({ ...newCategory, type: "ingreso" })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                      <Button 
                        onClick={handleCreateCategory}
                        disabled={createIncomeCategoryMutation.isPending}
                      >
                        {createIncomeCategoryMutation.isPending ? "Creando..." : "Crear Categoría"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {incomeCategoriesLoading ? (
                <div className="text-center py-8">
                  <p>Cargando categorías...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomeCategories && incomeCategories.length > 0 ? (
                    incomeCategories.map((category: any) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-gray-500">{category.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">
                                  {category.code}
                                </Badge>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                  {category.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category, "ingreso")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id, "ingreso")}
                            disabled={deleteIncomeCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay categorías de ingresos registradas</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorías de Egresos */}
        <TabsContent value="expense-categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Categorías de Egresos
                  </CardTitle>
                  <CardDescription>
                    Administra las categorías para clasificar los diferentes tipos de gastos
                  </CardDescription>
                </div>
                <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewCategory({ ...newCategory, type: "egreso" })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Categoría de Egresos</DialogTitle>
                      <DialogDescription>
                        Crear una nueva categoría para organizar los conceptos de gastos.
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
                      <Button 
                        onClick={handleCreateCategory}
                        disabled={createExpenseCategoryMutation.isPending}
                      >
                        {createExpenseCategoryMutation.isPending ? "Creando..." : "Crear Categoría"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {expenseCategoriesLoading ? (
                <div className="text-center py-8">
                  <p>Cargando categorías...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseCategories && expenseCategories.length > 0 ? (
                    expenseCategories.map((category: any) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-gray-500">{category.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">
                                  {category.code}
                                </Badge>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                  {category.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category, "egreso")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id, "egreso")}
                            disabled={deleteExpenseCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay categorías de egresos registradas</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar categoría */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Categoría de {editingCategory?.type === "ingreso" ? "Ingresos" : "Egresos"}
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
                value={editingCategory?.name || ""}
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
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
                value={editingCategory?.description || ""}
                onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                className="col-span-3"
                placeholder="Descripción de la categoría"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCategory}
              disabled={editIncomeCategoryMutation.isPending || editExpenseCategoryMutation.isPending}
            >
              {(editIncomeCategoryMutation.isPending || editExpenseCategoryMutation.isPending) ? "Actualizando..." : "Actualizar Categoría"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}