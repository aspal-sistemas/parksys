import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, Calendar, DollarSign, Users, Search, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorshipContract } from '@/shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/AdminLayout';

const ContractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewContractDialog, setShowNewContractDialog] = useState(false);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['/api/sponsorship-contracts'],
    queryFn: () => safeApiRequest('/api/sponsorship-contracts', {})
  });

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

  const { data: packages } = useQuery({
    queryKey: ['/api/sponsorship-packages'],
    queryFn: () => safeApiRequest('/api/sponsorship-packages', {})
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'expired': return 'Expirado';
      case 'terminated': return 'Terminado';
      default: return status;
    }
  };

  const filteredContracts = contracts?.filter((contract: SponsorshipContract) => {
    const matchesSearch = contract.terms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalValue = contracts?.reduce((sum: number, contract: SponsorshipContract) => 
    sum + parseFloat(contract.totalValue || '0'), 0) || 0;

  const activeContracts = contracts?.filter((c: SponsorshipContract) => c.status === 'active').length || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos de Patrocinio</h1>
          <p className="text-gray-600">Gestiona todos los contratos de patrocinio</p>
        </div>
        <Dialog open={showNewContractDialog} onOpenChange={setShowNewContractDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Contrato</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto text-[#00a587] mb-4" />
              <p className="text-gray-600">
                Funcionalidad de creación de contratos en desarrollo
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contratos</p>
                <p className="text-2xl font-bold text-gray-900">{contracts?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contratos Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeContracts}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalValue.toLocaleString('es-MX')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximos Vencimientos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contracts?.filter((c: SponsorshipContract) => {
                    const endDate = new Date(c.endDate);
                    const threeMonthsFromNow = new Date();
                    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                    return endDate <= threeMonthsFromNow && c.status === 'active';
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar contratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="terminated">Terminados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.map((contract: SponsorshipContract) => {
          const sponsor = sponsors?.find((s: any) => s.id === contract.sponsorId);
          const packageInfo = packages?.find((p: any) => p.id === contract.packageId);
          
          return (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {sponsor?.name || 'Patrocinador Desconocido'}
                      </h3>
                      <Badge className={getStatusColor(contract.status || 'draft')}>
                        {getStatusText(contract.status || 'draft')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Paquete</p>
                        <p className="font-medium">{packageInfo?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor</p>
                        <p className="font-medium text-green-600">
                          ${parseFloat(contract.totalValue || '0').toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Inicio</p>
                        <p className="font-medium">
                          {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fin</p>
                        <p className="font-medium">
                          {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Contacto</p>
                        <p className="font-medium">{contract.contactPerson || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{contract.contactEmail || ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Renovación Automática</p>
                        <p className="font-medium">
                          {contract.autoRenewal ? 'Sí' : 'No'}
                        </p>
                      </div>
                    </div>
                    
                    {contract.terms && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Términos</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{contract.terms}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="ml-4">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron contratos
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer contrato de patrocinio'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => setShowNewContractDialog(true)}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Contrato
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
};

export default ContractsPage;