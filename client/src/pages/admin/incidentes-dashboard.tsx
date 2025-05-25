import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';
import { useLocation } from 'wouter';

export default function IncidentesDashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect después de 3 segundos
    const timer = setTimeout(() => {
      setLocation('/admin/incidents/dashboard');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleGoToDashboard = () => {
    setLocation('/admin/incidents/dashboard');
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto py-20">
          <div className="max-w-3xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg border border-blue-100">
            <h1 className="text-3xl font-bold mb-6 text-blue-800">
              Dashboard de Incidencias
            </h1>
            
            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                Accede a las estadísticas y métricas completas de las incidencias del sistema.
              </p>
              <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
            </div>
            
            <div className="mt-12">
              <Button 
                onClick={handleGoToDashboard}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-6 h-auto text-lg font-medium"
              >
                <BarChart className="h-6 w-6 mr-3" />
                Ir al Dashboard
              </Button>
              
              <p className="text-sm text-gray-500 mt-6">
                Serás redirigido automáticamente al dashboard en 3 segundos...
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}