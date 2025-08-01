import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Clock, Users, DollarSign, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'wouter';

export default function PublicActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPark, setSelectedPark] = useState('all');
  const [, setLocation] = useLocation();

  // Fetch activities with registration enabled
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/activities', 'public'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch parks for filter
  const { data: parks } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Fetch activity categories
  const { data: categories } = useQuery({
    queryKey: ['/api/activity-categories'],
  });

  // Filter activities
  const filteredActivities = (activities || [])?.filter((activity: any) => {
    // Only show activities with registration enabled
    if (!activity.registrationEnabled) return false;
    
    // Search filter
    if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all' && activity.category !== selectedCategory) {
      return false;
    }
    
    // Park filter
    if (selectedPark !== 'all' && activity.parkId !== parseInt(selectedPark)) {
      return false;
    }
    
    return true;
  }) || [];

  const handleActivityClick = (activityId: number) => {
    setLocation(`/public/activities/${activityId}`);
  };

  const getAvailableSlots = (activity: any) => {
    const totalSlots = activity.maxRegistrations || activity.capacity || 0;
    const registeredCount = activity.registeredCount || 0;
    return Math.max(0, totalSlots - registeredCount);
  };

  const formatPrice = (price: string | number, isFree: boolean, isPriceRandom: boolean) => {
    if (isFree) return 'Gratuita';
    if (isPriceRandom) return `Desde $${parseFloat(price.toString()).toLocaleString('es-MX')} MXN (sugerido)`;
    return `$${parseFloat(price.toString()).toLocaleString('es-MX')} MXN`;
  };

  if (isLoadingActivities) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Actividades Públicas</h1>
              <p className="text-gray-600 mt-1">
                Descubre y participa en las actividades de nuestros parques
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              {filteredActivities.length} actividades disponibles
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {(categories || [])?.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Park filter */}
              <Select value={selectedPark} onValueChange={setSelectedPark}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los parques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los parques</SelectItem>
                  {(parks || [])?.map((park: any) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPark('all');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 pb-8">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay actividades disponibles
              </h3>
              <p className="text-gray-600">
                No se encontraron actividades que coincidan con tus filtros.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity: any) => {
              const availableSlots = getAvailableSlots(activity);
              const isFullyBooked = availableSlots === 0;
              
              return (
                <Card 
                  key={activity.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    isFullyBooked ? 'opacity-75' : ''
                  }`}
                  onClick={() => handleActivityClick(activity.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="mb-2">
                        {activity.category}
                      </Badge>
                      {isFullyBooked && (
                        <Badge variant="destructive">
                          Lleno
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      {activity.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {activity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Park and location */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {activity.parkName}
                        {activity.location && ` - ${activity.location}`}
                      </div>

                      {/* Date and time */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {format(new Date(activity.startDate), 'PPP', { locale: es })}
                        {activity.startTime && ` - ${activity.startTime}`}
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {availableSlots} espacios disponibles
                        {activity.maxRegistrations && ` de ${activity.maxRegistrations}`}
                      </div>

                      {/* Price */}
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className={activity.isFree ? 'text-green-600' : 'text-blue-600'}>
                          {formatPrice(activity.price, activity.isFree, activity.isPriceRandom)}
                        </span>
                      </div>

                      {/* Registration status */}
                      {activity.requiresApproval && (
                        <Badge variant="outline" className="text-xs">
                          Requiere aprobación
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      disabled={isFullyBooked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity.id);
                      }}
                    >
                      {isFullyBooked ? 'Sin espacios disponibles' : 'Ver detalles e inscribirse'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}