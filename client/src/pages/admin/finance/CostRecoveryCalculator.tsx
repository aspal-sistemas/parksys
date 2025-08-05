import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Users,
  Clock,
  Target
} from "lucide-react";

interface CalculatorData {
  // Detalles del Programa
  title: string;
  concept: string;
  audience: string;
  location: string;
  durationPerClass: number;
  classesPerMonth: number;
  minCapacity: number;
  maxCapacity: number;
  feePerPerson: number;
  
  // Costos Directos
  instructorCost: number;
  materialsCost: number;
  variableCostPerPerson: number;
  amenityCost: number;
  otherDirectCosts: number;
  
  // Costos Indirectos
  indirect1: number;
  indirect2: number;
  indirect3: number;
  otherIndirectCosts: number;
  
  // Margen deseado
  desiredMarginPercentage: number;
}

const CostRecoveryCalculator = () => {
  const [data, setData] = useState<CalculatorData>({
    title: "Summer Kids",
    concept: "Entretenimiento",
    audience: "0-5 y 6-12 años",
    location: "PGB",
    durationPerClass: 8,
    classesPerMonth: 20,
    minCapacity: 10,
    maxCapacity: 30,
    feePerPerson: 75,
    instructorCost: 150,
    materialsCost: 50,
    variableCostPerPerson: 10,
    amenityCost: 0,
    otherDirectCosts: 0,
    indirect1: 0,
    indirect2: 0,
    indirect3: 0,
    otherIndirectCosts: 0,
    desiredMarginPercentage: 60
  });

  // Cálculos automáticos
  const [calculations, setCalculations] = useState({
    // Por Clase - Mínimo
    minNetIncomePerClass: 0,
    minTotalCostsPerClass: 0,
    minGrossProfitPerClass: 0,
    
    // Por Clase - Máximo
    maxNetIncomePerClass: 0,
    maxTotalCostsPerClass: 0,
    maxGrossProfitPerClass: 0,
    
    // Por Mes
    minMonthlyIncome: 0,
    maxMonthlyIncome: 0,
    monthlyTotalCosts: 0,
    minMonthlyGrossProfit: 0,
    maxMonthlyGrossProfit: 0,
    
    // Indicadores
    minGrossMargin: 0,
    maxGrossMargin: 0,
    instructorCostPercentageMin: 0,
    instructorCostPercentageMax: 0,
    totalCostPercentageMin: 0,
    totalCostPercentageMax: 0,
    breakEvenPoint: 0,
    
    // Cumplimiento
    minMeetsExpectations: false,
    maxMeetsExpectations: false
  });

  useEffect(() => {
    // Costos por clase
    const totalDirectCosts = data.instructorCost + data.materialsCost + data.amenityCost + data.otherDirectCosts;
    const totalIndirectCosts = data.indirect1 + data.indirect2 + data.indirect3 + data.otherIndirectCosts;
    
    // Ingresos netos por clase
    const minNetIncomePerClass = data.minCapacity * data.feePerPerson;
    const maxNetIncomePerClass = data.maxCapacity * data.feePerPerson;
    
    // Costos totales por clase (fijos + variables por persona)
    const minTotalCostsPerClass = totalDirectCosts + totalIndirectCosts + (data.variableCostPerPerson * data.minCapacity);
    const maxTotalCostsPerClass = totalDirectCosts + totalIndirectCosts + (data.variableCostPerPerson * data.maxCapacity);
    
    // Utilidad bruta por clase
    const minGrossProfitPerClass = minNetIncomePerClass - minTotalCostsPerClass;
    const maxGrossProfitPerClass = maxNetIncomePerClass - maxTotalCostsPerClass;
    
    // Por mes
    const minMonthlyIncome = minNetIncomePerClass * data.classesPerMonth;
    const maxMonthlyIncome = maxNetIncomePerClass * data.classesPerMonth;
    const monthlyTotalCosts = minTotalCostsPerClass * data.classesPerMonth; // Costos fijos son los mismos
    const minMonthlyGrossProfit = minGrossProfitPerClass * data.classesPerMonth;
    const maxMonthlyGrossProfit = maxGrossProfitPerClass * data.classesPerMonth;
    
    // Márgenes
    const minGrossMargin = minNetIncomePerClass > 0 ? (minGrossProfitPerClass / minNetIncomePerClass) * 100 : 0;
    const maxGrossMargin = maxNetIncomePerClass > 0 ? (maxGrossProfitPerClass / maxNetIncomePerClass) * 100 : 0;
    
    // Porcentajes de costos
    const instructorCostPercentageMin = minNetIncomePerClass > 0 ? (data.instructorCost / minNetIncomePerClass) * 100 : 0;
    const instructorCostPercentageMax = maxNetIncomePerClass > 0 ? (data.instructorCost / maxNetIncomePerClass) * 100 : 0;
    const totalCostPercentageMin = minNetIncomePerClass > 0 ? (minTotalCostsPerClass / minNetIncomePerClass) * 100 : 0;
    const totalCostPercentageMax = maxNetIncomePerClass > 0 ? (maxTotalCostsPerClass / maxNetIncomePerClass) * 100 : 0;
    
    // Punto de equilibrio
    const fixedCosts = totalDirectCosts + totalIndirectCosts;
    const contributionMarginPerPerson = data.feePerPerson - data.variableCostPerPerson;
    const breakEvenPoint = contributionMarginPerPerson > 0 ? fixedCosts / contributionMarginPerPerson : 0;
    
    // Cumplimiento de expectativas (basado en margen deseado)
    const minMeetsExpectations = minGrossMargin >= data.desiredMarginPercentage;
    const maxMeetsExpectations = maxGrossMargin >= data.desiredMarginPercentage;

    setCalculations({
      minNetIncomePerClass,
      minTotalCostsPerClass,
      minGrossProfitPerClass,
      maxNetIncomePerClass,
      maxTotalCostsPerClass,
      maxGrossProfitPerClass,
      minMonthlyIncome,
      maxMonthlyIncome,
      monthlyTotalCosts,
      minMonthlyGrossProfit,
      maxMonthlyGrossProfit,
      minGrossMargin,
      maxGrossMargin,
      instructorCostPercentageMin,
      instructorCostPercentageMax,
      totalCostPercentageMin,
      totalCostPercentageMax,
      breakEvenPoint,
      minMeetsExpectations,
      maxMeetsExpectations
    });
  }, [data]);

  const updateField = (field: keyof CalculatorData, value: string | number) => {
    setData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calculadora de Recuperación de Costos
          </h1>
          <p className="text-gray-600">
            Calcula el punto de equilibrio y rentabilidad por actividad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Datos de Entrada */}
        <div className="space-y-6">
          {/* Detalles del Programa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Detalles del Programa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="concept">Concepto</Label>
                  <Input
                    id="concept"
                    value={data.concept}
                    onChange={(e) => updateField('concept', e.target.value)}
                    placeholder="Ej: Entretenimiento"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Título de la Actividad</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ej: Summer Kids"
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Público</Label>
                  <Input
                    id="audience"
                    value={data.audience}
                    onChange={(e) => updateField('audience', e.target.value)}
                    placeholder="Ej: 0-5 y 6-12 años"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Ej: PGB"
                  />
                </div>
                <div>
                  <Label htmlFor="durationPerClass">Duración por Clase (hrs)</Label>
                  <Input
                    id="durationPerClass"
                    type="number"
                    value={data.durationPerClass}
                    onChange={(e) => updateField('durationPerClass', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="classesPerMonth">Clases al Mes</Label>
                  <Input
                    id="classesPerMonth"
                    type="number"
                    value={data.classesPerMonth}
                    onChange={(e) => updateField('classesPerMonth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="minCapacity">Aforo Mínimo</Label>
                  <Input
                    id="minCapacity"
                    type="number"
                    value={data.minCapacity}
                    onChange={(e) => updateField('minCapacity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxCapacity">Aforo Máximo</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={data.maxCapacity}
                    onChange={(e) => updateField('maxCapacity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="feePerPerson">Cuota por Persona por Clase</Label>
                  <Input
                    id="feePerPerson"
                    type="number"
                    step="0.01"
                    value={data.feePerPerson}
                    onChange={(e) => updateField('feePerPerson', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costos Directos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Costos Directos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructorCost">Tutor</Label>
                  <Input
                    id="instructorCost"
                    type="number"
                    step="0.01"
                    value={data.instructorCost}
                    onChange={(e) => updateField('instructorCost', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="materialsCost">Materiales</Label>
                  <Input
                    id="materialsCost"
                    type="number"
                    step="0.01"
                    value={data.materialsCost}
                    onChange={(e) => updateField('materialsCost', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="variableCostPerPerson">Costo Variable por Persona</Label>
                  <Input
                    id="variableCostPerPerson"
                    type="number"
                    step="0.01"
                    value={data.variableCostPerPerson}
                    onChange={(e) => updateField('variableCostPerPerson', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="amenityCost">Costo de la Amenidad</Label>
                  <Input
                    id="amenityCost"
                    type="number"
                    step="0.01"
                    value={data.amenityCost}
                    onChange={(e) => updateField('amenityCost', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="otherDirectCosts">Otros Costos Directos</Label>
                  <Input
                    id="otherDirectCosts"
                    type="number"
                    step="0.01"
                    value={data.otherDirectCosts}
                    onChange={(e) => updateField('otherDirectCosts', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costos Indirectos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Costos Indirectos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="indirect1">Indirecto 1</Label>
                  <Input
                    id="indirect1"
                    type="number"
                    step="0.01"
                    value={data.indirect1}
                    onChange={(e) => updateField('indirect1', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="indirect2">Indirecto 2</Label>
                  <Input
                    id="indirect2"
                    type="number"
                    step="0.01"
                    value={data.indirect2}
                    onChange={(e) => updateField('indirect2', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="indirect3">Indirecto 3</Label>
                  <Input
                    id="indirect3"
                    type="number"
                    step="0.01"
                    value={data.indirect3}
                    onChange={(e) => updateField('indirect3', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="otherIndirectCosts">Otros</Label>
                  <Input
                    id="otherIndirectCosts"
                    type="number"
                    step="0.01"
                    value={data.otherIndirectCosts}
                    onChange={(e) => updateField('otherIndirectCosts', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="desiredMarginPercentage">Margen de Utilidad Deseado (%)</Label>
                  <Input
                    id="desiredMarginPercentage"
                    type="number"
                    step="0.1"
                    value={data.desiredMarginPercentage}
                    onChange={(e) => updateField('desiredMarginPercentage', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          {/* Rentabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rentabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">POR CLASE</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div></div>
                  <div className="font-medium text-center">Mínimo</div>
                  <div className="font-medium text-center">Máximo</div>
                  
                  <div className="text-gray-600">Ingresos Netos</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.minNetIncomePerClass)}</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.maxNetIncomePerClass)}</div>
                  
                  <div className="text-gray-600">Costos Totales</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.minTotalCostsPerClass)}</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.maxTotalCostsPerClass)}</div>
                  
                  <div className="text-gray-600">Utilidad Bruta</div>
                  <div className={`text-center font-mono ${calculations.minGrossProfitPerClass >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.minGrossProfitPerClass)}
                  </div>
                  <div className={`text-center font-mono ${calculations.maxGrossProfitPerClass >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.maxGrossProfitPerClass)}
                  </div>
                </div>

                <Separator />

                <div className="text-sm font-medium text-gray-700">POR MES</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div></div>
                  <div className="font-medium text-center">Aforo Mínimo</div>
                  <div className="font-medium text-center">Aforo Máximo</div>
                  
                  <div className="text-gray-600">Ingresos Aforo</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.minMonthlyIncome)}</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.maxMonthlyIncome)}</div>
                  
                  <div className="text-gray-600">Costos Totales</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.monthlyTotalCosts)}</div>
                  <div className="text-center font-mono">{formatCurrency(calculations.monthlyTotalCosts)}</div>
                  
                  <div className="text-gray-600">Utilidad Bruta</div>
                  <div className={`text-center font-mono ${calculations.minMonthlyGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.minMonthlyGrossProfit)}
                  </div>
                  <div className={`text-center font-mono ${calculations.maxMonthlyGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.maxMonthlyGrossProfit)}
                  </div>
                  
                  <div className="text-gray-600">Margen de Utilidad</div>
                  <div className={`text-center font-mono ${calculations.minGrossMargin >= data.desiredMarginPercentage ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(calculations.minGrossMargin)}
                  </div>
                  <div className={`text-center font-mono ${calculations.maxGrossMargin >= data.desiredMarginPercentage ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(calculations.maxGrossMargin)}
                  </div>
                  
                  <div className="text-gray-600">¿Cumple expectativas?</div>
                  <div className="text-center">
                    {calculations.minMeetsExpectations ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Sí</Badge>
                    ) : (
                      <Badge variant="destructive">No</Badge>
                    )}
                  </div>
                  <div className="text-center">
                    {calculations.maxMeetsExpectations ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Sí</Badge>
                    ) : (
                      <Badge variant="destructive">No</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Otros Indicadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Otros Indicadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div></div>
                <div className="font-medium text-center">Mínimo</div>
                <div className="font-medium text-center">Máximo</div>
                
                <div className="text-gray-600">% Costo del Instructor</div>
                <div className="text-center font-mono">{formatPercentage(calculations.instructorCostPercentageMin)}</div>
                <div className="text-center font-mono">{formatPercentage(calculations.instructorCostPercentageMax)}</div>
                
                <div className="text-gray-600">% Costos Totales</div>
                <div className="text-center font-mono">{formatPercentage(calculations.totalCostPercentageMin)}</div>
                <div className="text-center font-mono">{formatPercentage(calculations.totalCostPercentageMax)}</div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Target className="h-4 w-4" />
                  Punto de Equilibrio
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {calculations.breakEvenPoint.toFixed(2)} personas por clase
                </div>
                <div className="text-blue-700 text-sm mt-1">
                  Número mínimo de participantes para no tener pérdidas
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen Ejecutivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Actividad:</span>
                  <span className="font-medium">{data.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Público objetivo:</span>
                  <span className="font-medium">{data.audience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cuota por persona:</span>
                  <span className="font-medium">{formatCurrency(data.feePerPerson)}</span>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {data.minCapacity}
                    </div>
                    <div className="text-sm text-gray-600">Aforo Mínimo</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {data.maxCapacity}
                    </div>
                    <div className="text-sm text-gray-600">Aforo Máximo</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${
                  calculations.maxMeetsExpectations 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {calculations.maxMeetsExpectations ? (
                    <div className="text-green-800">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <div className="font-medium">Actividad Rentable</div>
                      <div className="text-sm">Cumple el margen deseado del {data.desiredMarginPercentage}%</div>
                    </div>
                  ) : (
                    <div className="text-red-800">
                      <AlertCircle className="h-5 w-5 mx-auto mb-1" />
                      <div className="font-medium">Revisar Estructura</div>
                      <div className="text-sm">No alcanza el margen deseado del {data.desiredMarginPercentage}%</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostRecoveryCalculator;