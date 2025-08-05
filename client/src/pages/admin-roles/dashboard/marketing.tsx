import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, Mail, TrendingUp, Users, Target, BarChart3, Palette } from 'lucide-react';

export default function MarketingDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Marketing" 
      subtitle="Panel de control del módulo de marketing y comunicaciones"
    >
      <div className="space-y-6">
        {/* Métricas de marketing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">5 programadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impresiones</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247K</div>
              <p className="text-xs text-muted-foreground">+18% esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
              <Mail className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,547</div>
              <p className="text-xs text-muted-foreground">92% tasa apertura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4%</div>
              <p className="text-xs text-muted-foreground">+2.1% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Campañas y comunicaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Campañas Principales
              </CardTitle>
              <CardDescription>
                Estado de las campañas de marketing más importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Festival de Primavera</div>
                      <div className="text-xs text-gray-500">Evento principal del año</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700">Activa</Badge>
                    <div className="text-xs text-gray-500 mt-1">45.2K vistas</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Programa de Voluntarios</div>
                      <div className="text-xs text-gray-500">Reclutamiento anual</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-700">Programada</Badge>
                    <div className="text-xs text-gray-500 mt-1">12.8K vistas</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Adopta un Árbol</div>
                      <div className="text-xs text-gray-500">Campaña sostenibilidad</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-100 text-purple-700">Activa</Badge>
                    <div className="text-xs text-gray-500 mt-1">28.9K vistas</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Mercados Orgánicos</div>
                      <div className="text-xs text-gray-500">Promoción semanal</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-orange-100 text-orange-700">En Pausa</Badge>
                    <div className="text-xs text-gray-500 mt-1">8.3K vistas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-600" />
                Comunicaciones por Email
              </CardTitle>
              <CardDescription>
                Estadísticas de las campañas de email marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">8,547</div>
                    <div className="text-sm text-gray-600">Emails Enviados</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-gray-600">Tasa Apertura</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2.1%</div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Rendimiento por Tipo:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Newsletter</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{width: '94%'}}></div>
                        </div>
                        <span className="text-xs">94%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Promocional</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <span className="text-xs">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Eventos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-purple-500 h-1 rounded-full" style={{width: '96%'}}></div>
                        </div>
                        <span className="text-xs">96%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de audiencia y publicidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Análisis de Audiencia
              </CardTitle>
              <CardDescription>
                Datos demográficos y comportamiento de la audiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Distribución por Edad:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">18-25 años</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                        <span className="text-xs">23%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">26-35 años</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>
                        <span className="text-xs">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">36-50 años</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '28%'}}></div>
                        </div>
                        <span className="text-xs">28%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">+50 años</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '14%'}}></div>
                        </div>
                        <span className="text-xs">14%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">58%</div>
                      <div className="text-xs text-gray-600">Mujeres</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">42%</div>
                      <div className="text-xs text-gray-600">Hombres</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-orange-600" />
                Espacios Publicitarios
              </CardTitle>
              <CardDescription>
                Rendimiento de los espacios publicitarios en parques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">89</div>
                    <div className="text-sm text-gray-600">Espacios Activos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-gray-600">Ocupación</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Bosque Los Colomos</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">45.2K</div>
                      <div className="text-xs text-gray-500">impresiones</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Parque Agua Azul</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">38.7K</div>
                      <div className="text-xs text-gray-500">impresiones</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Parque Revolución</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">28.1K</div>
                      <div className="text-xs text-gray-500">impresiones</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">$45,230</div>
                    <div className="text-sm text-gray-600">Ingresos Publicitarios</div>
                    <div className="text-xs text-gray-500">este mes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DynamicAdminLayout>
  );
}