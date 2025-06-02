import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/AdminLayout";
import { ArrowLeft, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SimpleAssetData {
  name: string;
  serialNumber: string;
  acquisitionCost: string;
  description: string;
}

const EditAssetSimplePage = ({ id }: { id: string }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SimpleAssetData>({
    name: "",
    serialNumber: "",
    acquisitionCost: "",
    description: ""
  });

  // Obtener datos del activo
  const { data: asset, isLoading } = useQuery({
    queryKey: [`/api/assets/${id}`],
  });

  // Cargar datos en el formulario cuando se obtienen del servidor
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || "",
        serialNumber: asset.serialNumber || "",
        acquisitionCost: asset.acquisitionCost || "",
        description: asset.description || ""
      });
    }
  }, [asset]);

  // Mutación para actualizar el activo
  const updateMutation = useMutation({
    mutationFn: async (data: SimpleAssetData) => {
      console.log("=== ENVIANDO DATOS ===", data);
      
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("=== RESPUESTA DEL SERVIDOR ===", result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Activo actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${id}`] });
      setLocation(`/admin/assets/${id}`);
    },
    onError: (error) => {
      console.error("Error en la mutación:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORMULARIO ENVIADO ===");
    console.log("Datos actuales:", formData);
    
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof SimpleAssetData, value: string) => {
    console.log(`Cambiando ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="text-center">Cargando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setLocation(`/admin/assets/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Activo
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Editar Activo (Versión Simple)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número de Serie</label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Costo de Adquisición</label>
                <Input
                  value={formData.acquisitionCost}
                  onChange={(e) => handleInputChange('acquisitionCost', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setLocation(`/admin/assets/${id}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  onClick={() => console.log("=== BOTÓN CLICKED ===")}
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditAssetSimplePage;