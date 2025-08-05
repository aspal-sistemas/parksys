import React from 'react';
import { Check, X, MapPin, ArrowLeft, Star, Sparkles, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SalesNetworkPage = () => {
  const features = [
    {
      category: "Configuración y Setup",
      items: [
        { name: "Dashboard Administrativo", esencial: true, profesional: true, enterprise: true },
        { name: "Gestión de Usuarios", esencial: "1 usuario", profesional: "Ilimitados", enterprise: "Ilimitados" },
        { name: "Configuración de parques", esencial: "Hasta 3", profesional: "Ilimitados", enterprise: "Ilimitados" },
        { name: "Configuración Personalizada", esencial: false, profesional: true, enterprise: true },
        { name: "Branding Personalizado", esencial: false, profesional: true, enterprise: true },
        { name: "Permisos", esencial: false, profesional: "Completos", enterprise: "Completos" },
        { name: "Notificaciones", esencial: false, profesional: "Email", enterprise: "Email" }
      ]
    },
    {
      category: "Gestión Integral",
      items: [
        { name: "Visitantes (Dashboard, Conteo, Evaluaciones, Criterios, Retroalimentación)", esencial: false, profesional: true, enterprise: true },
        { name: "Parques (Dashboard, Gestión)", esencial: true, profesional: true, enterprise: true },
        { name: "Arbolado (Dashboard, Inventario, Especies, Mantenimiento)", esencial: false, profesional: true, enterprise: true },
        { name: "Actividades (Dashboard, Categorías, Listado, Nueva Actividad, Calendario, Instructores)", esencial: false, profesional: true, enterprise: true },
        { name: "Eventos (Dashboard, Nuevo Evento, Categorías, Eventos, Calendario, Tabulador de costos)", esencial: false, profesional: true, enterprise: true },
        { name: "Reservas (Dashboard, Reservas Activas, Espacios Disponibles, Nueva Reserva, Calendario)", esencial: false, profesional: true, enterprise: true },
        { name: "Amenidades (Dashboard, Gestión)", esencial: false, profesional: true, enterprise: true }
      ]
    },
    {
      category: "Marketing y Comunicación",
      items: [
        { name: "Marketing (Dashboard, Patrocinadores, Contratos, Eventos, Activos, Evaluaciones)", esencial: false, profesional: true, enterprise: true },
        { name: "Publicidad Digital (Dashboard, Espacios Publicitarios, Anuncios, Campañas, Asignaciones, Mapeo de Espacios)", esencial: false, profesional: true, enterprise: true },
        { name: "Comunicación (Dashboard, Plantillas, Cola de Emails, Campañas)", esencial: false, profesional: true, enterprise: true }
      ]
    },
    {
      category: "Operación y Mantenimiento",
      items: [
        { name: "Activos (Dashboard, Categorías, Inventario, Mapa, Mantenimiento, Calendario de Mantenimiento, Asignaciones)", esencial: false, profesional: false, enterprise: true },
        { name: "Incidencias (Listado, Categorías)", esencial: false, profesional: false, enterprise: true },
        { name: "Voluntarios (Listado, Registro, Evaluaciones, Reconocimientos)", esencial: false, profesional: false, enterprise: true }
      ]
    },
    {
      category: "Administración y Finanzas",
      items: [
        { name: "Finanzas (Dashboard, Presupuestos, Flujo de Efectivo, Calculadora de recuperación de costos para actividades)", esencial: false, profesional: false, enterprise: true },
        { name: "Contabilidad (Dashboard, Categorías, Transacciones, Asientos Contables, Balanza, Estados Financieros)", esencial: false, profesional: false, enterprise: true },
        { name: "Concesiones (Dashboard, Catálogo, Concesionarios, Contratos, Concesiones Activas)", esencial: false, profesional: false, enterprise: true }
      ]
    },
    {
      category: "Recursos Humanos",
      items: [
        { name: "Gestión de empleados", esencial: false, profesional: false, enterprise: true },
        { name: "Control de nómina", esencial: false, profesional: false, enterprise: true },
        { name: "Gestión de vacaciones", esencial: false, profesional: false, enterprise: true },
        { name: "Evaluaciones de desempeño", esencial: false, profesional: false, enterprise: true },
        { name: "Capacitación y desarrollo", esencial: false, profesional: false, enterprise: true }
      ]
    },
    {
      category: "Seguridad y Soporte",
      items: [
        { name: "Reportes y Datos (Exportación de KPIs de todo el sistema en Excel / CSV)", esencial: false, profesional: true, enterprise: true },
        { name: "Autenticación básica", esencial: true, profesional: true, enterprise: true },
        { name: "Control de roles y permisos", esencial: "Básico", profesional: "Avanzado", enterprise: "Completo" },
        { name: "Auditoría y logs", esencial: false, profesional: true, enterprise: true },
        { name: "Backup automático", esencial: false, profesional: true, enterprise: true },
        { name: "Soporte técnico", esencial: "Email", profesional: "Email + Chat", enterprise: "Prioritario 24/7" }
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
      <section className="py-12 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
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
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mr-6">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">ParkSys Network</h1>
              <p className="text-xl text-gray-300">
                Coordina y optimiza sistemas de parques grandes (15-20 parques)
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">Ideal para:</h3>
              <p className="text-sm text-gray-300">Organizaciones con red extensa de parques que requieren coordinación</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">Beneficio clave:</h3>
              <p className="text-sm text-gray-300">Operación coordinada y economías de escala</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-2">ROI esperado:</h3>
              <p className="text-sm text-gray-300">30-50% reducción en costos operativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Opciones de Inversión</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Esencial</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">Gratuito</div>
              <p className="text-sm text-gray-600 mb-4">30 días para evaluación</p>
              <p className="text-sm">Coordinación básica de hasta 15 parques</p>
            </div>
            <div className="bg-blue-600 text-white rounded-xl p-6 text-center transform scale-105 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Recomendado
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Profesional</h3>
              <div className="text-3xl font-bold mb-2">$25,000 - $35,000</div>
              <p className="text-sm opacity-90 mb-4">MXN/mes</p>
              <p className="text-sm">Gestión completa de red de parques</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">$45,000 - $65,000</div>
              <p className="text-sm text-gray-600 mb-4">MXN/mes</p>
              <p className="text-sm">Solución corporativa completa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Matriz Completa de Características</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-800 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold w-1/2">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold w-1/6">Esencial</th>
                  <th className="px-6 py-4 text-center font-semibold w-1/6 bg-blue-600">Profesional</th>
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
                        <td className="px-6 py-4 text-center bg-blue-50">{renderFeatureValue(item.profesional)}</td>
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para coordinar tu red de parques?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            ParkSys Network está diseñado para organizaciones que gestionan múltiples ubicaciones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
              <Sparkles className="mr-2 w-5 h-5" />
              Comenzar prueba gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
              <PlayCircle className="mr-2 w-5 h-5" />
              Agendar demo personalizada
            </Button>
          </div>
          
          <div className="mt-8 text-sm opacity-80">
            💡 <strong>Casos de éxito:</strong> Bosques Urbanos de Guadalajara, Parques Nacionales y más de 20 redes confían en ParkSys
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesNetworkPage;