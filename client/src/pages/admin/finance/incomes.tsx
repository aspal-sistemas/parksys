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
  TrendingUp, 
  DollarSign,
  Calendar,
  CheckCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";

// Esquema de validación
const incomeSchema = z.object({
  parkId: z.number(),
  categoryId: z.number(),
  subcategory: z.string().optional(),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

const IncomesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<any>(null);
  const [filters, setFilters] = useState({
    concept: "",
    year: "",
    month: "",
    date: "",
    category: ""
  });
  const { toast } = useToast();

  const { data: incomes, isLoading: incomesLoading } = useQuery({
    queryKey: ["/api/actual-incomes"],
  });

  const { data: incomeCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/income-categories"],
  });

  // Debug: mostrar las categorías en consola
  console.log("Categorías de ingresos cargadas:", incomeCategories);
  console.log("Está cargando categorías:", categoriesLoading);

  const { data: parks } = useQuery({
    queryKey: ["/api/parks"],
  });

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      parkId: 3,
      amount: undefined,
      description: "",
      date: new Date().toISOString().split('T')[0],
      source: "",
      notes: "",
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues) => {
      const response = await fetch("/api/actual-incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el ingreso");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-incomes"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Ingreso registrado",
        description: "El ingreso se ha registrado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Formulario de edición separado
  const editForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      parkId: 3,
      categoryId: 0,
      amount: 0,
      concept: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      source: "",
      notes: "",
    },
  });

  // Mutación para actualizar ingresos
  const updateIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues & { id: number }) => {
      const response = await fetch(`/api/actual-incomes/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el ingreso");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-incomes"] });
      setIsEditDialogOpen(false);
      setEditingIncome(null);
      editForm.reset();
      toast({
        title: "Ingreso actualizado",
        description: "El ingreso se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/actual-incomes/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el ingreso");
      }
      
      // Manejar respuesta vacía para DELETE
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-incomes"] });
      setIsDeleteDialogOpen(false);
      setIncomeToDelete(null);
      toast({
        title: "Ingreso eliminado",
        description: "El ingreso se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    createIncomeMutation.mutate(data);
  };

  const onEditSubmit = (data: IncomeFormValues) => {
    if (editingIncome) {
      updateIncomeMutation.mutate({ ...data, id: editingIncome.id });
    }
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    editForm.reset({
      parkId: income.parkId,
      categoryId: income.categoryId,
      amount: income.amount,
      description: income.description || "",
      date: income.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
      source: income.source || "",
      notes: income.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Función para filtrar ingresos
  const filteredIncomes = useMemo(() => {
    if (!incomes) return [];
    
    return incomes.filter((income: any) => {
      const incomeDate = new Date(income.date);
      const incomeYear = incomeDate.getFullYear().toString();
      const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
      const incomeDay = incomeDate.toISOString().split('T')[0];
      
      // Filtro por concepto (descripción)
      if (filters.concept && !income.description?.toLowerCase().includes(filters.concept.toLowerCase())) {
        return false;
      }
      
      // Filtro por año
      if (filters.year && incomeYear !== filters.year) {
        return false;
      }
      
      // Filtro por mes
      if (filters.month && incomeMonth !== filters.month) {
        return false;
      }
      
      // Filtro por fecha específica
      if (filters.date && incomeDay !== filters.date) {
        return false;
      }
      
      // Filtro por categoría
      if (filters.category && income.categoryId.toString() !== filters.category) {
        return false;
      }
      
      return true;
    });
  }, [incomes, filters]);

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
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cédula de Ingresos
              </h1>
              <p className="text-gray-600">
                Gestión y registro de todos los ingresos del parque
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo ingreso
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
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un parque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(parks) && parks.map((park: any) => (
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
                              {categoriesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Cargando categorías...
                                </SelectItem>
                              ) : (
                                Array.isArray(incomeCategories) && incomeCategories.length > 0 ? (
                                  incomeCategories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-categories" disabled>
                                    No hay categorías disponibles
                                  </SelectItem>
                                )
                              )}
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
                              placeholder="Ingresa el monto"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
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
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción del ingreso" {...field} />
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
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuente</FormLabel>
                          <FormControl>
                            <Input placeholder="Fuente del ingreso" {...field} />
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
                      disabled={createIncomeMutation.isPending}
                    >
                      {createIncomeMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Registrar Ingreso
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Registrados</CardTitle>
            <CardDescription>
              Historial de todos los ingresos del parque
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
                    {incomeCategories?.map((category: any) => (
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
            
            {incomesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Cargando ingresos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(filteredIncomes) && filteredIncomes.length > 0 ? (
                  filteredIncomes.map((income: any) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{income.description}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(income.date)}
                            </span>
                            {income.source && (
                              <span>Fuente: {income.source}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(income.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {income.categoryName || 'Sin categoría'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditIncome(income)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIncomeToDelete(income);
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
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay ingresos registrados</p>
                    <p className="text-sm text-gray-500">
                      Comienza registrando tu primer ingreso
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Ingreso</DialogTitle>
              <DialogDescription>
                Modifica los datos del ingreso seleccionado
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(incomeCategories) && incomeCategories.map((category: any) => (
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
                    control={editForm.control}
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
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción del ingreso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente</FormLabel>
                        <FormControl>
                          <Input placeholder="Fuente del ingreso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateIncomeMutation.isPending}
                  >
                    {updateIncomeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Ingreso"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            {incomeToDelete && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium">{incomeToDelete.description}</h4>
                  <p className="text-sm text-gray-600">
                    {incomeToDelete.source && `Fuente: ${incomeToDelete.source}`}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {formatCurrency(incomeToDelete.amount)}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setIncomeToDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (incomeToDelete) {
                        deleteIncomeMutation.mutate(incomeToDelete.id);
                      }
                    }}
                    disabled={deleteIncomeMutation.isPending}
                  >
                    {deleteIncomeMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Eliminar Ingreso
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

export default IncomesPage;