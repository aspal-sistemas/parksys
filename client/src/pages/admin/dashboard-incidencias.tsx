import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Activity, TrendingUp } from 'lucide-react';

const DashboardRedirect = () => {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Redirigir automáticamente al dashboard después de un breve retraso
    const timer = setTimeout(() => {
      setLocation('/admin/incidents/dashboard');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [setLocation]);

  // Función para ir directamente al dashboard
  const goToDashboard = () => {
    setLocation('/admin/incidents/dashboard');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Dashboard de Incidencias</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-800">Estadísticas en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                El dashboard le permite visualizar estadísticas importantes sobre las incidencias reportadas 
                en todos los parques, incluyendo:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <span>Distribución de incidencias por categoría</span>
                </li>
                <li className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span>Estado actual de las incidencias</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Comparativas mensuales</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Tendencias y análisis predictivo</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-green-800">Acceso al Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Usted será redirigido automáticamente al dashboard en unos segundos. Si la redirección 
                no funciona, puede usar el botón a continuación.
              </p>
              
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={goToDashboard}
                  className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold px-8 py-6 h-auto border-2 border-red-800"
                  size="lg"
                >
                  <BarChart className="h-6 w-6 mr-2" />
                  ACCEDER AL DASHBOARD AHORA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-gray-600">
          <p>Si tiene problemas para acceder al dashboard, puede intentar la URL directa:</p>
          <code className="bg-gray-100 p-2 rounded mt-2 inline-block">
            /admin/incidents/dashboard
          </code>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardRedirect;