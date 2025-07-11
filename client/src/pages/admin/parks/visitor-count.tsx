import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Plus, FileText, TrendingUp, MapPin, Clock, Sun, Cloud, CloudRain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VisitorCount {
  id: number;
  parkId: number;
  parkName: string;
  date: string;
  adults: number;
  children: number;
  groups: number;
  totalVisitors: number;
  countingMethod: string;
  dayType: string;
  weather?: string;
  notes?: string;
  createdAt: string;
}

interface Park {
  id: number;
  name: string;
  municipality: string;
}

interface VisitorCountForm {
  parkId: number;
  date: string;
  adults: number;
  children: number;
  groups: number;
  countingMethod: string;
  dayType: string;
  weather?: string;
  notes?: string;
}

export default function VisitorCountPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPark, setSelectedPark] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VisitorCountForm>({
    parkId: 0,
    date: new Date().toISOString().split('T')[0],
    adults: 0,
    children: 0,
    groups: 0,
    countingMethod: "estimation",
    dayType: "weekday",
    weather: "sunny",
    notes: ""
  });

  // Queries
  const { data: parks } = useQuery<Park[]>({
    queryKey: ['/api/parks'],
  });

  const { data: visitorCounts, isLoading } = useQuery<{
    data: VisitorCount[];
    pagination: any;
  }>({
    queryKey: ['/api/visitor-counts', selectedPark],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPark && selectedPark !== 'all') params.set('parkId', selectedPark);
      params.set('limit', '20');
      
      const response = await fetch(`/api/visitor-counts?${params}`);
      return response.json();
    },
  });

  // Mutation para crear nuevo registro
  const createVisitorCount = useMutation({
    mutationFn: async (data: VisitorCountForm) => {
      return apiRequest('/api/visitor-counts', {
        method: 'POST',
        body: { ...data, registeredBy: 2 } // TODO: Usar user ID del contexto
      });
    },
    onSuccess: () => {
      toast({
        title: "Registro exitoso",
        description: "El conteo de visitantes ha sido registrado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/visitor-counts'] });
      setShowForm(false);
      setFormData({
        parkId: 0,
        date: new Date().toISOString().split('T')[0],
        adults: 0,
        children: 0,
        groups: 0,
        countingMethod: "estimation",
        dayType: "weekday",
        weather: "sunny",
        notes: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el conteo de visitantes",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.parkId === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona un parque",
        variant: "destructive",
      });
      return;
    }
    createVisitorCount.mutate(formData);
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      estimation: "Estimación",
      manual_counter: "Contador manual",
      event_based: "Basado en eventos",
      entrance_control: "Control de acceso"
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getDayTypeLabel = (dayType: string) => {
    const types = {
      weekday: "Día laborable",
      weekend: "Fin de semana",
      holiday: "Día festivo"
    };
    return types[dayType as keyof typeof types] || dayType;
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="h-4 w-4" />;
      case 'cloudy': return <Cloud className="h-4 w-4" />;
      case 'rainy': return <CloudRain className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getTotalVisitors = () => {
    return formData.adults + formData.children + formData.groups;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conteo de Visitantes</h1>
            <p className="text-gray-600">Gestión diaria de visitantes por parque</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Button>
        </div>

        <Tabs defaultValue="registros" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registros">Registros Diarios</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="park-filter">Parque</Label>
                    <Select value={selectedPark} onValueChange={setSelectedPark}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los parques" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los parques</SelectItem>
                        {parks?.map((park) => (
                          <SelectItem key={park.id} value={park.id.toString()}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de registros */}
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando registros...</p>
                </div>
              ) : visitorCounts?.data?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay registros de visitantes</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Comienza registrando el conteo diario de visitantes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                visitorCounts?.data?.map((count) => (
                  <Card key={count.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <h3 className="font-semibold text-lg">{count.parkName}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(count.date), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            {count.totalVisitors}
                          </div>
                          <div className="text-sm text-gray-500">visitantes</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-700">{count.adults}</div>
                          <div className="text-sm text-blue-600">Adultos</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-700">{count.children}</div>
                          <div className="text-sm text-green-600">Niños</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-700">{count.groups}</div>
                          <div className="text-sm text-purple-600">Grupos</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getDayTypeLabel(count.dayType)}
                        </Badge>
                        <Badge variant="outline">
                          {getMethodLabel(count.countingMethod)}
                        </Badge>
                        {count.weather && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getWeatherIcon(count.weather)}
                            {count.weather}
                          </Badge>
                        )}
                      </div>

                      {count.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notas:</strong> {count.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reportes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Reportes y Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Funcionalidad de reportes en desarrollo</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Próximamente: estadísticas mensuales, comparativas anuales y exportación de datos
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nuevo Registro de Visitantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parkId">Parque *</Label>
                      <Select 
                        value={formData.parkId.toString()} 
                        onValueChange={(value) => setFormData({...formData, parkId: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un parque" />
                        </SelectTrigger>
                        <SelectContent>
                          {parks?.filter(park => park.id && park.name).map((park) => (
                            <SelectItem key={park.id} value={park.id.toString()}>
                              {park.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">Adultos</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.adults}
                        onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="children">Niños</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.children}
                        onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groups">Grupos</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.groups}
                        onChange={(e) => setFormData({...formData, groups: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">{getTotalVisitors()}</div>
                      <div className="text-sm text-emerald-600">Total de visitantes</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="countingMethod">Método de conteo *</Label>
                      <Select 
                        value={formData.countingMethod} 
                        onValueChange={(value) => setFormData({...formData, countingMethod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estimation">Estimación</SelectItem>
                          <SelectItem value="manual_counter">Contador manual</SelectItem>
                          <SelectItem value="event_based">Basado en eventos</SelectItem>
                          <SelectItem value="entrance_control">Control de acceso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dayType">Tipo de día *</Label>
                      <Select 
                        value={formData.dayType} 
                        onValueChange={(value) => setFormData({...formData, dayType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekday">Día laborable</SelectItem>
                          <SelectItem value="weekend">Fin de semana</SelectItem>
                          <SelectItem value="holiday">Día festivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weather">Clima</Label>
                    <Select 
                      value={formData.weather} 
                      onValueChange={(value) => setFormData({...formData, weather: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">Soleado</SelectItem>
                        <SelectItem value="cloudy">Nublado</SelectItem>
                        <SelectItem value="rainy">Lluvioso</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Observaciones, eventos especiales, etc."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={createVisitorCount.isPending}
                    >
                      {createVisitorCount.isPending ? "Guardando..." : "Guardar Registro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}