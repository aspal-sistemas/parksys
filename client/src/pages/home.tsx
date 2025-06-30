import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search, Map, ArrowRight, MapPin, Trees, Users, Calendar, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import ParkCard from '@/components/ParkCard';
import { ExtendedPark } from '@shared/schema';
import logoImage from '@assets/logo_1751306368691.png';

const Home: React.FC = () => {
  // Fetch a few featured parks
  const { data: allParks = [], isLoading } = useQuery<ExtendedPark[]>({
    queryKey: ['/api/parks'],
  });
  
  // Filtrar parques sin nombre o marcados como eliminados
  const featuredParks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );
  
  return (
    <main className="flex-1">
      {/* 🌟 HERO SECTION RENOVADO - Estilo moderno consistente */}
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
              <Trees className="h-5 w-5 text-green-200" />
              <span className="text-sm font-medium">🌳 Red de Parques Urbanos de Jalisco</span>
            </div>
            
            {/* Título principal renovado */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              Descubre los 
              <span className="block bg-gradient-to-r from-green-200 via-emerald-100 to-teal-100 bg-clip-text text-transparent relative">
                Bosques y Parques
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-green-300/60 to-transparent rounded-full"></div>
              </span>
              <span className="block text-green-100">de Jalisco</span>
            </h1>
            
            {/* Subtítulo mejorado */}
            <p className="text-xl md:text-3xl mb-12 max-w-5xl mx-auto text-green-50 leading-relaxed font-light">
              Encuentra parques, jardines y áreas recreativas cerca de ti. 
              <span className="block font-semibold text-green-200 mt-2">Toda la información que necesitas en un solo lugar.</span>
            </p>
            
            {/* Barra de búsqueda moderna */}
            <div className="max-w-2xl mx-auto relative mb-12">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Busca un parque por nombre o ubicación..."
                className="pl-16 pr-32 py-8 text-xl rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-md focus:bg-white transition-all"
              />
              <Link href="/parks">
                <Button className="absolute right-3 top-3 rounded-xl px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all duration-300 hover:scale-105">
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </Link>
            </div>
            
            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/parks">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-12 py-6 text-xl rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform">
                  <Map className="mr-3 h-6 w-6" />
                  Ver Mapa de Parques
                </Button>
              </Link>
              <Link href="/activities">
                <Button size="lg" variant="outline" className="border-3 border-white/50 text-white hover:bg-white/10 hover:border-white px-12 py-6 text-xl rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl backdrop-blur-md">
                  <Calendar className="mr-3 h-6 w-6" />
                  Ver Actividades
                </Button>
              </Link>
            </div>
            
            {/* Stats destacados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: featuredParks.length.toString(), label: "Parques Disponibles" },
                { number: "25+", label: "Municipios" },
                { number: "150+", label: "Actividades/Mes" },
                { number: "10K+", label: "Visitantes" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                    <div className="text-3xl md:text-4xl font-bold text-green-200 mb-2">{stat.number}</div>
                    <div className="text-sm text-green-100 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* 🎯 FEATURED PARKS SECTION RENOVADO */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-3 mb-8 border border-emerald-200">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">✨ Parques Destacados</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Espacios Verdes 
              <span className="block text-emerald-600">Imperdibles</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre los parques más populares y mejor valorados de la región
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              // Loading skeletons mejorados
              Array(3).fill(0).map((_, idx) => (
                <Card key={idx} className="animate-pulse rounded-3xl overflow-hidden shadow-lg">
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </CardContent>
                </Card>
              ))
            ) : featuredParks.length > 0 ? (
              featuredParks.slice(0, 3).map(park => (
                <div key={park.id} className="group">
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden bg-white">
                    <ParkCard park={park} />
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trees className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-xl text-gray-500 mb-4">No hay parques disponibles en este momento</p>
                <p className="text-gray-400">Pronto estarán disponibles más espacios verdes</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link href="/parks">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-10 py-4 text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Ver Todos los Parques 
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* 🚀 HOW IT WORKS SECTION RENOVADO */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-3 mb-8 border border-blue-200">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">💡 Cómo Funciona</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Explora en 3 
              <span className="block text-blue-600">Pasos Simples</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Search,
                title: "Busca",
                description: "Encuentra parques utilizando filtros por zona, tipo o amenidades que buscas.",
                color: "from-emerald-500 to-teal-500",
                bgColor: "from-emerald-100 to-teal-100",
                step: "01"
              },
              {
                icon: MapPin,
                title: "Explora", 
                description: "Descubre información detallada, fotos, horarios y servicios de cada parque.",
                color: "from-blue-500 to-indigo-500",
                bgColor: "from-blue-100 to-indigo-100",
                step: "02"
              },
              {
                icon: Map,
                title: "Visita",
                description: "Obtén indicaciones para llegar y disfruta de los espacios verdes de tu ciudad.",
                color: "from-purple-500 to-pink-500", 
                bgColor: "from-purple-100 to-pink-100",
                step: "03"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-24 h-24 bg-gradient-to-br ${item.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className={`h-12 w-12 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      
      {/* Footer inspirado en bosquesamg.mx */}
      <footer className="bg-gradient-to-b from-[#067f5f] to-[#00a587] text-white">
        {/* Logo y descripción principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <img 
              src={logoImage} 
              alt="Agencia Metropolitana de Bosques Urbanos" 
              className="h-16 w-auto mx-auto mb-6 filter brightness-0 invert"
            />
            <h2 className="text-2xl font-bold mb-4">Agencia Metropolitana de Bosques Urbanos</h2>
            <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
              Fortalecemos el tejido social a través de espacios verdes que conectan comunidades, 
              promueven la sostenibilidad y mejoran la calidad de vida en nuestra área metropolitana.
            </p>
          </div>

          {/* Enlaces organizados en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Columna 1 */}
            <div className="space-y-3">
              <Link href="/" className="block text-white hover:text-[#bcd256] transition-colors">
                Inicio
              </Link>
              <Link href="/about" className="block text-white hover:text-[#bcd256] transition-colors">
                Nosotros
              </Link>
              <Link href="/activities" className="block text-white hover:text-[#bcd256] transition-colors">
                Eventos
              </Link>
            </div>

            {/* Columna 2 */}
            <div className="space-y-3">
              <Link href="/parks" className="block text-white hover:text-[#bcd256] transition-colors">
                Bosques Urbanos
              </Link>
              <Link href="/education" className="block text-white hover:text-[#bcd256] transition-colors">
                Educación Ambiental
              </Link>
              <Link href="/wildlife-rescue" className="block text-white hover:text-[#bcd256] transition-colors">
                Rescate de Fauna
              </Link>
            </div>

            {/* Columna 3 */}
            <div className="space-y-3">
              <Link href="/transparency" className="block text-white hover:text-[#bcd256] transition-colors">
                Transparencia
              </Link>
              <Link href="/bids" className="block text-white hover:text-[#bcd256] transition-colors">
                Licitaciones
              </Link>
              <Link href="/blog" className="block text-white hover:text-[#bcd256] transition-colors">
                Blog
              </Link>
            </div>

            {/* Columna 4 */}
            <div className="space-y-3">
              <Link href="/faq" className="block text-white hover:text-[#bcd256] transition-colors">
                Preguntas Frecuentes
              </Link>
              <Link href="/help" className="block text-white hover:text-[#bcd256] transition-colors">
                Quiero Ayudar
              </Link>
              <Link href="/contact" className="block text-white hover:text-[#bcd256] transition-colors">
                Contacto
              </Link>
            </div>

            {/* Columna 5 - Servicios */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#bcd256] mb-2">Servicios</h4>
              <Link href="/instructors" className="block text-white hover:text-[#bcd256] transition-colors">
                Instructores
              </Link>
              <Link href="/concessions" className="block text-white hover:text-[#bcd256] transition-colors">
                Concesiones
              </Link>
              <Link href="/tree-species" className="block text-white hover:text-[#bcd256] transition-colors">
                Especies Arbóreas
              </Link>
            </div>

            {/* Columna 6 - Participación */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#bcd256] mb-2">Participa</h4>
              <Link href="/volunteers" className="block text-white hover:text-[#bcd256] transition-colors">
                Voluntariado
              </Link>
              <Link href="/reports" className="block text-white hover:text-[#bcd256] transition-colors">
                Reportar Incidentes
              </Link>
              <Link href="/suggestions" className="block text-white hover:text-[#bcd256] transition-colors">
                Sugerencias
              </Link>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="border-t border-emerald-500/30 pt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Dirección</h4>
                <p className="text-emerald-100 text-sm">
                  Av. Alcalde 1351, Miraflores<br/>
                  44270 Guadalajara, Jalisco
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Contacto</h4>
                <p className="text-emerald-100 text-sm">
                  Tel: (33) 3837-4400<br/>
                  bosques@guadalajara.gob.mx
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#bcd256] mb-2">Horarios</h4>
                <p className="text-emerald-100 text-sm">
                  Lunes a Viernes: 8:00 - 15:00<br/>
                  Fines de semana: Espacios abiertos
                </p>
              </div>
            </div>
            
            <div className="text-sm text-emerald-200">
              © {new Date().getFullYear()} Agencia Metropolitana de Bosques Urbanos de Guadalajara. 
              Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;