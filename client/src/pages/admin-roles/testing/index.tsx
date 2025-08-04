import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, Play, User, Shield, Eye, CheckCircle,
  XCircle, AlertTriangle, Settings, Crown, Star,
  Gem, Zap, Award, RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tipos para simulación
interface SimulationUser {
  id: string;
  name: string;
  role: string;
  level: number;
}

interface SimulationResult {
  action: string;
  expected: boolean;
  result: boolean;
  status: 'success' | 'fail' | 'warning';
  details: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  user: SimulationUser;
  actions: string[];
  results?: SimulationResult[];
}

// Usuarios de prueba
const testUsers: SimulationUser[] = [
  {
    id: 'super-admin',
    name: 'Admin Sistema',
    role: 'Super Administrador',
    level: 10
  },
  {
    id: 'director',
    name: 'Carlos Martínez',
    role: 'Director General',
    level: 9
  },
  {
    id: 'coord-parques',
    name: 'Ana García',
    role: 'Coordinador de Parques',
    level: 8
  },
  {
    id: 'operador',
    name: 'Juan Rodríguez',
    role: 'Operador de Parque',
    level: 4
  },
  {
    id: 'consultor',
    name: 'Roberto Sánchez',
    role: 'Consultor/Auditor',
    level: 1
  }
];

// Escenarios de prueba predefinidos
const predefinedScenarios: TestScenario[] = [
  {
    id: 'scenario-1',
    name: 'Acceso Completo - Super Admin',
    description: 'Verificar que el Super Admin tiene acceso a todas las funciones',
    user: testUsers[0],
    actions: [
      'Acceder a Dashboard Financiero',
      'Gestionar Usuarios',
      'Modificar Roles',
      'Ver Logs de Auditoría',
      'Configurar Sistema'
    ]
  },
  {
    id: 'scenario-2',
    name: 'Restricciones Operador',
    description: 'Verificar que el Operador no puede acceder a funciones administrativas',
    user: testUsers[3],
    actions: [
      'Ver Dashboard de Parques',
      'Registrar Mantenimiento',
      'Acceder a Configuración Financiera',
      'Gestionar Usuarios',
      'Modificar Roles'
    ]
  },
  {
    id: 'scenario-3',
    name: 'Herencia de Permisos - Director',
    description: 'Verificar que el Director hereda permisos de roles inferiores',
    user: testUsers[1],
    actions: [
      'Ver Dashboards Operativos',
      'Acceder a Reportes Financieros',
      'Gestionar Actividades',
      'Configurar Notificaciones',
      'Administrar Usuarios'
    ]
  },
  {
    id: 'scenario-4',
    name: 'Solo Lectura - Consultor',
    description: 'Verificar que el Consultor solo tiene acceso de lectura',
    user: testUsers[4],
    actions: [
      'Ver Dashboards',
      'Leer Reportes',
      'Crear Nueva Actividad',
      'Modificar Parque',
      'Eliminar Usuario'
    ]
  }
];

export default function RoleTesting() {
  const [selectedUser, setSelectedUser] = useState<SimulationUser>(testUsers[0]);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Simular verificación de permisos
  const simulatePermissionCheck = (user: SimulationUser, action: string): SimulationResult => {
    // Lógica simulada basada en roles y niveles
    let expected = false;
    let result = false;
    let status: 'success' | 'fail' | 'warning' = 'fail';
    let details = '';

    // Reglas de permisos simuladas
    if (user.role === 'Super Administrador') {
      expected = true;
      result = true;
      status = 'success';
      details = 'Super Admin tiene acceso completo';
    } else if (action.includes('Dashboard') || action.includes('Ver') || action.includes('Leer')) {
      // Permisos de lectura
      expected = user.level >= 1;
      result = expected;
      status = result ? 'success' : 'fail';
      details = result ? 'Permiso de lectura concedido' : 'Nivel insuficiente para lectura';
    } else if (action.includes('Gestionar') || action.includes('Crear') || action.includes('Registrar')) {
      // Permisos de escritura
      expected = user.level >= 4;
      result = expected;
      status = result ? 'success' : 'fail';
      details = result ? 'Permiso de escritura concedido' : 'Nivel insuficiente para escritura';
    } else if (action.includes('Modificar') || action.includes('Eliminar') || action.includes('Administrar') || action.includes('Configurar')) {
      // Permisos administrativos
      expected = user.level >= 8;
      result = expected;
      status = result ? 'success' : 'fail';
      details = result ? 'Permiso administrativo concedido' : 'Nivel insuficiente para administración';
    }

    // Casos especiales
    if (action.includes('Financiero') && user.role !== 'Super Administrador' && user.role !== 'Director General' && user.role !== 'Administrador Financiero') {
      expected = false;
      result = false;
      status = 'fail';
      details = 'Acceso a finanzas restringido por rol';
    }

    return {
      action,
      expected,
      result,
      status,
      details
    };
  };

  // Ejecutar simulación
  const runSimulation = async (scenario: TestScenario) => {
    setIsRunning(true);
    setSimulationResults([]);

    // Simular demora de procesamiento
    for (let i = 0; i < scenario.actions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = simulatePermissionCheck(scenario.user, scenario.actions[i]);
      setSimulationResults(prev => [...prev, result]);
    }

    setIsRunning(false);
  };

  // Ejecutar prueba personalizada
  const runCustomTest = async (user: SimulationUser, actions: string[]) => {
    setIsRunning(true);
    setSimulationResults([]);

    for (let i = 0; i < actions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = simulatePermissionCheck(user, actions[i]);
      setSimulationResults(prev => [...prev, result]);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'fail': return 'bg-red-100 text-red-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Super')) return <Crown className="w-4 h-4" />;
    if (role.includes('Director')) return <Star className="w-4 h-4" />;
    if (role.includes('Coordinador')) return <Gem className="w-4 h-4" />;
    if (role.includes('Operador')) return <Award className="w-4 h-4" />;
    return <Eye className="w-4 h-4" />;
  };

  const getTestSummary = () => {
    if (simulationResults.length === 0) return null;

    const total = simulationResults.length;
    const passed = simulationResults.filter(r => r.status === 'success').length;
    const failed = simulationResults.filter(r => r.status === 'fail').length;
    const warnings = simulationResults.filter(r => r.status === 'warning').length;

    return { total, passed, failed, warnings };
  };

  const summary = getTestSummary();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Testing y Simulación
            </h1>
            <p className="text-gray-600 mt-2">
              Probar configuraciones de roles y simular escenarios de acceso
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpiar Resultados
          </Button>
        </div>

        {/* Resumen de resultados */}
        {summary && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                  <p className="text-sm text-gray-600">Total Pruebas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
                  <p className="text-sm text-gray-600">Exitosas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                  <p className="text-sm text-gray-600">Fallidas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
                  <p className="text-sm text-gray-600">Advertencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="scenarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scenarios">Escenarios Predefinidos</TabsTrigger>
            <TabsTrigger value="custom">Pruebas Personalizadas</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Escenarios de Prueba
                </CardTitle>
                <CardDescription>
                  Ejecutar escenarios predefinidos para validar el sistema de roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedScenarios.map((scenario) => (
                    <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(scenario.user.role)}
                            <span className="font-medium">{scenario.name}</span>
                          </div>
                          <Badge variant="outline">
                            Nivel {scenario.user.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                        <p className="text-sm font-medium text-blue-600">
                          Usuario: {scenario.user.name} ({scenario.user.role})
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-gray-700">Acciones a probar:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {scenario.actions.slice(0, 3).map((action, index) => (
                              <li key={index}>• {action}</li>
                            ))}
                            {scenario.actions.length > 3 && (
                              <li className="text-gray-500">+ {scenario.actions.length - 3} más...</li>
                            )}
                          </ul>
                        </div>
                        <Button 
                          onClick={() => runSimulation(scenario)}
                          disabled={isRunning}
                          className="w-full"
                        >
                          {isRunning ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Ejecutando...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Ejecutar Escenario
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pruebas Personalizadas
                </CardTitle>
                <CardDescription>
                  Crear y ejecutar pruebas personalizadas con usuarios y acciones específicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Seleccionar Usuario de Prueba
                  </label>
                  <Select 
                    value={selectedUser.id} 
                    onValueChange={(value) => {
                      const user = testUsers.find(u => u.id === value);
                      if (user) setSelectedUser(user);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {testUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span>{user.name} - {user.role}</span>
                            <Badge variant="outline" className="ml-auto">
                              Nivel {user.level}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Acciones Rápidas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Ver Dashboard General',
                      'Gestionar Parques',
                      'Configurar Sistema',
                      'Ver Reportes Financieros',
                      'Administrar Usuarios',
                      'Modificar Roles',
                      'Eliminar Registros',
                      'Acceder a Logs',
                      'Configurar Notificaciones'
                    ].map((action) => (
                      <Button
                        key={action}
                        variant="outline"
                        size="sm"
                        onClick={() => runCustomTest(selectedUser, [action])}
                        disabled={isRunning}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Usuario Seleccionado</h4>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getRoleIcon(selectedUser.role)}
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{selectedUser.name}</p>
                      <p className="text-sm text-blue-700">{selectedUser.role}</p>
                      <Badge variant="outline" className="bg-white text-blue-700">
                        Nivel de Autoridad: {selectedUser.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Resultados de Simulación
                </CardTitle>
                <CardDescription>
                  Resultados detallados de las pruebas ejecutadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulationResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Acción</TableHead>
                        <TableHead>Esperado</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Detalles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulationResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <p className="font-medium text-gray-900">{result.action}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.expected ? "default" : "secondary"}>
                              {result.expected ? 'Permitido' : 'Denegado'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.result ? "default" : "secondary"}>
                              {result.result ? 'Permitido' : 'Denegado'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <Badge className={getStatusColor(result.status)}>
                                {result.status === 'success' ? 'Éxito' : 
                                 result.status === 'fail' ? 'Fallo' : 'Advertencia'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600">{result.details}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      No hay resultados de simulación. Ejecuta un escenario o prueba personalizada para ver los resultados.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}