import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import Papa from 'papaparse';

interface CashFlowData {
  year: number;
  months: string[];
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    total: number;
    growthRate?: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
  };
}

interface BudgetMatrixData {
  incomeCategories: {
    categoryName: string;
    months: { [key: number]: number };
    total: number;
  }[];
  expenseCategories: {
    categoryName: string;
    months: { [key: number]: number };
    total: number;
  }[];
  yearlyTotals: {
    income: number;
    expense: number;
    net: number;
  };
}

interface ProjectedYearData {
  year: number;
  categories: {
    name: string;
    type: 'income' | 'expense';
    monthlyValues: number[];
    total: number;
    growthRate: number;
  }[];
  summaries: {
    monthly: { income: number[]; expenses: number[]; net: number[] };
    annual: { income: number; expenses: number; net: number };
  };
}

export default function CashFlowMatrix() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [showProjections, setShowProjections] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');
  const [inflationRate, setInflationRate] = useState(3.5);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [importType, setImportType] = useState<'historical' | 'projections'>('historical');
  const [dataType, setDataType] = useState<'income' | 'expense'>('income');
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cash-flow-matrix', selectedYear, selectedPark],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        park: selectedPark
      });
      const response = await fetch(`/api/cash-flow-matrix?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }
      return response.json();
    }
  });

  const { data: budgetMatrix } = useQuery({
    queryKey: ['/api/budget-projections', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/budget-projections/${selectedYear}`);
      if (!response.ok) {
        throw new Error('Error al cargar proyecciones');
      }
      return response.json();
    }
  });

  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
    queryFn: async () => {
      const response = await fetch('/api/parks');
      if (!response.ok) {
        throw new Error('Error al cargar parques');
      }
      return response.json();
    }
  });

  const importMutation = useMutation({
    mutationFn: async ({ file, type, dataType }: { file: File; type: 'historical' | 'projections'; dataType: 'income' | 'expense' }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('dataType', dataType);
      formData.append('year', selectedYear.toString());
      
      const response = await fetch('/api/import-cash-flow-csv', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al importar archivo CSV');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-flow-matrix'] });
      setIsImportDialogOpen(false);
      setCsvFile(null);
      setCsvData([]);
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      Papa.parse(file, {
        complete: (results) => {
          setCsvData(results.data as any[]);
        },
        header: true,
        skipEmptyLines: true
      });
    }
  };

  const handleImport = () => {
    if (csvFile) {
      importMutation.mutate({ file: csvFile, type: importType, dataType });
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    
    const csvData = data.categories.map((category: any) => {
      const row: any = {
        Tipo: category.type === 'income' ? 'Ingreso' : 'Egreso',
        Categoría: category.name,
        Total: category.total
      };
      
      category.monthlyValues.forEach((value: number, index: number) => {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        row[monthNames[index]] = value;
      });
      
      return row;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `flujo-efectivo-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateProjections = (currentData: CashFlowData): ProjectedYearData[] | null => {
    if (!currentData || currentData.categories.length === 0) return null;

    const scenarios = {
      optimistic: 1.15,
      realistic: 1.05,
      pessimistic: 0.95
    };

    const projectedYears: ProjectedYearData[] = [];
    const multiplier = scenarios[selectedScenario];
    const inflationMultiplier = 1 + (inflationRate / 100);

    for (let yearOffset = 1; yearOffset <= 3; yearOffset++) {
      const projectedYear = selectedYear + yearOffset;
      const combinedMultiplier = Math.pow(multiplier * inflationMultiplier, yearOffset);

      const projectedCategories = currentData.categories.map(category => ({
        ...category,
        monthlyValues: category.monthlyValues.map(value => value * combinedMultiplier),
        total: category.total * combinedMultiplier,
        growthRate: ((combinedMultiplier - 1) * 100)
      }));

      const monthlyIncome = Array(12).fill(0).map((_, monthIndex) =>
        projectedCategories
          .filter(cat => cat.type === 'income')
          .reduce((sum, cat) => sum + cat.monthlyValues[monthIndex], 0)
      );

      const monthlyExpenses = Array(12).fill(0).map((_, monthIndex) =>
        projectedCategories
          .filter(cat => cat.type === 'expense')
          .reduce((sum, cat) => sum + cat.monthlyValues[monthIndex], 0)
      );

      const yearProjection: ProjectedYearData = {
        year: projectedYear,
        categories: projectedCategories,
        summaries: {
          monthly: {
            income: monthlyIncome,
            expenses: monthlyExpenses,
            net: monthlyIncome.map((income, i) => income - monthlyExpenses[i])
          },
          annual: {
            income: monthlyIncome.reduce((sum, val) => sum + val, 0),
            expenses: monthlyExpenses.reduce((sum, val) => sum + val, 0),
            net: monthlyIncome.reduce((sum, val) => sum + val, 0) - monthlyExpenses.reduce((sum, val) => sum + val, 0)
          }
        }
      };

      projectedYears.push(yearProjection);
    }

    return projectedYears;
  };

  const projectedData = showProjections ? calculateProjections(data) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando matriz de flujo de efectivo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error al cargar los datos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Matriz de Flujo de Efectivo</h1>
          <div className="flex space-x-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Importar Datos desde CSV</DialogTitle>
                  <DialogDescription>
                    Sube un archivo CSV con datos históricos o proyecciones
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-type">Tipo de datos</Label>
                    <Select value={importType} onValueChange={(value: 'historical' | 'projections') => setImportType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="historical">Datos históricos</SelectItem>
                        <SelectItem value="projections">Proyecciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data-type">Categoría</Label>
                    <Select value={dataType} onValueChange={(value: 'income' | 'expense') => setDataType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Ingresos</SelectItem>
                        <SelectItem value="expense">Egresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="csv-file">Archivo CSV</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {csvData.length > 0 && (
                    <div>
                      <Label>Vista previa (primeras 3 filas)</Label>
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded max-h-32 overflow-auto">
                        {csvData.slice(0, 3).map((row, index) => (
                          <div key={index} className="mb-1">
                            {JSON.stringify(row)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={!csvFile || importMutation.isPending}
                    >
                      {importMutation.isPending ? 'Importando...' : 'Importar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cash-flow-matrix'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="year-select">Año:</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="park-select">Parque:</Label>
            <Select value={selectedPark} onValueChange={setSelectedPark}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parques</SelectItem>
                {parks?.map((park: any) => (
                  <SelectItem key={park.id} value={park.id.toString()}>
                    {park.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {data?.summaries && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(data.summaries.annual.income)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Egresos Totales</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(data.summaries.annual.expenses)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Flujo Neto</p>
                    <p className={`text-2xl font-bold ${data.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.summaries.annual.net)}
                    </p>
                  </div>
                  {data.summaries.annual.net >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Matriz de Flujo de Efectivo con Proyectado vs Real */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">📊 MATRIZ DE FLUJO DE EFECTIVO - {selectedYear}</CardTitle>
            <CardDescription>Proyectado vs Real por mes con varianza para ingresos y egresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[600px] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 table-fixed">
                  {/* CABECERA FIJA DENTRO DEL CONTENEDOR */}
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="bg-blue-50 border-b-2 border-blue-300">
                      <th className="border border-gray-300 p-3 text-left font-semibold w-48">Categoría</th>
                      {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month) => (
                        <th key={month} className="border border-gray-300 p-2 text-center font-semibold w-32">
                          <div className="text-sm font-bold mb-2">{month}</div>
                          <div className="space-y-1 text-xs">
                            <div className="text-blue-600 py-1">Proyec</div>
                            <div className="text-gray-600 py-1">Real</div>
                            <div className="text-orange-600 py-1">Var</div>
                          </div>
                        </th>
                      ))}
                      <th className="border border-gray-300 p-3 text-center font-semibold w-40">Total Anual</th>
                    </tr>
                  </thead>
                
                <tbody>
                  {/* SECCIÓN INGRESOS */}
                  <tr className="bg-green-200">
                    <td colSpan={14} className="border border-gray-300 p-3 text-center font-bold text-green-800 text-lg">
                      💰 INGRESOS
                    </td>
                  </tr>
                  
                  {data.categories.filter(cat => cat.type === 'income').map((category, index) => {
                    const projectedCategory = budgetMatrix?.incomeCategories?.find(p => p.categoryName === category.name);
                    return (
                      <tr key={category.name} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                        <td className="border border-gray-300 p-3 font-medium w-48">{category.name}</td>
                        {Array.from({length: 12}, (_, monthIndex) => {
                          const projected = projectedCategory?.months[monthIndex + 1] || 0;
                          const real = category.monthlyValues[monthIndex] || 0;
                          const variance = real - projected;
                          return (
                            <td key={monthIndex} className="border border-gray-300 p-2 w-32">
                              <div className="space-y-1 text-xs">
                                <div className="text-center text-blue-700 bg-blue-100 rounded px-2 py-1 font-semibold">
                                  {formatCurrency(projected)}
                                </div>
                                <div className="text-center text-gray-700 bg-gray-100 rounded px-2 py-1 font-semibold">
                                  {formatCurrency(real)}
                                </div>
                                <div className={`text-center rounded px-2 py-1 font-semibold ${variance >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                  {variance !== 0 ? (variance > 0 ? '+' : '') + formatCurrency(variance) : '-'}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="border border-gray-300 p-3 text-center w-40">
                          <div className="space-y-2 text-sm">
                            <div className="text-blue-700 font-bold bg-blue-100 rounded px-2 py-1">
                              {formatCurrency(projectedCategory?.total || 0)}
                            </div>
                            <div className="text-gray-700 font-bold bg-gray-100 rounded px-2 py-1">
                              {formatCurrency(category.total)}
                            </div>
                            <div className={`font-semibold rounded px-2 py-1 ${(category.total - (projectedCategory?.total || 0)) >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                              {formatCurrency(category.total - (projectedCategory?.total || 0))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total de Ingresos */}
                  <tr className="bg-green-100 border-t-2 border-green-300">
                    <td className="border border-gray-300 p-3 font-bold text-green-800 w-48">TOTAL INGRESOS</td>
                    {Array.from({length: 12}, (_, monthIndex) => {
                      const monthlyProjected = budgetMatrix?.incomeCategories?.reduce((sum, cat) => sum + (cat.months[monthIndex + 1] || 0), 0) || 0;
                      const monthlyReal = data.summaries.monthly.income[monthIndex] || 0;
                      const monthlyVariance = monthlyReal - monthlyProjected;
                      return (
                        <td key={monthIndex} className="border border-gray-300 p-2 w-32">
                          <div className="space-y-1 text-xs">
                            <div className="text-center text-blue-700 bg-blue-100 rounded px-2 py-1 font-semibold">
                              {formatCurrency(monthlyProjected)}
                            </div>
                            <div className="text-center text-gray-700 bg-gray-100 rounded px-2 py-1 font-semibold">
                              {formatCurrency(monthlyReal)}
                            </div>
                            <div className={`text-center rounded px-2 py-1 font-semibold ${monthlyVariance >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                              {monthlyVariance !== 0 ? (monthlyVariance > 0 ? '+' : '') + formatCurrency(monthlyVariance) : '-'}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-3 text-center w-40">
                      <div className="space-y-2 text-sm">
                        <div className="text-blue-700 font-bold bg-blue-100 rounded px-2 py-1">
                          {formatCurrency(budgetMatrix?.yearlyTotals?.income || 0)}
                        </div>
                        <div className="text-gray-700 font-bold bg-gray-100 rounded px-2 py-1">
                          {formatCurrency(data.summaries.annual.income)}
                        </div>
                        <div className={`font-bold rounded px-2 py-1 ${(data.summaries.annual.income - (budgetMatrix?.yearlyTotals?.income || 0)) >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {formatCurrency(data.summaries.annual.income - (budgetMatrix?.yearlyTotals?.income || 0))}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* SECCIÓN EGRESOS */}
                  <tr className="bg-red-200">
                    <td colSpan={14} className="border border-gray-300 p-3 text-center font-bold text-red-800 text-lg">
                      💸 EGRESOS
                    </td>
                  </tr>
                  
                  {data.categories.filter(cat => cat.type === 'expense').map((category, index) => {
                    const projectedCategory = budgetMatrix?.expenseCategories?.find(p => p.categoryName === category.name);
                    return (
                      <tr key={category.name} className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                        <td className="border border-gray-300 p-3 font-medium w-48">{category.name}</td>
                        {Array.from({length: 12}, (_, monthIndex) => {
                          const projected = projectedCategory?.months[monthIndex + 1] || 0;
                          const real = category.monthlyValues[monthIndex] || 0;
                          const variance = real - projected;
                          return (
                            <td key={monthIndex} className="border border-gray-300 p-2 w-32">
                              <div className="space-y-1 text-xs">
                                <div className="text-center text-blue-700 bg-blue-100 rounded px-2 py-1 font-semibold">
                                  {formatCurrency(projected)}
                                </div>
                                <div className="text-center text-gray-700 bg-gray-100 rounded px-2 py-1 font-semibold">
                                  {formatCurrency(real)}
                                </div>
                                <div className={`text-center rounded px-2 py-1 font-semibold ${variance >= 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                                  {variance !== 0 ? (variance > 0 ? '+' : '') + formatCurrency(variance) : '-'}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="border border-gray-300 p-3 text-center w-40">
                          <div className="space-y-2 text-sm">
                            <div className="text-blue-700 font-bold bg-blue-100 rounded px-2 py-1">
                              {formatCurrency(projectedCategory?.total || 0)}
                            </div>
                            <div className="text-gray-700 font-bold bg-gray-100 rounded px-2 py-1">
                              {formatCurrency(category.total)}
                            </div>
                            <div className={`font-semibold rounded px-2 py-1 ${(category.total - (projectedCategory?.total || 0)) >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                              {formatCurrency(category.total - (projectedCategory?.total || 0))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total de Egresos */}
                  <tr className="bg-red-100 border-t-2 border-red-300">
                    <td className="border border-gray-300 p-3 font-bold text-red-800 w-48">TOTAL EGRESOS</td>
                    {Array.from({length: 12}, (_, monthIndex) => {
                      const monthlyProjected = budgetMatrix?.expenseCategories?.reduce((sum, cat) => sum + (cat.months[monthIndex + 1] || 0), 0) || 0;
                      const monthlyReal = data.summaries.monthly.expenses[monthIndex] || 0;
                      const monthlyVariance = monthlyReal - monthlyProjected;
                      return (
                        <td key={monthIndex} className="border border-gray-300 p-2 w-32">
                          <div className="space-y-1 text-xs">
                            <div className="text-center text-blue-700 bg-blue-100 rounded px-2 py-1 font-semibold">
                              {formatCurrency(monthlyProjected)}
                            </div>
                            <div className="text-center text-gray-700 bg-gray-100 rounded px-2 py-1 font-semibold">
                              {formatCurrency(monthlyReal)}
                            </div>
                            <div className={`text-center rounded px-2 py-1 font-semibold ${monthlyVariance >= 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                              {monthlyVariance !== 0 ? (monthlyVariance > 0 ? '+' : '') + formatCurrency(monthlyVariance) : '-'}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-3 text-center w-40">
                      <div className="space-y-2 text-sm">
                        <div className="text-blue-700 font-bold bg-blue-100 rounded px-2 py-1">
                          {formatCurrency(budgetMatrix?.yearlyTotals?.expense || 0)}
                        </div>
                        <div className="text-gray-700 font-bold bg-gray-100 rounded px-2 py-1">
                          {formatCurrency(data.summaries.annual.expenses)}
                        </div>
                        <div className={`font-bold rounded px-2 py-1 ${(data.summaries.annual.expenses - (budgetMatrix?.yearlyTotals?.expense || 0)) >= 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                          {formatCurrency(data.summaries.annual.expenses - (budgetMatrix?.yearlyTotals?.expense || 0))}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de proyecciones */}
      {showProjections && projectedData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Proyecciones Financieras</CardTitle>
            <CardDescription>
              Proyecciones basadas en escenario {selectedScenario} con inflación del {inflationRate}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex space-x-4">
              <div>
                <Label htmlFor="scenario">Escenario</Label>
                <Select value={selectedScenario} onValueChange={(value: 'optimistic' | 'realistic' | 'pessimistic') => setSelectedScenario(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optimistic">Optimista</SelectItem>
                    <SelectItem value="realistic">Realista</SelectItem>
                    <SelectItem value="pessimistic">Pesimista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inflation">Inflación (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                  className="w-24"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectedData.map((yearData) => (
                <Card key={yearData.year}>
                  <CardHeader>
                    <CardTitle className="text-lg">{yearData.year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Ingresos:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(yearData.summaries.annual.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Egresos:</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(yearData.summaries.annual.expenses)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Flujo Neto:</span>
                        <span className={`font-bold ${yearData.summaries.annual.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(yearData.summaries.annual.net)}
                        </span>
                      </div>
                      <Badge variant={yearData.summaries.annual.net >= 0 ? 'default' : 'destructive'}>
                        {yearData.summaries.annual.net >= 0 ? 'Positivo' : 'Negativo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => setShowProjections(!showProjections)}
          variant="outline"
        >
          {showProjections ? 'Ocultar' : 'Mostrar'} Proyecciones
        </Button>
      </div>
    </div>
  );
}