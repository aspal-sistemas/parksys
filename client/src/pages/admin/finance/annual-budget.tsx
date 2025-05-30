import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Save, Copy, FileText, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

interface Budget {
  id: number;
  parkId: number;
  year: number;
  name: string;
  status: string;
  totalIncomeProjected: string;
  totalExpenseProjected: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetLine {
  id: number;
  budgetId: number;
  categoryId: number;
  subcategoryId?: number;
  concept: string;
  projectedAmount: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  notes?: string;
  category?: {
    id: number;
    name: string;
    code: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
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

const months = [
  { key: 'january', name: 'Enero' },
  { key: 'february', name: 'Febrero' },
  { key: 'march', name: 'Marzo' },
  { key: 'april', name: 'Abril' },
  { key: 'may', name: 'Mayo' },
  { key: 'june', name: 'Junio' },
  { key: 'july', name: 'Julio' },
  { key: 'august', name: 'Agosto' },
  { key: 'september', name: 'Septiembre' },
  { key: 'october', name: 'Octubre' },
  { key: 'november', name: 'Noviembre' },
  { key: 'december', name: 'Diciembre' }
];

export default function AnnualBudget() {
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("budgets");
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showLineDialog, setShowLineDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);
  const [lineType, setLineType] = useState<"income" | "expense">("income");

  const queryClient = useQueryClient();

  // Queries
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['/api/budgets', selectedYear, selectedPark],
    queryFn: () => apiRequest(`/api/budgets?year=${selectedYear}&parkId=${selectedPark !== "all" ? selectedPark : ""}`),
  });

  const { data: incomeCategories = [] } = useQuery({
    queryKey: ['/api/finance/income-categories'],
    queryFn: () => apiRequest('/api/finance/income-categories?active=true'),
  });

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ['/api/finance/expense-categories'],
    queryFn: () => apiRequest('/api/finance/expense-categories?active=true'),
  });

  const { data: parks = [] } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: () => apiRequest('/api/parks'),
  });

  const { data: budgetLines = [], isLoading: linesLoading } = useQuery({
    queryKey: ['/api/budget-lines', selectedBudget],
    queryFn: () => selectedBudget ? apiRequest(`/api/budgets/${selectedBudget}/lines`) : { incomeLines: [], expenseLines: [] },
    enabled: !!selectedBudget,
  });

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (budgetData: Partial<Budget>) => apiRequest('/api/budgets', { method: 'POST', body: budgetData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setShowBudgetDialog(false);
      setEditingBudget(null);
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, ...budgetData }: Partial<Budget> & { id: number }) => 
      apiRequest(`/api/budgets/${id}`, { method: 'PUT', body: budgetData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setShowBudgetDialog(false);
      setEditingBudget(null);
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budgets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      if (selectedBudget === id) {
        setSelectedBudget(null);
      }
    },
  });

  const createLineMutation = useMutation({
    mutationFn: (lineData: Partial<BudgetLine> & { type: "income" | "expense" }) => 
      apiRequest(`/api/budgets/${selectedBudget}/lines`, { method: 'POST', body: lineData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-lines', selectedBudget] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setShowLineDialog(false);
      setEditingLine(null);
    },
  });

  const updateLineMutation = useMutation({
    mutationFn: ({ id, type, ...lineData }: Partial<BudgetLine> & { id: number; type: "income" | "expense" }) => 
      apiRequest(`/api/budget-lines/${id}`, { method: 'PUT', body: { ...lineData, type } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-lines', selectedBudget] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setShowLineDialog(false);
      setEditingLine(null);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget-lines/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-lines', selectedBudget] });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
    },
  });

  const handleSaveBudget = (budgetData: Partial<Budget>) => {
    if (editingBudget) {
      updateBudgetMutation.mutate({ ...budgetData, id: editingBudget.id });
    } else {
      createBudgetMutation.mutate({
        ...budgetData,
        year: selectedYear,
        parkId: selectedPark !== "all" ? parseInt(selectedPark) : 1,
      });
    }
  };

  const handleSaveLine = (lineData: Partial<BudgetLine>) => {
    if (editingLine) {
      updateLineMutation.mutate({ ...lineData, id: editingLine.id, type: lineType });
    } else {
      createLineMutation.mutate({ ...lineData, budgetId: selectedBudget!, type: lineType });
    }
  };

  const calculateTotal = (line: BudgetLine) => {
    return months.reduce((total, month) => {
      return total + parseFloat(line[month.key as keyof BudgetLine] as string || "0");
    }, 0);
  };

  const calculateBudgetTotals = (budget: Budget) => {
    const incomeTotal = parseFloat(budget.totalIncomeProjected || "0");
    const expenseTotal = parseFloat(budget.totalExpenseProjected || "0");
    return {
      income: incomeTotal,
      expense: expenseTotal,
      balance: incomeTotal - expenseTotal
    };
  };

  if (budgetsLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">Cargando presupuestos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Presupuesto Anual</h1>
            <p className="text-muted-foreground">
              Construcción y gestión de presupuestos para el año siguiente
            </p>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027, 2028].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPark} onValueChange={setSelectedPark}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques</SelectItem>
                {Array.isArray(parks) ? parks.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowBudgetDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
            <TabsTrigger value="lines" disabled={!selectedBudget}>
              Líneas Presupuestarias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget: Budget) => {
                const totals = calculateBudgetTotals(budget);
                return (
                  <Card key={budget.id} className={`cursor-pointer transition-all ${
                    selectedBudget === budget.id ? 'ring-2 ring-blue-500' : ''
                  }`} onClick={() => setSelectedBudget(budget.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{budget.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">Año {budget.year}</p>
                        </div>
                        <Badge className={statusColors[budget.status as keyof typeof statusColors]}>
                          {statusLabels[budget.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">Ingresos</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(totals.income)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-600">Egresos</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(totals.expense)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Balance</span>
                          <span className={`font-bold ${
                            totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(totals.balance)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBudget(budget);
                            setShowBudgetDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBudget(budget.id);
                            setActiveTab("lines");
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBudgetMutation.mutate(budget.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {budgets.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay presupuestos para el año {selectedYear}
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowBudgetDialog(true)}
                  >
                    Crear primer presupuesto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lines" className="space-y-6">
            {selectedBudget && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Líneas Presupuestarias - {budgets.find(b => b.id === selectedBudget)?.name}
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setLineType("income");
                        setEditingLine(null);
                        setShowLineDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ingreso
                    </Button>
                    <Button 
                      onClick={() => {
                        setLineType("expense");
                        setEditingLine(null);
                        setShowLineDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Egreso
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="income" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="income">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ingresos
                    </TabsTrigger>
                    <TabsTrigger value="expense">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Egresos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="income">
                    <Card>
                      <CardHeader>
                        <CardTitle>Líneas de Ingreso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Concepto</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Total Anual</TableHead>
                              <TableHead>Distribución Mensual</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {budgetLines.incomeLines?.map((line: BudgetLine) => {
                              const total = calculateTotal(line);
                              return (
                                <TableRow key={line.id}>
                                  <TableCell>{line.concept}</TableCell>
                                  <TableCell>
                                    {line.category?.name}
                                    {line.subcategory && (
                                      <div className="text-sm text-muted-foreground">
                                        {line.subcategory.name}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(total)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="grid grid-cols-4 gap-1 text-xs">
                                      {months.slice(0, 4).map(month => (
                                        <div key={month.key}>
                                          {formatCurrency(parseFloat(line[month.key as keyof BudgetLine] as string || "0"))}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          setLineType("income");
                                          setEditingLine(line);
                                          setShowLineDialog(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => deleteLineMutation.mutate(line.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="expense">
                    <Card>
                      <CardHeader>
                        <CardTitle>Líneas de Egreso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Concepto</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Total Anual</TableHead>
                              <TableHead>Distribución Mensual</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {budgetLines.expenseLines?.map((line: BudgetLine) => {
                              const total = calculateTotal(line);
                              return (
                                <TableRow key={line.id}>
                                  <TableCell>{line.concept}</TableCell>
                                  <TableCell>
                                    {line.category?.name}
                                    {line.subcategory && (
                                      <div className="text-sm text-muted-foreground">
                                        {line.subcategory.name}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(total)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="grid grid-cols-4 gap-1 text-xs">
                                      {months.slice(0, 4).map(month => (
                                        <div key={month.key}>
                                          {formatCurrency(parseFloat(line[month.key as keyof BudgetLine] as string || "0"))}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          setLineType("expense");
                                          setEditingLine(line);
                                          setShowLineDialog(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => deleteLineMutation.mutate(line.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog para crear/editar presupuesto */}
        <BudgetDialog
          isOpen={showBudgetDialog}
          onClose={() => {
            setShowBudgetDialog(false);
            setEditingBudget(null);
          }}
          budget={editingBudget}
          onSave={handleSaveBudget}
          year={selectedYear}
          parks={parks}
        />

        {/* Dialog para crear/editar línea presupuestaria */}
        <BudgetLineDialog
          isOpen={showLineDialog}
          onClose={() => {
            setShowLineDialog(false);
            setEditingLine(null);
          }}
          line={editingLine}
          type={lineType}
          onSave={handleSaveLine}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </div>
    </AdminLayout>
  );
}

// Componente para el diálogo de presupuesto
function BudgetDialog({ 
  isOpen, 
  onClose, 
  budget, 
  onSave, 
  year, 
  parks 
}: {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSave: (data: Partial<Budget>) => void;
  year: number;
  parks: any[];
}) {
  const [formData, setFormData] = useState({
    name: "",
    parkId: "",
    status: "draft",
    notes: ""
  });

  useState(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        parkId: budget.parkId.toString(),
        status: budget.status,
        notes: budget.notes || ""
      });
    } else {
      setFormData({
        name: `Presupuesto ${year}`,
        parkId: "",
        status: "draft",
        notes: ""
      });
    }
  }, [budget, year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      parkId: parseInt(formData.parkId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {budget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Presupuesto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="parkId">Parque</Label>
            <Select 
              value={formData.parkId} 
              onValueChange={(value) => setFormData({ ...formData, parkId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar parque" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(parks) ? parks.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
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

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente para el diálogo de línea presupuestaria
function BudgetLineDialog({
  isOpen,
  onClose,
  line,
  type,
  onSave,
  incomeCategories,
  expenseCategories
}: {
  isOpen: boolean;
  onClose: () => void;
  line: BudgetLine | null;
  type: "income" | "expense";
  onSave: (data: Partial<BudgetLine>) => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
}) {
  const [formData, setFormData] = useState({
    concept: "",
    categoryId: "",
    subcategoryId: "",
    projectedAmount: "",
    january: "",
    february: "",
    march: "",
    april: "",
    may: "",
    june: "",
    july: "",
    august: "",
    september: "",
    october: "",
    november: "",
    december: "",
    notes: ""
  });

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = Array.isArray(categories) ? categories.find(c => c.id === parseInt(formData.categoryId)) : null;

  useState(() => {
    if (line) {
      setFormData({
        concept: line.concept,
        categoryId: line.categoryId.toString(),
        subcategoryId: line.subcategoryId?.toString() || "",
        projectedAmount: line.projectedAmount,
        january: line.january,
        february: line.february,
        march: line.march,
        april: line.april,
        may: line.may,
        june: line.june,
        july: line.july,
        august: line.august,
        september: line.september,
        october: line.october,
        november: line.november,
        december: line.december,
        notes: line.notes || ""
      });
    } else {
      setFormData({
        concept: "",
        categoryId: "",
        subcategoryId: "",
        projectedAmount: "0",
        january: "0",
        february: "0",
        march: "0",
        april: "0",
        may: "0",
        june: "0",
        july: "0",
        august: "0",
        september: "0",
        october: "0",
        november: "0",
        december: "0",
        notes: ""
      });
    }
  }, [line]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      categoryId: parseInt(formData.categoryId),
      subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : undefined,
      projectedAmount: formData.projectedAmount
    });
  };

  const distributeEvenly = () => {
    const total = parseFloat(formData.projectedAmount || "0");
    const monthlyAmount = (total / 12).toFixed(2);
    const monthlyData: any = {};
    months.forEach(month => {
      monthlyData[month.key] = monthlyAmount;
    });
    setFormData({ ...formData, ...monthlyData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {line ? "Editar" : "Nueva"} Línea de {type === "income" ? "Ingreso" : "Egreso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="projectedAmount">Monto Anual Proyectado</Label>
              <Input
                id="projectedAmount"
                type="number"
                step="0.01"
                value={formData.projectedAmount}
                onChange={(e) => setFormData({ ...formData, projectedAmount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Categoría</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) ? categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.code} - {category.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subcategoryId">Subcategoría (Opcional)</Label>
              <Select 
                value={formData.subcategoryId} 
                onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                disabled={!selectedCategory?.subcategories?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subcategories?.map((subcategory: Subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Distribución Mensual</Label>
              <Button type="button" variant="outline" size="sm" onClick={distributeEvenly}>
                Distribuir Uniformemente
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {months.map((month) => (
                <div key={month.key}>
                  <Label htmlFor={month.key} className="text-xs">{month.name}</Label>
                  <Input
                    id={month.key}
                    type="number"
                    step="0.01"
                    value={formData[month.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [month.key]: e.target.value })}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}