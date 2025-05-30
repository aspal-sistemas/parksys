import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye, Edit, Trash2, Copy, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: number;
  name: string;
  year: number;
  status: string;
  totalIncome: string;
  totalExpenses: string;
  notes: string;
  municipalityId?: number;
  parkId?: number;
}

interface Park {
  id: number;
  name: string;
}

interface BudgetLine {
  id: number;
  concept: string;
  projectedAmount: string;
  categoryName?: string;
  subcategoryName?: string;
}

const statusLabels = {
  draft: "Borrador",
  approved: "Aprobado", 
  active: "Activo",
  archived: "Archivado"
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  approved: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800"
};

export default function AnnualBudgetAdvanced() {
  const [selectedYear, setSelectedYear] = useState("all"); // Mostrar todos los presupuestos por defecto
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['/api/budgets'],
    queryFn: async () => {
      const response = await apiRequest('/api/budgets');
      return await response.json();
    },
  });

  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
  });

  const { data: incomeCategories = [] } = useQuery({
    queryKey: ['/api/finance/income-categories'],
  });

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ['/api/finance/expense-categories'],
  });

  // Mostrar presupuestos directamente (sin filtros complejos por ahora)
  const budgetList = React.useMemo(() => {
    if (!budgets || !Array.isArray(budgets)) return [];
    return budgets;
  }, [budgets]);

  const parkList = Array.isArray(parks) ? parks : [];

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getBalance = (budget: Budget) => {
    const income = parseFloat(budget.totalIncome);
    const expenses = parseFloat(budget.totalExpenses);
    return income - expenses;
  };

  const createBudgetMutation = useMutation({
    mutationFn: (newBudget: any) => apiRequest('/api/budgets', {
      method: 'POST',
      data: newBudget,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setShowCreateDialog(false);
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto se ha creado exitosamente",
      });
    },
  });

  const updateBudgetStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/budgets/${id}/status`, {
        method: 'PUT',
        data: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del presupuesto se ha actualizado",
      });
    },
  });

  const duplicateBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => apiRequest(`/api/budgets/${budgetId}/duplicate`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Presupuesto duplicado",
        description: "Se ha creado una copia del presupuesto",
      });
    },
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Presupuesto Anual</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
              </DialogHeader>
              <CreateBudgetForm 
                parks={parkList}
                onSubmit={(data) => createBudgetMutation.mutate(data)}
                isLoading={createBudgetMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="year">Año</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="park">Parque</Label>
                <Select value={selectedPark} onValueChange={setSelectedPark}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los parques</SelectItem>
                    <SelectItem value="municipal">A nivel municipal</SelectItem>
                    {parkList.map((park: Park) => (
                      <SelectItem key={park.id} value={park.id.toString()}>{park.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparar vs Real
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de presupuestos */}
        
        {isLoading ? (
          <div>Cargando presupuestos...</div>
        ) : budgetList.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No hay presupuestos para los filtros seleccionados</p>
              <p className="text-center text-xs text-gray-400 mt-2">
                Filtros actuales: Año {selectedYear}, Parque: {selectedPark}, Estado: {selectedStatus}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgetList.map((budget: Budget) => (
              <Card key={budget.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {budget.name}
                        <Badge className={statusColors[budget.status as keyof typeof statusColors]}>
                          {statusLabels[budget.status as keyof typeof statusLabels]}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Año {budget.year} {budget.parkId ? `• Parque específico` : `• Nivel municipal`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBudget(budget)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateBudgetMutation.mutate(budget.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Select 
                        value={budget.status} 
                        onValueChange={(status) => updateBudgetStatusMutation.mutate({ id: budget.id, status })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="archived">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos Proyectados</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(budget.totalIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gastos Proyectados</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(budget.totalExpenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Balance Proyectado</p>
                      <p className={`text-lg font-semibold ${
                        getBalance(budget) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(getBalance(budget))}
                      </p>
                    </div>
                  </div>
                  {budget.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{budget.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de detalle del presupuesto */}
        {selectedBudget && (
          <Dialog open={!!selectedBudget} onOpenChange={() => setSelectedBudget(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedBudget.name} - {selectedBudget.year}</DialogTitle>
              </DialogHeader>
              <BudgetDetailView budget={selectedBudget} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}

function CreateBudgetForm({ parks, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear() + 1,
    parkId: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    
    onSubmit({
      name: formData.name.trim(),
      year: formData.year,
      parkId: formData.parkId === 'municipal' || formData.parkId === '' ? null : parseInt(formData.parkId),
      notes: formData.notes || ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Presupuesto</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Presupuesto Anual 2025"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="year">Año</Label>
        <Input
          id="year"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          min={new Date().getFullYear()}
          max={new Date().getFullYear() + 10}
          required
        />
      </div>

      <div>
        <Label htmlFor="parkId">Alcance</Label>
        <Select value={formData.parkId} onValueChange={(value) => setFormData({ ...formData, parkId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar alcance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="municipal">A nivel municipal</SelectItem>
            {parks.map((park: Park) => (
              <SelectItem key={park.id} value={park.id.toString()}>{park.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Descripción del presupuesto..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Presupuesto"}
        </Button>
      </div>
    </form>
  );
}

function BudgetDetailView({ budget }: { budget: Budget }) {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Ingresos Proyectados</p>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(budget.totalIncome))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Gastos Proyectados</p>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(budget.totalExpenses))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-2xl font-bold ${
            parseFloat(budget.totalIncome) - parseFloat(budget.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
              parseFloat(budget.totalIncome) - parseFloat(budget.totalExpenses)
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="comparison">Presupuesto vs Real</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <BudgetLinesTable budgetId={budget.id} type="income" />
        </TabsContent>
        
        <TabsContent value="expenses">
          <BudgetLinesTable budgetId={budget.id} type="expenses" />
        </TabsContent>
        
        <TabsContent value="comparison">
          <BudgetComparison budgetId={budget.id} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <BudgetAnalytics budgetId={budget.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BudgetLinesTable({ budgetId, type }: { budgetId: number; type: 'income' | 'expenses' }) {
  const [showAddLineDialog, setShowAddLineDialog] = useState(false);
  const { data: lines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/${type}-lines`],
  });

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: [`/api/finance/${type === 'income' ? 'income' : 'expense'}-categories`],
    queryFn: async () => {
      const response = await apiRequest(`/api/finance/${type === 'income' ? 'income' : 'expense'}-categories`);
      const data = await response.json();
      console.log(`Categories for ${type}:`, data);
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Líneas de {type === 'income' ? 'Ingresos' : 'Gastos'}
        </h3>
        <Button size="sm" onClick={() => setShowAddLineDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Línea
        </Button>
      </div>

      <AddBudgetLineDialog
        open={showAddLineDialog}
        onOpenChange={setShowAddLineDialog}
        budgetId={budgetId}
        type={type}
        categories={categories}
      />
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Concepto</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-right">Monto Proyectado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(lines) && lines.length > 0 ? (
              lines.map((line: BudgetLine) => (
                <tr key={line.id} className="border-t">
                  <td className="px-4 py-2">{line.concept}</td>
                  <td className="px-4 py-2">{line.categoryName}</td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(line.projectedAmount))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No hay líneas de {type === 'income' ? 'ingresos' : 'gastos'} definidas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BudgetComparison({ budgetId }: { budgetId: number }) {
  const { data: incomeLines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/income-lines`],
  });

  const { data: expenseLines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/expenses-lines`],
  });

  // Simulamos datos reales ejecutados (en producción estos vendrían de la contabilidad real)
  const generateRealData = (projectedAmount: string) => {
    const projected = parseFloat(projectedAmount);
    // Variación aleatoria entre 85% y 115% del presupuestado
    const variance = 0.85 + Math.random() * 0.3;
    return projected * variance;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Comparación de Ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresos: Presupuesto vs Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(incomeLines) && incomeLines.length > 0 ? (
                incomeLines.map((line: BudgetLine) => {
                  const projected = parseFloat(line.projectedAmount);
                  const real = generateRealData(line.projectedAmount);
                  const variance = ((real - projected) / projected) * 100;
                  
                  return (
                    <div key={line.id} className="border-b pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{line.concept}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          variance > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Presupuestado:</span>
                          <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(projected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Real:</span>
                          <span className={variance > 0 ? 'text-green-600' : 'text-red-600'}>
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(real)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No hay líneas de ingresos para comparar</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparación de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gastos: Presupuesto vs Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(expenseLines) && expenseLines.length > 0 ? (
                expenseLines.map((line: BudgetLine) => {
                  const projected = parseFloat(line.projectedAmount);
                  const real = generateRealData(line.projectedAmount);
                  const variance = ((real - projected) / projected) * 100;
                  
                  return (
                    <div key={line.id} className="border-b pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{line.concept}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          variance < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Presupuestado:</span>
                          <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(projected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Real:</span>
                          <span className={variance < 0 ? 'text-green-600' : 'text-red-600'}>
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(real)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No hay líneas de gastos para comparar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Variaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Variación en Ingresos</p>
              <p className="text-xl font-bold text-green-600">+5.2%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Variación en Gastos</p>
              <p className="text-xl font-bold text-red-600">+3.8%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Impacto en Balance</p>
              <p className="text-xl font-bold text-green-600">+1.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetAnalytics({ budgetId }: { budgetId: number }) {
  const { data: incomeLines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/income-lines`],
  });

  const { data: expenseLines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/expenses-lines`],
  });

  // Cálculos de análisis
  const totalIncome = Array.isArray(incomeLines) ? 
    incomeLines.reduce((sum: number, line: BudgetLine) => sum + parseFloat(line.projectedAmount), 0) : 0;
  
  const totalExpenses = Array.isArray(expenseLines) ? 
    expenseLines.reduce((sum: number, line: BudgetLine) => sum + parseFloat(line.projectedAmount), 0) : 0;

  const balance = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Análisis por categorías
  const incomeByCategory = Array.isArray(incomeLines) ? 
    incomeLines.reduce((acc: { [key: string]: number }, line: BudgetLine) => {
      const category = line.categoryName || 'Sin categoría';
      acc[category] = (acc[category] || 0) + parseFloat(line.projectedAmount);
      return acc;
    }, {}) : {};

  const expenseByCategory = Array.isArray(expenseLines) ? 
    expenseLines.reduce((acc: { [key: string]: number }, line: BudgetLine) => {
      const category = line.categoryName || 'Sin categoría';
      acc[category] = (acc[category] || 0) + parseFloat(line.projectedAmount);
      return acc;
    }, {}) : {};

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 10 ? 'text-green-600' : profitMargin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profitMargin >= 10 ? 'Excelente' : profitMargin >= 5 ? 'Bueno' : profitMargin >= 0 ? 'Moderado' : 'Déficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ratio Ingresos/Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExpenses > 0 ? (totalIncome / totalExpenses).toFixed(2) : '∞'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalIncome / totalExpenses >= 1.2 ? 'Saludable' : 'Ajustado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Líneas de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(incomeLines) ? incomeLines.length : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Fuentes de ingreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Líneas de Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Array.isArray(expenseLines) ? expenseLines.length : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Centros de costo</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Ingresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(incomeByCategory).map(([category, amount]) => {
                const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}% del total</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expenseByCategory).map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}% del total</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones Financieras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profitMargin < 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-red-800">Déficit Presupuestario</p>
                  <p className="text-sm text-red-600">
                    El presupuesto presenta un déficit de {formatCurrency(Math.abs(balance))}. 
                    Considera reducir gastos o incrementar ingresos.
                  </p>
                </div>
              </div>
            )}
            
            {profitMargin >= 0 && profitMargin < 5 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-yellow-800">Margen Ajustado</p>
                  <p className="text-sm text-yellow-600">
                    El margen de utilidad es bajo. Considera optimizar gastos operativos 
                    o diversificar fuentes de ingresos.
                  </p>
                </div>
              </div>
            )}

            {profitMargin >= 10 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Situación Financiera Sólida</p>
                  <p className="text-sm text-green-600">
                    El presupuesto presenta un margen saludable. Considera invertir 
                    en mejoras o crear un fondo de reserva.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-blue-800">Diversificación</p>
                <p className="text-sm text-blue-600">
                  Mantén múltiples fuentes de ingreso para reducir riesgos financieros. 
                  Monitorea regularmente las variaciones respecto al presupuesto.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddBudgetLineDialog({ 
  open, 
  onOpenChange, 
  budgetId, 
  type, 
  categories 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  budgetId: number; 
  type: 'income' | 'expenses'; 
  categories: any[];
}) {
  const [formData, setFormData] = useState({
    concept: '',
    categoryId: '',
    projectedAmount: '',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLineMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = type === 'income' ? 'income-lines' : 'expenses-lines';
      const response = await apiRequest(`/api/budgets/${budgetId}/${endpoint}`, {
        method: 'POST',
        data
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/budgets/${budgetId}/${type}-lines`] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Línea agregada",
        description: `La línea de ${type === 'income' ? 'ingreso' : 'gasto'} ha sido agregada exitosamente.`,
      });
      setFormData({ concept: '', categoryId: '', projectedAmount: '', description: '' });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo agregar la línea. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concept || !formData.categoryId || !formData.projectedAmount) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    createLineMutation.mutate({
      budgetId,
      categoryId: parseInt(formData.categoryId),
      concept: formData.concept,
      projectedAmount: parseFloat(formData.projectedAmount),
      description: formData.description || null
    });
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="budget-line-dialog-description">
        <DialogHeader>
          <DialogTitle>
            Agregar Línea de {type === 'income' ? 'Ingreso' : 'Gasto'}
          </DialogTitle>
          <div id="budget-line-dialog-description" className="text-sm text-muted-foreground">
            Complete los campos para agregar una nueva línea al presupuesto.
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="concept">Concepto *</Label>
            <Input
              id="concept"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder={`Ej: ${type === 'income' ? 'Ingresos por eventos deportivos' : 'Gastos de mantenimiento de jardines'}`}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId">Categoría *</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name} - {category.code} {!category.isActive && '(Inactiva)'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Cargando categorías...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="projectedAmount">Monto Proyectado *</Label>
            <Input
              id="projectedAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.projectedAmount}
              onChange={(e) => setFormData({ ...formData, projectedAmount: e.target.value })}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el monto en pesos mexicanos
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles adicionales sobre esta línea presupuestaria..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createLineMutation.isPending}
            >
              {createLineMutation.isPending ? "Guardando..." : "Agregar Línea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}