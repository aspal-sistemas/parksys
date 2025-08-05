import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fish, 
  Bird, 
  Bug, 
  Rabbit, 
  TreePine,
  Heart,
  Info,
  Star,
  Globe,
  Clock,
  Shield
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function Fauna() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-full">
                <Bird className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Fauna Urbana
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre la diversidad de vida silvestre que habita en los parques urbanos de Guadalajara. 
              Cada especie forma parte del delicado equilibrio ecológico de nuestra ciudad.
            </p>
          </div>

          {/* Categorías de fauna */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Bird className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Aves</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Especies de aves que habitan y visitan nuestros parques urbanos
                </p>
                <Badge variant="secondary">Próximamente</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <Rabbit className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-900">Mamíferos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Pequeños mamíferos que encuentran refugio en nuestros espacios verdes
                </p>
                <Badge variant="secondary">Próximamente</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Bug className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-900">Insectos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Polinizadores y otros insectos beneficiosos para el ecosistema
                </p>
                <Badge variant="secondary">Próximamente</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
                  <Fish className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-teal-900">Vida Acuática</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Especies que habitan en estanques y cuerpos de agua de los parques
                </p>
                <Badge variant="secondary">Próximamente</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Información de construcción */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
                <Info className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sección en Construcción
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Estamos trabajando en catalogar y documentar toda la fauna urbana presente en los parques de Guadalajara. 
                Pronto tendrás acceso a información detallada sobre cada especie, sus hábitats, comportamientos y su importancia ecológica.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-900 mb-1">Inventario Completo</h3>
                  <p className="text-sm text-blue-700">
                    Registro detallado de todas las especies identificadas
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-900 mb-1">Estado de Conservación</h3>
                  <p className="text-sm text-green-700">
                    Información sobre el estatus de protección de cada especie
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-purple-900 mb-1">Observaciones Ciudadanas</h3>
                  <p className="text-sm text-purple-700">
                    Reportes y avistamientos de la comunidad
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Llamada a la acción */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Observaste alguna especie interesante?
            </h2>
            <p className="text-blue-100 mb-6">
              Ayúdanos a documentar la biodiversidad urbana reportando tus avistamientos
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Shield className="h-5 w-5 mr-2" />
              Reportar Avistamiento
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}