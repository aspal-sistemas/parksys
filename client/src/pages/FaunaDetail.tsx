import React from 'react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Bird, 
  Bug, 
  Fish, 
  Rabbit, 
  TreePine,
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Heart,
  Eye,
  Leaf,
  Info,
  AlertTriangle,
  Star,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/components/PublicLayout';

interface FaunaSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  category: 'aves' | 'mamiferos' | 'reptiles' | 'anfibios' | 'insectos' | 'peces';
  habitat?: string;
  description?: string;
  behavior?: string;
  diet?: string;
  reproductionPeriod?: string;
  conservationStatus: 'estable' | 'vulnerable' | 'en_peligro' | 'critico' | 'extinto_silvestre';
  sizeCm?: string;
  weightGrams?: string;
  lifespan?: number;
  isNocturnal?: boolean;
  isMigratory?: boolean;
  isEndangered?: boolean;
  imageUrl?: string;
  photoUrl?: string;
  photoCaption?: string;
  ecologicalImportance?: string;
  threats?: string;
  protectionMeasures?: string;
  observationTips?: string;
  bestObservationTime?: string;
  iconColor?: string;
}

const categoryConfig = {
  'aves': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Bird, gradient: 'from-blue-500 to-blue-600' },
  'mamiferos': { bg: 'bg-green-100', text: 'text-green-800', icon: Rabbit, gradient: 'from-green-500 to-green-600' },
  'reptiles': { bg: 'bg-orange-100', text: 'text-orange-800', icon: TreePine, gradient: 'from-orange-500 to-orange-600' },
  'anfibios': { bg: 'bg-teal-100', text: 'text-teal-800', icon: Fish, gradient: 'from-teal-500 to-teal-600' },
  'insectos': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Bug, gradient: 'from-purple-500 to-purple-600' },
  'peces': { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: Fish, gradient: 'from-cyan-500 to-cyan-600' }
};

const conservationColors = {
  'estable': { bg: 'bg-green-100', text: 'text-green-800', label: 'Estable', color: 'green' },
  'vulnerable': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Vulnerable', color: 'yellow' },
  'en_peligro': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En Peligro', color: 'orange' },
  'critico': { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico', color: 'red' },
  'extinto_silvestre': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Extinto en Silvestre', color: 'gray' }
};

export default function FaunaDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: species, isLoading, error } = useQuery<FaunaSpecies>({
    queryKey: ['/api/fauna/public/species', id],
    queryFn: async () => {
      if (!id) throw new Error('ID no proporcionado');
      
      const response = await fetch(`/api/fauna/public/species/${id}`);
      
      if (!response.ok) {
        throw new Error('Especie no encontrada');
      }
      
      return response.json();
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la especie...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !species) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Bird className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Especie no encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              La especie que buscas no está disponible o fue removida del catálogo.
            </p>
            <Link href="/fauna">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Fauna
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const config = categoryConfig[species.category];
  const conservationConfig = conservationColors[species.conservationStatus];
  const IconComponent = config.icon;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${config.gradient} py-12 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4">
            <Link href="/fauna">
              <Button variant="outline" className="mb-6 bg-white/90 hover:bg-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Fauna
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <Badge className={`${config.bg} ${config.text} text-sm`}>
                    {species.category}
                  </Badge>
                  {species.isEndangered && (
                    <Badge className="bg-red-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Protegida
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold mb-2">
                  {species.commonName}
                </h1>
                <p className="text-xl italic text-white/90 mb-4">
                  {species.scientificName}
                </p>
                <p className="text-lg text-white/80 mb-6">
                  Familia: {species.family}
                </p>
                
                <div className="flex items-center gap-4">
                  <Badge className={`${conservationConfig.bg} ${conservationConfig.text} px-4 py-2 text-sm`}>
                    Estado: {conservationConfig.label}
                  </Badge>
                  {species.isNocturnal && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      Nocturno
                    </Badge>
                  )}
                  {species.isMigratory && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      Migratorio
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Imagen principal */}
              <div className="relative">
                {species.photoUrl || species.imageUrl ? (
                  <div className="relative">
                    <img
                      src={species.photoUrl || species.imageUrl}
                      alt={species.commonName}
                      className="w-80 h-80 rounded-lg object-cover shadow-xl border-4 border-white/20"
                    />
                    {species.photoCaption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 rounded-b-lg text-sm">
                        <Camera className="h-4 w-4 inline mr-1" />
                        {species.photoCaption}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-80 h-80 bg-white/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-24 w-24 text-white/60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="habitat">Hábitat y Comportamiento</TabsTrigger>
              <TabsTrigger value="conservation">Conservación</TabsTrigger>
              <TabsTrigger value="observation">Observación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Descripción */}
                {species.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Descripción
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {species.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Características físicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Características Físicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {species.sizeCm && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tamaño:</span>
                        <span className="font-semibold">{species.sizeCm} cm</span>
                      </div>
                    )}
                    {species.weightGrams && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Peso:</span>
                        <span className="font-semibold">{species.weightGrams} g</span>
                      </div>
                    )}
                    {species.lifespan && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Esperanza de vida:</span>
                        <span className="font-semibold">{species.lifespan} años</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estado de conservación:</span>
                      <Badge className={`${conservationConfig.bg} ${conservationConfig.text}`}>
                        {conservationConfig.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Alimentación y comportamiento */}
                {(species.diet || species.behavior) && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        Alimentación y Comportamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {species.diet && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Dieta:</h4>
                          <p className="text-gray-700">{species.diet}</p>
                        </div>
                      )}
                      {species.behavior && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Comportamiento:</h4>
                          <p className="text-gray-700">{species.behavior}</p>
                        </div>
                      )}
                      {species.reproductionPeriod && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Período de reproducción:</h4>
                          <p className="text-gray-700">{species.reproductionPeriod}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="habitat" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {species.habitat && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Hábitat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {species.habitat}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {species.ecologicalImportance && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Importancia Ecológica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {species.ecologicalImportance}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="conservation" className="mt-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <div className={`p-3 rounded-full ${conservationConfig.bg}`}>
                    <Shield className={`h-6 w-6 ${conservationConfig.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Estado de Conservación: {conservationConfig.label}
                    </h3>
                    <p className="text-gray-600">
                      {species.isEndangered 
                        ? 'Esta especie está en peligro y requiere protección especial.'
                        : 'Esta especie cuenta con poblaciones estables en la región.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {species.threats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                          <AlertTriangle className="h-5 w-5" />
                          Amenazas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">
                          {species.threats}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {species.protectionMeasures && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <Shield className="h-5 w-5" />
                          Medidas de Protección
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">
                          {species.protectionMeasures}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="observation" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {species.observationTips && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Consejos de Observación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {species.observationTips}
                      </p>
                      
                      {species.bestObservationTime && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-900">Mejor momento:</span>
                          </div>
                          <p className="text-blue-800 text-sm">
                            {species.bestObservationTime}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Información de Actividad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Actividad:</span>
                      <Badge variant={species.isNocturnal ? "secondary" : "default"}>
                        {species.isNocturnal ? 'Nocturno' : 'Diurno'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Patrón migratorio:</span>
                      <Badge variant={species.isMigratory ? "secondary" : "outline"}>
                        {species.isMigratory ? 'Migratorio' : 'Residente'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Categoría:</span>
                      <Badge className={`${config.bg} ${config.text}`}>
                        {species.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botones de acción */}
          <div className="flex justify-center gap-4 mt-12 pt-8 border-t">
            <Link href="/fauna">
              <Button variant="outline" size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Fauna
              </Button>
            </Link>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Reportar Avistamiento
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}