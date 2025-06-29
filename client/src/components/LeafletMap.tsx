import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  area?: string;
}

export default function LeafletMap({ latitude, longitude, title, location, area }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      console.log('Initializing map with coordinates:', latitude, longitude);
      
      // Crear el mapa
      const map = L.map(mapRef.current).setView([latitude, longitude], 17);
      mapInstanceRef.current = map;

      // Agregar tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Agregar marcador
      const marker = L.marker([latitude, longitude]).addTo(map);
      
      // Agregar popup
      let popupContent = `<div style="text-align: center;">
        <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${title}</h3>
        <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${location}</p>`;
      
      if (area) {
        popupContent += `<p style="font-size: 12px; color: #999;">Área: ${area} m²</p>`;
      }
      
      popupContent += `</div>`;
      
      marker.bindPopup(popupContent);

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title, location, area]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-lg border"
      style={{ minHeight: '256px' }}
    />
  );
}