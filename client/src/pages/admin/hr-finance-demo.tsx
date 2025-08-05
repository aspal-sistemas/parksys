import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  TrendingDown, 
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function HRFinanceDemoPage() {
  const [showIntegration, setShowIntegration] = useState(false);

  // Datos de empleados (módulo HR)
  const employees = [
    {
      id: 1,
      name: "María Elena González Ruiz",
      position: "Coordinadora de Eventos",
      salary: 35000,
      bonus: 3500,
      overtime: 1800
    },
    {
      id: 2,
      name: "Carlos Alberto Mendoza López", 
      position: "Instructor de Deportes",
      salary: 28000,
      bonus: 2800,
      overtime: 1400
    },
    {
      id: 3,
      name: "Ana Patricia Flores Jiménez",
      position: "Jardinera Principal",
      salary: 25000,
      bonus: 2500,
      overtime: 1000
    }
  ];

  // Cálculo de nómina total
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalBonuses = employees.reduce((sum, emp) => sum + emp.bonus, 0);
  const totalOvertime = employees.reduce((sum, emp) => sum + emp.overtime, 0);
  const grandTotal = totalSalaries + totalBonuses + totalOvertime;

  // Gastos generados automáticamente en Finanzas
  const generatedExpenses = [
    {
      id: 9001,
      concept: "Nómina - Salarios Base",
      amount: totalSalaries,
      category: "Personal - Salarios",
      generated: true,
      reference: "NOM-2025-01-SAL"
    },
    {
      id: 9002,
      concept: "Nómina - Bonificaciones",
      amount: totalBonuses,
      category: "Personal - Bonos",
      generated: true,
      reference: "NOM-2025-01-BON"
    },
    {
      id: 9003,
      concept: "Nómina - Tiempo Extra",
      amount: totalOvertime,
      category: "Personal - Horas Extra",
      generated: true,
      reference: "NOM-2025-01-OVT"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Demostración: Integración HR-Finanzas
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Observa cómo los registros de nómina se reflejan automáticamente en el módulo de finanzas
          </p>
        </div>

        {/* Proceso de integración */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Paso 1: Módulo HR */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-blue-900">
                  1. Módulo HR - Nómina
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Empleados registrados y cálculo de nómina:
              </p>
              
              {employees.map((employee) => (
                <div key={employee.id} className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{employee.name}</h4>
                  <p className="text-xs text-blue-700">{employee.position}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Salario:</span>
                      <span className="font-medium">{formatCurrency(employee.salary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bono:</span>
                      <span className="font-medium">{formatCurrency(employee.bonus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>H. Extra:</span>
                      <span className="font-medium">{formatCurrency(employee.overtime)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                <div className="font-bold text-blue-900">Total Nómina</div>
                <div className="text-lg font-bold text-blue-800">
                  {formatCurrency(grandTotal)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paso 2: Integración */}
          <Card className="border-yellow-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-yellow-600" />
                <CardTitle className="text-yellow-900">
                  2. Integración Automática
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                El sistema genera automáticamente:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Categorías de gastos específicas</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mapeo automático de conceptos</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Trazabilidad completa</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Sincronización en tiempo real</span>
                </div>
              </div>

              <Button 
                onClick={() => setShowIntegration(true)}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={showIntegration}
              >
                {showIntegration ? "Integración Activada" : "Activar Integración"}
              </Button>
            </CardContent>
          </Card>

          {/* Paso 3: Módulo Finanzas */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-900">
                  3. Módulo Finanzas - Gastos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Gastos generados automáticamente:
              </p>
              
              {showIntegration ? (
                <div className="space-y-3">
                  {generatedExpenses.map((expense) => (
                    <div key={expense.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-green-900 text-sm">
                              {expense.concept}
                            </h4>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Nómina
                            </Badge>
                          </div>
                          <p className="text-xs text-green-700 mt-1">{expense.category}</p>
                          <p className="text-xs text-gray-500 mt-1">Ref: {expense.reference}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-800">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="text-xs text-green-600">Auto-generado</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-3 bg-green-100 rounded-lg border-2 border-green-300">
                    <div className="font-bold text-green-900">Total Gastos de Nómina</div>
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(grandTotal)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✓ Sincronizado con HR
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Los gastos aparecerán aquí automáticamente</p>
                  <p className="text-xs">una vez activada la integración</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Beneficios de la integración */}
        {showIntegration && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
            <CardHeader>
              <CardTitle className="text-center text-gray-900">
                🎯 Beneficios de la Integración HR-Finanzas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Sin Doble Captura</h3>
                  <p className="text-xs text-gray-600">Los datos se registran una sola vez en HR</p>
                </div>
                
                <div className="text-center p-4">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Datos Consistentes</h3>
                  <p className="text-xs text-gray-600">Los montos coinciden exactamente entre módulos</p>
                </div>
                
                <div className="text-center p-4">
                  <ArrowRight className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Trazabilidad Total</h3>
                  <p className="text-xs text-gray-600">Cada gasto tiene referencia a su período de nómina</p>
                </div>
                
                <div className="text-center p-4">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Tiempo Real</h3>
                  <p className="text-xs text-gray-600">Los cambios se reflejan inmediatamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enlaces a páginas reales */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/admin/hr/employees">
              Ver Módulo HR Real
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/admin/finance/expenses">
              Ver Módulo Finanzas Real
            </a>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}