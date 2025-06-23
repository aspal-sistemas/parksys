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
  Loader2,
  ChevronLeft,
  ChevronRight
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
    year: "",
    month: "",
    date: "",
    category: "",
    amount: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Consultas principales
  const { data: incomes, isLoading: incomesLoading, refetch: refetchIncomes } = useQuery({
    queryKey: ["/api/actual-incomes"]
  });

  const { data: parks, isLoading: parksLoading } = useQuery({
    queryKey: ["/api/parks"]
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/income-categories"]
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

  const editForm = useForm<IncomeFormValues>({
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

  // Mutación para crear ingreso
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
        const errorData = await response.text();
        throw new Error(`Error al crear el ingreso: ${errorData}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-incomes"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Ingreso creado",
        description: "El ingreso se ha creado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error al crear ingreso:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Mutación para editar ingreso
  const editIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues) => {
      const response = await fetch(`/api/actual-incomes/${editingIncome.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al editar el ingreso: ${errorData}`);
      }
      
      return await response.json();
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
      console.error("Error al editar ingreso:", error);
      toast({
        title: "Error",
        description: "No se pudo editar el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar ingreso
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/actual-incomes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al eliminar el ingreso: ${errorData}`);
      }
      
      return await response.json();
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
      console.error("Error al eliminar ingreso:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

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
    if (!incomes || !Array.isArray(incomes)) return [];
    
    return incomes.filter((income: any) => {
      const incomeDate = new Date(income.date);
      const incomeYear = incomeDate.getFullYear().toString();
      const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
      const incomeDay = incomeDate.toISOString().split('T')[0];
      
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

  // Lógica de paginación
  const totalItems = filteredIncomes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);

  // Reiniciar página cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const onSubmit = (data: IncomeFormValues) => {
    createIncomeMutation.mutate(data);
  };

  const onEditSubmit = (data: IncomeFormValues) => {
    editIncomeMutation.mutate(data);
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
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetchIncomes()}
              className="flex items-center gap-2"
            >
              <Loader2 className={`h-4 w-4 ${incomesLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
            
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
              <DialogDescription>
                Completa la información del ingreso a registrar.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parque</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona parque" />
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
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map((category: any) => (
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
                </div>

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
                            placeholder="0.00" 
                            {...field}
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
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción del ingreso" {...field} />
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
                      <FormLabel>Fuente (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Fuente del ingreso" {...field} />
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
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Notas adicionales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createIncomeMutation.isPending}>
                    {createIncomeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Ingreso
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Filtros</h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filter-year">Año</Label>
              <Select 
                value={filters.year} 
                onValueChange={(value) => setFilters({...filters, year: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los años</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-month">Mes</Label>
              <Select 
                value={filters.month} 
                onValueChange={(value) => setFilters({...filters, month: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los meses</SelectItem>
                  <SelectItem value="01">Enero</SelectItem>
                  <SelectItem value="02">Febrero</SelectItem>
                  <SelectItem value="03">Marzo</SelectItem>
                  <SelectItem value="04">Abril</SelectItem>
                  <SelectItem value="05">Mayo</SelectItem>
                  <SelectItem value="06">Junio</SelectItem>
                  <SelectItem value="07">Julio</SelectItem>
                  <SelectItem value="08">Agosto</SelectItem>
                  <SelectItem value="09">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-date">Fecha específica</Label>
              <Input 
                type="date" 
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="filter-category">Categoría</Label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({year: "", month: "", date: "", category: "", amount: ""})}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registro de Ingresos
            </CardTitle>
            <CardDescription>
              Listado completo de todos los ingresos registrados ({totalItems} registros)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando ingresos...</span>
              </div>
            ) : paginatedIncomes && paginatedIncomes.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                  <div>Fecha</div>
                  <div>Parque</div>
                  <div>Categoría</div>
                  <div>Descripción</div>
                  <div>Monto</div>
                  <div>Fuente</div>
                  <div>Estado</div>
                  <div>Acciones</div>
                </div>
                
                {paginatedIncomes.map((income: any) => (
                  <div key={income.id} className="grid grid-cols-8 gap-4 text-sm py-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(income.date)}
                    </div>
                    <div className="font-medium">
                      {income.parkName || 'N/A'}
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {income.categoryName || 'Sin categoría'}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {income.description}
                    </div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                    </div>
                    <div className="text-gray-500">
                      {income.source || '-'}
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Registrado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditIncome(income)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIncomeToDelete(income);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se encontraron ingresos registrados
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} ingresos
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Ingreso</DialogTitle>
              <DialogDescription>
                Modifica la información del ingreso.
              </DialogDescription>
            </DialogHeader>
            {editingIncome && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="parkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parque</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona parque" />
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
                    
                    <FormField
                      control={editForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(categories) && categories.map((category: any) => (
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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

                  <FormField
                    control={editForm.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Fuente del ingreso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Notas adicionales" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={editIncomeMutation.isPending}>
                      {editIncomeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Actualizar Ingreso
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            {incomeToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div><strong>Descripción:</strong> {incomeToDelete.description}</div>
                  <div><strong>Monto:</strong> {formatCurrency(incomeToDelete.amount)}</div>
                  <div><strong>Fecha:</strong> {formatDate(incomeToDelete.date)}</div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteIncomeMutation.mutate(incomeToDelete.id)}
                disabled={deleteIncomeMutation.isPending}
              >
                {deleteIncomeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar Ingreso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default IncomesPage;