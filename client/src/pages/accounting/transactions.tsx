import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Receipt, Plus, Edit, Trash2, Search, Filter, Calendar, DollarSign, Upload, Download, Eye, ArrowUp, ArrowDown, X } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

const transactionSchema = z.object({
  transaction_type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  category_id: z.number().min(1, 'La categoría es requerida'),
  reference_number: z.string().optional(),
  cost_center_id: z.number().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function AccountingTransactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/accounting/transactions'],
    enabled: true
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/accounting/categories'],
    enabled: true
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: 'income',
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      category_id: 0,
      reference_number: '',
      cost_center_id: 0,
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => apiRequest('/api/accounting/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Transacción creada",
        description: "La transacción ha sido registrada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/transactions'] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionFormData }) => 
      apiRequest(`/api/accounting/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Transacción actualizada",
        description: "La transacción ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/transactions'] });
      setIsDialogOpen(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/accounting/transactions/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      toast({
        title: "Transacción eliminada",
        description: "La transacción ha sido eliminada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/transactions'] });
    },
  });

  const handleSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    form.reset({
      transaction_type: transaction.transaction_type,
      amount: transaction.amount,
      description: transaction.description,
      transaction_date: transaction.transaction_date,
      category_id: transaction.category_id,
      reference_number: transaction.reference_number || '',
      cost_center_id: transaction.cost_center_id || 0,
      notes: transaction.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setStatusFilter('all');
    setYearFilter('all');
  };

  // Datos simulados para mostrar la estructura (reemplazar con datos reales)
  const mockTransactions = [
    {
      id: 1,
      date: '14/7/2025',
      description: 'Nómina - Luis Romahn',
      category: 'Sin categoría',
      amount: -874,
      reference: '-',
      status: 'Completado'
    },
    {
      id: 2,
      date: '14/7/2025',
      description: 'Nómina - Michelle Remedios',
      category: 'Sin categoría',
      amount: -874,
      reference: '-',
      status: 'Completado'
    },
    {
      id: 3,
      date: '14/7/2025',
      description: 'Nómina - Belinda Cámara',
      category: 'Sin categoría',
      amount: -874.9,
      reference: '-',
      status: 'Completado'
    },
    {
      id: 4,
      date: '14/7/2025',
      description: 'Nómina - Esthelany Castillo',
      category: 'Sin categoría',
      amount: -874,
      reference: '-',
      status: 'Completado'
    }
  ];

  // Calcular estadísticas
  const totalIncome = 0;
  const totalExpenses = 14964.9;
  const netBalance = totalIncome - totalExpenses;
  const pendingTransactions = 1;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transacciones</h1>
            <p className="text-gray-600">Gestiona los ingresos y gastos de la empresa</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Importar CSV</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00a587] hover:bg-[#067f5f] flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nueva Transacción</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="transaction_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="income">Ingreso</SelectItem>
                              <SelectItem value="expense">Gasto</SelectItem>
                            </SelectContent>
                          </Select>
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
                        name="transaction_date"
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
                            <Input placeholder="Descripción de la transacción" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(categories) ? categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.code} - {category.name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Referencia</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de factura, recibo, etc." {...field} />
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
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Notas adicionales..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-[#00a587] hover:bg-[#067f5f]"
                      >
                        {editingTransaction ? 'Actualizar' : 'Crear'} Transacción
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-sm text-gray-600">Ingresos</div>
                  <div className="text-2xl font-bold">${totalIncome.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowDown className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-sm text-gray-600">Gastos</div>
                  <div className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-sm text-gray-600">Balance Neto</div>
                  <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${netBalance.toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                  <div className="text-2xl font-bold">{pendingTransactions}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar transacciones..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="income">Ingresos</SelectItem>
                      <SelectItem value="expense">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {Array.isArray(categories) ? categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Subcategoría</label>
                  <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las subcategorías</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Año</label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span>Limpiar Filtros</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Monto</th>
                    <th className="text-left p-2">Referencia</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{transaction.date}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2">
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </td>
                      <td className="p-2">
                        <span className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                          ${transaction.amount.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-2">{transaction.reference}</td>
                      <td className="p-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" title="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Eliminar" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}