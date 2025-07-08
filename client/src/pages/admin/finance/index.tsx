import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Plus, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Upload,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator
} from "lucide-react";

// Esquemas de validación
const incomeSchema = z.object({
  parkId: z.number(),
  categoryId: z.number(),
  subcategoryId: z.number().optional(),
  concept: z.string().min(3, "El concepto debe tener al menos 3 caracteres"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  date: z.string(),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

const expenseSchema = z.object({
  parkId: z.number(),
  categoryId: z.number(),
  subcategoryId: z.number().optional(),
  concept: z.string().min(3, "El concepto debe tener al menos 3 caracteres"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  date: z.string(),
  supplier: z.string().optional(),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  isPaid: z.boolean().default(false),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;
type ExpenseFormValues = z.infer<typeof expenseSchema>;

// Componente del Dashboard Ejecutivo
const ExecutiveDashboard = () => {
  const currentYear = new Date().getFullYear();
  const parkId = 3; // TODO: Obtener del contexto o parámetro
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/financial-dashboard", parkId],
    queryFn: () => fetch(`/api/financial-dashboard/${parkId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Dashboard Ejecutivo</h3>
          <p className="text-sm text-muted-foreground">
            Resumen financiero y métricas clave del parque
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${parseFloat(dashboardData?.currentMonthIncome || "0").toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos de {new Date().toLocaleString('es', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${parseFloat(dashboardData?.currentMonthExpenses || "0").toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Egresos de {new Date().toLocaleString('es', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Anual</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData?.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${parseFloat(dashboardData?.netResult || "0").toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Resultado neto {currentYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${parseFloat(dashboardData?.pendingPayments || "0").toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Flujo de Efectivo Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de flujo de efectivo mensual
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de distribución por categoría
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente de Cédula de Ingresos
const IncomeStatement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const parkId = 3; // TODO: Obtener del contexto

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["/api/actual-incomes", { parkId, year: currentYear }],
  });

  const { data: incomeCategories = [] } = useQuery({
    queryKey: ["/api/income-categories"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues) => {
      const response = await fetch("/api/actual-incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error al registrar ingreso");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-incomes"] });
      toast({ title: "Éxito", description: "Ingreso registrado correctamente" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Hubo un problema al registrar el ingreso", variant: "destructive" });
    },
  });

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      parkId: parkId,
      categoryId: 0,
      concept: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    createIncomeMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando ingresos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cédula de Ingresos</h3>
          <p className="text-sm text-muted-foreground">
            Registro y seguimiento de todos los ingresos del parque
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          Registrar Ingreso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
            Ingresos Registrados - {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(incomes) && incomes.length > 0 ? (
                  incomes.map((income: any) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        {new Date(income.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{income.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{income.concept}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        ${parseFloat(income.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{income.referenceNumber || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay ingresos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para registrar nuevo ingreso */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
            <DialogDescription>
              Registra un nuevo ingreso en la cédula financiera
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incomeCategories.map((category: any) => (
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
                      <FormLabel>Monto *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
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
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe el concepto del ingreso" {...field} />
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
                      <FormLabel>Fecha *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Referencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Referencia o folio" {...field} />
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
                      <Textarea 
                        placeholder="Descripción adicional del ingreso..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createIncomeMutation.isPending}
                >
                  {createIncomeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Ingreso"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente de Cédula de Egresos  
const ExpenseStatement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const parkId = 3; // TODO: Obtener del contexto

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["/api/actual-expenses", { parkId, year: currentYear }],
  });

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      const response = await fetch("/api/actual-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error al registrar egreso");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actual-expenses"] });
      toast({ title: "Éxito", description: "Egreso registrado correctamente" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Hubo un problema al registrar el egreso", variant: "destructive" });
    },
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      parkId: parkId,
      categoryId: 0,
      concept: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      isPaid: false,
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpenseMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando egresos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cédula de Egresos</h3>
          <p className="text-sm text-muted-foreground">
            Registro y control de todos los egresos del parque
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          Registrar Egreso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
            Egresos Registrados - {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(expenses) && expenses.length > 0 ? (
                  expenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{expense.concept}</TableCell>
                      <TableCell>{expense.supplier || "N/A"}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        ${parseFloat(expense.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {expense.isPaid ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No hay egresos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para registrar nuevo egreso */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
            <DialogDescription>
              Registra un nuevo egreso en la cédula financiera
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
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
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe el concepto del egreso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
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

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Factura</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de factura" {...field} />
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
                      <Textarea 
                        placeholder="Descripción adicional del egreso..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createExpenseMutation.isPending}
                >
                  {createExpenseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Egreso"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente de Flujo de Efectivo
const CashFlowStatement = () => {
  const currentYear = new Date().getFullYear();
  const parkId = 3; // TODO: Obtener del contexto

  const { data: cashFlow = [], isLoading } = useQuery({
    queryKey: ["/api/cash-flow", parkId, currentYear],
    queryFn: () => fetch(`/api/cash-flow/${parkId}/${currentYear}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando flujo de efectivo...</span>
      </div>
    );
  }

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Flujo de Efectivo</h3>
          <p className="text-sm text-muted-foreground">
            Proyección vs. real del flujo de efectivo mensual
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload size={16} />
            Importar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Flujo de Efectivo {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Saldo Inicial</TableHead>
                  <TableHead>Ingresos Proy.</TableHead>
                  <TableHead>Ingresos Real</TableHead>
                  <TableHead>Egresos Proy.</TableHead>
                  <TableHead>Egresos Real</TableHead>
                  <TableHead>Saldo Final</TableHead>
                  <TableHead>Variación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((month, index) => {
                  const monthData = cashFlow.find((cf: any) => cf.month === index + 1);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{month}</TableCell>
                      <TableCell>
                        ${parseFloat(monthData?.openingBalance || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600">
                        ${parseFloat(monthData?.projectedIncome || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-700 font-semibold">
                        ${parseFloat(monthData?.actualIncome || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-600">
                        ${parseFloat(monthData?.projectedExpenses || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-700 font-semibold">
                        ${parseFloat(monthData?.actualExpenses || "0").toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${parseFloat(monthData?.actualClosingBalance || "0").toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={parseFloat(monthData?.variance || "0") >= 0 ? "default" : "destructive"}
                        >
                          {parseFloat(monthData?.variance || "0") >= 0 ? "+" : ""}
                          ${parseFloat(monthData?.variance || "0").toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AdminLayout>
      <Helmet>
        <title>Módulo Financiero | Bosques Urbanos</title>
        <meta 
          name="description" 
          content="Gestión financiera integral: flujo de efectivo, ingresos, egresos y presupuestos" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Módulo Financiero</h1>
            <p className="text-muted-foreground">
              Gestión integral de las finanzas del parque
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="incomes" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cédula de Ingresos
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Cédula de Egresos
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Flujo de Efectivo
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="incomes">
            <IncomeStatement />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseStatement />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowStatement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}