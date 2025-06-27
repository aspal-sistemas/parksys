import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, X, ZoomIn, ZoomOut } from 'lucide-react';

interface TreePhotoViewerProps {
  photoUrl?: string;
  customPhotoUrl?: string;
  commonName: string;
  scientificName: string;
  photoCaption?: string;
}

export default function TreePhotoViewer({ 
  photoUrl, 
  customPhotoUrl,
  commonName, 
  scientificName, 
  photoCaption 
}: TreePhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Usar foto personalizada (cargada desde backend) con prioridad, o URL externa como respaldo
  const finalPhotoUrl = customPhotoUrl || photoUrl;

  // Si no hay foto, no mostrar el botón
  if (!finalPhotoUrl) {
    return null;
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <>
      {/* Botón para abrir el visor */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-700"
        onClick={() => setIsOpen(true)}
        title="Ver foto ampliada"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Modal del visualizador */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-green-800">
                {commonName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {/* Controles de zoom */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Alejar"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  title="Acercar"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                  title="Zoom original"
                >
                  1:1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  title="Cerrar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-green-600 italic">{scientificName}</p>
          </DialogHeader>

          {/* Contenedor de la imagen */}
          <div className="flex-1 overflow-auto p-6 pt-0">
            <div className="flex justify-center items-center min-h-[400px]">
              <div 
                className="relative transition-transform duration-200 ease-in-out"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={finalPhotoUrl}
                  alt={`Foto de ${commonName} (${scientificName})`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMjUgMTUwIDc1LTc1IDc1IDc1LTc1IDc1LTc1LTc1eiIgZmlsbD0iIzllYTNhOCIvPgo8dGV4dCB4PSIyMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5Gb3RvIG5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
            </div>

            {/* Información adicional */}
            {photoCaption && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Descripción:</h4>
                <p className="text-sm text-green-700">{photoCaption}</p>
              </div>
            )}

            {/* Instrucciones de uso */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Usa los controles de zoom o haz scroll para navegar la imagen
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}