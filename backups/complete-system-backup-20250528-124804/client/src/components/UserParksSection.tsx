import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart,
  HeartOff,
  MapPin,
  Calendar,
  Clock,
  Star,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Eye,
  CheckCircle,
  Circle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Park {
  id: number;
  name: string;
  description?: string;
  address?: string;
  parkType?: string;
  openingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  startDate: string;
  location?: string;
  parkId: number;
  parkName?: string;
}

interface UserParksProps {
  userId: number;
}

const UserParksSection: React.FC<UserParksProps> = ({ userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [showParkDetails, setShowParkDetails] = useState(false);

  // Obtener todos los parques disponibles
  const { data: allParks = [], isLoading: parksLoading } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Obtener parques favoritos del usuario
  const { data: favoriteParks = [], isLoading: favoritesLoading } = useQuery({
    queryKey: [`/api/users/${userId}/favorite-parks`],
    enabled: !!userId,
  });

  // Obtener parques pendientes por visitar
  const { data: pendingParks = [], isLoading: pendingLoading } = useQuery({
    queryKey: [`/api/users/${userId}/pending-parks`],
    enabled: !!userId,
  });

  // Obtener actividades próximas en parques favoritos
  const { data: upcomingActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/users/${userId}/favorite-parks-activities`],
    enabled: !!userId && favoriteParks.length > 0,
  });

  // Mutación para agregar parque a favoritos
  const addToFavoritesMutation = useMutation({
    mutationFn: async (parkId: number) => {
      return apiRequest(`/api/users/${userId}/favorite-parks`, {
        method: 'POST',
        data: { parkId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorite-parks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorite-parks-activities`] });
      toast({
        title: "Parque agregado a favoritos",
        description: "El parque se ha agregado a tu lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el parque a favoritos.",
        variant: "destructive",
      });
    }
  });

  // Mutación para remover parque de favoritos
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (parkId: number) => {
      return apiRequest(`/api/users/${userId}/favorite-parks/${parkId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorite-parks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorite-parks-activities`] });
      toast({
        title: "Parque removido de favoritos",
        description: "El parque se ha removido de tu lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo remover el parque de favoritos.",
        variant: "destructive",
      });
    }
  });

  // Mutación para marcar parque como visitado
  const markAsVisitedMutation = useMutation({
    mutationFn: async (parkId: number) => {
      return apiRequest(`/api/users/${userId}/visited-parks`, {
        method: 'POST',
        data: { parkId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/pending-parks`] });
      toast({
        title: "Parque marcado como visitado",
        description: "¡Felicidades por visitar este parque!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar el parque como visitado.",
        variant: "destructive",
      });
    }
  });

  // Función para verificar si un parque está en favoritos
  const isParkFavorite = (parkId: number) => {
    return favoriteParks.some((fp: any) => fp.parkId === parkId || fp.id === parkId);
  };

  // Función para verificar si un parque está pendiente por visitar
  const isParkPending = (parkId: number) => {
    return pendingParks.some((pp: any) => pp.parkId === parkId || pp.id === parkId);
  };

  // Obtener parques disponibles para agregar a favoritos (no están ya en favoritos)
  const availableParks = allParks.filter((park: Park) => !isParkFavorite(park.id));

  if (parksLoading || favoritesLoading || pendingLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>Cargando información de parques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de parques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Parques Favoritos</p>
                <p className="text-2xl font-bold">{favoriteParks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Pendientes por Visitar</p>
                <p className="text-2xl font-bold">{pendingParks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Próximas Actividades</p>
                <p className="text-2xl font-bold">{upcomingActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anuncios personalizados de actividades próximas */}
      {upcomingActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>Actividades Próximas en tus Parques Favoritos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingActivities.slice(0, 3).map((activity: Activity) => (
                <div key={activity.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">{activity.title}</h4>
                      <p className="text-sm text-blue-700 mb-2">{activity.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.parkName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(parseISO(activity.startDate), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(parseISO(activity.startDate), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Favorito
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingActivities.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{upcomingActivities.length - 3} actividades más en tus parques favoritos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parques Favoritos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span>Mis Parques Favoritos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteParks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tienes parques favoritos aún</p>
              <p className="text-sm">Agrega parques a tus favoritos para recibir notificaciones de actividades</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteParks.map((favPark: any) => {
                const park = allParks.find((p: Park) => p.id === favPark.parkId) || favPark;
                return (
                  <div key={park.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{park.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{park.description || 'Sin descripción'}</p>
                        {park.address && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {park.address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPark(park);
                            setShowParkDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromFavoritesMutation.mutate(park.id)}
                          disabled={removeFromFavoritesMutation.isPending}
                        >
                          <HeartOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parques Pendientes por Visitar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Circle className="h-5 w-5 text-orange-600" />
            <span>Parques Pendientes por Visitar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingParks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tienes parques pendientes por visitar</p>
              <p className="text-sm">Los parques se agregan automáticamente cuando planificas visitarlos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingParks.map((pendingPark: any) => {
                const park = allParks.find((p: Park) => p.id === pendingPark.parkId) || pendingPark;
                return (
                  <div key={park.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{park.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{park.description || 'Sin descripción'}</p>
                        {park.address && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {park.address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPark(park);
                            setShowParkDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markAsVisitedMutation.mutate(park.id)}
                          disabled={markAsVisitedMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explorar Más Parques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Explorar Más Parques</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableParks.slice(0, 6).map((park: Park) => (
              <div key={park.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{park.name}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {park.description || 'Sin descripción'}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {park.parkType || 'Parque'}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPark(park);
                        setShowParkDetails(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToFavoritesMutation.mutate(park.id)}
                      disabled={addToFavoritesMutation.isPending}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {availableParks.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                +{availableParks.length - 6} parques más disponibles
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles del parque */}
      <Dialog open={showParkDetails} onOpenChange={setShowParkDetails}>
        <DialogContent className="max-w-2xl">
          {selectedPark && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedPark.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedPark.description || 'Información del parque'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {selectedPark.address && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedPark.address}</span>
                      </div>
                    )}
                    {selectedPark.openingHours && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedPark.openingHours}</span>
                      </div>
                    )}
                    {selectedPark.contactPhone && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2">📞</span>
                        <span>{selectedPark.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Badge variant="outline">{selectedPark.parkType || 'Parque'}</Badge>
                    {selectedPark.contactEmail && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2">📧</span>
                        <span>{selectedPark.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowParkDetails(false)}>
                    Cerrar
                  </Button>
                  
                  {isParkFavorite(selectedPark.id) ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        removeFromFavoritesMutation.mutate(selectedPark.id);
                        setShowParkDetails(false);
                      }}
                      disabled={removeFromFavoritesMutation.isPending}
                    >
                      <HeartOff className="h-4 w-4 mr-2" />
                      Quitar de favoritos
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        addToFavoritesMutation.mutate(selectedPark.id);
                        setShowParkDetails(false);
                      }}
                      disabled={addToFavoritesMutation.isPending}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Agregar a favoritos
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserParksSection;