import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditAssetBasic() {
  const [, params] = useRoute('/admin/assets/:id/edit-basic');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const id = params?.id;
  
  // Estados básicos para el formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');

  // Cargar datos del activo
  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/assets/${id}`)
      .then(res => res.json())
      .then(asset => {
        setName(asset.name || '');
        setDescription(asset.description || '');
        setSerialNumber(asset.serialNumber || '');
        setNotes(asset.notes || '');
        setCost(asset.acquisitionCost || '');
      })
      .catch(err => {
        console.error('Error al cargar activo:', err);
        setError('Error al cargar el activo');
      });
  }, [id]);

  const handleSave = async () => {
    if (!id) {
      setError('ID de activo no válido');
      return;
    }

    if (!name.trim()) {
      setError('El nombre es obligatorio');
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
        parkId: 5, // Parque por defecto
        categoryId: 2, // Categoría por defecto
        status: 'activo',
        condition: 'bueno',
        acquisitionCost: cost ? parseFloat(cost) : undefined
      };

      console.log('Enviando datos:', updateData);

      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Actualización exitosa:', result);
        setSuccess('¡Activo actualizado correctamente!');
        
        // Redireccionar después de 2 segundos
        setTimeout(() => {
          setLocation(`/admin/assets/${id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Error de respuesta:', errorData);
        setError(errorData.message || 'Error al actualizar el activo');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation(`/admin/assets/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Activo
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Activo (Básico)
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Activo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del activo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del activo"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Número de Serie</Label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Número de serie"
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation(`/admin/assets/${id}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}