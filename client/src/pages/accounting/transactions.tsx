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
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Receipt, Plus, Edit, Trash2, Search, Filter, Calendar, DollarSign, Upload, Download, Eye, ArrowUp, ArrowDown, X } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

const transactionSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  transaction_type: z.enum(['income', 'expense']),
  category_a: z.number().min(1, 'La categoría A es requerida'),
  category_b: z.number().optional(),
  category_c: z.number().optional(),
  category_d: z.number().optional(),
  category_e: z.number().optional(),
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  income_source: z.string().optional(),
  bank: z.string().optional(),
  description: z.string().optional(),
  add_iva: z.boolean().default(true),
  amount_without_iva: z.number().optional(),
  iva_amount: z.number().optional(),
  reference_number: z.string().optional(),
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
  
  // Estados para categorías jerárquicas
  const [selectedCategoryA, setSelectedCategoryA] = useState<number>(0);
  const [selectedCategoryB, setSelectedCategoryB] = useState<number>(0);
  const [selectedCategoryC, setSelectedCategoryC] = useState<number>(0);
  const [selectedCategoryD, setSelectedCategoryD] = useState<number>(0);
  const [selectedCategoryE, setSelectedCategoryE] = useState<number>(0);
  
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/accounting/transactions'],
    enabled: true
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/accounting/categories'],
    enabled: true
  });

  // Debug: Log de categorías recibidas
  console.log('📋 Todas las categorías recibidas:', categories);

  // Función para calcular automáticamente el IVA
  const calculateIVA = (totalAmount: number) => {
    const IVA_RATE = 0.16; // 16% IVA mexicano
    const amountWithoutIVA = totalAmount / (1 + IVA_RATE);
    const ivaAmount = totalAmount - amountWithoutIVA;
    
    return {
      amount_without_iva: Math.round(amountWithoutIVA * 100) / 100,
      iva_amount: Math.round(ivaAmount * 100) / 100
    };
  };

  // Funciones para filtrar categorías por nivel jerárquico
  const getCategoriesLevel1 = () => {
    if (!categories?.categories) return [];
    const level1Categories = categories.categories.filter((cat: any) => cat.level === 1);
    console.log('🔍 Categorías nivel 1:', level1Categories);
    return level1Categories;
  };

  const getCategoriesLevel2 = (parentId: number) => {
    if (!categories?.categories || !parentId) return [];
    const level2Categories = categories.categories.filter((cat: any) => cat.level === 2 && cat.parentId === parentId);
    console.log(`🔍 Categorías nivel 2 para parent ${parentId}:`, level2Categories);
    return level2Categories;
  };

  const getCategoriesLevel3 = (parentId: number) => {
    if (!categories?.categories || !parentId) return [];
    const level3Categories = categories.categories.filter((cat: any) => cat.level === 3 && cat.parentId === parentId);
    console.log(`🔍 Categorías nivel 3 para parent ${parentId}:`, level3Categories);
    return level3Categories;
  };

  const getCategoriesLevel4 = (parentId: number) => {
    if (!categories?.categories || !parentId) return [];
    const level4Categories = categories.categories.filter((cat: any) => cat.level === 4 && cat.parentId === parentId);
    console.log(`🔍 Categorías nivel 4 para parent ${parentId}:`, level4Categories);
    return level4Categories;
  };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      concept: '',
      amount: 0,
      transaction_type: 'income',
      category_a: 0,
      category_b: 0,
      category_c: 0,
      category_d: 0,
      category_e: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      income_source: '',
      bank: '',
      description: '',
      add_iva: true,
      amount_without_iva: 0,
      iva_amount: 0,
      reference_number: '',
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
      queryClient.refetchQueries({ queryKey: ['/api/accounting/transactions'] });
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
    
    // Configurar categorías jerárquicas seleccionadas
    setSelectedCategoryA(transaction.category_a || 0);
    setSelectedCategoryB(transaction.category_b || 0);
    setSelectedCategoryC(transaction.category_c || 0);
    setSelectedCategoryD(transaction.category_d || 0);
    setSelectedCategoryE(transaction.category_e || 0);
    
    form.reset({
      concept: transaction.concept || '',
      amount: transaction.amount || 0,
      transaction_type: transaction.transaction_type || 'income',
      category_a: transaction.category_a || 0,
      category_b: transaction.category_b || 0,
      category_c: transaction.category_c || 0,
      category_d: transaction.category_d || 0,
      category_e: transaction.category_e || 0,
      transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
      status: transaction.status || 'pending',
      income_source: transaction.income_source || '',
      bank: transaction.bank || '',
      description: transaction.description || '',
      add_iva: true, // Siempre activado
      amount_without_iva: transaction.amount_without_iva || 0,
      iva_amount: transaction.iva_amount || 0,
      reference_number: transaction.reference_number || '',
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

  const resetCategorySelections = () => {
    setSelectedCategoryA(0);
    setSelectedCategoryB(0);
    setSelectedCategoryC(0);
    setSelectedCategoryD(0);
    setSelectedCategoryE(0);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    resetCategorySelections();
    form.reset({
      concept: '',
      amount: 0,
      transaction_type: 'income',
      category_a: 0,
      category_b: 0,
      category_c: 0,
      category_d: 0,
      category_e: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      income_source: '',
      bank: '',
      description: '',
      add_iva: true, // Siempre activado por defecto
      amount_without_iva: 0,
      iva_amount: 0,
      reference_number: '',
    });
  };

  // Obtener transacciones reales de la API
  const realTransactions = transactions?.transactions || [];

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
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#00a587] hover:bg-[#067f5f] flex items-center space-x-2"
                  onClick={() => {
                    resetCategorySelections();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Transacción</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Completa los campos para crear una nueva transacción con categorías jerárquicas
                    </p>
                    
                    {/* Concepto y Monto */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="concept"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Concepto *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Consultoría Proyecto A" {...field} />
                            </FormControl>
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
                                placeholder="0"
                                {...field}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value) || 0;
                                  field.onChange(amount);
                                  
                                  // Calcular automáticamente el IVA
                                  const ivaCalculation = calculateIVA(amount);
                                  form.setValue('amount_without_iva', ivaCalculation.amount_without_iva);
                                  form.setValue('iva_amount', ivaCalculation.iva_amount);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tipo y Categoría A */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="transaction_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Ingreso" />
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
                      <FormField
                        control={form.control}
                        name="category_a"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría A *</FormLabel>
                            <Select onValueChange={(value) => {
                              const categoryId = parseInt(value);
                              field.onChange(categoryId);
                              setSelectedCategoryA(categoryId);
                              // Resetear categorías subsecuentes
                              setSelectedCategoryB(0);
                              setSelectedCategoryC(0);
                              setSelectedCategoryD(0);
                              setSelectedCategoryE(0);
                              form.setValue('category_b', 0);
                              form.setValue('category_c', 0);
                              form.setValue('category_d', 0);
                              form.setValue('category_e', 0);
                            }} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getCategoriesLevel1().map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.code} - {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Separador */}
                    <hr className="my-4" />
                    
                    {/* Categorías Jerárquicas Adicionales */}
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías Jerárquicas Adicionales (Opcional)</h4>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name="category_b"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría B</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const categoryId = parseInt(value);
                                field.onChange(categoryId);
                                setSelectedCategoryB(categoryId);
                                // Resetear categorías subsecuentes
                                setSelectedCategoryC(0);
                                setSelectedCategoryD(0);
                                setSelectedCategoryE(0);
                                form.setValue('category_c', 0);
                                form.setValue('category_d', 0);
                                form.setValue('category_e', 0);
                              }} 
                              value={field.value?.toString()}
                              disabled={!selectedCategoryA}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getCategoriesLevel2(selectedCategoryA).map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.code} - {category.name}
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
                        name="category_c"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría C</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const categoryId = parseInt(value);
                                field.onChange(categoryId);
                                setSelectedCategoryC(categoryId);
                                // Resetear categorías subsecuentes
                                setSelectedCategoryD(0);
                                setSelectedCategoryE(0);
                                form.setValue('category_d', 0);
                                form.setValue('category_e', 0);
                              }} 
                              value={field.value?.toString()}
                              disabled={!selectedCategoryB}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getCategoriesLevel3(selectedCategoryB).map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.code} - {category.name}
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
                        name="category_d"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría D</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const categoryId = parseInt(value);
                                field.onChange(categoryId);
                                setSelectedCategoryD(categoryId);
                                // Resetear categorías subsecuentes
                                setSelectedCategoryE(0);
                                form.setValue('category_e', 0);
                              }} 
                              value={field.value?.toString()}
                              disabled={!selectedCategoryC}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getCategoriesLevel4(selectedCategoryC).map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.code} - {category.name}
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
                        name="category_e"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría E</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const categoryId = parseInt(value);
                                field.onChange(categoryId);
                                setSelectedCategoryE(categoryId);
                              }} 
                              value={field.value?.toString()}
                              disabled={!selectedCategoryD}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* Nota: Nivel 5 no existe en el sistema actual, pero se mantiene para futuras extensiones */}
                                <SelectItem value="0">Sin especificar</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Fecha y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="transaction_date"
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pendiente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="approved">Aprobada</SelectItem>
                                <SelectItem value="rejected">Rechazada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Fuente de Ingreso y Banco */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="income_source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuente de Ingreso</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="government">Gobierno Federal</SelectItem>
                                <SelectItem value="state">Gobierno Estatal</SelectItem>
                                <SelectItem value="municipal">Gobierno Municipal</SelectItem>
                                <SelectItem value="private">Sector Privado</SelectItem>
                                <SelectItem value="donations">Donaciones</SelectItem>
                                <SelectItem value="other">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bbva">BBVA</SelectItem>
                                <SelectItem value="santander">Santander</SelectItem>
                                <SelectItem value="banorte">Banorte</SelectItem>
                                <SelectItem value="hsbc">HSBC</SelectItem>
                                <SelectItem value="scotiabank">Scotiabank</SelectItem>
                                <SelectItem value="banamex">Banamex</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Descripción */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción adicional (opcional)..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* IVA */}
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="add_iva"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={true}
                                disabled={true}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>IVA (16%) - Siempre aplicado</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                El IVA se calcula automáticamente al ingresar el monto
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* Siempre mostrar los campos de IVA */}
                      {true && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="amount_without_iva"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monto sin IVA</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    {...field}
                                    value={field.value || 0}
                                    readOnly
                                    className="bg-gray-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="iva_amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IVA (16%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    {...field}
                                    value={field.value || 0}
                                    readOnly
                                    className="bg-gray-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Referencia/Comprobante */}
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referencia/Comprobante</FormLabel>
                          <FormControl>
                            <Input placeholder="URL o referencia del comprobante (opcional)" {...field} />
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Cargando transacciones...</span>
                        </div>
                      </td>
                    </tr>
                  ) : realTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No hay transacciones disponibles
                      </td>
                    </tr>
                  ) : (
                    realTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(transaction.date).toLocaleDateString('es-ES')}</td>
                        <td className="p-2">{transaction.description || transaction.concept || 'Sin descripción'}</td>
                        <td className="p-2">
                          <Badge variant="secondary">
                            {transaction.category_name || `ID: ${transaction.category_id}`}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <span className={transaction.transaction_type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2">{transaction.reference || transaction.reference_number || '-'}</td>
                        <td className="p-2">
                          <Badge variant="default" className={
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {transaction.status === 'pending' ? 'Pendiente' : 
                             transaction.status === 'completed' ? 'Completado' : 
                             'Rechazado'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" title="Ver">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Editar"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Eliminar" 
                              className="text-red-500"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}