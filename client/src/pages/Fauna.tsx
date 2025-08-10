import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  Shield,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  MapPin,
  Calendar,
  Leaf
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface FaunaResponse {
  species: FaunaSpecies[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const categoryColors = {
  'aves': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Bird },
  'mamiferos': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: Rabbit },
  'reptiles': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: TreePine },
  'anfibios': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', icon: Fish },
  'insectos': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: Bug },
  'peces': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', icon: Fish }
};

const conservationColors = {
  'estable': { bg: 'bg-green-100', text: 'text-green-800', label: 'Estable' },
  'vulnerable': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Vulnerable' },
  'en_peligro': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En Peligro' },
  'critico': { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico' },
  'extinto_silvestre': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Extinto en Silvestre' }
};

function SpeciesCard({ species, viewMode }: { species: FaunaSpecies; viewMode: 'grid' | 'list' }) {
  const categoryConfig = categoryColors[species.category];
  const conservationConfig = conservationColors[species.conservationStatus];
  const IconComponent = categoryConfig.icon;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              {species.photoUrl || species.imageUrl ? (
                <img
                  src={species.photoUrl || species.imageUrl}
                  alt={species.commonName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {species.isEndangered && (
                <div className="absolute -top-2 -right-2">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {species.commonName}
                  </h3>
                  <p className="text-sm italic text-gray-600">
                    {species.scientificName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Familia: {species.family}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={`${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
                    {species.category}
                  </Badge>
                  <Badge className={`${conservationConfig.bg} ${conservationConfig.text}`}>
                    {conservationConfig.label}
                  </Badge>
                </div>
              </div>
              
              {species.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {species.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {species.habitat && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{species.habitat}</span>
                  </div>
                )}
                {species.diet && (
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4" />
                    <span>{species.diet}</span>
                  </div>
                )}
                {species.lifespan && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{species.lifespan} años</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {species.isNocturnal && (
                    <Badge variant="outline" className="text-xs">
                      Nocturno
                    </Badge>
                  )}
                  {species.isMigratory && (
                    <Badge variant="outline" className="text-xs">
                      Migratorio
                    </Badge>
                  )}
                </div>
                <Link href={`/fauna/${species.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="relative">
        {species.photoUrl || species.imageUrl ? (
          <img
            src={species.photoUrl || species.imageUrl}
            alt={species.commonName}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-t-lg flex items-center justify-center">
            <IconComponent className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {species.isEndangered && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Protegida
            </Badge>
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <Badge className={`${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
            {species.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {species.commonName}
          </h3>
          <p className="text-sm italic text-gray-600 line-clamp-1">
            {species.scientificName}
          </p>
          <p className="text-xs text-gray-500">
            {species.family}
          </p>
        </div>
        
        <div className="mb-3">
          <Badge className={`${conservationConfig.bg} ${conservationConfig.text} text-xs`}>
            {conservationConfig.label}
          </Badge>
        </div>
        
        {species.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {species.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex gap-2">
            {species.isNocturnal && (
              <Badge variant="outline" className="text-xs">
                Nocturno
              </Badge>
            )}
            {species.isMigratory && (
              <Badge variant="outline" className="text-xs">
                Migratorio
              </Badge>
            )}
          </div>
        </div>
        
        <Link href={`/fauna/${species.id}`}>
          <Button className="w-full" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver Ficha Completa
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Fauna() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conservationFilter, setConservationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = viewMode === 'grid' ? 12 : 8;

  // Query para obtener especies públicas
  const { data: speciesResponse, isLoading } = useQuery<FaunaResponse>({
    queryKey: ['/api/fauna/public/species', currentPage, itemsPerPage, searchTerm, categoryFilter, conservationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        category: categoryFilter,
        conservation_status: conservationFilter
      });
      
      const response = await fetch(`/api/fauna/public/species?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar especies');
      }
      
      return response.json();
    }
  });

  const species = speciesResponse?.species || [];
  const pagination = speciesResponse?.pagination || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 };

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
                Fauna Urbana de Guadalajara
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre la diversidad de vida silvestre que habita en los parques urbanos de Guadalajara. 
              Cada especie forma parte del delicado equilibrio ecológico de nuestra ciudad.
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar especies por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="aves">Aves</SelectItem>
                    <SelectItem value="mamiferos">Mamíferos</SelectItem>
                    <SelectItem value="reptiles">Reptiles</SelectItem>
                    <SelectItem value="anfibios">Anfibios</SelectItem>
                    <SelectItem value="insectos">Insectos</SelectItem>
                    <SelectItem value="peces">Peces</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={conservationFilter} onValueChange={(value) => {
                  setConservationFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Conservación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="estable">Estable</SelectItem>
                    <SelectItem value="vulnerable">Vulnerable</SelectItem>
                    <SelectItem value="en_peligro">En Peligro</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Mostrando {species.length} de {pagination.total} especies
            </p>
          </div>

          {/* Contenido principal */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : species.length === 0 ? (
            <div className="text-center py-12">
              <Bird className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron especies
              </h3>
              <p className="text-gray-600">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          ) : (
            <>
              {/* Grid de especies */}
              <div className={`mb-8 ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
              }`}>
                {species.map((species) => (
                  <SpeciesCard 
                    key={species.id} 
                    species={species} 
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Llamada a la acción */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white text-center mt-12">
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