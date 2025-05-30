import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Eye, Users, MapPin, Calendar, Award, Clock } from "lucide-react";

interface Volunteer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  totalHours: number;
  preferredParkId: number | null;
  skills: string;
  isActive: boolean;
  parkName?: string;
}

export default function VolunteersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Obtener voluntarios
  const { data: volunteersData, isLoading } = useQuery({
    queryKey: ['/api/volunteers'],
  });

  const volunteers = Array.isArray(volunteersData) ? volunteersData : [];

  // Obtener parques para referencia
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Filtrar voluntarios
  const filteredVolunteers = volunteers.filter((volunteer: any) => {
    const matchesSearch = 
      (volunteer.firstName?.toLowerCase() || volunteer.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (volunteer.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (volunteer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || volunteer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'suspendido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Voluntarios</h1>
            <p className="text-muted-foreground">
              Administra los voluntarios registrados en el sistema
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Voluntario
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Voluntarios</p>
                  <p className="text-2xl font-bold">{volunteers.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold">
                    {volunteers.filter((v: any) => v.status === 'activo').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                  <p className="text-2xl font-bold">
                    {volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || v.total_hours || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
                  <p className="text-2xl font-bold">
                    {volunteers.filter((v: any) => {
                      const joinDate = new Date(v.joinDate || v.join_date || v.createdAt);
                      const now = new Date();
                      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de voluntarios */}
        <Card>
          <CardHeader>
            <CardTitle>Voluntarios Registrados</CardTitle>
            <CardDescription>
              Lista completa de voluntarios con información básica
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando voluntarios...</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron voluntarios</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVolunteers.map((volunteer: any) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {volunteer.full_name || `${volunteer.firstName || ''} ${volunteer.lastName || ''}`.trim()}
                          </h3>
                          <p className="text-gray-600">{volunteer.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Desde: {new Date(volunteer.joinDate || volunteer.join_date || volunteer.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{volunteer.totalHours || volunteer.total_hours || 0} horas</span>
                            </div>
                            {volunteer.preferredParkId && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>Parque preferido</span>
                              </div>
                            )}
                          </div>
                          {volunteer.skills && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Habilidades:</strong> {volunteer.skills}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(volunteer.status || 'activo')}>
                            {volunteer.status || 'activo'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(volunteer)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de detalles */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Detalles del Voluntario: {selectedVolunteer?.firstName} {selectedVolunteer?.lastName}
              </DialogTitle>
              <DialogDescription>
                Información completa del voluntario seleccionado
              </DialogDescription>
            </DialogHeader>
            {selectedVolunteer && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{selectedVolunteer.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Teléfono:</p>
                    <p>{selectedVolunteer.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Estado:</p>
                    <Badge className={getStatusColor(selectedVolunteer.status)}>
                      {selectedVolunteer.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Fecha de ingreso:</p>
                    <p>{new Date(selectedVolunteer.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Horas totales de voluntariado:</p>
                  <p>{selectedVolunteer.totalHours || 0} horas</p>
                </div>
                {selectedVolunteer.skills && (
                  <div>
                    <p className="font-semibold">Habilidades:</p>
                    <p>{selectedVolunteer.skills}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}