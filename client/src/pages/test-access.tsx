import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

const TestAccess: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirigir automáticamente al login después de 2 segundos
    const timer = setTimeout(() => {
      setLocation('/admin/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Acceso al Sistema
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Redirecting to login...
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
            <div className="mt-6 space-y-2 text-left">
              <p className="text-sm text-gray-700">
                <strong>Usuario:</strong> Luis
              </p>
              <p className="text-sm text-gray-700">
                <strong>Contraseña:</strong> temp123
              </p>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setLocation('/admin/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ir al Login Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAccess;