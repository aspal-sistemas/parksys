import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Plus, 
  TrendingDown, 
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { queryClient } from "@/lib/queryClient";

const expenseSchema = z.object({
  parkId: z.number().min(1, "Debe seleccionar un parque"),
  categoryId: z.number().min(1, "Debe seleccionar una categoría"),
  concept: z.string().min(1, "El concepto es requerido"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const ExpensesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [filters, setFilters] = useState({
    concept: "",
    year: "",
    month: "",
    date: "",
    category: ""
  });
  const { toast } = useToast();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/actual-expenses"],
  });

  // Obtener gastos de nómina
  const { data: payrollExpenses = [], isLoading: payrollExpensesLoading } = useQuery({
    queryKey: ["/api/payroll-expenses"],
  });

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  const { data: parks = [] } = useQuery({
    queryKey: ["/api/parks"],
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      parkId: 3,
      categoryId: 2,
      concept: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      notes: "",
    },
  });

  const editForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      parkId: 3,
      categoryId: 2,
      concept: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      notes: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      const response = await fetch("/api/actual-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el egreso");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-expenses"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Egreso registrado",
        description: "El egreso se ha registrado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el egreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues & { id: number }) => {
      const response = await fetch(`/api/actual-expenses/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el egreso");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-expenses"] });
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      toast({
        title: "Egreso actualizado",
        description: "El egreso se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el egreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/actual-expenses/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el egreso");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-expenses"] });
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      toast({
        title: "Egreso eliminado",
        description: "El egreso se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el egreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpenseMutation.mutate(data);
  };

  const onEditSubmit = (data: ExpenseFormValues) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ ...data, id: editingExpense.id });
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    const defaultValues = {
      parkId: expense.parkId || 3,
      categoryId: expense.categoryId || 2,
      concept: expense.concept || "",
      amount: expense.amount || 0,
      description: expense.description || "",
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      vendor: expense.vendor || "",
      notes: expense.notes || "",
    };
    editForm.reset(defaultValues);
    setIsEditDialogOpen(true);
  };

  // Combinar gastos regulares y de nómina
  const allExpenses = useMemo(() => {
    const regularExpenses = Array.isArray(expenses) ? expenses.map((expense: any) => ({
      ...expense,
      source: 'manual',
      isPayrollGenerated: false
    })) : [];
    
    const payrollExpensesFormatted = Array.isArray(payrollExpenses) ? payrollExpenses.map((expense: any) => ({
      ...expense,
      source: 'payroll',
      isPayrollGenerated: true,
      vendor: expense.supplier || 'Nómina Interna'
    })) : [];
    
    return [...regularExpenses, ...payrollExpensesFormatted];
  }, [expenses, payrollExpenses]);

  // Función para filtrar gastos
  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(allExpenses)) return [];
    
    return allExpenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear().toString();
      const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
      const expenseDay = expenseDate.toISOString().split('T')[0];
      
      if (filters.concept && !expense.concept?.toLowerCase().includes(filters.concept.toLowerCase())) {
        return false;
      }
      
      if (filters.year && expenseYear !== filters.year) {
        return false;
      }
      
      if (filters.month && expenseMonth !== filters.month) {
        return false;
      }
      
      if (filters.date && expenseDay !== filters.date) {
        return false;
      }
      
      if (filters.category && expense.categoryId.toString() !== filters.category) {
        return false;
      }
      
      return true;
    });
  }, [expenses, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cédula de Egresos
              </h1>
              <p className="text-gray-600">
                Gestión y registro de todos los gastos del parque (incluye nómina automática)
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Egreso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
                <DialogDescription>
                  Complete la información del gasto realizado
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parque</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parks.map((park: any) => (
                              <SelectItem key={park.id} value={park.id.toString()}>
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría de Egreso</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseCategories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="concept"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concepto</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción breve del gasto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción detallada</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción completa del gasto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del proveedor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Input placeholder="Notas opcionales" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createExpenseMutation.isPending}
                    >
                      {createExpenseMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Registrar Egreso
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de egresos */}
        <Card>
          <CardHeader>
            <CardTitle>Egresos Registrados</CardTitle>
            <CardDescription>
              Historial de todos los gastos del parque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros de búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Input
                    placeholder="Buscar por concepto..."
                    value={filters.concept}
                    onChange={(e) => setFilters(prev => ({ ...prev, concept: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Todos los años</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Todos los meses</option>
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>
                <div>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {expenseCategories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(filters.concept || filters.year || filters.month || filters.date || filters.category) && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ concept: "", year: "", month: "", date: "", category: "" })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
            
            {expensesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Cargando egresos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">
                                {expense.concept}
                              </h3>
                              {expense.isPayrollGenerated && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Nómina
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {expense.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>
                                {formatDate(expense.date)}
                              </span>
                              {expense.vendor && (
                                <span>Proveedor: {expense.vendor}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            -{formatCurrency(expense.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expense.categoryName || 'Sin categoría'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setExpenseToDelete(expense);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay egresos registrados</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de edición simplificado */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Egreso</DialogTitle>
              <DialogDescription>
                Modifica la información del gasto
              </DialogDescription>
            </DialogHeader>

            {editingExpense && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Parque</label>
                  <select 
                    value={editingExpense.parkId || 3}
                    onChange={(e) => setEditingExpense({...editingExpense, parkId: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {Array.isArray(parks) && parks.map((park: any) => (
                      <option key={park.id} value={park.id}>
                        {park.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select 
                    value={editingExpense.categoryId || 2}
                    onChange={(e) => setEditingExpense({...editingExpense, categoryId: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {Array.isArray(expenseCategories) && expenseCategories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Concepto</label>
                  <Input
                    value={editingExpense.concept || ""}
                    onChange={(e) => setEditingExpense({...editingExpense, concept: e.target.value})}
                    placeholder="Descripción breve del gasto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Monto</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingExpense.amount || 0}
                      onChange={(e) => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha</label>
                    <Input
                      type="date"
                      value={editingExpense.date ? editingExpense.date.split('T')[0] : new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={editingExpense.description || ""}
                    onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
                    placeholder="Descripción completa del gasto"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Proveedor (opcional)</label>
                  <Input
                    value={editingExpense.vendor || ""}
                    onChange={(e) => setEditingExpense({...editingExpense, vendor: e.target.value})}
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notas</label>
                  <Input
                    value={editingExpense.notes || ""}
                    onChange={(e) => setEditingExpense({...editingExpense, notes: e.target.value})}
                    placeholder="Notas adicionales"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingExpense) {
                        updateExpenseMutation.mutate({
                          id: editingExpense.id,
                          parkId: editingExpense.parkId,
                          categoryId: editingExpense.categoryId,
                          concept: editingExpense.concept,
                          amount: editingExpense.amount,
                          description: editingExpense.description,
                          date: editingExpense.date,
                          vendor: editingExpense.vendor,
                          notes: editingExpense.notes,
                        });
                      }
                    }}
                    disabled={updateExpenseMutation.isPending}
                  >
                    {updateExpenseMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este egreso? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            {expenseToDelete && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium">{expenseToDelete.concept}</h4>
                  <p className="text-sm text-gray-600">{expenseToDelete.description}</p>
                  <p className="text-lg font-bold text-red-600 mt-2">
                    -{formatCurrency(expenseToDelete.amount)}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setExpenseToDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (expenseToDelete) {
                        deleteExpenseMutation.mutate(expenseToDelete.id);
                      }
                    }}
                    disabled={deleteExpenseMutation.isPending}
                  >
                    {deleteExpenseMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Eliminar Egreso
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

export default ExpensesPage;