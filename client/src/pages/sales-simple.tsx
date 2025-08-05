import React, { useState } from 'react';
import { Check, Star, Users, MapPin, Building, Zap, Shield, Headphones, TreeDeciduous, BarChart3, Globe, Award, Sparkles, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SalesPage = () => {
  const [selectedProduct, setSelectedProduct] = useState('municipal');

  const products = {
    municipal: {
      name: 'ParkSys Municipal',
      icon: Building,
      target: 'Gobiernos municipales con múltiples parques',
      description: 'La plataforma integral que transforma la gestión de parques municipales, conectando gobierno y ciudadanos en un ecosistema digital intuitivo.'
    },
    network: {
      name: 'ParkSys Network',
      icon: MapPin,
      target: 'Sistemas de parques grandes (15-20 parques)',
      description: 'Coordina y optimiza tu red de parques con inteligencia centralizada y operaciones distribuidas.'
    },
    pro: {
      name: 'ParkSys Pro',
      icon: Star,
      target: 'Parques individuales de gran escala',
      description: 'La solución definitiva para parques emblemáticos que buscan excelencia operacional y experiencia ciudadana superior.'
    }
  };

  const tiers = [
    {
      key: 'esencial',
      name: 'Esencial',
      price: 'Gratuito',
      period: '30 días',
      features: ['Dashboard básico', 'Hasta 3 usuarios', 'Configuración básica', 'Soporte por email']
    },
    {
      key: 'profesional',
      name: 'Profesional',
      price: '$18,000 - $25,000',
      period: 'MXN/mes',
      features: ['Configuración completa', 'Gestión operativa completa', 'Marketing y comunicación', 'Usuarios ilimitados', 'Soporte email + chat']
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      price: '$35,000 - $50,000',
      period: 'MXN/mes',
      features: ['Todo lo de Profesional', 'Operación y mantenimiento', 'Administración y finanzas', 'Recursos humanos', 'Seguridad avanzada', 'Soporte prioritario']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500 bg-opacity-20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500 bg-opacity-20 rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-40 right-1/4 w-16 h-16 bg-green-400 bg-opacity-20 rounded-full blur-xl animate-pulse delay-300"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full px-4 py-2 mb-8">
            <Award className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-sm font-medium">Certificado por organismos gubernamentales</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              El futuro de la
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
              gestión urbana
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Plataforma integral que transforma municipios completos con tecnología de vanguardia, 
            conectando gobierno y ciudadanos en un ecosistema digital inteligente
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-400">500+</div>
              <div className="text-sm text-gray-400">Parques gestionados</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-400">50+</div>
              <div className="text-sm text-gray-400">Municipios activos</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-400">2M+</div>
              <div className="text-sm text-gray-400">Ciudadanos conectados</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-6 mb-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Elige tu solución:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(products).map(([key, product]) => {
                const IconComponent = product.icon;
                return (
                  <button
                    key={key}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedProduct === key 
                        ? 'bg-green-600 border-green-600 shadow-lg' 
                        : 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-white hover:bg-opacity-10 hover:border-white hover:border-opacity-30'
                    }`}
                    onClick={() => setSelectedProduct(key)}
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className="w-8 h-8" />
                      <span className="ml-2 font-semibold">{product.name}</span>
                    </div>
                    <p className="text-sm text-gray-300">{product.target}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300">
              <Sparkles className="mr-2 w-5 h-5" />
              Prueba gratuita 30 días
            </Button>
            <Button size="lg" variant="outline" className="border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
              <PlayCircle className="mr-2 w-5 h-5" />
              Ver demo en vivo
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-sm">Usado por:</div>
            <div className="text-sm font-medium">Guadalajara</div>
            <div className="text-sm font-medium">Tlaquepaque</div>
            <div className="text-sm font-medium">Zapopan</div>
            <div className="text-sm font-medium">Tonalá</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Inversión inteligente para {products[selectedProduct].name}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planes diseñados para escalar con tu crecimiento. Comienza gratis y evoluciona según tus necesidades.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-500 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-600 via-opacity-5 to-transparent rounded-3xl blur-3xl"></div>
            
            {tiers.map((tier, index) => (
              <div key={tier.key} className={`relative group ${tier.key === 'profesional' ? 'transform scale-105 z-10' : ''}`}>
                <div className={`h-full rounded-3xl border-2 transition-all duration-300 ${
                  tier.key === 'profesional' 
                    ? 'bg-gradient-to-b from-green-600 to-green-500 border-transparent shadow-2xl' 
                    : 'bg-white border-gray-200 hover:border-green-600 hover:border-opacity-30 shadow-lg hover:shadow-xl'
                } group-hover:transform group-hover:scale-105`}>
                  
                  {tier.key === 'profesional' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Más popular
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-8 ${tier.key === 'profesional' ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                      tier.key === 'profesional' 
                        ? 'bg-white bg-opacity-20 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-green-600 to-green-500'
                    }`}>
                      {tier.key === 'esencial' && <TreeDeciduous className="w-8 h-8 text-white" />}
                      {tier.key === 'profesional' && <Building className="w-8 h-8 text-white" />}
                      {tier.key === 'enterprise' && <Star className="w-8 h-8 text-white" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-center mb-2">{tier.name}</h3>
                    
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold mb-1">{tier.price}</div>
                      {tier.period && (
                        <div className={`text-sm ${tier.key === 'profesional' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                          /{tier.period}
                        </div>
                      )}
                      {tier.key !== 'esencial' && (
                        <div className={`text-sm mt-2 ${tier.key === 'profesional' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                          💰 20% descuento anual
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                            tier.key === 'profesional' 
                              ? 'bg-white bg-opacity-20' 
                              : 'bg-green-600'
                          }`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className={`text-sm font-medium ${tier.key === 'profesional' ? 'text-white text-opacity-90' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-3 font-semibold transition-all duration-300 ${
                        tier.key === 'profesional' 
                          ? 'bg-white text-green-600 hover:bg-gray-100 shadow-lg' 
                          : tier.key === 'enterprise'
                          ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-lg'
                          : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                      }`}
                      variant={tier.key === 'profesional' ? "default" : "outline"}
                    >
                      {tier.key === 'esencial' ? '🚀 Comenzar prueba' : '📞 Contactar ventas'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 max-w-2xl mx-auto">
              💡 <strong>Garantía de precio:</strong> Si encuentras una solución similar a menor costo, 
              igualamos el precio y te damos un 10% adicional de descuento.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir ParkSys?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Implementación rápida</h3>
              <p className="text-gray-600">
                Configuración en menos de 24 horas con datos de muestra incluidos y capacitación inicial
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Cumplimiento con estándares gubernamentales y protección de datos ciudadanos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Soporte especializado</h3>
              <p className="text-gray-600">
                Equipo dedicado con experiencia en gestión pública y sistemas municipales
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
          <p className="text-xl mb-8 opacity-90">
            Comienza tu prueba gratuita de 30 días y descubre cómo ParkSys puede revolucionar tu operación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              <Sparkles className="mr-2 w-5 h-5" />
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
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