import React from 'react';
import { DynamicAdminLayout } from '@/components/DynamicAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Calendar, TrendingUp, Clock, Award, AlertTriangle, UserCheck } from 'lucide-react';

export default function RecursosHumanosDashboard() {
  return (
    <DynamicAdminLayout 
      title="Dashboard - Recursos Humanos" 
      subtitle="Panel de control del módulo de recursos humanos y gestión de personal"
    >
      <div className="space-y-6">
        {/* Métricas de recursos humanos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+8 nuevos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$847K</div>
              <p className="text-xs text-muted-foreground">Incluye prestaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacaciones</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Solicitudes pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.6</div>
              <p className="text-xs text-muted-foreground">Rating promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribución de personal y departamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Distribución por Departamento
              </CardTitle>
              <CardDescription>
                Personal distribuido por área de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Mantenimiento</div>
                      <div className="text-xs text-gray-500">Jardineros, técnicos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">45</div>
                    <div className="text-xs text-gray-500">28.8%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Administración</div>
                      <div className="text-xs text-gray-500">Oficinas, coordinación</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">32</div>
                    <div className="text-xs text-gray-500">20.5%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Seguridad</div>
                      <div className="text-xs text-gray-500">Vigilancia, guardias</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">28</div>
                    <div className="text-xs text-gray-500">17.9%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Actividades</div>
                      <div className="text-xs text-gray-500">Instructores, coordinadores</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">24</div>
                    <div className="text-xs text-gray-500">15.4%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-teal-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Limpieza</div>
                      <div className="text-xs text-gray-500">Personal de aseo</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">18</div>
                    <div className="text-xs text-gray-500">11.5%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Dirección</div>
                      <div className="text-xs text-gray-500">Directivos, gerentes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">9</div>
                    <div className="text-xs text-gray-500">5.8%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Control de Asistencia
              </CardTitle>
              <CardDescription>
                Métricas de asistencia y puntualidad del personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">96%</div>
                    <div className="text-sm text-gray-600">Asistencia</div>
                    <div className="text-xs text-gray-500">promedio mensual</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-gray-600">Puntualidad</div>
                    <div className="text-xs text-gray-500">llegadas a tiempo</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Asistencia por Departamento:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Administración</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{width: '98%'}}></div>
                        </div>
                        <span className="text-xs">98%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Seguridad</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{width: '97%'}}></div>
                        </div>
                        <span className="text-xs">97%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Mantenimiento</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-yellow-500 h-1 rounded-full" style={{width: '94%'}}></div>
                        </div>
                        <span className="text-xs">94%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Actividades</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{width: '96%'}}></div>
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

        {/* Nómina y beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Análisis de Nómina
              </CardTitle>
              <CardDescription>
                Desglose de la nómina mensual por concepto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Salarios Base</div>
                      <div className="text-xs text-gray-500">Sueldos ordinarios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$547,200</div>
                    <div className="text-xs text-gray-500">64.6%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Prestaciones</div>
                      <div className="text-xs text-gray-500">IMSS, INFONAVIT</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$164,160</div>
                    <div className="text-xs text-gray-500">19.4%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Bonos</div>
                      <div className="text-xs text-gray-500">Productividad, puntualidad</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$93,680</div>
                    <div className="text-xs text-gray-500">11.1%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <div>
                      <div className="font-medium text-sm">Tiempo Extra</div>
                      <div className="text-xs text-gray-500">Horas adicionales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">$41,960</div>
                    <div className="text-xs text-gray-500">5.0%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Gestión de Vacaciones
              </CardTitle>
              <CardDescription>
                Estado de solicitudes y días de vacaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <div className="text-sm text-gray-600">Pendientes</div>
                    <div className="text-xs text-gray-500">solicitudes</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">89</div>
                    <div className="text-sm text-gray-600">Aprobadas</div>
                    <div className="text-xs text-gray-500">este mes</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-sm font-medium">Ana García</div>
                        <div className="text-xs text-gray-500">15-25 Enero</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Pendiente</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Carlos Mendoza</div>
                        <div className="text-xs text-gray-500">20-30 Enero</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Aprobada</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">María Rodríguez</div>
                        <div className="text-xs text-gray-500">1-10 Febrero</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Programada</Badge>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium mb-2">Días promedio por departamento:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">Administración</span>
                      <span className="text-xs font-medium">12.4 días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Mantenimiento</span>
                      <span className="text-xs font-medium">8.7 días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Actividades</span>
                      <span className="text-xs font-medium">10.2 días</span>
                    </div>
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