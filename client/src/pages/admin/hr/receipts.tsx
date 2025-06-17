import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  FileCheck,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PayrollReceipt {
  id: number;
  receiptNumber: string;
  generatedDate: string;
  payDate: string;
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  totalGross: string;
  totalDeductions: string;
  totalNet: string;
  status: 'draft' | 'generated' | 'sent' | 'confirmed';
  pdfGenerated: boolean;
  periodId: number;
  employeeId: number;
  periodName?: string;
  periodStartDate?: string;
  periodEndDate?: string;
}

interface PayrollPeriod {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Employee {
  id: number;
  fullName: string;
  position: string;
  department: string;
}

export default function PayrollReceipts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<PayrollReceipt | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateEmployeeId, setGenerateEmployeeId] = useState<string>("");
  const [generatePeriodId, setGeneratePeriodId] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: receipts = [], isLoading: receiptsLoading } = useQuery({
    queryKey: ['/api/hr/payroll-receipts', { 
      employeeId: selectedEmployee, 
      periodId: selectedPeriod, 
      status: selectedStatus 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      if (selectedPeriod) params.append('periodId', selectedPeriod);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`/api/hr/payroll-receipts?${params}`);
      if (!response.ok) throw new Error('Error al obtener recibos');
      return response.json();
    }
  });

  const { data: periods = [] } = useQuery({
    queryKey: ['/api/hr/payroll-periods'],
    queryFn: async () => {
      const response = await fetch('/api/hr/payroll-periods');
      if (!response.ok) throw new Error('Error al obtener períodos');
      return response.json();
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/hr/employees'],
    queryFn: async () => {
      const response = await fetch('/api/hr/employees');
      if (!response.ok) throw new Error('Error al obtener empleados');
      return response.json();
    }
  });

  // Mutations
  const generateReceiptMutation = useMutation({
    mutationFn: async (data: { employeeId: number; periodId: number }) => {
      const response = await fetch('/api/hr/generate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar recibo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/payroll-receipts'] });
      toast({
        title: "Recibo generado",
        description: "El recibo se ha generado exitosamente",
        variant: "default"
      });
      setGenerateDialogOpen(false);
      setGenerateEmployeeId("");
      setGeneratePeriodId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const generatePDFMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      const response = await fetch(`/api/hr/payroll-receipts/${receiptId}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar PDF');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/payroll-receipts'] });
      toast({
        title: "PDF generado",
        description: "El PDF del recibo se ha generado exitosamente",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filtrar recibos
  const filteredReceipts = receipts.filter((receipt: PayrollReceipt) => {
    const matchesSearch = receipt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: receipts.length,
    generated: receipts.filter((r: PayrollReceipt) => r.status === 'generated').length,
    sent: receipts.filter((r: PayrollReceipt) => r.status === 'sent').length,
    confirmed: receipts.filter((r: PayrollReceipt) => r.status === 'confirmed').length,
    totalAmount: receipts.reduce((sum: number, r: PayrollReceipt) => sum + parseFloat(r.totalNet || '0'), 0)
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'secondary' as const, icon: Clock },
      generated: { label: 'Generado', variant: 'default' as const, icon: FileCheck },
      sent: { label: 'Enviado', variant: 'outline' as const, icon: Send },
      confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleDownloadPDF = async (receiptId: number) => {
    try {
      const response = await fetch(`/api/hr/payroll-receipts/${receiptId}/download`);
      if (!response.ok) throw new Error('Error al descargar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReceipt = () => {
    if (!generateEmployeeId || !generatePeriodId) {
      toast({
        title: "Error",
        description: "Selecciona un empleado y un período",
        variant: "destructive"
      });
      return;
    }
    
    generateReceiptMutation.mutate({
      employeeId: parseInt(generateEmployeeId),
      periodId: parseInt(generatePeriodId)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recibos de Nómina</h1>
          <p className="text-gray-600 mt-2">
            Gestión completa de recibos de pago para empleados
          </p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Generar Recibo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Nuevo Recibo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Empleado</label>
                <Select value={generateEmployeeId} onValueChange={setGenerateEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: Employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.fullName} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Período</label>
                <Select value={generatePeriodId} onValueChange={setGeneratePeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period: PayrollPeriod) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateReceipt}
                  disabled={generateReceiptMutation.isPending}
                  className="flex-1 bg-[#00a587] hover:bg-[#067f5f]"
                >
                  {generateReceiptMutation.isPending ? "Generando..." : "Generar Recibo"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setGenerateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recibos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Generados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.generated}</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-orange-600">{stats.sent}</p>
              </div>
              <Send className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-[#00a587]">
                  ${stats.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                {periods.map((period: PayrollPeriod) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por empleado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="generated">Generado</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recibos */}
      <Card>
        <CardHeader>
          <CardTitle>Recibos de Nómina ({filteredReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {receiptsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Cargando recibos...</div>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron recibos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceipts.map((receipt: PayrollReceipt) => (
                <div key={receipt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{receipt.receiptNumber}</h3>
                        {getStatusBadge(receipt.status)}
                        {receipt.pdfGenerated && (
                          <Badge variant="outline" className="text-green-600">
                            <FileCheck className="w-3 h-3 mr-1" />
                            PDF Disponible
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Empleado</p>
                          <p className="font-medium">{receipt.employeeName}</p>
                          <p className="text-gray-500">{receipt.employeePosition}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Período</p>
                          <p className="font-medium">{receipt.periodName}</p>
                          <p className="text-gray-500">
                            {receipt.periodStartDate && receipt.periodEndDate && (
                              `${format(new Date(receipt.periodStartDate), 'dd/MM/yyyy')} - ${format(new Date(receipt.periodEndDate), 'dd/MM/yyyy')}`
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fecha de Pago</p>
                          <p className="font-medium">
                            {format(new Date(receipt.payDate), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Neto a Pagar</p>
                          <p className="font-bold text-[#00a587] text-lg">
                            ${parseFloat(receipt.totalNet).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalle del Recibo - {receipt.receiptNumber}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold">Información del Empleado</h4>
                                <p><strong>Nombre:</strong> {receipt.employeeName}</p>
                                <p><strong>Puesto:</strong> {receipt.employeePosition}</p>
                                <p><strong>Departamento:</strong> {receipt.employeeDepartment}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold">Información del Pago</h4>
                                <p><strong>Período:</strong> {receipt.periodName}</p>
                                <p><strong>Fecha de Pago:</strong> {format(new Date(receipt.payDate), 'dd/MM/yyyy')}</p>
                                <p><strong>Estado:</strong> {getStatusBadge(receipt.status)}</p>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-2">Resumen Financiero</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded">
                                  <p className="text-sm text-gray-600">Total Percepciones</p>
                                  <p className="text-lg font-bold text-green-600">
                                    ${parseFloat(receipt.totalGross).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded">
                                  <p className="text-sm text-gray-600">Total Deducciones</p>
                                  <p className="text-lg font-bold text-red-600">
                                    ${parseFloat(receipt.totalDeductions).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-[#00a587]/10 rounded">
                                  <p className="text-sm text-gray-600">Neto a Pagar</p>
                                  <p className="text-xl font-bold text-[#00a587]">
                                    ${parseFloat(receipt.totalNet).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {!receipt.pdfGenerated && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePDFMutation.mutate(receipt.id)}
                          disabled={generatePDFMutation.isPending}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Generar PDF
                        </Button>
                      )}
                      
                      {receipt.pdfGenerated && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(receipt.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}