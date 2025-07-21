import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, MapPin, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface LocationSelectorProps {
  parkId?: number;
  value?: string;
  onChange: (location: string) => void;
  placeholder?: string;
  disabled?: boolean;
}



const LocationSelector: React.FC<LocationSelectorProps> = ({
  parkId,
  value = '',
  onChange,
  placeholder = 'Seleccionar ubicación',
  disabled = false
}) => {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [selectedType, setSelectedType] = useState<'custom'>('custom');

  // Pre-populate custom location if current value exists
  useEffect(() => {
    if (value) {
      setSelectedType('custom');
      setCustomLocation(value);
    }
  }, [value]);

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      setSelectedType('custom');
      onChange(customLocation.trim());
      setIsCustomDialogOpen(false);
      setCustomLocation('');
    }
  };

  if (!parkId) {
    return (
      <div className="space-y-2">
        <Label>Ubicación</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Seleccione primero un parque"
          disabled={true}
          className="bg-gray-50"
        />
        <p className="text-sm text-muted-foreground">
          Seleccione un parque para ver las ubicaciones disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Current selection display */}
      {value && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">{value}</span>
          <Badge variant="secondary" className="text-xs">
            Personalizada
          </Badge>
        </div>
      )}

      {/* Ubicaciones del parque - Pendiente de implementar */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ubicaciones del parque</Label>
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Ubicaciones específicas del parque</p>
            <p className="text-xs text-gray-400 mt-1">
              (Pendiente de configuración)
            </p>
          </div>
        </div>
      </div>



      {/* Custom location dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ubicación personalizada
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" aria-describedby="location-selector-description">
          <DialogHeader>
            <DialogTitle>Agregar ubicación personalizada</DialogTitle>
            <DialogDescription>
              Especifique una ubicación dentro del parque que no aparece en las opciones disponibles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-location">Nombre de la ubicación</Label>
              <Input
                id="custom-location"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Ej: Área de juegos sector norte"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomLocation();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCustomDialogOpen(false);
                setCustomLocation('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCustomLocation}
              disabled={!customLocation.trim()}
            >
              Agregar ubicación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear selection */}
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          disabled={disabled}
          className="text-muted-foreground"
        >
          Limpiar selección
        </Button>
      )}
    </div>
  );
};

export default LocationSelector;