import React, { useState } from 'react';
import { Search, X, Filter, MapPin, TreePine, Sparkles, Star, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Amenity, PARK_TYPES } from '@shared/schema';
import AmenityIcon from './AmenityIcon';

interface ModernFilterSidebarProps {
  onApplyFilters: (filters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    amenityIds?: number[];
  }) => void;
}

const ModernFilterSidebar: React.FC<ModernFilterSidebarProps> = ({ onApplyFilters }) => {
  const [search, setSearch] = useState('');
  const [parkType, setParkType] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('recreación');

  // Deshabilitado para simplificar interfaz
  const amenities: Amenity[] = [];

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      parkType: parkType && parkType !== 'todos' ? parkType : undefined,
      postalCode: postalCode || undefined,
      amenityIds: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setParkType('');
    setPostalCode('');
    setSelectedAmenities([]);
    onApplyFilters({});
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Simplificamos el agrupado de amenidades por ahora
  const amenitiesByCategory = {
    "general": amenities || []
  };

  // Configuración de categorías con colores y iconos modernos
  const categoryConfig = {
    "recreación": { 
      name: "Recreación", 
      icon: Sparkles, 
      color: "from-pink-500 to-rose-500",
      bg: "bg-gradient-to-r from-pink-50 to-rose-50",
      border: "border-pink-200",
      text: "text-pink-700"
    },
    "deportes": { 
      name: "Deportes", 
      icon: Zap, 
      color: "from-orange-500 to-amber-500",
      bg: "bg-gradient-to-r from-orange-50 to-amber-50",
      border: "border-orange-200",
      text: "text-orange-700"
    },
    "servicios": { 
      name: "Servicios", 
      icon: Star, 
      color: "from-blue-500 to-cyan-500",
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
      border: "border-blue-200",
      text: "text-blue-700"
    },
    "naturaleza": { 
      name: "Naturaleza", 
      icon: TreePine, 
      color: "from-green-500 to-emerald-500",
      bg: "bg-gradient-to-r from-green-50 to-emerald-50",
      border: "border-green-200",
      text: "text-green-700"
    },
    "accesibilidad": { 
      name: "Accesibilidad", 
      icon: MapPin, 
      color: "from-purple-500 to-violet-500",
      bg: "bg-gradient-to-r from-purple-50 to-violet-50",
      border: "border-purple-200",
      text: "text-purple-700"
    },
    "infraestructura": { 
      name: "Infraestructura", 
      icon: Filter, 
      color: "from-gray-500 to-slate-500",
      bg: "bg-gradient-to-r from-gray-50 to-slate-50",
      border: "border-gray-200",
      text: "text-gray-700"
    }
  };

  const sortedCategories = Object.keys(amenitiesByCategory);

  return (
    <div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header moderno con gradiente */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Descubre Parques</h2>
            <p className="text-white/80 text-sm">Encuentra tu espacio perfecto</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Búsqueda mejorada */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                className="pl-10 border-0 bg-white shadow-sm text-gray-900 placeholder:text-gray-500"
                placeholder="Buscar por nombre o ubicación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros básicos */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-600" />
            Filtros Básicos
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Parque</Label>
              <Select value={parkType} onValueChange={setParkType}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {Object.entries(PARK_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Código Postal</Label>
              <Input
                type="text"
                className="bg-white border-gray-200"
                placeholder="Ej: 06700"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenidades por categorías con diseño moderno */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Amenidades
            </h3>
            {selectedAmenities.length > 0 && (
              <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                {selectedAmenities.length} seleccionadas
              </Badge>
            )}
          </div>

          {/* Pestañas de categorías */}
          <div className="flex flex-wrap gap-2">
            {sortedCategories.map((category) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              if (!config) return null;
              
              const IconComponent = config.icon;
              const isActive = activeCategory === category;
              
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? `${config.bg} ${config.border} ${config.text} border shadow-sm` 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  {config.name}
                </button>
              );
            })}
          </div>

          {/* Grid de amenidades mejorado */}
          {activeCategory && amenitiesByCategory[activeCategory] && (
            <div className="grid grid-cols-2 gap-3">
              {amenitiesByCategory[activeCategory].map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                const config = categoryConfig[amenity.category as keyof typeof categoryConfig];
                
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`
                      group relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? `${config?.border} ${config?.bg} shadow-md scale-105` 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`
                        p-3 rounded-xl transition-colors duration-200
                        ${isSelected 
                          ? 'bg-white/80 shadow-sm' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                        }
                      `}>
                        <AmenityIcon 
                          name={amenity.icon} 
                          customIconUrl={amenity.customIconUrl || null}
                          iconType={amenity.icon === 'custom' ? 'custom' : 'system'}
                          size={60}
                          className={isSelected ? config?.text : 'text-gray-600'}
                        />
                      </div>
                      <span className={`
                        text-xs font-medium leading-tight
                        ${isSelected ? config?.text : 'text-gray-700'}
                      `}>
                        {amenity.name}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          
          {(search || parkType || postalCode || selectedAmenities.length > 0) && (
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              className="px-4 border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Resumen de filtros activos */}
        {(search || parkType || postalCode || selectedAmenities.length > 0) && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-primary-900 mb-2">Filtros Activos</h4>
              <div className="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" className="bg-white text-primary-700">
                    Búsqueda: {search}
                  </Badge>
                )}
                {parkType && parkType !== 'todos' && (
                  <Badge variant="secondary" className="bg-white text-primary-700">
                    Tipo: {PARK_TYPES[parkType as keyof typeof PARK_TYPES]}
                  </Badge>
                )}
                {postalCode && (
                  <Badge variant="secondary" className="bg-white text-primary-700">
                    CP: {postalCode}
                  </Badge>
                )}
                {selectedAmenities.length > 0 && (
                  <Badge variant="secondary" className="bg-white text-primary-700">
                    {selectedAmenities.length} amenidades
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModernFilterSidebar;