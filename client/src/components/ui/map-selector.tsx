import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  latitude?: string;
  longitude?: string;
  onLocationChange: (lat: string, lng: string) => void;
  className?: string;
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: string, lng: string) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat.toString(), lng.toString());
    },
  });
  return null;
}

// Componente para mover el mapa cuando cambian las coordenadas
function MapController({ latitude, longitude }: { latitude?: string; longitude?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 15);
      }
    }
  }, [map, latitude, longitude]);
  
  return null;
}

export function MapSelector({ latitude, longitude, onLocationChange, className }: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    } else {
      // Coordenadas por defecto para México (Centro del país)
      setPosition([19.4326, -99.1332]);
    }
  }, [latitude, longitude]);

  const handleLocationChange = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setPosition([latNum, lngNum]);
      onLocationSelect({ lat: latNum, lng: lngNum });
    }
  };

  if (!position) {
    return <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Cargando mapa...</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-2 text-sm text-gray-600">
        Haz clic en el mapa para seleccionar la ubicación del parque
      </div>
      <div style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden border">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationChange={handleLocationChange} />
          <MapController latitude={latitude} longitude={longitude} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {position && (
        <div className="mt-2 text-xs text-gray-500">
          Coordenadas seleccionadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}