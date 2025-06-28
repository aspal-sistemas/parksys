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
  Activity,
  Eye,
  ChevronRight,
  Sparkles,
  Target,
  Lightbulb,
  Rocket
} from 'lucide-react';
import logoPath from '@assets/PHOTO-2025-06-16-16-11-35_1750112001756.jpg';

const Landing = () => {
  const { t } = useTranslation('common');

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Gestión de Parques",
      description: "Administra todos tus espacios públicos desde una plataforma centralizada con mapas interactivos y geolocalización.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Control Financiero",
      description: "Monitorea presupuestos, ingresos y gastos con reportes en tiempo real y proyecciones financieras.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestión de Personal",
      description: "Coordina voluntarios, instructores y personal administrativo con roles y permisos personalizados.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <TreePine className="h-8 w-8" />,
      title: "Arbolado Urbano",
      description: "Inventario completo de especies, seguimiento de salud y programación de mantenimiento preventivo.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Actividades y Eventos",
      description: "Planifica, programa y gestiona actividades comunitarias con registro de participantes.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Mantenimiento de Activos",
      description: "Control de inventario, programación de mantenimientos y seguimiento de vida útil de equipos.",
      color: "from-gray-500 to-slate-600"
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "Gestión de Concesiones",
      description: "Administra contratos, pagos y evaluaciones de concesionarios de manera transparente.",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Avanzado",
      description: "Dashboards interactivos con KPIs, métricas de uso y reportes ejecutivos automatizados.",
      color: "from-violet-500 to-purple-600"
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
      color: "border-emerald-200",
      bgColor: "bg-emerald-50"
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
      color: "border-primary",
      bgColor: "bg-primary/5"
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
      color: "border-slate-200",
      bgColor: "bg-slate-50"
    }
  ];

  const stats = [
    { number: "500+", label: "Municipios Activos", icon: <MapPin className="h-6 w-6" /> },
    { number: "2,000+", label: "Parques Gestionados", icon: <TreePine className="h-6 w-6" /> },
    { number: "50,000+", label: "Usuarios Diarios", icon: <Users className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime Garantizado", icon: <Shield className="h-6 w-6" /> }
  ];

  const benefits = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Reduce costos operativos hasta 40%",
      description: "Optimización inteligente de recursos y automatización de procesos"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Aumenta transparencia y rendición de cuentas",
      description: "Dashboard público con métricas en tiempo real para ciudadanos"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Mejora la experiencia ciudadana",
      description: "Interface intuitiva y acceso móvil para participación comunitaria"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Optimiza recursos y personal",
      description: "IA predictiva para planificación eficiente de mantenimiento"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Facilita toma de decisiones basada en datos",
      description: "Analytics avanzado con reportes ejecutivos automatizados"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Cumple estándares internacionales de calidad",
      description: "Certificaciones ISO 27001, GDPR y ODS 2030"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Parques de México" className="h-12 w-auto rounded-lg shadow-sm" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Parques de México</h1>
                <p className="text-sm text-gray-600">Gestión Inteligente de Espacios Públicos</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors font-medium">Características</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors font-medium">Precios</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors font-medium">Contacto</a>
            </nav>
            <div className="flex items-center space-x-3">
              <Link href="/admin/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Iniciar Sesión
                </Button>
              </Link>
              <Button className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Demo Gratuita
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <Rocket className="mr-2 h-4 w-4" />
              <span>Tecnología que transforma ciudades</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Democratizamos la gestión
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                profesional de parques urbanos
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-emerald-100 leading-relaxed">
              Tecnología accesible que permite a cualquier municipio, sin importar su tamaño o presupuesto, 
              ofrecer espacios públicos de calidad mundial a sus ciudadanos.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-10 py-6 text-lg shadow-2xl transform hover:scale-105 transition-all duration-200">
                <Zap className="mr-3 h-6 w-6" />
                Comenzar Gratis
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-10 py-6 text-lg backdrop-blur-sm">
                <Eye className="mr-3 h-6 w-6" />
                Ver Demo en Vivo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Impacto en Números</h2>
            <p className="text-gray-600 text-lg">Resultados reales que transforman comunidades</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
              <Activity className="mr-2 h-4 w-4" />
              Plataforma Integral
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              11 Módulos Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una suite completa que cubre todos los aspectos de la administración moderna de espacios públicos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <Target className="mr-2 h-4 w-4" />
                Beneficios Comprobados
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                ¿Por qué elegir nuestra plataforma?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-emerald-100 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-600 rounded-3xl text-white mb-6">
                  <Award className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Certificaciones y Estándares</h3>
                <div className="space-y-4">
                  {[
                    { icon: <Shield className="h-5 w-5" />, text: "ISO 27001 - Seguridad de la Información" },
                    { icon: <Globe className="h-5 w-5" />, text: "GDPR Compliant - Protección de Datos" },
                    { icon: <Leaf className="h-5 w-5" />, text: "ODS 2030 - Ciudades Sostenibles" }
                  ].map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-primary">{cert.icon}</div>
                      <span className="text-gray-700 font-medium">{cert.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
              <DollarSign className="mr-2 h-4 w-4" />
              Planes Flexibles
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Diseñados para Cada Municipio
            </h2>
            <p className="text-xl text-gray-600">
              Desde comunidades pequeñas hasta grandes metrópolis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.highlighted ? 'ring-2 ring-primary shadow-2xl scale-105' : 'shadow-lg'} ${plan.color} border-2 ${plan.bgColor}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary-600 text-white px-6 py-2 text-sm font-bold shadow-lg">
                      <Star className="mr-1 h-4 w-4" />
                      Más Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-600 text-lg">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-3 text-gray-600 font-medium">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-3 font-bold transition-all duration-200 ${plan.highlighted 
                      ? 'bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-md'
                    }`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas un plan personalizado?</h3>
              <p className="text-gray-600 mb-6">Para gobiernos estatales o consorcios municipales</p>
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-bold">
                <Mail className="mr-2 h-5 w-5" />
                Contactar para Plan Gobierno
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
              <Users className="mr-2 h-4 w-4" />
              Testimonios
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Historias reales de transformación municipal
            </p>
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
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="pt-8">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-gray-900 text-lg">{testimonial.author}</p>
                    <p className="text-primary font-medium">{testimonial.position}</p>
                    <p className="text-gray-600">{testimonial.city}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-500/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <Rocket className="mr-2 h-4 w-4" />
            Comienza tu transformación digital hoy
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            ¿Listo para transformar tu ciudad?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Únete a cientos de municipios que ya están ofreciendo espacios públicos de calidad mundial 
            a sus ciudadanos con nuestra tecnología.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-10 py-6 text-lg font-bold shadow-2xl">
              <Zap className="mr-3 h-6 w-6" />
              Comenzar Prueba Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-6 text-lg font-bold">
              <Phone className="mr-3 h-6 w-6" />
              Agendar Demostración
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src={logoPath} alt="Parques de México" className="h-12 w-auto rounded-lg" />
                <div>
                  <h3 className="text-xl font-bold">Parques de México</h3>
                  <p className="text-gray-400">Tecnología para ciudades inteligentes</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Democratizamos la gestión profesional de parques urbanos mediante tecnología accesible 
                que transforma espacios públicos en toda América Latina.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white hover:border-white">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white hover:border-white">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2025 Parques de México. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Términos</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;