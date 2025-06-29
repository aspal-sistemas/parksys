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

    // Delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      try {
        console.log('Initializing map with coordinates:', latitude, longitude);
        console.log('Map container element:', mapRef.current);
        console.log('Container dimensions:', mapRef.current?.offsetWidth, 'x', mapRef.current?.offsetHeight);
        
        // Crear el mapa
        const map = L.map(mapRef.current!, {
          center: [latitude, longitude],
          zoom: 15,
          scrollWheelZoom: true,
          zoomControl: true
        });
        
        mapInstanceRef.current = map;

        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Crear icono personalizado para concesión
        const concessionIcon = L.divIcon({
          html: `<div style="
            background-color: #00a587;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-45deg);
          ">
            <span style="
              color: white;
              font-size: 14px;
              font-weight: bold;
              transform: rotate(45deg);
            ">🏪</span>
          </div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        // Agregar marcador
        const marker = L.marker([latitude, longitude], { icon: concessionIcon }).addTo(map);
        
        // Agregar popup
        let popupContent = `<div style="text-align: center;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${title}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${location}</p>`;
        
        if (area) {
          popupContent += `<p style="font-size: 12px; color: #999;">Área: ${area} m²</p>`;
        }
        
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent).openPopup();

        // Invalidar el tamaño del mapa para asegurar renderizado correcto
        setTimeout(() => {
          map.invalidateSize();
          console.log('Map size invalidated');
        }, 100);

        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 50);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title, location, area]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-lg border bg-gray-100"
      style={{ 
        minHeight: '256px',
        height: '256px',
        width: '100%',
        position: 'relative',
        zIndex: 0
      }}
    />
  );
}