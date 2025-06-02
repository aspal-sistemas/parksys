import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar el icono del marcador por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function EditAssetEnhanced() {
  const [, params] = useRoute('/admin/assets/:id/edit-enhanced');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const id = params?.id;
  
  // Estados para el formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('activo');
  const [condition, setCondition] = useState('bueno');
  const [parkId, setParkId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocationDesc] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [amenityId, setAmenityId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  
  // Estados para datos de selección
  const [parks, setParks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);

  // Opciones de estado y condición
  const statusOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'maintenance', label: 'En Mantenimiento' },
    { value: 'retired', label: 'Retirado' },
    { value: 'storage', label: 'En Almacén' }
  ];

  const conditionOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' },
    { value: 'critico', label: 'Crítico' }
  ];

  // Cargar datos del activo y opciones
  useEffect(() => {
    if (!id) return;
    
    // Cargar activo
    fetch(`/api/assets/${id}`)
      .then(res => res.json())
      .then(asset => {
        setName(asset.name || '');
        setDescription(asset.description || '');
        setSerialNumber(asset.serialNumber || '');
        setNotes(asset.notes || '');
        setCost(asset.acquisitionCost || '');
        setStatus(asset.status || 'activo');
        setCondition(asset.condition || 'bueno');
        setParkId(asset.parkId ? String(asset.parkId) : '');
        setCategoryId(asset.categoryId ? String(asset.categoryId) : '');
        setLocationDesc(asset.locationDescription || '');
        setAmenityId(asset.amenityId ? String(asset.amenityId) : '');
        setLatitude(asset.latitude || '');
        setLongitude(asset.longitude || '');
        
        // Configurar posición del mapa si hay coordenadas
        if (asset.latitude && asset.longitude) {
          const lat = parseFloat(asset.latitude);
          const lng = parseFloat(asset.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapPosition([lat, lng]);
          }
        }
        
        // Corregir manejo de fechas para evitar problemas de zona horaria
        if (asset.acquisitionDate) {
          const date = new Date(asset.acquisitionDate + 'T00:00:00');
          setAcquisitionDate(date.toISOString().split('T')[0]);
        } else {
          setAcquisitionDate('');
        }
      })
      .catch(err => {
        console.error('Error al cargar activo:', err);
        setError('Error al cargar el activo');
      });

    // Cargar parques
    fetch('/api/parks')
      .then(res => res.json())
      .then(data => setParks(data))
      .catch(err => console.error('Error al cargar parques:', err));

    // Cargar categorías
    fetch('/api/asset-categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, [id]);

  // Estado para controlar si ya se cargaron los datos iniciales del activo
  const [assetDataLoaded, setAssetDataLoaded] = useState(false);
  
  // Cargar amenidades cuando cambie el parque seleccionado
  useEffect(() => {
    if (parkId) {
      fetch(`/api/parks/${parkId}/amenities`)
        .then(res => res.json())
        .then(data => setAmenities(data))
        .catch(err => console.error('Error al cargar amenidades:', err));
    } else {
      setAmenities([]);
      if (assetDataLoaded) {
        // Solo limpiar si ya se cargaron los datos del activo (cambio manual)
        setAmenityId('');
        setLocationDesc('');
      }
    }
  }, [parkId, assetDataLoaded]);

  // Marcar cuando se carguen los datos del activo por primera vez
  useEffect(() => {
    if (name && !assetDataLoaded) {
      setAssetDataLoaded(true);
    }
  }, [name, assetDataLoaded]);

  // Función para manejar el cambio manual de parque
  const handleParkChange = (newParkId: string) => {
    setParkId(newParkId);
    if (assetDataLoaded) {
      // Solo limpiar si ya se cargaron los datos del activo (cambio manual)
      setAmenityId('');
      setLocationDesc('');
    }
  };

  // Función para manejar el cambio de amenidad y actualizar la descripción de ubicación
  const handleAmenityChange = (selectedAmenityId: string) => {
    setAmenityId(selectedAmenityId);
    
    if (selectedAmenityId && selectedAmenityId !== 'none') {
      const selectedAmenity = amenities.find((a: any) => a.id === parseInt(selectedAmenityId));
      if (selectedAmenity) {
        setLocationDesc(selectedAmenity.name);
      }
    } else {
      // Limpiar descripción de ubicación cuando se selecciona "Sin amenidad" o se quita la selección
      setLocationDesc('');
    }
  };

  // Función para manejar el cambio de posición en el mapa
  const handleMapPositionChange = (newPosition: [number, number]) => {
    setMapPosition(newPosition);
    setLatitude(newPosition[0].toFixed(6));
    setLongitude(newPosition[1].toFixed(6));
  };

  // Función para actualizar el mapa cuando cambian las coordenadas manualmente
  const handleCoordinateChange = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapPosition([lat, lng]);
    }
  };

  const handleSave = async () => {
    if (!id) {
      setError('ID de activo no válido');
      return;
    }

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!parkId) {
      setError('Debe seleccionar un parque');
      return;
    }

    if (!categoryId) {
      setError('Debe seleccionar una categoría');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        serialNumber: serialNumber.trim(),
        notes: notes.trim(),
        acquisitionCost: cost ? cost.trim() : undefined, // Enviar como string
        status,
        condition,
        parkId: parseInt(parkId),
        categoryId: parseInt(categoryId),
        location: location.trim(), // Cambiar de locationDescription a location
        acquisitionDate: acquisitionDate || undefined,
        amenityId: amenityId && amenityId !== 'none' ? parseInt(amenityId) : null
      };

      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      setSuccess('Activo actualizado correctamente');
      
      // Redirigir después de un momento
      setTimeout(() => {
        setLocation(`/admin/assets/${id}`);
      }, 1500);

    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al actualizar el activo. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/admin/assets/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Editar Activo</h1>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Información del Activo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del activo"
                />
              </div>

              <div>
                <Label htmlFor="serialNumber">Número de Serie</Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Número de serie"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del activo"
                rows={3}
              />
            </div>

            {/* Selecciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Parque *</Label>
                <Select value={parkId} onValueChange={handleParkChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar parque" />
                  </SelectTrigger>
                  <SelectContent>
                    {parks.map((park: any) => (
                      <SelectItem key={park.id} value={String(park.id)}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoría *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenidad (opcional) */}
            <div>
              <Label>Amenidad (Opcional)</Label>
              <Select 
                value={amenityId} 
                onValueChange={handleAmenityChange}
                disabled={!parkId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={parkId ? "Seleccionar amenidad" : "Primero seleccione un parque"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin amenidad</SelectItem>
                  {amenities.map((amenity: any) => (
                    <SelectItem key={amenity.id} value={String(amenity.id)}>
                      {amenity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado y condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condición</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar condición" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Costo de Adquisición</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="acquisitionDate">Fecha de Adquisición</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Descripción de Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder={amenityId && amenityId !== 'none' ? "Se completó automáticamente desde la amenidad" : "Descripción manual de la ubicación"}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales sobre el activo"
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation(`/admin/assets/${id}`)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}