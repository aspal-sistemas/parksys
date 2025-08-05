import React from 'react';
import { Check, Star, Building, MapPin, Sparkles, PlayCircle, Zap, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SalesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="block text-white">El futuro de la</span>
            <span className="block text-green-400">gestión urbana</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Plataforma integral que transforma municipios completos con tecnología de vanguardia
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">500+</div>
              <div className="text-sm text-gray-400">Parques gestionados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">50+</div>
              <div className="text-sm text-gray-400">Municipios activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">2M+</div>
              <div className="text-sm text-gray-400">Ciudadanos conectados</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold">
              <Sparkles className="mr-2 w-5 h-5" />
              Prueba gratuita 30 días
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold">
              <PlayCircle className="mr-2 w-5 h-5" />
              Ver demo en vivo
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Nuestros Productos</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">ParkSys Municipal</h3>
              <p className="text-gray-600 text-center mb-6">
                Para gobiernos municipales con múltiples parques
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/sales/municipal'}>
                Más información
              </Button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">ParkSys Network</h3>
              <p className="text-gray-600 text-center mb-6">
                Para sistemas de parques grandes (15-20 parques)
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/sales/network'}>
                Más información
              </Button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">ParkSys Pro</h3>
              <p className="text-gray-600 text-center mb-6">
                Para parques individuales de gran escala
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/sales/pro'}>
                Más información
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Planes y Precios</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-center mb-4">Esencial</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">Gratuito</div>
                <div className="text-gray-600">30 días</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Dashboard básico
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Hasta 3 usuarios
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Configuración básica
                </li>
              </ul>
              <Button className="w-full">Comenzar prueba</Button>
            </div>

            <div className="bg-green-600 text-white rounded-3xl p-8 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-bold">
                  Más popular
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Profesional</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">$18,000 - $25,000</div>
                <div className="text-green-100">MXN/mes</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  Configuración completa
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  Gestión operativa completa
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  Marketing y comunicación
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  Usuarios ilimitados
                </li>
              </ul>
              <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                Contactar ventas
              </Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-center mb-4">Enterprise</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">$35,000 - $50,000</div>
                <div className="text-gray-600">MXN/mes</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Todo lo de Profesional
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Operación y mantenimiento
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Administración y finanzas
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  Recursos humanos
                </li>
              </ul>
              <Button className="w-full">Contactar ventas</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir ParkSys?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Implementación rápida</h3>
              <p className="text-gray-600">
                Configuración en menos de 24 horas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Cumplimiento con estándares gubernamentales
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Soporte especializado</h3>
              <p className="text-gray-600">
                Equipo dedicado con experiencia municipal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-600 to-green-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para transformar la gestión de tus parques?
          </h2>
          <p className="text-xl mb-8">
            Comienza tu prueba gratuita de 30 días
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              <Sparkles className="mr-2 w-5 h-5" />
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold">
              <PlayCircle className="mr-2 w-5 h-5" />
              Solicitar demo personalizada
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesPage;