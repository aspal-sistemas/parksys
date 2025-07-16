import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trees, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Leaf, 
  Globe, 
  Award,
  Droplets,
  Sun,
  Clock,
  TreePine,
  Info
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { Link } from 'wouter';

interface TreeSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  growthRate: string;
  description?: string;
  ecologicalBenefits?: string;
  maintenanceRequirements?: string;
  climateZone?: string;
  waterRequirements?: string;
  sunRequirements?: string;
  soilRequirements?: string;
  heightMature?: string;
  canopyDiameter?: string;
  lifespan?: string;
  ornamentalValue?: string;
  commonUses?: string;
  photoUrl?: string;
  isEndangered: boolean;
  iconType?: string;
  customIconUrl?: string;
}

const growthRateColors = {
  'Lento': 'bg-red-100 text-red-800 border-red-200',
  'Medio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Rápido': 'bg-green-100 text-green-800 border-green-200'
};

const originColors = {
  'Nativo': 'bg-blue-100 text-blue-800 border-blue-200',
  'Introducido': 'bg-purple-100 text-purple-800 border-purple-200',
  'Naturalizado': 'bg-teal-100 text-teal-800 border-teal-200'
};

function TreeSpeciesCard({ species, viewMode }: { species: TreeSpecies; viewMode: 'grid' | 'list' }) {
  const growthRateColor = growthRateColors[species.growthRate as keyof typeof growthRateColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  const originColor = originColors[species.origin as keyof typeof originColors] || 'bg-gray-100 text-gray-800 border-gray-200';

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Imagen */}
            <div className="w-32 h-32 flex-shrink-0">
              {species.photoUrl ? (
                <img 
                  src={species.photoUrl} 
                  alt={species.commonName}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Trees className="h-16 w-16 text-white opacity-80" />
                </div>
              )}
            </div>
            
            {/* Contenido */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{species.commonName}</h3>
                  <p className="text-sm text-gray-500 italic">{species.scientificName}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={growthRateColor}>
                    {species.growthRate}
                  </Badge>
                  <Badge className={originColor}>
                    {species.origin}
                  </Badge>
                  {species.isEndangered && (
                    <Badge variant="destructive">
                      En peligro
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Familia:</span>
                  <span className="font-medium">{species.family}</span>
                </div>
                {species.climateZone && (
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Zona:</span>
                    <span className="font-medium">{species.climateZone}</span>
                  </div>
                )}
                {species.heightMature && (
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Altura:</span>
                    <span className="font-medium">{species.heightMature}</span>
                  </div>
                )}
                {species.waterRequirements && (
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Agua:</span>
                    <span className="font-medium">{species.waterRequirements}</span>
                  </div>
                )}
              </div>
              
              {species.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{species.description}</p>
              )}
              
              {species.ecologicalBenefits && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-700 mb-1">Beneficios Ecológicos:</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{species.ecologicalBenefits}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          {species.photoUrl ? (
            <img 
              src={species.photoUrl} 
              alt={species.commonName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Trees className="h-16 w-16 text-white opacity-80" />
            </div>
          )}
          
          {/* Badges superpuestos */}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge className={originColor}>
              {species.origin}
            </Badge>
            {species.isEndangered && (
              <Badge variant="destructive">
                En peligro
              </Badge>
            )}
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{species.commonName}</h3>
              <p className="text-sm text-gray-500 italic">{species.scientificName}</p>
            </div>
            <Badge className={growthRateColor}>
              {species.growthRate}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Familia:</span>
              <span className="font-medium">{species.family}</span>
            </div>
            {species.climateZone && (
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Zona:</span>
                <span className="font-medium">{species.climateZone}</span>
              </div>
            )}
          </div>
          
          {species.description && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{species.description}</p>
          )}
          
          {species.ecologicalBenefits && (
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-1">Beneficios:</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{species.ecologicalBenefits}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TreeSpecies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [growthRateFilter, setGrowthRateFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Consulta para obtener todas las especies de árboles
  const { data: treeSpeciesResponse, isLoading } = useQuery<{data: TreeSpecies[], pagination: any}>({
    queryKey: ['/api/tree-species'],
    queryFn: async () => {
      const response = await fetch('/api/tree-species?limit=1000'); // Obtener muchos registros para página pública
      if (!response.ok) throw new Error('Error cargando especies arbóreas');
      return response.json();
    }
  });

  // Extraer los datos de la respuesta
  const treeSpecies = treeSpeciesResponse?.data || [];

  // Filtrar especies
  const filteredSpecies = useMemo(() => {
    if (!Array.isArray(treeSpecies)) return [];
    
    return treeSpecies.filter(species => {
      const matchesSearch = searchTerm === '' || 
        species.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.family.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOrigin = originFilter === 'all' || species.origin === originFilter;
      const matchesGrowthRate = growthRateFilter === 'all' || species.growthRate === growthRateFilter;
      
      return matchesSearch && matchesOrigin && matchesGrowthRate;
    });
  }, [treeSpecies, searchTerm, originFilter, growthRateFilter]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-green-600 rounded-full">
                <Trees className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Especies Arbóreas
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre la diversidad de árboles en los parques urbanos de Guadalajara. 
              Cada especie contribuye al ecosistema urbano y al bienestar de nuestra comunidad.
            </p>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar especies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={originFilter} onValueChange={setOriginFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los orígenes</SelectItem>
                    <SelectItem value="Nativo">Nativo</SelectItem>
                    <SelectItem value="Introducido">Introducido</SelectItem>
                    <SelectItem value="Naturalizado">Naturalizado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={growthRateFilter} onValueChange={setGrowthRateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Crecimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los ritmos</SelectItem>
                    <SelectItem value="Lento">Lento</SelectItem>
                    <SelectItem value="Medio">Medio</SelectItem>
                    <SelectItem value="Rápido">Rápido</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-green-600">
                  {Array.isArray(treeSpecies) ? treeSpecies.length : 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Especies registradas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-blue-600">
                  {Array.isArray(treeSpecies) ? treeSpecies.filter(s => s.origin === 'Nativo').length : 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Especies nativas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-red-600">
                  {Array.isArray(treeSpecies) ? treeSpecies.filter(s => s.isEndangered).length : 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">En peligro</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-purple-600">
                  {filteredSpecies.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Resultados filtrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          {filteredSpecies.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {filteredSpecies.map((species) => (
                <TreeSpeciesCard key={species.id} species={species} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trees className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron especies
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros o el término de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}