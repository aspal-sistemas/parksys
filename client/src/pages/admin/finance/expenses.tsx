import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Plus, 
  Edit, 
  TrendingDown, 
  DollarSign,
  Calendar,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";

// Esquema de validación
const expenseSchema = z.object({
  parkId: z.number(),
  categoryId: z.number(),
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
  const [filters, setFilters] = useState({
    concept: "",
    year: "",
    month: "",
    date: "",
    category: ""
  });
  const { toast } = useToast();

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/actual-expenses"],
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  const { data: parks } = useQuery({
    queryKey: ["/api/parks"],
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      parkId: 3,
      categoryId: 0,
      concept: "",
      amount: undefined,
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

  // Formulario de edición separado
  const editForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      parkId: 3,
      categoryId: 0,
      concept: "",
      amount: undefined,
      description: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      notes: "",
    },
  });

  // Mutación para actualizar gastos
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
        throw new Error("Error al actualizar el gasto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-expenses"] });
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      editForm.reset();
      toast({
        title: "Gasto actualizado",
        description: "El gasto se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el gasto. Intenta nuevamente.",
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
    editForm.reset({
      parkId: expense.parkId,
      categoryId: expense.categoryId,
      concept: expense.concept || "",
      amount: expense.amount,
      description: expense.description || "",
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      vendor: expense.vendor || "",
      notes: expense.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Función para filtrar gastos
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear().toString();
      const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
      const expenseDay = expenseDate.toISOString().split('T')[0];
      
      // Debug para el filtro del año
      if (filters.year) {
        console.log('Filtro año:', filters.year, 'Año del gasto:', expenseYear, 'Coincide:', expenseYear === filters.year);
      }
      
      // Filtro por concepto
      if (filters.concept && !expense.concept?.toLowerCase().includes(filters.concept.toLowerCase())) {
        return false;
      }
      
      // Filtro por año
      if (filters.year && expenseYear !== filters.year) {
        return false;
      }
      
      // Filtro por mes
      if (filters.month && expenseMonth !== filters.month) {
        return false;
      }
      
      // Filtro por fecha específica
      if (filters.date && expenseDay !== filters.date) {
        return false;
      }
      
      // Filtro por categoría
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
                Gestión y registro de todos los gastos del parque
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
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo gasto
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(expenseCategories) && expenseCategories.map((category: any) => (
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="concept"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concepto</FormLabel>
                        <FormControl>
                          <Input placeholder="Concepto del gasto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción del gasto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del proveedor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                  <Input
                    type="number"
                    placeholder="Año (ej: 2024)"
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="h-9"
                  />
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
                    {expenseCategories?.map((category: any) => (
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
                {Array.isArray(filteredExpenses) && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{expense.description}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(expense.date)}
                            </span>
                            {expense.vendor && (
                              <span>Proveedor: {expense.vendor}</span>
                            )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay egresos registrados</p>
                    <p className="text-sm text-gray-500">
                      Comienza registrando tu primer gasto
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ExpensesPage;