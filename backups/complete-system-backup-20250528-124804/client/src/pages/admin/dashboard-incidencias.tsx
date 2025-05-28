import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, AlertTriangle, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/**
 * Página dedicada para facilitar el acceso al dashboard de incidencias
 * Esta página proporciona un acceso claro y directo al dashboard de estadísticas
 */
const DashboardIncidenciasAccess = () => {
  const [_, setLocation] = useLocation();

  // Ir directamente al dashboard
  const goToDashboard = () => {
    setLocation("/admin/incidents/dashboard");
  };

  // Opción alternativa: redirigir automáticamente después de un breve retraso
  useEffect(() => {
    const timer = setTimeout(() => {
      goToDashboard();
    }, 1500); // Esperar 1.5 segundos antes de redirigir

    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Acceso al Dashboard de Incidencias
          </h1>
        </div>

        <div className="my-8 max-w-4xl mx-auto">
          <Card className="border-4 border-red-500 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-white to-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold flex items-center text-red-600">
                <AlertTriangle className="h-8 w-8 mr-2 animate-pulse" />
                Dashboard de Incidencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6 text-gray-700">
                Estamos redirigiendo automáticamente al panel de estadísticas de incidencias. 
                Si la redirección no funciona, haga clic en el botón a continuación.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-lg shadow-md hover:shadow-lg transition-all"
                  onClick={goToDashboard}
                >
                  <BarChart className="h-6 w-6 mr-2" />
                  <span>Ir al Dashboard</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
              
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-bold text-amber-800 mb-2">Información importante</h3>
                <p className="text-amber-700">
                  El dashboard le permite visualizar estadísticas detalladas sobre incidencias, 
                  incluyendo tendencias, categorías más comunes y tiempos de resolución.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <h3 className="font-bold text-blue-800 mb-2">Accesos alternativos</h3>
            <p className="text-blue-700 mb-4">
              También puede acceder al dashboard desde:
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-2">
              <li>El menú lateral: <span className="font-medium">Operaciones → Dashboard Incidencias</span></li>
              <li>La página principal de incidencias: <span className="font-medium">Incidencias → Botón "Dashboard"</span></li>
              <li>URL directa: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin/incidents/dashboard</span></li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardIncidenciasAccess;