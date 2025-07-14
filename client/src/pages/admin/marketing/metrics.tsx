import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, Eye, Users, BarChart3, Calendar, Target, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeApiRequest } from '@/lib/queryClient';
import { SponsorshipMetrics } from '@/shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/AdminLayout';

const MetricsPage = () => {
  const [selectedSponsor, setSelectedSponsor] = useState('all');
  const [showNewMetricsDialog, setShowNewMetricsDialog] = useState(false);

  const { data: sponsors } = useQuery({
    queryKey: ['/api/sponsors'],
    queryFn: () => safeApiRequest('/api/sponsors', {})
  });

  const { data: allMetrics, isLoading } = useQuery({
    queryKey: ['/api/sponsorship-metrics'],
    queryFn: async () => {
      try {
        // Usar endpoint directo para obtener todas las métricas
        const response = await safeApiRequest('/api/sponsorship-metrics', {});
        return response || [];
      } catch (error) {
        console.error('Error cargando métricas:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  });

  const filteredMetrics = allMetrics?.filter((metric: SponsorshipMetrics) => {
    if (selectedSponsor === 'all') return true;
    return metric.sponsorId === parseInt(selectedSponsor);
  }) || [];

  const totalMetrics = {
    impressions: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.impressions || 0), 0),
    reach: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.reach || 0), 0),
    engagement: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.engagement || 0), 0),
    leads: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.leadsGenerated || 0), 0),
    conversions: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.conversions || 0), 0),
    websiteClicks: filteredMetrics.reduce((sum: number, m: SponsorshipMetrics) => sum + (m.websiteClicks || 0), 0)
  };

  const conversionRate = totalMetrics.leads > 0 ? (totalMetrics.conversions / totalMetrics.leads * 100).toFixed(1) : '0';
  const engagementRate = totalMetrics.impressions > 0 ? (totalMetrics.engagement / totalMetrics.impressions * 100).toFixed(1) : '0';

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
          <h1 className="text-2xl font-bold text-gray-900">Métricas de Patrocinio</h1>
          <p className="text-gray-600">Analiza el rendimiento de los patrocinios</p>
        </div>
        <Dialog open={showNewMetricsDialog} onOpenChange={setShowNewMetricsDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a587] hover:bg-[#067f5f]">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Métricas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevas Métricas</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 mx-auto text-[#00a587] mb-4" />
              <p className="text-gray-600">
                Funcionalidad de agregar métricas en desarrollo
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sponsor Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filtrar por patrocinador:</label>
        <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
          <SelectTrigger className="w-64">
            <SelectValue />
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impresiones</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalMetrics.impressions.toLocaleString('es-MX')}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alcance</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalMetrics.reach.toLocaleString('es-MX')}
                </p>
              </div>
              <Share2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalMetrics.engagement.toLocaleString('es-MX')}
                </p>
                <p className="text-sm text-gray-500">{engagementRate}% tasa</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalMetrics.leads.toLocaleString('es-MX')}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversiones</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalMetrics.conversions.toLocaleString('es-MX')}
                </p>
                <p className="text-sm text-gray-500">{conversionRate}% tasa</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clicks al Sitio Web</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalMetrics.websiteClicks.toLocaleString('es-MX')}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reportes Disponibles</p>
                <p className="text-2xl font-bold text-gray-600">
                  {filteredMetrics.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Historial de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMetrics.map((metric: SponsorshipMetrics) => {
              const sponsor = sponsors?.find((s: any) => s.id === metric.sponsorId);
              
              return (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">
                        {sponsor?.name || 'Patrocinador Desconocido'}
                      </h4>
                      <Badge variant="outline">
                        {metric.reportDate && !isNaN(new Date(metric.reportDate).getTime()) 
                          ? format(new Date(metric.reportDate), 'dd/MM/yyyy', { locale: es })
                          : 'Fecha no válida'
                        }
                      </Badge>
                      <Badge variant="secondary">
                        {metric.measurementPeriod}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Impresiones</p>
                      <p className="font-medium">{(metric.impressions || 0).toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Alcance</p>
                      <p className="font-medium">{(metric.reach || 0).toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Engagement</p>
                      <p className="font-medium">{(metric.engagement || 0).toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Leads</p>
                      <p className="font-medium text-green-600">{metric.leadsGenerated || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Conversiones</p>
                      <p className="font-medium text-blue-600">{metric.conversions || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Clicks Web</p>
                      <p className="font-medium">{metric.websiteClicks || 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredMetrics.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay métricas disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedSponsor !== 'all' 
                  ? 'Este patrocinador no tiene métricas registradas'
                  : 'Agrega las primeras métricas de rendimiento'
                }
              </p>
              <Button 
                onClick={() => setShowNewMetricsDialog(true)}
                className="bg-[#00a587] hover:bg-[#067f5f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Métricas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default MetricsPage;