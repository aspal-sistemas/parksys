import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HandHeart, DollarSign, Calendar, TrendingUp, Star, Building, Users, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

export default function SponsorshipDashboard() {
  const { data: sponsors, isLoading: loadingSponsors } = useQuery({
    queryKey: ['/api/sponsors'],
  });

  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/sponsor-contracts'],
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['/api/sponsor-events'],
  });

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['/api/sponsorship-metrics'],
  });

  const isLoading = loadingSponsors || loadingContracts || loadingEvents || loadingMetrics;

  // Cálculos de métricas
  const totalSponsors = sponsors?.length || 0;
  const activeContracts = contracts?.filter(c => c.status === 'active')?.length || 0;
  const totalEvents = events?.length || 0;
  const totalRevenue = contracts?.reduce((sum, c) => sum + (c.contractValue || 0), 0) || 0;
  const avgSatisfaction = metrics?.length ? 
    (metrics.reduce((sum, m) => sum + (m.metricValue || 0), 0) / metrics.length).toFixed(1) : 0;

  const recentContracts = contracts?.slice(0, 5) || [];
  const upcomingEvents = events?.filter(e => new Date(e.eventDate) > new Date())?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard de Patrocinios
            </h1>
            <p className="text-gray-600">
              Gestión integral de patrocinadores y contratos
            </p>
          </div>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/admin/sponsorship/contracts">
                <DollarSign className="h-4 w-4 mr-2" />
                Nuevo Contrato
              </Link>
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Patrocinadores Activos
              </CardTitle>
              <Building className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{totalSponsors}</div>
              )}
              <p className="text-xs text-gray-500">Total registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Contratos Activos
              </CardTitle>
              <HandHeart className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{activeContracts}</div>
              )}
              <p className="text-xs text-gray-500">En vigencia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Eventos Patrocinados
              </CardTitle>
              <Calendar className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{totalEvents}</div>
              )}
              <p className="text-xs text-gray-500">Total eventos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#00a587]" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString('es-MX')}
                </div>
              )}
              <p className="text-xs text-gray-500">MXN</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contratos recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HandHeart className="h-5 w-5 mr-2 text-[#00a587]" />
                Contratos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentContracts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay contratos registrados
                </p>
              ) : (
                <div className="space-y-4">
                  {recentContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{contract.sponsorName}</p>
                        <p className="text-sm text-gray-600">{contract.contractType}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${contract.contractValue?.toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eventos próximos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#00a587]" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay eventos próximos
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{event.eventName}</p>
                      <p className="text-sm text-gray-600">{event.eventType}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-500">
                          {new Date(event.eventDate).toLocaleDateString('es-MX')}
                        </p>
                        <Badge variant="outline">
                          {event.participantsCount} participantes
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center justify-center p-6" asChild>
                <Link href="/admin/sponsorship/contracts">
                  <div className="text-center">
                    <HandHeart className="h-8 w-8 mx-auto mb-2 text-[#00a587]" />
                    <p className="font-medium">Gestionar Contratos</p>
                    <p className="text-sm text-gray-500">Crear y administrar contratos</p>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center p-6" asChild>
                <Link href="/admin/sponsorship/events">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-[#00a587]" />
                    <p className="font-medium">Eventos</p>
                    <p className="text-sm text-gray-500">Planificar eventos patrocinados</p>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center p-6" asChild>
                <Link href="/admin/sponsorship/metrics">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#00a587]" />
                    <p className="font-medium">Métricas</p>
                    <p className="text-sm text-gray-500">Analizar rendimiento</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}