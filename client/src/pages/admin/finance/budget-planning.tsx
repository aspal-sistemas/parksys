import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Save, Calculator, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { BudgetMatrix, BudgetEntry } from '../../../shared/budget-planning-schema';
import { AdminLayout } from '@/components/AdminLayout';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function BudgetPlanningPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budgetData, setBudgetData] = useState<BudgetMatrix | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener datos presupuestarios
  const { data: budgetMatrix, isLoading, refetch } = useQuery({
    queryKey: ['budget-projections', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/budget-projections/${selectedYear}`);
      if (!response.ok) throw new Error('Error al cargar datos presupuestarios');
      return response.json() as BudgetMatrix;
    }
  });

  // Mutation para guardar proyecciones
  const saveMutation = useMutation({
    mutationFn: async (data: { year: number; projections: any[] }) => {
      const response = await fetch('/api/budget-projections/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al guardar proyecciones');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✓ Proyecciones Guardadas",
        description: `Presupuesto del ${selectedYear} guardado correctamente`
      });
      setIsModified(false);
      queryClient.invalidateQueries({ queryKey: ['budget-projections'] });
    },
    onError: () => {
      toast({
        title: "Error al Guardar",
        description: "No se pudieron guardar las proyecciones",
        variant: "destructive"
      });
    }
  });

  // Sincronizar datos cuando cambian
  useEffect(() => {
    if (budgetMatrix) {
      setBudgetData(budgetMatrix);
    }
  }, [budgetMatrix]);

  // Manejar cambio de valor en celda
  const handleCellChange = (categoryId: number, month: number, value: string, type: 'income' | 'expense') => {
    if (!budgetData) return;
    
    const numValue = parseFloat(value) || 0;
    const updatedData = { ...budgetData };
    
    // Actualizar categoría correspondiente
    const categories = type === 'income' ? updatedData.incomeCategories : updatedData.expenseCategories;
    const categoryIndex = categories.findIndex(cat => cat.categoryId === categoryId);
    
    if (categoryIndex !== -1) {
      categories[categoryIndex].months[month] = numValue;
      
      // Recalcular total anual de la categoría
      categories[categoryIndex].totalYear = Object.values(categories[categoryIndex].months).reduce((sum, val) => sum + (val || 0), 0);
      
      // Recalcular totales mensuales y anuales
      recalculateTotals(updatedData);
      
      setBudgetData(updatedData);
      setIsModified(true);
    }
  };

  // Recalcular totales
  const recalculateTotals = (data: BudgetMatrix) => {
    // Reiniciar totales
    data.yearlyTotals = { income: 0, expense: 0, net: 0 };
    data.monthlyTotals = { income: {}, expense: {}, net: {} };
    
    // Inicializar totales mensuales
    for (let month = 1; month <= 12; month++) {
      data.monthlyTotals.income[month] = 0;
      data.monthlyTotals.expense[month] = 0;
      data.monthlyTotals.net[month] = 0;
    }
    
    // Calcular totales de ingresos
    data.incomeCategories.forEach(category => {
      data.yearlyTotals.income += category.totalYear;
      for (let month = 1; month <= 12; month++) {
        data.monthlyTotals.income[month] += category.months[month] || 0;
      }
    });
    
    // Calcular totales de gastos
    data.expenseCategories.forEach(category => {
      data.yearlyTotals.expense += category.totalYear;
      for (let month = 1; month <= 12; month++) {
        data.monthlyTotals.expense[month] += category.months[month] || 0;
      }
    });
    
    // Calcular flujo neto
    data.yearlyTotals.net = data.yearlyTotals.income - data.yearlyTotals.expense;
    for (let month = 1; month <= 12; month++) {
      data.monthlyTotals.net[month] = data.monthlyTotals.income[month] - data.monthlyTotals.expense[month];
    }
  };

  // Guardar proyecciones
  const handleSave = () => {
    if (!budgetData) return;
    
    const projections: any[] = [];
    
    // Convertir datos a formato de API
    [...budgetData.incomeCategories, ...budgetData.expenseCategories].forEach(category => {
      for (let month = 1; month <= 12; month++) {
        const amount = category.months[month] || 0;
        if (amount > 0) {
          projections.push({
            categoryId: category.categoryId,
            month: month,
            projectedAmount: amount
          });
        }
      }
    });
    
    saveMutation.mutate({ year: selectedYear, projections });
  };

  // Manejar selección de archivo CSV
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Leer y mostrar preview del CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 5); // Mostrar solo las primeras 5 líneas
        const preview = lines.map(line => line.split(','));
        setCsvPreview(preview);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Archivo Inválido",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive"
      });
    }
  };

  // Procesar e importar CSV
  const handleImportCSV = async () => {
    if (!csvFile) return;

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('year', selectedYear.toString());

      const response = await fetch('/api/budget-projections/import-csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al importar CSV');

      const result = await response.json();
      
      toast({
        title: "✓ Importación Exitosa",
        description: `Se importaron ${result.recordsImported} registros presupuestarios`
      });

      // Refrescar datos y cerrar dialog
      refetch();
      setShowImportDialog(false);
      setCsvFile(null);
      setCsvPreview([]);
      
    } catch (error) {
      toast({
        title: "Error al Importar",
        description: "No se pudo procesar el archivo CSV",
        variant: "destructive"
      });
    }
  };

  // Exportar CSV
  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/budget-projections/${selectedYear}/export-csv`);
      if (!response.ok) throw new Error('Error al exportar');
      
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `presupuesto_${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "✓ Exportación Exitosa",
        description: `Presupuesto del ${selectedYear} exportado en formato CSV`
      });
    } catch (error) {
      toast({
        title: "Error al Exportar",
        description: "No se pudo exportar el archivo",
        variant: "destructive"
      });
    }
  };

  // Formatear número como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Formatear número para input
  const formatNumber = (amount: number) => {
    return amount > 0 ? amount.toLocaleString('es-MX') : '';
  };

  // Parsear número de input
  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00a587]" />
          <p className="text-gray-600">Cargando matriz presupuestaria...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Planificación Presupuestaria" 
      subtitle="Define las proyecciones mensuales por categoría de ingresos y gastos"
    >
      <div className="space-y-6">
      {/* Header eliminado ya que AdminLayout maneja títulos */}
      <div className="flex items-center justify-end">
        
        <div className="flex items-center gap-3">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importar Datos Presupuestarios desde CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seleccionar archivo CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#00a587] file:text-white hover:file:bg-[#067f5f]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato esperado: Categoría, Tipo, Enero, Febrero, ..., Diciembre
                  </p>
                </div>
                
                {csvPreview.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Vista previa del archivo:</h4>
                    <div className="border rounded max-h-40 overflow-auto">
                      <Table>
                        <TableBody>
                          {csvPreview.map((row, index) => (
                            <TableRow key={index}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="text-xs px-2 py-1">
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImportCSV} 
                    disabled={!csvFile}
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Importar Datos
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleExportCSV} className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() + i - 1;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSave} 
            disabled={!isModified || saveMutation.isPending}
            className="bg-[#00a587] hover:bg-[#067f5f]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Guardando...' : 'Guardar Presupuesto'}
          </Button>
        </div>
      </div>

      {/* Resumen de totales */}
      {budgetData && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Ingresos Proyectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetData.yearlyTotals.income)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                Gastos Proyectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(budgetData.yearlyTotals.expense)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Utilidad / Pérdida Proyectada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${budgetData.yearlyTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetData.yearlyTotals.net)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matriz de planificación presupuestaria */}
      {budgetData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Matriz de Planificación {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left font-medium">Categoría</th>
                    {monthNames.map(month => (
                      <th key={month} className="border border-gray-200 p-3 text-center font-medium min-w-[120px]">
                        {month}
                      </th>
                    ))}
                    <th className="border border-gray-200 p-3 text-center font-medium bg-gray-100">Total Anual</th>
                  </tr>
                </thead>
                
                <tbody>
                  {/* Ingresos Proyectados */}
                  <tr className="bg-green-50">
                    <td colSpan={14} className="border border-gray-200 p-3 font-semibold text-green-800">
                      📈 Ingresos Proyectados {selectedYear}
                    </td>
                  </tr>
                  
                  {budgetData.incomeCategories.map(category => (
                    <tr key={`income-${category.categoryId}`} className="hover:bg-green-25">
                      <td className="border border-gray-200 p-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.categoryColor }}
                          />
                          {category.categoryName}
                        </div>
                      </td>
                      {monthNames.map((_, monthIndex) => {
                        const month = monthIndex + 1;
                        return (
                          <td key={month} className="border border-gray-200 p-2">
                            <Input
                              type="text"
                              value={formatNumber(category.months[month] || 0)}
                              onChange={(e) => {
                                const numValue = parseNumber(e.target.value);
                                handleCellChange(category.categoryId, month, numValue.toString(), 'income');
                              }}
                              className="text-center border-0 bg-transparent focus:bg-white"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="border border-gray-200 p-3 text-center font-semibold bg-green-50">
                        {formatCurrency(category.totalYear)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totales de ingresos */}
                  <tr className="bg-green-100 font-semibold">
                    <td className="border border-gray-200 p-3">Totales</td>
                    {monthNames.map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      return (
                        <td key={month} className="border border-gray-200 p-3 text-center">
                          {formatCurrency(budgetData.monthlyTotals.income[month] || 0)}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 p-3 text-center bg-green-200">
                      {formatCurrency(budgetData.yearlyTotals.income)}
                    </td>
                  </tr>
                  
                  {/* Gastos Proyectados */}
                  <tr className="bg-red-50">
                    <td colSpan={14} className="border border-gray-200 p-3 font-semibold text-red-800">
                      📉 Gastos Proyectados {selectedYear}
                    </td>
                  </tr>
                  
                  {budgetData.expenseCategories.map(category => (
                    <tr key={`expense-${category.categoryId}`} className="hover:bg-red-25">
                      <td className="border border-gray-200 p-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.categoryColor }}
                          />
                          {category.categoryName}
                        </div>
                      </td>
                      {monthNames.map((_, monthIndex) => {
                        const month = monthIndex + 1;
                        return (
                          <td key={month} className="border border-gray-200 p-2">
                            <Input
                              type="text"
                              value={formatNumber(category.months[month] || 0)}
                              onChange={(e) => {
                                const numValue = parseNumber(e.target.value);
                                handleCellChange(category.categoryId, month, numValue.toString(), 'expense');
                              }}
                              className="text-center border-0 bg-transparent focus:bg-white"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="border border-gray-200 p-3 text-center font-semibold bg-red-50">
                        {formatCurrency(category.totalYear)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totales de gastos */}
                  <tr className="bg-red-100 font-semibold">
                    <td className="border border-gray-200 p-3">Totales</td>
                    {monthNames.map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      return (
                        <td key={month} className="border border-gray-200 p-3 text-center">
                          {formatCurrency(budgetData.monthlyTotals.expense[month] || 0)}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 p-3 text-center bg-red-200">
                      {formatCurrency(budgetData.yearlyTotals.expense)}
                    </td>
                  </tr>
                  
                  {/* Acumulados por Mes (Utilidad/Pérdida) */}
                  <tr className="bg-blue-50">
                    <td colSpan={14} className="border border-gray-200 p-3 font-semibold text-blue-800">
                      💰 Utilidad / Pérdida por Mes {selectedYear}
                    </td>
                  </tr>
                  
                  <tr className="bg-blue-100 font-semibold">
                    <td className="border border-gray-200 p-3">Ingresos</td>
                    {monthNames.map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      return (
                        <td key={month} className="border border-gray-200 p-3 text-center text-green-700">
                          {formatCurrency(budgetData.monthlyTotals.income[month] || 0)}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 p-3 text-center text-green-700 bg-green-100">
                      {formatCurrency(budgetData.yearlyTotals.income)}
                    </td>
                  </tr>
                  
                  <tr className="bg-blue-100 font-semibold">
                    <td className="border border-gray-200 p-3">Gastos</td>
                    {monthNames.map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      return (
                        <td key={month} className="border border-gray-200 p-3 text-center text-red-700">
                          {formatCurrency(budgetData.monthlyTotals.expense[month] || 0)}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 p-3 text-center text-red-700 bg-red-100">
                      {formatCurrency(budgetData.yearlyTotals.expense)}
                    </td>
                  </tr>
                  
                  <tr className="bg-blue-200 font-bold">
                    <td className="border border-gray-200 p-3">Utilidad / Pérdida</td>
                    {monthNames.map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      const netAmount = budgetData.monthlyTotals.net[month] || 0;
                      return (
                        <td key={month} className={`border border-gray-200 p-3 text-center ${netAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatCurrency(netAmount)}
                        </td>
                      );
                    })}
                    <td className={`border border-gray-200 p-3 text-center font-bold ${budgetData.yearlyTotals.net >= 0 ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'}`}>
                      {formatCurrency(budgetData.yearlyTotals.net)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
}