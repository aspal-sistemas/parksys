import React from 'react';
import { Check, X, Star, ArrowLeft, Sparkles, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SalesProPage = () => {
  const features = [
    {
      category: "Configuración y Setup",
      items: [
        { name: "Dashboard Administrativo", esencial: true, profesional: true, enterprise: true },
        { name: "Gestión Básica de Usuarios", esencial: true, profesional: true, enterprise: true },
        { name: "Configuración de parques", esencial: "Hasta 3", profesional: "Ilimitados", enterprise: "Ilimitados" },
        { name: "Configuración Personalizada", esencial: false, profesional: true, enterprise: true },
        { name: "Branding Personalizado", esencial: false, profesional: true, enterprise: true },
        { name: "Permisos", esencial: "Básicos", profesional: "Avanzados", enterprise: "Completos" },
        { name: "Notificaciones", esencial: "Email", profesional: "Email + SMS", enterprise: "Multi-canal" }
      ]
    },
    {
      category: "Gestión Operativa de Excelencia",
      items: [
        { name: "Operación de clase mundial", esencial: "Básica", profesional: "Premium", enterprise: "Ultra premium" },
        { name: "IA para optimización automática", esencial: false, profesional: true, enterprise: true },
        { name: "Análisis predictivo avanzado", esencial: false, profesional: "Básico", enterprise: "Completo" },
        { name: "Gestión de experiencia VIP", esencial: false, profesional: true, enterprise: true },
        { name: "Servicios concierge digitales", esencial: false, profesional: false, enterprise: true },
        { name: "Automatización inteligente", esencial: false, profesional: true, enterprise: true }
      ]
    },
    {
      category: "Marketing y Comunicación Premium",
      items: [
        { name: "Portal web de clase mundial", esencial: true, profesional: true, enterprise: true },
        { name: "Marketing personalizado con IA", esencial: false, profesional: true, enterprise: true },
        { name: "Análisis de comportamiento avanzado", esencial: false, profesional: true, enterprise: true },
        { name: "Campañas omnicanal", esencial: false, profesional: true, enterprise: true },
        { name: "Experiencia personalizada", esencial: false, profesional: true, enterprise: true },
        { name: "Sistema de fidelización", esencial: false, profesional: true, enterprise: true }
      ]
    },
    {
      category: "Operación y Mantenimiento de Elite",
      items: [
        { name: "Mantenimiento predictivo con IoT", esencial: false, profesional: false, enterprise: true },
        { name: "Gestión de activos premium", esencial: false, profesional: true, enterprise: true },
        { name: "Sensores ambientales integrados", esencial: false, profesional: false, enterprise: true },
        { name: "Control de calidad automatizado", esencial: false, profesional: true, enterprise: true },
        { name: "Optimización energética", esencial: false, profesional: false, enterprise: true },
        { name: "Mantenimiento de clase mundial", esencial: false, profesional: true, enterprise: true }
      ]
    },
    {
      category: "Administración y Finanzas Corporativas",
      items: [
        { name: "Contabilidad corporativa completa", esencial: false, profesional: false, enterprise: true },
        { name: "Análisis financiero avanzado", esencial: false, profesional: "Básico", enterprise: "Completo" },
        { name: "Proyecciones con IA", esencial: false, profesional: false, enterprise: true },
        { name: "Control de rentabilidad", esencial: false, profesional: true, enterprise: true },
        { name: "Reportes ejecutivos", esencial: false, profesional: true, enterprise: true },
        { name: "Optimización de ingresos", esencial: false, profesional: false, enterprise: true }
      ]
    },
    {
      category: "Recursos Humanos Premium",
      items: [
        { name: "Gestión de talento avanzada", esencial: false, profesional: false, enterprise: true },
        { name: "Desarrollo profesional", esencial: false, profesional: false, enterprise: true },
        { name: "Evaluaciones 360 grados", esencial: false, profesional: false, enterprise: true },
        { name: "Planes de carrera", esencial: false, profesional: false, enterprise: true },
        { name: "Cultura organizacional", esencial: false, profesional: false, enterprise: true }
      ]
    },
    {
      category: "Seguridad y Soporte VIP",
      items: [
        { name: "Seguridad de nivel bancario", esencial: "Básica", profesional: "Avanzada", enterprise: "Máxima" },
        { name: "Cumplimiento regulatorio", esencial: false, profesional: true, enterprise: true },
        { name: "Auditoría continua", esencial: false, profesional: true, enterprise: true },
        { name: "Backup geográficamente distribuido", esencial: false, profesional: true, enterprise: true },
        { name: "Gerente de cuenta dedicado", esencial: false, profesional: false, enterprise: true },
        { name: "Soporte VIP 24/7/365", esencial: "Email", profesional: "Chat + Phone", enterprise: "Gerente dedicado + On-site" }
      ]
    }
  ];

  const renderFeatureValue = (value: any) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-600 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-gray-400 mx-auto" />;
    }
    return <span className="text-sm text-center text-gray-700">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-br from-purple-900 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white hover:bg-opacity-10 mb-6"
            onClick={() => window.location.href = '/sales'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a página principal
          </Button>
          
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mr-6">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">ParkSys Pro</h1>
              <p className="text-xl text-gray-300">
                La solución definitiva para parques emblemáticos de gran escala
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">Ideal para:</h3>
              <p className="text-sm text-gray-300">Parques emblemáticos, complejos premium y destinos de clase mundial</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">Beneficio clave:</h3>
              <p className="text-sm text-gray-300">Experiencia excepcional y operación de excelencia</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">ROI esperado:</h3>
              <p className="text-sm text-gray-300">40-70% incremento en satisfacción y rentabilidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Opciones de Inversión Premium</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Esencial</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">Gratuito</div>
              <p className="text-sm text-gray-600 mb-4">30 días para evaluación</p>
              <p className="text-sm">Funcionalidades premium básicas</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-6 text-center transform scale-105 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Recomendado
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Profesional</h3>
              <div className="text-3xl font-bold mb-2">$35,000 - $50,000</div>
              <p className="text-sm opacity-90 mb-4">MXN/mes</p>
              <p className="text-sm">Gestión premium completa</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">$65,000 - $100,000</div>
              <p className="text-sm text-gray-600 mb-4">MXN/mes</p>
              <p className="text-sm">Solución ultra premium sin límites</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Matriz Completa de Características Premium</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-purple-800 to-pink-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold w-1/2">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold w-1/6">Esencial</th>
                  <th className="px-6 py-4 text-center font-semibold w-1/6 bg-purple-600">Profesional</th>
                  <th className="px-6 py-4 text-center font-semibold w-1/6">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-gray-100">
                      <td colSpan={4} className="px-6 py-3 font-bold text-gray-800">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={`${categoryIndex}-${itemIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureValue(item.esencial)}</td>
                        <td className="px-6 py-4 text-center bg-purple-50">{renderFeatureValue(item.profesional)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureValue(item.enterprise)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Beneficios Exclusivos de ParkSys Pro</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2">Experiencia VIP</h4>
              <p className="text-sm text-gray-600">Servicios premium para visitantes distinguidos</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2">IA Avanzada</h4>
              <p className="text-sm text-gray-600">Optimización automática con inteligencia artificial</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2">IoT Integrado</h4>
              <p className="text-sm text-gray-600">Sensores y automatización de última generación</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2">Soporte VIP</h4>
              <p className="text-sm text-gray-600">Gerente de cuenta dedicado 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para ofrecer experiencias de clase mundial?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            ParkSys Pro está diseñado para parques que buscan la excelencia operacional y experiencias excepcionales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              <Sparkles className="mr-2 w-5 h-5" />
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
              <PlayCircle className="mr-2 w-5 h-5" />
              Agendar demo VIP
            </Button>
          </div>
          
          <div className="mt-8 text-sm opacity-80">
            💎 <strong>Casos de éxito:</strong> Parques emblemáticos internacionales y destinos premium confían en ParkSys Pro
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesProPage;