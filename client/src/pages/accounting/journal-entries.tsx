import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChevronLeft, Plus, Eye, Filter, Search, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useLocation } from 'wouter';

const journalEntrySchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  reference: z.string().optional(),
  type: z.enum(['manual', 'automatic']),
  entries: z.array(z.object({
    account_id: z.number().min(1, 'La cuenta es requerida'),
    debit: z.number().optional(),
    credit: z.number().optional(),
    description: z.string().optional(),
  })).min(2, 'Se requieren al menos 2 entradas'),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

export default function JournalEntries() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['/api/accounting/journal-entries'],
    enabled: true
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/accounting/categories'],
    enabled: true
  });

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      type: 'manual',
      entries: [
        { account_id: 0, debit: 0, credit: 0, description: '' },
        { account_id: 0, debit: 0, credit: 0, description: '' }
      ],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: JournalEntryFormData) => apiRequest('/api/accounting/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Asiento contable creado",
        description: "El asiento contable ha sido registrado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/journal-entries'] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const generateAutomaticMutation = useMutation({
    mutationFn: () => apiRequest('/api/accounting/journal-entries/generate-automatic', {
      method: 'POST',
    }),
    onSuccess: () => {
      toast({
        title: "Asientos automáticos generados",
        description: "Los asientos contables automáticos han sido generados exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/journal-entries'] });
    },
  });

  const handleSubmit = (data: JournalEntryFormData) => {
    createMutation.mutate(data);
  };

  const handleGenerateAutomatic = () => {
    generateAutomaticMutation.mutate();
  };

  const handleBack = () => {
    setLocation('/admin/accounting/dashboard');
  };

  // Datos simulados para mostrar la estructura según la imagen
  const mockJournalEntries = [
    {
      id: 1,
      number: 'AUTO-1751387935240',
      date: '30/6/2025',
      description: 'Transacción automática: null',
      reference: 'TRANS-85',
      type: 'automatico',
      totalDebit: 13000.00,
      totalCredit: 13000.00,
      status: 'aprobado'
    },
    {
      id: 2,
      number: 'AUTO-1750978310917',
      date: '25/6/2025',
      description: 'Transacción automática: null',
      reference: 'TRANS-64',
      type: 'automatico',
      totalDebit: 6700.00,
      totalCredit: 6700.00,
      status: 'aprobado'
    },
    {
      id: 3,
      number: 'AUTO-1750978160215',
      date: '25/6/2025',
      description: 'Transacción automática: null',
      reference: 'TRANS-63',
      type: 'automatico',
      totalDebit: 5000.00,
      totalCredit: 5000.00,
      status: 'aprobado'
    },
    {
      id: 4,
      number: 'AUTO-1750878717940',
      date: '24/6/2025',
      description: 'Transacción automática: Aquí va la descripción',
      reference: 'TRANS-61',
      type: 'automatico',
      totalDebit: 6000.00,
      totalCredit: 6000.00,
      status: 'aprobado'
    },
    {
      id: 5,
      number: 'AUTO-1750681809469',
      date: '19/6/2025',
      description: 'Transacción automática: Reposición Caja Chica...',
      reference: 'TRANS-51',
      type: 'automatico',
      totalDebit: 0.00,
      totalCredit: 0.00,
      status: 'aprobado'
    },
    {
      id: 6,
      number: 'AUTO-1750681808864',
      date: '19/6/2025',
      description: 'Transacción automática: Reposición Caja Chica...',
      reference: 'TRANS-50',
      type: 'automatico',
      totalDebit: 0.00,
      totalCredit: 0.00,
      status: 'aprobado'
    },
    {
      id: 7,
      number: 'AUTO-1750681808262',
      date: '19/6/2025',
      description: 'Transacción automática: Caja Chica: Autobuses...',
      reference: 'TRANS-47',
      type: 'automatico',
      totalDebit: 0.00,
      totalCredit: 0.00,
      status: 'aprobado'
    }
  ];

  const totalEntries = mockJournalEntries.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

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
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Regresar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Asientos Contables</h1>
              <p className="text-gray-600">Registro de movimientos contables con partida doble</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleGenerateAutomatic}
              disabled={generateAutomaticMutation.isPending}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${generateAutomaticMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Generar Automáticos</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00a587] hover:bg-[#067f5f] flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Asiento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Asiento Contable</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referencia</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de referencia" {...field} />
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
                            <Textarea placeholder="Descripción del asiento contable" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
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
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="automatic">Automático</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Entradas del Asiento</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentEntries = form.getValues('entries');
                            form.setValue('entries', [
                              ...currentEntries,
                              { account_id: 0, debit: 0, credit: 0, description: '' }
                            ]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Entrada
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {form.watch('entries').map((_, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2 p-3 border rounded">
                            <div>
                              <label className="text-sm font-medium">Cuenta</label>
                              <Select onValueChange={(value) => {
                                const entries = form.getValues('entries');
                                entries[index].account_id = parseInt(value);
                                form.setValue('entries', entries);
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(categories) ? categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.code} - {category.name}
                                    </SelectItem>
                                  )) : null}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Debe</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {
                                  const entries = form.getValues('entries');
                                  entries[index].debit = parseFloat(e.target.value) || 0;
                                  form.setValue('entries', entries);
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Haber</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {
                                  const entries = form.getValues('entries');
                                  entries[index].credit = parseFloat(e.target.value) || 0;
                                  form.setValue('entries', entries);
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Descripción</label>
                              <Input
                                placeholder="Opcional"
                                onChange={(e) => {
                                  const entries = form.getValues('entries');
                                  entries[index].description = e.target.value;
                                  form.setValue('entries', entries);
                                }}
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const entries = form.getValues('entries');
                                  if (entries.length > 2) {
                                    entries.splice(index, 1);
                                    form.setValue('entries', entries);
                                  }
                                }}
                                disabled={form.watch('entries').length <= 2}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

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
                        disabled={createMutation.isPending}
                        className="bg-[#00a587] hover:bg-[#067f5f]"
                      >
                        Crear Asiento
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por número, descripción o referencia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Asientos */}
        <Card>
          <CardHeader>
            <CardTitle>Asientos Contables Registrados</CardTitle>
            <p className="text-sm text-gray-600">
              Lista de todos los asientos contables del sistema ({totalEntries} registros)
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Número</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Referencia</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Total Debe</th>
                    <th className="text-left p-2">Total Haber</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockJournalEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{entry.number}</td>
                      <td className="p-2">{entry.date}</td>
                      <td className="p-2 max-w-xs truncate">{entry.description}</td>
                      <td className="p-2">{entry.reference}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {entry.type}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">{formatCurrency(entry.totalDebit)}</td>
                      <td className="p-2 text-right">{formatCurrency(entry.totalCredit)}</td>
                      <td className="p-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
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