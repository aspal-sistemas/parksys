import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search, Map, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import ParkCard from '@/components/ParkCard';
import { ExtendedPark } from '@shared/schema';

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
      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary-100 to-primary-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading mb-4">
            Descubre los bosques y parques urbanos de Jalisco
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Encuentra parques, jardines y áreas recreativas cerca de ti. Toda la información que necesitas en un solo lugar.
          </p>
          
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Busca un parque por nombre o ubicación"
              className="pl-10 pr-20 py-6 text-lg rounded-full shadow-lg border-0"
            />
            <Link href="/parks">
              <Button className="absolute right-1.5 top-1.5 rounded-full">
                Buscar
              </Button>
            </Link>
          </div>
          
          <div className="mt-6">
            <Link href="/parks">
              <Button variant="outline" className="mr-4">
                <Map className="h-4 w-4 mr-2" />
                Ver mapa de parques
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured parks section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">Parques destacados</h2>
            <Link href="/parks">
              <Button variant="link" className="text-primary">
                Ver todos los parques <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Show loading skeletons
              Array(3).fill(0).map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : featuredParks.length > 0 ? (
              // Show actual parks
              featuredParks.slice(0, 3).map(park => (
                <ParkCard key={park.id} park={park} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No hay parques disponibles en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 font-heading text-center mb-12">¿Cómo funciona ParquesMX?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Busca</h3>
              <p className="text-gray-600">Encuentra parques utilizando filtros por zona, tipo o amenidades que buscas.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Explora</h3>
              <p className="text-gray-600">Descubre información detallada, fotos, horarios y servicios de cada parque.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visita</h3>
              <p className="text-gray-600">Obtén indicaciones para llegar y disfruta de los espacios verdes de tu ciudad.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* For municipalities CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary-600 text-white">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold font-heading mb-2">¿Eres un municipio o gestor de parques?</h2>
            <p className="text-secondary-100">Gestiona tus espacios verdes, publica eventos y conecta con la ciudadanía.</p>
          </div>
          <Link href="/admin/login">
            <Button size="lg" variant="secondary" className="bg-white text-secondary-600 hover:bg-gray-100">
              Acceso Institucional
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">ParquesMX</h3>
              <p className="text-sm">Sistema de información de parques públicos y espacios verdes en México.</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Enlaces</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Inicio</a></li>
                <li><a href="#" className="hover:text-white">Parques</a></li>
                <li><a href="#" className="hover:text-white">Actividades</a></li>
                <li><a href="#" className="hover:text-white">Acerca de</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Términos de uso</a></li>
                <li><a href="#" className="hover:text-white">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white">Aviso legal</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Contacto</h3>
              <ul className="space-y-2 text-sm">
                <li>contacto@parquesmx.com</li>
                <li>+52 (33) 1234-5678</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} ParquesMX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
