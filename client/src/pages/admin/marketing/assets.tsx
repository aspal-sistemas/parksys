import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Image, FileText, Video, Check, X, Eye, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorAsset } from '@/shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/AdminLayout';

const AssetsPage = () => {
  const [selectedSponsor, setSelectedSponsor] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [showNewAssetDialog, setShowNewAssetDialog] = useState(false);

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

  const { data: allAssets, isLoading } = useQuery({
    queryKey: ['/api/sponsor-assets'],
    queryFn: async () => {
      if (!sponsors) return [];
      const assetsPromises = sponsors.map((sponsor: any) => 
        safeApiRequest(`/api/sponsors/${sponsor.id}/assets`, {})
      );
      const results = await Promise.all(assetsPromises);
      return results.flat();
    },
    enabled: !!sponsors
  });

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return <Image className="w-5 h-5" />;
      case 'banner': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <FileText className="w-5 h-5" />;
      case 'brochure': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const filteredAssets = allAssets?.filter((asset: SponsorAsset) => {
    const matchesSponsor = selectedSponsor === 'all' || asset.sponsorId === parseInt(selectedSponsor);
    const matchesType = selectedAssetType === 'all' || asset.assetType === selectedAssetType;
    return matchesSponsor && matchesType;
  }) || [];

  const approvedAssets = filteredAssets.filter(asset => asset.approvalStatus === 'approved').length;
  const pendingAssets = filteredAssets.filter(asset => asset.approvalStatus === 'pending').length;
  const totalSize = filteredAssets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Activos Promocionales</h1>
          <p className="text-gray-600">Gestiona todos los activos de marca de los patrocinadores</p>
        </div>
        <Dialog open={showNewAssetDialog} onOpenChange={setShowNewAssetDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Subir Activo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Activo</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Upload className="w-16 h-16 mx-auto text-[#00a587] mb-4" />
              <p className="text-gray-600">
                Funcionalidad de subida de activos en desarrollo
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
                <p className="text-sm text-gray-600">Total Activos</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAssets.length}</p>
              </div>
              <FileText className="w-8 h-8 text-[#00a587]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">{approvedAssets}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAssets}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamaño Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatFileSize(totalSize)}</p>
              </div>
              <Download className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por patrocinador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los patrocinadores</SelectItem>
            {sponsors?.map((sponsor: any) => (
              <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                {sponsor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="logo">Logo</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="brochure">Brochure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset: SponsorAsset) => {
          const sponsor = sponsors?.find((s: any) => s.id === asset.sponsorId);
          
          return (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAssetTypeIcon(asset.assetType)}
                    <CardTitle className="text-lg">{asset.assetName}</CardTitle>
                  </div>
                  <Badge className={getApprovalStatusColor(asset.approvalStatus)}>
                    {getApprovalStatusText(asset.approvalStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Patrocinador</p>
                    <p className="font-medium">{sponsor?.name || 'Desconocido'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className="font-medium capitalize">{asset.assetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tamaño</p>
                      <p className="font-medium">{formatFileSize(asset.fileSize || 0)}</p>
                    </div>
                  </div>
                  
                  {asset.specifications && (
                    <div>
                      <p className="text-sm text-gray-600">Especificaciones</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{asset.specifications}</p>
                    </div>
                  )}
                  
                  {asset.usageRights && (
                    <div>
                      <p className="text-sm text-gray-600">Derechos de uso</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{asset.usageRights}</p>
                    </div>
                  )}
                  
                  {asset.expirationDate && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha de expiración</p>
                      <p className="text-sm text-gray-700">
                        {format(new Date(asset.expirationDate), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                    {asset.approvalStatus === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron activos
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedSponsor !== 'all' || selectedAssetType !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Sube los primeros activos promocionales'
              }
            </p>
            {selectedSponsor === 'all' && selectedAssetType === 'all' && (
              <Button 
                onClick={() => setShowNewAssetDialog(true)}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Subir Primer Activo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
};

export default AssetsPage;