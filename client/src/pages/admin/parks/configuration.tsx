import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Network, Building2, Save, Info, Users, Globe, Sparkles } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";

interface SystemConfiguration {
  id?: number;
  version: 'municipal' | 'network' | 'pro';
  maxParks: number;
  enabledModules: string[];
  parkTypeConfigurations: ParkTypeConfiguration[];
  publicPageTemplates: PublicPageTemplate[];
  municipalityInfo?: {
    name?: string;
    population?: string;
    contact?: string;
  };
}

interface ParkTypeConfiguration {
  id: string;
  name: string;
  description: string;
  maxSize?: number; // en hectáreas
  minSize?: number;
  publicPageTemplate: 'simple' | 'standard' | 'complex';
  enabledFeatures: string[];
  icon: string;
  color: string;
}

interface PublicPageTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  complexity: 'simple' | 'standard' | 'complex';
}

const defaultParkTypes: ParkTypeConfiguration[] = [
  {
    id: 'barrial',
    name: 'Parque Barrial',
    description: 'Parques pequeños para uso comunitario local',
    maxSize: 1,
    publicPageTemplate: 'simple',
    enabledFeatures: ['basic_info', 'contact', 'amenities_list'],
    icon: '🏘️',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'vecinal',
    name: 'Parque Vecinal', 
    description: 'Parques medianos para uso de barrios',
    minSize: 1,
    maxSize: 5,
    publicPageTemplate: 'standard',
    enabledFeatures: ['basic_info', 'contact', 'amenities_list', 'activities', 'gallery'],
    icon: '🌳',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'urbano',
    name: 'Parque Urbano',
    description: 'Parques grandes para uso metropolitano',
    minSize: 5,
    maxSize: 50,
    publicPageTemplate: 'complex',
    enabledFeatures: ['basic_info', 'contact', 'amenities_list', 'activities', 'gallery', 'events', 'concessions', 'evaluations'],
    icon: '🏙️',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'metropolitano',
    name: 'Parque Metropolitano',
    description: 'Parques muy grandes con servicios completos',
    minSize: 50,
    publicPageTemplate: 'complex',
    enabledFeatures: ['basic_info', 'contact', 'amenities_list', 'activities', 'gallery', 'events', 'concessions', 'evaluations', 'virtual_tours', 'reservations'],
    icon: '🌲',
    color: 'bg-emerald-100 text-emerald-800'
  }
];

const versionConfigs = {
  municipal: {
    name: 'ParkSys Municipal',
    description: 'Para sistemas municipales de 1 a +5,000 parques',
    maxParks: 5000,
    icon: <Building2 className="h-6 w-6" />,
    color: 'bg-blue-50 border-blue-200',
    features: ['Importación GIS', 'Páginas públicas automáticas', 'Todos los módulos base']
  },
  network: {
    name: 'ParkSys Network', 
    description: 'Para redes de grandes parques (1-50 parques)',
    maxParks: 50,
    icon: <Network className="h-6 w-6" />,
    color: 'bg-purple-50 border-purple-200',
    features: ['Gestión multi-parque', 'Páginas especializadas', 'Módulos Pro y Enterprise']
  },
  pro: {
    name: 'ParkSys Pro',
    description: 'Para un gran parque (más de 2 hectáreas)',
    maxParks: 1,
    icon: <Sparkles className="h-6 w-6" />,
    color: 'bg-amber-50 border-amber-200',
    features: ['Gestión especializada', 'Página ultra-completa', 'Todos los módulos premium']
  }
};

const publicPageTemplates: PublicPageTemplate[] = [
  {
    id: 'simple',
    name: 'Página Simple',
    description: 'Para parques barriales y pequeños',
    complexity: 'simple',
    sections: ['Información básica', 'Contacto', 'Amenidades básicas', 'Ubicación']
  },
  {
    id: 'standard',
    name: 'Página Estándar',
    description: 'Para parques vecinales y medianos',
    complexity: 'standard',
    sections: ['Información completa', 'Galería de imágenes', 'Actividades', 'Amenidades', 'Evaluaciones', 'Contacto']
  },
  {
    id: 'complex',
    name: 'Página Completa',
    description: 'Para parques urbanos y metropolitanos',
    complexity: 'complex',
    sections: ['Información detallada', 'Tours virtuales', 'Eventos', 'Concesiones', 'Reservas', 'Actividades', 'Evaluaciones', 'Historia', 'Multimedia completo']
  }
];

export default function ParksConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('version');
  const [config, setConfig] = useState<SystemConfiguration>({
    version: 'municipal',
    maxParks: 5000,
    enabledModules: [],
    parkTypeConfigurations: defaultParkTypes,
    publicPageTemplates: publicPageTemplates
  });

  // Fetch current configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['/api/system/configuration'],
    queryFn: () => apiRequest('/api/system/configuration'),
  });

  // Update local config when data is received
  useEffect(() => {
    if (currentConfig) {
      setConfig({ ...config, ...currentConfig });
    }
  }, [currentConfig]);

  // Save configuration mutation
  const saveConfiguration = useMutation({
    mutationFn: (configData: SystemConfiguration) => 
      apiRequest('/api/system/configuration', {
        method: 'PUT',
        data: configData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system/configuration'] });
      toast({
        title: "Configuración guardada",
        description: "La configuración del sistema se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la configuración.",
        variant: "destructive",
      });
    }
  });

  const handleVersionChange = (version: 'municipal' | 'network' | 'pro') => {
    const versionConfig = versionConfigs[version];
    setConfig(prev => ({
      ...prev,
      version,
      maxParks: versionConfig.maxParks
    }));
  };

  const handleParkTypeUpdate = (typeId: string, updates: Partial<ParkTypeConfiguration>) => {
    setConfig(prev => ({
      ...prev,
      parkTypeConfigurations: prev.parkTypeConfigurations.map(type =>
        type.id === typeId ? { ...type, ...updates } : type
      )
    }));
  };

  const handleSave = () => {
    saveConfiguration.mutate(config);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          </div>
          <p className="text-gray-600">
            Configura las versiones del sistema, tipos de parques y plantillas de páginas públicas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="version" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Versión del Sistema
            </TabsTrigger>
            <TabsTrigger value="park-types" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Tipos de Parques
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Plantillas Públicas
            </TabsTrigger>
          </TabsList>

          {/* Version Configuration */}
          <TabsContent value="version" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Versión del Sistema ParkSys</CardTitle>
                <CardDescription>
                  Selecciona la versión del sistema que mejor se adapte a tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(versionConfigs).map(([key, version]) => (
                    <Card 
                      key={key}
                      className={`cursor-pointer transition-all ${
                        config.version === key 
                          ? 'ring-2 ring-blue-500 ' + version.color
                          : 'hover:shadow-md ' + version.color
                      }`}
                      onClick={() => handleVersionChange(key as any)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {version.icon}
                          <h3 className="font-semibold">{version.name}</h3>
                          {config.version === key && (
                            <Badge variant="default" className="ml-auto">Activa</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                        <div className="text-sm">
                          <strong>Límite de parques:</strong> {version.maxParks === 5000 ? '+5,000' : version.maxParks}
                        </div>
                        <div className="mt-3 space-y-1">
                          {version.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {config.version === 'municipal' && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Información Municipal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="municipality-name">Nombre del Municipio</Label>
                          <Input
                            id="municipality-name"
                            value={config.municipalityInfo?.name || ''}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              municipalityInfo: {
                                ...prev.municipalityInfo,
                                name: e.target.value
                              }
                            }))}
                            placeholder="Ej: Guadalajara"
                          />
                        </div>
                        <div>
                          <Label htmlFor="population">Población</Label>
                          <Input
                            id="population"
                            value={config.municipalityInfo?.population || ''}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              municipalityInfo: {
                                ...prev.municipalityInfo,
                                population: e.target.value
                              }
                            }))}
                            placeholder="Ej: 1,500,000 habitantes"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Park Types Configuration */}
          <TabsContent value="park-types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Tipos de Parques</CardTitle>
                <CardDescription>
                  Define cómo se clasifican los parques y qué tipo de página pública generan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {config.parkTypeConfigurations.map((parkType) => (
                    <Card key={parkType.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{parkType.icon}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{parkType.name}</h3>
                            <p className="text-gray-600 text-sm">{parkType.description}</p>
                          </div>
                        </div>
                        <Badge className={parkType.color}>
                          {parkType.publicPageTemplate}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Tamaño mínimo (hectáreas)</Label>
                          <Input
                            type="number"
                            value={parkType.minSize || ''}
                            onChange={(e) => handleParkTypeUpdate(parkType.id, {
                              minSize: e.target.value ? Number(e.target.value) : undefined
                            })}
                            placeholder="Sin límite"
                          />
                        </div>
                        <div>
                          <Label>Tamaño máximo (hectáreas)</Label>
                          <Input
                            type="number"
                            value={parkType.maxSize || ''}
                            onChange={(e) => handleParkTypeUpdate(parkType.id, {
                              maxSize: e.target.value ? Number(e.target.value) : undefined
                            })}
                            placeholder="Sin límite"
                          />
                        </div>
                        <div>
                          <Label>Plantilla de página pública</Label>
                          <Select
                            value={parkType.publicPageTemplate}
                            onValueChange={(value) => handleParkTypeUpdate(parkType.id, {
                              publicPageTemplate: value as any
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="standard">Estándar</SelectItem>
                              <SelectItem value="complex">Completa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label className="text-sm font-medium">Características habilitadas:</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {parkType.enabledFeatures.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Configuration */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Páginas Públicas</CardTitle>
                <CardDescription>
                  Configura las plantillas que se usarán para generar las páginas públicas de los parques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {publicPageTemplates.map((template) => (
                    <Card key={template.id} className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge 
                            variant={template.complexity === 'simple' ? 'secondary' : 
                                   template.complexity === 'standard' ? 'default' : 'destructive'}
                          >
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Secciones incluidas:</Label>
                        <div className="mt-2 space-y-2">
                          {template.sections.map((section, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              {section}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave} 
            disabled={saveConfiguration.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveConfiguration.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}