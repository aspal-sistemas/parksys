import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewerProps {
  latitude?: string | number;
  longitude?: string | number;
  parkName?: string;
  className?: string;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

// Componente para manejar clicks en el mapa
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function MapViewer({ 
  latitude, 
  longitude, 
  parkName, 
  className, 
  height = "300px", 
  onMapClick,
  selectedLocation 
}: MapViewerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  if (!position) {
    return (
      <div className={`bg-gray-100 rounded-lg border flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-sm">📍 Ubicación no disponible</div>
          <div className="text-xs mt-1">No se han establecido coordenadas para este parque</div>
        </div>
      </div>
    );
  }

  // Determinar qué posición mostrar para el marcador
  const markerPosition = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] as [number, number] : position;

  return (
    <div className={`relative ${className}`}>
      <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          dragging={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markerPosition && <Marker position={markerPosition} />}
          {onMapClick && <MapEvents onMapClick={onMapClick} />}
        </MapContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>📍 {parkName || 'Ubicación del parque'}</span>
        <span>
          {selectedLocation 
            ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
            : `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
          }
        </span>
      </div>
      {onMapClick && (
        <div className="mt-1 text-xs text-blue-600">
          Haz clic en el mapa para seleccionar una ubicación
        </div>
      )}
    </div>
  );
}