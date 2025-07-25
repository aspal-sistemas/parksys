import React, { useState } from 'react';
import { Check, Star, Users, MapPin, Building, Calculator, ArrowRight, Zap, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SalesPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<'municipal' | 'network' | 'pro'>('municipal');
  const [selectedTier, setSelectedTier] = useState<'profesional' | 'enterprise'>('profesional');

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transformamos la gestión de parques urbanos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Con tecnología inteligente que conecta gobierno y ciudadanos en un ecosistema digital intuitivo
          </p>
          
          {/* Product Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(products).map(([key, product]) => (
              <Button
                key={key}
                variant={selectedProduct === key ? "default" : "outline"}
                className={`px-6 py-3 ${selectedProduct === key ? 'bg-[#00a587] hover:bg-[#067f5f]' : ''}`}
                onClick={() => setSelectedProduct(key as any)}
              >
                {product.icon}
                <span className="ml-2">{product.name}</span>
              </Button>
            ))}
          </div>

          <Button size="lg" className="bg-[#00a587] hover:bg-[#067f5f] text-white px-8 py-4 text-lg">
            Prueba gratuita 30 días
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Selected Product Details */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                {products[selectedProduct].icon}
                <h2 className="text-3xl font-bold text-gray-900 ml-3">
                  {products[selectedProduct].name}
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                <strong>Target:</strong> {products[selectedProduct].target}
              </p>
              <p className="text-lg text-gray-700 mb-8">
                {products[selectedProduct].description}
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Características principales:</h3>
              <ul className="space-y-3">
                {products[selectedProduct].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-[#00a587] mt-0.5 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Casos de uso ideales:</h3>
              <div className="space-y-3">
                {products[selectedProduct].useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center p-3 bg-white rounded-lg">
                    <Users className="w-5 h-5 text-[#00a587] mr-3" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes y precios para {products[selectedProduct].name}
            </h2>
            <p className="text-gray-600">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(tiers).map(([key, tier]) => (
              <Card key={key} className={`relative ${key === 'profesional' ? 'border-[#00a587] border-2' : ''}`}>
                {key === 'profesional' && (
                  <Badge className="absolute -top-3 right-4 bg-[#00a587]">
                    Más popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-gray-600 ml-1">/{tier.period}</span>}
                  </div>
                  {key !== 'esencial' && (
                    <p className="text-sm text-gray-600 mt-2">
                      20% descuento en suscripción anual
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-[#00a587] mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${key === 'profesional' ? 'bg-[#00a587] hover:bg-[#067f5f]' : ''}`}
                    variant={key === 'profesional' ? "default" : "outline"}
                  >
                    {key === 'esencial' ? 'Comenzar prueba' : 'Contactar ventas'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comparativa de características</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-4">Característica</th>
                  <th className="text-center p-4">Esencial</th>
                  <th className="text-center p-4 bg-[#00a587]/10">Profesional</th>
                  <th className="text-center p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Usuarios', esencial: '3', profesional: 'Ilimitados', enterprise: 'Ilimitados' },
                  { feature: 'Parques', esencial: '1', profesional: 'Ilimitados', enterprise: 'Ilimitados' },
                  { feature: 'Dashboard Principal', esencial: true, profesional: true, enterprise: true },
                  { feature: 'Configuración', esencial: 'Básica', profesional: 'Completa', enterprise: 'Completa' },
                  { feature: 'Gestión Operativa', esencial: false, profesional: true, enterprise: true },
                  { feature: 'Marketing & Comunicación', esencial: false, profesional: true, enterprise: true },
                  { feature: 'Operación & Mantenimiento', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Administración & Finanzas', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Recursos Humanos', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Seguridad Avanzada', esencial: false, profesional: false, enterprise: true },
                  { feature: 'Soporte', esencial: 'Email', profesional: 'Email + Chat', enterprise: 'Prioritario + Teléfono' }
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 font-medium">{row.feature}</td>
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir ParkSys?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00a587] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Implementación rápida</h3>
              <p className="text-gray-600">
                Configuración en menos de 24 horas con datos de muestra incluidos y capacitación inicial
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00a587] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad garantizada</h3>
              <p className="text-gray-600">
                Cumplimiento con estándares gubernamentales y protección de datos ciudadanos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00a587] rounded-full flex items-center justify-center mx-auto mb-4">
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
      <section className="py-16 px-4 bg-[#00a587] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para transformar la gestión de tus parques?
          </h2>
          <p className="text-xl mb-8">
            Comienza tu prueba gratuita de 30 días y descubre cómo ParkSys puede revolucionar tu operación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-[#00a587]">
              Solicitar demo personalizada
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesPage;