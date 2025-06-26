import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState } from "react";
import { Upload, Image } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

// Schema simplificado que coincide exactamente con la base de datos
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
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }).max(1000, {
    message: 'La descripción no debe exceder los 1000 caracteres.'
  }),
  isEndangered: z.boolean().default(false),
  // Campos opcionales que coinciden con el esquema de BD
  imageUrl: z.string().optional(),
  climateZone: z.string().optional(),
  heightMature: z.string().optional(),
  canopyDiameter: z.string().optional(),
  lifespan: z.string().optional(),
  maintenanceRequirements: z.string().optional(),
  waterRequirements: z.string().optional(),
  sunRequirements: z.string().optional(),
  soilRequirements: z.string().optional(),
  ecologicalBenefits: z.string().optional(),
  ornamentalValue: z.string().optional(),
  commonUses: z.string().optional(),
  // Campos para iconos personalizados
  iconType: z.string().optional(),
  customIconUrl: z.string().optional(),
});

type TreeSpeciesFormValues = z.infer<typeof treeSpeciesSchema>;

function SimpleNewTreeSpecies() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // Configuración del formulario
  const form = useForm<TreeSpeciesFormValues>({
    resolver: zodResolver(treeSpeciesSchema),
    defaultValues: {
      commonName: '',
      scientificName: '',
      family: '',
      origin: 'Nativo',
      growthRate: 'Medio',
      description: '',
      isEndangered: false,
      imageUrl: '',
      climateZone: '',
      heightMature: '',
      canopyDiameter: '',
      lifespan: '',
      maintenanceRequirements: '',
      waterRequirements: '',
      sunRequirements: '',
      soilRequirements: '',
      ecologicalBenefits: '',
      ornamentalValue: '',
      commonUses: '',
    },
  });

  // Mutation para crear una nueva especie arbórea
  const createTreeSpeciesMutation = useMutation({
    mutationFn: async (data: TreeSpeciesFormValues) => {
      console.log('Enviando datos:', data);
      
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
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la especie arbórea.",
        variant: "destructive",
      });
    },
  });

  // Manejar la subida de foto
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/tree-species/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedImageUrl(data.url);
        form.setValue('imageUrl', data.url);
        // También establecer como icono personalizado
        form.setValue('customIconUrl', data.url);
        form.setValue('iconType', 'custom');
        toast({
          title: "Foto subida",
          description: "La foto se ha subido correctamente.",
        });
      } else {
        throw new Error('Error al subir la foto');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Manejar el envío del formulario
  function onSubmit(data: TreeSpeciesFormValues) {
    console.log('Datos del formulario:', data);
    console.log('Errores del formulario:', form.formState.errors);
    createTreeSpeciesMutation.mutate(data);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-green-800">Nueva Especie Arbórea</h1>
            <p className="text-muted-foreground">
              Registra una nueva especie en el catálogo de árboles.
            </p>
          </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Campos obligatorios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Común *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Jacaranda" {...field} />
                    </FormControl>
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
                      <Input placeholder="Ej. Jacaranda mimosifolia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="family"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Familia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Bignoniaceae" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nativo">Nativo</SelectItem>
                        <SelectItem value="Introducido">Introducido</SelectItem>
                        <SelectItem value="Naturalizado">Naturalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="growthRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasa de Crecimiento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la tasa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lento">Lento</SelectItem>
                        <SelectItem value="Medio">Medio</SelectItem>
                        <SelectItem value="Rápido">Rápido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      Especie en peligro de extinción
                    </FormLabel>
                    <FormDescription>
                      Marca esta casilla si la especie está en peligro de extinción.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Sección de fotografía */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Image className="h-12 w-12" />
                  </div>
                  <div className="mt-4">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Subir fotografía de la especie
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, JPEG hasta 5MB
                      </span>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Seleccionar Foto
                    </Button>
                  </div>
                  
                  {uploadedImageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">✓ Foto subida correctamente</p>
                      <img 
                        src={uploadedImageUrl} 
                        alt="Vista previa" 
                        className="mx-auto h-24 w-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                
                {/* Separador */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500">o</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                {/* URL externa */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de imagen externa</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://ejemplo.com/imagen.jpg" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL de una imagen externa representativa de la especie.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="climateZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Climática (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. Tropical, Templada..." 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ornamentalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Ornamental (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. Alto, Medio, Bajo..." 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ecologicalBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficios Ecológicos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beneficios ecológicos que ofrece..."
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/admin/trees/catalog')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createTreeSpeciesMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createTreeSpeciesMutation.isPending ? 'Guardando...' : 'Guardar Especie'}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default SimpleNewTreeSpecies;