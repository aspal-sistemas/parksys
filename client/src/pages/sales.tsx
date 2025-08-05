import React, { useState } from 'react';
import { Check, Star, Users, MapPin, Building, ArrowRight, Zap, Shield, Headphones, TreeDeciduous, BarChart3, Globe, Award, Sparkles, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SalesPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<'municipal' | 'network' | 'pro'>('municipal');

  const products = {
    municipal: {
      name: 'ParkSys Municipal',
      icon: <Building className="w-8 h-8" />,
      target: 'Gobiernos municipales con múltiples parques',
      description: 'La plataforma integral que transforma la gestión de parques municipales, conectando gobierno y ciudadanos en un ecosistema digital intuitivo.',
      features: [
        'Gestión centralizada de inventario completo de parques urbanos',
        'Portal ciudadano para consulta pública',
        'Escalabilidad para cientos de parques',
        'Integración con sistemas gubernamentales'
      ],
      useCases: ['Ayuntamientos con 20+ parques', 'Secretarías de Medio Ambiente', 'Direcciones de Parques y Jardines', 'Gobiernos metropolitanos']
    },
    network: {
      name: 'ParkSys Network',
      icon: <MapPin className="w-8 h-8" />,
      target: 'Sistemas de parques grandes (15-20 parques)',
      description: 'Coordina y optimiza tu red de parques con inteligencia centralizada y operaciones distribuidas.',
      features: [
        'Gestión especializada para redes de parques emblemáticos',
        'Capacidades avanzadas de coordinación entre ubicaciones',
        'Control distribuido con visión centralizada',
        'Ideal para organismos descentralizados'
      ],
      useCases: ['Fideicomisos de parques', 'Sistemas estatales de parques', 'Redes de parques temáticos', 'Organismos descentralizados']
    },
    pro: {
      name: 'ParkSys Pro',
      icon: <Star className="w-8 h-8" />,
      target: 'Parques individuales de gran escala',
      description: 'La solución definitiva para parques emblemáticos que buscan excelencia operacional y experiencia ciudadana superior.',
      features: [
        'Solución completa para un solo parque emblemático',
        'Máxima profundidad funcional',
        'Personalización extrema',
        'Soporte premium incluido'
      ],
      useCases: ['Parques metropolitanos', 'Parques temáticos', 'Bosques urbanos emblemáticos', 'Espacios culturales especializados']
    }
  };

  const tiers = {
    esencial: {
      name: 'Esencial',
      price: 'Gratuito',
      period: '30 días',
      features: [
        'Dashboard básico',
        'Hasta 3 usuarios',
        'Configuración básica',
        'Soporte por email'
      ]
    },
    profesional: {
      name: 'Profesional',
      price: '$18,000 - $25,000',
      period: 'MXN/mes',
      features: [
        'Configuración completa',
        'Gestión operativa completa',
        'Marketing y comunicación',
        'Usuarios ilimitados',
        'Soporte email + chat'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '$35,000 - $50,000',
      period: 'MXN/mes',
      features: [
        'Todo lo de Profesional',
        'Operación y mantenimiento',
        'Administración y finanzas',
        'Recursos humanos',
        'Seguridad avanzada',
        'Soporte prioritario'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#00a587]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-40 right-1/4 w-16 h-16 bg-green-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Award className="w-4 h-4 text-[#00a587] mr-2" />
            <span className="text-sm font-medium">Certificado por organismos gubernamentales</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              El futuro de la
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00a587] via-[#00d4aa] to-[#00a587] bg-clip-text text-transparent">
              gestión urbana
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Plataforma integral que transforma municipios completos con tecnología de vanguardia, 
            conectando gobierno y ciudadanos en un ecosistema digital inteligente
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#00a587]">500+</div>
              <div className="text-sm text-gray-400">Parques gestionados</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#00a587]">50+</div>
              <div className="text-sm text-gray-400">Municipios activos</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#00a587]">2M+</div>
              <div className="text-sm text-gray-400">Ciudadanos conectados</div>
            </div>
          </div>
          
          {/* Product Selector - Enhanced */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Elige tu solución:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(products).map(([key, product]) => (
                <button
                  key={key}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedProduct === key 
                      ? 'bg-[#00a587] border-[#00a587] shadow-lg shadow-[#00a587]/25' 
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedProduct(key as any)}
                >
                  <div className="flex items-center mb-2">
                    {product.icon}
                    <span className="ml-2 font-semibold">{product.name}</span>
                  </div>
                  <p className="text-sm text-gray-300">{product.target}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-[#00a587] to-[#00d4aa] hover:from-[#067f5f] hover:to-[#00a587] text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-[#00a587]/25 transition-all duration-300">
              <Sparkles className="mr-2 w-5 h-5" />
              Prueba gratuita 30 días
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
              <PlayCircle className="mr-2 w-5 h-5" />
              Ver demo en vivo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-sm">Usado por:</div>
            <div className="text-sm font-medium">Guadalajara</div>
            <div className="text-sm font-medium">Tlaquepaque</div>
            <div className="text-sm font-medium">Zapopan</div>
            <div className="text-sm font-medium">Tonalá</div>
          </div>
        </div>
      </section>

      {/* Selected Product Details - Enhanced */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Conoce {products[selectedProduct].name}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#00a587] to-[#00d4aa] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Product Header */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00a587] to-[#00d4aa] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    {products[selectedProduct].icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {products[selectedProduct].name}
                    </h3>
                    <p className="text-[#00a587] font-medium">
                      {products[selectedProduct].target}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {products[selectedProduct].description}
                </p>
              </div>
              
              {/* Features */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Zap className="w-6 h-6 text-[#00a587] mr-2" />
                  Características principales
                </h4>
                <div className="space-y-4">
                  {products[selectedProduct].features.map((feature, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-[#00a587] rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Use Cases - Enhanced */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#00a587] to-[#00d4aa] p-8 rounded-2xl text-white shadow-xl">
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <Globe className="w-6 h-6 mr-2" />
                  Casos de uso ideales
                </h4>
                <div className="space-y-4">
                  {products[selectedProduct].useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="font-medium">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ROI Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 text-[#00a587] mr-2" />
                  Retorno de inversión
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#00a587]">40%</div>
                    <div className="text-sm text-gray-600">Reducción de costos</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#00a587]">6 meses</div>
                    <div className="text-sm text-gray-600">Recuperación</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Inversión inteligente para {products[selectedProduct].name}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planes diseñados para escalar con tu crecimiento. Comienza gratis y evoluciona según tus necesidades.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#00a587] to-[#00d4aa] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00a587]/5 to-transparent rounded-3xl blur-3xl"></div>
            
            {Object.entries(tiers).map(([key, tier]) => (
              <div key={key} className={`relative group ${key === 'profesional' ? 'transform scale-105 z-10' : ''}`}>
                <div className={`h-full rounded-3xl border-2 transition-all duration-300 ${
                  key === 'profesional' 
                    ? 'bg-gradient-to-b from-[#00a587] to-[#00d4aa] border-transparent shadow-2xl shadow-[#00a587]/25' 
                    : 'bg-white border-gray-200 hover:border-[#00a587]/30 shadow-lg hover:shadow-xl'
                } group-hover:transform group-hover:scale-105`}>
                  
                  {key === 'profesional' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white text-[#00a587] px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Más popular
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-8 ${key === 'profesional' ? 'text-white' : 'text-gray-900'}`}>
                    {/* Tier Icon */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                      key === 'profesional' 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-[#00a587] to-[#00d4aa]'
                    }`}>
                      {key === 'esencial' && <TreeDeciduous className="w-8 h-8 text-white" />}
                      {key === 'profesional' && <Building className="w-8 h-8 text-white" />}
                      {key === 'enterprise' && <Star className="w-8 h-8 text-white" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-center mb-2">{tier.name}</h3>
                    
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold mb-1">{tier.price}</div>
                      {tier.period && (
                        <div className={`text-sm ${key === 'profesional' ? 'text-white/80' : 'text-gray-600'}`}>
                          /{tier.period}
                        </div>
                      )}
                      {key !== 'esencial' && (
                        <div className={`text-sm mt-2 ${key === 'profesional' ? 'text-white/80' : 'text-gray-600'}`}>
                          💰 20% descuento anual
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                            key === 'profesional' 
                              ? 'bg-white/20' 
                              : 'bg-[#00a587]'
                          }`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className={`text-sm font-medium ${key === 'profesional' ? 'text-white/90' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-3 font-semibold transition-all duration-300 ${
                        key === 'profesional' 
                          ? 'bg-white text-[#00a587] hover:bg-gray-100 shadow-lg' 
                          : key === 'enterprise'
                          ? 'bg-gradient-to-r from-[#00a587] to-[#00d4aa] text-white hover:from-[#067f5f] hover:to-[#00a587] shadow-lg'
                          : 'border-2 border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white'
                      }`}
                      variant={key === 'profesional' ? "default" : "outline"}
                    >
                      {key === 'esencial' ? '🚀 Comenzar prueba' : '📞 Contactar ventas'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Price guarantee */}
          <div className="text-center mt-12">
            <p className="text-gray-600 max-w-2xl mx-auto">
              💡 <strong>Garantía de precio:</strong> Si encuentras una solución similar a menor costo, 
              igualamos el precio y te damos un 10% adicional de descuento.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comparativa detallada de características</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gradient-to-r from-[#00a587] to-[#00d4aa] text-white">
                  <th className="text-left p-4 font-semibold">Característica</th>
                  <th className="text-center p-4 font-semibold">Esencial</th>
                  <th className="text-center p-4 font-semibold">Profesional</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Usuarios', esencial: '3', profesional: 'Ilimitados', enterprise: 'Ilimitados' },
                  { feature: 'Parques', esencial: '1', profesional: 'Ilimitados', enterprise: 'Ilimitados' },
                  { feature: 'Dashboard Principal', esencial: true, profesional: true, enterprise: true },
                  { feature: 'Configuración Avanzada', esencial: false, profesional: true, enterprise: true },
                  { feature: 'Gestión Completa', esencial: false, profesional: true, enterprise: true },
                  { feature: 'Marketing & Comunicación', esencial: false, profesional: true, enterprise: true },
                  { feature: 'Operación & Mantenimiento', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Administración & Finanzas', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Recursos Humanos', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Seguridad Avanzada', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Soporte', esencial: 'Email', profesional: 'Email + Chat', enterprise: 'Prioritario + Teléfono' }
                ].map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.esencial === 'boolean' ? (
                        row.esencial ? <Check className="w-5 h-5 text-[#00a587] mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : row.esencial}
                    </td>
                    <td className="p-4 text-center bg-[#00a587]/5">
                      {typeof row.profesional === 'boolean' ? (
                        row.profesional ? <Check className="w-5 h-5 text-[#00a587] mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : row.profesional}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <Check className="w-5 h-5 text-[#00a587] mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir ParkSys?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00a587] to-[#00d4aa] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Implementación rápida</h3>
              <p className="text-gray-600">
                Configuración en menos de 24 horas con datos de muestra incluidos y capacitación inicial
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00a587] to-[#00d4aa] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Cumplimiento con estándares gubernamentales y protección de datos ciudadanos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00a587] to-[#00d4aa] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
      <section className="py-16 px-4 bg-gradient-to-br from-[#00a587] to-[#00d4aa] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para transformar la gestión de tus parques?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comienza tu prueba gratuita de 30 días y descubre cómo ParkSys puede revolucionar tu operación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#00a587] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              <Sparkles className="mr-2 w-5 h-5" />
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
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