import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, MapPin, Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';

export default function OperacionesDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Operaciones" 
      subtitle="Panel de control del módulo de operaciones y eventos"
    >
      <div className="space-y-6">
        {/* Métricas operacionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">8 esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concesiones</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">12 nuevas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,847</div>
              <p className="text-xs text-muted-foreground">+234 este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$287K</div>
              <p className="text-xs text-muted-foreground">+18% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Eventos próximos y concesiones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Eventos programados para los próximos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-blue-600 font-medium">ENE</div>
                    <div className="text-lg font-bold text-blue-700">16</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Festival de Primavera</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Parque Revolución
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      10:00 - 18:00
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Confirmado</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-green-600 font-medium">ENE</div>
                    <div className="text-lg font-bold text-green-700">20</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Mercado Orgánico</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Bosque Los Colomos
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      08:00 - 14:00
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">En Preparación</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-orange-600 font-medium">ENE</div>
                    <div className="text-lg font-bold text-orange-700">25</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Concierto de Jazz</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Parque Agua Azul
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      19:00 - 22:00
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Pendiente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Estado de Concesiones
              </CardTitle>
              <CardDescription>
                Resumen del estado de concesiones activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Restaurantes</div>
                      <div className="text-xs text-gray-500">18 concesiones activas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">$124K</div>
                    <div className="text-xs text-gray-500">ingresos/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Comercio</div>
                      <div className="text-xs text-gray-500">15 concesiones activas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">$89K</div>
                    <div className="text-xs text-gray-500">ingresos/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Servicios</div>
                      <div className="text-xs text-gray-500">12 concesiones activas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600">$74K</div>
                    <div className="text-xs text-gray-500">ingresos/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="font-medium text-sm">Renovaciones</div>
                      <div className="text-xs text-gray-500">8 próximas a vencer</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Atención</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas operacionales detalladas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Rendimiento Operacional
            </CardTitle>
            <CardDescription>
              Indicadores clave de rendimiento de las operaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">89%</div>
                <div className="text-sm text-gray-600">Ocupación Promedio</div>
                <div className="text-xs text-gray-500">espacios de eventos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">Satisfacción</div>
                <div className="text-xs text-gray-500">participantes eventos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">76%</div>
                <div className="text-sm text-gray-600">Renovación</div>
                <div className="text-xs text-gray-500">concesiones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">$287K</div>
                <div className="text-sm text-gray-600">Ingresos Totales</div>
                <div className="text-xs text-gray-500">este mes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DynamicAdminLayout>
  );
}