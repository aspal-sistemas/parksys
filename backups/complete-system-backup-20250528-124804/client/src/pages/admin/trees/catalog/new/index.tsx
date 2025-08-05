import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreePine, ArrowLeft, Save, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definir el esquema de validación para el formulario
const treeSpeciesSchema = z.object({
  commonName: z.string().min(2, {
    message: 'El nombre común debe tener al menos 2 caracteres.',
  }),
  scientificName: z.string().min(2, {
    message: 'El nombre científico debe tener al menos 2 caracteres.',
  }),
  family: z.string().min(2, {
    message: 'La familia debe tener al menos 2 caracteres.',
  }),
  origin: z.string({
    required_error: 'Selecciona el origen de la especie.',
  }),
  growthRate: z.string({
    required_error: 'Selecciona la tasa de crecimiento.',
  }),
  imageUrl: z.string().url({
    message: 'Ingresa una URL válida para la imagen.',
  }).optional().or(z.literal('')),
  isEndangered: z.boolean().default(false),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }).max(1000, {
    message: 'La descripción no debe exceder los 1000 caracteres.'
  }),
  benefits: z.string().min(10, {
    message: 'Los beneficios deben tener al menos 10 caracteres.',
  }).optional().or(z.literal('')),
  careRequirements: z.string().min(10, {
    message: 'Los requisitos de cuidado deben tener al menos 10 caracteres.',
  }).optional().or(z.literal('')),
  lifespan: z.string().optional().or(z.literal('')),
  canopyType: z.string().optional().or(z.literal('')),
  soilPreference: z.string().optional().or(z.literal('')),
  waterRequirements: z.string().optional().or(z.literal('')),
  sunExposure: z.string().optional().or(z.literal('')),
  pestDiseaseResistance: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type TreeSpeciesFormValues = z.infer<typeof treeSpeciesSchema>;

function NewTreeSpecies() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Configuración del formulario con valores por defecto
  const form = useForm<TreeSpeciesFormValues>({
    resolver: zodResolver(treeSpeciesSchema),
    defaultValues: {
      commonName: '',
      scientificName: '',
      family: '',
      origin: 'Nativo',
      growthRate: 'Medio',
      imageUrl: '',
      isEndangered: false,
      description: '',
      benefits: '',
      careRequirements: '',
      lifespan: '',
      canopyType: '',
      soilPreference: '',
      waterRequirements: '',
      sunExposure: '',
      pestDiseaseResistance: '',
      notes: '',
    },
  });

  // Mutation para crear una nueva especie arbórea
  const createTreeSpeciesMutation = useMutation({
    mutationFn: async (data: TreeSpeciesFormValues) => {
      const response = await fetch('/api/tree-species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la especie arbórea');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
      toast({
        title: "Especie arbórea creada",
        description: "La especie ha sido registrada exitosamente en el catálogo.",
      });
      setLocation('/admin/trees/catalog');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la especie arbórea.",
        variant: "destructive",
      });
    },
  });

  // Manejar el envío del formulario
  function onSubmit(data: TreeSpeciesFormValues) {
    createTreeSpeciesMutation.mutate(data);
  }

  // Manejar el regreso al catálogo
  const handleBack = () => {
    setLocation('/admin/trees/catalog');
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Nueva Especie Arbórea | ParquesMX</title>
        <meta name="description" content="Formulario para agregar una nueva especie arbórea al catálogo" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <TreePine className="mr-2 h-8 w-8" />
              Nueva Especie Arbórea
            </h1>
            <p className="text-gray-600 mt-1">
              Añade una nueva especie al catálogo de árboles
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Catálogo
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="informacion-basica" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="informacion-basica">Información Básica</TabsTrigger>
                <TabsTrigger value="descripcion-detalles">Descripción y Detalles</TabsTrigger>
                <TabsTrigger value="requisitos-cultivo">Requisitos de Cultivo</TabsTrigger>
              </TabsList>
              
              {/* Pestaña de Información Básica */}
              <TabsContent value="informacion-basica">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                    <CardDescription>
                      Información principal de la especie arbórea
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="commonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Común *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Ahuehuete" {...field} />
                            </FormControl>
                            <FormDescription>
                              Nombre por el que se conoce comúnmente a la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="scientificName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Científico *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Taxodium mucronatum" className="italic" {...field} />
                            </FormControl>
                            <FormDescription>
                              Nombre científico de la especie en formato latinizado.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="family"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Familia *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Cupressaceae" {...field} />
                            </FormControl>
                            <FormDescription>
                              Familia taxonómica a la que pertenece la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origen *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el origen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Nativo">Nativo</SelectItem>
                                <SelectItem value="Introducido">Introducido</SelectItem>
                                <SelectItem value="Híbrido">Híbrido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Indica si es una especie nativa o introducida.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="growthRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tasa de Crecimiento *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tasa de crecimiento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Lento">Lento</SelectItem>
                                <SelectItem value="Medio">Medio</SelectItem>
                                <SelectItem value="Rápido">Rápido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Velocidad promedio de crecimiento de la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lifespan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esperanza de Vida</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. 500-1500 años" {...field} />
                            </FormControl>
                            <FormDescription>
                              Tiempo de vida promedio de la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de Imagen</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://ejemplo.com/imagen.jpg" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              URL de una imagen representativa de la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isEndangered"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Especie en Peligro de Extinción
                            </FormLabel>
                            <FormDescription>
                              Marca esta opción si la especie está amenazada o en peligro de extinción.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de Descripción y Detalles */}
              <TabsContent value="descripcion-detalles">
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción y Detalles</CardTitle>
                    <CardDescription>
                      Información descriptiva y beneficios de la especie
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descripción general de la especie..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Descripción general de la especie, incluyendo características distintivas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beneficios</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beneficios ecológicos, culturales o para la salud..."
                              className="min-h-[120px]"
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Beneficios ecológicos, culturales o para la salud que ofrece esta especie.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="canopyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Dosel</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Extendido, columnar, cónico..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Forma y características del dosel o copa.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas Adicionales</FormLabel>
                            <FormControl>
                              <Input placeholder="Información adicional relevante..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Cualquier otra información relevante sobre la especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de Requisitos de Cultivo */}
              <TabsContent value="requisitos-cultivo">
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos de Cultivo</CardTitle>
                    <CardDescription>
                      Condiciones óptimas para el crecimiento y mantenimiento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="careRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos de Cuidado</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Requisitos generales de cuidado y mantenimiento..."
                              className="min-h-[120px]"
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Requisitos generales de cuidado y mantenimiento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="soilPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferencia de Suelo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Arcilloso, arenoso, bien drenado..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Tipo de suelo preferido por esta especie.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="waterRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requerimientos de Agua</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Bajo, moderado, alto..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Necesidades de riego o humedad.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sunExposure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exposición al Sol</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Sol pleno, sombra parcial..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Preferencia de exposición a la luz solar.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pestDiseaseResistance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resistencia a Plagas/Enfermedades</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Alta, media, baja..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Nivel de resistencia a plagas y enfermedades comunes.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={createTreeSpeciesMutation.isPending}
              >
                {createTreeSpeciesMutation.isPending ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Guardar Especie
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}

export default NewTreeSpecies;