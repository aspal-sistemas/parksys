import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  TreePine, 
  Wrench, 
  Building, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Leaf,
  Shield,
  Globe,
  Zap,
  Heart,
  Award,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import logoPath from '@assets/PHOTO-2025-06-16-16-11-35_1750112001756.jpg';

const Landing = () => {
  const { t } = useTranslation('common');

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Gestión de Parques",
      description: "Administra todos tus espacios públicos desde una plataforma centralizada con mapas interactivos y geolocalización."
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Control Financiero",
      description: "Monitorea presupuestos, ingresos y gastos con reportes en tiempo real y proyecciones financieras."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestión de Personal",
      description: "Coordina voluntarios, instructores y personal administrativo con roles y permisos personalizados."
    },
    {
      icon: <TreePine className="h-8 w-8" />,
      title: "Arbolado Urbano",
      description: "Inventario completo de especies, seguimiento de salud y programación de mantenimiento preventivo."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Actividades y Eventos",
      description: "Planifica, programa y gestiona actividades comunitarias con registro de participantes."
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Mantenimiento de Activos",
      description: "Control de inventario, programación de mantenimientos y seguimiento de vida útil de equipos."
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "Gestión de Concesiones",
      description: "Administra contratos, pagos y evaluaciones de concesionarios de manera transparente."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Avanzado",
      description: "Dashboards interactivos con KPIs, métricas de uso y reportes ejecutivos automatizados."
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$149",
      period: "/mes",
      description: "Municipios hasta 50,000 habitantes",
      features: [
        "Hasta 5 parques",
        "10 usuarios",
        "Todos los módulos básicos",
        "API REST (1,000 calls/día)",
        "Backup semanal",
        "Soporte prioritario"
      ],
      highlighted: false,
      buttonText: "Iniciar Prueba",
      color: "border-[#bcd256]"
    },
    {
      name: "Professional",
      price: "$399",
      period: "/mes",
      description: "Ciudades medianas (50k-250k habitantes)",
      features: [
        "Hasta 20 parques",
        "50 usuarios",
        "Todos los módulos",
        "IA predictiva",
        "White label parcial",
        "API REST (10,000 calls/día)",
        "Soporte 24/7"
      ],
      highlighted: true,
      buttonText: "Más Popular",
      color: "border-[#00a587]"
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "/mes",
      description: "Grandes ciudades (250k+ habitantes)",
      features: [
        "Parques ilimitados",
        "Usuarios ilimitados",
        "White label completo",
        "Servidor dedicado",
        "API ilimitada",
        "Account Manager",
        "SLA 99.9%"
      ],
      highlighted: false,
      buttonText: "Contactar Ventas",
      color: "border-[#067f5f]"
    }
  ];

  const stats = [
    { number: "500+", label: "Municipios Activos" },
    { number: "2,000+", label: "Parques Gestionados" },
    { number: "50,000+", label: "Usuarios Diarios" },
    { number: "99.9%", label: "Uptime Garantizado" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Parques de México" className="h-10 w-auto" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#00a587] transition-colors">Características</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#00a587] transition-colors">Precios</a>
              <a href="#contact" className="text-gray-600 hover:text-[#00a587] transition-colors">Contacto</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button variant="outline" className="border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white">
                  Iniciar Sesión
                </Button>
              </Link>
              <Button className="bg-[#00a587] hover:bg-[#067f5f] text-white">
                Demo Gratuita
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00a587] via-[#067f5f] to-[#bcd256] text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Democratizamos la gestión
              <span className="block text-[#bcd256]">profesional de parques urbanos</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
              Tecnología accesible que permite a cualquier municipio, sin importar su tamaño o presupuesto, 
              ofrecer espacios públicos de calidad a sus ciudadanos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#bcd256] hover:bg-[#8498a5] text-[#067f5f] font-semibold px-8 py-4 text-lg">
                <Zap className="mr-2 h-5 w-5" />
                Comenzar Gratis
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#00a587] px-8 py-4 text-lg">
                <ArrowRight className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00a587] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plataforma Integral de Gestión
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              11 módulos especializados que cubren todos los aspectos de la administración de espacios públicos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-l-4 border-l-[#00a587] hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-[#00a587] mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-[#bcd256] to-[#00a587]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Por qué elegir nuestra plataforma?
              </h2>
              <div className="space-y-4">
                {[
                  "Reduce costos operativos hasta 40%",
                  "Aumenta transparencia y rendición de cuentas",
                  "Mejora la experiencia ciudadana",
                  "Optimiza recursos y personal",
                  "Facilita toma de decisiones basada en datos",
                  "Cumple estándares internacionales de calidad"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#bcd256] flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <Award className="h-16 w-16 text-[#00a587] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Certificaciones y Estándares</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>ISO 27001 - Seguridad de la Información</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Leaf className="h-4 w-4" />
                    <span>ODS 2030 - Ciudades Sostenibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes Diseñados para Cada Municipio
            </h2>
            <p className="text-xl text-gray-600">
              Desde comunidades pequeñas hasta grandes metrópolis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.highlighted ? 'ring-2 ring-[#00a587] shadow-xl' : ''} ${plan.color} border-2`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#00a587] text-white">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-[#00a587]">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-[#00a587] flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.highlighted 
                      ? 'bg-[#00a587] hover:bg-[#067f5f] text-white' 
                      : 'bg-white border-2 border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">¿Necesitas un plan personalizado para tu gobierno estatal o consorcio municipal?</p>
            <Button variant="outline" className="border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white">
              Contactar para Plan Gobierno
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Hemos reducido los costos de mantenimiento en un 35% y mejorado significativamente la satisfacción ciudadana.",
                author: "María González",
                position: "Directora de Parques y Jardines",
                city: "Guadalajara, Jalisco"
              },
              {
                quote: "La plataforma nos permitió digitalizar completamente nuestros procesos y tener control total sobre nuestros espacios públicos.",
                author: "Carlos Ruiz",
                position: "Secretario de Obras Públicas",
                city: "Monterrey, Nuevo León"
              },
              {
                quote: "El sistema de voluntariado ha aumentado la participación ciudadana en un 200%. Es una herramienta transformadora.",
                author: "Ana Martínez",
                position: "Coordinadora de Participación Ciudadana",
                city: "Mérida, Yucatán"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-l-4 border-l-[#bcd256]">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                    <p className="text-sm text-[#00a587]">{testimonial.city}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#00a587]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para transformar tu municipio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comienza tu transformación digital hoy mismo con una demostración personalizada
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Llámanos</h3>
                <p>+52 (33) 1234-5678</p>
              </div>
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Escríbenos</h3>
                <p>ventas@parquesdemexico.com</p>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Soporte</h3>
                <p>soporte@parquesdemexico.com</p>
              </div>
            </div>

            <div className="mt-12">
              <Button size="lg" className="bg-[#bcd256] hover:bg-white text-[#067f5f] font-semibold px-12 py-4 text-lg">
                Solicitar Demo Gratuita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#067f5f] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src={logoPath} alt="Parques de México" className="h-12 w-auto mb-4 filter brightness-0 invert" />
              <p className="text-sm opacity-80">
                Consultora especializada en espacio público, democratizando la gestión profesional de parques urbanos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#features" className="hover:text-[#bcd256]">Características</a></li>
                <li><a href="#pricing" className="hover:text-[#bcd256]">Precios</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">API</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Integraciones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-[#bcd256]">Acerca de</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Blog</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Casos de Éxito</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-[#bcd256]">Centro de Ayuda</a></li>
                <li><a href="#contact" className="hover:text-[#bcd256]">Contacto</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Status</a></li>
                <li><a href="#" className="hover:text-[#bcd256]">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#00a587] mt-8 pt-8 text-center">
            <p className="text-sm opacity-80">
              © 2024 Parques de México. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;