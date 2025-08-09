import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Map, ArrowRight, MapPin, Trees, Users, Calendar, Sparkles, TrendingUp, Zap, Leaf, Shield, Heart, BookOpen, GraduationCap, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ParkCard from '@/components/ParkCard';
import AdSpace from '@/components/AdSpace';
import { ExtendedPark } from '@shared/schema';
const logoImage = "/images/logo-ambu.png";

const Home: React.FC = () => {
  // Estado para forzar actualización de anuncios estáticos
  const [forceUpdateKey, setForceUpdateKey] = useState(Date.now());
  
  // Escuchar cambios en localStorage para actualizar anuncios
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adForceUpdate') {
        console.log('🔄 Forzando actualización de anuncios en /home por cambio en localStorage');
        setForceUpdateKey(Date.now());
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      console.log('🔄 Forzando actualización de anuncios en /home por evento personalizado');
      setForceUpdateKey(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adForceUpdate', handleCustomUpdate as EventListener);
    };
  }, []);
  
  // Fetch a few featured parks
  const { data: parksResponse, isLoading } = useQuery<ExtendedPark[]>({
    queryKey: ['/api/parks'],
  });
  
  // Fetch sponsors para la sección de patrocinadores
  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery<any[]>({
    queryKey: ['/api/sponsors'],
  });
  
  const allParks = parksResponse || [];
  
  // Filtrar parques sin nombre o marcados como eliminados
  const featuredParks = allParks.filter(park => 
    park.name.trim() !== '' && !park.isDeleted
  );
  
  return (
    <main className="flex-1">
      {/* 🌟 HERO SECTION - Inspirado en bosquesamg.mx */}
      <section className="relative min-h-screen bg-black overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-background.jpg')"
            }}
          ></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
          <div className="max-w-3xl">
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Agencia Metropolitana
              <span className="block">de Bosques Urbanos</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-2xl md:text-3xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Trabajamos por un futuro más verde,<br />
              árbol por árbol.
            </p>
            
            {/* Badge */}
            <div className="inline-flex items-center bg-black/55 text-white px-8 py-4 rounded-lg text-lg font-semibold mb-6 border border-white/30">
              <MapPin className="mr-3 h-5 w-5" />
              Zona Metropolitana de Guadalajara
            </div>

            {/* Botones CTA */}
            <div className="flex flex-col gap-4 mb-12 items-start">
              <Link href="/parks">
                <Button size="lg" className="bg-[#aaaf4f] hover:bg-[#9ca047] text-white font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-xl">
                  <Map className="mr-3 h-5 w-5" />
                  Nuestros parques
                </Button>
              </Link>
              <Link href="/activities">
                <Button size="lg" className="bg-white border-2 border-white text-[#aaaf4f] hover:bg-gray-50 hover:text-[#9ca047] font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
                  <Calendar className="mr-3 h-5 w-5" />
                  Actividades
                </Button>
              </Link>
            </div>
            


          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
      

      {/* 🎯 FEATURED PARKS SECTION RENOVADO */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              <span style={{ fontFamily: 'Guttery Regular, Georgia, Times, serif', color: '#51a19f', fontWeight: '300' }}>Nuestros</span><br />
              <span className="text-emerald-600">Bosques Urbanos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              espacios para respirar, convivir y disfrutar
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 mb-12 min-h-[600px]">
            {isLoading ? (
              // Loading skeletons con nuevo layout
              <>
                <div className="flex-1 lg:max-w-sm">
                  <Card className="animate-pulse rounded-3xl overflow-hidden shadow-lg h-full">
                    <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </Card>
                </div>
                <div className="flex-2 lg:flex-grow">
                  <Card className="animate-pulse rounded-3xl overflow-hidden shadow-lg h-full">
                    <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </Card>
                </div>
                <div className="flex-1 lg:max-w-sm">
                  <Card className="animate-pulse rounded-3xl overflow-hidden shadow-lg h-full">
                    <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </Card>
                </div>
              </>
            ) : featuredParks.length > 0 ? (
              <>
                {/* Card izquierda */}
                <div className="flex-1 lg:max-w-sm">
                  <div className="group h-full">
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden bg-white h-full">
                      <ParkCard park={featuredParks[0]} />
                    </Card>
                  </div>
                </div>
                
                {/* Card central (más grande) */}
                {featuredParks.length > 1 && (
                  <div className="flex-2 lg:flex-grow">
                    <div className="group h-full">
                      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden bg-white h-full">
                        <ParkCard park={featuredParks[1]} />
                      </Card>
                    </div>
                  </div>
                )}
                
                {/* Card derecha */}
                {featuredParks.length > 2 && (
                  <div className="flex-1 lg:max-w-sm">
                    <div className="group h-full">
                      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden bg-white h-full">
                        <ParkCard park={featuredParks[2]} />
                      </Card>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trees className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl text-gray-500 mb-4">No hay parques disponibles en este momento</p>
                  <p className="text-gray-400">Pronto estarán disponibles más espacios verdes</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mb-12">
            <Link href="/parks">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-10 py-4 text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Encuentra tu parque favorito
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
          
          {/* Banner publicitario */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-8">
            <AdSpace 
              spaceId={14} 
              position="banner" 
              pageType="homepage" 
              className="w-full"
            />
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

      {/* CENTRO METROPOLITANO DE CONSERVACIÓN DE VIDA SILVESTRE URBANO */}
      <section className="py-24 bg-gradient-to-b from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            {/* Contenido */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-3 mb-6 border border-emerald-200">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">🦎 Vida Silvestre</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Centro Metropolitano de 
                  <span className="block text-emerald-600">Conservación de Vida Silvestre Urbano</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Dedicado a la protección, rehabilitación y conservación de especies nativas en el área metropolitana. 
                  Trabajamos en la preservación de la biodiversidad urbana y la educación ambiental para las futuras generaciones.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rescate de Fauna</h3>
                  <p className="text-gray-600">Atención especializada para animales silvestres heridos o en situación de riesgo</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rehabilitación</h3>
                  <p className="text-gray-600">Programas integrales de recuperación y reintegración al hábitat natural</p>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                Conoce Más Sobre Conservación
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* Imagen */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald-200 to-teal-200 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Centro de Conservación de Vida Silvestre"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCACIÓN AMBIENTAL */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            {/* Imagen - Lado izquierdo */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-200 to-indigo-200 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Educación Ambiental"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
            
            {/* Contenido - Lado derecho */}
            <div className="space-y-8 order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-3 mb-6 border border-blue-200">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">📚 Aprendizaje</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  <span className="text-blue-600">Educación</span>
                  <span className="block">Ambiental</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Formamos ciudadanos conscientes del medio ambiente a través de programas educativos innovadores. 
                  Nuestros talleres, cursos y actividades promueven la cultura ambiental en todas las edades.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Talleres Comunitarios</h3>
                    <p className="text-gray-600">Actividades participativas para todas las edades enfocadas en sustentabilidad</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Programas Escolares</h3>
                    <p className="text-gray-600">Currículum ambiental integrado para instituciones educativas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Capacitación Empresarial</h3>
                    <p className="text-gray-600">Programas especializados para organizaciones comprometidas con el medio ambiente</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                Explora Programas Educativos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PATROCINADORES */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-3 mb-8 border border-purple-200">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">🤝 Alianzas Estratégicas</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Nuestros 
              <span className="text-purple-600">Patrocinadores</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Gracias al apoyo de organizaciones comprometidas con el medio ambiente, 
              podemos continuar desarrollando proyectos que transforman nuestra ciudad en un espacio más verde y sostenible.
            </p>
          </div>
          
          {/* Grid de patrocinadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {sponsorsLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="text-center">
                      <div className="w-full h-20 mx-auto bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : sponsors.length > 0 ? (
              // Mostrar patrocinadores reales
              sponsors
                .filter((sponsor: any) => sponsor.status === 'activo' && sponsor.logo) // Solo activos con logo
                .map((sponsor: any, index: number) => (
                  <div key={sponsor.id || index} className="group">
                    <div 
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => {
                        if (sponsor.websiteUrl) {
                          window.open(sponsor.websiteUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={sponsor.logo} 
                            alt={`Logo de ${sponsor.name}`}
                            className="w-full h-20 mx-auto object-contain rounded-lg"
                            onError={(e) => {
                              // Fallback si la imagen no carga
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-3xl hidden">
                            🏢
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              // Fallback cuando no hay patrocinadores
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🤝</div>
                <p className="text-gray-500">Próximamente más patrocinadores se unirán a nuestra causa</p>
              </div>
            )}
          </div>
          
          {/* Call to action para patrocinadores */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">¿Quieres ser parte del cambio?</h3>
              <p className="text-purple-100 mb-6 text-lg">
                Únete a nuestras alianzas estratégicas y contribuye al desarrollo sostenible de la zona metropolitana
              </p>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                Convertirse en Patrocinador
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
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