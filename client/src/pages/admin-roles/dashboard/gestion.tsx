import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, Activity, Users, Calendar, TrendingUp, MapPin, Star } from 'lucide-react';

export default function GestionDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Gestión" 
      subtitle="Panel de control del módulo de gestión de parques y actividades"
    >
      <div className="space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parques Activos</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividades</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">87 activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntarios</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-muted-foreground">89 nuevos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitantes/Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Parques destacados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Parques con Mayor Actividad
              </CardTitle>
              <CardDescription>
                Los parques más visitados y con mayor participación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Bosque Los Colomos</div>
                      <div className="text-xs text-gray-500">Guadalajara Centro</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">2,847</div>
                    <div className="text-xs text-gray-500">visitantes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Parque Agua Azul</div>
                      <div className="text-xs text-gray-500">Zona Centro</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">2,156</div>
                    <div className="text-xs text-gray-500">visitantes</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Parque Revolución</div>
                      <div className="text-xs text-gray-500">Zapopan Norte</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">1,923</div>
                    <div className="text-xs text-gray-500">visitantes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Actividades Próximas
              </CardTitle>
              <CardDescription>
                Eventos y actividades programadas para los próximos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500">ENE</div>
                    <div className="text-lg font-bold">15</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Taller de Jardinería</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Bosque Los Colomos
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Confirmado</Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500">ENE</div>
                    <div className="text-lg font-bold">18</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Yoga al Aire Libre</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Parque Agua Azul
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600">Planificado</Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500">ENE</div>
                    <div className="text-lg font-bold">22</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Limpieza Comunitaria</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Múltiples parques
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600">Pendiente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas de voluntarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Gestión de Voluntarios
            </CardTitle>
            <CardDescription>
              Resumen de la participación y actividad de voluntarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">432</div>
                <div className="text-sm text-gray-600">Total Voluntarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">89</div>
                <div className="text-sm text-gray-600">Activos este Mes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1,245</div>
                <div className="text-sm text-gray-600">Horas Voluntariado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">4.8</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  Rating Promedio <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DynamicAdminLayout>
  );
}