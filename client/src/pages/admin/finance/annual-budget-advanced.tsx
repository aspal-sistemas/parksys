import React, { useState } from "react";
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
  const [selectedYear, setSelectedYear] = useState(2026); // Cambiar a 2026 donde hay más presupuestos
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['/api/budgets', selectedYear, selectedPark, selectedStatus],
    queryFn: () => {
      let url = `/api/budgets?year=${selectedYear}`;
      if (selectedPark !== "all") url += `&parkId=${selectedPark}`;
      if (selectedStatus !== "all") url += `&status=${selectedStatus}`;
      return apiRequest(url);
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

  const budgetList = Array.isArray(budgets) ? budgets : [];
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
  const { data: lines = [] } = useQuery({
    queryKey: [`/api/budgets/${budgetId}/${type}-lines`],
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Líneas de {type === 'income' ? 'Ingresos' : 'Gastos'}
        </h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Línea
        </Button>
      </div>
      
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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comparación Presupuesto vs Real</h3>
      <p className="text-gray-600">Funcionalidad de comparación en desarrollo...</p>
    </div>
  );
}

function BudgetAnalytics({ budgetId }: { budgetId: number }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Análisis del Presupuesto</h3>
      <p className="text-gray-600">Análisis y reportes en desarrollo...</p>
    </div>
  );
}