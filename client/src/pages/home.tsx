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
      {/* 🌟 HERO SECTION - Inspirado en bosquesamg.mx */}
      <section className="relative min-h-screen bg-white overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
            }}
          ></div>
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
          <div className="max-w-3xl">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 bg-emerald-600/90 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Trees className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Agencia Metropolitana de Bosques Urbanos</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transformando
              <span className="block text-emerald-400">espacios verdes</span>
              <span className="block text-white">para la comunidad</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Descubre, participa y disfruta de los parques y bosques urbanos de la 
              Zona Metropolitana de Guadalajara. Espacios verdes que mejoran la calidad de vida.
            </p>
            
            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/parks">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-xl">
                  <Map className="mr-3 h-5 w-5" />
                  Explorar Parques
                </Button>
              </Link>
              <Link href="/activities">
                <Button size="lg" className="bg-white/20 border-2 border-white/50 text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 backdrop-blur-md shadow-lg">
                  <Calendar className="mr-3 h-5 w-5" />
                  Ver Actividades
                </Button>
              </Link>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="max-w-xl relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Buscar parques por nombre o ubicación..."
                className="pl-12 pr-4 py-4 text-base rounded-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          
          {/* Contenido derecho - Stats cards flotantes */}
          <div className="hidden lg:block absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
            {[
              { number: featuredParks.length.toString(), label: "Parques", icon: Trees },
              { number: "9", label: "Municipios", icon: MapPin },
              { number: "25+", label: "Actividades", icon: Calendar },
              { number: "5K+", label: "Visitantes", icon: Users }
            ].map((stat, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 min-w-[140px] shadow-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 rounded-lg p-2">
                    <stat.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
      
      {/* 🏛️ AGENCIA DE BOSQUES URBANOS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Agencia Metropolitana de Bosques Urbanos
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Nuestro modelo de gestión está dividido en <span className="font-semibold text-emerald-600">4 ejes principales</span> 
              que garantizan el desarrollo sustentable y la conservación de nuestros espacios verdes urbanos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Eje 1: Gestión y Mantenimiento */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-emerald-200">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Trees className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gestión y Mantenimiento</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Administración integral de parques urbanos, mantenimiento preventivo y correctivo de áreas verdes, 
                  infraestructura y equipamiento urbano.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-emerald-600">Eje Principal 1</span>
                </div>
              </CardContent>
            </Card>

            {/* Eje 2: Educación Ambiental */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Educación Ambiental</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Programas educativos, talleres de concienciación ambiental, formación ciudadana 
                  y promoción de la cultura verde en la comunidad.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-600">Eje Principal 2</span>
                </div>
              </CardContent>
            </Card>

            {/* Eje 3: Participación Ciudadana */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Participación Ciudadana</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Fomento de la participación activa de la comunidad, programas de voluntariado, 
                  eventos comunitarios y actividades recreativas.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-purple-600">Eje Principal 3</span>
                </div>
              </CardContent>
            </Card>

            {/* Eje 4: Desarrollo Sustentable */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-amber-200">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Desarrollo Sustentable</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Innovación en tecnologías verdes, proyectos de sustentabilidad, 
                  gestión eficiente de recursos y desarrollo urbano sostenible.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-amber-600">Eje Principal 4</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* 🎯 FEATURED PARKS SECTION RENOVADO */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              <span className="text-emerald-600">Bosques Urbanos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La Agencia Metropolitana de Bosques Urbanos es un organismo público 
              descentralizado, dedicado a la administración pública de parques y bosques 
              urbanos del área metropolitana de Guadalajara.
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