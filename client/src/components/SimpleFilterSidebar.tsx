import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Tag, Filter } from 'lucide-react';
import { PARK_TYPES } from '@shared/schema';

// Extendemos la interfaz de Amenity para incluir propiedades adicionales del API
interface ExtendedAmenity {
  id: number;
  name: string;
  icon: string | null;
  category?: string;
  iconType?: string;
  customIconUrl?: string;
  createdAt: Date;
}
import AmenityIcon from './AmenityIcon';
const parkIllustration = "/images/park-people-leisure.jpg";

interface SimpleFilterSidebarProps {
  onApplyFilters: (filters: {
    search?: string;
    parkType?: string;
    postalCode?: string;
    municipality?: string;
    amenityIds?: number[];
  }) => void;
}

export default function SimpleFilterSidebar({ onApplyFilters }: SimpleFilterSidebarProps) {
  const [search, setSearch] = useState('');
  const [parkType, setParkType] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Categorías de amenidades
  const amenityCategories = {
    todas: "Todas",
    deportivas: "Deportivas",
    recreativas: "Recreativas", 
    culturales: "Culturales",
    servicios: "Servicios",
    naturaleza: "Naturaleza",
    infantiles: "Infantiles",
    accesibilidad: "Accesibilidad"
  };

  // Deshabilitado para simplificar interfaz
  const amenities: ExtendedAmenity[] = [];
  const isLoading = false;

  // Función para categorizar amenidades por nombre
  const categorizeAmenity = (amenityName: string): string => {
    const name = amenityName.toLowerCase();
    
    if (name.includes('cancha') || name.includes('campo') || name.includes('pista') || 
        name.includes('deportivo') || name.includes('futbol') || name.includes('basquet') || 
        name.includes('tenis') || name.includes('voley') || name.includes('gimnasio') ||
        name.includes('atletismo') || name.includes('ciclismo')) {
      return 'deportivas';
    }
    
    if (name.includes('juego') || name.includes('infantil') || name.includes('niños') ||
        name.includes('columpios') || name.includes('resbaladilla') || name.includes('sube y baja')) {
      return 'infantiles';
    }
    
    if (name.includes('teatro') || name.includes('auditorio') || name.includes('biblioteca') ||
        name.includes('museo') || name.includes('cultural') || name.includes('exposicion')) {
      return 'culturales';
    }
    
    if (name.includes('baño') || name.includes('sanitario') || name.includes('estacionamiento') ||
        name.includes('seguridad') || name.includes('informacion') || name.includes('wifi') ||
        name.includes('agua') || name.includes('bebedero') || name.includes('basura')) {
      return 'servicios';
    }
    
    if (name.includes('jardin') || name.includes('arbol') || name.includes('flores') ||
        name.includes('sendero') || name.includes('bosque') || name.includes('lago') ||
        name.includes('naturaleza') || name.includes('ecologico')) {
      return 'naturaleza';
    }
    
    if (name.includes('accesible') || name.includes('discapacidad') || name.includes('rampa') ||
        name.includes('braille') || name.includes('inclus')) {
      return 'accesibilidad';
    }
    
    // Por defecto, recreativas
    return 'recreativas';
  };

  // Filtrar amenidades por categoría seleccionada
  const filteredAmenities = selectedCategory === 'todas' 
    ? amenities 
    : amenities.filter((amenity: ExtendedAmenity) => 
        categorizeAmenity(amenity.name) === selectedCategory
      );

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      parkType: parkType || undefined,
      postalCode: postalCode || undefined,
      municipality: municipality || undefined,
      amenityIds: selectedAmenities.length > 0 ? selectedAmenities : undefined
    });
  };

  // Aplicar filtros automáticamente cuando cambie la búsqueda
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onApplyFilters({
        search: search || undefined,
        parkType: parkType || undefined,
        postalCode: postalCode || undefined,
        municipality: municipality || undefined,
        amenityIds: selectedAmenities.length > 0 ? selectedAmenities : undefined
      });
    }, 300); // Debounce de 300ms para evitar demasiadas consultas

    return () => clearTimeout(timeoutId);
  }, [search, parkType, postalCode, municipality, selectedAmenities]);

  const handleClearFilters = () => {
    setSearch('');
    setParkType('');
    setPostalCode('');
    setMunicipality('');
    setSelectedAmenities([]);
    onApplyFilters({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Nuevo layout intercambiado: Columna izquierda con ilustración, columna derecha con búsqueda y tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        
        {/* Columna Izquierda: Ilustración Bosques Urbanos de Guadalajara */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
          <div className="bg-[#bcd256] text-gray-800 p-3 rounded-t-lg">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Bosques Urbanos de Guadalajara
            </h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <img
                src={parkIllustration}
                alt="Ilustración isométrica de espacios verdes urbanos con familias, actividades recreativas, lagos, árboles y bancas"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-sm font-medium bg-black/60 backdrop-blur-sm rounded px-3 py-2 text-center">
                  Espacios verdes para toda la familia
                </p>
              </div>
            </div>
            <div className="mt-4 px-3">
              <p className="text-gray-700 text-base font-medium leading-relaxed text-center">
                Descubre todo lo que Guadalajara tiene para ofrecerte a través de sus Bosques y Parques Urbanos. Puedes buscarlos por nombre, código postal, tipo de parque e instalaciones y servicios que cada uno ofrece.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Búsqueda + Tipos de Parque */}
        <div className="space-y-4">
          {/* Búsqueda de Parques */}
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
            <div className="bg-[#067f5f] text-white p-3 rounded-t-lg">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Búsqueda de Parques
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Parque
                </label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Ingrese nombre del parque..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#00a587] focus:ring-1 focus:ring-[#00a587]"
                />
              </div>
              <div>
                <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <Input
                  id="postal-code"
                  type="text"
                  placeholder="ej. 06100"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#00a587] focus:ring-1 focus:ring-[#00a587]"
                />
              </div>
              <div>
                <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">
                  Por Municipio
                </label>
                <Input
                  id="municipality"
                  type="text"
                  placeholder="ej. Guadalajara"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#00a587] focus:ring-1 focus:ring-[#00a587]"
                />
              </div>
            </div>
          </div>

          {/* Descubre tu Parque Ideal - Tipos (sin vecinal, de bolsillo, temático) */}
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
            <div className="bg-[#8498a5] text-white p-3 rounded-t-lg">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Descubre tu Parque Ideal
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">Tipos disponibles:</p>
              <div className="grid grid-cols-2 gap-2">
                {['urbano', 'natural', 'lineal', 'metropolitano'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-sm">
                    <input
                      type="radio"
                      name="parkType"
                      checked={parkType === type}
                      onChange={() => setParkType(type)}
                      className="w-4 h-4 text-[#00a587] border-gray-300 focus:ring-[#00a587]"
                    />
                    <span className="text-gray-700">
                      {type === 'urbano' ? 'Urbano' :
                       type === 'natural' ? 'Natural' :
                       type === 'lineal' ? 'Lineal' :
                       type === 'metropolitano' ? 'Metropolitano' :
                       type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSTALACIONES Y SERVICIOS - Sección completa abajo */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
        <div className="bg-[#bcd256] text-gray-800 p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5" />
            Amenidades, Instalaciones y Servicios
            <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-bold ml-2">
              {filteredAmenities.length} de {amenities.length} total
            </span>
            {selectedAmenities.length > 0 && (
              <span className="bg-[#00a587] text-white px-2 py-1 rounded-full text-xs font-bold">
                {selectedAmenities.length} seleccionados
              </span>
            )}
          </h3>
          
          {/* Filtro por categorías */}
          <div className="flex items-center gap-2">
            <Label htmlFor="category-filter" className="text-sm font-medium whitespace-nowrap">
              Filtrar por categoría:
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(amenityCategories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="p-4">
          {filteredAmenities.length > 20 && (
            <div className="mb-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
              💡 <strong>Desplázate hacia abajo</strong> para ver todas las {filteredAmenities.length} amenidades disponibles
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredAmenities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 shadow-inner bg-gray-50">
              {filteredAmenities.map((amenity) => (
                <label 
                  key={amenity.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-sm group"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="w-4 h-4 text-[#00a587] border-gray-300 rounded focus:ring-[#00a587]"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <AmenityIcon 
                      name={amenity.name} 
                      iconType={(amenity.iconType || (amenity.icon === 'custom' ? 'custom' : 'system')) as 'custom' | 'system'}
                      customIconUrl={amenity.customIconUrl || null}
                      size={29} 
                      className="text-gray-600 group-hover:text-[#00a587] transition-colors flex-shrink-0" 
                    />
                    <span className="text-gray-800 truncate group-hover:text-[#067f5f] transition-colors">
                      {amenity.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          ) : selectedCategory !== 'todas' && filteredAmenities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay amenidades en la categoría "{amenityCategories[selectedCategory as keyof typeof amenityCategories]}"</p>
              <p className="text-xs mt-1">Prueba con otra categoría o selecciona "Todas"</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No se pudieron cargar las instalaciones</p>
              <p className="text-xs mt-1">Intenta recargar la página</p>
            </div>
          )}
          
          {/* Contador y acción de limpiar */}
          {selectedAmenities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedAmenities.length} servicio{selectedAmenities.length !== 1 ? 's' : ''} seleccionado{selectedAmenities.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedAmenities([])}
                  className="text-[#00a587] hover:text-[#067f5f] font-medium"
                >
                  Limpiar Todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción - Parte inferior */}
      <div className="p-6 border-t-2 border-gray-300 bg-gray-50">
        <div className="flex justify-center gap-4">
          <button
            onClick={handleApplyFilters}
            className="bg-[#00a587] hover:bg-[#067f5f] text-white font-semibold py-3 px-8 rounded border-2 border-[#00a587] transition-colors duration-200"
          >
            Buscar Parques
          </button>
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded border-2 border-gray-300 transition-colors duration-200"
          >
            Limpiar Filtros
          </button>
        </div>
        
        {/* Resumen de Resultados */}
        {(search || parkType || postalCode || municipality || selectedAmenities.length > 0) && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 bg-[#bcd256]/20 px-4 py-2 rounded-full">
              <span className="font-medium">Filtros Activos:</span>
              <span className="text-[#067f5f] font-semibold">
                {[
                  search && '1',
                  parkType && '1', 
                  postalCode && '1',
                  municipality && '1',
                  selectedAmenities.length > 0 && '1'
                ].filter(Boolean).length} aplicados
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}