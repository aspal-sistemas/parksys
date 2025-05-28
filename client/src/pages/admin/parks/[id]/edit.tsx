import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";

const EditPark = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/admin/parks/:id/edit");
  const parkId = params?.id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    area: "",
    parkType: "",
    municipalityId: "",
  });

  // Fetch park data
  const { data: park, isLoading } = useQuery({
    queryKey: [`/api/parks/${parkId}`],
    enabled: !!parkId,
  });

  // Fetch municipalities
  const { data: municipalities = [] } = useQuery({
    queryKey: ["/api/municipalities"],
  });

  // Update form data when park data loads
  useEffect(() => {
    if (park) {
      setFormData({
        name: park.name || "",
        description: park.description || "",
        address: park.address || "",
        area: park.area?.toString() || "",
        parkType: park.parkType || "",
        municipalityId: park.municipalityId?.toString() || "",
      });
    }
  }, [park]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/parks/${parkId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          area: data.area ? parseFloat(data.area) : null,
          municipalityId: data.municipalityId ? parseInt(data.municipalityId) : null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parks"] });
      toast({
        title: "Parque actualizado",
        description: "Los datos del parque han sido actualizados exitosamente.",
      });
      window.location.href = "/admin/parks";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el parque.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editar Parque">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando datos del parque...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editar Parque">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/admin/parks"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a parques
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Editar: {park?.name}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Parque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Parque *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre del parque"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkType">Tipo de Parque *</Label>
                  <Select
                    value={formData.parkType}
                    onValueChange={(value) => handleInputChange("parkType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metropolitano">Metropolitano</SelectItem>
                      <SelectItem value="barrial">Barrial</SelectItem>
                      <SelectItem value="vecinal">Vecinal</SelectItem>
                      <SelectItem value="lineal">Lineal</SelectItem>
                      <SelectItem value="ecologico">Ecológico</SelectItem>
                      <SelectItem value="botanico">Botánico</SelectItem>
                      <SelectItem value="deportivo">Deportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipalityId">Municipio *</Label>
                  <Select
                    value={formData.municipalityId}
                    onValueChange={(value) => handleInputChange("municipalityId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {(municipalities as any[])?.map((municipality: any) => (
                        <SelectItem key={municipality.id} value={municipality.id.toString()}>
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="Área en metros cuadrados"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Dirección completa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descripción del parque"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = "/admin/parks"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditPark;