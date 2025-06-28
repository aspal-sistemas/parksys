import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

function SafeApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              Agencia Metropolitana de Bosques Urbanos
            </h1>
            <h2 className="text-3xl font-semibold mb-4">
              Guadalajara, Jalisco
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Democratizamos la gestión profesional de parques urbanos mediante tecnología accesible
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-4">🌳</div>
                <h3 className="text-2xl font-semibold mb-4">Gestión Integral</h3>
                <p className="text-base opacity-90">
                  Sistema completo para administrar parques, actividades y recursos municipales
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-4">💻</div>
                <h3 className="text-2xl font-semibold mb-4">Tecnología Avanzada</h3>
                <p className="text-base opacity-90">
                  Herramientas modernas para optimizar la gestión municipal y ciudadana
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-4">🏛️</div>
                <h3 className="text-2xl font-semibold mb-4">Acceso Universal</h3>
                <p className="text-base opacity-90">
                  Plataforma accesible para todos los niveles de gobierno municipal
                </p>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm opacity-75">Parques Administrados</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm opacity-75">Ciudadanos Beneficiados</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-sm opacity-75">Actividades Anuales</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm opacity-75">Satisfacción Ciudadana</div>
              </div>
            </div>

            <div className="mt-12">
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-300 mr-4">
                Conocer Más
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-300">
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default SafeApp;