import React, { useState, useEffect } from 'react';
import { 
  CommandItem, 
  CommandEmpty, 
  CommandGroup 
} from "@/components/ui/command";
import { toast } from '@/hooks/use-toast';
import { Check, Loader } from 'lucide-react';
import AmenityIcon from '@/components/AmenityIcon';

interface AmenitySelectorProps {
  parkId: string | undefined;
  existingAmenities: any[];
  onAmenityAdded: (newAmenities: any[]) => void;
}

const AmenitySelector: React.FC<AmenitySelectorProps> = ({ 
  parkId, 
  existingAmenities, 
  onAmenityAdded 
}) => {
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar las amenidades disponibles cuando se abre el selector
  useEffect(() => {
    const loadAmenities = async () => {
      if (!parkId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query desactivada para simplificar interfaz
        // const response = await fetch('/api/amenities');
        setAvailableAmenities([]);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error al cargar amenidades:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las amenidades disponibles.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAmenities();
  }, [parkId, existingAmenities]);

  // Función para añadir una amenidad al parque
  const addAmenity = async (amenity: any) => {
    if (!parkId) {
      toast({
        title: "Error",
        description: "Debes guardar el parque antes de añadir amenidades.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/parks/${parkId}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer direct-token-1'
        },
        body: JSON.stringify({
          amenityId: amenity.id,
          moduleName: '',
          locationLatitude: null,
          locationLongitude: null,
          surfaceArea: null,
          status: 'Activa',
          description: ''
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo añadir la amenidad');
      }

      // Recargar las amenidades del parque
      const reloadResponse = await fetch(`/api/parks/${parkId}/amenities`);
      if (reloadResponse.ok) {
        const updatedAmenities = await reloadResponse.json();
        onAmenityAdded(updatedAmenities);

        toast({
          title: "Amenidad añadida",
          description: `Se ha añadido ${amenity.name} al parque.`
        });
      }
    } catch (error) {
      console.error('Error al añadir amenidad:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la amenidad al parque.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <CommandItem disabled className="flex items-center justify-center py-6">
        <Loader className="h-4 w-4 animate-spin mr-2" />
        <span>Cargando amenidades...</span>
      </CommandItem>
    );
  }

  if (availableAmenities.length === 0) {
    return (
      <CommandEmpty>
        No hay más amenidades disponibles para añadir.
      </CommandEmpty>
    );
  }

  return (
    <CommandGroup className="max-h-60 overflow-y-auto">
      {availableAmenities.map((amenity) => (
        <CommandItem
          key={amenity.id}
          value={amenity.name}
          onSelect={() => addAmenity(amenity)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-full mr-3">
              {amenity.icon && (
                <div className="w-5 h-5 flex items-center justify-center">
                  <AmenityIcon 
                    name={amenity.icon}
                    size={20}
                    iconType={amenity.iconType || 'system'}
                    customIconUrl={amenity.customIconUrl}
                  />
                </div>
              )}
            </div>
            <span>{amenity.name}</span>
          </div>
          <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100" />
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default AmenitySelector;