import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Car, Heart, Info } from "lucide-react";

interface Park {
  id: number;
  name: string;
  parkType: string;
  description: string | null;
  address: string;
  area: string | null;
  capacity: string | null;
  openingHours: string | null;
  isPetFriendly: boolean | null;
  hasParking: boolean | null;
  amenities?: Array<{
    id: number;
    name: string;
    icon: string | null;
  }>;
}

interface ExtendedParksListProps {
  parks: Park[];
}

const parkTypeTranslations = {
  'metropolitano': 'Metropolitano',
  'vecinal': 'Vecinal',
  'regional': 'Regional',
  'lineal': 'Lineal',
  'bolsillo': 'De Bolsillo'
};

const parkTypeColors = {
  'metropolitano': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'vecinal': 'bg-blue-100 text-blue-800 border-blue-200',
  'regional': 'bg-purple-100 text-purple-800 border-purple-200',
  'lineal': 'bg-orange-100 text-orange-800 border-orange-200',
  'bolsillo': 'bg-pink-100 text-pink-800 border-pink-200'
};

export default function ExtendedParksList({ parks }: ExtendedParksListProps) {
  const [expandedPark, setExpandedPark] = useState<number | null>(null);

  const toggleExpanded = (parkId: number) => {
    setExpandedPark(expandedPark === parkId ? null : parkId);
  };

  if (parks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron parques
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda para encontrar parques que coincidan con tus criterios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {parks.map((park) => (
        <Card key={park.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-gray-900 mb-2">
                  {park.name}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {park.address}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={parkTypeColors[park.parkType as keyof typeof parkTypeColors] || 'bg-gray-100 text-gray-800'}
                  >
                    {parkTypeTranslations[park.parkType as keyof typeof parkTypeTranslations] || park.parkType}
                  </Badge>
                  
                  {park.area && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {parseInt(park.area).toLocaleString()} m²
                    </Badge>
                  )}
                  
                  {park.isPetFriendly && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Heart className="w-3 h-3 mr-1" />
                      Pet Friendly
                    </Badge>
                  )}
                  
                  {park.hasParking && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Car className="w-3 h-3 mr-1" />
                      Estacionamiento
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleExpanded(park.id)}
                className="ml-4"
              >
                <Info className="w-4 h-4 mr-1" />
                {expandedPark === park.id ? 'Menos' : 'Más'} info
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {park.description && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {park.description}
              </p>
            )}

            {/* Información básica siempre visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {park.openingHours && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Horario: {park.openingHours}</span>
                </div>
              )}
              
              {park.capacity && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Capacidad: {park.capacity} personas</span>
                </div>
              )}
            </div>

            {/* Amenidades */}
            {park.amenities && park.amenities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Amenidades disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  {park.amenities.slice(0, expandedPark === park.id ? undefined : 6).map((amenity) => (
                    <Badge key={amenity.id} variant="secondary" className="text-xs">
                      {amenity.name}
                    </Badge>
                  ))}
                  {park.amenities.length > 6 && expandedPark !== park.id && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      +{park.amenities.length - 6} más
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Información extendida - solo visible cuando está expandido */}
            {expandedPark === park.id && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Detalles del parque</h5>
                    <div className="space-y-1 text-gray-600">
                      <p>Tipo: {parkTypeTranslations[park.parkType as keyof typeof parkTypeTranslations] || park.parkType}</p>
                      {park.area && <p>Área total: {parseInt(park.area).toLocaleString()} m²</p>}
                      {park.capacity && <p>Capacidad máxima: {park.capacity} personas</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Servicios</h5>
                    <div className="space-y-1 text-gray-600">
                      {park.openingHours && <p>Horarios: {park.openingHours}</p>}
                      <p>Mascotas: {park.isPetFriendly ? 'Permitidas' : 'No permitidas'}</p>
                      <p>Estacionamiento: {park.hasParking ? 'Disponible' : 'No disponible'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}