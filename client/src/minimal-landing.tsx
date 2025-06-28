import React from 'react';

export default function MinimalLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Agencia Metropolitana de Bosques Urbanos
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Democratizamos la gestión profesional de parques urbanos mediante tecnología accesible
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Gestión Integral</h3>
              <p>Sistema completo para administrar parques, actividades y recursos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Tecnología Avanzada</h3>
              <p>Herramientas modernas para optimizar la gestión municipal</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Acceso Universal</h3>
              <p>Plataforma accesible para todos los niveles de gobierno</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}