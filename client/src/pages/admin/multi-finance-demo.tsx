import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Building, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function MultiFinanceDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const integrations = [
    {
      id: 'hr',
      name: 'Recursos Humanos',
      icon: Users,
      type: 'expense',
      color: 'bg-blue-500',
      description: 'Nómina, salarios, bonos y gastos de personal',
      status: 'completed',
      examples: [
        { concept: 'Salarios Base', amount: 285000, period: 'Mensual' },
        { concept: 'Bonos de Desempeño', amount: 45000, period: 'Trimestral' },
        { concept: 'Tiempo Extra', amount: 18500, period: 'Semanal' }
      ]
    },
    {
      id: 'concessions',
      name: 'Concesiones',
      icon: Building,
      type: 'income',
      color: 'bg-green-500',
      description: 'Rentas, porcentajes de ventas y multas',
      status: 'active',
      examples: [
        { concept: 'Renta de Cafetería', amount: 25000, period: 'Mensual' },
        { concept: 'Porcentaje Tienda Souvenirs', amount: 8500, period: 'Mensual' },
        { concept: 'Multa por Incumplimiento', amount: 5000, period: 'Único' }
      ]
    },
    {
      id: 'events',
      name: 'Eventos y Actividades',
      icon: Calendar,
      type: 'income',
      color: 'bg-purple-500',
      description: 'Inscripciones, entradas y patrocinios',
      status: 'active',
      examples: [
        { concept: 'Inscripciones Yoga', amount: 12000, period: 'Mensual' },
        { concept: 'Entradas Concierto', amount: 85000, period: 'Único' },
        { concept: 'Patrocinio Empresa X', amount: 50000, period: 'Evento' }
      ]
    },
    {
      id: 'assets',
      name: 'Activos y Mantenimiento',
      icon: TrendingDown,
      type: 'expense',
      color: 'bg-orange-500',
      description: 'Mantenimiento, reparaciones y compras',
      status: 'pending',
      examples: [
        { concept: 'Mantenimiento Juegos', amount: 15000, period: 'Mensual' },
        { concept: 'Reparación Fuente', amount: 28000, period: 'Único' },
        { concept: 'Compra Mobiliario', amount: 45000, period: 'Único' }
      ]
    },
    {
      id: 'trees',
      name: 'Árboles y Jardinería',
      icon: TrendingDown,
      type: 'expense',
      color: 'bg-green-600',
      description: 'Plantaciones, poda y tratamientos',
      status: 'pending',
      examples: [
        { concept: 'Compra de Árboles', amount: 22000, period: 'Trimestral' },
        { concept: 'Servicio de Poda', amount: 8000, period: 'Mensual' },
        { concept: 'Fertilizantes', amount: 5500, period: 'Mensual' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing y Promociones',
      icon: TrendingUp,
      type: 'income',
      color: 'bg-pink-500',
      description: 'Publicidad, patrocinios y promociones',
      status: 'pending',
      examples: [
        { concept: 'Publicidad en Parque', amount: 35000, period: 'Mensual' },
        { concept: 'Patrocinio Comercial', amount: 75000, period: 'Trimestral' },
        { concept: 'Licencia de Marca', amount: 15000, period: 'Anual' }
      ]
    }
  ];

  const runDemo = async (integrationId: string) => {
    setActiveDemo(integrationId);
    setProgress(0);

    // Simular proceso de integración
    const steps = [
      { text: 'Conectando con módulo fuente...', duration: 1000 },
      { text: 'Obteniendo datos operativos...', duration: 1500 },
      { text: 'Validando información...', duration: 800 },
      { text: 'Generando registros financieros...', duration: 1200 },
      { text: 'Actualizando categorías...', duration: 600 },
      { text: 'Creando trazabilidad...', duration: 400 },
      { text: 'Completando integración...', duration: 500 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Marcar como completado
    setTimeout(() => {
      setActiveDemo(null);
      setProgress(0);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'active':
        return 'En Desarrollo';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const incomeIntegrations = integrations.filter(i => i.type === 'income');
  const expenseIntegrations = integrations.filter(i => i.type === 'expense');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Integraciones Financieras</h1>
          <p className="text-muted-foreground mt-2">
            Demostración de flujos automáticos entre módulos operativos y el sistema financiero
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Ecosistema Completo
        </Badge>
      </div>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen del Ecosistema Financiero
          </CardTitle>
          <CardDescription>
            Visión general de todas las integraciones activas y su impacto financiero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+$487,500</div>
              <div className="text-sm text-muted-foreground">Ingresos Mensuales Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-$348,500</div>
              <div className="text-sm text-muted-foreground">Egresos Mensuales Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">+$139,000</div>
              <div className="text-sm text-muted-foreground">Flujo Neto Mensual</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Módulos Integrados</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Completados</span>
                  <span className="font-medium">1/6</span>
                </div>
                <div className="flex justify-between">
                  <span>En Desarrollo</span>
                  <span className="font-medium">2/6</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendientes</span>
                  <span className="font-medium">3/6</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Impacto Financiero</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Automatización</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="flex justify-between">
                  <span>Reducción Errores</span>
                  <span className="font-medium">80%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo Ahorrado</span>
                  <span className="font-medium">15h/semana</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Ingresos y Egresos */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Módulos de Ingresos
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Módulos de Egresos
          </TabsTrigger>
        </TabsList>

        {/* Módulos de Ingresos */}
        <TabsContent value="income" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${integration.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{integration.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {getStatusIcon(integration.status)}
                            <span className="text-xs text-muted-foreground">
                              {getStatusText(integration.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {integration.examples.map((example, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{example.concept}</span>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              ${example.amount.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">{example.period}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {integration.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                      <Button
                        size="sm"
                        variant={integration.status === 'completed' ? 'default' : 'outline'}
                        onClick={() => runDemo(integration.id)}
                        disabled={activeDemo === integration.id}
                      >
                        {activeDemo === integration.id ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Procesando...
                          </>
                        ) : integration.status === 'completed' ? (
                          <>
                            Ver Demo
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            Simular
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {activeDemo === integration.id && (
                      <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          Procesando integración... {Math.round(progress)}%
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Módulos de Egresos */}
        <TabsContent value="expense" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${integration.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{integration.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {getStatusIcon(integration.status)}
                            <span className="text-xs text-muted-foreground">
                              {getStatusText(integration.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {integration.examples.map((example, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{example.concept}</span>
                          <div className="text-right">
                            <div className="font-medium text-red-600">
                              ${example.amount.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">{example.period}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {integration.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                      <Button
                        size="sm"
                        variant={integration.status === 'completed' ? 'default' : 'outline'}
                        onClick={() => runDemo(integration.id)}
                        disabled={activeDemo === integration.id}
                      >
                        {activeDemo === integration.id ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Procesando...
                          </>
                        ) : integration.status === 'completed' ? (
                          <>
                            Ver Demo
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            Simular
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {activeDemo === integration.id && (
                      <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          Procesando integración... {Math.round(progress)}%
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Panel de Arquitectura */}
      <Card>
        <CardHeader>
          <CardTitle>Arquitectura de Integración</CardTitle>
          <CardDescription>
            Cómo funciona el sistema de integraciones automáticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-3">
                <Building className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Módulos Operativos</h3>
              <p className="text-sm text-muted-foreground">
                Cada módulo gestiona sus procesos específicos (HR, Concesiones, Eventos, etc.)
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-3">
                <ArrowRight className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Integración Automática</h3>
              <p className="text-sm text-muted-foreground">
                Los datos fluyen automáticamente hacia el módulo financiero sin intervención manual
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-lg mb-3">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Módulo Financiero</h3>
              <p className="text-sm text-muted-foreground">
                Recibe y organiza automáticamente todos los ingresos y egresos con trazabilidad completa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}