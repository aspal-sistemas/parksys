import React, { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, Globe, Clock, Info, Wrench, Trash2, Map } from "lucide-react";
import RoleBasedSidebar from "@/components/RoleBasedSidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapSelector } from "@/components/ui/map-selector";

// Función para mapear nombres de iconos a símbolos Unicode
const getIconSymbol = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'playground': '🛝',
    'toilet': '🚽',
    'sportsCourt': '🏀',
    'bicycle': '🚴',
    'pets': '🐕',
    'bench': '🪑',
    'fountain': '⛲',
    'parking': '🚗',
    'security': '🔒',
    'wifi': '📶',
    'restaurant': '🍽️',
    'cafe': '☕',
    'garden': '🌺',
    'lake': '🏞️',
    'trail': '🥾'
  };
  
  return iconMap[iconName] || '📍';
};

// Schema de validación para el formulario
const parkEditSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  municipalityName: z.string().min(1, "El municipio es requerido"),
  parkType: z.string().min(1, "Seleccione un tipo de parque"),
  address: z.string().min(1, "La dirección es requerida"),
  postalCode: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Email inválido").or(z.literal("")),
  description: z.string().optional(),
  schedule: z.object({
    monday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    tuesday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    wednesday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    thursday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    friday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    saturday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    sunday: z.object({
      enabled: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
  }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  area: z.string().optional(),
  greenArea: z.string().optional(),
  foundationYear: z.coerce.number().optional(),
  administrator: z.string().optional(),
  conservationStatus: z.string().optional(),
  regulationUrl: z.string().url("URL inválida").or(z.literal("")),
  videoUrl: z.string().url("URL inválida").or(z.literal("")),
});

type ParkEditFormValues = z.infer<typeof parkEditSchema>;

export default function ParkEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State for amenity management
  const [selectedAmenity, setSelectedAmenity] = React.useState<number | null>(null);
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = React.useState(false);
  const [isViewAmenityModalOpen, setIsViewAmenityModalOpen] = React.useState(false);
  const [isEditAmenityModalOpen, setIsEditAmenityModalOpen] = React.useState(false);
  const [isCreateNewAmenityModalOpen, setIsCreateNewAmenityModalOpen] = React.useState(false);
  const [viewingAmenity, setViewingAmenity] = React.useState<any>(null);
  const [editingAmenity, setEditingAmenity] = React.useState<any>(null);
  const [newAmenityData, setNewAmenityData] = React.useState({
    moduleName: '',
    surfaceArea: '',
    locationLatitude: '',
    locationLongitude: ''
  });
  const [editAmenityData, setEditAmenityData] = React.useState({
    moduleName: '',
    surfaceArea: '',
    locationLatitude: '',
    locationLongitude: '',
    status: 'Activa'
  });

  // Estado para crear nueva amenidad
  const [newAmenityFormData, setNewAmenityFormData] = React.useState({
    name: '',
    icon: 'park',
    category: 'servicios',
    iconType: 'system' as 'system' | 'custom',
    customIconUrl: null as string | null
  });
  const [isCreatingNewCategory, setIsCreatingNewCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  // Consultar datos del parque
  const { data: park, isLoading: isLoadingPark } = useQuery({
    queryKey: [`/api/parks/${id}`],
    enabled: !!id,
  });

  // Configurar formulario
  const form = useForm<ParkEditFormValues>({
    resolver: zodResolver(parkEditSchema),
    defaultValues: {
      name: "",
      municipalityName: "",
      parkType: "",
      address: "",
      postalCode: "",
      contactPhone: "",
      contactEmail: "",
      description: "",
      schedule: {
        monday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        tuesday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        wednesday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        thursday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        friday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        saturday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        sunday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
      },
      latitude: "",
      longitude: "",
      area: "",
      foundationYear: undefined,
      administrator: "",
      conservationStatus: "",
      regulationUrl: "",
      videoUrl: "",
    },
  });

  // Cargar datos del parque en el formulario
  React.useEffect(() => {
    if (park) {
      // Parsear horarios existentes o usar valores por defecto
      const parseSchedule = (openingHours: string | null) => {
        const defaultSchedule = {
          monday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          tuesday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          wednesday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          thursday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          friday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          saturday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
          sunday: { enabled: true, openTime: "06:00", closeTime: "22:00" },
        };

        if (!openingHours) return defaultSchedule;

        try {
          return JSON.parse(openingHours);
        } catch {
          return defaultSchedule;
        }
      };

      form.reset({
        name: park.name || "",
        municipalityName: park.municipality?.name || "",
        parkType: park.parkType || "",
        address: park.address || "",
        postalCode: park.postalCode || "",
        contactPhone: park.contactPhone || "",
        contactEmail: park.contactEmail || "",
        description: park.description || "",
        schedule: parseSchedule(park.openingHours),
        latitude: park.latitude?.toString() || "",
        longitude: park.longitude?.toString() || "",
        area: park.area?.toString() || "",
        greenArea: park.greenArea || "",
        foundationYear: park.foundationYear || undefined,
        administrator: park.administrator || "",
        conservationStatus: park.conservationStatus || "",
        regulationUrl: park.regulationUrl || "",
        videoUrl: park.videoUrl || "",
      });
    }
  }, [park, form]);

  // Consultar municipios para autocompletado
  const { data: municipalities } = useQuery({
    queryKey: ["/api/municipalities"],
  });

  // Consultar amenidades disponibles
  const { data: availableAmenities } = useQuery({
    queryKey: ["/api/amenities"],
  });

  // Consultar amenidades actuales del parque
  const { data: parkAmenities, refetch: refetchParkAmenities } = useQuery({
    queryKey: [`/api/parks/${id}/amenities`],
    enabled: !!id,
  });

  // Función para manejar el submit del formulario
  const onSubmit = (values: ParkEditFormValues) => {
    console.log('=== FORM SUBMIT EJECUTADO ===');
    console.log('Valores del formulario:', values);
    updateParkMutation.mutate(values);
  };

  // Mutación para actualizar el parque
  const updateParkMutation = useMutation({
    mutationFn: async (values: ParkEditFormValues) => {
      console.log('MUTATION EJECUTÁNDOSE - valores recibidos:', values);
      // Convertir el schedule a openingHours string y preparar datos
      const { schedule, municipalityName, ...parkData } = values;
      
      // Buscar el municipio por nombre o crear uno nuevo si no existe
      let municipalityId = park?.municipalityId || 1;
      
      if (municipalityName && municipalityName.trim() !== '') {
        // Buscar si existe por nombre exacto o por coincidencia parcial
        const searchName = municipalityName.toLowerCase().trim();
        const existingMunicipality = municipalities?.find((m: any) => {
          const municipalityFullName = `${m.name}, ${m.state}`.toLowerCase();
          const municipalityNameOnly = m.name.toLowerCase();
          
          return municipalityNameOnly === searchName || 
                 municipalityFullName === searchName ||
                 municipalityFullName.includes(searchName);
        });
        
        if (existingMunicipality) {
          municipalityId = existingMunicipality.id;
          console.log(`Municipio encontrado: ${existingMunicipality.name} (ID: ${existingMunicipality.id})`);
        } else {
          // Si no existe, crear uno nuevo
          try {
            const newMunicipality = await apiRequest('/api/municipalities', {
              method: 'POST',
              data: {
                name: municipalityName.trim(),
                state: 'México',
                active: true
              }
            });
            municipalityId = newMunicipality.id;
            
            // Invalidar la cache de municipios para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ["/api/municipalities"] });
          } catch (error) {
            console.error('Error al crear municipio:', error);
            toast({
              title: "Advertencia",
              description: "No se pudo crear el municipio nuevo. Se usará el existente.",
              variant: "destructive",
            });
          }
        }
      }
      
      const dataToSend = {
        ...parkData,
        openingHours: JSON.stringify(schedule),
        municipalityId: municipalityId,
      };
      
      console.log('Datos a enviar:', { 
        municipalityName, 
        municipalityId, 
        originalMunicipalityId: park?.municipalityId 
      });
      
      console.log('OBJETO COMPLETO dataToSend:', dataToSend);
      
      return await apiRequest(`/api/dev/parks/${id}`, {
        method: "PUT",
        data: dataToSend,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      toast({
        title: "Parque actualizado",
        description: "La información del parque ha sido actualizada correctamente.",
      });
      setLocation(`/admin/parks/${id}/view`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar el parque: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para agregar amenidad al parque
  const addAmenityMutation = useMutation({
    mutationFn: async ({ 
      amenityId, 
      moduleName = "", 
      locationLatitude = null, 
      locationLongitude = null, 
      surfaceArea = null,
      status = "Activa", 
      description = "" 
    }: { 
      amenityId: number; 
      moduleName?: string; 
      locationLatitude?: number | null;
      locationLongitude?: number | null;
      surfaceArea?: number | null;
      status?: string;
      description?: string; 
    }) => {
      // Usar el endpoint directo que bypasa el middleware
      const response = await fetch(`/api/parks/${id}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amenityId, 
          moduleName, 
          locationLatitude, 
          locationLongitude, 
          surfaceArea,
          status, 
          description 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar amenidad');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      refetchParkAmenities();
      toast({
        title: "Amenidad agregada",
        description: "La amenidad se agregó correctamente al parque.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al agregar amenidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para quitar amenidad del parque
  const removeAmenityMutation = useMutation({
    mutationFn: async (amenityId: number) => {
      const response = await fetch(`/api/parks/${id}/amenities/${amenityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar amenidad');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      refetchParkAmenities();
      toast({
        title: "Amenidad removida",
        description: "La amenidad se removió correctamente del parque.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al remover amenidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar amenidad del parque
  const updateAmenityMutation = useMutation({
    mutationFn: async ({ amenityId, data }: { amenityId: number; data: any }) => {
      const response = await fetch(`/api/parks/${id}/amenities/${amenityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar amenidad');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}/amenities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${id}`] });
      refetchParkAmenities();
      toast({
        title: "Amenidad actualizada",
        description: "La amenidad se actualizó correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar amenidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para crear nueva amenidad
  const createAmenityMutation = useMutation({
    mutationFn: async (amenityData: any) => {
      return await apiRequest('/api/amenities', {
        method: 'POST',
        data: amenityData
      });
    },
    onSuccess: (newAmenity) => {
      queryClient.invalidateQueries({ queryKey: ["/api/amenities"] });
      toast({
        title: "Amenidad creada",
        description: "La nueva amenidad se creó correctamente.",
      });
      // Seleccionar automáticamente la nueva amenidad en el selector
      setSelectedAmenity(newAmenity.id);
      setIsCreateNewAmenityModalOpen(false);
      // Resetear el formulario
      setNewAmenityFormData({
        name: '',
        icon: 'park',
        category: 'servicios',
        iconType: 'system',
        customIconUrl: null
      });
      setIsCreatingNewCategory(false);
      setNewCategoryName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear amenidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Función para ver detalles de amenidad
  const handleViewAmenity = (amenity: any) => {
    setViewingAmenity(amenity);
    setIsViewAmenityModalOpen(true);
  };

  // Función para editar amenidad
  const handleEditAmenity = (amenity: any) => {
    setEditingAmenity(amenity);
    setEditAmenityData({
      moduleName: amenity.moduleName || '',
      surfaceArea: amenity.surfaceArea?.toString() || '',
      locationLatitude: amenity.locationLatitude?.toString() || '',
      locationLongitude: amenity.locationLongitude?.toString() || '',
      status: amenity.status || 'Activa'
    });
    setIsEditAmenityModalOpen(true);
  };

  const onSubmit = (values: ParkEditFormValues) => {
    updateParkMutation.mutate(values);
  };

  // Funciones de utilidad para categorías
  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      recreacion: "Recreación",
      "recreación": "Recreación",
      deportes: "Deportes", 
      servicios: "Servicios",
      naturaleza: "Naturaleza",
      cultura: "Cultura",
      accesibilidad: "Accesibilidad",
      infraestructura: "Infraestructura"
    };
    
    // Si existe en el mapeo predefinido, usarlo
    if (labels[category]) {
      return labels[category];
    }
    
    // Si es una categoría personalizada, convertir a formato legible
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Iconos disponibles para amenidades
  const AVAILABLE_ICONS = [
    { name: "playground", label: "Parque Infantil" },
    { name: "toilet", label: "Baños" },
    { name: "sportsCourt", label: "Cancha Deportiva" },
    { name: "bicycle", label: "Ciclismo" },
    { name: "pets", label: "Mascotas Permitidas" },
    { name: "bench", label: "Bancas" },
    { name: "fountain", label: "Fuente" },
    { name: "parking", label: "Estacionamiento" },
    { name: "security", label: "Seguridad" },
    { name: "wifi", label: "Wi-Fi" },
    { name: "restaurant", label: "Restaurante" },
    { name: "cafe", label: "Café" },
    { name: "garden", label: "Jardín" },
    { name: "lake", label: "Lago" },
    { name: "trail", label: "Senderos" },
    { name: "park", label: "Parque" },
  ];

  // Función para manejar la creación de nueva amenidad
  const handleCreateNewAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amenityData = {
      name: newAmenityFormData.name,
      icon: newAmenityFormData.icon,
      category: newAmenityFormData.category,
      iconType: newAmenityFormData.iconType,
      customIconUrl: newAmenityFormData.customIconUrl,
    };
    
    createAmenityMutation.mutate(amenityData);
  };

  // Componente para cada fila editable de amenidad
  const AmenityTableRow = ({ 
    parkAmenity, 
    amenity, 
    onUpdate, 
    onDelete, 
    isUpdating, 
    isDeleting,
    parkCenter 
  }: {
    parkAmenity: any;
    amenity: any;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    isUpdating: boolean;
    isDeleting: boolean;
    parkCenter: { lat: number; lng: number };
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      moduleName: parkAmenity.moduleName || '',
      surfaceArea: parkAmenity.surfaceArea || '',
      status: parkAmenity.status || 'Activo',
      locationLatitude: parkAmenity.locationLatitude || '',
      locationLongitude: parkAmenity.locationLongitude || ''
    });

    const handleSave = () => {
      onUpdate({
        moduleName: editData.moduleName,
        surfaceArea: editData.surfaceArea ? parseFloat(editData.surfaceArea) : null,
        status: editData.status,
        locationLatitude: editData.locationLatitude ? parseFloat(editData.locationLatitude) : null,
        locationLongitude: editData.locationLongitude ? parseFloat(editData.locationLongitude) : null
      });
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        moduleName: parkAmenity.moduleName || '',
        surfaceArea: parkAmenity.surfaceArea || '',
        status: parkAmenity.status || 'Activo',
        locationLatitude: parkAmenity.locationLatitude || '',
        locationLongitude: parkAmenity.locationLongitude || ''
      });
      setIsEditing(false);
    };

    const getStatusBadge = (status: string) => {
      const normalizedStatus = status?.toLowerCase();
      
      switch (normalizedStatus) {
        case 'activa':
        case 'activo':
        case 'active':
          return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
        case 'inactiva':
        case 'inactivo':
        case 'inactive':
          return <Badge className="bg-red-100 text-red-800">Inactiva</Badge>;
        case 'mantenimiento':
        case 'maintenance':
          return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800">{status || 'Sin estado'}</Badge>;
      }
    };

    return (
      <TableRow>
        <TableCell>
          {isEditing ? (
            <Input
              value={editData.moduleName}
              onChange={(e) => setEditData(prev => ({ ...prev, moduleName: e.target.value }))}
              placeholder="Nombre del módulo"
            />
          ) : (
            parkAmenity.moduleName || '-'
          )}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            {amenity?.icon && <span>{getIconSymbol(amenity.icon)}</span>}
            {amenity?.name || 'Amenidad desconocida'}
          </div>
        </TableCell>
        
        <TableCell>
          {isEditing ? (
            <Input
              type="number"
              value={editData.surfaceArea}
              onChange={(e) => setEditData(prev => ({ ...prev, surfaceArea: e.target.value }))}
              placeholder="0.00"
            />
          ) : (
            parkAmenity.surfaceArea ? `${parseFloat(parkAmenity.surfaceArea).toLocaleString()} m²` : '-'
          )}
        </TableCell>
        
        <TableCell>
          {isEditing ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Map className="h-4 w-4 mr-1" />
                  {editData.locationLatitude && editData.locationLongitude ? 'Cambiar' : 'Establecer'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Seleccionar Ubicación</DialogTitle>
                </DialogHeader>
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <MapSelector
                    key={`dialog-map-${parkCenter.lat}-${parkCenter.lng}`}
                    defaultCenter={parkCenter}
                    onLocationSelect={(location) => {
                      setEditData(prev => ({
                        ...prev,
                        locationLatitude: location.lat.toString(),
                        locationLongitude: location.lng.toString()
                      }));
                    }}
                    selectedLocation={
                      editData.locationLatitude && editData.locationLongitude
                        ? (() => {
                            const lat = parseFloat(editData.locationLatitude);
                            const lng = parseFloat(editData.locationLongitude);
                            return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
                          })()
                        : null
                    }
                    className="w-full h-full"
                  />
                </div>
                {editData.locationLatitude && editData.locationLongitude && 
                 !isNaN(parseFloat(editData.locationLatitude)) && !isNaN(parseFloat(editData.locationLongitude)) && (
                  <div className="text-sm text-gray-500">
                    📍 {parseFloat(editData.locationLatitude).toFixed(6)}, {parseFloat(editData.locationLongitude).toFixed(6)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-1"
                      onClick={() => setEditData(prev => ({ ...prev, locationLatitude: '', locationLongitude: '' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ) : (
            parkAmenity.locationLatitude && parkAmenity.locationLongitude && 
            !isNaN(parseFloat(parkAmenity.locationLatitude)) && !isNaN(parseFloat(parkAmenity.locationLongitude)) ? (
              <span className="text-sm">📍 {parseFloat(parkAmenity.locationLatitude).toFixed(6)}, {parseFloat(parkAmenity.locationLongitude).toFixed(6)}</span>
            ) : (
              '-'
            )
          )}
        </TableCell>
        
        <TableCell>
          {isEditing ? (
            <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            getStatusBadge(parkAmenity.status || 'Activo')
          )}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewAmenity({ ...parkAmenity, amenityInfo: amenity })}
                  disabled={isUpdating || isDeleting}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  👁️
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditAmenity({ ...parkAmenity, amenityInfo: amenity })}
                  disabled={isUpdating || isDeleting}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  ✏️
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={isUpdating || isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  if (isLoadingPark) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleBasedSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando parque...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!park) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleBasedSidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Parque no encontrado</h1>
            <p className="text-muted-foreground mb-6">El parque que buscas no existe.</p>
            <Link href="/admin/parks">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Parques
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/admin/parks/${id}/view`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al parque
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Parque</h1>
            <p className="text-muted-foreground">
              Modifica la información del parque "{park.name}"
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Información Básica
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación y Contacto
                  </TabsTrigger>
                  <TabsTrigger value="characteristics" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Características
                  </TabsTrigger>
                </TabsList>

                {/* Información Básica */}
                <TabsContent value="basic">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Información General
                      </CardTitle>
                      <CardDescription>
                        Datos básicos del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Parque</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del parque" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="municipalityName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Municipio</FormLabel>
                              <div className="flex gap-2">
                                <FormControl className="flex-1">
                                  <Input 
                                    placeholder="Ingrese el nombre del municipio" 
                                    list="municipalities-list"
                                    {...field} 
                                  />
                                </FormControl>
                                <datalist id="municipalities-list">
                                  {municipalities?.map((municipality: any) => (
                                    <option key={municipality.id} value={municipality.name}>
                                      {municipality.name}, {municipality.state}
                                    </option>
                                  ))}
                                </datalist>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="parkType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Parque</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un tipo de parque" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Urbano">Parque Urbano</SelectItem>
                                <SelectItem value="Metropolitano">Parque Metropolitano</SelectItem>
                                <SelectItem value="Linear">Parque Linear</SelectItem>
                                <SelectItem value="Comunitario">Parque Comunitario</SelectItem>
                                <SelectItem value="Natural">Parque Natural</SelectItem>
                                <SelectItem value="Temático">Parque Temático</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descripción general del parque..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horarios de Apertura
                        </FormLabel>
                        <div className="space-y-4">
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                            const dayNames = {
                              monday: "Lunes",
                              tuesday: "Martes", 
                              wednesday: "Miércoles",
                              thursday: "Jueves",
                              friday: "Viernes",
                              saturday: "Sábado",
                              sunday: "Domingo"
                            };
                            
                            return (
                              <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                                <FormField
                                  control={form.control}
                                  name={`schedule.${day}.enabled`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal w-20">
                                        {dayNames[day as keyof typeof dayNames]}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="flex items-center gap-2 flex-1">
                                  <FormField
                                    control={form.control}
                                    name={`schedule.${day}.openTime`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="time"
                                            {...field}
                                            disabled={!form.watch(`schedule.${day}.enabled`)}
                                            className="w-32"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <span className="text-sm text-gray-500">a</span>
                                  <FormField
                                    control={form.control}
                                    name={`schedule.${day}.closeTime`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="time"
                                            {...field}
                                            disabled={!form.watch(`schedule.${day}.enabled`)}
                                            className="w-32"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Ubicación y Contacto */}
                <TabsContent value="location">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Ubicación y Contacto
                      </CardTitle>
                      <CardDescription>
                        Información de ubicación y datos de contacto
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl>
                                <Input placeholder="Dirección completa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl>
                                <Input placeholder="Código postal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Phone className="inline mr-2 h-4 w-4" />
                                Teléfono
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Número de teléfono" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Mail className="inline mr-2 h-4 w-4" />
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Selector de Coordenadas con Mapa Interactivo */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">Coordenadas del Parque</h3>
                        </div>
                        
                        <MapSelector
                          latitude={form.watch("latitude")}
                          longitude={form.watch("longitude")}
                          selectedLocation={
                            form.watch("latitude") && form.watch("longitude")
                              ? (() => {
                                  const lat = parseFloat(form.watch("latitude"));
                                  const lng = parseFloat(form.watch("longitude"));
                                  return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
                                })()
                              : null
                          }
                          onLocationSelect={(location) => {
                            form.setValue("latitude", location.lat.toString());
                            form.setValue("longitude", location.lng.toString());
                          }}
                          className="w-full"
                        />
                        
                        {/* Campos de texto para coordenadas (solo lectura/edición manual) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Latitud</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ej: 19.432608" 
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      // Si el usuario cambia manualmente, no actualizar el mapa automáticamente
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="longitude"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Longitud</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ej: -99.133209" 
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      // Si el usuario cambia manualmente, no actualizar el mapa automáticamente
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Características */}
                <TabsContent value="characteristics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Características
                      </CardTitle>
                      <CardDescription>
                        Detalles adicionales y características del parque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Superficie Total (m²)</FormLabel>
                              <FormControl>
                                <Input placeholder="Superficie total en metros cuadrados" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="greenArea"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Área Permeable (m²)</FormLabel>
                              <FormControl>
                                <Input placeholder="Área permeable en metros cuadrados" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="foundationYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año de Fundación</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Año de fundación"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="administrator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Administrador</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del administrador" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="conservationStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Conservación</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Excelente">Excelente</SelectItem>
                                  <SelectItem value="Bueno">Bueno</SelectItem>
                                  <SelectItem value="Regular">Regular</SelectItem>
                                  <SelectItem value="Malo">Malo</SelectItem>
                                  <SelectItem value="Crítico">Crítico</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="regulationUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Globe className="inline mr-2 h-4 w-4" />
                                URL de Reglamento
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://ejemplo.com/reglamento" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Globe className="inline mr-2 h-4 w-4" />
                                URL de Video
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/admin/parks/${id}/view`}>
                  <Button variant="outline">Cancelar</Button>
                </Link>
                

                
                <Button 
                  type="submit" 
                  disabled={updateParkMutation.isPending}
                  className="min-w-32"
                >
                  {updateParkMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>



      {/* Modal para ver detalles de amenidad */}
      <Dialog open={isViewAmenityModalOpen} onOpenChange={setIsViewAmenityModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Módulo de Amenidad</DialogTitle>
          </DialogHeader>
          {viewingAmenity && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Amenidad</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">
                    {viewingAmenity.amenityInfo?.name || 'No especificado'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Módulo</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{viewingAmenity.moduleName || 'Sin nombre'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Superficie (m²)</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{viewingAmenity.surfaceArea ? `${viewingAmenity.surfaceArea} m²` : 'No especificada'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingAmenity.status === 'Activa' ? 'bg-green-100 text-green-800' :
                    viewingAmenity.status === 'Inactiva' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingAmenity.status || 'Sin estado'}
                  </span>
                </div>
              </div>

              {(viewingAmenity.locationLatitude && viewingAmenity.locationLongitude) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación en el Parque</label>
                  <div className="border rounded-lg p-3 bg-white overflow-hidden">
                    <div className="w-full h-48 relative mb-2">
                      <MapSelector
                        key={`view-map-${viewingAmenity.id}`}
                        defaultCenter={{
                          lat: park?.latitude ? parseFloat(park.latitude) : 19.432608,
                          lng: park?.longitude ? parseFloat(park.longitude) : -99.133209
                        }}
                        onLocationSelect={() => {}} // Solo lectura en vista
                        selectedLocation={{
                          lat: parseFloat(viewingAmenity.locationLatitude),
                          lng: parseFloat(viewingAmenity.locationLongitude)
                        }}
                        className="w-full h-full"
                        readOnly={true}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      📍 {parseFloat(viewingAmenity.locationLatitude).toFixed(6)}, {parseFloat(viewingAmenity.locationLongitude).toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {viewingAmenity.description && (
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{viewingAmenity.description}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Creación</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    {viewingAmenity.createdAt ? new Date(viewingAmenity.createdAt).toLocaleDateString('es-MX') : 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewAmenityModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar amenidad */}
      <Dialog open={isEditAmenityModalOpen} onOpenChange={setIsEditAmenityModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Módulo de Amenidad</DialogTitle>
          </DialogHeader>
          {editingAmenity && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Amenidad</label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="font-semibold text-gray-700">
                    {editingAmenity.amenityInfo?.name || 'No especificado'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Módulo</label>
                <Input
                  value={editAmenityData.moduleName}
                  onChange={(e) => setEditAmenityData(prev => ({ ...prev, moduleName: e.target.value }))}
                  placeholder="Ej: Antonio Albarrán"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Superficie (m²)</label>
                <Input
                  type="number"
                  value={editAmenityData.surfaceArea}
                  onChange={(e) => setEditAmenityData(prev => ({ ...prev, surfaceArea: e.target.value }))}
                  placeholder="Superficie en metros cuadrados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <Select onValueChange={(value) => setEditAmenityData(prev => ({ ...prev, status: value }))} value={editAmenityData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ubicación en el Parque (opcional)</label>
                <div className="border rounded-lg p-3 bg-white overflow-hidden">
                  <div className="w-full h-48 relative">
                    <MapSelector
                      key={`edit-map-${editingAmenity.id}`}
                      defaultCenter={{
                        lat: park?.latitude ? parseFloat(park.latitude) : 19.432608,
                        lng: park?.longitude ? parseFloat(park.longitude) : -99.133209
                      }}
                      onLocationSelect={(location) => {
                        setEditAmenityData(prev => ({
                          ...prev,
                          locationLatitude: location.lat.toString(),
                          locationLongitude: location.lng.toString()
                        }));
                      }}
                      selectedLocation={
                        editAmenityData.locationLatitude && editAmenityData.locationLongitude
                          ? {
                              lat: parseFloat(editAmenityData.locationLatitude),
                              lng: parseFloat(editAmenityData.locationLongitude)
                            }
                          : null
                      }
                      className="w-full h-full"
                    />
                  </div>
                  {editAmenityData.locationLatitude && editAmenityData.locationLongitude && (
                    <div className="text-xs text-gray-500 mt-2">
                      📍 {parseFloat(editAmenityData.locationLatitude).toFixed(6)}, {parseFloat(editAmenityData.locationLongitude).toFixed(6)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-1"
                        onClick={() => setEditAmenityData(prev => ({ ...prev, locationLatitude: '', locationLongitude: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditAmenityModalOpen(false);
                    setEditingAmenity(null);
                    setEditAmenityData({
                      moduleName: '',
                      surfaceArea: '',
                      locationLatitude: '',
                      locationLongitude: '',
                      status: 'Activa'
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    updateAmenityMutation.mutate({
                      amenityId: editingAmenity.id,
                      data: {
                        moduleName: editAmenityData.moduleName,
                        surfaceArea: editAmenityData.surfaceArea ? parseFloat(editAmenityData.surfaceArea) : undefined,
                        locationLatitude: editAmenityData.locationLatitude ? parseFloat(editAmenityData.locationLatitude) : undefined,
                        locationLongitude: editAmenityData.locationLongitude ? parseFloat(editAmenityData.locationLongitude) : undefined,
                        status: editAmenityData.status
                      }
                    });
                    setIsEditAmenityModalOpen(false);
                    setEditingAmenity(null);
                    setEditAmenityData({
                      moduleName: '',
                      surfaceArea: '',
                      locationLatitude: '',
                      locationLongitude: '',
                      status: 'Activa'
                    });
                  }}
                  disabled={updateAmenityMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {updateAmenityMutation.isPending ? 'Actualizando...' : 'Actualizar Amenidad'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para crear nueva amenidad */}
      <Dialog open={isCreateNewAmenityModalOpen} onOpenChange={setIsCreateNewAmenityModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Amenidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewAmenity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la Amenidad</label>
              <Input
                value={newAmenityFormData.name}
                onChange={(e) => setNewAmenityFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Área de Juegos Infantiles"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              {isCreatingNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre de la nueva categoría"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        const formattedCategory = newCategoryName.toLowerCase().replace(/\s+/g, '_');
                        setNewAmenityFormData(prev => ({ ...prev, category: formattedCategory }));
                        setIsCreatingNewCategory(false);
                        setNewCategoryName("");
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNewCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select 
                    value={newAmenityFormData.category} 
                    onValueChange={(value) => setNewAmenityFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recreacion">Recreación</SelectItem>
                      <SelectItem value="deportes">Deportes</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="naturaleza">Naturaleza</SelectItem>
                      <SelectItem value="cultura">Cultura</SelectItem>
                      <SelectItem value="accesibilidad">Accesibilidad</SelectItem>
                      <SelectItem value="infraestructura">Infraestructura</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNewCategory(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icono</label>
              <Select 
                value={newAmenityFormData.icon} 
                onValueChange={(value) => setNewAmenityFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un icono" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon.name} value={icon.name}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateNewAmenityModalOpen(false);
                  setNewAmenityFormData({
                    name: '',
                    icon: 'park',
                    category: 'servicios',
                    iconType: 'system',
                    customIconUrl: null
                  });
                  setIsCreatingNewCategory(false);
                  setNewCategoryName("");
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createAmenityMutation.isPending || !newAmenityFormData.name.trim()}
              >
                {createAmenityMutation.isPending ? 'Creando...' : 'Crear Amenidad'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}