import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Save,
  Copy,
  BarChart3,
  Target,
  Zap,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminLayout from "@/components/AdminLayout";

interface ActivityTemplate {
  id: number;
  name: string;
  category: string;
  data: {
    title: string;
    audience: string;
    location: string;
    duration: string;
    minCapacity: string;
    maxCapacity: string;
    feePerPerson: string;
    tutorCost: string;
    materialsCost: string;
    variableCosts: string;
    indirectCosts: string;
  };
}

interface ComparisonData {
  activity: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  breakeven: number;
}

const AdvancedCalculator = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [templateName, setTemplateName] = useState("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  // Plantillas predefinidas
  const [templates, setTemplates] = useState<ActivityTemplate[]>([
    {
      id: 1,
      name: "Clase de Yoga Matutina",
      category: "Deportivo",
      data: {
        title: "Yoga Matutino",
        audience: "Adultos",
        location: "Área verde",
        duration: "60",
        minCapacity: "8",
        maxCapacity: "20",
        feePerPerson: "150",
        tutorCost: "800",
        materialsCost: "200",
        variableCosts: "50",
        indirectCosts: "300"
      }
    },
    {
      id: 2,
      name: "Taller de Arte Infantil",
      category: "Cultural",
      data: {
        title: "Taller de Pintura",
        audience: "Niños",
        location: "Salón multiusos",
        duration: "90",
        minCapacity: "6",
        maxCapacity: "15",
        feePerPerson: "200",
        tutorCost: "1000",
        materialsCost: "400",
        variableCosts: "75",
        indirectCosts: "250"
      }
    },
    {
      id: 3,
      name: "Clase de Aqua Aeróbicos",
      category: "Deportivo",
      data: {
        title: "Aqua Aeróbicos",
        audience: "Adultos mayores",
        location: "Alberca",
        duration: "45",
        minCapacity: "10",
        maxCapacity: "25",
        feePerPerson: "180",
        tutorCost: "900",
        materialsCost: "150",
        variableCosts: "40",
        indirectCosts: "400"
      }
    }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    audience: "",
    location: "",
    duration: "",
    minCapacity: "",
    maxCapacity: "",
    feePerPerson: "",
    tutorCost: "",
    materialsCost: "",
    variableCosts: "",
    indirectCosts: ""
  });

  const [priceOptimizer, setPriceOptimizer] = useState({
    currentPrice: 150,
    minPrice: 100,
    maxPrice: 300,
    priceStep: 25
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Cálculos básicos
  const calculateMetrics = (data: any) => {
    const minCapacity = parseInt(data.minCapacity) || 0;
    const maxCapacity = parseInt(data.maxCapacity) || 0;
    const feePerPerson = parseFloat(data.feePerPerson) || 0;
    const tutorCost = parseFloat(data.tutorCost) || 0;
    const materialsCost = parseFloat(data.materialsCost) || 0;
    const variableCosts = parseFloat(data.variableCosts) || 0;
    const indirectCosts = parseFloat(data.indirectCosts) || 0;

    const minRevenue = minCapacity * feePerPerson;
    const maxRevenue = maxCapacity * feePerPerson;
    
    const fixedCosts = tutorCost + materialsCost + indirectCosts;
    const minTotalCosts = fixedCosts + (minCapacity * variableCosts);
    const maxTotalCosts = fixedCosts + (maxCapacity * variableCosts);
    
    const minProfit = minRevenue - minTotalCosts;
    const maxProfit = maxRevenue - maxTotalCosts;
    
    const breakeven = Math.ceil(fixedCosts / (feePerPerson - variableCosts));
    
    const minMargin = minRevenue > 0 ? (minProfit / minRevenue) * 100 : 0;
    const maxMargin = maxRevenue > 0 ? (maxProfit / maxRevenue) * 100 : 0;

    return {
      minRevenue,
      maxRevenue,
      minTotalCosts,
      maxTotalCosts,
      minProfit,
      maxProfit,
      breakeven,
      minMargin,
      maxMargin,
      fixedCosts
    };
  };

  const metrics = calculateMetrics(formData);

  // Datos para optimización de precios
  const generatePriceAnalysis = () => {
    const analysis = [];
    for (let price = priceOptimizer.minPrice; price <= priceOptimizer.maxPrice; price += priceOptimizer.priceStep) {
      const capacity = parseInt(formData.maxCapacity) || 20;
      const revenue = capacity * price;
      const costs = metrics.fixedCosts + (capacity * (parseFloat(formData.variableCosts) || 0));
      const profit = revenue - costs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      analysis.push({
        price,
        revenue,
        profit,
        margin: Math.round(margin * 100) / 100,
        participants: capacity
      });
    }
    return analysis;
  };

  const priceAnalysisData = generatePriceAnalysis();

  // Datos para comparación de actividades
  const comparisonData: ComparisonData[] = templates.map(template => {
    const templateMetrics = calculateMetrics(template.data);
    return {
      activity: template.name,
      revenue: templateMetrics.maxRevenue,
      costs: templateMetrics.maxTotalCosts,
      profit: templateMetrics.maxProfit,
      margin: templateMetrics.maxMargin,
      breakeven: templateMetrics.breakeven
    };
  });

  // Simulador de escenarios
  const scenarioAnalysis = [
    {
      scenario: "Pesimista",
      occupancy: 60,
      price: parseFloat(formData.feePerPerson) * 0.9,
      costs: metrics.fixedCosts * 1.1,
      color: "#ef4444"
    },
    {
      scenario: "Realista",
      occupancy: 80,
      price: parseFloat(formData.feePerPerson),
      costs: metrics.fixedCosts,
      color: "#f59e0b"
    },
    {
      scenario: "Optimista",
      occupancy: 95,
      price: parseFloat(formData.feePerPerson) * 1.1,
      costs: metrics.fixedCosts * 0.95,
      color: "#22c55e"
    }
  ].map(scenario => {
    const capacity = Math.round((parseInt(formData.maxCapacity) || 20) * (scenario.occupancy / 100));
    const revenue = capacity * scenario.price;
    const totalCosts = scenario.costs + (capacity * (parseFloat(formData.variableCosts) || 0));
    const profit = revenue - totalCosts;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      ...scenario,
      capacity,
      revenue,
      totalCosts,
      profit,
      margin
    };
  });

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setFormData(template.data);
      setSelectedTemplate("");
    }
  };

  const saveAsTemplate = () => {
    if (templateName.trim()) {
      const newTemplate: ActivityTemplate = {
        id: templates.length + 1,
        name: templateName,
        category: "Personalizado",
        data: { ...formData }
      };
      setTemplates([...templates, newTemplate]);
      setTemplateName("");
      setIsTemplateDialogOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-8 h-8 text-black" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Calculadora Avanzada
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Herramienta para calcular rentabilidad y costos de actividades
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedTemplate} onValueChange={loadTemplate}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Cargar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Guardar como Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar Plantilla</DialogTitle>
                      <DialogDescription>
                        Guarda la configuración actual como plantilla reutilizable
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="templateName">Nombre de la plantilla</Label>
                        <Input
                          id="templateName"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Ej: Clase de Zumba Nocturna"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveAsTemplate}>
                          Guardar Plantilla
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="optimizer">Optimizador</TabsTrigger>
            <TabsTrigger value="comparison">Comparador</TabsTrigger>
            <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la Actividad</CardTitle>
                  <CardDescription>
                    Ingresa los detalles básicos y costos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título de la Actividad</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ej: Clase de Yoga"
                      />
                    </div>
                    <div>
                      <Label htmlFor="audience">Audiencia</Label>
                      <Select value={formData.audience} onValueChange={(value) => setFormData({...formData, audience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Niños">Niños</SelectItem>
                          <SelectItem value="Jóvenes">Jóvenes</SelectItem>
                          <SelectItem value="Adultos">Adultos</SelectItem>
                          <SelectItem value="Adultos mayores">Adultos mayores</SelectItem>
                          <SelectItem value="Familias">Familias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Ej: Área verde"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duración (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minCapacity">Capacidad Mínima</Label>
                      <Input
                        id="minCapacity"
                        type="number"
                        value={formData.minCapacity}
                        onChange={(e) => setFormData({...formData, minCapacity: e.target.value})}
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feePerPerson">Tarifa por Persona</Label>
                      <Input
                        id="feePerPerson"
                        type="number"
                        value={formData.feePerPerson}
                        onChange={(e) => setFormData({...formData, feePerPerson: e.target.value})}
                        placeholder="150"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tutorCost">Costo del Instructor</Label>
                      <Input
                        id="tutorCost"
                        type="number"
                        value={formData.tutorCost}
                        onChange={(e) => setFormData({...formData, tutorCost: e.target.value})}
                        placeholder="800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="materialsCost">Materiales</Label>
                      <Input
                        id="materialsCost"
                        type="number"
                        value={formData.materialsCost}
                        onChange={(e) => setFormData({...formData, materialsCost: e.target.value})}
                        placeholder="200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="variableCosts">Costos Variables (por persona)</Label>
                      <Input
                        id="variableCosts"
                        type="number"
                        value={formData.variableCosts}
                        onChange={(e) => setFormData({...formData, variableCosts: e.target.value})}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="indirectCosts">Costos Indirectos</Label>
                      <Input
                        id="indirectCosts"
                        type="number"
                        value={formData.indirectCosts}
                        onChange={(e) => setFormData({...formData, indirectCosts: e.target.value})}
                        placeholder="300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Resultados</CardTitle>
                  <CardDescription>
                    Métricas clave de rentabilidad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Ingresos Máximos
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(metrics.maxRevenue)}
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                        <TrendingDown className="h-4 w-4" />
                        Costos Máximos
                      </div>
                      <div className="text-2xl font-bold text-red-900">
                        {formatCurrency(metrics.maxTotalCosts)}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                        <DollarSign className="h-4 w-4" />
                        Ganancia Máxima
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(metrics.maxProfit)}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-800 font-medium mb-1">
                        <Target className="h-4 w-4" />
                        Punto de Equilibrio
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {metrics.breakeven} personas
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Margen de Ganancia</span>
                      <span>{metrics.maxMargin.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, metrics.maxMargin))} className="h-3" />
                    <div className="text-xs text-gray-500 mt-1">
                      {metrics.maxMargin >= 30 ? "Excelente rentabilidad" : 
                       metrics.maxMargin >= 15 ? "Rentabilidad moderada" : 
                       "Rentabilidad baja"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rango de Ganancia:</span>
                      <span>{formatCurrency(metrics.minProfit)} - {formatCurrency(metrics.maxProfit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Margen Mínimo:</span>
                      <span>{metrics.minMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Costos Fijos:</span>
                      <span>{formatCurrency(metrics.fixedCosts)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimizer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimizador de Precios</CardTitle>
                  <CardDescription>
                    Encuentra el precio óptimo para maximizar ganancias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice">Precio Mínimo</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        value={priceOptimizer.minPrice}
                        onChange={(e) => setPriceOptimizer({...priceOptimizer, minPrice: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice">Precio Máximo</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        value={priceOptimizer.maxPrice}
                        onChange={(e) => setPriceOptimizer({...priceOptimizer, maxPrice: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recomendaciones de Precio</h4>
                    {priceAnalysisData
                      .sort((a, b) => b.profit - a.profit)
                      .slice(0, 3)
                      .map((data, index) => (
                        <div key={data.price} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{formatCurrency(data.price)}</span>
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? "Óptimo" : `Top ${index + 1}`}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Ganancia: {formatCurrency(data.profit)} | Margen: {data.margin}%
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Sensibilidad</CardTitle>
                  <CardDescription>
                    Impacto del precio en la rentabilidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="price" tickFormatter={(value) => `$${value}`} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Ingresos" />
                      <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Ganancia" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Comparador de Actividades</CardTitle>
                <CardDescription>
                  Compara la rentabilidad entre diferentes actividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activity" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" />
                    <Bar dataKey="costs" fill="#ff7c7c" name="Costos" />
                    <Bar dataKey="profit" fill="#82ca9d" name="Ganancia" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Ranking de Rentabilidad</h4>
                  {comparisonData
                    .sort((a, b) => b.margin - a.margin)
                    .map((activity, index) => (
                      <div key={activity.activity} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{activity.activity}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{activity.margin.toFixed(1)}% margen</div>
                          <div className="text-xs text-gray-600">{formatCurrency(activity.profit)} ganancia</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card>
              <CardHeader>
                <CardTitle>Simulador de Escenarios</CardTitle>
                <CardDescription>
                  Analiza diferentes escenarios de ocupación y precios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scenarioAnalysis.map((scenario) => (
                    <div key={scenario.scenario} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: scenario.color }}
                        />
                        <h3 className="font-medium">{scenario.scenario}</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Ocupación:</span>
                          <span>{scenario.occupancy}% ({scenario.capacity} personas)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Precio:</span>
                          <span>{formatCurrency(scenario.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ingresos:</span>
                          <span>{formatCurrency(scenario.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Costos:</span>
                          <span>{formatCurrency(scenario.totalCosts)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-medium">
                          <span>Ganancia:</span>
                          <span className={scenario.profit > 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(scenario.profit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Margen:</span>
                          <span>{scenario.margin.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Plantillas</CardTitle>
                <CardDescription>
                  Administra tus plantillas guardadas de actividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>Audiencia: {template.data.audience}</div>
                        <div>Capacidad: {template.data.minCapacity}-{template.data.maxCapacity}</div>
                        <div>Precio: {formatCurrency(parseFloat(template.data.feePerPerson))}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => loadTemplate(template.id.toString())}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdvancedCalculator;