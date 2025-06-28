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
  Star,
  Sparkles,
  TrendingUp
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
      {/* Header con glassmorphism mejorado */}
      <header className="relative bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Parques de México" className="h-10 w-auto transition-transform hover:scale-105" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#00a587] transition-all duration-300 hover:scale-105">Características</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#00a587] transition-all duration-300 hover:scale-105">Precios</a>
              <a href="#contact" className="text-gray-600 hover:text-[#00a587] transition-all duration-300 hover:scale-105">Contacto</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button variant="outline" className="border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Iniciar Sesión
                </Button>
              </Link>
              <Button className="bg-gradient-to-r from-[#00a587] to-[#067f5f] hover:from-[#067f5f] hover:to-[#00a587] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Demo Gratuita
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 🌟 NUEVO HERO SECTION RENOVADO - Diseño consistente con otras páginas 🌟 */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white min-h-[80vh] flex items-center overflow-hidden">
        {/* Efectos de fondo modernos */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-bounce delay-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            {/* Badge moderno */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">🚀 Plataforma líder en gestión de parques urbanos</span>
            </div>
            
            {/* Título principal renovado */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              Democratizamos la 
              <span className="block bg-gradient-to-r from-yellow-300 via-green-200 to-emerald-100 bg-clip-text text-transparent relative">
                Gestión de Parques
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent rounded-full"></div>
              </span>
            </h1>
            
            {/* Subtítulo mejorado */}
            <p className="text-xl md:text-3xl mb-12 max-w-5xl mx-auto text-green-50 leading-relaxed font-light">
              Tecnología accesible que permite a <span className="font-semibold text-yellow-200">cualquier municipio</span>, 
              sin importar su tamaño o presupuesto, ofrecer espacios públicos de calidad mundial.
            </p>
            
            {/* Botones CTA renovados */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-12 py-6 text-xl rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform">
                <Zap className="mr-3 h-6 w-6" />
                Comenzar Gratis Ahora
              </Button>
              <Button size="lg" variant="outline" className="border-3 border-white/50 text-white hover:bg-white/10 hover:border-white px-12 py-6 text-xl rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl backdrop-blur-md">
                <ArrowRight className="mr-3 h-6 w-6" />
                Ver Demo en Vivo
              </Button>
            </div>
            
            {/* Stats destacados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "500+", label: "Municipios" },
                { number: "2,000+", label: "Parques" },
                { number: "50K+", label: "Usuarios" },
                { number: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{stat.number}</div>
                  <div className="text-sm text-green-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section con efectos mejorados */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                  <div className="text-4xl md:text-5xl font-bold text-[#00a587] mb-3 group-hover:text-[#067f5f] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 FEATURES SECTION RENOVADO - Estilo moderno consistente */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-3 mb-8 border border-emerald-200">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">🚀 Plataforma todo-en-uno</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Plataforma Integral de 
              <span className="block text-emerald-600">Gestión Municipal</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              11 módulos especializados que cubren todos los aspectos de la administración de espacios públicos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden relative">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <CardHeader className="relative pt-8 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pb-8">
                  <CardDescription className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section con glassmorphism */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bcd256] via-[#00a587] to-[#067f5f]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                ¿Por qué elegir nuestra plataforma?
              </h2>
              <div className="space-y-6">
                {[
                  "Reduce costos operativos hasta 40%",
                  "Aumenta transparencia y rendición de cuentas",
                  "Mejora la experiencia ciudadana",
                  "Optimiza recursos y personal",
                  "Facilita toma de decisiones basada en datos",
                  "Cumple estándares internacionales de calidad"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#bcd256]/20 rounded-full flex items-center justify-center group-hover:bg-[#bcd256]/30 transition-colors">
                      <CheckCircle className="h-5 w-5 text-[#bcd256]" />
                    </div>
                    <span className="text-lg group-hover:text-[#bcd256] transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm"></div>
              <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00a587] to-[#067f5f] rounded-full mb-6 shadow-lg">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Certificaciones y Estándares</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Shield className="h-5 w-5 text-[#00a587]" />
                      <span>ISO 27001 - Seguridad de la Información</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Globe className="h-5 w-5 text-[#00a587]" />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Leaf className="h-5 w-5 text-[#00a587]" />
                      <span>ODS 2030 - Ciudades Sostenibles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section mejorado */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-full px-4 py-2 mb-6">
              <DollarSign className="h-4 w-4 text-[#00a587]" />
              <span className="text-sm font-medium text-[#067f5f]">Planes flexibles</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Planes Diseñados para Cada Municipio
            </h2>
            <p className="text-xl text-gray-600">
              Desde comunidades pequeñas hasta grandes metrópolis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative group hover:scale-105 transition-all duration-500 ${
                plan.highlighted 
                  ? 'ring-2 ring-[#00a587] shadow-2xl bg-gradient-to-br from-white to-[#00a587]/5' 
                  : 'shadow-lg hover:shadow-2xl bg-white'
              } ${plan.color} border-2 overflow-hidden`}>
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00a587] to-[#bcd256]"></div>
                )}
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00a587] to-[#067f5f] text-white shadow-lg">
                    Más Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-[#067f5f] transition-colors">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-[#00a587]">{plan.price}</span>
                    <span className="text-gray-600 text-lg">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-3 text-base">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-[#00a587] flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-3 transition-all duration-300 hover:scale-105 ${plan.highlighted 
                      ? 'bg-gradient-to-r from-[#00a587] to-[#067f5f] hover:from-[#067f5f] hover:to-[#00a587] text-white shadow-lg' 
                      : 'bg-white border-2 border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">¿Necesitas un plan personalizado para tu gobierno estatal o consorcio municipal?</p>
            <Button variant="outline" className="border-2 border-[#00a587] text-[#00a587] hover:bg-[#00a587] hover:text-white transition-all duration-300 hover:scale-105 px-8 py-3">
              Contactar para Plan Gobierno
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section mejorado */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00a587]/10 to-[#bcd256]/10 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-[#00a587]" />
              <span className="text-sm font-medium text-[#067f5f]">Testimonios</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
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
              <Card key={index} className="group bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#bcd256]/5 to-[#00a587]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="pt-8 relative">
                  <div className="flex mb-6 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-lg">{testimonial.author}</p>
                    <p className="text-sm text-gray-600 mt-1">{testimonial.position}</p>
                    <p className="text-sm text-[#00a587] font-medium mt-1">{testimonial.city}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section mejorado */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a587] to-[#067f5f]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-[#bcd256]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para transformar tu municipio?
            </h2>
            <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Comienza tu transformación digital hoy mismo con una demostración personalizada
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                { icon: Phone, title: "Llámanos", info: "+52 (33) 1234-5678" },
                { icon: Mail, title: "Escríbenos", info: "ventas@parquesdemexico.com" },
                { icon: Heart, title: "Soporte", info: "soporte@parquesdemexico.com" }
              ].map((contact, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <contact.icon className="h-8 w-8 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">{contact.title}</h3>
                    <p className="opacity-90">{contact.info}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <Button size="lg" className="bg-[#bcd256] hover:bg-white text-[#067f5f] font-semibold px-12 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <Sparkles className="mr-2 h-5 w-5" />
                Solicitar Demo Gratuita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer mejorado */}
      <footer className="bg-[#067f5f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src={logoPath} alt="Parques de México" className="h-12 w-auto mb-6 filter brightness-0 invert transition-transform hover:scale-105" />
              <p className="text-sm opacity-80 leading-relaxed">
                Consultora especializada en espacio público, democratizando la gestión profesional de parques urbanos.
              </p>
            </div>
            
            {[
              {
                title: "Producto",
                links: [
                  { name: "Características", href: "#features" },
                  { name: "Precios", href: "#pricing" },
                  { name: "API", href: "#" },
                  { name: "Integraciones", href: "#" }
                ]
              },
              {
                title: "Empresa",
                links: [
                  { name: "Acerca de", href: "#" },
                  { name: "Blog", href: "#" },
                  { name: "Casos de Éxito", href: "#" },
                  { name: "Careers", href: "#" }
                ]
              },
              {
                title: "Soporte",
                links: [
                  { name: "Centro de Ayuda", href: "#" },
                  { name: "Contacto", href: "#contact" },
                  { name: "Status", href: "#" },
                  { name: "Política de Privacidad", href: "#" }
                ]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-lg">{section.title}</h3>
                <ul className="space-y-3 text-sm opacity-80">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href} className="hover:text-[#bcd256] transition-colors duration-300 hover:opacity-100">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#00a587]/30 mt-12 pt-8 text-center">
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