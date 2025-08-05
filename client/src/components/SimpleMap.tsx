interface SimpleMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  area?: string;
}

export default function SimpleMap({ latitude, longitude, title, location, area }: SimpleMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  return (
    <div className="w-full h-64 rounded-lg border overflow-hidden bg-gray-100 relative">
      <iframe
        src={mapUrl}
        width="100%"
        height="256"
        style={{ border: 0 }}
        title={`Mapa de ${title}`}
        loading="lazy"
        className="w-full h-full"
      />
      
      {/* Overlay con información */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-md max-w-xs">
        <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{location}</p>
        {area && (
          <p className="text-xs text-gray-500 mt-1">Área: {area} m²</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </div>
      
      {/* Enlace para abrir en mapa completo */}
      <div className="absolute bottom-2 right-2">
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded shadow transition-colors"
        >
          Ver en mapa completo
        </a>
      </div>
    </div>
  );
}